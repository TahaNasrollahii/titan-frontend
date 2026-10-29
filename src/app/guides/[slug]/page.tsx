import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { jalaliDate } from '@/lib/format';
import { composeMetaDescription } from '@/lib/seo/meta';
import { buildFaqSchema, resolveBackendRedirect, toAbsoluteUrl } from '@/lib/seo/schema';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';

import { GuideBody, guideHeadings, readingMinutes } from '../GuideBody';
import { GuideCard } from '../GuideCard';
import { getGuide, getGuides, guideCategoryTitle } from '../getGuides';
import styles from '../guides.module.css';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getGuides()).map(guide => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: 'آموزش یافت نشد', robots: { index: false, follow: false } };

  const title = guide.metaTitle || guide.title;
  const description = composeMetaDescription(guide.metaDescription || guide.summary);
  const url = guide.canonicalUrl || `${SITE_URL}/guides/${guide.slug}`;
  const image = toAbsoluteUrl(guide.ogImage);

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(guide.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: guide.title }],
      locale: 'fa_IR',
      type: 'article',
      publishedTime: guide.publishedAt ?? undefined,
      modifiedTime: guide.updatedAt,
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description, images: [image] },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) {
    await resolveBackendRedirect(`/guides/${slug}`);
    notFound();
  }

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const headings = guideHeadings(guide.body);
  const minutes = readingMinutes(`${guide.body} ${guide.faqs.map(f => f.answer).join(' ')}`);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: 'fa-IR',
    image: toAbsoluteUrl(guide.ogImage),
    datePublished: guide.publishedAt ?? guide.updatedAt,
    dateModified: guide.updatedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(guide.game ? { about: { '@type': 'VideoGame', name: guide.game.titleEn } } : {}),
  };

  return (
    <article className={styles.page}>
      <JsonLd data={articleSchema} />
      {guide.faqs.length > 0 && <JsonLd data={buildFaqSchema(guide.faqs)} />}
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'آموزش‌ها', path: '/guides' },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ]}
      />

      <header className={styles.articleHead}>
        <nav aria-label="مسیر صفحه" className={styles.crumbs}>
          <Link href="/">تایتان</Link>
          <span aria-hidden="true">/</span>
          <Link href="/guides">آموزش‌ها</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/guides#${guide.category}`}>{guideCategoryTitle(guide.category)}</Link>
        </nav>
        <h1 className={styles.articleTitle}>{guide.title}</h1>
        <p className={styles.articleLead}>{guide.summary}</p>
        <p className={styles.articleMeta}>
          <span>
            به‌روزرسانی: <time dateTime={guide.updatedAt}>{jalaliDate(guide.updatedAt)}</time>
          </span>
          <span>زمان مطالعه: {minutes.toLocaleString('fa-IR')} دقیقه</span>
        </p>
        {guide.products.length > 0 && (
          <div className={styles.buyRow}>
            {guide.products.slice(0, 3).map(product => (
              <Link key={product.slug} href={`/product/${product.slug}`} className={styles.buyLink}>
                خرید {product.title}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className={headings.length >= 3 ? styles.articleLayout : styles.articleSingle}>
        {headings.length >= 3 && (
          <nav aria-labelledby="toc-title" className={styles.toc}>
            <p id="toc-title" className={styles.tocTitle}>
              در این آموزش
            </p>
            <ol>
              {headings.map(heading => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={styles.articleMain}>
          <GuideBody source={guide.body} />

          {guide.faqs.length > 0 && (
            <section className={styles.faq} aria-labelledby="faq-title">
              <h2 id="faq-title">سوالات متداول</h2>
              {guide.faqs.map(faq => (
                <details key={faq.question} className={styles.faqItem}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          )}

          <aside className={styles.helpBox}>
            <strong>هنوز سوالی دارید؟</strong>
            <span>پشتیبانی تایتان از طریق چت آنلاین سایت و صفحه ارتباط با ما همراه شماست.</span>
            <Link href="/contact" className={styles.helpLink}>
              ارتباط با پشتیبانی
            </Link>
          </aside>
        </div>
      </div>

      {guide.related.length > 0 && (
        <section className={styles.section} aria-labelledby="related-title">
          <div className={styles.sectionHead}>
            <h2 id="related-title">آموزش‌های مرتبط</h2>
          </div>
          <div className={styles.grid}>
            {guide.related.map(related => (
              <GuideCard key={related.slug} guide={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
