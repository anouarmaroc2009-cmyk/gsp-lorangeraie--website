export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, level, message } = req.body;

  if (!name || !phone || !email || !level) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram non configuré' });
  }

  const text =
    `🆕 *Nouvelle inscription GSP L'Orangeraie*\n\n` +
    `👤 *Élève :* ${name}\n` +
    `📞 *Téléphone :* ${phone}\n` +
    `📧 *Email :* ${email}\n` +
    `📚 *Niveau :* ${level}` +
    (message ? `\n💬 *Message :* ${message}` : '');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: parseInt(chatId),
          text,
          parse_mode: 'Markdown'
        })
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      throw new Error(tgData.description || 'Telegram error');
    }

    console.log('Telegram notification sent for:', name);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to send Telegram:', err);
    return res.status(500).json({ error: "Erreur d'envoi" });
  }
}
