(function () {
  'use strict';

  /* ─── PRELOADER ─── */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.classList.add('hidden');
      setTimeout(() => { preloader.style.display = 'none'; }, 800);
    });
  }

  /* ─── PARTICLE CANVAS ─── */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() > 0.5 ? 28 : 35; // orange/gold hues
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.5;
          this.x -= dx / dist * force;
          this.y -= dy / dist * force;
        }
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 55%, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(212, 116, 43, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      connectParticles();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ─── CUSTOM CURSOR ─── */
  const cursorDot = document.querySelector('[data-cursor-dot]');
  const cursorRing = document.querySelector('[data-cursor-ring]');
  if (cursorDot && cursorRing) {
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      dotX = e.clientX;
      dotY = e.clientY;
    });

    function animateCursor() {
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .btn, input, textarea, .hamburger').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('active');
        cursorRing.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('active');
        cursorRing.classList.remove('active');
      });
    });
  }

  /* ─── SCROLL PROGRESS ─── */
  const scrollBar = document.querySelector('.scroll-indicator-bar');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      scrollBar.style.width = pct + '%';
    });
  }

  /* ─── NAVBAR ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.pageYOffset > 80);
    });
  }

  /* ─── HAMBURGER ─── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── REVEAL ON SCROLL ─── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));

  /* ─── TYPEWRITER ─── */
  const typewriterEl = document.getElementById('heroDesc');
  if (typewriterEl) {
    const text = "Du Collège au Lycée — nous cultivons l'excellence académique et le développement personnel de chaque élève.";
    let idx = 0;
    typewriterEl.classList.add('typewriter-cursor');
    function typeChar() {
      if (idx < text.length) {
        typewriterEl.textContent = text.substring(0, idx + 1);
        idx++;
        const delay = text[idx - 1] === '.' || text[idx - 1] === ',' ? 60 : 25 + Math.random() * 25;
        setTimeout(typeChar, delay);
      } else {
        typewriterEl.classList.remove('typewriter-cursor');
      }
    }
    setTimeout(typeChar, 1800);
  }

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (!target || isNaN(target)) return;
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (!el.dataset.counted) {
            el.dataset.counted = 'true';
            animateCounter(el);
          }
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  /* ─── ACTIVE NAV LINK ─── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  if (sections.length && navAnchors.length) {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset + 150;
      let current = '';
      sections.forEach(s => {
        const top = s.offsetTop;
        const h = s.offsetHeight;
        if (scrollY >= top && scrollY < top + h) current = s.id;
      });
      navAnchors.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + current;
        a.style.color = isActive ? '#fff' : '';
        if (isActive) {
          const after = a.querySelector('::after') || a.style;
          a.style.setProperty('--after-width', '100%');
        } else {
          a.style.setProperty('--after-width', '0%');
        }
      });
    });
  }

  /* ─── CONTACT FORM ─── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('.form-submit');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Message envoyé !</span> <i class="fas fa-check"></i>';
      btn.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
      this.reset();
    });
  }

  /* ─── HERO PARALLAX FLOATING ─── */
  const floats = document.querySelectorAll('.float-shape');
  if (floats.length) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      floats.forEach((el, i) => {
        const speed = 8 + i * 4;
        el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }

  /* ─── NAVBAR HIDE ON SCROLL DOWN ─── */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (navbar) {
      if (currentScroll > 120 && currentScroll > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
    }
    lastScroll = currentScroll;
  });

  /* ─── LEVEL CARD TILT ON MOUSE MOVE ─── */
  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    });
  });

  /* ─── PORTRAIT PARALLAX ON MOUSE ─── */
  const portraitImg = document.querySelector('.portrait-image img');
  if (portraitImg) {
    const container = portraitImg.closest('.portrait-container');
    if (container) {
      container.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        portraitImg.style.transform = `scale(1.08) translate(${x * 10}px, ${y * 10}px)`;
      });
      container.addEventListener('mouseleave', () => {
        portraitImg.style.transform = 'scale(1) translate(0, 0)';
      });
    }
  }

  /* ─── RIPPLE EFFECT ON BUTTONS ─── */
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute; border-radius: 50%;
        width: ${size}px; height: ${size}px;
        background: rgba(255,255,255,0.3);
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        transform: scale(0); animation: rippleAnim 0.6s ease-out forwards;
        pointer-events: none;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `@keyframes rippleAnim { to { transform: scale(2.5); opacity: 0; } }`;
  document.head.appendChild(rippleStyle);

})();
