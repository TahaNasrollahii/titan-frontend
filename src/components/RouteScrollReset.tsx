'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Start every new page at the top.
 *
 * Next's own scroll-to-segment check gives up when the new page first renders a short loading
 * state that is already on screen; the page then keeps the old scroll offset, and Chrome's scroll
 * anchoring pushes it further down once the content arrives. Scrolling to 0 right after the route
 * commits avoids both (anchoring never applies at offset 0). Back/forward keeps the browser's
 * restored position.
 */
export function RouteScrollReset() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      fromHistory.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
