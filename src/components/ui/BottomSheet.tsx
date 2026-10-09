'use client';

import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';

import { useMounted, useOverlay } from '@/lib/hooks/useOverlay';

import { Icon } from '../Icons';
import styles from './bottomSheet.module.css';

const SPRING = { type: 'spring', stiffness: 380, damping: 36 } as const;

/** Phone bottom sheet: backdrop, drag-down (from the handle strip) to close, Escape and scroll lock. */
export function BottomSheet({
  open,
  onClose,
  label,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Optional heading shown next to the close button. */
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  const mounted = useMounted();
  const drag = useDragControls();
  useOverlay(open, onClose);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            exit={{ y: '105%' }}
            transition={SPRING}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            {/* Drag from the top strip only, so the rest of the sheet can scroll on short screens */}
            <div className={styles.grab} onPointerDown={event => drag.start(event)}>
              <span className={styles.handle} aria-hidden />
              {title && <span className={styles.title}>{title}</span>}
              <button
                type="button"
                className={styles.close}
                aria-label="بستن"
                onPointerDown={event => event.stopPropagation()}
                onClick={onClose}
              >
                <Icon name="x" />
              </button>
            </div>
            <div className={styles.body}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
