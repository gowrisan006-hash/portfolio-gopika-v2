const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isHoverable = matchMedia('(hover: hover)').matches;

// ---------- Preloader ----------
const pre = document.getElementById('pre');
const countEl = document.getElementById('count');
const line = document.getElementById('preLine');
let n = 0;

const tick = setInterval(() => {
  n += Math.ceil(Math.random() * 6);

  if (n >= 100) {
    n = 100;
    clearInterval(tick);
    setTimeout(() => {
      pre.classList.add('done');
      document.body.classList.remove('loading');
    }, 350);
  }

  countEl.textContent = n;
  line.style.width = n + '%';
}, 55);

// ---------- Custom cursor (Desktop only, Tab Visibility Aware) ----------
const cur = document.getElementById('cursor');
const curTxt = document.getElementById('cursorText');
let mx = innerWidth / 2;
let my = innerHeight / 2;
let cx = mx;
let cy = my;

if (isHoverable && cur) {
  addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function loop() {
    if (!document.hidden) {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
    }
    requestAnimationFrame(loop);
  })();

  const hover = (sel, txt) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cur.classList.add('big');
        curTxt.textContent = txt;
      });

      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  };

  hover('.row-head', 'OPEN');
  hover('.photo', 'HI!');
  hover('.badge', 'GN');
  hover('.mail', 'MAIL');
}

// ---------- Magnetic buttons (Desktop hover only) ----------
if (isHoverable) {
  document.querySelectorAll('.mag').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const b = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.35}px, ${(e.clientY - b.top - b.height / 2) * 0.35}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ---------- Role word roller (slides up) ----------
const roles = ['FULL STACK DEVELOPER', 'REACT DEVELOPER', 'NODE.JS DEVELOPER', 'UI BUILDER'];
let ri = 0;
const rw = document.getElementById('roleWord');

if (rw) {
  setInterval(() => {
    if (document.hidden) return;
    rw.className = 'out';
    setTimeout(() => {
      ri = (ri + 1) % roles.length;
      rw.textContent = roles[ri];
      rw.className = 'in';
    }, 350);
  }, 3200);
}

// ---------- Scroll-scrubbed text ----------
const scrub = document.getElementById('scrub');
if (scrub) {
  scrub.innerHTML = scrub.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
}

const words = scrub ? scrub.querySelectorAll('.w') : [];
const photoEl = document.getElementById('photo');

// ---------- Marquee reacts to scroll ----------
const track = document.getElementById('track');
let pos = 0;
let last = scrollY;
let vel = 0;
let dir = -1;

function marquee() {
  if (!document.hidden) {
    const d = scrollY - last;
    last = scrollY;
    vel += (Math.abs(d) - vel) * 0.1;

    if (d !== 0) dir = d > 0 ? -1 : 1;
    pos += reduce ? 0 : dir * (1.2 + vel * 0.6);

    if (track) {
      const w = track.scrollWidth / 2;
      if (pos <= -w) pos += w;
      if (pos > 0) pos -= w;
      track.style.transform = `translateX(${pos}px)`;
    }

    if (scrub) {
      const trig = innerHeight * 0.75;
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (trig - r.top) / (r.height + innerHeight * 0.25)));
      words.forEach((el, i) => {
        el.classList.toggle('on', i / words.length < p);
      });
    }

    if (photoEl) {
      photoEl.style.setProperty('--py', Math.min(scrollY, 600) * -0.12 + 'px');
    }
  }

  requestAnimationFrame(marquee);
}

marquee();

// ---------- Accordion rows with ARIA & Keyboard support ----------
document.querySelectorAll('.row').forEach((row) => {
  const head = row.querySelector('.row-head');
  if (!head) return;

  const toggle = () => {
    const open = row.classList.contains('open');

    document.querySelectorAll('.row').forEach((r) => {
      r.classList.remove('open');
      const h = r.querySelector('.row-head');
      if (h) h.setAttribute('aria-expanded', 'false');
    });

    if (!open) {
      row.classList.add('open');
      head.setAttribute('aria-expanded', 'true');
    }
  };

  head.addEventListener('click', toggle);
  head.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

// ---------- Reveal on scroll ----------
document.querySelectorAll('.fact,.h2,.row,.mega,.contact-grid').forEach((el, i) => {
  el.classList.add('rv');
  el.style.transitionDelay = (i % 3) * 0.12 + 's';
});

const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.rv').forEach((el) => io.observe(el));

// ---------- Form ----------
const formEl = document.getElementById('form');
if (formEl) {
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const sendTxt = document.getElementById('sendTxt');
    if (sendTxt) sendTxt.textContent = 'Sent ✓ Thank you';
    e.target.reset();
  });
}

