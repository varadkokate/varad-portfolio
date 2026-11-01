/* =============================================================
   main.js — builds the whole site from config.js.
   To update CONTENT, edit config.js only.

   Features: Lenis smooth scroll · hash router with wipe transition ·
   dark/light theme · custom cursor · 3D tilt cards · lazy Three.js hero
   (hero3d.js) · skill marquee · live GitHub stats · validated contact form
   ============================================================= */
(() => {
  'use strict';

  const P = window.PORTFOLIO;
  if (!P) { console.error('config.js did not load — PORTFOLIO is missing.'); return; }

  /* ── Helpers ─────────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const rootEl = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)');

  const esc = (v = '') => String(v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const rv  = i => `style="--d:${i % 4}"`;                       // reveal stagger
  const idle = cb => ('requestIdleCallback' in window)
    ? window.requestIdleCallback(cb, { timeout: 2000 })
    : setTimeout(cb, 400);
  const isExternal = href => /^https?:/i.test(href);

  /* ── Theme (dark / light) ────────────────────────────────── */
  const currentTheme = () => (rootEl.dataset.theme === 'light' ? 'light' : 'dark');

  function applyTheme(theme, persist = true) {
    rootEl.dataset.theme = theme;
    $('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fbf6ec' : '#0a0f1c');
    const btn = $('#themeToggle');
    if (btn) btn.setAttribute('aria-checked', String(theme === 'light'));
    if (persist) { try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ } }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    applyTheme(currentTheme(), false);               // sync toggle state with the pre-paint value
    $('#themeToggle')?.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !reduceMotion.matches) {
        document.startViewTransition(() => applyTheme(next));   // smooth crossfade
      } else {
        applyTheme(next);
      }
    });
  }

  /* ── Smooth scroll (Lenis) ───────────────────────────────── */
  let lenis = null;

  function initLenis() {
    if (typeof window.Lenis === 'undefined' || reduceMotion.matches) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  };

  /* ── Wipe transition ─────────────────────────────────────── */
  const wipeEl = $('#wipe');
  const wipeLayers = wipeEl ? $$('.wipe__layer', wipeEl) : [];
  let isTransitioning = false;

  function playWipe(callback) {
    if (!wipeEl || !wipeLayers.length || reduceMotion.matches || isTransitioning) { callback(); return; }
    isTransitioning = true;
    wipeEl.style.visibility = 'visible';

    wipeLayers.forEach(l => { l.style.transition = 'none'; l.style.clipPath = 'inset(100% 0% 0%)'; });
    void wipeEl.offsetHeight;                          // force reflow so the transition runs

    wipeLayers.forEach((l, i) => {
      l.style.transition = `clip-path ${0.55 + i * 0.07}s cubic-bezier(.16,1,.3,1) ${i * 0.06}s`;
      l.style.clipPath = 'inset(0% 0% 0%)';
    });

    setTimeout(() => {
      callback();
      setTimeout(() => {
        wipeLayers.forEach((l, i) => {
          l.style.transition = `clip-path ${0.5 + i * 0.06}s cubic-bezier(.7,0,.84,0) ${i * 0.05}s`;
          l.style.clipPath = 'inset(0% 0% 100%)';
        });
        setTimeout(() => {
          wipeEl.style.visibility = 'hidden';
          wipeLayers.forEach(l => { l.style.transition = 'none'; l.style.clipPath = 'inset(100% 0% 0%)'; });
          isTransitioning = false;
        }, 700);
      }, 60);
    }, 560);
  }

  /* ── Router (hash based) ─────────────────────────────────── */
  const pages = $$('[data-page-id]');
  const PAGE_IDS = new Set(pages.map(p => p.dataset.pageId));
  const navAnchors = $$('.nav__link, .menu__link');
  const BASE_TITLE = document.title;
  let currentPage = '';

  const pageFromHash = () => {
    const h = location.hash.replace('#', '');
    return h === '' ? 'home' : (PAGE_IDS.has(h) ? h : null);
  };

  function showPage(id, { focus = true } = {}) {
    currentPage = id;
    pages.forEach(p => { p.hidden = p.dataset.pageId !== id; });
    navAnchors.forEach(a => {
      const on = a.dataset.page === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = id === 'home' ? BASE_TITLE : `${id.charAt(0).toUpperCase() + id.slice(1)} — Varad Kokate`;
    scrollToTop();
    observeReveals();
    if (focus) $(`[data-page-id="${id}"] h1`)?.focus({ preventScroll: true });   // screen-reader context
    window.dispatchEvent(new CustomEvent('pagechange', { detail: { id } }));
  }

  function navigate(id) {
    playWipe(() => { location.hash = id; showPage(id); });
  }

  function initRouter() {
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;

      if (a.classList.contains('skip-link')) {         // "#main" is not a page
        e.preventDefault();
        const main = $('#main');
        main?.setAttribute('tabindex', '-1');
        main?.focus();
        return;
      }
      const id = a.getAttribute('href').slice(1);
      if (!PAGE_IDS.has(id)) return;

      e.preventDefault();
      setMenu(false, { restoreFocus: false });
      if (id === currentPage) { scrollToTop(); return; }
      navigate(id);
    });

    window.addEventListener('hashchange', () => {      // back / forward buttons
      const id = pageFromHash();
      if (id && id !== currentPage) playWipe(() => showPage(id));
    });

    showPage(pageFromHash() || 'home', { focus: false });
  }

  /* ── Mobile menu ─────────────────────────────────────────── */
  const burger = $('#burger');
  const menu = $('#mobileMenu');

  function setMenu(open, { restoreFocus = true } = {}) {
    if (!burger || !menu) return;
    if (menu.classList.contains('is-open') === open) return;
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    rootEl.classList.toggle('menu-open', open);
    const main = $('#main'); const footer = $('.footer');
    if (main) main.inert = open;                       // keep Tab inside nav + menu while open
    if (footer) footer.inert = open;
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open) $('.menu__link', menu)?.focus({ preventScroll: true });
    else if (restoreFocus) burger.focus({ preventScroll: true });
  }

  function initMenu() {
    burger?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open'), { restoreFocus: false }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 761px)').addEventListener('change', e => {
      if (e.matches) setMenu(false, { restoreFocus: false });
    });
  }

  /* ── Custom cursor ───────────────────────────────────────── */
  function initCursor() {
    if (!finePointer.matches || reduceMotion.matches) return;   // touch & reduced-motion keep the native cursor
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    if (!cursor || !dot || !ring) return;

    rootEl.dataset.cursor = 'custom';
    cursor.classList.add('cursor--hidden');
    const stage = $('#heroStage');

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, started = false;

    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!started) { started = true; rx = mx; ry = my; cursor.classList.remove('cursor--hidden'); }
      if (stage && stage.offsetParent !== null) {                // hovering over the 3D stage
        const r = stage.getBoundingClientRect();
        cursor.classList.toggle('cursor--stage', mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom);
      } else {
        cursor.classList.remove('cursor--stage');
      }
    }, { passive: true });

    document.addEventListener('mousedown', () => ring.classList.add('is-down'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-down'));

    /* delegated, so it also works for cards that are built later */
    document.addEventListener('mouseover', e => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const labelEl = t.closest('[data-cursor-label]');
      const textEl  = t.closest('input, textarea, select');
      const hoverEl = t.closest('a, button, [role="button"], [role="switch"], summary, label, [data-cursor-hover]');
      cursor.classList.toggle('cursor--text',  !!textEl);
      cursor.classList.toggle('cursor--label', !!labelEl && !textEl);
      cursor.classList.toggle('cursor--hover', !!hoverEl && !labelEl && !textEl);
      if (label) label.textContent = labelEl ? labelEl.dataset.cursorLabel : '';
    });
    rootEl.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'));
    rootEl.addEventListener('mouseenter', () => { if (started) cursor.classList.remove('cursor--hidden'); });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform  = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── 3D tilt cards (mouse only) ──────────────────────────── */
  function initTilt() {
    if (!finePointer.matches || reduceMotion.matches) return;
    let active = null, raf = 0, px = 0, py = 0;

    const reset = el => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    const apply = el => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = (px - r.left) / r.width;
      const y = (py - r.top) / r.height;
      const max = parseFloat(el.dataset.tilt) || 8;
      el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    };

    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target instanceof Element ? e.target.closest('[data-tilt]') : null;
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => apply(el));
    }, { passive: true });

    rootEl.addEventListener('mouseleave', () => { if (active) reset(active); active = null; });
  }

  /* ── Scroll reveal ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function observeReveals() {
    $$('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
  }

  /* ── Rotating words ──────────────────────────────────────── */
  function initRotword() {
    const container = $('#rotword');
    const words = P.rotatingWords || [];
    if (!container || !words.length) return;
    container.innerHTML = words
      .map((w, i) => `<span class="rotword__item"${i > 0 ? ' aria-hidden="true"' : ''}>${esc(w)}</span>`)
      .join('');
    if (reduceMotion.matches || words.length < 2) return;

    const items = $$('.rotword__item', container);
    let cur = 0;
    setInterval(() => {
      items[cur].style.opacity = '0';
      items[cur].style.transform = 'rotateX(90deg)';
      cur = (cur + 1) % items.length;
      items[cur].style.opacity = '1';
      items[cur].style.transform = 'rotateX(0)';
    }, 2200);
  }

  /* ── Home marquee (big words) ────────────────────────────── */
  function buildMarquee() {
    const track = $('#marqueeTrack');
    if (!track) return;
    const words = P.marqueeWords || [];
    track.innerHTML = [...words, ...words].map(w =>
      `<span class="marquee__word ${w.outline ? 'is-outline' : 'is-filled'}">${esc(w.text)}<span class="marquee__sep" aria-hidden="true">✦</span></span>`
    ).join('');
    track.classList.add('is-animating');
  }

  /* ── Skills marquee (two rows, opposite directions) ──────── */
  function buildSkillMarquee() {
    const host = $('#skillMarquee');
    if (!host) return;
    const accentOf = {};
    (P.skillGroups || []).forEach(g => g.pills.forEach(name => {
      if (!(name in accentOf)) accentOf[name] = g.accent || '';
    }));
    const names = Object.keys(accentOf);
    if (!names.length) return;

    const chip = n => `<span class="mq__chip${accentOf[n] ? ' mq__chip--' + accentOf[n] : ''}"><i></i>${esc(n)}</span>`;
    const rows = [names.filter((_, i) => i % 2 === 0), names.filter((_, i) => i % 2 === 1)];
    host.innerHTML = rows.filter(r => r.length).map((row, i) =>
      `<div class="mq__row${i ? ' mq__row--rev' : ''}"><div class="mq__track" data-base="${esc(row.map(chip).join(''))}"></div></div>`
    ).join('');
    fillSkillMarquee();
  }

  /* Repeat each row until it is wider than its container, then double it so the
     -50% loop is seamless on any screen (needs layout, so it re-runs on show/resize). */
  function fillSkillMarquee() {
    $$('#skillMarquee .mq__track').forEach(track => {
      const base = track.dataset.base;
      const hostW = track.parentElement.clientWidth;
      if (!base || !hostW) return;                     // page hidden: try again when shown
      track.innerHTML = base;
      const setW = track.scrollWidth;
      if (!setW) return;
      const reps = Math.max(1, Math.ceil(hostW / setW));
      const half = base.repeat(reps);
      track.innerHTML = half + half;
      track.style.animationDuration = `${Math.max(25, Math.round((setW * reps) / 55))}s`;
    });
  }

  function initSkillMarqueeLayout() {
    let t;
    const refill = () => { clearTimeout(t); t = setTimeout(fillSkillMarquee, 150); };
    window.addEventListener('resize', refill);
    window.addEventListener('pagechange', e => { if (e.detail.id === 'skills') refill(); });
    if (document.fonts?.ready) document.fonts.ready.then(refill);
  }

  /* ── Builders ────────────────────────────────────────────── */
  function buildHome() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('heroFirst', P.name.first);
    set('heroLast', P.name.last);
    set('heroFocus', P.focus);
    set('heroEyebrow', P.eyebrow);
    set('heroBio', P.about.bio);

    const statsEl = $('#statsList');
    if (statsEl) {
      statsEl.innerHTML = P.stats.map((s, i) => `
        <li class="stat reveal" data-tilt="8" ${rv(i)}>
          <span class="stat__value">${esc(s.value)}</span>
          <span class="stat__label">${esc(s.label)}</span>
        </li>`).join('');
    }

    const hl = $('#highlights');
    if (hl) {
      hl.innerHTML = P.about.highlights.map((h, i) => `
        <div class="highlight reveal" ${rv(i)}>
          <span class="highlight__icon" aria-hidden="true">${h.icon}</span>
          <div>
            <div class="highlight__title">${esc(h.title)}</div>
            <div class="highlight__text">${esc(h.text)}</div>
          </div>
        </div>`).join('');
    }

    const feat = $('#featuredProjects');
    if (feat) {
      feat.innerHTML = P.projects.slice(0, 3).map((pr, i) => `
        <li class="card card--${esc(pr.accent)} reveal" data-tilt="9" data-cursor-label="View" ${rv(i)}>
          <a class="card__link" href="#projects">
            <span class="card__no" aria-hidden="true">${esc(pr.no)}</span>
            <span class="card__kind">${esc(pr.kind)}</span>
            <h3 class="card__title">${esc(pr.title)}</h3>
            <p class="card__summary">${esc(pr.summary)}</p>
            <p class="card__stat"><strong>${esc(pr.stat.value)}</strong>${esc(pr.stat.label)}</p>
          </a>
        </li>`).join('');
    }
  }

  function buildProjects() {
    const grid = $('#projectsGrid');
    if (!grid) return;
    grid.innerHTML = P.projects.map((pr, i) => `
      <li class="grid-card grid-card--${esc(pr.accent)} reveal" data-tilt="7" ${rv(i)}>
        <div class="grid-card__top">
          <span class="grid-card__no" aria-hidden="true">${esc(pr.no)}</span>
          <span class="grid-card__kind">${esc(pr.kind)}</span>
        </div>
        <h3 class="grid-card__title">${esc(pr.title)}</h3>
        <p class="grid-card__summary">${esc(pr.summary)}</p>
        <ul class="story" role="list">
          ${pr.bullets.map((b, n) => `
            <li style="--s-accent: var(--${esc(pr.accent)})">
              <span class="story__no">${pad(n + 1)}</span>
              <p>${esc(b)}</p>
            </li>`).join('')}
        </ul>
        <p class="grid-card__tech">${esc(pr.tech)}</p>
        ${pr.link ? `<a class="link-arrow" href="${esc(pr.link)}" target="_blank" rel="noopener noreferrer">View Project →</a>` : ''}
      </li>`).join('');
  }

  function buildExperience() {
    const list = $('#timelineList');
    if (!list) return;
    const badgeLabel = { work: 'Work', current: 'Current', edu: 'Education' };
    list.innerHTML = P.timeline.map((t, i) => `
      <li class="reveal" data-tilt="2.5" ${rv(i)}>
        <div class="timeline-inner">
          <span class="timeline__date">${esc(t.date)}</span>
          <div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.org)}</p>
            ${t.desc ? `<p>${esc(t.desc)}</p>` : ''}
            ${t.bullets.length ? `<ul class="timeline__bullets" role="list">${t.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
          </div>
          <span class="timeline__badge timeline__badge--${esc(t.badge)}">${badgeLabel[t.badge] || esc(t.badge)}</span>
        </div>
      </li>`).join('');
  }

  function buildSkills() {
    const groups = $('#skillGroups');
    if (groups) {
      groups.innerHTML = P.skillGroups.map((g, i) => `
        <li class="skill-group${g.accent ? ' skill-group--' + esc(g.accent) : ''} reveal" data-tilt="6" ${rv(i)}>
          <div class="skill-group__header">
            <span class="skill-group__glyph" aria-hidden="true">${g.glyph}</span>
            <h3 class="skill-group__name">${esc(g.name)}</h3>
          </div>
          <p class="muted">${esc(g.desc)}</p>
          <ul class="pills" role="list">${g.pills.map(p => `<li class="pill">${esc(p)}</li>`).join('')}</ul>
        </li>`).join('');
    }
    const strengths = $('#strengthsList');
    if (strengths) {
      strengths.innerHTML = P.strengths.map((s, i) =>
        `<li class="strength-item reveal" ${rv(i)}><span aria-hidden="true">${s.icon}</span>${esc(s.label)}</li>`
      ).join('');
    }
  }

  function buildContact() {
    const c = P.contact;
    const set  = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const href = (id, v) => { const el = document.getElementById(id); if (el) el.href = v; };
    set('contactEmail', c.email);
    href('contactEmailLink', `mailto:${c.email}`);
    set('contactPhone', c.phone);
    set('contactLocation', c.location);
    href('contactLinkedin', c.linkedin);
    href('contactGithub', c.github);
  }

  function buildFooter() {
    const f = P.footer;
    const copy = $('#footerCopy');
    const links = $('#footerLinks');
    if (copy) copy.textContent = `© ${new Date().getFullYear()} ${f.copy}`;
    if (links) {
      links.innerHTML = f.links.map(l => isExternal(l.href)
        ? `<li><a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a></li>`
        : `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`
      ).join('');
    }
  }

  function buildNav() {
    const mark = $('#navMark');
    if (mark) {
      mark.textContent = '';
      mark.insertAdjacentHTML('beforeend',
        `${esc(P.name.first.charAt(0))}<span class="nav__dot">.</span>${esc(P.name.last.charAt(0))}`);
    }
  }

  /* ── 3D hero (lazy) ──────────────────────────────────────── */
  function initHero3D() {
    const stage = $('#heroStage');
    const host = $('#heroCanvas');
    if (!stage || !host) return;
    if (navigator.connection && navigator.connection.saveData) return;   // respect Data Saver → CSS orb stays

    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      import('./hero3d.js')
        .then(mod => {
          const scene = mod.createHeroScene(host, {
            theme: currentTheme(),
            reducedMotion: reduceMotion.matches,
            onLost: () => stage.classList.remove('is-3d')
          });
          stage.classList.add('is-3d');
          window.addEventListener('themechange', e => scene.setTheme(e.detail.theme));
        })
        .catch(err => console.warn('3D hero unavailable — showing the CSS orb instead.', err));
    };

    /* Only start once the hero is actually on screen, and only when the browser is idle. */
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); idle(load); }
    });
    io.observe(stage);
  }

  /* ── Live GitHub stats ───────────────────────────────────── */
  const GH_TTL = 15 * 60 * 1000;

  async function cached(key, loader) {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) { const { t, v } = JSON.parse(raw); if (Date.now() - t < GH_TTL) return v; }
    } catch (e) { /* ignore */ }
    const v = await loader();
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch (e) { /* ignore */ }
    return v;
  }
  const getJSON = async url => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  const timeAgo = iso => {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    const units = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']];
    for (const [n, l] of units) if (s >= n) return `${Math.floor(s / n)}${l} ago`;
    return 'just now';
  };

  async function loadGitHub() {
    const user = P.github && P.github.username;
    const section = $('#githubSection');
    const box = $('#githubStats');
    if (!section || !box) return;
    if (!user) { section.hidden = true; return; }

    const API = `https://api.github.com/users/${encodeURIComponent(user)}`;
    try {
      const [profile, events, repos, heat] = await Promise.allSettled([
        cached('gh:profile', () => getJSON(API)),
        cached('gh:events',  () => getJSON(`${API}/events/public?per_page=100`)),
        cached('gh:repos',   () => getJSON(`${API}/repos?sort=pushed&per_page=1`)),
        cached('gh:heat',    () => getJSON(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`))
      ]);
      if (profile.status !== 'fulfilled') throw new Error('profile failed');

      const prof = profile.value;
      const ev = events.status === 'fulfilled' && Array.isArray(events.value) ? events.value : [];
      const pushes = ev.filter(e => e.type === 'PushEvent').length;
      const lastEvent = ev[0] && ev[0].created_at;
      const lastRepo = repos.status === 'fulfilled' && repos.value[0];

      const stats = [
        { v: prof.public_repos, l: 'Public repos' },
        { v: prof.followers,    l: 'Followers' },
        { v: pushes,            l: 'Recent pushes' },
        { v: lastEvent ? timeAgo(lastEvent) : (lastRepo ? timeAgo(lastRepo.pushed_at) : '—'), l: 'Last activity' }
      ];

      let heatHTML = '';
      if (heat.status === 'fulfilled' && Array.isArray(heat.value.contributions) && heat.value.contributions.length) {
        const days = heat.value.contributions.slice(-182);               // ~26 weeks
        const lead = new Date(days[0].date + 'T00:00:00Z').getUTCDay();  // align first column to Sunday
        const total = days.reduce((n, d) => n + (d.count || 0), 0);
        const cells = Array.from({ length: lead }, () => '<i class="gh__cell" data-empty></i>').join('') +
          days.map(d => `<i class="gh__cell" data-l="${d.level || 0}" title="${esc(d.date)}: ${d.count || 0}"></i>`).join('');
        heatHTML = `
          <div class="gh__heat-wrap">
            <p class="gh__heat-title">${total} contributions · last 26 weeks</p>
            <div class="gh__heat" role="img" aria-label="Contribution activity over the last 26 weeks: ${total} contributions">${cells}</div>
          </div>`;
      }

      box.innerHTML = `
        <ul class="gh__stats" role="list">
          ${stats.map((s, i) => `<li class="gh__stat reveal" ${rv(i)}><span class="gh__value">${esc(s.v)}</span><span class="gh__label">${esc(s.l)}</span></li>`).join('')}
        </ul>
        ${heatHTML}
        <p class="gh__foot">
          <a class="link-arrow" href="https://github.com/${encodeURIComponent(user)}" target="_blank" rel="noopener noreferrer">@${esc(user)} on GitHub ↗</a>
          <span>Live data · refreshed every 15 min</span>
        </p>`;
      observeReveals();
    } catch (err) {
      console.warn('GitHub stats unavailable:', err);
      section.hidden = true;                                             // fail silently, no broken box
    }
  }

  function initGitHub() {
    const section = $('#githubSection');
    if (!section) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadGitHub(); }
    }, { rootMargin: '200px' });
    io.observe(section);
  }

  /* ── Contact form ────────────────────────────────────────── */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const wrap = form.closest('.form-wrap');
    const status = $('#formStatus');
    const submit = $('#formSubmit');
    const fields = { name: $('#fname'), email: $('#femail'), message: $('#fmsg') };

    const rules = {
      name:    v => v.trim().length >= 2 ? '' : 'Please enter your name.',
      email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
      message: v => v.trim().length >= 10 ? '' : 'Please write at least a short sentence (10+ characters).'
    };
    const check = key => {
      const msg = rules[key](fields[key].value);
      fields[key].setAttribute('aria-invalid', String(!!msg));
      const err = document.getElementById(`err-${key}`);
      if (err) err.textContent = msg;
      return !msg;
    };
    Object.keys(fields).forEach(k => {
      fields[k].addEventListener('blur', () => check(k));
      fields[k].addEventListener('input', () => { if (fields[k].getAttribute('aria-invalid') === 'true') check(k); });
    });

    const setStatus = (text, isError = false) => {
      status.textContent = text;
      status.classList.toggle('is-error', isError);
    };
    const showSuccess = (title, text) => {
      $('#thanksTitle').textContent = title;
      $('#thanksText').textContent = text;
      wrap.classList.add('is-sent');
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const results = Object.keys(fields).map(k => [k, check(k)]);
      const firstBad = results.find(([, ok]) => !ok);
      if (firstBad) { fields[firstBad[0]].focus(); return; }

      const data = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        message: fields.message.value.trim()
      };
      const endpoint = P.contact.formEndpoint;

      if (endpoint) {                                   // real delivery (Formspree etc.)
        submit.disabled = true;
        setStatus('Sending…');
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          form.reset();
          setStatus('');
          showSuccess('Message sent!', 'Thanks for reaching out. I will get back to you soon.');
        } catch (err) {
          setStatus(`Sorry, that didn't go through. Please email me directly at ${P.contact.email}.`, true);
        } finally {
          submit.disabled = false;
        }
        return;
      }

      /* No endpoint configured → hand the message to the visitor's email app (never fake "sent"). */
      const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
      window.location.href = `mailto:${P.contact.email}?subject=${subject}&body=${body}`;
      showSuccess('Almost there!', 'Your email app should now open with the message ready. Just press send.');
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    initTheme();
    initLenis();
    buildNav();
    buildHome();
    buildProjects();
    buildExperience();
    buildSkills();
    buildContact();
    buildFooter();
    buildMarquee();
    buildSkillMarquee();
    initSkillMarqueeLayout();
    initRotword();
    initMenu();
    initRouter();
    initCursor();
    initTilt();
    initForm();
    initHero3D();
    initGitHub();
    observeReveals();
  }

  init();
})();
