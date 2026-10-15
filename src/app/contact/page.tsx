import type { Metadata } from 'next';
import React from 'react';

import { ContactPanel } from './ContactChannels';
import styles from './page.module.css';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'ارتباط با ما و پشتیبانی',
  description:
    'راه‌های ارتباطی و پشتیبانی پلتفرم گیمینگ تایتان؛ چت آنلاین، پشتیبانی تلگرام و دیسکورد جهت پیگیری سفارشات و حل مشکلات گیمرها.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'ارتباط با ما و پشتیبانی | تایتان',
    description:
      'کانال‌های ارتباطی، پشتیبانی ۲۴ ساعته آنلاین، تلگرام و دیسکورد پلتفرم تایتان.',
    url: `${SITE_URL}/contact`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/support-robot.webp`,
        width: 800,
        height: 800,
        alt: 'پشتیبانی تایتان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ارتباط با ما | تایتان',
    description: 'راه‌های ارتباط با پشتیبانی پلتفرم گیمینگ تایتان',
    images: [`${SITE_URL}/images/support-robot.webp`],
  },
};

export default function ContactPage() {
  return (
    <main className={`main ${styles.contactMain}`}>
      <ContactPanel />
    </main>
  );
}
