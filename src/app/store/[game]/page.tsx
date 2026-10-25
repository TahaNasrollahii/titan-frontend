import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import StoreClient from '../StoreClient';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { composeMetaDescription } from '@/lib/seo/meta';
import { PaginationNav } from '@/components/seo/PaginationNav';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import {
  buildCollectionPageSchema,
  resolveBackendRedirect,
  toAbsoluteUrl,
} from '@/lib/seo/schema';
import {
  getAllGames,
  getGameBySlug,
  getStoreGames,
  getStoreProducts,
  getStorePromos,
} from '../getStoreData';

export const revalidate = 30;
export const dynamicParams = true;

interface CategorySearchParams {
  page?: string;
  search?: string;
  q?: string;
  ordering?: string;
  sort?: string;
  price_min?: string;
  price_max?: string;
  category?: string;
  platform?: string;
}

function hasFacetFilters(params: CategorySearchParams): boolean {
  return Boolean(
    params.search ||
      params.q ||
      params.ordering ||
      params.sort ||
      params.price_min ||
      params.price_max ||
      params.category ||
      params.platform,
  );
}

export async function generateStaticParams() {
  const games = await getAllGames();
  if (!games || !games.length) {
    return [
      { game: 'fortnite' },
      { game: 'valorant' },
      { game: 'call-of-duty' },
      { game: 'clash-of-clans' },
      { game: 'premium' },
    ];
  }
  return games.map((g) => ({ game: g.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams?: Promise<CategorySearchParams>;
}): Promise<Metadata> {
  const { game: gameSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const pageNum = Math.max(1, parseInt(resolvedSearch.page || '1', 10) || 1);
  const isFiltered = hasFacetFilters(resolvedSearch);

  const game = await getGameBySlug(gameSlug);
  if (!game) {
    return {
      title: 'دسته‌بندی یافت نشد',
      robots: { index: false, follow: false },
    };
  }

  const pageSuffix = pageNum > 1 ? ` (صفحه ${pageNum.toLocaleString('fa-IR')})` : '';
  const baseTitle = (
    game.metaTitle || `خرید محصولات و پول ${game.title} (${game.titleEn})`
  ).replace(/\s*\|\s*(فروشگاه\s*)?تایتان\s*$/u, '');
  const title = `${baseTitle}${pageSuffix}`;

  const description = composeMetaDescription(
    game.metaDescription || game.introText || game.description,
    `خرید سریع و قانونی پول، اسکین‌ها و آیتم‌های ${game.title} (${game.titleEn}) با بهترین قیمت در فروشگاه تایتان.`,
  );

  const imageUrl = toAbsoluteUrl(
    game.ogImage || game.coverImage || game.backgroundImage || '/images/banner-hero.webp',
  );
  const canonicalUrl =
    game.canonicalUrl ||
    (!isFiltered && pageNum > 1
      ? `${SITE_URL}/store/${game.slug}?page=${pageNum}`
      : `${SITE_URL}/store/${game.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    ...(game.noindex || isFiltered
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: game.imageAlt || `محصولات ${game.title}`,
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function StoreCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams?: Promise<CategorySearchParams>;
}) {
  const { game: gameSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, parseInt(resolvedSearch.page || '1', 10) || 1);

  const game = await getGameBySlug(gameSlug);
  if (!game) {
    await resolveBackendRedirect(`/store/${gameSlug}`);
    notFound();
  }

  const [initialProducts, initialGames, initialDiscountPromos, initialBestsellerPromos] =
    await Promise.all([
      getStoreProducts(game.slug, 12, currentPage),
      getStoreGames(),
      getStorePromos('store_discount'),
      getStorePromos('store_bestseller'),
    ]);

  const collectionSchema = buildCollectionPageSchema({
    name: `خرید محصولات ${game.title} (${game.titleEn})`,
    description:
      game.metaDescription ||
      game.description ||
      `خرید آنلاین محصولات و آیتم‌های ${game.title} (${game.titleEn}) با تحویل آنی در فروشگاه تایتان.`,
    path: currentPage > 1 ? `/store/${game.slug}?page=${currentPage}` : `/store/${game.slug}`,
    products: initialProducts?.results ?? [],
  });

  const bottomSeoText =
    game.bottomSeoText ||
    `در این بخش می‌توانید انواع محصولات، پول درون‌برنامه‌ای، گیفت کارت و بسته‌های ویژه ${game.title} (${game.titleEn}) را با تحویل آنی، قیمت رقابتی و گارانتی معتبر از فروشگاه تایتان تهیه کنید.`;

  return (
    <>
      <JsonLd data={collectionSchema} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'فروشگاه گیمینگ', path: '/store' },
          { name: `${game.title} (${game.titleEn})`, path: `/store/${game.slug}` },
        ]}
      />
      <StoreClient
        initialGame={game.slug}
        initialProducts={initialProducts}
        initialGames={initialGames}
        initialDiscountPromos={initialDiscountPromos}
        initialBestsellerPromos={initialBestsellerPromos}
      />
      <PaginationNav
        basePath={`/store/${game.slug}`}
        currentPage={currentPage}
        totalCount={initialProducts?.count ?? 0}
        pageSize={12}
      />
      <section
        aria-label={`توضیحات تکمیلی خرید محصولات ${game.title}`}
        style={{
          maxWidth: '1320px',
          margin: '24px auto 0',
          padding: '20px 24px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          color: 'rgba(255, 255, 255, 0.72)',
          fontSize: '0.86rem',
          lineHeight: 1.85,
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
          راهنمای خرید {game.title} ({game.titleEn}) از تایتان
        </h2>
        <p style={{ margin: 0 }}>{bottomSeoText}</p>
      </section>
    </>
  );
}