// ---------- Projects slider ----------
(function () {
  const slides = document.getElementById('slides');
  if (!slides) return;

  const items = [...slides.children];
  const total = items.length;
  const cnt = document.getElementById('sCount');
  const prog = document.getElementById('sProg');
  let i = 0;
  let startX = 0;
  let dx = 0;
  let drag = false;

  const step = () => items[0].offsetWidth + 26;

  function go(n) {
    i = Math.max(0, Math.min(total - 1, n));
    slides.style.transform = `translateX(${-i * step()}px)`;
    items.forEach((s, k) => s.classList.toggle('act', k === i));

    if (cnt) {
      cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    if (prog) {
      prog.style.width = ((i + 1) / total * 100) + '%';
    }
  }

  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  if (nextBtn) nextBtn.onclick = () => go(i + 1);
  if (prevBtn) prevBtn.onclick = () => go(i - 1);

  addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  });

  const sl = document.getElementById('slider');
  if (sl) {
    sl.addEventListener('pointerdown', (e) => {
      drag = true;
      startX = e.clientX;
      dx = 0;
      slides.classList.add('drag');
    });

    addEventListener('pointermove', (e) => {
      if (!drag) return;
      dx = e.clientX - startX;
      slides.style.transform = `translateX(${-i * step() + dx}px)`;
    });

    addEventListener('pointercancel', () => {
      if (!drag) return;
      drag = false;
      slides.classList.remove('drag');
      go(i);
    });

    addEventListener('pointerup', () => {
      if (!drag) return;
      drag = false;
      slides.classList.remove('drag');
      go(Math.abs(dx) > 70 ? (dx < 0 ? i + 1 : i - 1) : i);
    });

    if (isHoverable && cur) {
      sl.addEventListener('mouseenter', () => {
        cur.classList.add('big');
        curTxt.textContent = 'DRAG';
      });

      sl.addEventListener('mouseleave', () => cur.classList.remove('big'));
    }
  }

  addEventListener('resize', () => go(i));
  go(0);

  setInterval(() => {
    if (!drag && !document.hidden && sl && !sl.matches(':hover')) {
      go(i === total - 1 ? 0 : i + 1);
    }
  }, 5000);
})();

// ---------- Timeline fill on scroll ----------
(function () {
  const tl = document.getElementById('tl');
  if (!tl) return;

  const fill = document.getElementById('tlFill');
  const its = [...tl.querySelectorAll('.tl-item')];

  function upd() {
    if (document.hidden) return;

    const r = tl.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));

    if (fill) fill.style.height = (p * 100) + '%';
    its.forEach((it) => {
      it.classList.toggle('on', it.getBoundingClientRect().top < mid);
    });
  }

  addEventListener('scroll', upd, { passive: true });
  upd();
})();

// ---------- Marquee 2 (opposite direction) ----------
(function () {
  const t = document.getElementById('track2');
  if (!t) return;

  let p = 0;
  let ls = scrollY;

  (function f() {
    if (!document.hidden) {
      const d = scrollY - ls;
      ls = scrollY;
      p += reduce ? 0 : (1 + Math.abs(d) * 0.5) * (d < 0 ? -1 : 1) * 0.8;
      const w = t.scrollWidth / 2;

      if (p >= w) p -= w;
      if (p < 0) p += w;
      t.style.transform = `translateX(${-w + p}px)`;
    }
    requestAnimationFrame(f);
  })();
})();

document.querySelectorAll('.step,.tl-item,.work-head,.slider-foot').forEach((el, i) => {
  el.classList.add('rv');
  el.style.transitionDelay = (i % 4) * 0.1 + 's';
  io.observe(el);
});

// ---------- Mobile menu ----------
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

function toggleMenu(open) {
  if (!burger || !menu) return;

  burger.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  document.body.classList.toggle('noscroll', open);
  burger.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-hidden', !open);
}

if (burger) {
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
}

if (menu) {
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => toggleMenu(false));
  });
}

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleMenu(false);
});

addEventListener('resize', () => {
  if (innerWidth > 850) toggleMenu(false);
});
