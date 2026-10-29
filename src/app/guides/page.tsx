import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

import { GuideCard } from './GuideCard';
import { GUIDE_CATEGORIES, getGuides } from './getGuides';
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
  const sections = GUIDE_CATEGORIES.map(category => ({
    ...category,
    guides: guides.filter(guide => guide.category === category.key),
  })).filter(section => section.guides.length > 0);

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

      <header className={styles.hero}>
        <nav aria-label="مسیر صفحه" className={styles.crumbs}>
          <Link href="/">تایتان</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">آموزش‌ها</span>
        </nav>
        <h1 className={styles.heroTitle}>{TITLE}</h1>
        <p className={styles.heroText}>
          هر چیزی که برای خرید از تایتان لازم دارید، یک‌جا: از آماده کردن اکانت بازی و مراحل خرید هر محصول تا
          کیف پول، پیگیری سفارش و شرکت در تورنومنت‌ها.
        </p>
        {sections.length > 1 && (
          <nav aria-label="دسته‌های آموزش" className={styles.jump}>
            {sections.map(section => (
              <a key={section.key} href={`#${section.key}`} className={styles.jumpChip}>
                {section.title}
                <span className={styles.jumpCount}>{section.guides.length.toLocaleString('fa-IR')}</span>
              </a>
            ))}
          </nav>
        )}
      </header>

      {sections.length === 0 ? (
        <p className={styles.empty}>آموزش‌ها به‌زودی در این صفحه قرار می‌گیرند.</p>
      ) : (
        sections.map(section => (
          <section key={section.key} id={section.key} className={styles.section} aria-labelledby={`${section.key}-title`}>
            <div className={styles.sectionHead}>
              <h2 id={`${section.key}-title`}>{section.title}</h2>
              <p>{section.intro}</p>
            </div>
            <div className={styles.grid}>
              {section.guides.map(guide => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
