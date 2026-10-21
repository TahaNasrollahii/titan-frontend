'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      // Surface Core Web Vitals (LCP, INP, CLS, FCP, TTFB) in dev console for debugging
      console.debug(`[WebVitals] ${metric.name}:`, Math.round(metric.value), metric.rating);
    }
    const endpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;
    if (endpoint && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        navigator.sendBeacon(
          endpoint,
          JSON.stringify({
            id: metric.id,
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            navigationType: metric.navigationType,
            pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
          }),
        );
      } catch {
        // Ignore beacon errors
      }
    }
  });

  return null;
}
