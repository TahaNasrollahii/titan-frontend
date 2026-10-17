import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import StoreClient from '../StoreClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { getStoreProducts, getStoreGames, getStorePromos, getGameBySlug, getAllGames } from '../getStoreData';

export const revalidate = 300;

export async function generateStaticParams() {
  const games = await getAllGames();
  if (!games || !games.length) {
    return [
      { game: 'fortnite' },
      { game: 'valorant' },
      { game: 'apex-legends' },
      { game: 'premium' },
    ];
  }
  return games.map(g => ({ game: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: gameSlug } = await params;
  const game = await getGameBySlug(gameSlug);
  if (!game) {
    return {
      title: 'دسته‌بندی یافت نشد',
    };
  }

  const title = `خرید محصولات و پول ${game.title} (${game.titleEn}) | فروشگاه تایتان`;
  const rawDesc =
    game.description?.trim() ||
    `خرید سریع و قانونی پول، اسکین‌ها و آیتم‌های بازی ${game.title} (${game.titleEn}) با بهترین قیمت و ضمانت در فروشگاه گیمینگ تایتان.`;
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;

  const imageUrl = game.coverImage || game.backgroundImage || `${SITE_URL}/images/banner-hero.webp`;

  return {
    title,
    description,
    alternates: {
      canonical: `/store/${game.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/store/${game.slug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `محصولات ${game.title}`,
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  const game = await getGameBySlug(gameSlug);
  if (!game) {
    notFound();
  }

  const [initialProducts, initialGames, initialDiscountPromos, initialBestsellerPromos] = await Promise.all([
    getStoreProducts(game.slug),
    getStoreGames(),
    getStorePromos('store_discount'),
    getStorePromos('store_bestseller'),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'صفحه اصلی',
        item: `${SITE_URL}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'فروشگاه',
        item: `${SITE_URL}/store`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: game.title,
        item: `${SITE_URL}/store/${game.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="sr-only">فروشگاه آنلاین گیمینگ تایتان — محصولات بازی {game.title}</h1>
      <StoreClient
        initialGame={game.slug}
        initialProducts={initialProducts}
        initialGames={initialGames}
        initialDiscountPromos={initialDiscountPromos}
        initialBestsellerPromos={initialBestsellerPromos}
      />
    </>
  );
}
