'use client';

import React, { useRef, useState } from 'react';
import type { CrewBenefitBlock } from './content';
import { CrewIcon } from './CrewIcon';
import styles from './crew.module.css';

interface CrewCarouselProps {
  items: CrewBenefitBlock[];
  hint: string;
  onActiveCardClick?: (id: string) => void;
}

export function CrewCarousel({ items, hint, onActiveCardClick }: CrewCarouselProps) {
  const [cur, setCur] = useState(0);
  const startXRef = useRef<number | null>(null);
  const movedRef = useRef(false);

  const n = items.length;
  const go = (k: number) => {
    setCur(((k % n) + n) % n);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
    movedRef.current = false;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const startX = startXRef.current ?? e.clientX;
    const dx = e.clientX - startX;
    startXRef.current = null;
    if (Math.abs(dx) > 45) {
      movedRef.current = true;
      go(dx < 0 ? cur + 1 : cur - 1);
    }
  };

  return (
    <div className={styles.carouselCol}>
      <div className={styles.cardStage}>
        <div className={styles.glow} />
        <div
          className={styles.deckArea}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {items.map((b, i) => {
            let d = (i - cur + n) % n;
            if (d > n / 2) d -= n;
            const a = Math.abs(d);
            const front = d === 0;
            const visible = a <= 2;

            const scaleVal = Number((1 - a * 0.13).toFixed(4));
            const opacityVal = visible ? Number((1 - a * 0.3).toFixed(4)) : 0;
            const tf = `translateX(calc(${d} * var(--hc-dx, 150px))) translateY(calc(${a} * var(--hc-dy, 16px))) scale(${scaleVal}) rotate(${d * 5}deg)`;

            return (
              <a
                key={b.id}
                href={`#${b.id}`}
                data-front={front ? 'true' : undefined}
                draggable={false}
                className={`${styles.hc}${front ? ` ${styles.fl}` : ''}`}
                style={{
                  transform: tf,
                  opacity: opacityVal,
                  zIndex: 10 - a,
                  pointerEvents: visible ? 'auto' : 'none',
                }}
                onClick={(e) => {
                  if (movedRef.current) {
                    e.preventDefault();
                    movedRef.current = false;
                    return;
                  }
                  if (!front) {
                    e.preventDefault();
                    go(i);
                  } else if (onActiveCardClick) {
                    onActiveCardClick(b.id);
                  }
                }}
              >
                <div
                  className={styles.hcInner}
                  style={{
                    background: b.grad,
                    border: `1px solid ${front ? 'rgba(242,184,75,.55)' : 'rgba(255,255,255,.12)'}`,
                  }}
                >
                  <div className={styles.hcTop}>
                    <div className={styles.hcIconBox}>
                      <CrewIcon icon={b.icon} size={34} stroke={b.ink} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className={styles.hcBottom}>
                    <div className={styles.hcTag}>{b.tag}</div>
                    <div className={styles.hcTitle}>{b.title}</div>
                    {front && (
                      <div className={styles.hcMore} style={{ color: b.ink }}>
                        مشاهده توضیحات ↓
                      </div>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className={styles.controlsRow}>
        <button
          type="button"
          aria-label="کارت بعدی"
          onClick={() => go(cur + 1)}
          className={styles.navBtn}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>

        <div className={styles.dotsRow}>
          {items.map((b, i) => {
            const active = i === cur;
            return (
              <button
                key={b.id}
                type="button"
                aria-label={`کارت ${b.tag}`}
                onClick={() => go(i)}
                className={styles.dotBtn}
              >
                <span
                  className={styles.dotBar}
                  style={{
                    width: active ? '28px' : '8px',
                    background: active ? '#f2b84b' : 'rgba(255,255,255,.25)',
                  }}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="کارت قبلی"
          onClick={() => go(cur - 1)}
          className={styles.navBtn}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
      </div>

      <p className={styles.carouselHint}>{hint}</p>
    </div>
  );
}

