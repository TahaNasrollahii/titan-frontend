import type { Metadata } from 'next';
import Link from 'next/link';
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
import { getGuides, primaryGuide } from '../../guides/getGuides';

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
    `خرید سریع ارز، اسکین‌ها و آیتم‌های ${game.title} (${game.titleEn}) با پشتیبانی ۲۴ ساعته در فروشگاه تایتان.`,
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

  const [initialProducts, initialGames, initialDiscountPromos, initialBestsellerPromos, guides] =
    await Promise.all([
      getStoreProducts(game.slug, 12, currentPage),
      getStoreGames(),
      getStorePromos('store_discount'),
      getStorePromos('store_bestseller'),
      getGuides({ game: game.slug }),
    ]);
  const guide = primaryGuide(guides);

  const collectionSchema = buildCollectionPageSchema({
    name: `خرید محصولات ${game.title} (${game.titleEn})`,
    description:
      game.metaDescription ||
      game.description ||
      `خرید آنلاین محصولات و آیتم‌های ${game.title} (${game.titleEn}) با تحویل آنی در فروشگاه تایتان.`,
    path: currentPage > 1 ? `/store/${game.slug}?page=${currentPage}` : `/store/${game.slug}`,
    products: initialProducts?.results ?? [],
  });

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
      <h1 className="sr-only">خرید محصولات و آیتم‌های {game.title} ({game.titleEn}) در تایتان</h1>
      <StoreClient
        initialGame={game.slug}
        initialProducts={initialProducts}
        initialGames={initialGames}
        initialDiscountPromos={initialDiscountPromos}
        initialBestsellerPromos={initialBestsellerPromos}
        guide={guide}
      />
      <PaginationNav
        basePath={`/store/${game.slug}`}
        currentPage={currentPage}
        totalCount={initialProducts?.count ?? 0}
        pageSize={12}
      />
      <section
        aria-label={`راهنما و لینک‌های مرتبط با ${game.title}`}
        style={{
          marginTop: '24px',
          padding: '18px 22px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
          راهنمای خرید محصولات {game.title} از تایتان
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.9, color: 'rgba(255, 255, 255, 0.78)', marginBottom: '12px' }}>
          {game.description || `مشاهده و مقایسه تمام بسته‌ها و آیتم‌های ${game.title} (${game.titleEn}) در فروشگاه تایتان.`} برای آشنایی با نحوه فعال‌سازی سفارش‌ها، زمان تحویل و شرایط بازگشت وجه می‌توانید از لینک‌های زیر استفاده کنید:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px' }}>
          {guide && (
            <Link href={`/guides/${guide.slug}`} style={{ color: '#ff8a80', textDecoration: 'underline' }}>
              {guide.title}
            </Link>
          )}
          {game.slug === 'fortnite' && (
            <>
              <Link href="/product/fortnite-crew" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                خرید کروپک فورتنایت از تایتان
              </Link>
              <Link href="/product/fortnite-vbucks" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                خرید ویباکس فورتنایت
              </Link>
              <Link href="/fortnite-shop" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                آیتم شاپ روزانه فورتنایت
              </Link>
              <Link href="/guides/fortnite-crew-buying-guide" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                راهنمای خرید اشتراک فورتنایت کرو در ایران
              </Link>
            </>
          )}
          {game.slug === 'call-of-duty' && (
            <>
              <Link href="/product/cod-points" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                خرید سی‌پی کالاف دیوتی موبایل
              </Link>
              <Link href="/codm-store" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
                وب‌استور کالاف دیوتی موبایل
              </Link>
            </>
          )}
          <Link href="/guides" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
            همه آموزش‌ها و راهنماهای خرید
          </Link>
          <Link href="/faq" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
            سوالات متداول خرید و تحویل
          </Link>
          <Link href="/terms" style={{ color: '#ff8a80', textDecoration: 'underline' }}>
            قوانین، پشتیبانی و شرایط بازگشت وجه
          </Link>
        </div>
      </section>
    </>
  );
}
