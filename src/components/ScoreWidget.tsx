'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ScoreStats {
  matches: number;
  wins: number;
  losses: number;
  points: number;
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const ITEMS = [
  { key: 'matches', name: 'تعداد بازی‌ها', color: '#7458d6', fg: '#fff' },
  { key: 'wins', name: 'تعداد بردها', color: '#fff1b8', fg: '#2b1013' },
  { key: 'losses', name: 'تعداد باخت‌ها', color: '#d9443f', fg: '#fff' },
] as const;

const GLYPHS: Record<(typeof ITEMS)[number]['key'], React.ReactNode> = {
  matches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 7h9A4.5 4.5 0 0 1 21 11.5v1a4.5 4.5 0 0 1-4.5 4.5h-1.2l-1.8-2h-3l-1.8 2H7.5A4.5 4.5 0 0 1 3 12.5v-1A4.5 4.5 0 0 1 7.5 7z" />
      <path d="M8 10v3M6.5 11.5h3" />
      <circle cx="15.6" cy="10.8" r=".6" />
      <circle cx="17.6" cy="12.6" r=".6" />
    </svg>
  ),
  wins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  losses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </svg>
  ),
};

const LAYERS = [
  { n: 5, rot: 0.3, spd: 0.1, off: 0, rs: 1.0, a: 0.96, g: [0, -1, 0, 0.95], st: [[0, '#f5524a'], [0.5, '#c2343b'], [1, 'rgba(90,24,40,0)']], rim: 'rgba(255,150,140,.30)' },
  { n: 6, rot: 1.4, spd: -0.06, off: 3, rs: 0.96, a: 0.45, g: [0.7, -0.5, -0.5, 0.9], st: [[0, '#ff9a90'], [1, 'rgba(255,120,120,0)']], rim: 'rgba(255,190,180,.18)' },
  { n: 5, rot: 1.1, spd: -0.07, off: 2, rs: 0.95, a: 0.94, g: [-1, -0.2, 0.75, 0.3], st: [[0, '#fff6d2'], [0.45, '#ebcf9c'], [1, 'rgba(190,130,110,0)']], rim: 'rgba(255,255,255,.42)' },
  { n: 6, rot: 0.4, spd: 0.055, off: 4, rs: 0.92, a: 0.93, g: [-0.7, 1, 0.45, -0.25], st: [[0, '#bdb1ff'], [0.5, '#6f5ad9'], [1, 'rgba(80,60,190,0)']], rim: 'rgba(215,205,255,.40)' },
] as const;

/** Animated "your score" flower: total points in the middle, games / wins / losses below. */
export function ScoreWidget({ stats }: { stats: ScoreStats | null }) {
  const blobRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<(typeof ITEMS)[number] | null>(null);

  const values: ScoreStats = stats ?? { matches: 0, wins: 0, losses: 0, points: 0 };
  const coreLabel = hovered ? hovered.name : 'مجموع امتیاز';
  const coreValue = hovered ? values[hovered.key] : values.points;

  // Canvas animation (purely decorative).
  useEffect(() => {
    const blob = blobRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!blob || !canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layers = LAYERS.map(layer => ({ ...layer, rot: layer.rot as number }));
    const bands = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2];
    let size = 0;
    let dpr = 1;
    let kick = 0;
    let visible = true;
    let last = performance.now();
    let frame = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = blob.offsetWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
    };
    const simulate = (t: number, dt: number) => {
      for (let k = 0; k < 6; k++) {
        const target = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.1 + k * 0.37) + k * 1.9));
        bands[k] += (target - bands[k]) * dt * 3;
      }
      kick += (Math.sin(t * 1.5) * 0.6 - kick) * dt * 4;
    };
    const draw = (dt: number) => {
      const R = size * 0.5;
      const scale = 1 + 0.04 * kick;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.translate(R, R);
      for (const L of layers) {
        L.rot += dt * L.spd;
        const R0 = size * 0.41 * L.rs * scale;
        const sigma = 0.36 * ((Math.PI * 2) / L.n);
        ctx.beginPath();
        for (let i = 0; i <= 150; i++) {
          const th = (i / 150) * Math.PI * 2;
          let r = 0.84;
          for (let j = 0; j < L.n; j++) {
            let d = th - (L.rot + (j * 2 * Math.PI) / L.n);
            d = Math.atan2(Math.sin(d), Math.cos(d));
            r += (0.2 + 0.17 * bands[(j + L.off) % 6]) * Math.exp(-(d * d) / (sigma * sigma));
          }
          const x = Math.cos(th) * r * R0;
          const y = Math.sin(th) * r * R0;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        const gradient = ctx.createLinearGradient(L.g[0] * R, L.g[1] * R, L.g[2] * R, L.g[3] * R);
        L.st.forEach(([offset, color]) => gradient.addColorStop(offset, color));
        ctx.globalAlpha = L.a;
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = L.rim;
        ctx.stroke();
      }
      blob.style.setProperty('--kick', kick.toFixed(3));
    };
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (visible && !document.hidden) {
        simulate(now / 1000, dt);
        draw(dt);
      }
      frame = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    resizeObserver.observe(blob);
    intersection.observe(blob);
    resize();
    if (reduce) {
      simulate(1.3, 0.016);
      draw(0);
    } else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, []);

  return (
    <div className="stat-wrap col reveal" style={{ '--d': 4, flex: 1, display: 'flex', width: '100%' } as React.CSSProperties}>
      <article
        className="stat spot reveal"
        style={{ '--d': 5, flex: 1, padding: '12px 16px', gap: '8px', justifyContent: 'center' } as React.CSSProperties}
      >
        <div className="blob" ref={blobRef} style={{ width: 'min(195px, 80%)', margin: '0 auto' }}>
          <canvas ref={canvasRef} aria-hidden="true"></canvas>
          <div className="core" style={{ transform: 'scale(1)' }}>
            <small>{coreLabel}</small>
            <strong>{fmt(coreValue)}</strong>
          </div>
        </div>
        <div className="gh-row" style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginTop: '4px' }}>
          {ITEMS.map(item => (
            <button
              key={item.key}
              className="gh"
              style={{ '--c': item.color } as React.CSSProperties}
              aria-label={item.name}
              onPointerEnter={() => setHovered(item)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(item)}
              onBlur={() => setHovered(null)}
            >
              <span className="ic" style={{ background: item.color, color: item.fg }}>
                {GLYPHS[item.key]}
              </span>
              <span className="gv">{fmt(values[item.key])}</span>
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}
