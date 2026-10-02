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
  logout: ['<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'],
  lock: ['<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'],
  card: ['<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>'],
  trash: ['<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'],
  minus: ['<line x1="5" y1="12" x2="19" y2="12"/>']
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

export function Avatar({ seed }: { seed: number }) {
  const bgs = [['#ffcf8a','#ff8a5c'],['#9be8b0','#37b57a'],['#a5c6ff','#6272f2'],['#ffe17a','#ffa02e'],['#f7b0dd','#c862dc'],['#a6dcff','#4aa0e6']];
  const skins = ['#f4cfa8','#e6b088','#c98d62','#f8dcc4','#a8714a','#dca47a'];
  const hairs = ['#2b1b17','#5b3a26','#d9a441','#151515','#8a2e2e','#3a2a5c'];
  const shirts = ['#2f2a4a','#c9403f','#1f6f6b','#f0f0f0','#3a5bd0','#222'];
  const s = Math.abs(seed | 0);
  const bg = bgs[s % 6], sk = skins[(s * 7 + 1) % 6], hr = hairs[(s * 5 + 2) % 6], sh = shirts[(s * 3 + 4) % 6], style = (s * 11 + 3) % 4;
  let hair = '';
  if (style === 0) hair = `<path d="M10.5 19c-.6-7.5 4-10.5 9.5-10.5S30 11.5 29.5 19c-1.8-3.6-5.2-5-9.5-5s-7.7 1.4-9.5 5z" fill="${hr}"/>`;
  else if (style === 1) hair = `<circle cx="13" cy="13" r="4.5" fill="${hr}"/><circle cx="20" cy="10.5" r="5" fill="${hr}"/><circle cx="27" cy="13" r="4.5" fill="${hr}"/>`;
  else if (style === 2) hair = `<path d="M9.5 24c-1.5-9 2-16 10.5-16s12 7 10.5 16c-1.2-2-2-5-2-8-3.5 1-11 1-14.5 0 0 3-.8 6-2 8z" fill="${hr}"/>`;
  else hair = `<path d="M11 17.5c1-5 4.5-7 9-7s8 2 9 7c-3-2.5-6-3-9-3s-6 .5-9 3z" fill="${hr}"/>`;
  const id = 'av' + s;
  const svg = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="40" height="40" fill="url(#${id})"/><ellipse cx="20" cy="42" rx="15" ry="11" fill="${sh}"/><rect x="17" y="26" width="6" height="6" rx="3" fill="${sk}"/><circle cx="20" cy="20" r="8.6" fill="${sk}"/>${hair}<circle cx="16.8" cy="20.3" r="1" fill="#2a1414"/><circle cx="23.2" cy="20.3" r="1" fill="#2a1414"/><path d="M17.2 24c1.8 1.6 3.8 1.6 5.6 0" fill="none" stroke="#7a3a2a" stroke-width="1.1" stroke-linecap="round"/>`;
  return <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
