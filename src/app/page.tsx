// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { ErrorState, Loading } from '@/components/ui/State';
import { contentApi } from '@/lib/api/endpoints';
import type { Home } from '@/lib/api/types';
import { prize } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

/** Hero character art bundled with the frontend, keyed by game slug (value = CSS modifier class). */
const HERO_ART: Record<string, string> = { fortnite: 'fortnite', valorant: 'valorant', 'apex-legends': 'apexlegends' };

export default function TitanPage() {
  const home = useApi(contentApi.home);
  if (home.loading) return <Loading />;
  if (!home.data) return <ErrorState error={home.error} onRetry={home.reload} />;
  return <HomeScene data={home.data} />;
}

function buildSceneData(data: Home) {
  const slides = data.heroTournaments.map(t => ({
    title: t.game.title,
    desc: `${t.title} — جایزه ${prize(t.prizePool, t.prizeCurrency)}`,
    watch: t.viewerCount,
    eta: Math.max(0, (new Date(t.startsAt).getTime() - Date.now()) / 1000),
    art: HERO_ART[t.game.slug] ? `/images/hero/characters/${HERO_ART[t.game.slug]}.png` : t.coverImage,
    artClass: HERO_ART[t.game.slug] ?? '',
    href: `/tournaments/${t.slug}`,
  }));
  return {
    slides: slides.length
      ? slides
      : [{ title: 'تایتان', desc: 'تورنمنت‌های جدید به‌زودی منتشر می‌شوند.', watch: 0, eta: 0, art: null, artClass: '', href: '/tournaments' }],
    games: data.categories.map((g, i) => {
      const art = HERO_ART[g.slug];
      return {
        t: g.title,
        d: g.description,
        p: 'مشاهده',
        theme: ['noir', 'flame', 'mist', 'neon', 'ice', 'ember'][i % 6],
        fig: 'game',
        crest: i % 2 === 0,
        slug: g.slug,
        bg: g.slug === 'premium' ? '/images/games/premium.png' : (art ? `/images/games/${art}-background.png` : (g.backgroundImage ?? g.coverImage)),
        char: g.slug === 'premium' ? null : (art ? `/images/games/${art}-character.png` : g.characterImage),
      };
    }),
    stats: data.myStats,
    announcements: data.announcements,
  };
}

