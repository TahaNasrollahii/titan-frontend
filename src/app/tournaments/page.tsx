import type { Metadata } from 'next';
import React from 'react';
import TournamentsClient from './TournamentsClient';
import TournamentHubClient from '../tournament/TournamentHubClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL, sanitizeApiPayload } from '@/lib/api/client';
import type { Game, Paginated, Promo, RankTier, TournamentSummary } from '@/lib/api/types';
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

  const baseTitle = 'تورنومنت‌های آنلاین و جدول رتبه‌بندی فصل بازی‌ها';
  const title = page > 1 ? `${baseTitle} — صفحه ${page}` : baseTitle;
  const description =
    'شرکت در تورنومنت‌های هفتگی فورتنایت، ولورانت، کالاف دیوتی موبایل و فیفا در تایتان؛ مشاهده جدول رتبه‌بندی فصل، جوایز نقدی و ثبت‌نام آنلاین مسابقات.';

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
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/images/titan-tournament-banner.webp`,
          width: 1200,
          height: 630,
          alt: 'بنر تورنومنت‌ها و جدول رتبه‌بندی مسابقات تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}/images/titan-tournament-banner.webp`],
    },
  };
}

async function fetchJson<T>(url: string, revalidateSec = 300, tags: string[] = []): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSec, tags },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return sanitizeApiPayload((await res.json()) as T);
  } catch {
    return null;
  }
}

async function getInitialTournaments(page = 1): Promise<Paginated<TournamentSummary> | null> {
  return fetchJson<Paginated<TournamentSummary>>(
    `${API_URL}/tournaments/?ordering=starts_at&page=${page}&page_size=${PAGE_SIZE}`,
    300,
    ['tournaments'],
  );
}

async function getGames(): Promise<Game[] | null> {
  return fetchJson<Game[]>(`${API_URL}/games/`, 3600, ['games']);
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const sp = (await searchParams) ?? {};
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 1 ? pageRaw : 1;

  const [initialTournaments, initialGames, promos, ranks, upcoming, featuredGames] = await Promise.all([
    getInitialTournaments(currentPage),
    getGames(),
    fetchJson<Promo[]>(`${API_URL}/content/promos/?placement=tournament_hero`, 300, ['promos']),
    fetchJson<RankTier[]>(`${API_URL}/ranks/`, 3600, ['ranks']),
    fetchJson<Paginated<TournamentSummary>>(
      `${API_URL}/tournaments/?status=registration_open&status=upcoming&status=live&ordering=starts_at&page_size=3`,
      300,
      ['tournaments'],
    ),
    fetchJson<Game[]>(`${API_URL}/games/?is_featured=true`, 3600, ['games']),
  ]);

  const totalCount = initialTournaments?.count ?? 0;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'تورنومنت‌ها', path: '/tournaments' },
        ]}
      />
      <TournamentHubClient initialData={{ promos, ranks, upcoming, games: featuredGames ?? initialGames }} />
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
