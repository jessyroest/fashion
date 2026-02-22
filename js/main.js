/* ============================================================
   NOCTIS VESPERA — Sacred Couture
   Cinematic Interaction System
   ============================================================ */

'use strict';

/* ─── GARMENT DATA ────────────────────────────────────────── */
const GARMENT_DATA = {
  1: {
    number: '001',
    name: 'Vespera Coat I',
    image: 'video/hf_20260222_155350_3fdfb957-7f61-4aa1-8507-2d516435bb9d.jpeg',
    ritual: 'Born at the threshold between the last hour of darkness and the first breath of dawn, Vespera Coat I was conceived during four days of unbroken craft. A single atelier in Lyon. No deadlines. No compromises. Only the work and the silence it demands.',
    material: 'Midnight wool blend',
    embroidery: 'Hand-drawn silver thread',
    origin: 'Lyon, France',
    edition: '47 pieces — Ceremony III',
    symbol: 'The inverted crescent woven along the spine carries no public explanation. Its precise meaning has awakened differently in every wearer. We do not explain. We do not need to.'
  },
  2: {
    number: '002',
    name: 'Vespera Coat II',
    image: 'video/hf_20260222_155349_ec385984-b981-478e-821c-4edc5b6f498c.jpeg',
    ritual: 'The second coat was constructed in winter. The atelier in Bruges was unheated, by choice. The cold preserved the precision. What emerged from weeks of disciplined silence was not a garment — it was a declaration made in fabric and thread.',
    material: 'Black crepe',
    embroidery: 'Ceremonial silver thread, hand-knotted',
    origin: 'Bruges, Belgium',
    edition: '23 pieces — Ceremony III',
    symbol: 'The twin scrollwork at the hem traces a pattern known only to the maker. Three wearers have independently reported recognizing it. From where, none could say.'
  }
};

/* ─── UTILITY ─────────────────────────────────────────────── */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ─── LOADER ─────────────────────────────────────────────── */
class Loader {
  constructor(onDone) {
    this.el       = qs('#loader');
    this.sigil    = qs('.loader-sigil-wrap');
    this.brand    = qs('.loader-brand-wrap');
    this.sub      = qs('.loader-sub-text');
    this.progress = qs('#loader-progress-inner');
    this.canvas   = qs('#loader-grain');
    this.onDone   = onDone;
    this.prog     = 0;
    this.init();
  }

  init() {
    this.animateGrain(this.canvas);
    this.run();
  }

  run() {
    // Stage 1: sigil fades in (0–500ms)
    setTimeout(() => {
      this.sigil.classList.add('loaded');
    }, 200);

    // Stage 2: brand name fades in (800ms)
    setTimeout(() => {
      this.brand.classList.add('loaded');
      this.sub.classList.add('loaded');
    }, 900);

    // Progress bar fills over 2.8s
    const start = performance.now();
    const dur   = 2800;

    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.progress.style.width = `${ease * 100}%`;
      if (t < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);

    // Stage 3: fade out loader (3200ms)
    setTimeout(() => {
      this.el.classList.add('loader-out');
      setTimeout(() => {
        this.el.style.display = 'none';
        this.onDone();
      }, 900);
    }, 3200);
  }

  animateGrain(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = () => {
      if (!this.el || this.el.style.display === 'none') return;
      const img = ctx.createImageData(w, h);
      const d   = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}

/* ─── CUSTOM CURSOR ──────────────────────────────────────── */
class Cursor {
  constructor() {
    this.el   = qs('#cursor');
    this.x    = -100;
    this.y    = -100;
    this.tx   = -100;
    this.ty   = -100;
    this.raf  = null;
    if (!this.el || window.matchMedia('(pointer: coarse)').matches) return;
    this.bind();
    this.tick();
  }

  bind() {
    document.addEventListener('mousemove', (e) => {
      this.tx = e.clientX;
      this.ty = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      this.el.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.el.style.opacity = '1';
    });

    // Hover state on interactive elements
    const hoverEls = qsa('a, button, .btn-witness, .btn-reserve, .btn-primary, .btn-ghost, .btn-enter, .btn-modal-reserve');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('cursor-hover'));
    });
  }

  tick() {
    this.x = this.tx;
    this.y = this.ty;
    this.el.style.transform = `translate(${this.x}px, ${this.y}px) translate(-50%, -50%)`;
    this.raf = requestAnimationFrame(() => this.tick());
  }
}

