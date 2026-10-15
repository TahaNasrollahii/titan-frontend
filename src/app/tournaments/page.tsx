import type { Metadata } from 'next';
import React from 'react';
import TournamentsClient from './TournamentsClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'تورنومنت‌ها و مسابقات گیمینگ',
  description:
    'شرکت در تورنومنت‌های هفتگی و مسابقات آنلاین تایتان؛ رقابت در فورتنایت، ولورانت، اپکس لجندز با جوایز نقدی میلیونی، براکت زنده و تیم‌سازی.',
  alternates: {
    canonical: '/tournaments',
  },
  openGraph: {
    title: 'تورنومنت‌ها و مسابقات گیمینگ تایتان | جوایز نقدی و رقابت آنلاین',
    description:
      'در مسابقات آنلاین تایتان ثبت‌نام کنید، رقابت کنید و جوایز نقدی کسب کنید. مسابقات انفرادی و تیمی.',
    url: `${SITE_URL}/tournaments`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/tournoment-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'تورنومنت‌های گیمینگ تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تورنومنت‌های گیمینگ تایتان',
    description: 'شرکت در مسابقات هفتگی فورتنایت، ولورانت و اپکس با جوایز نقدی در تایتان',
    images: [`${SITE_URL}/images/tournoment-banner.webp`],
  },
};

export default function TournamentsPage() {
  return (
    <>
      <h1 className="sr-only">تورنومنت‌ها و مسابقات آنلاین گیمینگ تایتان</h1>
      <TournamentsClient />
    </>
  );
}
