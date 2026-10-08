'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimate, usePresence, useReducedMotion } from 'framer-motion';
import { useAppContext, Toast as ToastType } from '@/context/AppContext';
import { Icon } from './Icons';

/** Size of the bubble that drops in before it stretches open. */
const PILL = 46;

/** How long a toast takes to drop in and open. Wait this long before a full-page navigation. */
export const TOAST_OPEN_MS = 1100;

function Toast({ toast, onRemove }: { toast: ToastType; onRemove: (id: number) => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const reduce = useReducedMotion();

  // Enter: a small bubble drops from the top, then stretches open left and right.
  useEffect(() => {
    const island = scope.current;
    const body = bodyRef.current!;
    const open = { width: body.offsetWidth, height: body.offsetHeight };

    if (reduce) {
      animate(island, { ...open, opacity: 1 }, { duration: 0.2 });
      animate(body, { opacity: 1, filter: 'blur(0px)' }, { duration: 0.2 });
      return;
    }

    (async () => {
      await animate(
        island,
        { y: [-80, 0], scaleY: [1.35, 1], scaleX: [0.75, 1], opacity: [0, 1] },
        { type: 'spring', stiffness: 420, damping: 20 },
      );
      animate(dotRef.current!, { opacity: 0, scale: 0.4 }, { duration: 0.2 });
      animate(island, open, { type: 'spring', stiffness: 260, damping: 22 });
      await animate(body, { opacity: 1, filter: 'blur(0px)' }, { delay: 0.1, duration: 0.35 });
    })();
    // Runs once per toast; content does not change after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit: fold back into a bubble and float away upwards.
  useEffect(() => {
    if (isPresent) return;
    const island = scope.current;

    (async () => {
      if (!reduce) {
        await animate(bodyRef.current!, { opacity: 0, filter: 'blur(6px)' }, { duration: 0.15 });
        animate(dotRef.current!, { opacity: 1, scale: 1 }, { duration: 0.15 });
        await animate(island, { width: PILL, height: PILL }, { type: 'spring', stiffness: 380, damping: 30 });
      }
      await animate(island, { y: -70, opacity: 0, scale: 0.6 }, { duration: 0.25, ease: 'easeIn' });
      safeToRemove?.();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  return (
    <motion.div layout className="island-slot">
      <div ref={scope} className={`island tone-${toast.tone ?? 'info'}`} role="status" style={{ width: PILL, height: PILL, opacity: 0 }}>
        <span ref={dotRef} className="island-dot" />
        <div ref={bodyRef} className="island-body" style={{ opacity: 0, filter: 'blur(6px)' }}>
          <span className="island-ic">
            <Icon name={toast.icon || 'bell'} />
          </span>
          <div className="island-text">
            <b>{toast.title}</b>
            {toast.text && <span>{toast.text}</span>}
          </div>
          <button className="island-close" aria-label="بستن" onClick={() => onRemove(toast.id)}>
            <Icon name="x" />
          </button>
        </div>
        {/* Time left; pauses on hover. Its end dismisses the toast. */}
        <span className="island-progress" onAnimationEnd={() => onRemove(toast.id)} />
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="toasts" id="toasts" aria-live="polite">
      <AnimatePresence>
        {/* Newest on top, right under the drop point */}
        {[...toasts].reverse().map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
