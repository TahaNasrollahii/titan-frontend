'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <section
      aria-labelledby="error-page-title"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          fontSize: '5.5rem',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
        }}
      >
        ۵۰۰
      </div>
      <h1
        id="error-page-title"
        style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '0.75rem',
        }}
      >
        خطایی در بارگذاری صفحه رخ داد
      </h1>
      <p
        style={{
          fontSize: '0.96rem',
          color: 'rgba(255, 255, 255, 0.72)',
          maxWidth: '480px',
          lineHeight: 1.8,
          marginBottom: '1.75rem',
        }}
      >
        ارتباط موقتاً با سرور دچار اختلال شده است. می‌توانید صفحه را مجدداً تلاش کنید یا به بخش‌های اصلی فروشگاه و تورنومنت‌ها بروید.
      </p>
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.6rem',
            borderRadius: '9999px',
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
          }}
        >
          تلاش مجدد
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.6rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.92rem',
          }}
        >
          صفحه اصلی
        </Link>
        <Link
          href="/store"
          style={{
            padding: '0.75rem 1.6rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.92rem',
          }}
        >
          فروشگاه بازی‌ها
        </Link>
      </div>
    </section>
  );
}
