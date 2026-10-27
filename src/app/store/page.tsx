import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';
import StoreClient from './StoreClient';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { PaginationNav } from '@/components/seo/PaginationNav';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import { buildCollectionPageSchema } from '@/lib/seo/schema';
import { getStoreGames, getStoreProducts, getStorePromos } from './getStoreData';

export const revalidate = 30;

interface StoreSearchParams {
  game?: string;
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

function hasFacetFilters(params: StoreSearchParams): boolean {
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<StoreSearchParams>;
}): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : {};
  const pageNum = Math.max(1, parseInt(resolved.page || '1', 10) || 1);
  const isFiltered = hasFacetFilters(resolved);

  const pageSuffix = pageNum > 1 ? ` (صفحه ${pageNum.toLocaleString('fa-IR')})` : '';
  const title = `فروشگاه گیمینگ، خرید پول و آیتم بازی‌ها${pageSuffix}`;
  const description =
    'فروشگاه تخصصی تایتان؛ خرید قانونی ویباکس فورتنایت، ولورانت پوینت (VP)، سی‌پی کال آو دیوتی موبایل، جم کلش آف کلنز، گیفت کارت‌های استیم و پلی‌استیشن، و اکانت‌های پرمیوم با تحویل سریع.';

  const canonicalPath = !isFiltered && pageNum > 1 ? `/store?page=${pageNum}` : '/store';
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    ...(isFiltered
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
      images: [DEFAULT_OG_IMAGE],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function StorePage({
  searchParams,
}: {
  searchParams?: Promise<StoreSearchParams>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (resolvedParams.game) {
    redirect(`/store/${encodeURIComponent(resolvedParams.game)}`);
  }

  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);

  const [initialProducts, initialGames, initialDiscountPromos, initialBestsellerPromos] =
    await Promise.all([
      getStoreProducts(undefined, 12, currentPage),
      getStoreGames(),
      getStorePromos('store_discount'),
      getStorePromos('store_bestseller'),
    ]);

  const collectionSchema = buildCollectionPageSchema({
    name: 'فروشگاه آنلاین گیمینگ تایتان — خرید پول و آیتم بازی‌ها',
    description:
      'خرید قانونی ویباکس فورتنایت، ولورانت پوینت، سی‌پی کال آو دیوتی موبایل، جم کلش آف کلنز، گیفت کارت و اشتراک‌های پرمیوم با تحویل آنی در فروشگاه تایتان.',
    path: currentPage > 1 ? `/store?page=${currentPage}` : '/store',
    products: initialProducts?.results ?? [],
  });

  return (
    <>
      <link rel="preload" as="image" href="/images/discount.webp" fetchPriority="high" />
      <JsonLd data={collectionSchema} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'فروشگاه گیمینگ', path: '/store' },
        ]}
      />
      <h1 className="sr-only">فروشگاه آنلاین گیمینگ تایتان — خرید پول و آیتم بازی‌ها</h1>
      <StoreClient
        initialProducts={initialProducts}
        initialGames={initialGames}
        initialDiscountPromos={initialDiscountPromos}
        initialBestsellerPromos={initialBestsellerPromos}
      />
      <PaginationNav
        basePath="/store"
        currentPage={currentPage}
        totalCount={initialProducts?.count ?? 0}
        pageSize={12}
      />
    </>
  );
}
