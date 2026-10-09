'use client';

import React, { ReactNode } from 'react';

import type { ApiError } from '@/lib/api/client';

import { Icon } from '../Icons';
import styles from './state.module.css';

/**
 * Branded loader: the Titan logo in a spinning ring of light. It fades in after a short delay, so
 * quick loads never flash it. ``compact`` is for a section inside a page (a list, "load more").
 */
export function Loading({ label = 'در حال بارگذاری', compact = false }: { label?: string; compact?: boolean }) {
  // Callers pass labels like "در حال بارگذاری..."; the animated dots replace the trailing ones.
  const text = label.replace(/[.…]+$/, '');
  return (
    <div className={`${styles.loading} ${compact ? styles.compact : ''}`} role="status" aria-live="polite">
      <span className={styles.loader} aria-hidden="true">
        <span className={styles.glow} />
        <span className={styles.ring} />
        <span className={styles.orbit}>
          <span className={styles.spark} />
        </span>
        <span className={styles.core}>
          <img src="/titan-logo.png" alt="" />
        </span>
      </span>
      <span className={styles.label}>
        {text}
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </span>
      {!compact && <span className={styles.bar} aria-hidden="true" />}
    </div>
  );
}

interface ErrorStateProps {
  error?: ApiError | null;
  /** Overrides the message taken from ``error``. */
  message?: string | null;
  onRetry?: () => void;
}

export function ErrorState({ error, message, onRetry }: ErrorStateProps) {
  const notFound = error?.status === 404;
  return (
    <div className={styles.state} role="alert">
      <Icon name={notFound ? 'search' : 'x'} />
      <span>{notFound ? 'موردی پیدا نشد.' : (message ?? error?.detail ?? 'خطایی رخ داد.')}</span>
      {onRetry && !notFound && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

export function Empty({ icon = 'search', children }: { icon?: string; children: ReactNode }) {
  return (
    <div className={styles.state}>
      <Icon name={icon} />
      <div>{children}</div>
    </div>
  );
}
