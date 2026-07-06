const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_NUMBER = process.env.WHATSAPP_PHONE;
const GROUP_NAME = process.env.WHATSAPP_GROUP || 'Gsp l orangeraie';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let clientReady = false;
let currentQR = null;
let groupChatId = null;

async function findGroup() {
  const inviteCode = process.env.GROUP_INVITE;
  if (inviteCode) {
    try {
      const inviteInfo = await client.getInviteInfo(inviteCode);
      groupChatId = inviteInfo.gid._serialized;
      console.log(`✓ Group found via invite: "${inviteInfo.title}" (${groupChatId})`);
      return;
    } catch (err) {
      console.log('Invite link failed, trying name search:', err.message);
    }
  }

  const chats = await client.getChats();
  const group = chats.find(c => c.isGroup && c.name.toLowerCase() === GROUP_NAME.toLowerCase());
  if (group) {
    groupChatId = group.id._serialized;
    console.log(`✓ Group found by name: "${group.name}" (${groupChatId})`);
  } else {
    console.log(`✗ Group "${GROUP_NAME}" not found. Fallback: personal chat.`);
    chats.filter(c => c.isGroup).forEach(g => console.log(`  - ${g.name}`));
  }
}

async function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'gsp-lorangeraie' }),
    puppeteer: {
      headless: true,
      executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    try {
      currentQR = await qrcode.toDataURL(qr);
      await qrcode.toFile(path.join(__dirname, 'whatsapp-qr.png'), qr);
      console.log('=== SCAN THE QR CODE ===');
      console.log(`Open http://localhost:${PORT}/qr in your browser to scan.`);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  });

  client.on('ready', async () => {
    clientReady = true;
    currentQR = null;
    console.log('WhatsApp connected! Looking for group...');
    await findGroup();
    const qrPath = path.join(__dirname, 'whatsapp-qr.png');
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
  });

  client.on('disconnected', async (reason) => {
    clientReady = false;
    console.log('WhatsApp disconnected:', reason);
    if (reason === 'LOGOUT' || reason === 'REMOVED') {
      const authPath = path.join(__dirname, '.wwebjs_auth');
      if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
      console.log('Session cleared. Restart the server to re-link WhatsApp.');
    }
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp auth failure:', msg);
  });

  await client.initialize();
}

async function sendWhatsApp({ name, phone, email, level, message }) {
  if (!clientReady) throw new Error('WhatsApp client not ready.');

  const text =
    '🆕 *Nouvelle inscription GSP L\'Orangeraie*\n\n' +
    `👤 Élève : ${name}\n` +
    `📞 Téléphone : ${phone}\n` +
    `📧 Email : ${email}\n` +
    `📚 Niveau : ${level}\n` +
    (message ? `💬 Message : ${message}` : '');

  const chatId = groupChatId ||
    (TARGET_NUMBER.includes('@c.us') ? TARGET_NUMBER : `${TARGET_NUMBER}@c.us`);

  await client.sendMessage(chatId, text);
}

app.get('/qr', (_req, res) => {
  if (clientReady) {
    return res.send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>WhatsApp Connecté</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0F2B1A;color:#fff;text-align:center}div{padding:20px}.check{font-size:64px;margin-bottom:16px}.status{color:#22c55e;font-size:24px;font-weight:600}.sub{color:rgba(255,255,255,.5);margin-top:8px}</style></head>
      <body><div><div class="check">✅</div><div class="status">WhatsApp connecté !</div><div class="sub">Les notifications arrivent sur votre téléphone.</div></div></body></html>
    `);
  }
  if (!currentQR) {
    return res.send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Génération du QR...</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta http-equiv="refresh" content="3">
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0F2B1A;color:#fff;text-align:center}div{padding:20px}.spinner{font-size:48px;margin-bottom:16px}</style></head>
      <body><div><div class="spinner">⏳</div><div style="font-size:20px;">Génération du QR code...</div><div style="color:rgba(255,255,255,.4);margin-top:8px;">Patientez quelques secondes</div></div></body></html>
    `);
  }
  res.send(`
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Scanner le QR Code</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta http-equiv="refresh" content="15">
    <style>
      body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0F2B1A;color:#fff;text-align:center}
      div{padding:20px;max-width:400px}
      h2{font-size:22px;margin-bottom:8px}
      .step{color:rgba(255,255,255,.5);font-size:14px;line-height:1.6}
      img{width:280px;height:280px;border-radius:16px;margin:16px 0;background:#fff;padding:16px}
      .refresh{color:rgba(255,255,255,.3);font-size:12px;margin-top:12px}
    </style></head>
    <body><div>
      <h2>📱 Scanner le QR Code</h2>
      <p class="step">1. Ouvrez WhatsApp sur votre téléphone<br>2. Menu → Appareils liés → Lier un appareil<br>3. Scannez ce code :</p>
      <img src="${currentQR}" alt="QR Code">
      <div class="refresh">Ce code expire — actualisation automatique</div>
    </div></body></html>
  `);
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, level, message } = req.body;
    if (!name || !phone || !email || !level) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (!clientReady) {
      return res.status(503).json({ error: 'WhatsApp non connecté' });
    }
    await sendWhatsApp({ name, phone, email, level, message });
    console.log('WhatsApp notification sent for:', name);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to send WhatsApp:', err);
    res.status(500).json({ error: "Erreur d'envoi" });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    whatsapp: clientReady ? 'connected' : 'waiting_qr',
    group: groupChatId ? GROUP_NAME : (clientReady ? 'not found — using personal' : null)
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GSP L'Orangeraie server: http://localhost:${PORT}`);
  console.log(`QR code page: http://localhost:${PORT}/qr`);
  initWhatsApp().catch(err => console.error('WhatsApp init error:', err));
});
