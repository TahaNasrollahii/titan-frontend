import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'قوانین، مقررات و شرایط تحویل و بازگشت وجه',
  description:
    'قوانین و مقررات استفاده از پلتفرم گیمینگ تایتان، شرایط تحویل آنی گیفت کارت و آیتم‌های درون‌برنامه‌ای، قوانین تورنومنت‌ها و ضمانت بازگشت وجه.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: `قوانین، مقررات و شرایط بازگشت وجه | ${SITE_NAME}`,
    description:
      'قوانین خرید از فروشگاه گیمینگ تایتان، نحوه تحویل سفارش‌ها، شرایط عودت وجه و مقررات شرکت در مسابقات.',
    url: `${SITE_URL}/terms`,
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `قوانین و مقررات | ${SITE_NAME}`,
    description:
      'قوانین خرید از فروشگاه گیمینگ تایتان، نحوه تحویل سفارش‌ها، شرایط عودت وجه و مقررات شرکت در مسابقات.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function TermsPage() {
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
          { name: 'قوانین و مقررات', path: '/terms' },
        ]}
      />

      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
          قوانین، مقررات و شرایط تحویل و بازگشت وجه در تایتان
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.68)', margin: 0 }}>
          شفافیت، امنیت حساب کاربری شما و تحویل سریع و قانونی سفارش‌ها اولویت اصلی پلتفرم گیمینگ تایتان است.
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
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۱. نحوه تحویل سفارش‌ها و زمان‌بندی</h2>
        <p>
          محصولات موجود در <Link href="/store" style={{ color: '#ff6b72' }}>فروشگاه تایتان</Link> به سه روش اصلی تحویل داده می‌شوند:
        </p>
        <ul>
          <li>
            <strong>کد دیجیتال (Redeem Code):</strong> بلافاصله پس از تایید پرداخت در پنل کاربری و بخش سفارش‌ها نمایش داده می‌شود.
          </li>
          <li>
            <strong>شارژ مستقیم اکانت (Account Top-Up):</strong> توسط تیم پشتیبانی رسمی و از طریق ریجن‌های قانونی در کوتاه‌ترین زمان (معمولاً بین ۱۵ تا ۶۰ دقیقه) انجام می‌شود.
          </li>
          <li>
            <strong>سفارش‌های آیتم شاپ و گیفت درون‌بازی:</strong> مطابق قوانین شرکت سازنده بازی (مانند Epic Games یا Riot Games) پس از تایید دوستی یا اطلاعات اکانت ارسال می‌گردد.
          </li>
        </ul>
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
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۲. شرایط ضمانت و بازگشت وجه</h2>
        <p>
          تمامی پرداخت‌ها از طریق درگاه امن بانکی و کیف پول داخلی تایتان انجام می‌گیرد:
        </p>
        <ul>
          <li>
            در صورتی که به هر دلیل امکان تامین یا تحویل سفارش در زمان مقرر وجود نداشته باشد، مبلغ پرداختی به صورت کامل (۱۰۰٪) به کیف پول یا حساب بانکی کاربر عودت داده می‌شود.
          </li>
          <li>
            کدهای دیجیتالی که پس از خرید به کاربر نمایش داده شده‌اند، به دلیل ماهیت یک‌بارمصرف، پس از تحویل قابل مرجوعی نیستند؛ اما اصالت و سلامت کد تا لحظه فعال‌سازی کاملاً تضمین می‌شود.
          </li>
        </ul>
      </section>

      <section
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginTop: 0 }}>۳. مقررات شرکت در تورنومنت‌ها</h2>
        <p>
          شرکت‌کنندگان در <Link href="/tournaments" style={{ color: '#ff6b72' }}>مسابقات آنلاین تایتان</Link> موظف به رعایت اصول بازی جوانمردانه (Fair Play)، حضور به موقع در لابی مسابقه و عدم استفاده از هرگونه نرم‌افزار تقلب هستند. جوایز نقدی نفرات برتر پس از تایید نهایی جدول مسابقات به کیف پول یا شماره شبای ثبت‌شده واریز می‌گردد.
        </p>
      </section>
    </article>
  );
}
