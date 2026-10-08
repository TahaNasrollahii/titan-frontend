'use client';

import { useEffect, useSyncExternalStore } from 'react';

let locks = 0;

/** While `active`: lock page scroll (nesting-safe) and close on Escape. */
export function useOverlay(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    const { style } = document.documentElement;
    style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      locks -= 1;
      if (locks === 0) style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, onClose]);
}

/** True after hydration, so portals into document.body never render on the server. */
export function useMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

const subscribeNever = () => () => {};
