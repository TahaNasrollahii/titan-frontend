
(() => {
'use strict';

/* =====================================================
   Config — change these
   ===================================================== */
const CONFIG = {
  userName: 'Player',   // shown in the greeting
  slideMs: 6500         // hero auto-rotation time
};

/* =====================================================
   Helpers
   ===================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => Math.random() * (b - a) + a;
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const fmt = n => Math.round(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const frame = $('#frame');

/* =====================================================
   Icons  ([svg-inner, filled?])
   ===================================================== */
const I = {
  home:  ['<path d="M3.5 10.8 12 3.5l8.5 7.3V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>'],
  game:  ['<path d="M7.5 7h9A4.5 4.5 0 0 1 21 11.5v1a4.5 4.5 0 0 1-4.5 4.5h-1.2l-1.8-2h-3l-1.8 2H7.5A4.5 4.5 0 0 1 3 12.5v-1A4.5 4.5 0 0 1 7.5 7z"/><path d="M8 10v3M6.5 11.5h3"/><circle cx="15.6" cy="10.8" r=".6"/><circle cx="17.6" cy="12.6" r=".6"/>'],
  gift:  ['<rect x="3.5" y="9" width="17" height="11.5" rx="2"/><rect x="2.5" y="6" width="19" height="3.5" rx="1"/><path d="M12 6v14.5"/><path d="M12 6c-.5-2.5-4-3.3-4.5-1.5C7 6 9.5 6 12 6zM12 6c.5-2.5 4-3.3 4.5-1.5C17 6 14.5 6 12 6z"/>'],
  trophy:['<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5a1.5 1.5 0 0 0 0 3H8M16 6h2.5a1.5 1.5 0 0 1 0 3H16"/><path d="M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/>'],
  chart: ['<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>'],
  bag:   ['<path d="M5 8.5h14l-1 11.5H6z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'],
  chat:  ['<path d="M4 5.5h16v11H10l-4.5 4v-4H4z"/><path d="M8 10h8M8 13h5"/>'],
  search:['<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'],
  cart:  ['<path d="M3 4h2.6l2 10.5h10.2L20 7.5H6.4"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'],
  bell:  ['<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 2H4.2z"/><path d="M10 21h4"/>'],
  users: ['<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9.5" r="2.5"/><path d="M17 14.5a4.5 4.5 0 0 1 4.5 4.5"/>'],
  play:  ['<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z"/>', true],
  pause: ['<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>', true],
  x:     ['<path d="M6 6l12 12M18 6 6 18"/>'],
  like:  ['<path d="M2.5 10.5h4v10h-4z"/><path d="M6.5 10.5 10.5 3c1.9 0 3 1.4 2.6 3.3L12.4 9.5h6.3a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.5H6.5z"/>', true],
  chev:  ['<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'],
  arrow: ['<path d="M4 12h15.5M13.5 6l6 6-6 6"/>'],
  flame: ['<path d="M12 3c.6 3.4 4.8 5 4.8 9.6a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.2 2-4.2.1 1.5.9 2.5 2 2.7C11 8.6 10.8 5.6 12 3z"/>'],
  steam: ['<circle cx="15.2" cy="9" r="3.4"/><circle cx="8" cy="15.6" r="2.3"/><path d="m9.8 14 3.2-3M3.3 13.4l3.3 1.3"/>'],
  epic:  ['<path d="M6 3.5h12v12.6L12 20.5l-6-4.4z"/><path d="M10 8h4M10 8v5.5h4M10 10.7h3"/>'],
  plus:  ['<path d="M12 5v14M5 12h14"/>'],
  cursor:['<path d="M5 3l14 7-6 2-2 6z"/>', true]
};
const ico = name => {
  const [inner, filled] = I[name];
  return `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
};
const paint = (root = document) => $$('[data-icon]', root).forEach(el => { if (!el.childElementCount) el.innerHTML = ico(el.dataset.icon); });

/* =====================================================
   Procedural avatars (swap for real user photos later)
   ===================================================== */
let _uid = 0;
function avatar(seed) {
  const id = 'av' + (_uid++);
  const bgs = [['#ffcf8a','#ff8a5c'],['#9be8b0','#37b57a'],['#a5c6ff','#6272f2'],['#ffe17a','#ffa02e'],['#f7b0dd','#c862dc'],['#a6dcff','#4aa0e6']];
  const skins = ['#f4cfa8','#e6b088','#c98d62','#f8dcc4','#a8714a','#dca47a'];
  const hairs = ['#2b1b17','#5b3a26','#d9a441','#151515','#8a2e2e','#3a2a5c'];
  const shirts = ['#2f2a4a','#c9403f','#1f6f6b','#f0f0f0','#3a5bd0','#222'];
  const s = Math.abs(seed | 0);
  const bg = bgs[s % 6], sk = skins[(s * 7 + 1) % 6], hr = hairs[(s * 5 + 2) % 6], sh = shirts[(s * 3 + 4) % 6], style = (s * 11 + 3) % 4;
  let hair;
  if (style === 0) hair = `<path d="M10.5 19c-.6-7.5 4-10.5 9.5-10.5S30 11.5 29.5 19c-1.8-3.6-5.2-5-9.5-5s-7.7 1.4-9.5 5z" fill="${hr}"/>`;
  else if (style === 1) hair = `<circle cx="13" cy="13" r="4.5" fill="${hr}"/><circle cx="20" cy="10.5" r="5" fill="${hr}"/><circle cx="27" cy="13" r="4.5" fill="${hr}"/>`;
  else if (style === 2) hair = `<path d="M9.5 24c-1.5-9 2-16 10.5-16s12 7 10.5 16c-1.2-2-2-5-2-8-3.5 1-11 1-14.5 0 0 3-.8 6-2 8z" fill="${hr}"/>`;
  else hair = `<path d="M11 17.5c1-5 4.5-7 9-7s8 2 9 7c-3-2.5-6-3-9-3s-6 .5-9 3z" fill="${hr}"/>`;
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="40" height="40" fill="url(#${id})"/><ellipse cx="20" cy="42" rx="15" ry="11" fill="${sh}"/><rect x="17" y="26" width="6" height="6" rx="3" fill="${sk}"/><circle cx="20" cy="20" r="8.6" fill="${sk}"/>${hair}<circle cx="16.8" cy="20.3" r="1" fill="#2a1414"/><circle cx="23.2" cy="20.3" r="1" fill="#2a1414"/><path d="M17.2 24c1.8 1.6 3.8 1.6 5.6 0" fill="none" stroke="#7a3a2a" stroke-width="1.1" stroke-linecap="round"/></svg>`;
}

/* =====================================================
   Hero key art (SVG). Replace with your own <img> per slide
   ===================================================== */
const heroArt = k => `
<svg viewBox="0 0 460 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hA${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a678ea"/><stop offset="1" stop-color="#4b2a86"/></linearGradient>
    <linearGradient id="hP${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb37a"/><stop offset="1" stop-color="#c6567a"/></linearGradient>
    <linearGradient id="hH${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c68"/><stop offset="1" stop-color="#22103a"/></linearGradient>
    <linearGradient id="hC${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2ff8a"/><stop offset="1" stop-color="#8fc92a"/></linearGradient>
    <linearGradient id="hB${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4f4ff"/><stop offset="1" stop-color="#3a78e0"/></linearGradient>
    <radialGradient id="hO${k}"><stop offset="0" stop-color="#fffbc4"/><stop offset=".45" stop-color="#ffcb3d"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
    <radialGradient id="hG${k}"><stop offset="0" stop-color="#efffc4"/><stop offset=".5" stop-color="#6fdc6a"/><stop offset="1" stop-color="#1c8a48"/></radialGradient>
    <radialGradient id="hHalo${k}"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <filter id="hBlur${k}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>

  <g class="pl0">
    <circle cx="230" cy="180" r="170" fill="url(#hHalo${k})"/>
    <path class="fl" d="M46 74l34-26 8 44z" fill="#fff" fill-opacity=".2"/>
    <path class="fl f2" d="M398 96l32-30 12 52z" fill="#fff" fill-opacity=".16"/>
    <path class="fl f3" d="M372 296l26-30 22 44z" fill="#fff" fill-opacity=".14"/>
    <circle class="fl f2" cx="120" cy="60" r="5" fill="#fff" fill-opacity=".5"/>
    <circle class="fl" cx="432" cy="204" r="4" fill="#fff" fill-opacity=".45"/>
  </g>

  <g class="pl1">
    <path d="M64 360C72 268 128 230 200 220h62c72 10 128 48 136 140z" fill="url(#hA${k})"/>
    <path d="M200 222l30 80 32-80M230 302v58" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>
    <ellipse cx="108" cy="262" rx="48" ry="34" fill="url(#hP${k})" transform="rotate(-14 108 262)"/>
    <ellipse cx="352" cy="262" rx="48" ry="34" fill="url(#hP${k})" transform="rotate(14 352 262)"/>
    <path d="M204 196h52v34a26 12 0 0 1-52 0z" fill="#2a1640"/>
    <path d="M166 94Q230 50 294 94L308 160Q302 214 262 228H198Q158 214 152 160z" fill="url(#hH${k})"/>
    <path d="M166 94Q156 130 152 160Q158 214 198 228" fill="none" stroke="#ff9a78" stroke-width="3" stroke-linecap="round"/>
    <path class="orb" d="M176 140h108l-8 30h-92z" fill="#ffd66b" filter="url(#hBlur${k})" opacity=".8"/>
    <path d="M178 140h104l-8 28h-88z" fill="#fff0b0"/>
    <path d="M230 170v46M196 196h68" stroke="#fff" stroke-opacity=".14" stroke-width="2" fill="none"/>
    <path d="M194 88L204 24l20 46 16-60 16 58 22-42-6 66z" fill="url(#hC${k})"/>
    <circle cx="230" cy="306" r="34" fill="#2a1640"/>
    <circle class="orb" cx="230" cy="306" r="26" fill="url(#hG${k})"/>
    <circle cx="230" cy="306" r="30" fill="none" stroke="#ffb37a" stroke-width="3"/>
  </g>

  <g class="pl2">
    <g class="fl">
      <circle class="orb" cx="74" cy="196" r="62" fill="#ffb52e" opacity=".55" filter="url(#hBlur${k})"/>
      <path d="M28 214q8 40 50 42 38 0 54-32l-26-16-52 2z" fill="#5a3792"/>
      <circle class="orb" cx="74" cy="196" r="36" fill="url(#hO${k})"/>
      <circle class="spin" cx="74" cy="196" r="46" fill="none" stroke="#fff3a8" stroke-opacity=".6" stroke-width="2" stroke-dasharray="4 6"/>
      <ellipse cx="46" cy="222" rx="9" ry="14" fill="#6d48ac" transform="rotate(24 46 222)"/>
      <ellipse cx="74" cy="232" rx="9" ry="14" fill="#7a52bd"/>
      <ellipse cx="102" cy="222" rx="9" ry="14" fill="#6d48ac" transform="rotate(-24 102 222)"/>
    </g>
    <g class="fl f2">
      <path d="M372 92l40 52-12 70-54 8-16-66z" fill="#7fd6ff" opacity=".28" filter="url(#hBlur${k})"/>
      <path d="M372 92l40 52-12 70-54 8-16-66z" fill="url(#hB${k})"/>
      <path d="M372 92l-8 100M372 92l28 122M412 144l-48 48" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none"/>
    </g>
  </g>
</svg>`;

/* =====================================================
   Data
   ===================================================== */
const SLIDES = [
  { title: 'Valorant',        desc: 'Titan Cup — the 5v5 tactical shooter tournament. Squad up, climb the bracket and fight for the $5,000 prize pool.', reviews: '+53 Reviews', watch: 1284, eta: 2*3600 + 14*60 + 33, plats: ['steam','epic'], faces: [11,12,13] },
  { title: 'Rocket League',   desc: 'Titan Rocket Series — 3v3 aerial chaos. Weekly qualifiers are open and the top 8 teams reach the live finals.',       reviews: '+38 Reviews', watch: 842,  eta: 5*3600 + 41*60 + 8,  plats: ['steam','epic'], faces: [21,22,23] },
  { title: 'Counter-Strike 2',desc: 'Titan Major Qualifier — the classic bomb-defusal showdown. Register your five and lock in your map picks.',           reviews: '+71 Reviews', watch: 2310, eta: 26*60 + 52,          plats: ['steam'],        faces: [31,32,33] }
];

const PICKS = [
  { t: 'Unravel 2',              s: '(Standard Edition + Starter Pass)' },
  { t: 'Subway Surf',            s: '' },
  { t: 'Red Dead Redemption 3',  s: '(Premium Pack)' }
];
const THUMBS = [
  `<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#ffd9b0"/><circle cx="14" cy="14" r="5" fill="#ff8fa3"/><circle cx="34" cy="14" r="5" fill="#ff8fa3"/><circle cx="24" cy="26" r="14" fill="#ff8fa3"/><ellipse cx="24" cy="30" rx="6.5" ry="4.5" fill="#ffc2cf"/><circle cx="22" cy="30" r="1.1" fill="#b8455e"/><circle cx="26" cy="30" r="1.1" fill="#b8455e"/><circle cx="18" cy="23" r="1.7" fill="#3a1a22"/><circle cx="30" cy="23" r="1.7" fill="#3a1a22"/></svg>`,
  `<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#3aa0ff"/><rect y="34" width="48" height="14" fill="#2b7fd0"/><circle cx="24" cy="26" r="10" fill="#f2c39a"/><path d="M13 24c1-9 8-12 15-11 5 1 8 5 8 11z" fill="#ffd23f"/><path d="M24 24h16l-2 4H24z" fill="#ffb800"/><circle cx="20.5" cy="27" r="1.3" fill="#2a1414"/><circle cx="27.5" cy="27" r="1.3" fill="#2a1414"/><path d="M14 44c2-7 6-9 10-9s8 2 10 9z" fill="#ff5a4f"/></svg>`,
  `<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#b0602f"/><rect y="30" width="48" height="18" fill="#7d3b1c"/><circle cx="24" cy="29" r="9" fill="#e0a678"/><ellipse cx="24" cy="21.5" rx="17" ry="4.6" fill="#3a2010"/><path d="M14 21c0-9 5-13 10-13s10 4 10 13z" fill="#4b2a14"/><rect x="14" y="17" width="20" height="3" fill="#a5532a"/><path d="M19 33h10" stroke="#5a2f1a" stroke-width="1.6" stroke-linecap="round"/><circle cx="20.5" cy="28" r="1.2" fill="#2a1410"/><circle cx="27.5" cy="28" r="1.2" fill="#2a1410"/></svg>`
];

const GAMES = [
  { t: 'Uncharted 4',                   d: "The last chapter of Nathan Drake's story: a cinematic treasure hunt across the globe.", p: '$29.99', theme: 'noir'  },
  { t: 'Dishonored : Standard Edition', d: 'Stealth, supernatural powers and a city on the brink. Play it your way.',                p: '$19.99', theme: 'flame', crest: true },
  { t: 'Elden Ring',                    d: "Explore a vast open world and take on the Lands Between's toughest bosses.",             p: '$39.99', theme: 'mist'  },
  { t: 'Titan Pro Headset',             d: '7.1 surround sound and a detachable mic, built for long ranked nights.',                 p: '$89.00', theme: 'neon',  fig: 'headset',  kind: 'Gear' },
  { t: 'God of War Ragnarök',           d: 'Kratos and Atreus face the end of the world in a Norse epic.',                            p: '$44.99', theme: 'ice'   },
  { t: 'Titan K1 Keyboard',             d: 'Hot-swappable switches and per-key RGB for a board that feels like yours.',              p: '$109.00',theme: 'ember', fig: 'keyboard', kind: 'Gear' }
];

const THEME = {
  noir:  { a: '#120c14', b: '#3a2a30', glow: '#c98d92', fig: '#08050a' },
  flame: { a: '#7d2410', b: '#f27a20', glow: '#ffd58a', fig: '#3a1508' },
  mist:  { a: '#2e1216', b: '#6b323a', glow: '#e0a3a8', fig: '#1b070b' },
  neon:  { a: '#160f3a', b: '#6b33d6', glow: '#ff6ab0', fig: '#0b0722' },
  ice:   { a: '#0f2436', b: '#2f86b8', glow: '#c6ecff', fig: '#06131f' },
  ember: { a: '#3a0e28', b: '#cf3f5c', glow: '#ffb9a6', fig: '#1a0512' }
};

const HRS = [
  { k: 'dota', name: 'Dota 2',           v: 2340, c: '#d9443f', fg: '#fff' },
  { k: 'rl',   name: 'Rocket League',    v: 5420, c: '#fff1b8', fg: '#2b1013' },
  { k: 'cs',   name: 'Counter-Strike 2', v: 4580, c: '#7458d6', fg: '#fff' }
];
const GLYPH = {
  dota: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l6.5 8L5 20h4l7-8-7-8z"/><path d="M14 4h5l-5 5.5z" opacity=".8"/></svg>',
  rl:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z" fill="currentColor"/></svg>',
  cs:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/></svg>'
};

const FRIENDS = [
  { n: 'Mia',   s: 'game',   g: 'Valorant', seed: 3 },
  { n: 'Alex',  s: 'online', seed: 8 },
  { n: 'Sara',  s: 'away',   seed: 14 },
  { n: 'Kian',  s: 'online', seed: 19 },
  { n: 'Bita',  s: 'online', seed: 25 },
  { n: 'Arman', s: 'away',   seed: 30 }
];
const CHATS = [
  { n: 'Squad chat', group: true, unread: true },
  { n: 'Nima',  seed: 41 },
  { n: 'Leyla', seed: 47, unread: true }
];
const GAMES_LIVE = ['Valorant', 'Rocket League', 'Counter-Strike 2', 'Dota 2'];

/* =====================================================
   Toasts
   ===================================================== */
const toastsEl = $('#toasts');
function toast({ title, text = '', icon = 'bell' }) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="t-ic"><i data-icon="${icon}"></i></span><div><b>${esc(title)}</b>${text ? `<span class="tx">${esc(text)}</span>` : ''}</div>`;
  paint(el);
  toastsEl.appendChild(el);
  while (toastsEl.children.length > 3) toastsEl.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, 4300);
}

/* =====================================================
   Greeting
   ===================================================== */
(() => {
  const h = new Date().getHours();
  $('#greetWord').textContent = h < 5 ? 'Good night,' : h < 12 ? 'Good morning,' : h < 18 ? 'Good afternoon,' : 'Good evening,';
  $('#userName').textContent = CONFIG.userName;
})();

/* =====================================================
   Left nav: sliding indicator
   ===================================================== */
const navItems = $$('.nav-item');
const navInd = $('#navInd');
function moveInd(el, instant) {
  if (instant) navInd.style.transition = 'none';
  navInd.style.transform = `translate(${el.offsetLeft}px,${el.offsetTop}px)`;
  if (instant) { void navInd.offsetWidth; navInd.style.transition = ''; }
}
navItems.forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); // remove this line once the links point to real pages
  navItems.forEach(x => x.classList.remove('active'));
  a.classList.add('active');
  moveInd(a);
}));
addEventListener('resize', () => moveInd($('.nav-item.active'), true));
$('#addSquad').addEventListener('click', () => toast({ title: 'New squad', text: 'Invite friends to your lobby', icon: 'users' }));

/* =====================================================
   Search
   ===================================================== */
const CATALOG = [
  ...GAMES.map(g => ({ t: g.t, k: g.kind || 'Game' })),
  ...SLIDES.map(s => ({ t: s.title + ' Cup', k: 'Tournament' })),
  ...PICKS.map(p => ({ t: p.t, k: 'Game' })),
  { t: 'FIFA 23', k: 'Game' }
];
const searchEl = $('#search'), qEl = $('#q'), resEl = $('#results');
function renderResults(q) {
  const query = q.trim().toLowerCase();
  const list = (query ? CATALOG.filter(x => x.t.toLowerCase().includes(query)) : CATALOG).slice(0, 5);
  resEl.innerHTML = (query ? '' : '<h5>Popular searches</h5>') + (list.length
    ? list.map(x => `<button type="button" data-t="${esc(x.t)}"><span>${esc(x.t)}</span><small>${x.k}</small></button>`).join('')
    : `<div class="empty">No results for “${esc(q.trim())}”</div>`);
}
qEl.addEventListener('focus', () => { renderResults(qEl.value); searchEl.classList.add('open'); });
qEl.addEventListener('input', () => { renderResults(qEl.value); searchEl.classList.add('open'); });
qEl.addEventListener('blur', () => setTimeout(() => searchEl.classList.remove('open'), 160));
qEl.addEventListener('keydown', e => {
  if (e.key === 'Escape') qEl.blur();
  if (e.key === 'Enter') { const b = $('button', resEl); if (b) b.click(); }
});
resEl.addEventListener('mousedown', e => e.preventDefault());
resEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-t]');
  if (!b) return;
  toast({ title: b.dataset.t, text: 'Opening page…', icon: 'search' });
  qEl.value = ''; qEl.blur();
});
addEventListener('keydown', e => {
  if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); qEl.focus(); }
});

/* =====================================================
   Cart & bell
   ===================================================== */
let cart = 0;
const cartBtn = $('#cartBtn'), cartBadge = $('#cartCount'), bellDot = $('#bellDot');
function addToCart(name) {
  cart++;
  cartBadge.hidden = false;
  cartBadge.textContent = cart;
  cartBadge.classList.remove('pop'); void cartBadge.offsetWidth; cartBadge.classList.add('pop');
  if (!reduce) cartBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  toast({ title: 'Added to cart', text: name, icon: 'cart' });
}
$('#bellBtn').addEventListener('click', () => {
  bellDot.hidden = true;
  toast({ title: "You're all caught up", text: 'No new notifications', icon: 'bell' });
});
const liveToast = t => { bellDot.hidden = false; toast(t); };

/* =====================================================
   Hero
   ===================================================== */
const hero = $('#hero'), heroBody = $('#heroBody'), heroArtEl = $('#heroArt'), dashesEl = $('#dashes');
heroArtEl.innerHTML = SLIDES.map((s, i) => `<div class="art${i === 0 ? ' on' : ''}" data-hue="${i}">${heroArt(i)}</div>`).join('');
dashesEl.innerHTML = SLIDES.map((s, i) => `<button class="dash${i === 0 ? ' on' : ''}" aria-label="Show ${esc(s.title)}"><span><i></i></span></button>`).join('');
const arts = $$('.art', heroArtEl), bgLayers = $$('.hero-bg .l'), dashes = $$('.dash', dashesEl), dashFills = $$('.dash i', dashesEl);
SLIDES.forEach(s => s.end = Date.now() + s.eta * 1000);
const watchEl = $('#watch'), cdEl = $('#cd');
let cur = 0, elapsed = 0, paused = false;

function applySlide() {
  const s = SLIDES[cur];
  $('#heroTitle').textContent = s.title;
  $('#heroDesc').textContent = s.desc;
  $('#heroReviews').textContent = s.reviews;
  $('#likeBtn').classList.remove('liked');
  $('#plats').innerHTML = s.plats.map(p => `<span class="plat"><i data-icon="${p}"></i></span>`).join('');
  $('#faces').innerHTML = s.faces.map(n => `<span class="face">${avatar(n)}</span>`).join('');
  paint(hero);
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
$('#likeBtn').addEventListener('click', e => {
  const b = e.currentTarget; b.classList.toggle('liked');
  if (b.classList.contains('liked')) toast({ title: SLIDES[cur].title, text: 'Added to your favourites', icon: 'like' });
});

function tickCountdown() {
  const left = Math.max(0, Math.floor((SLIDES[cur].end - Date.now()) / 1000));
  const p = n => String(n).padStart(2, '0');
  cdEl.textContent = `${p(Math.floor(left / 3600))}:${p(Math.floor(left % 3600 / 60))}:${p(left % 60)}`;
}
setInterval(tickCountdown, 1000);
(function wobbleViewers() {
  const s = SLIDES[cur];
  s.watch = Math.max(100, s.watch + Math.round(rand(-9, 15)));
  watchEl.textContent = fmt(s.watch);
  setTimeout(wobbleViewers, rand(1800, 3200));
})();

/* =====================================================
   Picks (right column)
   ===================================================== */
$('#picks').innerHTML = PICKS.map((p, i) => `
  <a class="pick reveal" href="#games" style="--d:${i + 2}">
    <span class="thumb">${THUMBS[i]}</span>
    <span class="pick-t">${esc(p.t)}${p.s ? ` <em>${esc(p.s)}</em>` : ''}</span>
    <i data-icon="chev"></i>
  </a>`).join('');

/* =====================================================
   New Games carousel
   ===================================================== */
function cardArt(g, idx) {
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
  <article class="gcard spot${i === 0 ? ' feat' : ''}" data-i="${i}" style="--d:${i}">
    <div class="gart">${cardArt(g, i)}</div>
    <button class="gplay" data-play="${i}" aria-label="Watch trailer"><i data-icon="play"></i></button>
    <button class="gbuy" data-buy="${i}" aria-label="Add ${esc(g.t)} to cart"><i data-icon="bag"></i></button>
    ${i === 0 ? '<span class="gcursor"><i data-icon="cursor"></i></span>' : ''}
    <div class="gbody">
      <h4>${esc(g.t)}</h4>
      <div class="gdesc"><p>${esc(g.d)}</p><span class="gprice">${esc(g.p)}</span></div>
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
  const buy = e.target.closest('[data-buy]'), play = e.target.closest('[data-play]');
  if (buy) addToCart(GAMES[buy.dataset.buy].t);
  if (play) toast({ title: GAMES[play.dataset.play].t, text: 'Loading trailer…', icon: 'play' });
});
$('#nextBtn').addEventListener('click', () => {
  const end = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 8;
  sc.scrollTo({ left: end ? 0 : sc.scrollLeft + sc.clientWidth * .55, behavior: 'smooth' });
});

/* =====================================================
   Downloads (simulated live progress)
   ===================================================== */
const dlEl = $('#dl'), dlEta = $('#dlEta'), dlSize = $('#dlSize'), dlToggle = $('#dlToggle');
const dl = { total: 1230, done: 265, speed: 3.4, state: 'run', wait: 0 };
function dlRender() {
  dlEl.style.setProperty('--p', Math.min(1, dl.done / dl.total).toFixed(4));
  dlEl.classList.toggle('paused', dl.state !== 'run');
  const secs = (dl.total - dl.done) / dl.speed;
  let eta;
  if (dl.state === 'pause') eta = 'Paused';
  else if (dl.state === 'cancel') eta = 'Cancelled';
  else if (dl.state === 'done') eta = 'Ready to play';
  else if (secs >= 3600) eta = `${Math.floor(secs / 3600)} hour ${Math.round(secs % 3600 / 60)} min.`;
  else if (secs >= 60) eta = `${Math.floor(secs / 60)} min ${Math.round(secs % 60)} s`;
  else eta = `${Math.max(1, Math.round(secs))} s`;
  dlEta.textContent = eta;
  dlSize.textContent = dl.state === 'done' ? '1.23 GB installed' : `${Math.round(dl.done)} MB of 1.23 GB`;
  dlToggle.innerHTML = ico(dl.state === 'run' ? 'pause' : 'play');
  dlToggle.setAttribute('aria-label', dl.state === 'run' ? 'Pause download' : dl.state === 'done' ? 'Launch game' : 'Resume download');
}
setInterval(() => {
  if (dl.state === 'run') {
    dl.speed = Math.max(1.8, Math.min(6.5, dl.speed + rand(-.5, .5)));
    dl.done = Math.min(dl.total, dl.done + dl.speed);
    if (dl.done >= dl.total) { dl.state = 'done'; dl.wait = 0; toast({ title: 'FIFA 23', text: 'Installed and ready to play', icon: 'game' }); }
  } else if (dl.state === 'done' && ++dl.wait > 8) {
    dl.done = 120; dl.state = 'run'; dl.wait = 0;   // demo loop
  }
  dlRender();
}, 1000);
dlToggle.addEventListener('click', () => {
  if (dl.state === 'run') dl.state = 'pause';
  else if (dl.state === 'done') { toast({ title: 'FIFA 23', text: 'Launching…', icon: 'game' }); return; }
  else { if (dl.state === 'cancel') dl.done = 0; dl.state = 'run'; }
  dlRender();
});
$('#dlCancel').addEventListener('click', () => {
  dl.state = 'cancel'; dl.done = 0; dlRender();
  toast({ title: 'Download cancelled', text: 'FIFA 23', icon: 'x' });
});
dlRender();

/* =====================================================
   Statistic
   ===================================================== */
const coreLabel = $('#coreLabel'), coreVal = $('#coreVal'), ghRow = $('#ghRow');
let total = HRS.reduce((a, h) => a + h.v, 0), coreShown = 0, coreRaf = 0, hovering = -1;
function setCore(label, val, dur = 700) {
  coreLabel.textContent = label;
  cancelAnimationFrame(coreRaf);
  if (reduce) { coreShown = val; coreVal.textContent = fmt(val) + 'h'; return; }
  const from = coreShown, t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    coreShown = from + (val - from) * e;
    coreVal.textContent = fmt(coreShown) + 'h';
    if (p < 1) coreRaf = requestAnimationFrame(step);
  };
  coreRaf = requestAnimationFrame(step);
}
function countTo(el, to, dur = 1600) {
  if (reduce) { el.textContent = fmt(to) + 'h'; return; }
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(to * e) + 'h';
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
ghRow.innerHTML = HRS.map((h, i) => `
  <button class="gh" data-i="${i}" style="--c:${h.c}" aria-label="${esc(h.name)}">
    <span class="ic" style="background:${h.c};color:${h.fg}">${GLYPH[h.k]}</span>
    <span class="gv" id="gv${i}">0h</span>
  </button>`).join('');
$$('.gh', ghRow).forEach(b => {
  const i = +b.dataset.i;
  const on = () => { hovering = i; setCore(HRS[i].name, HRS[i].v, 550); };
  const off = () => { hovering = -1; setCore('Total hours', total, 550); };
  b.addEventListener('pointerenter', on); b.addEventListener('pointerleave', off);
  b.addEventListener('focus', on);        b.addEventListener('blur', off);
});
setTimeout(() => {
  setCore('Total hours', total, 1900);
  HRS.forEach((h, i) => countTo($('#gv' + i), h.v, 1900));
}, 650);
setInterval(() => {              // one more hour played, every few seconds
  const i = Math.floor(Math.random() * HRS.length);
  HRS[i].v++; total++;
  $('#gv' + i).textContent = fmt(HRS[i].v) + 'h';
  const b = $(`.gh[data-i="${i}"]`); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  if (hovering === -1) setCore('Total hours', total, 500);
  else if (hovering === i) setCore(HRS[i].name, HRS[i].v, 500);
}, 9000);

/* =====================================================
   Right rail (friends + presence)
   ===================================================== */
const tip = f => `${f.n} · ${f.s === 'game' ? 'In game — ' + f.g : f.s === 'online' ? 'Online' : 'Away'}`;
$('#me').innerHTML = `<span class="face">${avatar(5)}</span>`;
$('#friends').innerHTML = FRIENDS.map((f, i) => `
  <button class="av ${f.s}" data-f="${i}" data-tip="${esc(tip(f))}" aria-label="${esc(tip(f))}">
    <span class="face">${avatar(f.seed)}</span><i class="st ${f.s}"></i><span class="ingame">In Game</span>
  </button>`).join('');
$('#chats').innerHTML = CHATS.map((c, i) => `
  <button class="av${c.group ? ' group' : ''}" data-c="${i}" data-tip="${esc(c.n)}" aria-label="${esc(c.n)}">
    <span class="face">${c.group ? '<i data-icon="users"></i>' : avatar(c.seed)}</span>${c.unread ? '<i class="nt"></i>' : ''}
  </button>`).join('');
$('#friends').addEventListener('click', e => {
  const b = e.target.closest('.av'); if (!b) return;
  toast({ title: 'Invite sent', text: `${FRIENDS[b.dataset.f].n} will see it in their lobby`, icon: 'users' });
});
$('#chats').addEventListener('click', e => {
  const b = e.target.closest('.av'); if (!b) return;
  const nt = $('.nt', b); if (nt) nt.remove();
  toast({ title: CHATS[b.dataset.c].n, text: 'Opening chat…', icon: 'chat' });
});
function setStatus(i, s) {
  const f = FRIENDS[i], b = $(`.av[data-f="${i}"]`);
  f.s = s; if (s === 'game') f.g = pickOne(GAMES_LIVE);
  b.className = 'av ' + s;
  $('.st', b).className = 'st ' + s;
  b.dataset.tip = tip(f); b.setAttribute('aria-label', tip(f));
  return f;
}
(function presenceLoop() {
  setTimeout(() => {
    const i = Math.floor(Math.random() * FRIENDS.length);
    const next = pickOne(['online', 'away', 'game'].filter(s => s !== FRIENDS[i].s));
    const f = setStatus(i, next);
    if (next === 'game' && Math.random() < .7) liveToast({ title: f.n, text: `started playing ${f.g}`, icon: 'game' });
    else if (next === 'online' && Math.random() < .5) liveToast({ title: f.n, text: 'is online', icon: 'users' });
    presenceLoop();
  }, rand(7000, 11000));
})();
(function announcements() {
  const list = [
    { title: 'Valorant Titan Cup', text: 'Registration closes in 10 minutes', icon: 'trophy' },
    { title: 'Flash sale', text: 'Titan Pro Headset — 20% off for the next hour', icon: 'bag' },
    { title: 'Rocket Series', text: 'Round 2 bracket is live', icon: 'trophy' }
  ];
  let n = 0;
  setTimeout(function again() {
    liveToast(list[n++ % list.length]);
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
moveInd($('.nav-item.active'), true);
addEventListener('load', () => moveInd($('.nav-item.active'), true));
requestAnimationFrame(loop);
})();
