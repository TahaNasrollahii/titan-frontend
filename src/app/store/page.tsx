import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';
import StoreClient from './StoreClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { getStoreProducts, getStoreGames, getStorePromos } from './getStoreData';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'فروشگاه گیمینگ، خرید پول و آیتم بازی‌ها',
  description:
    'فروشگاه تخصصی تایتان؛ خرید قانونی ویباکس فورتنایت، ولورانت پوینت (VP)، اپکس کوین، گیفت کارت‌های استیم و پلی‌استیشن، و اکانت‌های پرمیوم با تحویل سریع.',
  alternates: {
    canonical: '/store',
  },
  openGraph: {
    title: 'فروشگاه گیمینگ تایتان | خرید قانونی پول و آیتم بازی‌ها',
    description:
      'خرید سریع و قانونی ویباکس فورتنایت، ولورانت پوینت، اپکس کوین، گیفت‌کارت و اشتراک پرمیوم با گارانتی و بهترین قیمت.',
    url: `${SITE_URL}/store`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/banner-hero.webp`,
        width: 1200,
        height: 630,
        alt: 'فروشگاه بازی‌های تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فروشگاه گیمینگ تایتان | خرید پول بازی‌ها',
    description: 'خرید سریع و قانونی پول و آیتم بازی‌ها در فروشگاه تایتان',
    images: [`${SITE_URL}/images/banner-hero.webp`],
  },
};

export default async function StorePage({
  searchParams,
}: {
  searchParams?: Promise<{ game?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  if (resolvedParams.game) {
    redirect(`/store/${encodeURIComponent(resolvedParams.game)}`);
  }

  const [initialProducts, initialGames, initialDiscountPromos, initialBestsellerPromos] = await Promise.all([
    getStoreProducts(),
    getStoreGames(),
    getStorePromos('store_discount'),
    getStorePromos('store_bestseller'),
  ]);

  return (
    <>
      <link rel="preload" as="image" href="/images/discount.webp" fetchPriority="high" />
      <h1 className="sr-only">فروشگاه آنلاین گیمینگ تایتان — خرید پول و آیتم بازی‌ها</h1>
      <StoreClient
        initialProducts={initialProducts}
        initialGames={initialGames}
        initialDiscountPromos={initialDiscountPromos}
        initialBestsellerPromos={initialBestsellerPromos}
      />
    </>
  );
}