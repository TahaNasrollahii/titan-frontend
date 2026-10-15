import type { Metadata } from 'next';
import React from 'react';
import { AboutView } from './AboutView';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'درباره ما',
  description:
    'درباره پلتفرم تایتان؛ مرجع تخصصی گیمینگ و ورزش‌های الکترونیک در ایران، خرید قانونی و تحویل فوری پول بازی‌ها و برگزاری تورنومنت‌های جایزه‌دار.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'درباره ما | پلتفرم گیمینگ تایتان',
    description:
      'آشنایی با تیم، اهداف، آمار و ارزش‌های پلتفرم گیمینگ و اسپورت تایتان در ایران.',
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/banner-hero.webp`,
        width: 1200,
        height: 630,
        alt: 'درباره تیم تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'درباره ما | تایتان',
    description: 'آشنایی با اهداف و تیم پلتفرم گیمینگ تایتان',
    images: [`${SITE_URL}/images/banner-hero.webp`],
  },
};

export default function AboutPage() {
  return <AboutView />;
}
