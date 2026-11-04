import type { Metadata } from 'next';
import React from 'react';
import { AboutView } from './AboutView';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { PlatformStats } from '@/lib/api/types';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildAboutPageSchema } from '@/lib/seo/schema';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'درباره تایتان | فروشگاه آیتم بازی‌ها و پلتفرم تورنومنت',
  description:
    'آشنایی با پلتفرم گیمینگ تایتان؛ فروشگاه تخصصی ارز و آیتم بازی‌های آنلاین با پشتیبانی ۲۴ ساعته و برگزارکننده تورنومنت‌های هفتگی همراه با جوایز نقدی.',
  alternates: {
    canonical: `${SITE_URL}/about`,
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

async function getPlatformStats(): Promise<PlatformStats | null> {
  try {
    const res = await fetch(`${API_URL}/stats/`, {
      next: { revalidate: 3600, tags: ['stats'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as PlatformStats;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const initialStats = await getPlatformStats();

  return (
    <>
      <JsonLd data={buildAboutPageSchema()} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'درباره ما', path: '/about' },
        ]}
      />
      <AboutView initialStats={initialStats} />
    </>
  );
}
