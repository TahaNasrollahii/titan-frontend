import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد (۴۰۴)',
  description: 'متأسفانه صفحه‌ای که به دنبال آن بودید در پلتفرم تایتان پیدا نشد.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
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
          fontSize: '7rem',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-2px',
          background: 'linear-gradient(135deg, #ff3b30 0%, #ff7b72 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 0 40px rgba(255, 59, 48, 0.3)',
        }}
      >
        ۴۰۴
      </div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '0.75rem',
        }}
      >
        صفحه مورد نظر پیدا نشد!
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '460px',
          lineHeight: 1.8,
          marginBottom: '2rem',
        }}
      >
        آدرسی که وارد کرده‌اید وجود ندارد، حذف شده یا منتقل شده است. از لینک‌های زیر می‌توانید به بخش‌های مختلف تایتان بازگردید.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/"
          className="pill-white"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            color: '#0e0b16',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          صفحه اصلی
        </Link>
        <Link
          href="/store"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          فروشگاه بازی‌ها
        </Link>
        <Link
          href="/tournaments"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          تورنومنت‌ها
        </Link>
      </div>
    </div>
  );
}
