import type { Metadata } from 'next';
import React from 'react';
import TournamentsClient from './TournamentsClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { Game, Paginated, TournamentSummary } from '@/lib/api/types';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PaginationNav } from '@/components/seo/PaginationNav';

export const revalidate = 300;

const PAGE_SIZE = 12;

type SearchParamsRecord = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 1 ? pageRaw : 1;
  const hasFacetedParams = Boolean(sp.game || sp.status || sp.ordering || sp.search || sp.q);

  const canonical =
    page > 1 && !hasFacetedParams
      ? `${SITE_URL}/tournaments?page=${page}`
      : `${SITE_URL}/tournaments`;

  const baseTitle = 'لیست مسابقات و تورنومنت‌های فعال';
  const title = page > 1 ? `${baseTitle} — صفحه ${page}` : baseTitle;
  const description =
    'لیست کامل تورنومنت‌های فعال و رویدادهای آینده فورتنایت، ولورانت، اپکس لجندز در تایتان؛ مشاهده زمان برگزاری، ظرفیت، استخر جوایز نقدی و ثبت‌نام مسابقات.';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: hasFacetedParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description:
        'مشاهده رویدادهای در حال ثبت‌نام و فعال، استخر جوایز نقدی و ثبت‌نام تیمی یا انفرادی در مسابقات آنلاین تایتان.',
      url: canonical,
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
      title: `${title} | ${SITE_NAME}`,
      description: 'مشاهده رویدادهای فعال و ثبت‌نام مسابقات هفتگی بازی‌ها در تایتان با جوایز نقدی',
      images: [`${SITE_URL}/images/tournoment-banner.webp`],
    },
  };
}

async function getInitialTournaments(page = 1): Promise<Paginated<TournamentSummary> | null> {
  try {
    const res = await fetch(`${API_URL}/tournaments/?ordering=starts_at&page=${page}&page_size=${PAGE_SIZE}`, {
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

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const sp = (await searchParams) ?? {};
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 1 ? pageRaw : 1;

  const [initialTournaments, initialGames] = await Promise.all([
    getInitialTournaments(currentPage),
    getGames(),
  ]);

  const totalCount = initialTournaments?.count ?? 0;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'مرکز مسابقات', path: '/tournament' },
          { name: 'لیست تورنومنت‌ها', path: '/tournaments' },
        ]}
      />
      <TournamentsClient initialTournaments={initialTournaments} initialGames={initialGames} />
      <PaginationNav
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        basePath="/tournaments"
      />
    </>
  );
}
