'use client';

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { toEnglishDigits } from '@/lib/format';

import styles from './OtpBubbles.module.css';

export type OtpStatus = 'idle' | 'verifying' | 'success' | 'error';

/** How long the success animation runs before the page may navigate away. */
export const OTP_SUCCESS_MS = 1700;

type Props = {
  id: string;
  length: number;
  value: string;
  status: OtpStatus;
  onChange: (value: string) => void;
  /** Called once every bubble is filled. */
  onComplete: (value: string) => void;
};

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = i % 2 ? 72 : 96;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, light: i % 3 === 0 };
});

function bubbleMotion(
  status: OtpStatus,
  index: number,
  length: number,
  reduce: boolean,
): { animate: TargetAndTransition; transition: Transition } {
  const rest = { x: '0%', y: 0, scale: 1, rotate: 0, opacity: 1 };
  if (reduce) {
    return { animate: { ...rest, opacity: status === 'success' ? 0 : 1 }, transition: { duration: 0.3 } };
  }

  switch (status) {
    case 'verifying':
      return {
        animate: { ...rest, y: [0, -9, 0] },
        transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: index * 0.1, ease: 'easeInOut' },
      };
    case 'success': {
      // Jolt, bounce, then fly into the centre where the check badge appears.
      const toCenter = `${((length - 1) / 2 - index) * 122}%`;
      return {
        animate: {
          x: ['0%', '0%', '0%', '0%', toCenter],
          y: [0, -26, 5, 0, 0],
          scale: [1, 1.3, 0.9, 1, 0.2],
          rotate: [0, index % 2 ? 14 : -14, 0, 0, 0],
          opacity: [1, 1, 1, 1, 0],
        },
        transition: { duration: 1, times: [0, 0.22, 0.42, 0.6, 1], delay: index * 0.06, ease: 'easeInOut' },
      };
    }
    case 'error':
      return { animate: { ...rest, scale: [1, 0.86, 1.06, 1] }, transition: { duration: 0.45 } };
    default:
      return { animate: rest, transition: { type: 'spring', stiffness: 300, damping: 22 } };
  }
}

export function OtpBubbles({ id, length, value, status, onChange, onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const locked = status === 'verifying' || status === 'success';

  // Ready for (re)entry: on mount and after a wrong code has been cleared.
  useEffect(() => {
    if (status === 'idle') inputRef.current?.focus({ preventScroll: true });
  }, [status]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const digits = toEnglishDigits(event.target.value).replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete(digits);
  };

  const activeIndex = focused && status === 'idle' && value.length < length ? value.length : -1;

  return (
    <motion.div
      className={styles.otp}
      animate={status === 'error' && !reduce ? { x: [0, -12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input
        ref={inputRef}
        id={id}
        className={styles.input}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        readOnly={locked}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {Array.from({ length }, (_, index) => {
        const char = value[index] ?? '';
        const { animate, transition } = bubbleMotion(status, index, length, reduce);
        const className = [
          styles.bubble,
          char && styles.filled,
          index === activeIndex && styles.active,
          status === 'success' && styles.success,
          status === 'error' && styles.error,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <motion.div key={index} className={className} animate={animate} transition={transition} aria-hidden>
            {char ? (
              <>
                <motion.span
                  key={`digit-${char}`}
                  className={styles.digit}
                  initial={{ scale: 0, y: 12, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                >
                  {char}
                </motion.span>
                <motion.span
                  key={`ripple-${char}`}
                  className={styles.ripple}
                  initial={{ scale: 0.7, opacity: 0.8 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              </>
            ) : (
              index === activeIndex && <span className={styles.caret} />
            )}
          </motion.div>
        );
      })}

      {status === 'success' && (
        <div className={styles.burst} aria-hidden>
          {!reduce &&
            [0, 0.15].map(delay => (
              <motion.span
                key={delay}
                className={styles.shockwave}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 2.8, opacity: [0, 0.9, 0] }}
                transition={{ delay: 0.8 + delay, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          {!reduce &&
            SPARKS.map((spark, i) => (
              <motion.span
                key={i}
                className={`${styles.spark} ${spark.light ? styles.sparkLight : ''}`}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{ x: spark.x, y: spark.y, scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                transition={{ delay: 0.82, duration: 0.75, ease: 'easeOut' }}
              />
            ))}
          <motion.span
            className={styles.badge}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: reduce ? 0 : 0.78, type: 'spring', stiffness: 260, damping: 13 }}
          >
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none">
              <motion.path
                d="M6 12.5l4 4L18 8.5"
                stroke="#fff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: reduce ? 0 : 1, duration: 0.35, ease: 'easeOut' }}
              />
            </svg>
          </motion.span>
        </div>
      )}
    </motion.div>
  );
}