/* ─── FILM GRAIN ─────────────────────────────────────────── */
class FilmGrain {
  constructor() {
    this.canvas = qs('#grain');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.w = this.canvas.width  = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  animate() {
    const img = this.ctx.createImageData(this.w, this.h);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    this.ctx.putImageData(img, 0, 0);
    requestAnimationFrame(() => this.animate());
  }
}

/* ─── PARTICLES ──────────────────────────────────────────── */
class Particles {
  constructor() {
    this.canvas = qs('#particles');
    if (!this.canvas) return;
    this.ctx    = this.canvas.getContext('2d');
    this.count  = 60;
    this.dots   = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.spawn();
    this.animate();
  }

  resize() {
    this.w = this.canvas.width  = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  spawn() {
    for (let i = 0; i < this.count; i++) {
      this.dots.push(this.createDot(true));
    }
  }

  createDot(randomY = false) {
    return {
      x:    Math.random() * this.w,
      y:    randomY ? Math.random() * this.h : this.h + 10,
      r:    Math.random() * 1.2 + 0.3,
      vy:   -(Math.random() * 0.3 + 0.08),
      vx:   (Math.random() - 0.5) * 0.12,
      life: Math.random(),
      maxL: Math.random() * 0.3 + 0.05,
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    this.dots.forEach((d, i) => {
      d.x += d.vx;
      d.y += d.vy;
      d.life += 0.002;

      const alpha = d.life < 0.3
        ? d.life / 0.3 * d.maxL
        : d.life > 0.7
          ? (1 - d.life) / 0.3 * d.maxL
          : d.maxL;

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(191,192,194,${clamp(alpha, 0, 1)})`;
      this.ctx.fill();

      if (d.life >= 1 || d.y < -10) {
        this.dots[i] = this.createDot(false);
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

/* ─── HERO ANIMATIONS ────────────────────────────────────── */
class HeroAnimator {
  constructor() {
    this.lines   = qsa('.hero-line');
    this.eyebrow = qs('.hero-eyebrow');
    this.sub     = qs('.hero-sub');
    this.ctas    = qs('.hero-ctas');
  }

  play() {
    this.eyebrow?.classList.add('animate');

    this.lines.forEach(line => {
      const delay = parseInt(line.dataset.delay || 0);
      setTimeout(() => {
        line.classList.add('animate');
      }, delay);
    });

    setTimeout(() => this.sub?.classList.add('animate'),
      parseInt(this.sub?.dataset.delay || 1400));

    setTimeout(() => this.ctas?.classList.add('animate'),
      parseInt(this.ctas?.dataset.delay || 1700));
  }
}

/* ─── HERO PARALLAX ──────────────────────────────────────── */
class HeroParallax {
  constructor() {
    this.hero    = qs('#hero');
    this.content = qs('#hero-content');
    this.model   = qs('#hero-model-wrap');
    this.mx = 0;
    this.my = 0;
    this.cx = 0;
    this.cy = 0;
    if (!this.hero) return;
    this.bind();
    this.tick();
  }

  bind() {
    this.hero.addEventListener('mousemove', (e) => {
      const r  = this.hero.getBoundingClientRect();
      this.mx = (e.clientX - r.left) / r.width  - 0.5;
      this.my = (e.clientY - r.top)  / r.height - 0.5;
    });
  }

  tick() {
    this.cx = lerp(this.cx, this.mx, 0.04);
    this.cy = lerp(this.cy, this.my, 0.04);

    if (this.content) {
      this.content.style.transform = `translate(${this.cx * -12}px, ${this.cy * -8}px)`;
    }
    if (this.model) {
      this.model.style.transform = `translate(${this.cx * 8}px, ${this.cy * 5}px)`;
    }

    requestAnimationFrame(() => this.tick());
  }
}

/* ─── NAV ────────────────────────────────────────────────── */
class Nav {
  constructor() {
    this.nav    = qs('#nav');
    this.burger = qs('#nav-burger');
    this.mobile = qs('#mobile-nav');
    this.links  = qsa('.mobile-nav-link');
    this.open   = false;
    this.bind();
    this.scroll();
  }

  bind() {
    if (this.burger) {
      this.burger.addEventListener('click', () => this.toggleMobile());
    }

    this.links.forEach(link => {
      link.addEventListener('click', () => {
        if (this.open) this.toggleMobile();
      });
    });
  }

  toggleMobile() {
    this.open = !this.open;
    this.burger?.classList.toggle('open', this.open);
    this.mobile?.classList.toggle('mobile-nav-open', this.open);
    document.body.classList.toggle('mobile-open', this.open);
  }

  scroll() {
    window.addEventListener('scroll', () => {
      this.nav?.classList.toggle('nav-scrolled', window.scrollY > 80);
    }, { passive: true });
  }
}

/* ─── PHILOSOPHY SCROLL ──────────────────────────────────── */
class PhilosophyScroll {
  constructor() {
    this.section = qs('#philosophy');
    this.lines   = qsa('.philo-line');
    this.counter = qs('#philo-num');
    this.ctEl    = qs('.philosophy-counter');
    this.current = -1;
    if (!this.section) return;
    this.bind();
  }

  bind() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const rect    = this.section.getBoundingClientRect();
    const total   = this.section.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    const progress = scrolled / total;

    if (progress > 0 && progress < 1) {
      this.ctEl && (this.ctEl.style.opacity = '1');
    } else {
      this.ctEl && (this.ctEl.style.opacity = '0');
    }

    const idx = Math.floor(progress * this.lines.length);
    const active = clamp(idx, 0, this.lines.length - 1);

    if (active !== this.current) {
      this.current = active;
      this.lines.forEach((l, i) => l.classList.toggle('active', i === active));
      if (this.counter) {
        this.counter.textContent = String(active + 1).padStart(2, '0');
      }
    }
  }
}

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
class ScrollReveal {
  constructor() {
    this.els = qsa('.reveal-up');
    this.observe();
  }

  observe() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    this.els.forEach(el => io.observe(el));
  }
}

/* ─── GARMENT MODAL ──────────────────────────────────────── */
class GarmentModal {
  constructor() {
    this.modal    = qs('#garment-modal');
    this.backdrop = qs('#modal-backdrop');
    this.closeBtn = qs('#modal-close');
    this.img      = qs('#modal-img');
    this.imgNum   = qs('#modal-img-num');
    this.name     = qs('#modal-name');
    this.ritual   = qs('#modal-ritual-text');
    this.material = qs('#modal-material');
    this.embroid  = qs('#modal-embroidery');
    this.origin   = qs('#modal-origin');
    this.edition  = qs('#modal-edition');
    this.symbol   = qs('#modal-symbol-text');
    this.reserveBtn = qs('#btn-modal-reserve');

    this.bind();
  }

  bind() {
    qsa('.btn-witness').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.garment);
        this.open(id);
      });
    });

    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal?.classList.contains('modal-hidden')) {
        this.close();
      }
    });

    this.reserveBtn?.addEventListener('click', () => {
      this.close();
      setTimeout(() => {
        qs('#initiation')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    });

    // Reserve piece buttons
    qsa('.btn-reserve').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) {
          qs(target)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  open(id) {
    const d = GARMENT_DATA[id];
    if (!d) return;

    this.imgNum.textContent  = d.number;
    this.name.textContent    = d.name;
    this.ritual.textContent  = d.ritual;
    this.material.textContent = d.material;
    this.embroid.textContent  = d.embroidery;
    this.origin.textContent   = d.origin;
    this.edition.textContent  = d.edition;
    this.symbol.textContent   = d.symbol;

    // Set image with fade
    this.img.style.opacity = '0';
    this.img.src = d.image;
    this.img.onload = () => {
      this.img.style.transition = 'opacity 0.6s ease';
      this.img.style.opacity    = '1';
    };

    this.modal.classList.remove('modal-hidden');
    this.modal.classList.add('modal-open');
    this.modal.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');
  }

  close() {
    this.modal.classList.remove('modal-open');
    this.modal.classList.add('modal-hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

/* ─── COUNTDOWN ──────────────────────────────────────────── */
class Countdown {
  constructor() {
    this.dEl = qs('#cd-days');
    this.hEl = qs('#cd-hours');
    this.mEl = qs('#cd-mins');
    this.sEl = qs('#cd-secs');

    if (!this.dEl) return;

    // Set ceremony date: 5 days from now at midnight
    const target = new Date();
    target.setDate(target.getDate() + 5);
    target.setHours(0, 0, 0, 0);
    this.target = target;

    this.tick();
    setInterval(() => this.tick(), 1000);
  }

  tick() {
    const now  = Date.now();
    const diff = Math.max(this.target - now, 0);

    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);

    const pad = n => String(n).padStart(2, '0');

    if (this.dEl) this.dEl.textContent = pad(d);
    if (this.hEl) this.hEl.textContent = pad(h);
    if (this.mEl) this.mEl.textContent = pad(m);
    if (this.sEl) this.sEl.textContent = pad(s);
  }
}

/* ─── FORM + TOAST ───────────────────────────────────────── */
class InitiationForm {
  constructor() {
    this.form  = qs('#initiation-form');
    this.toast = qs('#toast');
    this.toastText = qs('#toast-text');
    this.toastLine = qs('.toast-line');
    this.timeout = null;
    this.bind();
  }

  bind() {
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#email-input')?.value?.trim();
      if (!email) return;
      this.show('Request received. The Order will be in contact.');
      this.form.reset();
    });
  }

  show(msg) {
    clearTimeout(this.timeout);
    if (this.toastText) this.toastText.textContent = msg;
    if (this.toastLine) this.toastLine.style.width = '0';

    this.toast.classList.add('toast-show');

    // Trigger line animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.toastLine) this.toastLine.style.width = '100%';
      });
    });

    this.timeout = setTimeout(() => {
      this.toast.classList.remove('toast-show');
    }, 4000);
  }
}

/* ─── HERO SCROLL FADE ───────────────────────────────────── */
class HeroScrollFade {
  constructor() {
    this.hero    = qs('#hero');
    this.hint    = qs('#hero-scroll-hint');
    this.content = qs('#hero-content');
    this.bind();
  }

  bind() {
    window.addEventListener('scroll', () => {
      const prog = clamp(window.scrollY / window.innerHeight, 0, 1);
      if (this.content) {
        this.content.style.opacity = String(1 - prog * 1.5);
      }
      if (this.hint) {
        this.hint.style.opacity = String(1 - prog * 3);
      }
    }, { passive: true });
  }
}

/* ─── IMAGE PARALLAX ON SCROLL ───────────────────────────── */
class GarmentParallax {
  constructor() {
    this.sections = qsa('.garment-section');
    this.bind();
  }

  bind() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const vh = window.innerHeight;
    this.sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const prog = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const img  = sec.querySelector('.garment-bg-img');
      if (img) {
        const y = (prog - 0.5) * 40;
        img.style.transform = `scale(1.08) translateY(${y}px)`;
      }
    });
  }
}

/* ─── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
function bindSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = qs(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─── HOVER CURSOR UPDATE ────────────────────────────────── */
function refreshCursorTargets() {
  const els = qsa('a, button, .btn-witness, .btn-reserve, .btn-enter, .btn-primary, .btn-ghost, .btn-modal-reserve');
  const cursor = qs('#cursor');
  if (!cursor) return;
  els.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}

/* ─── STAGGERED SECTION ENTRANCE ─────────────────────────── */
class SectionObserver {
  constructor() {
    this.sections = qsa('#editorial, #symbolism, #ceremony, #initiation');
    this.observe();
  }

  observe() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s var(--ease-slow)';
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.05 });

    this.sections.forEach(sec => {
      sec.style.opacity   = '0';
      sec.style.transform = 'translateY(30px)';
      io.observe(sec);
    });
  }
}

/* ─── GARMENT SECTION ENTRANCE ───────────────────────────── */
class GarmentObserver {
  constructor() {
    this.sections = qsa('.garment-section');
    this.observe();
  }

  observe() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('garment-in');
          const contents = qsa('.reveal-up', entry.target);
          contents.forEach((el, i) => {
            const base  = parseInt(el.dataset.delay || 0);
            const delay = base + i * 80;
            setTimeout(() => el.classList.add('revealed'), delay + 300);
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    this.sections.forEach(sec => io.observe(sec));
  }
}

/* ─── LIGHT BEAM EFFECT ON HERO ──────────────────────────── */
function createLightBeams() {
  const hero = qs('#hero');
  if (!hero) return;

  const beam = document.createElement('div');
  beam.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    background: repeating-linear-gradient(
      105deg,
      transparent 0%,
      transparent 3%,
      rgba(232,230,227,0.012) 3.5%,
      transparent 4%
    );
    animation: beamShift 15s ease-in-out infinite alternate;
  `;
  hero.appendChild(beam);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes beamShift {
      from { transform: skewX(-3deg) translateX(-2%); opacity: 0.6; }
      to   { transform: skewX(3deg)  translateX(2%);  opacity: 1;   }
    }
  `;
  document.head.appendChild(style);
}

/* ─── BLOOD PULSE ON CEREMONY ────────────────────────────── */
function bindCeremonyPulse() {
  const nums = qsa('.cd-num');
  let last = '';

  setInterval(() => {
    const now = new Date().getSeconds();
    const s = String(now).padStart(2, '0');
    if (s !== last) {
      last = s;
      nums.forEach(n => {
        n.style.transition = 'color 0.2s ease';
        n.style.color = 'var(--silver)';
        setTimeout(() => {
          n.style.color = 'var(--bone)';
        }, 200);
      });
    }
  }, 500);
}

/* ─── MODAL IMAGE HOVER EFFECT ───────────────────────────── */
function bindModalImageHover() {
  const img = qs('#modal-img');
  if (!img) return;
  img.addEventListener('mousemove', (e) => {
    const r  = img.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    img.style.transform = `scale(1.04) translate(${x * 8}px, ${y * 8}px)`;
  });
  img.addEventListener('mouseleave', () => {
    img.style.transform = 'scale(1)';
  });
}

/* ─── SCROLL PROGRESS LINE ───────────────────────────────── */
/* ─── SMOKE TRAIL ────────────────────────────────────────── */
class SmokeTrail {
  constructor() {
    this.lastX   = 0;
    this.lastY   = 0;
    this.minDist = 14;
    // disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    window.addEventListener('mousemove', e => this.onMove(e), { passive: true });
  }

  onMove(e) {
    const dx   = e.clientX - this.lastX;
    const dy   = e.clientY - this.lastY;
    if (Math.sqrt(dx * dx + dy * dy) < this.minDist) return;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.spawn(e.clientX, e.clientY);
  }

  spawn(x, y) {
    const size = 8 + Math.random() * 12;
    const el   = document.createElement('div');
    el.className = 'smoke-particle';
    el.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle,
        rgba(100,88,80,0.38) 0%,
        rgba(60,14,14,0.12) 50%,
        transparent 75%);
      opacity: 0.55;
    `;
    document.body.appendChild(el);

    const start   = performance.now();
    const dur     = 850 + Math.random() * 450;
    const driftX  = (Math.random() - 0.5) * 28;
    const driftY  = -(18 + Math.random() * 24);
    const maxScale = 1.8 + Math.random() * 1.2;

    const tick = (now) => {
      const t    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      el.style.opacity   = (0.55 * (1 - t)).toFixed(3);
      el.style.transform = `translate(calc(-50% + ${driftX * ease}px), calc(-50% + ${driftY * ease}px)) scale(${1 + (maxScale - 1) * ease})`;
      if (t < 1) requestAnimationFrame(tick);
      else el.remove();
    };
    requestAnimationFrame(tick);
  }
}

/* ─── SOUL COUNTER ───────────────────────────────────────── */
const ROMAN_MAP = [
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],
  [5,'V'],[4,'IV'],[1,'I']
];
function toRoman(n) {
  let s = '';
  for (const [v, sym] of ROMAN_MAP) { while (n >= v) { s += sym; n -= v; } }
  return s;
}

class SoulCounter {
  constructor() {
    this.el    = document.getElementById('soul-num');
    if (!this.el) return;
    this.count = 11 + Math.floor(Math.random() * 13); // 11–23
    this.render();
    this.tick();
  }

  render() {
    if (this.el) this.el.textContent = toRoman(this.count);
  }

  tick() {
    const delay = 9000 + Math.random() * 11000; // 9–20 s
    setTimeout(() => {
      const delta    = Math.random() < 0.65 ? 1 : -1;
      this.count     = Math.max(5, Math.min(49, this.count + delta));
      if (this.el) {
        this.el.style.opacity = '0';
        setTimeout(() => {
          this.render();
          this.el.style.opacity = '1';
        }, 380);
      }
      this.tick();
    }, delay);
  }
}

/* ─── LETTER REPULSION ───────────────────────────────────── */
class LetterRepulsion {
  constructor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    this.radius   = 90;
    this.strength = 38;
    this.letters  = [];
    this.rects    = [];
    this.mouse    = { x: -9999, y: -9999 };
    this.raf      = null;

    // Split every hero-line into per-character inline spans
    document.querySelectorAll('.hero-line').forEach(line => {
      const text = line.textContent;
      line.textContent = '';
      [...text].forEach(ch => {
        const s = document.createElement('span');
        s.textContent = ch;
        s.style.display = 'inline-block';
        s.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
        line.appendChild(s);
        if (ch.trim()) this.letters.push(s);
      });
    });

    this.cacheRects();
    window.addEventListener('resize', () => this.cacheRects(), { passive: true });
    window.addEventListener('scroll', () => this.cacheRects(), { passive: true });
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (!this.raf) this.raf = requestAnimationFrame(() => { this.update(); this.raf = null; });
    }, { passive: true });
  }

