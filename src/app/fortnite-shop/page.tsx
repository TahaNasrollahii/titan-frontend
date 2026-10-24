import type { Metadata } from 'next';
import React from 'react';
import FortniteShopClient from './FortniteShopClient';
import { getFortniteShop } from '@/lib/fortniteShop';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const todayFa = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date());

  const title = `آیتم شاپ فورتنایت امروز (${todayFa}) و قیمت اسکین‌ها`;
  const description =
    'آیتم شاپ امروز فورتنایت را زنده ببینید: اسکین‌ها، باندل‌ها و ایموت‌ها با قیمت ویباکس، بروزرسانی خودکار هر روز ساعت ۰۰:۰۰ UTC و خرید فوری ویباکس از تایتان.';

  return {
    title,
    description,
    alternates: {
      canonical: '/fortnite-shop',
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/fortnite-shop`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/images/games/fortnite-background.webp`,
          width: 1200,
          height: 630,
          alt: 'آیتم شاپ زنده فورتنایت در فروشگاه تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}/images/games/fortnite-background.webp`],
    },
  };
}

export default async function FortniteShopPage() {
  const shopData = await getFortniteShop();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'فروشگاه فورتنایت',
            item: `${SITE_URL}/store/fortnite`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'آیتم شاپ فورتنایت',
            item: `${SITE_URL}/fortnite-shop`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'آیتم شاپ زنده فورتنایت (Fortnite Item Shop)',
        description:
          'لیست زنده آیتم شاپ امروز فورتنایت شامل اسکین‌ها، باندل‌ها، پیککس‌ها و ایموت‌ها همراه با قیمت ویباکس.',
        url: `${SITE_URL}/fortnite-shop`,
        inLanguage: 'fa-IR',
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        includeJsonLd={false}
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'فروشگاه فورتنایت', path: '/store/fortnite' },
          { name: 'آیتم شاپ فورتنایت', path: '/fortnite-shop' },
        ]}
      />
      <FortniteShopClient initialData={shopData} />
    </>
  );
}

