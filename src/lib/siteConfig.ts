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
export const SITE_DEFAULT_TITLE = 'تایتان | فروشگاه آیتم و ارز بازی‌ها و تورنومنت آنلاین';
export const SITE_DEFAULT_DESCRIPTION =
  'فروشگاه گیمینگ تایتان؛ خرید ویباکس و کروپک فورتنایت، ولورانت پوینت، سی‌پی کالاف دیوتی موبایل و جم کلش آف کلنز با تحویل سریع، پشتیبانی و تورنومنت‌های هفتگی.';

/**
 * True on Vercel preview deployments, explicit noindex overrides, or while SITE_URL
 * still points to a staging `*.vercel.app` hostname instead of the production domain.
 * Once NEXT_PUBLIC_SITE_URL is set to the production domain, production indexing is enabled automatically.
 */
export const IS_STAGING_ENV =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_NOINDEX === 'true' ||
  SITE_URL.includes('.vercel.app');

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
