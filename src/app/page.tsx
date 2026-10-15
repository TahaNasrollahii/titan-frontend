import type { Metadata } from 'next';
import React from 'react';
import TitanHomeClient from './TitanHomeClient';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'تایتان | پلتفرم گیمینگ، خرید پول بازی‌ها و مسابقات آنلاین',
  description: SITE_DEFAULT_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/images/banner-hero.webp`],
  },
};

export default function TitanPage() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/hero/characters/apexlegends.webp"
        fetchPriority="high"
      />
      <h1 className="sr-only">تایتان — پلتفرم گیمینگ، خرید پول بازی‌ها و مسابقات آنلاین</h1>
      <TitanHomeClient />
    </>
  );
}
