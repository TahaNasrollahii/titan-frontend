'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './SpecialEventBracket.module.css';

export interface EventData {
  badge: string;
  title: string;
  sub: string;
  status: string;
  finalWhen: string;
  prize: string;
  viewers: string;
  teams: Record<string, [string, string, string]>;
  r16L: [string, number, string, number][];
  qfL: [string, number, string, number][];
  sfL: [string, number, string, number][];
  r16R: [string, number, string, number][];
  qfR: [string, number, string, number][];
  sfR: [string, number, string, number][];
  final: [string, number, string, number];
}

export const DEFAULT_FIFA_EVENT: EventData = {
  badge: '★ رویداد ویژه',
  title: 'جدول حذفی — جام ویژه فیفا ۲۴',
  sub: '۱۶ تیم برتر لیگ تایتان · حذف مستقیم · ۱۵ مسابقه زنده',
  status: 'پایان‌یافته',
  finalWhen: 'جمعه ۲۲:۰۰',
  prize: '۱۵۰٬۰۰۰٬۰۰۰ تومان',
  viewers: '۱۲٬۴۰۸ نفر',
  teams: {
    SW: ['Shadow Wolves', '#a97bd6', '#5a2b6e'],
    IF: ['Iron Falcons', '#6fa8dc', '#1c4a7a'],
    DO: ['Dark Orbit', '#7b7fe0', '#2a2c6e'],
    CF: ['Crimson Fangs', '#ff5a35', '#7a1f16'],
    NP: ['Night Phantoms', '#6b7080', '#22252c'],
    PK: ['Pixel Kings', '#e06fb0', '#7a2358'],
    TL: ['Thunder Lynx', '#f2b24a', '#8a5a14'],
    AW: ['Arctic Wolves', '#7fd6ff', '#1c6f99'],
    NV: ['Neon Vipers', '#4ad0a0', '#1a6b52'],
    SH: ['Solar Hawks', '#ff9a4a', '#9a4a14'],
    SR: ['Storm Riders', '#8aa0ff', '#2a3a8a'],
    RT: ['Red Titans', '#ff5a35', '#c23a1d'],
    GU: ['Ghost Unit', '#9aa0ac', '#3a3e48'],
    OF: ['Omega Five', '#c07bff', '#4a1f7a'],
    VW: ['Void Walkers', '#a07bd6', '#2a1a4a'],
    CL: ['Cyber Lions', '#5fd07a', '#1a6b3a'],
  },
  r16L: [
    ['SW', 3, 'IF', 1],
    ['DO', 2, 'CF', 3],
    ['NP', 2, 'PK', 0],
    ['TL', 1, 'AW', 2],
  ],
  qfL: [
    ['SW', 2, 'CF', 1],
    ['NP', 1, 'AW', 2],
  ],
  sfL: [
    ['SW', 3, 'AW', 1],
  ],
  r16R: [
    ['NV', 3, 'SH', 1],
    ['SR', 0, 'RT', 2],
    ['GU', 2, 'OF', 1],
    ['VW', 1, 'CL', 3],
  ],
  qfR: [
    ['NV', 1, 'RT', 2],
    ['GU', 3, 'CL', 2],
  ],
  sfR: [
    ['RT', 2, 'GU', 1],
  ],
  final: ['SW', 3, 'RT', 2],
};

const CW = 136;
const CH = 58;
const FW = 160;
const FH = 64;

