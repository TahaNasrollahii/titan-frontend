import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/Icons';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { faNumber, jalaliDate } from '@/lib/format';
import { gameIconSrc, isLocalAsset } from '@/lib/gameIcons';
import { composeMetaDescription } from '@/lib/seo/meta';
import { buildFaqSchema, resolveBackendRedirect, toAbsoluteUrl } from '@/lib/seo/schema';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';

import { GuideBody, guideHeadings, guideStepsCount, readingMinutes } from '../GuideBody';
import { GuideCard } from '../GuideCard';
import { GuideReadingTools, GuideStickyToc } from '../GuideTocClient';
import { RanksGuideShowcase } from '../RanksGuideShowcase';
import {
  cleanGuideFaqs,
  cleanGuideText,
  getGuide,
  getGuides,
  getGuideTheme,
  guideCategoryMeta,
  guideCategoryTitle,
} from '../getGuides';
import styles from '../guides.module.css';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getGuides()).map(guide => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: 'آموزش یافت نشد', robots: { index: false, follow: false } };

  const title = guide.metaTitle || guide.title;
  const description = composeMetaDescription(
    cleanGuideText(guide.metaDescription || guide.summary),
  );
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
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) {
    await resolveBackendRedirect(`/guides/${slug}`);
    notFound();
  }

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const headings = guideHeadings(guide.body);
  const stepsCount = guideStepsCount(guide.body);
  const cleanedFaqs = cleanGuideFaqs(guide.faqs);
  const cleanSummary = cleanGuideText(guide.summary);
  const minutes = readingMinutes(
    `${guide.body} ${cleanedFaqs.map(f => f.answer).join(' ')}`,
  );

  const theme = getGuideTheme(guide);
  const categoryMeta = guideCategoryMeta(guide.category);
  const gameIcon = guide.game
    ? gameIconSrc(guide.game.slug, guide.game.iconImage)
    : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: cleanSummary,
    url,
    mainEntityOfPage: url,
    inLanguage: 'fa-IR',
    image: toAbsoluteUrl(guide.ogImage),
    datePublished: guide.publishedAt ?? guide.updatedAt,
    dateModified: guide.updatedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(guide.game
      ? { about: { '@type': 'VideoGame', name: guide.game.titleEn } }
      : {}),
  };

  return (
    <article
      className={styles.page}
      style={
        {
          '--guide-accent': theme.accent,
          '--guide-secondary': theme.secondaryAccent,
        } as CSSProperties
      }
    >
      <JsonLd data={articleSchema} />
      {cleanedFaqs.length > 0 && <JsonLd data={buildFaqSchema(cleanedFaqs)} />}
      <Breadcrumbs
        items={[
          { name: 'صفحه اصلی', path: '/' },
          { name: 'آموزش‌ها', path: '/guides' },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ]}
      />

      {/* ─── Cinematic Article Hero Stage ─── */}
      <header className={styles.articleHero}>
        <div className={styles.articleHeroBackdrop} aria-hidden="true">
          <Image
            src={theme.backgroundImage}
            alt=""
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className={styles.articleHeroBgImage}
            priority
          />
          <div className={styles.articleHeroOverlay} />
          <div className={styles.heroGridMask} />
        </div>

        <div className={styles.articleHeroMain}>
          <nav aria-label="مسیر صفحه" className={styles.crumbs}>
            <Link href="/" className={styles.crumbLink}>
              <Icon name="home" />
              <span>تایتان</span>
            </Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <Link href="/guides" className={styles.crumbLink}>
              <span>آموزش‌ها</span>
            </Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <Link href={`/guides#${guide.category}`} className={styles.crumbCurrentLink}>
              {guideCategoryTitle(guide.category)}
            </Link>
          </nav>

          {/* Eyebrow Chips */}
          <div className={styles.articleEyebrow}>
            {guide.game && (
              <Link href={theme.storeHref} className={styles.articleGameChip}>
                {gameIcon && (
                  <Image
                    src={gameIcon}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    unoptimized={isLocalAsset(gameIcon)}
                  />
                )}
                <span>{guide.game.title}</span>
                <small>{guide.game.titleEn}</small>
              </Link>
            )}

            <Link href={`/guides#${guide.category}`} className={styles.articleCategoryChip}>
              <Image
                src={categoryMeta.icon}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                unoptimized
              />
              <span>{categoryMeta.title}</span>
            </Link>

            <span className={styles.articleVerifiedChip}>
              <Icon name="check" />
              <span>راهنمای رسمی تایتان</span>
            </span>
          </div>

          <h1 className={styles.articleTitle}>{cleanGuideText(guide.title)}</h1>

          <p className={styles.articleLead}>{cleanSummary}</p>

          {/* Telemetry & Reading Tools Bar */}
          <div className={styles.articleMetaBar}>
            <div className={styles.articleMetaPills}>
              <span className={styles.metaPill}>
                <Icon name="clock" />
                <span>زمان مطالعه: {faNumber(minutes)} دقیقه</span>
              </span>

              {stepsCount > 0 && (
                <span className={styles.metaPill}>
                  <Icon name="sparkles" />
                  <span>{faNumber(stepsCount)} گام عملیاتی</span>
                </span>
              )}

              <span className={styles.metaPill}>
                <Icon name="refresh" />
                <span>
                  به‌روزرسانی:{' '}
                  <time dateTime={guide.updatedAt}>{jalaliDate(guide.updatedAt)}</time>
                </span>
              </span>
            </div>

            <GuideReadingTools url={url} />
          </div>

          {/* High-Converting Product Action Dock */}
          {guide.products.length > 0 && (
            <div className={styles.buyDock}>
              <div className={styles.buyDockHeader}>
                <span className={styles.buyDockPulse} aria-hidden="true" />
                <span className={styles.buyDockLabel}>
                  محصولات مرتبط با این آموزش (تحویل فوری و قانونی):
                </span>
              </div>
              <div className={styles.buyRow}>
                {guide.products.slice(0, 4).map(product => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    className={styles.buyLink}
                  >
                    <Icon name="cart" />
                    <span>خرید {cleanGuideText(product.title)}</span>
                    <Icon name="arrow" className={styles.buyLinkArrow} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Left 3D Visual Stage */}
        <div className={styles.articleHeroStage} aria-hidden="true">
          <div className={styles.articleStageHalo} />
          <div className={styles.stageRingDashed} />
          <div className={styles.stageRingGlow} />

          <div className={styles.articleStageCharWrap}>
            <Image
              src={theme.characterImage}
              alt=""
              width={320}
              height={320}
              priority
              draggable={false}
              className={styles.articleStageChar}
            />
          </div>

          <div className={`${styles.stageOrbit} ${styles.articleStageOrbit}`}>
            <Image
              src={theme.floatingImage}
              alt=""
              width={64}
              height={64}
              unoptimized={isLocalAsset(theme.floatingImage)}
              draggable={false}
            />
          </div>

          <div className={`${styles.stageHud} ${styles.articleStageHudTop}`}>
            <span className={styles.stageHudIcon}>
              <Icon name="sparkles" />
            </span>
            <div className={styles.stageHudText}>
              <strong>تحویل سریع و قانونی</strong>
              <span>پشتیبانی آنلاین ۲۴/۷</span>
            </div>
          </div>

          <div className={styles.articleStageBadge}>
            <span className={styles.livePulseDot} />
            <span>{theme.badgeLabel}</span>
          </div>
        </div>
      </header>

      {guide.slug === 'ranks' && <RanksGuideShowcase variant="article" />}

      {/* ─── Main Two-Column Mission Layout ─── */}
      <div className={styles.articleLayout}>
        <aside className={styles.articleSidebar}>
          <GuideStickyToc
            headings={headings}
            hasFaq={cleanedFaqs.length > 0}
          />

          {/* Quick Store / Product Card in Sidebar */}
          <div className={`${styles.sideStoreCard} ${styles.spotCard}`}>
            <div className={styles.sideStoreTop}>
              <div className={styles.sideStoreIcon}>
                <Image
                  src={gameIcon || categoryMeta.icon}
                  alt=""
                  aria-hidden="true"
                  width={32}
                  height={32}
                  unoptimized
                />
              </div>
              <div>
                <strong className={styles.sideStoreTitle}>
                  {guide.products.length > 0
                    ? 'آماده ثبت سفارش هستید؟'
                    : theme.storeLabel}
                </strong>
                <span className={styles.sideStoreSub}>تحویل آنی + ضمانت ۱۰۰٪</span>
              </div>
            </div>

            <ul className={styles.sideStoreChecklist}>
              <li>
                <Icon name="check" />
                <span>شارژ قانونی و مستقیم بدون خطر بن</span>
              </li>
              <li>
                <Icon name="check" />
                <span>نگهداری رمزنگاری‌شده اطلاعات اکانت</span>
              </li>
              <li>
                <Icon name="check" />
                <span>پشتیبانی آنلاین ۲۴ ساعته در تمام مراحل</span>
              </li>
            </ul>

            <Link
              href={
                guide.products.length > 0
                  ? `/product/${guide.products[0].slug}`
                  : theme.storeHref
              }
              className={styles.sideStoreCta}
            >
              <span>
                {guide.products.length > 0
                  ? `خرید ${cleanGuideText(guide.products[0].title)}`
                  : theme.storeLabel}
              </span>
              <Icon name="arrow" />
            </Link>

            <Link href="/guides" className={styles.sideBackLink}>
              <Icon name="grid" />
              <span>بازگشت به فهرست همه آموزش‌ها</span>
            </Link>
          </div>
        </aside>

        <div className={styles.articleMain}>
          <div className={styles.articleBodyCard}>
            <GuideBody source={guide.body} />
          </div>

          {cleanedFaqs.length > 0 && (
            <section className={styles.faqSection} aria-labelledby="faq-title">
              <div className={styles.faqHeader}>
                <div className={styles.faqTitleGroup}>
                  <span className={styles.faqHeaderIcon} aria-hidden="true">
                    <Icon name="chat" />
                  </span>
                  <div>
                    <span className={styles.faqKicker}>پاسخ به ابهامات رایج</span>
                    <h2 id="faq-title">سوالات متداول این آموزش</h2>
                  </div>
                </div>
                <span className={styles.faqCountPill}>
                  {faNumber(cleanedFaqs.length)} پرسش و پاسخ
                </span>
              </div>

              <div className={styles.faqList}>
                {cleanedFaqs.map((faq, idx) => (
                  <details
                    key={faq.question}
                    className={styles.faqItem}
                    open={idx === 0}
                  >
                    <summary className={styles.faqSummary}>
                      <span className={styles.faqQBadge} aria-hidden="true">
                        {faNumber(idx + 1)}
                      </span>
                      <span className={styles.faqQuestionText}>{faq.question}</span>
                      <span className={styles.faqToggleIcon} aria-hidden="true">
                        <Icon name="plus" />
                      </span>
                    </summary>
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Luxury Support Command Box */}
          <aside className={styles.helpBox}>
            <div className={styles.helpBoxGlow} aria-hidden="true" />
            <div className={styles.helpBoxVisual} aria-hidden="true">
              <Image
                src="/images/support-robot.webp"
                alt=""
                width={96}
                height={96}
                className={styles.helpBoxRobot}
              />
            </div>
            <div className={styles.helpBoxBody}>
              <span className={styles.helpBoxBadge}>
                <span className={styles.livePulseDot} aria-hidden="true" />
                پشتیبانی آنلاین ۲۴ ساعته
              </span>
              <strong>هنوز سوالی دارید یا در انجام مراحل به کمک نیاز دارید؟</strong>
              <span>
                پشتیبانی تایتان از طریق چت آنلاین سایت، تلگرام و صفحه ارتباط با ما در تمام ساعات
                شبانه‌روز همراه شماست.
              </span>
            </div>
            <div className={styles.helpBoxActions}>
              <Link href="/contact" className={styles.helpLink}>
                <span>ارتباط با پشتیبانی</span>
                <Icon name="arrow" />
              </Link>
              <Link href="/guides" className={styles.helpSecondaryLink}>
                <span>همه آموزش‌ها</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── Related Guides Section ─── */}
      {guide.related.length > 0 && (
        <section className={styles.relatedSection} aria-labelledby="related-title">
          <div className={styles.relatedHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <span className={styles.kickerDot} aria-hidden="true" />
                ادامه مسیر یادگیری
              </span>
              <h2 id="related-title" className={styles.relatedTitle}>
                آموزش‌های مرتبط که به کارتان می‌آید
              </h2>
            </div>
            <Link href="/guides" className={styles.relatedAllLink}>
              <span>مشاهده همه آموزش‌ها</span>
              <Icon name="arrow" />
            </Link>
          </div>

          <div className={styles.bentoGrid}>
            {guide.related.map((related, idx) => (
              <GuideCard key={related.slug} guide={related} index={idx + 1} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
