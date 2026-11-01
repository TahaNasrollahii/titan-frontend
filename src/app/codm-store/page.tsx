import type { Metadata } from 'next';
import React from 'react';
import CodmStoreClient from './CodmStoreClient';
import { getCodmStoreOffers } from '@/lib/codmStore';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const todayFa = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tehran',
  }).format(new Date());

  const title = `پیشنهادات وب‌استور کالاف دیوتی موبایل (${todayFa}) — بونوس سی‌پی و باندل‌ها`;
  const description =
    'مشاهده زنده پیشنهادات انحصاری وب‌استور رسمی کالاف دیوتی موبایل: بسته‌های سی‌پی با بونوس اضافه، تخفیف اولین خرید، باندل‌های محدود و هدیه رایگان روزانه به همراه خرید فوری سی‌پی از تایتان.';

  return {
    title,
    description,
    alternates: {
      canonical: '/codm-store',
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/codm-store`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/images/games/callof-background.webp`,
          width: 1200,
          height: 630,
          alt: 'پیشنهادات وب‌استور کالاف دیوتی موبایل در فروشگاه تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}/images/games/callof-background.webp`],
    },
  };
}

export default async function CodmStorePage() {
  const storeData = await getCodmStoreOffers('us');

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
            name: 'فروشگاه کالاف دیوتی',
            item: `${SITE_URL}/store/call-of-duty`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'پیشنهادات وب‌استور کالاف دیوتی موبایل',
            item: `${SITE_URL}/codm-store`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'پیشنهادات وب‌استور کالاف دیوتی موبایل (Call of Duty: Mobile Web Store)',
        description:
          'لیست بروز و خودکار پیشنهادات انحصاری وب‌استور رسمی کالاف دیوتی موبایل شامل بسته‌های سی‌پی با بونوس اضافه، باندل‌های محدود، تخفیف‌های خرید اول و هدایای روزانه.',
        url: `${SITE_URL}/codm-store`,
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
          { name: 'فروشگاه کالاف دیوتی', path: '/store/call-of-duty' },
          { name: 'پیشنهادات وب‌استور کالاف دیوتی موبایل', path: '/codm-store' },
        ]}
      />
      <CodmStoreClient initialData={storeData} />
    </>
  );
}
