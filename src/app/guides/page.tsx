import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

import { getGuides } from './getGuides';
import { GuidesHubClient } from './GuidesHubClient';
import styles from './guides.module.css';

export const revalidate = 300;

const TITLE = 'آموزش‌ها و راهنمای تایتان';
const DESCRIPTION =
  'آموزش قدم‌به‌قدم خرید و فعال‌سازی وی‌باکس، ولورانت پوینت، سی‌پی کالاف، جم کلش و اشتراک‌های پریمیوم، ساخت اکانت بازی‌ها، کیف پول و تورنومنت‌های تایتان.';

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getGuides();
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/guides` },
    ...(guides.length === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${TITLE} | ${SITE_NAME}`,
      description: DESCRIPTION,
      url: `${SITE_URL}/guides`,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
      locale: 'fa_IR',
      type: 'website',
    },
  };
}

export default async function GuidesPage() {
  const guides = await getGuides();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guides`,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guides.length,
      itemListElement: guides.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/guides/${guide.slug}`,
        name: guide.title,
      })),
    },
  };

  return (
    <div className={styles.page}>
      <JsonLd data={collectionSchema} />
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'آموزش‌ها', path: '/guides' },
        ]}
      />

      <GuidesHubClient guides={guides} title={TITLE} />

      {/* ─── Compact Bottom Support Bar ─── */}
      <section className={styles.helpBox} aria-labelledby="hub-cta-title">
        <div>
          <h2 id="hub-cta-title">پاسخ سوالتان را پیدا نکردید؟</h2>
          <p>پشتیبانی آنلاین تایتان در تمام مراحل خرید، اتصال اکانت یا شرکت در مسابقات همراه شماست.</p>
        </div>

        <div className={styles.helpActions}>
          <Link href="/contact" className={styles.btnPrimary}>
            <span>ارتباط با پشتیبانی</span>
            <Icon name="arrow" />
          </Link>
          <Link href="/faq" className={styles.btnGhost}>
            <span>سوالات متداول</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
