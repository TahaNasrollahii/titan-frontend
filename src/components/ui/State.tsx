'use client';

import React, { ReactNode } from 'react';

import type { ApiError } from '@/lib/api/client';

import { Icon } from '../Icons';
import styles from './state.module.css';

export function Loading({ label = 'در حال بارگذاری...' }: { label?: string }) {
  return (
    <div className={styles.state} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
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
