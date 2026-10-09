'use client';

import React from 'react';

// SVG Icons from titan.js
export const ICONS: Record<string, [string, boolean?]> = {
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
  user:  ['<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
  users: ['<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9.5" r="2.5"/><path d="M17 14.5a4.5 4.5 0 0 1 4.5 4.5"/>'],
  play:  ['<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z"/>', true],
  pause: ['<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>', true],
  x:     ['<path d="M6 6l12 12M18 6 6 18"/>'],
  like:  ['<path d="M2.5 10.5h4v10h-4z"/><path d="M6.5 10.5 10.5 3c1.9 0 3 1.4 2.6 3.3L12.4 9.5h6.3a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.5H6.5z"/>', true],
  heart: ['<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>'],
  chev:  ['<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'],
  arrow: ['<path d="M4 12h15.5M13.5 6l6 6-6 6"/>'],
  'arrow-up': ['<path d="M12 19V5M5 12l7-7 7 7"/>'],
  flame: ['<path d="M12 3c.6 3.4 4.8 5 4.8 9.6a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.2 2-4.2.1 1.5.9 2.5 2 2.7C11 8.6 10.8 5.6 12 3z"/>'],
  plus:  ['<path d="M12 5v14M5 12h14"/>'],
  clock: ['<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'],
  sliders: ['<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'],
  steam: ['<circle cx="15.2" cy="9" r="3.4"/><circle cx="8" cy="15.6" r="2.3"/><path d="m9.8 14 3.2-3M3.3 13.4l3.3 1.3"/>'],
  epic: ['<path d="M6 3.5h12v12.6L12 20.5l-6-4.4z"/><path d="M10 8h4M10 8v5.5h4M10 10.7h3"/>'],
  cursor: ['<path d="M5 3l14 7-6 2-2 6z"/>', true],
  skull: ['<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M12 5a7 7 0 0 0-7 7v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3a7 7 0 0 0-7-7z"/>'],
  swords: ['<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>'],
  phone: ['<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'],
  shield: ['<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'],
  globe: ['<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'],
  key: ['<path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5"/>'],
  login: ['<path d="M10 17l5-5-5-5M3 12h12M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/>'],
  lock: ['<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'],
  card: ['<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>'],
  trash: ['<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'],
  minus: ['<line x1="5" y1="12" x2="19" y2="12"/>'],
  check: ['<path d="M20 6 9 17l-5-5"/>'],
  info: ['<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'],
  settings: ['<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'],
  refresh: ['<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'],
  'alert-triangle': ['<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>'],
  'chevron-left': ['<path d="m15 18-6-6 6-6"/>'],
  map: ['<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>'],
  wallet: ['<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>'],
};

export function Icon({ name, className = '', style }: { name: string, className?: string, style?: React.CSSProperties }) {
  const ico = ICONS[name];
  if (!ico) return null;
  const [inner, filled] = ico;
  return (
    <i data-icon={name} className={className} style={style} dangerouslySetInnerHTML={{
      __html: `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${inner}</svg>`
    }} />
  );
}

/** Colours of one generated avatar: background pair, helmet shell pair, glow accent, suit. */
const AVATAR_PALETTES = [
  { bg: ['#4a0f1c', '#8f1f30'], shell: ['#ffffff', '#b9bcc8'], accent: '#ff4d5e', suit: '#24070e' },
  { bg: ['#06303a', '#0f6170'], shell: ['#effbfc', '#9cc4ca'], accent: '#22f0d5', suit: '#081c21' },
  { bg: ['#211046', '#4f2490'], shell: ['#f5f0ff', '#b3a2e0'], accent: '#c08cff', suit: '#150a2e' },
  { bg: ['#36200a', '#7a4c12'], shell: ['#fff6e2', '#d6b67a'], accent: '#ffc23d', suit: '#1f1305' },
  { bg: ['#081a42', '#1a4aa0'], shell: ['#eef3ff', '#a0b3de'], accent: '#4da3ff', suit: '#08122b' },
  { bg: ['#0c2c14', '#1f6630'], shell: ['#f1fcec', '#a6cf99'], accent: '#6dff7a', suit: '#0a1c0d' },
  { bg: ['#420c30', '#8a1f60'], shell: ['#fff1f8', '#dba6c4'], accent: '#ff5fb4', suit: '#28071d' },
  { bg: ['#1a1a20', '#3a3a46'], shell: ['#5a5a68', '#26262e'], accent: '#ff7a2f', suit: '#0f0f13' },
];

/**
 * Default picture for users without an upload: a visored esports helmet, its colours, visor and
 * gear picked by ``seed`` (8 palettes x 3 visors x 4 add-ons). Ids come from useId: a gradient
 * shared with a copy in a hidden subtree (the rail on phones) would not paint.
 */
export function Avatar({ seed }: { seed: number }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const s = Math.abs(seed | 0);
  const { bg, shell, accent, suit } = AVATAR_PALETTES[s % AVATAR_PALETTES.length];
  const visor = (s * 7 + 1) % 3;
  const gear = (s * 5 + 2) % 4;
  const id = (name: string) => `av${name}${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[1]} />
          <stop offset="1" stopColor={bg[0]} />
        </linearGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('shell')} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={shell[0]} />
          <stop offset="1" stopColor={shell[1]} />
        </linearGradient>
        <linearGradient id={id('visor')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor={accent} />
          <stop offset="1" stopColor={accent} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" fill={url('bg')} />
      {/* Diagonal speed lines and the halo behind the head */}
      <path d="M-4 30 30-4M4 42 42 4M14 48 48 14" stroke="#fff" strokeOpacity="0.06" strokeWidth="3" />
      <circle cx="20" cy="17" r="17" fill={url('glow')} />

      {/* Suit with a rim light along the shoulders, and a chest emblem */}
      <path d="M3.5 41c0-8.5 7-13.5 16.5-13.5S36.5 32.5 36.5 41z" fill={suit} />
      <path d="M3.5 41c0-8.5 7-13.5 16.5-13.5S36.5 32.5 36.5 41" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="M20 32.6l2.2 2.2-2.2 2.2-2.2-2.2z" fill={accent} />
      <rect x="16.6" y="24.5" width="6.8" height="4.5" rx="1.6" fill={shell[1]} />

      {gear === 3 && <path d="M8.6 20.5a11.4 11.4 0 0 1 22.8 0" fill="none" stroke={suit} strokeWidth="2.2" />}

      {/* Helmet shell and its highlight */}
      <path d="M10.4 18.6a9.6 9.6 0 0 1 19.2 0v4a5.2 5.2 0 0 1-5.2 5.2h-8.8a5.2 5.2 0 0 1-5.2-5.2z" fill={url('shell')} />
      <path d="M13.6 12.6a7.6 7.6 0 0 1 6.4-3.2" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" />

      {/* Visor: soft glow underneath, then the lit glass */}
      {visor === 0 && (
        <>
          <rect x="11" y="16.4" width="18" height="7.4" rx="3.7" fill={accent} opacity="0.35" />
          <rect x="12" y="17.1" width="16" height="6" rx="3" fill={url('visor')} />
        </>
      )}
      {visor === 1 && (
        <>
          <path d="M11.6 17h16.8l-3.3 7h-10.2z" fill={accent} opacity="0.35" transform="translate(0 -.4) scale(1 1.04)" />
          <path d="M12.4 17.3h15.2l-3 6.1h-9.2z" fill={url('visor')} />
        </>
      )}
      {visor === 2 && (
        <>
          <rect x="11.6" y="17.6" width="16.8" height="5.4" rx="2.7" fill="#0d0d12" opacity="0.85" />
          <rect x="13.2" y="18.8" width="5.6" height="3" rx="1.5" fill={url('visor')} />
          <rect x="21.2" y="18.8" width="5.6" height="3" rx="1.5" fill={url('visor')} />
        </>
      )}
      <path d="M14.4 18.6h4" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />

      {/* Add-on: antenna, crest, side modules or a headset */}
      {gear === 0 && (
        <>
          <path d="M24.6 9.9l2.4-4.4" stroke={shell[1]} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="27.2" cy="5.2" r="1.6" fill={accent} />
        </>
      )}
      {gear === 1 && <path d="M17.6 9.6 20 4.6l2.4 5" fill={accent} />}
      {gear === 2 && (
        <>
          <rect x="8.4" y="17.2" width="2.6" height="6.4" rx="1.3" fill={shell[1]} />
          <rect x="29" y="17.2" width="2.6" height="6.4" rx="1.3" fill={shell[1]} />
          <circle cx="9.7" cy="20.4" r="0.8" fill={accent} />
          <circle cx="30.3" cy="20.4" r="0.8" fill={accent} />
        </>
      )}
      {gear === 3 && (
        <>
          <rect x="7.4" y="17.6" width="3.6" height="7.2" rx="1.8" fill={suit} />
          <rect x="29" y="17.6" width="3.6" height="7.2" rx="1.8" fill={suit} />
          <rect x="8.4" y="19.4" width="1.6" height="3.6" rx="0.8" fill={accent} />
          <rect x="30" y="19.4" width="1.6" height="3.6" rx="0.8" fill={accent} />
        </>
      )}
    </svg>
  );
}
