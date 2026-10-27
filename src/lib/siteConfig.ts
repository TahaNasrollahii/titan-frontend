/**
 * Site-wide SEO, contact, and URL configuration.
 * Configured dynamically via environment variables.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://titan-front.vercel.app')
).replace(/\/$/, '');

export const SITE_NAME = 'تایتان';
export const SITE_DEFAULT_TITLE = 'تایتان | پلتفرم گیمینگ، خرید پول بازی‌ها و تورنومنت آنلاین';
export const SITE_DEFAULT_DESCRIPTION =
  'پلتفرم تخصصی گیمینگ تایتان؛ خرید قانونی و سریع ویباکس فورتنایت، ولورانت پوینت، سی‌پی کال آو دیوتی موبایل، جم کلش آف کلنز، اکانت پرمیوم و شرکت در تورنومنت‌های هفتگی همراه با جوایز نقدی.';

export const SECURITY_CONTACT_EMAIL =
  process.env.SECURITY_CONTACT_EMAIL ||
  process.env.NEXT_PUBLIC_SECURITY_CONTACT_EMAIL ||
  'tahanasrollahii@gmail.com';

export const SOCIAL_TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || '';
export const SOCIAL_DISCORD = process.env.NEXT_PUBLIC_DISCORD_URL || '';

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/images/banner-hero.webp`,
  width: 1200,
  height: 630,
  alt: 'پلتفرم گیمینگ و مسابقات تایتان',
};