  cacheRects() {
    // Only cache while hero is near viewport
    this.rects = this.letters.map(s => {
      const r = s.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  }

  update() {
    const { x, y } = this.mouse;
    // Only active when hero is in view (scrollY < 120vh)
    if (window.scrollY > window.innerHeight * 1.2) {
      this.letters.forEach(s => { s.style.transform = 'translate(0,0)'; });
      return;
    }
    this.letters.forEach((s, i) => {
      const { cx, cy } = this.rects[i];
      const dx   = x - cx;
      const dy   = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.radius && dist > 0) {
        const force = (1 - dist / this.radius) * this.strength;
        const angle = Math.atan2(dy, dx);
        const px = -Math.cos(angle) * force;
        const py = -Math.sin(angle) * force;
        s.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      } else {
        s.style.transform = 'translate(0,0)';
      }
    });
  }
}

/* ─── GARMENT SCROLL DESATURATION ───────────────────────── */
class GarmentScrollFade {
  constructor() {
    this.items = [...document.querySelectorAll('.garment-section')].map(sec => ({
      sec,
      img: sec.querySelector('.garment-bg-img')
    })).filter(o => o.img);

    if (!this.items.length) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    this.items.forEach(({ sec, img }) => {
      const rect  = sec.getBoundingClientRect();
      const secH  = sec.offsetHeight;
      // progress 0 = section top at viewport top, 1 = fully scrolled past
      const prog  = clamp(-rect.top / secH, 0, 1);
      // Saturate: 0.5 → 0.08   Brightness: 0.6 → 0.35
      const sat   = (0.5 - prog * 0.42).toFixed(3);
      const bri   = (0.6 - prog * 0.25).toFixed(3);
      img.style.filter = `brightness(${bri}) saturate(${sat}) contrast(1.05)`;
    });
  }
}

function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 1px;
    background: var(--blood);
    z-index: 9000;
    pointer-events: none;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s linear;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const prog = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${clamp(prog, 0, 1)})`;
  }, { passive: true });
}

/* ─── INIT ───────────────────────────────────────────────── */
function init() {
  // After loader completes
  const hero    = new HeroAnimator();
  const cursor  = new Cursor();
  const grain   = new FilmGrain();
  const particles = new Particles();
  const nav     = new Nav();
  const philo   = new PhilosophyScroll();
  const reveal  = new ScrollReveal();
  const modal   = new GarmentModal();
  const cd      = new Countdown();
  const form    = new InitiationForm();
  const heroFade = new HeroScrollFade();
  const gParallax = new GarmentParallax();
  const secObs  = new SectionObserver();
  const gObs    = new GarmentObserver();
  const hParallax = new HeroParallax();

  const smoke    = new SmokeTrail();
  const souls    = new SoulCounter();
  const repulse  = new LetterRepulsion();
  const gFade    = new GarmentScrollFade();

  bindSmoothScroll();
  refreshCursorTargets();
  createLightBeams();
  bindCeremonyPulse();
  bindModalImageHover();
  initScrollProgress();

  return hero;
}

/* ─── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const loader = new Loader(() => {
    const hero = init();
    hero.play();
  });
});