function HomeScene({ data }: { data: Home }) {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (window as any).__TITAN_DATA = buildSceneData(data);

    // --- Titan Prototype Logic ---
    const cleanupFuncs: (() => void)[] = [];

    (() => {
      'use strict';
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      const originalRaf = window.requestAnimationFrame;
      const timeouts: NodeJS.Timeout[] = [];
      const intervals: NodeJS.Timeout[] = [];
      const rafs: number[] = [];
      const setTimeout = (fn: any, ms?: number) => { const id = originalSetTimeout(fn, ms); timeouts.push(id as any); return id as unknown as ReturnType<typeof window.setTimeout>; };
      const setInterval = (fn: any, ms?: number) => { const id = originalSetInterval(fn, ms); intervals.push(id as any); return id as unknown as ReturnType<typeof window.setInterval>; };
      const requestAnimationFrame = (fn: any) => { const id = originalRaf(fn); rafs.push(id); return id; };
      cleanupFuncs.push(() => {
        timeouts.forEach(clearTimeout);
        intervals.forEach(clearInterval);
        rafs.forEach(cancelAnimationFrame);
      });

      /* =====================================================
         Config — change these
         ===================================================== */
      const CONFIG = {
        userName: 'طاها',   // shown in the greeting
        slideMs: 6500         // hero auto-rotation time
      };

      /* =====================================================
         Helpers
         ===================================================== */
      const $ = (s, r = document) => r.querySelector(s);
      const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rand = (a, b) => Math.random() * (b - a) + a;
      const pickOne = a => a[Math.floor(Math.random() * a.length)];
      const fmt = n => Math.round(n).toLocaleString('en-US');
      const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const frame = $('#frame');

      /* =====================================================
         Icons  ([svg-inner, filled?])
         ===================================================== */
      const I = {
        flame: ['<path d="M12 3c.6 3.4 4.8 5 4.8 9.6a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.2 2-4.2.1 1.5.9 2.5 2 2.7C11 8.6 10.8 5.6 12 3z"/>'],
        chev: ['<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'],
        bag: ['<path d="M5 8.5h14l-1 11.5H6z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'],
        chat: ['<path d="M4 5.5h16v11H10l-4.5 4v-4H4z"/><path d="M8 10h8M8 13h5"/>'],
        like: ['<path d="M2.5 10.5h4v10h-4z"/><path d="M6.5 10.5 10.5 3c1.9 0 3 1.4 2.6 3.3L12.4 9.5h6.3a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.5H6.5z"/>', true],
        shield: ['<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'],
        trophy: ['<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a1.5 1.5 0 0 0 0 3H8M16 6h2.5a1.5 1.5 0 0 1 0 3H16"/><path d="M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/>'],
        arrow: ['<path d="M4 12h15.5M13.5 6l6 6-6 6"/>']
      };
      const ico = name => {
        const [inner, filled] = I[name] || ['', false];
        return `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
      };
      const paint = (root = document) => $$('[data-icon]', root).forEach(el => { if (!el.childElementCount) el.innerHTML = ico(el.dataset.icon); });


      /* =====================================================
         Hero key art (SVG). Replace with your own <img> per slide
         ===================================================== */
      const heroArt = k => (SLIDES[k].art ? `<img src="${esc(SLIDES[k].art)}" class="hero-char ${SLIDES[k].artClass}" alt="" />` : '');

      /* =====================================================
         Data
         ===================================================== */
      const SLIDES = window.__TITAN_DATA.slides;



      const GAMES = window.__TITAN_DATA.games;

      const THEME = {
        noir: { a: '#120c14', b: '#3a2a30', glow: '#c98d92', fig: '#08050a' },
        flame: { a: '#7d2410', b: '#f27a20', glow: '#ffd58a', fig: '#3a1508' },
        mist: { a: '#2e1216', b: '#6b323a', glow: '#e0a3a8', fig: '#1b070b' },
        neon: { a: '#160f3a', b: '#6b33d6', glow: '#ff6ab0', fig: '#0b0722' },
        ice: { a: '#0f2436', b: '#2f86b8', glow: '#c6ecff', fig: '#06131f' },
        ember: { a: '#3a0e28', b: '#cf3f5c', glow: '#ffb9a6', fig: '#1a0512' }
      };

      const HRS = [
        { k: 'games', name: 'تعداد بازی‌ها', v: window.__TITAN_DATA.stats?.matches ?? 0, c: '#7458d6', fg: '#fff', bpm: 110 },
        { k: 'wins', name: 'تعداد بردها', v: window.__TITAN_DATA.stats?.wins ?? 0, c: '#fff1b8', fg: '#2b1013', bpm: 128 },
        { k: 'losses', name: 'تعداد باخت‌ها', v: window.__TITAN_DATA.stats?.losses ?? 0, c: '#d9443f', fg: '#fff', bpm: 92 }
      ];
      const GLYPH = {
        games: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 7h9A4.5 4.5 0 0 1 21 11.5v1a4.5 4.5 0 0 1-4.5 4.5h-1.2l-1.8-2h-3l-1.8 2H7.5A4.5 4.5 0 0 1 3 12.5v-1A4.5 4.5 0 0 1 7.5 7z"/><path d="M8 10v3M6.5 11.5h3"/><circle cx="15.6" cy="10.8" r=".6"/><circle cx="17.6" cy="12.6" r=".6"/></svg>',
        wins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a1.5 1.5 0 0 0 0 3H8M16 6h2.5a1.5 1.5 0 0 1 0 3H16"/><path d="M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/></svg>',
        losses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M12 5a7 7 0 0 0-7 7v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3a7 7 0 0 0-7-7z"/></svg>'
      };

      const FRIENDS = [
        { n: 'Mia', s: 'game', g: 'Valorant', seed: 3 },
        { n: 'Alex', s: 'online', seed: 8 },
        { n: 'Sara', s: 'away', seed: 14 },
        { n: 'Kian', s: 'online', seed: 19 },
        { n: 'Bita', s: 'online', seed: 25 },
        { n: 'Arman', s: 'away', seed: 30 }
      ];
      const CHATS = [
        { n: 'Squad chat', group: true, unread: true },
        { n: 'Nima', seed: 41 },
        { n: 'Leyla', seed: 47, unread: true }
      ];
      const GAMES_LIVE = ['Valorant', 'Rocket League', 'Counter-Strike 2', 'Dota 2'];

      /* =====================================================
         Toasts & Layout (Handled by React Context & Layout)
         ===================================================== */
      const toast = (window as any).titanToast || (() => { });
      const liveToast = toast;


      /* =====================================================
         Hero
         ===================================================== */
      const hero = $('#hero'), heroBody = $('#heroBody'), heroArtEl = $('#heroArt'), dashesEl = $('#dashes');
      heroArtEl.innerHTML = SLIDES.map((s, i) => `<div class="art${i === 0 ? ' on' : ''}" data-hue="${i}">${heroArt(i)}</div>`).join('');
      dashesEl.innerHTML = SLIDES.map((s, i) => `<button class="dash${i === 0 ? ' on' : ''}" aria-label="نمایش ${esc(s.title)}"><span><i></i></span></button>`).join('');
      const arts = $$('.art', heroArtEl), bgLayers = $$('.hero-bg .l'), dashes = $$('.dash', dashesEl), dashFills = $$('.dash i', dashesEl);
      SLIDES.forEach(s => s.end = Date.now() + s.eta * 1000);
      const watchEl = $('#watch'), cdEl = $('#cd');
      let cur = 0, elapsed = 0, paused = false;

      function applySlide() {
        const s = SLIDES[cur];
        $('#heroTitle').textContent = s.title;
        $('#heroDesc').textContent = s.desc;
        $('#heroLink').setAttribute('href', s.href);
        watchEl.textContent = fmt(s.watch);
        tickCountdown();
      }
      function goTo(i, first) {
        cur = i; elapsed = 0;
        arts.forEach((a, k) => a.classList.toggle('on', k === i));
        bgLayers.forEach((a, k) => a.classList.toggle('on', k === i));
        dashes.forEach((d, k) => d.classList.toggle('on', k === i));
        dashFills.forEach(f => f.style.transform = 'scaleX(0)');
        if (first || reduce) { applySlide(); return; }
        heroBody.classList.add('swap');
        setTimeout(() => { applySlide(); heroBody.classList.remove('swap'); }, 290);
      }
      dashes.forEach((d, k) => d.addEventListener('click', () => { if (k !== cur) goTo(k); }));
      ['pointerenter', 'focusin'].forEach(ev => hero.addEventListener(ev, () => paused = true));
      ['pointerleave', 'focusout'].forEach(ev => hero.addEventListener(ev, () => paused = false));

      function tickCountdown() {
        const left = Math.max(0, Math.floor((SLIDES[cur].end - Date.now()) / 1000));
        const p = n => String(n).padStart(2, '0');
        cdEl.textContent = `${p(Math.floor(left / 3600))}:${p(Math.floor(left % 3600 / 60))}:${p(left % 60)}`;
      }
      setInterval(tickCountdown, 1000);



      /* =====================================================
         New Games carousel
         ===================================================== */
      function cardArt(g, idx) {
        if (g.bg || g.char) {
          return `
            ${g.bg ? `<img src="${esc(g.bg)}" alt="${esc(g.t)}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; opacity:0.85;" />` : ''}
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(10,5,15,0.95) 0%, rgba(10,5,15,0.3) 50%, transparent 100%); z-index:2;"></div>
            ${g.char ? `<img src="${esc(g.char)}" alt="${esc(g.t)}" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:100%; height:95%; object-fit:contain; object-position:bottom; z-index:3; pointer-events:none;" />` : ''}
          `;
        }
        const t = THEME[g.theme], id = 'c' + idx;
        let topo = '';
        for (let i = 1; i <= 6; i++) topo += `<ellipse cx="${60 + (idx * 13) % 40}" cy="70" rx="${i * 24}" ry="${i * 16}" fill="none" stroke="${t.glow}" stroke-opacity="${(0.24 - i * 0.03).toFixed(2)}" transform="rotate(${-20 + idx * 9} 100 110)"/>`;
        let fig;
        if (g.fig === 'headset') {
          fig = `<path d="M52 128a48 48 0 0 1 96 0" fill="none" stroke="${t.fig}" stroke-width="9" stroke-linecap="round"/><rect x="40" y="120" width="22" height="42" rx="10" fill="${t.fig}"/><rect x="138" y="120" width="22" height="42" rx="10" fill="${t.fig}"/><path d="M50 158q0 20 30 22" stroke="${t.fig}" fill="none" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="181" r="5" fill="${t.glow}"/>`;
        } else if (g.fig === 'keyboard') {
          let k = '';
          for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) k += `<rect x="${26 + c * 16}" y="${112 + r * 17}" width="12" height="12" rx="3" fill="${t.glow}" opacity="${(0.25 + ((r * 9 + c) % 5) * 0.12).toFixed(2)}"/>`;
          fig = `<rect x="16" y="102" width="168" height="80" rx="14" fill="${t.fig}" transform="rotate(-8 100 142)"/><g transform="rotate(-8 100 142)">${k}</g>`;
        } else {
          fig = `${g.crest ? `<path d="M80 100l6-34 10 24 8-30 8 30 10-24 6 34z" fill="${t.glow}" opacity=".85"/>` : ''}<circle cx="100" cy="112" r="24" fill="${t.fig}"/><path d="M40 230c2-46 26-74 60-74s58 28 60 74z" fill="${t.fig}"/>`;
        }
        return `<svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient>
      <radialGradient id="${id}g"><stop offset="0" stop-color="${t.glow}" stop-opacity=".75"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="200" height="220" fill="url(#${id}b)"/>
    ${topo}
    <circle cx="150" cy="52" r="46" fill="url(#${id}g)"/>
    ${fig}
  </svg>`;
      }

      const sc = $('#scroller');
      sc.innerHTML = GAMES.map((g, i) => `
  <article class="gcard spot${i === 3 ? ' feat' : ''}" data-i="${i}" style="--d:${i}">
    <div class="gart">${cardArt(g, i)}</div>
    <div class="gbody">
      <h4>${esc(g.t)}</h4>
      <div class="gdesc"><p>${esc(g.d)}</p><button class="gbtn-view" data-view="${i}">${esc(g.p)}</button></div>
    </div>
  </article>`).join('');

      /* 3D tilt */
      if (matchMedia('(pointer:fine)').matches && !reduce) {
        $$('.gcard', sc).forEach(card => {
          card.addEventListener('pointermove', e => {
            if (sc.classList.contains('drag')) return;
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            card.style.transition = 'transform .1s ease-out, box-shadow .4s';
            card.style.transform = `perspective(800px) rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateY(-6px) scale(1.035)`;
          });
          card.addEventListener('pointerleave', () => { card.style.transition = ''; card.style.transform = ''; });
        });
      }

      /* drag to scroll + click handling */
      let dragging = false, dragMoved = false, startX = 0, startL = 0;
      sc.addEventListener('pointerdown', e => {
        if (e.pointerType === 'touch' || e.target.closest('button')) return;
        dragging = true; dragMoved = false; startX = e.clientX; startL = sc.scrollLeft;
      });
      addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) { dragMoved = true; sc.classList.add('drag'); }
        if (dragMoved) sc.scrollLeft = startL - dx;
      });
      addEventListener('pointerup', () => { dragging = false; sc.classList.remove('drag'); });
      sc.addEventListener('click', e => {
        if (dragMoved) { dragMoved = false; return; }
        const view = (e.target as HTMLElement).closest('[data-view]') as HTMLElement;
        if (view) {
           router.push('/store?game=' + encodeURIComponent(GAMES[parseInt(view.dataset.view!)].slug));
        }
      });
      $('#nextBtn').addEventListener('click', () => {
        const end = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 8;
        sc.scrollTo({ left: end ? 0 : sc.scrollLeft + sc.clientWidth * .55, behavior: 'smooth' });
      });



      /* =====================================================
         Statistic
         ===================================================== */
      const coreLabel = $('#coreLabel'), coreVal = $('#coreVal'), ghRow = $('#ghRow');
      const total = window.__TITAN_DATA.stats?.points ?? 0;
      let coreShown = 0, coreRaf = 0, hovering = -1;
      function setCore(label, val, dur = 700) {
        coreLabel.textContent = label;
        cancelAnimationFrame(coreRaf);
        if (reduce) { coreShown = val; coreVal.textContent = fmt(val); return; }
        const from = coreShown, t0 = performance.now();
        const step = t => {
          const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          coreShown = from + (val - from) * e;
          coreVal.textContent = fmt(coreShown);
          if (p < 1) coreRaf = requestAnimationFrame(step);
        };
        coreRaf = requestAnimationFrame(step);
      }
      function countTo(el, to, dur = 1600) {
        if (reduce) { el.textContent = fmt(to); return; }
        const t0 = performance.now();
        const step = t => {
          const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(to * e);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      /* ---- Total-hours blob: a flower that "plays music" ----
         A beat clock (kick / snare / hats) drives six "frequency bands"; every petal is
         one band, so the petals bounce like a circular equalizer. Hovering a game
         changes the tempo. Swap simulateBands() for a real AnalyserNode to react to actual audio. */
      const BASE_BPM = 104;
      let bpmTarget = BASE_BPM;
      const blobEl = $('#blob'), cv = $('#blobCanvas'), cctx = cv.getContext('2d');
      let cvSize = 0, dpr = 1;
      const LAYERS = [
        { n: 5, rot: .3, spd: .10, off: 0, rs: 1.00, a: .96, g: [0, -1, 0, .95], st: [[0, '#f5524a'], [.5, '#c2343b'], [1, 'rgba(90,24,40,0)']], rim: 'rgba(255,150,140,.30)' },
        { n: 6, rot: 1.4, spd: -.06, off: 3, rs: .96, a: .45, g: [.7, -.5, -.5, .9], st: [[0, '#ff9a90'], [1, 'rgba(255,120,120,0)']], rim: 'rgba(255,190,180,.18)' },
        { n: 5, rot: 1.1, spd: -.07, off: 2, rs: .95, a: .94, g: [-1, -.2, .75, .3], st: [[0, '#fff6d2'], [.45, '#ebcf9c'], [1, 'rgba(190,130,110,0)']], rim: 'rgba(255,255,255,.42)' },
        { n: 6, rot: .4, spd: .055, off: 4, rs: .92, a: .93, g: [-.7, 1, .45, -.25], st: [[0, '#bdb1ff'], [.5, '#6f5ad9'], [1, 'rgba(80,60,190,0)']], rim: 'rgba(215,205,255,.40)' }
      ];
      const bands = [.2, .2, .2, .2, .2, .2];
      let kickSm = 0;

      function sizeCanvas() {
        dpr = Math.min(2, devicePixelRatio || 1);
        cvSize = blobEl.offsetWidth;
        cv.width = cv.height = Math.round(cvSize * dpr);
      }
      function simulateBands(t, dt) {
        const wob = k => 0.5 + 0.5 * Math.sin(t * (1.1 + k * 0.37) + k * 1.9);
        for (let k = 0; k < 6; k++) {
          const target = 0.3 + 0.4 * wob(k);
          bands[k] += (target - bands[k]) * dt * 3;
        }
        const breath = Math.sin(t * 1.5);
        kickSm += (breath * 0.6 - kickSm) * dt * 4;
      }
      function drawBlob(dt) {
        const s = cvSize, R = s * .5, ctx = cctx;
        const scale = 1 + .04 * kickSm;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, s, s);
        ctx.translate(R, R);
        for (const L of LAYERS) {
          L.rot += dt * L.spd;
          const R0 = s * .41 * L.rs * scale, sigma = .36 * (Math.PI * 2 / L.n), N = 150;
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const th = i / N * Math.PI * 2;
            let r = .84;
            for (let j = 0; j < L.n; j++) {
              let d = th - (L.rot + j * 2 * Math.PI / L.n);
              d = Math.atan2(Math.sin(d), Math.cos(d));
              r += (.20 + .17 * bands[(j + L.off) % 6]) * Math.exp(-(d * d) / (sigma * sigma));
            }
            const x = Math.cos(th) * r * R0, y = Math.sin(th) * r * R0;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.closePath();
          const g = ctx.createLinearGradient(L.g[0] * R, L.g[1] * R, L.g[2] * R, L.g[3] * R);
          L.st.forEach(([o, c]) => g.addColorStop(o, c));
          ctx.globalAlpha = L.a; ctx.fillStyle = g; ctx.fill();
          ctx.globalAlpha = 1; ctx.lineWidth = 1.2; ctx.strokeStyle = L.rim; ctx.stroke();
        }
        blobEl.style.setProperty('--kick', kickSm.toFixed(3));
      }
      let blobVisible = true, blobLast = performance.now();
      function blobLoop(now) {
        const dt = Math.min((now - blobLast) / 1000, .1); blobLast = now;
        if (blobVisible && !document.hidden) { simulateBands(now / 1000, dt); drawBlob(dt); }
        requestAnimationFrame(blobLoop);
      }
      new ResizeObserver(() => { sizeCanvas(); if (reduce) { simulateBands(1.3, .016); drawBlob(0); } }).observe(blobEl);
      new IntersectionObserver(([en]) => blobVisible = en.isIntersecting).observe(blobEl);
      sizeCanvas();
      if (reduce) { simulateBands(1.3, .016); drawBlob(0); } else requestAnimationFrame(blobLoop);

      ghRow.innerHTML = HRS.map((h, i) => `
  <button class="gh" data-i="${i}" style="--c:${h.c}" aria-label="${esc(h.name)}">
    <span class="ic" style="background:${h.c};color:${h.fg}">${GLYPH[h.k]}</span>
    <span class="gv" id="gv${i}">${fmt(h.v)}</span>
  </button>`).join('');
      $$('.gh', ghRow).forEach(b => {
        const i = +b.dataset.i;
        const on = () => { hovering = i; bpmTarget = HRS[i].bpm; setCore(HRS[i].name, HRS[i].v, 550); };
        const off = () => { hovering = -1; bpmTarget = BASE_BPM; setCore('مجموع امتیاز', total, 550); };
        b.addEventListener('pointerenter', on); b.addEventListener('pointerleave', off);
        b.addEventListener('focus', on); b.addEventListener('blur', off);
      });
      setCore('مجموع امتیاز', total, 900);

      /* =====================================================
         Right rail (friends + presence)
         ===================================================== */
      const tip = f => `${f.n} · ${f.s === 'game' ? 'در بازی — ' + f.g : f.s === 'online' ? 'آنلاین' : 'آفلاین'}`;

      (function announcements() {
        const list = window.__TITAN_DATA.announcements;
        if (!list.length) return;
        let n = 0;
        setTimeout(function again() {
          // Skip while the tab is in the background: a stale announcement is no use later.
          if (!document.hidden) liveToast(list[n++ % list.length]);
          setTimeout(again, rand(24000, 36000));
        }, 6500);
      })();

      /* =====================================================
         Cursor spotlight, parallax and the main animation loop
         ===================================================== */
      document.addEventListener('pointermove', e => {
        const t = e.target.closest && e.target.closest('.spot');
        if (!t) return;
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });

      let tx = 0, ty = 0, cx = 0, cy = 0, pointerActive = false;
      if (matchMedia('(pointer:fine)').matches) {
        addEventListener('pointermove', e => { pointerActive = true; tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
        document.addEventListener('pointerleave', () => pointerActive = false);
      }
      let last = performance.now();
      function loop(t) {
        const dt = Math.min(t - last, 100); last = t;
        if (!reduce) {
          const gx = pointerActive ? tx : Math.sin(t / 3200) * .55;   // gentle idle drift when the pointer is away
          const gy = pointerActive ? ty : Math.cos(t / 4100) * .4;
          cx += (gx - cx) * .07; cy += (gy - cy) * .07;
          frame.style.setProperty('--px', cx.toFixed(3));
          frame.style.setProperty('--py', cy.toFixed(3));
          if (!paused && !document.hidden) {
            elapsed += dt;
            if (elapsed >= CONFIG.slideMs) goTo((cur + 1) % SLIDES.length);
          }
          dashFills[cur].style.transform = `scaleX(${Math.min(1, elapsed / CONFIG.slideMs).toFixed(4)})`;
        }
        requestAnimationFrame(loop);
      }

      /* =====================================================
         Boot
         ===================================================== */
      paint();
      goTo(0, true);
      requestAnimationFrame(loop);
    })();

    // --- End Logic ---

    return () => {
      initialized.current = false;
      cleanupFuncs.forEach(fn => fn());
    };

    // The scene script builds the DOM once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
<div class="cols">

      <!-- ---- Column A ---- -->
      <section class="col col-a">

        <article class="hero spot reveal" id="hero" style="--d:2">
          <div class="hero-bg" aria-hidden="true">
            <i class="l l0 on"></i><i class="l l1"></i><i class="l l2"></i>
            <span class="ring r1"></span><span class="ring r2"></span>
            <span class="sheen"></span>
          </div>

          <div class="hero-body" id="heroBody">
            <div class="hero-tags">
              <span class="badge-pop"><i data-icon="flame"></i>محبوب</span>
            </div>
            <h2 id="heroTitle">Valorant</h2>
            <p id="heroDesc"></p>
            <div class="hero-foot">
              <a href="/tournaments" id="heroLink" class="pill-white"><span>مشاهده تورنمنت</span></a>
            </div>
          </div>

          <div class="hero-art" id="heroArt" aria-hidden="true"></div>

          <div class="hero-live" aria-live="off">
            <span class="live-dot"></span>
            <span>شروع در <b id="cd">02:14:33</b></span>
            <span class="sep"></span>
            <span><b id="watch">0</b> در حال تماشا</span>
          </div>

          <div class="dashes" id="dashes"></div>
        </article>

        <div class="sec-h reveal" style="--d:3"><h3>دسته‌بندی‌ها</h3></div>
        <div class="carousel">
          <div class="scroller" id="scroller" tabindex="0" aria-label="دسته‌بندی‌ها"></div>
          <button class="next reveal" style="--d:3" id="nextBtn" aria-label="بازی‌های بعدی"><i data-icon="chev"></i></button>
        </div>

        <article class="dl spot reveal trust-badges" style="--d:6; margin-top: 24px;">
          <svg class="dl-lines" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M330 -10C360 30 300 60 340 110" fill="none" stroke="#fff" stroke-opacity=".08"/>
            <path d="M350 -10C380 30 320 60 360 110" fill="none" stroke="#fff" stroke-opacity=".06"/>
            <path d="M370 -10C400 30 340 60 380 110" fill="none" stroke="#fff" stroke-opacity=".05"/>
            <path d="M50 -10C80 30 20 60 60 110" fill="none" stroke="#fff" stroke-opacity=".08"/>
            <path d="M70 -10C100 30 40 60 80 110" fill="none" stroke="#fff" stroke-opacity=".06"/>
            <path d="M90 -10C120 30 60 60 100 110" fill="none" stroke="#fff" stroke-opacity=".05"/>
          </svg>
          <div class="dl-content trust-content">
            <div class="trust-item">
              <div class="trust-icon"><i data-icon="flame"></i><div class="glow"></div></div>
              <div class="trust-text">
                <span>تحویل آنی</span>
                <small>در کمتر از یک دقیقه</small>
              </div>
            </div>
            <div class="trust-divider"></div>
            <div class="trust-item">
              <div class="trust-icon"><i data-icon="shield"></i><div class="glow"></div></div>
              <div class="trust-text">
                <span>پرداخت امن</span>
                <small>از طریق درگاه‌های معتبر</small>
              </div>
            </div>
            <div class="trust-divider"></div>
            <div class="trust-item">
              <div class="trust-icon"><i data-icon="like"></i><div class="glow"></div></div>
              <div class="trust-text">
                <span>ضمانت اصالت کالا</span>
                <small>۱۰۰٪ قانونی و اورجینال</small>
              </div>
            </div>
          </div>
        </article>


      </section>

      <!-- ---- Column B ---- -->
      <section class="col col-b">
        <article class="tourney-banner spot reveal" style="--d:3">
          <div class="tb-bg" aria-hidden="true">
            <span class="ring r1"></span><span class="ring r2"></span>
            <span class="sheen"></span>
          </div>
          <div class="tb-content">
            <span class="tb-badge"><i data-icon="trophy"></i> تورنمنت‌های تایتان</span>
            <h3>رقابت با بهترین‌ها</h3>
            <p>جوایز نقدی بزرگ در انتظار شماست. تیم خود را ثبت‌نام کنید.</p>
            <a href="/tournament" class="tb-btn">اطلاعات بیشتر</a>
          </div>
          <img src="/images/tournoment-banner.png" alt="" class="tb-img" />
          <svg class="tb-art" viewBox="0 0 200 200" preserveAspectRatio="none">
            <circle cx="160" cy="40" r="80" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="30" />
            <circle cx="160" cy="40" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="20" />
          </svg>
        </article>

        <div class="stat-wrap col reveal" style="--d:4">
          <div class="sec-h"><h3>امتیاز شما</h3><a class="arrow" href="/tournament" aria-label="باز کردن آمار"><i data-icon="arrow"></i></a></div>
          <article class="stat spot reveal" style="--d:5">
            <div class="blob" id="blob">
              <canvas id="blobCanvas" aria-hidden="true"></canvas>
              <div class="core"><small id="coreLabel">مجموع امتیاز</small><strong id="coreVal">0</strong></div>
            </div>
            <div class="gh-row" id="ghRow"></div>
          </article>
        </div>
      </section>

    </div>

` }}
    />
  );
}
