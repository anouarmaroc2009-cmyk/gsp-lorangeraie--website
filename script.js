(function () {
  'use strict';

  var preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      preloader.classList.add('shrinking');
      setTimeout(function () {
        preloader.classList.add('hidden');
        setTimeout(function () { preloader.style.display = 'none'; }, 600);
      }, 1000);
    });
  }

  (function() {
    var slides = document.querySelectorAll('.slide');
    var label = document.getElementById('slideLabel');
    var progressBar = document.getElementById('slideProgressBar');
    if (!slides.length || !label) return;
    var idx = 0;
    var total = slides.length;
    var slideDuration = 2500;
    var interval, progressInterval;

    function showSlide(i) {
      slides.forEach(function(s) { s.classList.remove('active', 'ken-burns'); });
      slides[i].classList.add('active', 'ken-burns');
      label.textContent = slides[i].dataset.title || '';
      label.style.opacity = '0';
      setTimeout(function() { label.style.opacity = '1'; }, 100);
    }

    function startProgress() {
      var startTime = Date.now();
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(function() {
        var elapsed = Date.now() - startTime;
        var pct = Math.min((elapsed / slideDuration) * 100, 100);
        if (progressBar) progressBar.style.width = pct + '%';
        if (elapsed >= slideDuration) {
          clearInterval(progressInterval);
          progressBar.style.width = '0%';
        }
      }, 30);
    }

    function nextSlide() {
      idx = (idx + 1) % total;
      showSlide(idx);
      startProgress();
    }

    showSlide(0);
    startProgress();
    interval = setInterval(nextSlide, slideDuration);

    var slideshowEl = document.querySelector('.hero-slideshow');
    if (slideshowEl) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) {
            clearInterval(interval);
            clearInterval(progressInterval);
          } else {
            interval = setInterval(nextSlide, slideDuration);
            startProgress();
          }
        });
      }, { threshold: 0 });
      observer.observe(slideshowEl);
    }
  })();

  var bgOranges = document.getElementById('bgOranges');
  if (bgOranges) {
    function placeOranges() {
      var height = document.documentElement.scrollHeight;
      var count = Math.max(14, Math.floor(height / 200));
      bgOranges.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var o = document.createElement('div');
        o.className = 'bg-orange';
        var x = 5 + Math.random() * 90;
        var y = (i / count) * 100 + (Math.random() * (100 / count));
        var s = 0.4 + Math.random() * 0.8;
        var d = -(Math.random() * 18);
        o.style.cssText = '--x:' + x + '%;--y:' + y + '%;--s:' + s + ';--d:' + d + 's';
        bgOranges.appendChild(o);
      }
    }
    var roTimer;
    var ro = new ResizeObserver(function () {
      clearTimeout(roTimer);
      roTimer = setTimeout(placeOranges, 300);
    });
    ro.observe(document.documentElement);
    placeOranges();
  }

  var canvas = document.getElementById('particleCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouseX = 0, mouseY = 0;
    var resizeTimer;

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 100);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 28 : 35;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      var dx = mouseX - this.x;
      var dy = mouseY - this.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        var force = (150 - dist) / 150 * 0.5;
        this.x -= dx / dist * force;
        this.y -= dy / dist * force;
      }
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + this.hue + ', 80%, 55%, ' + this.opacity + ')';
      ctx.fill();
    };

    for (var i = 0; i < 80; i++) particles.push(new Particle());

    function connectParticles() {
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(212, 116, 43, ' + (0.06 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    var particlesAnimId;
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) { p.update(); p.draw(); });
      connectParticles();
      particlesAnimId = requestAnimationFrame(animateParticles);
    }
    animateParticles();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(particlesAnimId);
      } else {
        animateParticles();
      }
    });
  }

  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var cursorDot = document.querySelector('[data-cursor-dot]');
  var cursorRing = document.querySelector('[data-cursor-ring]');
  if (cursorDot && cursorRing && !isTouchDevice) {
    var dotX = 0, dotY = 0;
    var ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
      dotX = e.clientX;
      dotY = e.clientY;
    }, { passive: true });

    function animateCursor() {
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      cursorDot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px)';
      cursorRing.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .btn, input, textarea, .hamburger').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorDot.classList.add('active');
        cursorRing.classList.add('active');
      });
      el.addEventListener('mouseleave', function () {
        cursorDot.classList.remove('active');
        cursorRing.classList.remove('active');
      });
    });
  }

  var lastScroll = 0;
  var scrollBar = document.querySelector('.scroll-indicator-bar');
  var navbar = document.getElementById('navbar');
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var st = h.scrollTop || document.body.scrollTop;
    if (scrollBar) {
      var pct = st / (h.scrollHeight - h.clientHeight) * 100;
      scrollBar.style.width = pct + '%';
    }
    if (navbar) {
      navbar.classList.toggle('scrolled', st > 80);
      if (st > 120 && st > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
    }
    if (sections.length && navAnchors.length) {
      var scrollY = st + 150;
      var current = '';
      sections.forEach(function (s) {
        var top = s.offsetTop;
        var hh = s.offsetHeight;
        if (scrollY >= top && scrollY < top + hh) current = s.id;
      });
      navAnchors.forEach(function (a) { a.classList.toggle('active-link', a.getAttribute('href') === '#' + current); });
    }
    lastScroll = st;
  }, { passive: true });

  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    var focusableLinks = navLinks.querySelectorAll('a');
    var firstFocusable = focusableLinks[0];
    var lastFocusable = focusableLinks[focusableLinks.length - 1];
    var navOpen = false;

    function toggleMenu(open) {
      navOpen = open !== undefined ? open : !navLinks.classList.contains('active');
      hamburger.classList.toggle('active', navOpen);
      navLinks.classList.toggle('active', navOpen);
      hamburger.setAttribute('aria-expanded', String(navOpen));
      document.body.style.overflow = navOpen ? 'hidden' : '';
      if (navOpen && firstFocusable) {
        setTimeout(function () { firstFocusable.focus(); }, 100);
      }
    }

    hamburger.addEventListener('click', function () { toggleMenu(); });

    navLinks.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navOpen) { toggleMenu(false); hamburger.focus(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(function (el) { revealObserver.observe(el); });

  var typewriterEl = document.getElementById('heroDesc');
  if (typewriterEl) {
    var text = "Du Collège au Lycée — nous cultivons l'excellence académique et le développement personnel de chaque élève.";
    var idx = 0;
    typewriterEl.classList.add('typewriter-cursor');
    function typeChar() {
      if (idx < text.length) {
        typewriterEl.textContent = text.substring(0, idx + 1);
        idx++;
        var delay = text[idx - 1] === '.' || text[idx - 1] === ',' ? 60 : 25 + Math.random() * 25;
        setTimeout(typeChar, delay);
      } else {
        typewriterEl.classList.remove('typewriter-cursor');
      }
    }
    setTimeout(typeChar, 1800);
  }

  function parseTarget(val) {
    var str = String(val);
    var prefix = str.match(/^[+\-]/) ? str[0] : '';
    var num = parseInt(str.replace(/[^0-9]/g, '')) || 0;
    var suffix = str.match(/[kKmM]$/) ? str.slice(-1).toLowerCase() : '';
    return { value: num, displaySuffix: suffix };
  }
  function animateCounter(el) {
    var raw = el.dataset.target;
    var parsed = parseTarget(raw);
    var targetVal = parsed.value;
    var displaySuffix = parsed.displaySuffix;
    if (!targetVal || isNaN(targetVal)) return;
    var duration = 2000;
    var start = performance.now();
    function update(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * targetVal);
      var display = current;
      if (displaySuffix === 'k') display = current + 'k';
      else if (displaySuffix === 'm') display = current + 'M';
      el.textContent = raw.replace(/[0-9]/g, '').startsWith('+') ? '+' + display : display;
      if (progress < 1) requestAnimationFrame(update);
      else {
        el.textContent = raw.replace(/[0-9]/g, '').startsWith('+') ? '+' + display : display;
      }
    }
    requestAnimationFrame(update);
  }

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
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
  document.querySelectorAll('[data-target]').forEach(function (el) { counterObserver.observe(el); });

  var floats = document.querySelectorAll('.float-shape');
  if (floats.length) {
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      floats.forEach(function (el, i) {
        var speed = 8 + i * 4;
        el.style.transform = 'translate(' + (x * speed) + 'px, ' + (y * speed) + 'px)';
      });
    }, { passive: true });
  }

  document.querySelectorAll('.level-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (y * -6) + 'deg) translateY(-8px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  var portraitImg = document.querySelector('.portrait-image img');
  if (portraitImg) {
    var container = portraitImg.closest('.portrait-container');
    if (container) {
      container.addEventListener('mousemove', function (e) {
        var rect = container.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        portraitImg.style.transform = 'scale(1.08) translate(' + (x * 10) + 'px, ' + (y * 10) + 'px)';
      });
      container.addEventListener('mouseleave', function () {
        portraitImg.style.transform = 'scale(1) translate(0, 0)';
      });
    }
  }

  document.querySelectorAll('.btn-primary, .btn-outline').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      var rect = this.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.cssText =
        'position:absolute;border-radius:50%;width:' + size + 'px;height:' + size + 'px;' +
        'background:rgba(255,255,255,0.3);left:' + (e.clientX - rect.left - size / 2) + 'px;' +
        'top:' + (e.clientY - rect.top - size / 2) + 'px;transform:scale(0);animation:rippleAnim 0.6s ease-out forwards;pointer-events:none;';
      this.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  });

  document.querySelectorAll('.obfuscated-email').forEach(function (el) {
    var user = el.dataset.user;
    var domain = el.dataset.domain;
    var email = user + '@' + domain;
    el.href = 'mailto:' + email;
    if (el.textContent === user + '@' + domain + '...') el.textContent = email;
  });

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var formBtn = contactForm.querySelector('.form-submit');
    var formStatus = document.createElement('div');
    formStatus.className = 'form-status';
    formStatus.setAttribute('role', 'status');
    contactForm.appendChild(formStatus);

    function sanitize(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML.replace(/[<>]/g, '').trim();
    }

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var trap = document.getElementById('formTrap');
      if (trap && trap.value.trim() !== '') return;
      if (formBtn) { formBtn.disabled = true; formBtn.querySelector('span').textContent = 'Envoi en cours\u2026'; }
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      var name = document.getElementById('formName');
      var email = document.getElementById('formEmail');
      var msg = document.getElementById('formMessage');
      if (name) name.value = sanitize(name.value);
      if (email) email.value = sanitize(email.value);
      if (msg) msg.value = sanitize(msg.value);
      if (!name?.value || !email?.value || !msg?.value) {
        formStatus.className = 'form-status form-status--error';
        formStatus.textContent = '\u2717 Veuillez remplir tous les champs obligatoires.';
        if (formBtn) { formBtn.disabled = false; formBtn.querySelector('span').textContent = 'Envoyer le message'; }
        return;
      }

      try {
        var res = await fetch(this.action, {
          method: 'POST',
          body: new FormData(this),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          formStatus.className = 'form-status form-status--success';
          formStatus.textContent = '\u2713 Message envoy\u00e9 avec succ\u00e8s. Nous vous r\u00e9pondrons rapidement.';
          this.reset();
        } else {
          throw new Error('Erreur serveur');
        }
      } catch (_err) {
        formStatus.className = 'form-status form-status--error';
        formStatus.textContent = '\u2717 Une erreur est survenue. Veuillez r\u00e9essayer ou nous contacter par t\u00e9l\u00e9phone.';
      } finally {
        if (formBtn) { formBtn.disabled = false; formBtn.querySelector('span').textContent = 'Envoyer le message'; }
      }
    });
  }

  /* ─── MAGNETIC BUTTONS ─── */
  if (!isTouchDevice) {
    document.querySelectorAll('.btn, .nav-cta, .footer-social a').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var r = this.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        var s = Math.min(this.classList.contains('btn') ? 0.25 : 0.15, 0.25);
        this.style.transform = 'translate(' + (x * s) + 'px, ' + (y * s) + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  /* ─── REGISTRATION FORM ─── */
  var regForm = document.getElementById('registrationForm');
  if (regForm) {
    var regCategory = document.getElementById('regCategory');
    var regLevel = document.getElementById('regLevel');

    var levelsByCategory = {
      'Collège': ['1AC', '2AC', '3AC'],
      'Lycée': ['TC', '1BAC Éco', '1BAC Sc', '2BAC Éco', '2BAC SVT', '2BAC PC']
    };

    function populateLevels() {
      regLevel.innerHTML = '<option value="" disabled selected></option>';
      var cat = regCategory.value;
      if (cat && levelsByCategory[cat]) {
        levelsByCategory[cat].forEach(function(lvl) {
          var opt = document.createElement('option');
          opt.value = lvl;
          opt.textContent = lvl;
          regLevel.appendChild(opt);
        });
        regLevel.disabled = false;
      } else {
        regLevel.disabled = true;
      }
      regLevel.classList.toggle('filled', false);
    }

    if (regCategory) {
      regCategory.addEventListener('change', function() {
        regCategory.classList.toggle('filled', regCategory.value !== '');
        populateLevels();
      });
    }
    if (regLevel) {
      regLevel.addEventListener('change', function() {
        regLevel.classList.toggle('filled', regLevel.value !== '');
      });
    }

    regForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = this.querySelector('.form-submit');
      var originalHTML = btn.innerHTML;
      var category = regCategory ? regCategory.value : '';
      var level = regLevel ? regLevel.value : '';
      var data = {
        name: document.getElementById('regName').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        level: category + ' - ' + level,
        message: document.getElementById('regMessage').value.trim()
      };

      btn.innerHTML = '<span>Envoi en cours\u2026</span> <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
      btn.disabled = true;

      try {
        var res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Erreur serveur');

        btn.innerHTML = '<span>Demande envoy\u00e9e !</span> <i class="fas fa-check" aria-hidden="true"></i>';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        this.reset();
        if (regCategory) regCategory.classList.remove('filled');
        if (regLevel) { regLevel.classList.remove('filled'); regLevel.disabled = true; }
        populateLevels();
      } catch (err) {
        btn.innerHTML = '<span>Erreur \u2014 r\u00e9essayez</span> <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      }

      setTimeout(function() {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    });
  }

  /* ─── SMOOTH PARALLAX SCROLL ─── */
  (function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var sections = document.querySelectorAll('.hero, .about, .leadership, .levels, .contact');
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          sections.forEach(function(s) {
            var rect = s.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.top < vh && rect.bottom > -vh) {
              if (s.classList.contains('hero')) {
                var slideshow = s.querySelector('.hero-slideshow');
                if (slideshow) slideshow.style.transform = 'translateY(' + (rect.top * 0.1) + 'px)';
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ─── TILT CARDS IMPROVED ─── */
  document.querySelectorAll('.level-card, .contact-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var rotY = card.classList.contains('level-card') ? 8 : 3;
      var rotX = card.classList.contains('level-card') ? -6 : -3;
      card.style.transform = 'perspective(800px) rotateY(' + (x * rotY) + 'deg) rotateX(' + (y * rotX) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  /* ─── STAGGER ENTRANCE IMPROVED ─── */
  var staggerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        var children = entry.target.querySelectorAll('.stagger-item');
        children.forEach(function(child, i) {
          child.style.setProperty('--stagger-delay', (i * 80) + 'ms');
          child.classList.add('stagger-in');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.about-values, .profile-achievements, .contact-info-side').forEach(function(el) {
    staggerObserver.observe(el);
  });

  /* ─── AUTO-UPDATE COPYRIGHT YEAR ─── */
  var yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    var currentYear = new Date().getFullYear();
    yearEl.textContent = Math.min(currentYear, 2100);
  }

  var rippleStyle = document.createElement('style');
  rippleStyle.textContent = '@keyframes rippleAnim { to { transform: scale(2.5); opacity: 0; } }';
  document.head.appendChild(rippleStyle);

})();
