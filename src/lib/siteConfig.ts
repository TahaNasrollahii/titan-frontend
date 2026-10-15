/**
 * Site-wide SEO and URL configuration.
 * Configured dynamically via NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://titan-front.vercel.app')
).replace(/\/$/, '');

export const SITE_NAME = 'تایتان';
export const SITE_DEFAULT_TITLE = 'تایتان | پلتفرم گیمینگ، خرید پول بازی‌ها و تورنومنت آنلاین';
export const SITE_DEFAULT_DESCRIPTION =
  'پلتفرم تخصصی گیمینگ تایتان؛ خرید قانونی و سریع ویباکس فورتنایت، ولورانت پوینت، اپکس کوین، اکانت پرمیوم و شرکت در تورنومنت‌های هفتگی همراه با جوایز نقدی.';

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/images/banner-hero.webp`,
  width: 1200,
  height: 630,
  alt: 'پلتفرم گیمینگ و مسابقات تایتان',
};

