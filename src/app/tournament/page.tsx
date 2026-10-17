import type { Metadata } from 'next';
import React from 'react';
import TournamentHubClient from './TournamentHubClient';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'مرکز مسابقات و جدول رتبه‌بندی فصل',
  description:
    'هاب مسابقات تایتان؛ جدول رده‌بندی برترین بازیکنان و تیم‌های فصل، امتیازات لیدربرد، قوانین شرکت در رقابت‌ها و ورود به تورنومنت‌های هفتگی همراه با جوایز نقدی.',
  alternates: {
    canonical: '/tournament',
  },
  openGraph: {
    title: 'مرکز مسابقات و جدول رتبه‌بندی فصل | تایتان',
    description:
      'مشاهده رتبه‌بندی فصل برترین بازیکنان و تیم‌های اسپورت، پایش امتیازات لیدربرد و راهنمای شرکت در تورنومنت‌های تایتان.',
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
    title: 'مرکز مسابقات و جدول رتبه‌بندی فصل | تایتان',
    description: 'جدول رده‌بندی گیمرها، پایش امتیازات و هاب مسابقات آنلاین تایتان',
    images: [`${SITE_URL}/images/tournoment-banner.webp`],
  },
};

export default function TournamentHubPage() {
  return <TournamentHubClient />;
}
