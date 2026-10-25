import type { Metadata } from 'next';
import React from 'react';
import TitanHomeClient from './TitanHomeClient';
import { API_URL, sanitizeApiPayload } from '@/lib/api/client';
import type { Home } from '@/lib/api/types';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from '@/lib/siteConfig';

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: SITE_DEFAULT_TITLE,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
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

async function getHomeData(): Promise<Home | null> {
  try {
    const res = await fetch(`${API_URL}/home/`, {
      next: { revalidate: 60, tags: ['home', 'products', 'games', 'promos'] },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return sanitizeApiPayload((await res.json()) as Home);
    }
  } catch {
    // Graceful fallback on network error
  }
  return null;
}

export default async function TitanPage() {
  const initialData = await getHomeData();

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/hero/characters/valorant.webp"
        fetchPriority="high"
      />
      <h1 className="sr-only">تایتان — پلتفرم گیمینگ، خرید پول بازی‌ها و مسابقات آنلاین</h1>
      <TitanHomeClient initialData={initialData} />
    </>
  );
}
