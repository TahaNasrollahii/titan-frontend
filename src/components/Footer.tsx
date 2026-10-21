import React from 'react';
import Link from 'next/link';
import { SITE_NAME, SITE_DEFAULT_DESCRIPTION } from '@/lib/siteConfig';

const STORE_CATEGORY_LINKS = [
  { href: '/store/fortnite', label: 'خرید ویباکس فورتنایت (Fortnite)' },
  { href: '/store/valorant', label: 'خرید ولورنت پوینت (Valorant VP)' },
  { href: '/store/apex-legends', label: 'خرید اپکس کوین (Apex Coins)' },
  { href: '/store/call-of-duty', label: 'خرید سی‌پی کالاف دیوتی (COD)' },
  { href: '/store/ea-fc', label: 'خرید کوین و پوینت فیفا (EA FC)' },
  { href: '/store/premium', label: 'خرید اشتراک پرمیوم (Spotify / Telegram)' },
  { href: '/fortnite-shop', label: 'آیتم شاپ روزانه فورتنایت' },
];

const TOURNAMENT_LINKS = [
  { href: '/tournaments', label: 'لیست مسابقات و تورنومنت‌ها' },
  { href: '/tournament', label: 'هاب ورزش‌های الکترونیک و رنکینگ' },
  { href: '/tournaments/fifa', label: 'تورنومنت جام ویژه فیفا' },
];

const TRUST_LINKS = [
  { href: '/about', label: 'درباره تایتان' },
  { href: '/contact', label: 'تماس با ما و پشتیبانی ۲۴/۷' },
  { href: '/faq', label: 'سوالات متداول و نحوه تحویل آنی' },
  { href: '/terms', label: 'قوانین، مقررات و شرایط بازگشت وجه' },
  { href: '/privacy', label: 'حریم خصوصی و امنیت حساب‌ها' },
];

export function Footer() {
  return (
    <footer
      className="site-footer"
      aria-label="پاورقی سایت تایتان"
      style={{
        marginTop: '48px',
        padding: '36px 24px 96px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(18, 8, 12, 0.4) 0%, rgba(10, 4, 7, 0.85) 100%)',
        color: 'rgba(255, 255, 255, 0.78)',
        fontSize: '0.85rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '28px',
        }}
      >
        <div>
          <strong style={{ display: 'block', fontSize: '1.05rem', color: '#fff', marginBottom: '10px' }}>
            {SITE_NAME} — پلتفرم گیمینگ و تورنومنت آنلاین
          </strong>
          <p style={{ lineHeight: 1.8, color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 14px' }}>
            {SITE_DEFAULT_DESCRIPTION}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.76rem' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#86efac',
              }}
            >
              ✓ تحویل آنی و قانونی
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
              }}
            >
              ✓ پرداخت امن زرین‌پال
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
              }}
            >
              ✓ پشتیبانی آنلاین ۲۴ ساعته
            </span>
          </div>
        </div>

        <nav aria-label="دسته‌بندی‌های فروشگاه">
          <strong style={{ display: 'block', color: '#fff', marginBottom: '10px', fontSize: '0.92rem' }}>
            دسته‌بندی‌های فروشگاه
          </strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            <li>
              <Link href="/store" style={{ color: 'rgba(255, 255, 255, 0.72)', textDecoration: 'none' }}>
                همه محصولات فروشگاه گیمینگ
              </Link>
            </li>
            {STORE_CATEGORY_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} style={{ color: 'rgba(255, 255, 255, 0.72)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="مسابقات و تورنومنت‌ها">
          <strong style={{ display: 'block', color: '#fff', marginBottom: '10px', fontSize: '0.92rem' }}>
            مسابقات و ای‌اسپورتس
          </strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            {TOURNAMENT_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} style={{ color: 'rgba(255, 255, 255, 0.72)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="اطلاعات، قوانین و راهنما">
          <strong style={{ display: 'block', color: '#fff', marginBottom: '10px', fontSize: '0.92rem' }}>
            راهنما، اعتماد و قوانین
          </strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            {TRUST_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} style={{ color: 'rgba(255, 255, 255, 0.72)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '24px auto 0',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: 'rgba(255, 255, 255, 0.48)',
          fontSize: '0.78rem',
        }}
      >
        <span>© {new Date().getFullYear()} تمامی حقوق برای پلتفرم گیمینگ {SITE_NAME} محفوظ است.</span>
        <span>خرید امن آیتم‌های درون برنامه‌ای، گیفت کارت و برگزاری مسابقات آنلاین</span>
      </div>
    </footer>
  );
}
