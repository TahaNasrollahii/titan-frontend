import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

import { getGuides } from './getGuides';
import { GuidesHubClient } from './GuidesHubClient';
import styles from './guides.module.css';

export const revalidate = 300;

const TITLE = 'آموزش‌ها و راهنمای خرید';
const DESCRIPTION =
  'آموزش قدم‌به‌قدم خرید و فعال‌سازی وی‌باکس، ولورانت پوینت، سی‌پی کالاف، جم کلش و اشتراک‌های پریمیوم، ساخت اکانت بازی‌ها، کیف پول و تورنومنت‌های تایتان.';

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getGuides();
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/guides` },
    // An empty hub is a thin page: keep it out of the index until guides are published.
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

      {/* ─── Bottom Support & Ecosystem Command Banner ─── */}
      <section className={styles.hubCtaBanner} aria-labelledby="hub-cta-title">
        <div className={styles.hubCtaGlow} aria-hidden="true" />

        <div className={styles.hubCtaContent}>
          <span className={styles.sectionKicker}>
            <span className={styles.livePulseDot} aria-hidden="true" />
            پشتیبانی آنلاین ۲۴ ساعته تایتان
          </span>
          <h2 id="hub-cta-title" className={styles.hubCtaTitle}>
            هنوز سوالی دارید یا به راهنمایی لحظه‌ای نیاز دارید؟
          </h2>
          <p className={styles.hubCtaText}>
            کارشناسان تایتان در تمام مراحل آماده‌سازی اکانت، خرید و فعال‌سازی محصولات یا ثبت‌نام در
            تورنومنت‌ها از طریق چت آنلاین سایت، تلگرام و دیسکورد همراه شما هستند.
          </p>

          <div className={styles.hubCtaActions}>
            <Link href="/contact" className={styles.btnPrimary}>
              <span>ارتباط با پشتیبانی</span>
              <Icon name="arrow" />
            </Link>
            <Link href="/faq" className={styles.btnGhost}>
              <span>سوالات متداول</span>
            </Link>
            <Link href="/store" className={styles.btnGhost}>
              <span>ورود به فروشگاه</span>
            </Link>
          </div>
        </div>

        <div className={styles.hubCtaVisual} aria-hidden="true">
          <div className={styles.hubCtaRing} />
          <Image
            src="/images/support-robot.webp"
            alt=""
            width={220}
            height={220}
            className={styles.hubCtaRobot}
          />
        </div>
      </section>
    </div>
  );
}
