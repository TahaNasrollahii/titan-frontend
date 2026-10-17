import type { Metadata } from 'next';
import React from 'react';
import TournamentsClient from './TournamentsClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { Game, Paginated, TournamentSummary } from '@/lib/api/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'لیست مسابقات و تورنومنت‌های فعال',
  description:
    'لیست کامل تورنومنت‌های فعال و رویدادهای آینده فورتنایت، ولورانت، اپکس لجندز در تایتان؛ مشاهده زمان برگزاری، ظرفیت، استخر جوایز نقدی و ثبت‌نام مسابقات.',
  alternates: {
    canonical: '/tournaments',
  },
  openGraph: {
    title: 'لیست مسابقات و تورنومنت‌های فعال | تایتان',
    description:
      'مشاهده رویدادهای در حال ثبت‌نام و فعال، استخر جوایز نقدی و ثبت‌نام تیمی یا انفرادی در مسابقات آنلاین تایتان.',
    url: `${SITE_URL}/tournaments`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/tournoment-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'لیست مسابقات و تورنومنت‌های فعال تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'لیست مسابقات و تورنومنت‌های فعال | تایتان',
    description: 'مشاهده رویدادهای فعال و ثبت‌نام مسابقات هفتگی بازی‌ها در تایتان با جوایز نقدی',
    images: [`${SITE_URL}/images/tournoment-banner.webp`],
  },
};

async function getInitialTournaments(): Promise<Paginated<TournamentSummary> | null> {
  try {
    const res = await fetch(`${API_URL}/tournaments/?ordering=starts_at&page=1&page_size=12`, {
      next: { revalidate: 300, tags: ['tournaments'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getGames(): Promise<Game[] | null> {
  try {
    const res = await fetch(`${API_URL}/games/`, {
      next: { revalidate: 3600, tags: ['games'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function TournamentsPage() {
  const [initialTournaments, initialGames] = await Promise.all([
    getInitialTournaments(),
    getGames(),
  ]);

  return (
    <>
      <h1 className="sr-only">تورنومنت‌ها و مسابقات آنلاین گیمینگ تایتان</h1>
      <TournamentsClient initialTournaments={initialTournaments} initialGames={initialGames} />
    </>
  );
}