function fa(n: number | string) {
  return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function winner(match: [string, number, string, number]): string {
  return match[1] > match[3] ? match[0] : match[2];
}

interface BracketGeom {
  W: number;
  H: number;
  CX: number;
  YF: number;
  X: Record<string, number>;
  Y16: number[];
  YQF: number[];
  labels: { x: number; text: string; y: number }[];
}

function geom(m: 'qf' | 'r16'): BracketGeom {
  if (m === 'r16') {
    return {
      W: 1072,
      H: 496,
      CX: 536,
      YF: 300,
      X: { l0: 0, l1: 152, l2: 304, f: 456, r2: 632, r1: 784, r0: 936 },
      Y16: [150, 250, 350, 450],
      YQF: [200, 400],
      labels: [
        { x: 0, text: 'یک‌هشتم نهایی', y: 87 },
        { x: 152, text: 'یک‌چهارم نهایی', y: 137 },
        { x: 304, text: 'نیمه‌نهایی', y: 237 },
        { x: 632, text: 'نیمه‌نهایی', y: 237 },
        { x: 784, text: 'یک‌چهارم نهایی', y: 137 },
        { x: 936, text: 'یک‌هشتم نهایی', y: 87 },
      ],
    };
  }
  return {
    W: 768,
    H: 396,
    CX: 384,
    YF: 276,
    X: { l1: 0, l2: 152, f: 304, r2: 480, r1: 632 },
    Y16: [],
    YQF: [206, 346],
    labels: [
      { x: 0, text: 'یک‌چهارم نهایی', y: 143 },
      { x: 152, text: 'نیمه‌نهایی', y: 213 },
      { x: 480, text: 'نیمه‌نهایی', y: 213 },
      { x: 632, text: 'یک‌چهارم نهایی', y: 143 },
    ],
  };
}

export function SpecialEventBracket({ event = DEFAULT_FIFA_EVENT }: { event?: EventData }) {
  const [mode, setMode] = useState<'qf' | 'r16'>('qf');
  const [leaving, setLeaving] = useState(false);
  const [highlightCode, setHighlightCode] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qfBtnRef = useRef<HTMLButtonElement>(null);
  const r16BtnRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const champCode = winner(event.final);
  const g = geom(mode);

  // Scale-to-fit
  const fit = useCallback(() => {
    if (!scrollerRef.current || !bracketRef.current || !holderRef.current) return;
    const avail = scrollerRef.current.clientWidth;
    const s = Math.max(avail < 640 ? 0.82 : 0.5, Math.min(1, avail / g.W));
    bracketRef.current.style.transform = `scale(${s})`;
    holderRef.current.style.width = `${g.W * s}px`;
    holderRef.current.style.height = `${g.H * s}px`;
    const over = g.W * s > avail + 2;
    if (hintRef.current) {
      if (over) hintRef.current.classList.add(styles.on);
      else hintRef.current.classList.remove(styles.on);
    }
    if (over) {
      scrollerRef.current.scrollLeft = (g.W * s - avail) / 2;
    }
  }, [g.W, g.H]);

  // Pill positioning
  const updatePill = useCallback(() => {
    const activeBtn = mode === 'qf' ? qfBtnRef.current : r16BtnRef.current;
    const pill = pillRef.current;
    if (!activeBtn || !pill) return;
    pill.style.left = `${activeBtn.offsetLeft}px`;
    pill.style.width = `${activeBtn.offsetWidth}px`;
  }, [mode]);

  useEffect(() => {
    fit();
    updatePill();
    window.addEventListener('resize', fit);
    window.addEventListener('resize', updatePill);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('resize', updatePill);
    };
  }, [fit, updatePill]);

  // Mode Switch Animation
  const switchMode = (newMode: 'qf' | 'r16') => {
    if (newMode === mode) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setMode(newMode);
      return;
    }
    setLeaving(true);
    setTimeout(() => {
      setMode(newMode);
      setLeaving(false);
    }, 210);
  };

  // Keyboard Navigation on Segmented Control
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = mode === 'qf' ? 'r16' : 'qf';
      switchMode(next);
      if (next === 'qf') qfBtnRef.current?.focus();
      else r16BtnRef.current?.focus();
    }
  };

  // Stage Particles
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !stageRef.current || !canvasRef.current) return;

    const cv = canvasRef.current;
    const stage = stageRef.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let SW_ = stage.clientWidth;
    let SH_ = stage.clientHeight;
    cv.width = SW_;
    cv.height = SH_;

    const sizeCv = () => {
      if (!stage) return;
      SW_ = stage.clientWidth;
      SH_ = stage.clientHeight;
      cv.width = SW_;
      cv.height = SH_;
    };

    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(sizeCv);
      ro.observe(stage);
    }

    const colors = ['#ff5a35', '#f0c866', '#a97bd6', '#ffffff', '#ff9a6a'];
    interface Particle {
      t: 'c' | 'e';
      x: number;
      y: number;
      w?: number;
      h?: number;
      r?: number;
      vy: number;
      vx?: number;
      ph?: number;
      sp?: number;
      rot?: number;
      vr?: number;
      col: string;
      a?: number;
      life?: number;
      max?: number;
    }

    const mk = (type: 'c' | 'e', init: boolean): Particle => {
      if (type === 'c') {
        return {
          t: 'c',
          x: Math.random() * SW_,
          y: init ? Math.random() * SH_ : -12,
          w: 5 + Math.random() * 5,
          h: 3 + Math.random() * 3,
          vy: 0.5 + Math.random() * 0.9,
          ph: Math.random() * 6.28,
          sp: 0.01 + Math.random() * 0.02,
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.08,
          col: colors[Math.floor(Math.random() * colors.length)],
          a: 0.25 + Math.random() * 0.4,
        };
      }
      return {
        t: 'e',
        x: Math.random() * SW_,
        y: init ? Math.random() * SH_ : SH_ + 10,
        r: 0.8 + Math.random() * 1.8,
        vy: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        life: 0,
        max: 260 + Math.random() * 240,
        col: Math.random() > 0.5 ? '255,90,53' : '240,200,102',
      };
    };

    const ps: Particle[] = [];
    for (let i = 0; i < 30; i++) ps.push(mk('c', true));
    for (let j = 0; j < 30; j++) ps.push(mk('e', true));

    let animId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, SW_, SH_);
      for (let k = 0; k < ps.length; k++) {
        const p = ps[k];
        if (p.t === 'c') {
          p.y += p.vy;
          p.ph! += p.sp!;
          p.x += Math.sin(p.ph!) * 0.5;
          p.rot! += p.vr!;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot!);
          ctx.globalAlpha = p.a!;
          ctx.fillStyle = p.col;
          ctx.fillRect(-p.w! / 2, -p.h! / 2, p.w!, p.h!);
          ctx.restore();
          if (p.y > SH_ + 12) ps[k] = mk('c', false);
        } else {
          p.y -= p.vy;
          p.x += p.vx!;
          p.life!++;
          const t = p.life! / p.max!;
          let a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
          a = Math.max(0, Math.min(1, a)) * 0.7;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r!, 0, 6.283);
          ctx.fillStyle = `rgba(${p.col},${a})`;
          ctx.fill();
          if (p.life! >= p.max! || p.y < -10) ps[k] = mk('e', false);
        }
      }
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      if (ro) ro.disconnect();
    };
  }, []);

  const off = mode === 'r16' ? 0 : 0.4;
  const X = g.X;
  const finalTop = g.YF - FH / 2;
  const plateBottom = 180;
  const cl = `M${g.CX} ${finalTop} V${plateBottom + 2}`;

  // Card rendering
  const renderCard = (
    m: [string, number, string, number],
    x: number,
    yc: number,
    w: number,
    h: number,
    delay: number,
    extraClass?: string,
    tag?: string,
  ) => {
    const wn = winner(m);
    const codeA = m[0];
    const scoreA = m[1];
    const teamA = event.teams[codeA] || [codeA, '#888', '#444'];
    const isWinA = wn === codeA;
    const isHlA = highlightCode === codeA;

    const codeB = m[2];
    const scoreB = m[3];
    const teamB = event.teams[codeB] || [codeB, '#888', '#444'];
    const isWinB = wn === codeB;
    const isHlB = highlightCode === codeB;

    return (
      <div
        key={`${m[0]}-${m[2]}-${x}-${yc}`}
        className={`${styles.m} ${extraClass ? (styles as Record<string, string>)[extraClass] || extraClass : ''}`}
        style={{
          left: `${x}px`,
          top: `${yc - h / 2}px`,
          width: `${w}px`,
          height: `${h}px`,
          ['--d' as string]: `${delay.toFixed(2)}s`,
          ['--sd' as string]: `${(delay * 2 + 1).toFixed(2)}s`,
        }}
      >
        {tag && <span className={styles.tag}>{tag}</span>}

        {/* Team A */}
        <div
          className={`${styles.t} ${isWinA ? styles.win : styles.lose} ${isHlA ? styles.hl : ''}`}
          data-t={codeA}
          onMouseEnter={() => setHighlightCode(codeA)}
          onMouseLeave={() => setHighlightCode(null)}
        >
          <span
            className={styles.crest}
            style={{ background: `linear-gradient(140deg, ${teamA[1]}, ${teamA[2]})` }}
          >
            {codeA}
          </span>
          <span className={styles.name}>{teamA[0]}</span>
          <span className={styles.score}>{fa(scoreA)}</span>
        </div>

        {/* Team B */}
        <div
          className={`${styles.t} ${isWinB ? styles.win : styles.lose} ${isHlB ? styles.hl : ''}`}
          data-t={codeB}
          onMouseEnter={() => setHighlightCode(codeB)}
          onMouseLeave={() => setHighlightCode(null)}
        >
          <span
            className={styles.crest}
            style={{ background: `linear-gradient(140deg, ${teamB[1]}, ${teamB[2]})` }}
          >
            {codeB}
          </span>
          <span className={styles.name}>{teamB[0]}</span>
          <span className={styles.score}>{fa(scoreB)}</span>
        </div>
      </div>
    );
  };

  // Connector lines
  const renderConnector = (x1: number, y1: number, x2: number, y2: number, code: string, delay: number) => {
    const xm = (x1 + x2) / 2;
    const isHl = highlightCode === code;
    return (
      <path
        key={`conn-${x1}-${y1}-${x2}-${y2}`}
        className={`${styles.adv} ${isHl ? styles.hl : ''}`}
        pathLength={1}
        data-t={code}
        style={{ ['--d' as string]: `${delay.toFixed(2)}s` }}
        d={`M${x1} ${y1} H${xm} V${y2} H${x2}`}
      />
    );
  };

  return (
    <section className={styles.bracketSection} aria-label={event.title}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.accentBar}></div>
          <div>
            <h2>{event.title}</h2>
            <p>{event.sub}</p>
          </div>
        </div>
        <div className={styles.headRight}>
          <span className={styles.badgeEv}>{event.badge}</span>
          <span className={styles.chip}>{event.status}</span>
        </div>
      </div>

      {/* Glass Stage */}
      <div
        className={`${styles.stage} ${highlightCode ? styles.hovering : ''}`}
        ref={stageRef}
        data-mode={mode}
      >
        <canvas className={styles.fxCanvas} ref={canvasRef}></canvas>

        {/* Filter Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.seg} role="tablist" aria-label="نمای جدول مسابقات" onKeyDown={onKeyDown}>
            <span className={styles.pill} ref={pillRef}></span>
            <button
              type="button"
              role="tab"
              ref={qfBtnRef}
              data-mode="qf"
              aria-selected={mode === 'qf'}
              tabIndex={mode === 'qf' ? 0 : -1}
              onClick={() => switchMode('qf')}
            >
              یک‌چهارم تا فینال <span className={styles.cnt}>۸ تیم</span>
            </button>
            <button
              type="button"
              role="tab"
              ref={r16BtnRef}
              data-mode="r16"
              aria-selected={mode === 'r16'}
              tabIndex={mode === 'r16' ? 0 : -1}
              onClick={() => switchMode('r16')}
            >
              یک‌هشتم تا فینال <span className={styles.cnt}>۱۶ تیم</span>
            </button>
          </div>
        </div>

        {/* Scroller & Scalable Bracket */}
        <div className={styles.scroller} ref={scrollerRef}>
          <div className={styles.holder} ref={holderRef}>
            <div
              className={`${styles.bracket} ${leaving ? styles.leaving : ''}`}
              ref={bracketRef}
              role="group"
              aria-label="جدول مسابقات حذفی"
              style={{ width: `${g.W}px`, height: `${g.H}px`, ['--k' as string]: '0.8' }}
            >
              {/* Rays & Halo */}
              <div className={styles.rays} style={{ left: `${g.CX - 190}px` }}></div>
              <div className={styles.halo} style={{ left: `${g.CX - 120}px` }}></div>

              {/* SVG Connectors */}
              <svg className={styles.linesSvg} width={g.W} height={g.H} viewBox={`0 0 ${g.W} ${g.H}`} fill="none">
                <defs>
                  <linearGradient id="champGradient" gradientUnits="userSpaceOnUse" x1="0" y1={finalTop} x2="0" y2={plateBottom}>
                    <stop offset="0" stopColor="#ff5a35" />
                    <stop offset="1" stopColor="#f0c866" />
                  </linearGradient>
                </defs>

                {/* Connectors for R16 */}
                {mode === 'r16' &&
                  event.r16L.map((mm, i) =>
                    renderConnector(X.l0 + CW, g.Y16[i], X.l1, g.YQF[Math.floor(i / 2)], winner(mm), 0.55),
                  )}
                {mode === 'r16' &&
                  event.r16R.map((mm, i) =>
                    renderConnector(X.r0, g.Y16[i], X.r1 + CW, g.YQF[Math.floor(i / 2)], winner(mm), 0.55),
                  )}

                {/* Connectors for QF */}
                {event.qfL.map((mm, i) =>
                  renderConnector(X.l1 + CW, g.YQF[i], X.l2, g.YF, winner(mm), 0.95 - off),
                )}
                {event.qfR.map((mm, i) =>
                  renderConnector(X.r1, g.YQF[i], X.r2 + CW, g.YF, winner(mm), 0.95 - off),
                )}

                {/* Connectors for SF */}
                {event.sfL.map(mm =>
                  renderConnector(X.l2 + CW, g.YF, X.f, g.YF, winner(mm), 1.3 - off),
                )}
                {event.sfR.map(mm =>
                  renderConnector(X.r2, g.YF, X.f + FW, g.YF, winner(mm), 1.3 - off),
                )}

                {/* Champion Line */}
                <path
                  className={`${styles.champLine} ${highlightCode === champCode ? styles.hl : ''}`}
                  pathLength={1}
                  data-t={champCode}
                  d={cl}
                />
                <path className={styles.champFlow} d={cl} />
                <circle r="4" fill="#ffffff">
                  <animateMotion dur="2.2s" repeatCount="indefinite" path={cl} />
                </circle>
              </svg>

              {/* Round Labels */}
              {g.labels.map(l => (
                <div
                  key={`lbl-${l.x}-${l.y}`}
                  className={styles.roundLabel}
                  style={{ left: `${l.x}px`, top: `${l.y}px` }}
                >
                  {l.text}
                </div>
              ))}

              {/* R16 Cards */}
              {mode === 'r16' &&
                event.r16L.map((mm, i) =>
                  renderCard(mm, X.l0, g.Y16[i], CW, CH, 0.1 + i * 0.06, 'oL'),
                )}
              {mode === 'r16' &&
                event.r16R.map((mm, i) =>
                  renderCard(mm, X.r0, g.Y16[i], CW, CH, 0.1 + i * 0.06, 'oR'),
                )}

              {/* QF Cards */}
              {event.qfL.map((mm, i) =>
                renderCard(mm, X.l1, g.YQF[i], CW, CH, 0.5 + i * 0.06 - off),
              )}
              {event.qfR.map((mm, i) =>
                renderCard(mm, X.r1, g.YQF[i], CW, CH, 0.5 + i * 0.06 - off),
              )}

              {/* SF Cards */}
              {event.sfL.map(mm =>
                renderCard(mm, X.l2, g.YF, CW, CH, 0.9 - off),
              )}
              {event.sfR.map(mm =>
                renderCard(mm, X.r2, g.YF, CW, CH, 0.9 - off),
              )}

              {/* Final Card */}
              {renderCard(event.final, X.f, g.YF, FW, FH, 1.3 - off, 'finalCard', 'فینال')}

              {/* Silver Trophy with Red Base */}
              <svg
                className={styles.trophy}
                style={{ left: `${g.CX - 56}px` }}
                viewBox="0 0 140 130"
                fill="none"
              >
                <defs>
                  <linearGradient id="silverCup" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.5" stopColor="#c9ced6" />
                    <stop offset="1" stopColor="#7d8492" />
                  </linearGradient>
                  <linearGradient id="redPlinth" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff6b48" />
                    <stop offset="1" stopColor="#c23a1d" />
                  </linearGradient>
                </defs>
                <path d="M40 14h60v34c0 20-13 34-30 34S40 68 40 48z" fill="url(#silverCup)" />
                <path
                  d="M40 24H22c0 22 8 34 22 36M100 24h18c0 22-8 34-22 36"
                  stroke="url(#silverCup)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <rect x="63" y="80" width="14" height="18" fill="url(#silverCup)" />
                <rect x="46" y="98" width="48" height="12" rx="4" fill="url(#silverCup)" />
                <rect x="38" y="110" width="64" height="10" rx="4" fill="url(#redPlinth)" />
                <path
                  d="M52 22c-2 14 0 28 10 38"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              {/* Twinkling Sparkles */}
              {[
                { x: g.CX - 80, y: 38, d: 0 },
                { x: g.CX + 80, y: 54, d: 0.9 },
                { x: g.CX - 62, y: 112, d: 1.6 },
                { x: g.CX + 66, y: 110, d: 0.4 },
                { x: g.CX + 6, y: 4, d: 1.3 },
              ].map((s, i) => (
                <svg
                  key={`spark-${i}`}
                  className={styles.spark}
                  style={{ left: `${s.x}px`, top: `${s.y}px`, ['--sd' as string]: `${s.d}s` }}
                  viewBox="0 0 24 24"
                  fill="#fff"
                >
                  <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                </svg>
              ))}

              {/* Champion Plate */}
              <div className={styles.pulse} style={{ left: `${g.CX - 95}px` }}></div>
              <div
                className={`${styles.champ} ${highlightCode === champCode ? styles.hl : ''}`}
                style={{ left: `${g.CX - 95}px` }}
                data-t={champCode}
                onMouseEnter={() => setHighlightCode(champCode)}
                onMouseLeave={() => setHighlightCode(null)}
              >
                <span
                  className={styles.crest}
                  style={{
                    background: `linear-gradient(140deg, ${event.teams[champCode][1]}, ${event.teams[champCode][2]})`,
                  }}
                >
                  {champCode}
                </span>
                <span className={styles.champTxt}>
                  <span className={styles.champK}>قهرمان تورنمنت</span>
                  <span className={styles.champV}>{event.teams[champCode][0]}</span>
                </span>
              </div>

              {/* Final Meta */}
              <div
                className={styles.finalMeta}
                style={{ left: `${g.CX - 130}px`, top: `${g.YF + FH / 2 + 10}px` }}
              >
                <div className={styles.finalMetaA}>
                  فینال · {event.finalWhen} · نتیجه {fa(event.final[1])} – {fa(event.final[3])}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.hint} ref={hintRef}>
          برای دیدن کل جدول به چپ و راست بکشید ↔
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span><i className={styles.lgAdv}></i> تیم صعودکرده</span>
          <span><i className={styles.lgHl}></i> مسیر تیم (نشانگر روی نام تیم)</span>
          <span><i className={styles.lgChamp}></i> مسیر قهرمان مسابقات</span>
        </div>
      </div>
    </section>
  );
}
