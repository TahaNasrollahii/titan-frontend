import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildFaqSchema, type FaqItem } from '@/lib/seo/schema';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'سوالات متداول خرید آیتم بازی، تحویل آنی و تورنومنت‌ها',
  description:
    'پاسخ به سوالات متداول کاربران درباره خرید ویباکس فورتنایت، ولورنت پوینت، گیفت کارت، زمان تحویل سفارش‌ها و نحوه ثبت‌نام در تورنومنت‌های تایتان.',
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: `سوالات متداول و راهنمای خرید | ${SITE_NAME}`,
    description:
      'راهنمای کامل خرید از فروشگاه گیمینگ تایتان، زمان تحویل کدهای دیجیتال و شارژ اکانت، و نحوه شرکت در مسابقات.',
    url: `${SITE_URL}/faq`,
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `سوالات متداول و راهنمای خرید | ${SITE_NAME}`,
    description:
      'راهنمای کامل خرید از فروشگاه گیمینگ تایتان، زمان تحویل کدهای دیجیتال و شارژ اکانت، و نحوه شرکت در مسابقات.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'زمان تحویل سفارش‌های فروشگاه تایتان چقدر است؟',
    answer:
      'محصولات دارای کد دیجیتال (گیفت کارت‌ها و کدهای ریدیم) بلافاصله پس از پرداخت تحویل داده می‌شوند. سفارش‌های شارژ مستقیم اکانت (مانند ویباکس فورتنایت یا سی‌پی کالاف دیوتی موبایل) معمولاً بین ۱۵ تا ۶۰ دقیقه تکمیل می‌گردند.',
  },
  {
    question: 'آیا خرید ویباکس، ولورنت پوینت و آیتم‌های بازی در تایتان قانونی است؟',
    answer:
      'بله، تمامی محصولات و شارژهای اکانت از طریق استورهای رسمی و با روش‌های ۱۰۰٪ قانونی انجام می‌شوند و هیچ‌گونه خطر بن یا محدودیت برای اکانت شما ندارند.',
  },
  {
    question: 'چگونه می‌توانم در تورنومنت‌های آنلاین تایتان شرکت کنم؟',
    answer:
      'کافی است وارد حساب کاربری خود شوید، از بخش تورنومنت‌ها مسابقه مورد نظر (انفرادی یا تیمی) را انتخاب کرده و ثبت‌نام خود را تکمیل کنید. کد لابی و زمان دقیق بازی‌ها در صفحه همان تورنومنت و داشبورد شما نمایش داده می‌شود.',
  },
  {
    question: 'در صورت عدم تحویل یا بروز مشکل در سفارش چه اتفاقی می‌افتد؟',
    answer:
      'تمامی سفارش‌ها در تایتان شامل ضمانت کامل تحویل یا بازگشت ۱۰۰٪ وجه هستند. تیم پشتیبانی آنلاین ۲۴ ساعته از طریق چت زنده سایت و تلگرام آماده پیگیری لحظه‌ای سفارش شماست.',
  },
  {
    question: 'جوایز نقدی تورنومنت‌ها چگونه به برندگان پرداخت می‌شود؟',
    answer:
      'پس از پایان مسابقه و تایید نهایی نتایج توسط داوران، مبلغ جایزه به کیف پول برنده اضافه شده و امکان تسویه و واریز مستقیم به حساب بانکی فراهم است.',
  },
];

export default function FaqPage() {
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
      <JsonLd data={buildFaqSchema(FAQ_ITEMS)} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'سوالات متداول', path: '/faq' },
        ]}
      />

      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
          سوالات متداول و راهنمای خرید و تحویل سفارش‌ها
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.68)', margin: 0 }}>
          پاسخ به پرتکرارترین پرسش‌ها درباره خرید از{' '}
          <Link href="/store" style={{ color: '#ff6b72' }}>
            فروشگاه گیمینگ تایتان
          </Link>{' '}
          و شرکت در{' '}
          <Link href="/tournaments" style={{ color: '#ff6b72' }}>
            تورنومنت‌های آنلاین
          </Link>
          .
        </p>
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {FAQ_ITEMS.map((item, idx) => (
          <section
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '22px 24px',
            }}
          >
            <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              {item.question}
            </h2>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.76)' }}>{item.answer}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
