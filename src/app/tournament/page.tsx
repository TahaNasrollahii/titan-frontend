import type { Metadata } from 'next';
import React from 'react';
import TournamentHubClient from './TournamentHubClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { Game, Paginated, Promo, RankTier, TournamentSummary } from '@/lib/api/types';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'مرکز مسابقات و جدول رتبه‌بندی فصل',
  description:
    'هاب مسابقات تایتان؛ جدول رده‌بندی برترین بازیکنان و تیم‌های فصل، امتیازات لیدربرد، قوانین شرکت در رقابت‌ها و ورود به تورنومنت‌های هفتگی همراه با جوایز نقدی.',
  alternates: {
    canonical: `${SITE_URL}/tournament`,
  },
  openGraph: {
    title: 'مرکز مسابقات و جدول رتبه‌بندی فصل | تایتان',
    description:
      'مشاهده رتبه‌بندی فصل برترین بازیکنان و تیم‌های اسپورت، پایش امتیازات لیدربرد و راهنمای شرکت در تورنومنت‌های تایتان.',
    url: `${SITE_URL}/tournament`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/tournoment-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'مسابقات و لیدربورد تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرکز مسابقات و جدول رتبه‌بندی فصل | تایتان',
    description: 'جدول رده‌بندی گیمرها، پایش امتیازات و هاب مسابقات آنلاین تایتان',
    images: [`${SITE_URL}/images/tournoment-banner.webp`],
  },
};

async function fetchJson<T>(url: string, revalidateSec = 300, tags: string[] = []): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSec, tags },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function TournamentHubPage() {
  const [promos, ranks, upcoming, games] = await Promise.all([
    fetchJson<Promo[]>(`${API_URL}/content/promos/?placement=tournament_hero`, 300, ['promos']),
    fetchJson<RankTier[]>(`${API_URL}/ranks/`, 3600, ['ranks']),
    fetchJson<Paginated<TournamentSummary>>(
      `${API_URL}/tournaments/?status=registration_open&status=upcoming&status=live&ordering=starts_at&page_size=3`,
      300,
      ['tournaments'],
    ),
    fetchJson<Game[]>(`${API_URL}/games/?is_featured=true`, 3600, ['games']),
  ]);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'مرکز مسابقات', path: '/tournament' },
        ]}
      />
      <TournamentHubClient initialData={{ promos, ranks, upcoming, games }} />
    </>
  );
}
