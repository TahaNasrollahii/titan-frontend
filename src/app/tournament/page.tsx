import type { Metadata } from 'next';
import React from 'react';
import TournamentHubClient from './TournamentHubClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'مرکز مسابقات و جدول برترین‌های گیمینگ',
  description:
    'مرکز تورنومنت‌های تایتان؛ جدول رده‌بندی برترین بازیکنان و تیم‌ها، راهنمای شرکت در مسابقات آنلاین، و ثبت‌نام در رویدادهای هفتگی بازی‌ها با جوایز نقدی.',
  alternates: {
    canonical: '/tournament',
  },
  openGraph: {
    title: 'مرکز تورنومنت‌ها و لیدربورد گیمینگ | تایتان',
    description:
      'مشاهده رتبه‌بندی برترین بازیکنان، تیم‌های اسپورت، و ثبت‌نام در تورنومنت‌های فعال.',
    url: `${SITE_URL}/tournament`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/tournoment-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'مسابقات و لیدربورد تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرکز تورنومنت‌های گیمینگ تایتان',
    description: 'جدول رده‌بندی گیمرها و راهنمای شرکت در مسابقات آنلاین تایتان',
    images: [`${SITE_URL}/images/tournoment-banner.webp`],
  },
};

export default function TournamentHubPage() {
  return <TournamentHubClient />;
}
