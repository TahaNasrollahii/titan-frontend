import type { Metadata } from 'next';
import React from 'react';

import { ContactPanel } from './ContactChannels';
import styles from './page.module.css';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';
import type { ContactChannel } from '@/lib/api/types';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildContactPageSchema } from '@/lib/seo/schema';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'ارتباط با ما و پشتیبانی',
  description:
    'راه‌های ارتباطی و پشتیبانی پلتفرم گیمینگ تایتان؛ چت آنلاین، پشتیبانی تلگرام و دیسکورد جهت پیگیری سفارشات و حل مشکلات گیمرها.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
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

async function getContactInfo(): Promise<{ supportOnline: boolean; channels: ContactChannel[] } | null> {
  try {
    const res = await fetch(`${API_URL}/content/contact/`, {
      next: { revalidate: 3600, tags: ['contact'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as { supportOnline: boolean; channels: ContactChannel[] };
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const initialContact = await getContactInfo();

  return (
    <div className={`main ${styles.contactMain}`}>
      <JsonLd data={buildContactPageSchema(initialContact?.channels)} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'ارتباط با ما', path: '/contact' },
        ]}
      />
      <ContactPanel initialData={initialContact} />
    </div>
  );
}
