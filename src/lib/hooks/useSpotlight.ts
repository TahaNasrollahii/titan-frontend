'use client';

import { DependencyList, useEffect } from 'react';

/**
 * Pointer parallax/spotlight for elements matching ``selector``: sets ``--px/--py`` (-1…1) and
 * ``--mx/--my`` (px) CSS variables. Re-binds when ``deps`` change (e.g. after data loads).
 */
export function useSpotlight(selector: string, deps: DependencyList = []) {
  useEffect(() => {
    const move = (event: Event) => {
      const pointer = event as PointerEvent;
      const el = pointer.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = pointer.clientX - rect.left;
      const y = pointer.clientY - rect.top;
      el.style.setProperty('--px', String((x / rect.width) * 2 - 1));
      el.style.setProperty('--py', String((y / rect.height) * 2 - 1));
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const leave = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', leave, { passive: true });
    });
    return () =>
      elements.forEach(el => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers decide when to re-bind
  }, [selector, ...deps]);
}
