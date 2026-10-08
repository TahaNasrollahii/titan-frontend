'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMounted, useOverlay } from '@/lib/hooks/useOverlay';
import { KIND_LABELS, useSearchRows } from '@/lib/hooks/useSearch';

import { Icon } from './Icons';
import styles from './MobileSearch.module.css';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

/** Full-screen search for phones, opened from the app bar's search button. */
export function MobileSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const mounted = useMounted();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const { rows, searching } = useSearchRows(query, open);

  const close = useCallback(() => {
    inputRef.current?.blur();
    setQuery('');
    onClose();
  }, [onClose]);
  useOverlay(open, close);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const trimmed = query.trim();

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="جستجو"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.form
            className={styles.head}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={SPRING}
            onSubmit={event => {
              event.preventDefault();
              if (rows[0]) go(rows[0].href);
            }}
          >
            <label className={styles.field}>
              <img src="/icons/search.png" alt="" />
              <input
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                placeholder="بازی، محصول یا تورنمنت…"
                aria-label="جستجوی بازی‌ها، محصولات و تورنمنت‌ها"
                autoComplete="off"
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              {query && (
                <button type="button" className={styles.clear} aria-label="پاک کردن" onClick={() => setQuery('')}>
                  <Icon name="x" />
                </button>
              )}
            </label>
            <button type="button" className={styles.cancel} onClick={close}>
              انصراف
            </button>
          </motion.form>

          <div className={styles.body}>
            <h5>{trimmed ? 'نتایج' : 'پیشنهادهای محبوب'}</h5>
            <ul className={styles.list}>
              {rows.map((row, index) => (
                <motion.li
                  key={row.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: 0.04 * index }}
                >
                  <button type="button" className={styles.row} onClick={() => go(row.href)}>
                    <span className={`${styles.kind} ${styles[row.kind]}`}>{KIND_LABELS[row.kind]}</span>
                    <span className={styles.title}>{row.title}</span>
                    <Icon name="chev" className={styles.chev} />
                  </button>
                </motion.li>
              ))}
            </ul>
            {!searching && trimmed && rows.length === 0 && (
              <p className={styles.empty}>نتیجه‌ای برای «{trimmed}» پیدا نشد.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
