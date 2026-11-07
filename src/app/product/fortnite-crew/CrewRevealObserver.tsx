'use client';

import { useEffect } from 'react';
import { useAppContext, type AddToCartInput } from '@/context/AppContext';
import styles from './crew.module.css';

interface CrewRevealObserverProps {
  rootId: string;
  cartProduct?: AddToCartInput['product'];
  expanded?: boolean;
}

const REVEAL_CLASS_MAP: Record<string, string> = {
  rv: styles.rv,
  x1: styles.x1,
  x2: styles.x2,
  x3: styles.x3,
  x4: styles.x4,
  x5: styles.x5,
  sl: styles.sl,
  sr: styles.sr,
  ln: styles.ln,
};

export function CrewRevealObserver({ rootId, cartProduct, expanded }: CrewRevealObserverProps) {
  const { addToCart } = useAppContext();

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    root.classList.add(styles.jsReady);

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-rv]'));
    els.forEach((el) => {
      const key = el.dataset.rv;
      if (key && REVEAL_CLASS_MAP[key]) {
        el.classList.add(REVEAL_CLASS_MAP[key]);
      }
    });

    const revealEl = (el: HTMLElement) => {
      el.classList.add(styles.in);
      el.dataset.rvIn = '1';
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach(revealEl);
    } else {
      const observed = new WeakSet<HTMLElement>();

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              const target = en.target as HTMLElement;
              revealEl(target);
              io.unobserve(target);
            }
          });
        },
        { threshold: 0, rootMargin: '0px 0px -12% 0px' }
      );

      const checkInView = () => {
        const triggerBottom = window.innerHeight * 0.88;
        els.forEach((el) => {
          if (el.dataset.rvIn === '1') return;
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerBottom && rect.bottom >= 0) {
            revealEl(el);
            io.unobserve(el);
          } else if (!observed.has(el)) {
            observed.add(el);
            io.observe(el);
          }
        });
      };

      checkInView();
      const t1 = window.setTimeout(checkInView, 150);
      const t2 = window.setTimeout(checkInView, 600);
      window.addEventListener('scroll', checkInView, { passive: true });
      window.addEventListener('resize', checkInView, { passive: true });

      const buyBtns = cartProduct
        ? Array.from(root.querySelectorAll<HTMLElement>('[data-crew-buy-btn="true"]'))
        : [];
      const handleBuyClick = (e: Event) => {
        if (!cartProduct) return;
        e.preventDefault();
        void addToCart({ product: cartProduct, quantity: 1 });
      };
      buyBtns.forEach((btn) => btn.addEventListener('click', handleBuyClick));

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.removeEventListener('scroll', checkInView);
        window.removeEventListener('resize', checkInView);
        io.disconnect();
        buyBtns.forEach((btn) => btn.removeEventListener('click', handleBuyClick));
      };
    }

    const buyBtns = cartProduct
      ? Array.from(root.querySelectorAll<HTMLElement>('[data-crew-buy-btn="true"]'))
      : [];
    const handleBuyClick = (e: Event) => {
      if (!cartProduct) return;
      e.preventDefault();
      void addToCart({ product: cartProduct, quantity: 1 });
    };
    buyBtns.forEach((btn) => btn.addEventListener('click', handleBuyClick));

    return () => {
      buyBtns.forEach((btn) => btn.removeEventListener('click', handleBuyClick));
    };
  }, [rootId, cartProduct, addToCart, expanded]);

  return null;
}
