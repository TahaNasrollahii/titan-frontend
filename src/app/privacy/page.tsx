import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'حریم خصوصی و امنیت اطلاعات کاربران',
  description:
    'سیاست حفظ حریم خصوصی کاربران در پلتفرم گیمینگ تایتان؛ نحوه محافظت از اطلاعات حساب کاربری، رمزنگاری اطلاعات اکانت بازی و امنیت پرداخت‌ها.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: `حریم خصوصی و امنیت حساب‌ها | ${SITE_NAME}`,
    description:
      'نحوه حفاظت از اطلاعات شخصی، امنیت اکانت‌های بازی و تراکنش‌های بانکی در پلتفرم تایتان.',
    url: `${SITE_URL}/privacy`,
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `حریم خصوصی و امنیت حساب‌ها | ${SITE_NAME}`,
    description:
      'نحوه حفاظت از اطلاعات شخصی، امنیت اکانت‌های بازی و تراکنش‌های بانکی در پلتفرم تایتان.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function PrivacyPage() {
  return (
    <article
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '28px 20px 64px',
        lineHeight: 1.9,
        color: 'rgba(255, 255, 255, 0.86)',
      }}
    >
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'حریم خصوصی', path: '/privacy' },
        ]}
      />

      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
          سیاست حفظ حریم خصوصی و امنیت اطلاعات در تایتان
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.68)', margin: 0 }}>
          تایتان متعهد به حفاظت کامل از حریم خصوصی، اطلاعات تماس و امنیت حساب‌های گیمینگ کاربران خود است.
        </p>
      </header>

      <section
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۱. اطلاعات دریافتی و کاربرد آن‌ها</h2>
        <p>
          اطلاعاتی نظیر شماره موبایل، نام کاربری و آدرس ایمیل صرفاً جهت احراز هویت با کد یک‌بارمصرف (OTP)، اطلاع‌رسانی وضعیت سفارش‌ها و هماهنگی مسابقات استفاده می‌شوند و هرگز در اختیار اشخاص ثالث قرار نخواهند گرفت.
        </p>
      </section>

      <section
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۲. امنیت اکانت‌های بازی (Game Accounts)</h2>
        <p>
          برای سفارش‌هایی که نیازمند شارژ مستقیم اکانت هستند، اطلاعات ورود با الگوریتم‌های رمزنگاری استاندارد محافظت شده و تنها در لحظه انجام سفارش توسط اپراتور مجاز بررسی می‌گردد. پس از تکمیل سفارش، دسترسی موقت بسته می‌شود.
        </p>
      </section>

      <section
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۳. امنیت تراکنش‌های مالی</h2>
        <p>
          تمامی پرداخت‌های آنلاین مستقیماً در درگاه رسمی شاپرک و زرین‌پال پردازش می‌شوند و تایتان هیچ‌گونه دسترسی به اطلاعات کارت بانکی، رمز دوم یا CVV2 کاربران ندارد. در صورت داشتن هرگونه سوال امنیتی می‌توانید از طریق{' '}
          <Link href="/contact" style={{ color: '#ff6b72' }}>
            صفحه تماس با پشتیبانی
          </Link>{' '}
          با تیم ما در ارتباط باشید.
        </p>
      </section>
    </article>
  );
}
