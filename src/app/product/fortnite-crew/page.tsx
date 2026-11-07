import type { Metadata } from 'next';
import React from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL } from '@/lib/api/client';
import { fetchEntity } from '@/lib/api/server';
import type { Product } from '@/lib/api/types';
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/seo/schema';
import { IS_STAGING_ENV, SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import {
  CREW_ACTIVATION_CONTENT,
  CREW_ACTIVATION_INFO,
  CREW_BENEFIT_BLOCKS,
  CREW_BENEFITS_HEADER,
  CREW_COMPARISON_CONTENT,
  CREW_COMPARISON_ROWS,
  CREW_COMPARISON_TOTAL,
  CREW_FAQ_HEADER,
  CREW_FAQ_ITEMS,
  CREW_FINAL_CTA_CONTENT,
  CREW_HERO_CONTENT,
  CREW_INTRO_CONTENT,
  CREW_PRICE_DELIVERY_CONTENT,
  CREW_RELATED_HEADER,
  CREW_RELATED_LINKS,
  CREW_SEO_METADATA,
  CREW_SUPPORT_CONTENT,
  resolveCrewPricing,
} from './content';
import { CrewCarousel } from './CrewCarousel';
import { CrewIcon } from './CrewIcon';
import { CrewRevealObserver } from './CrewRevealObserver';
import styles from './crew.module.css';

export const revalidate = 60;

const CANONICAL_URL = `${SITE_URL}/product/fortnite-crew`;
const OG_IMAGE_URL = `${SITE_URL}${CREW_SEO_METADATA.ogImagePath}`;

export async function generateMetadata(): Promise<Metadata> {
  const isIndexable = !IS_STAGING_ENV;

  return {
    title: {
      absolute: CREW_SEO_METADATA.title,
    },
    description: CREW_SEO_METADATA.description,
    alternates: {
      canonical: CANONICAL_URL,
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: CANONICAL_URL,
      siteName: SITE_NAME,
      title: CREW_SEO_METADATA.title,
      description: CREW_SEO_METADATA.description,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: CREW_SEO_METADATA.ogImageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: CREW_SEO_METADATA.title,
      description: CREW_SEO_METADATA.description,
      images: [OG_IMAGE_URL],
    },
  };
}

async function getFortniteCrewProduct(): Promise<Product> {
  try {
    const prod = await fetchEntity<Product>('/products/fortnite-crew/', {
      revalidate: 60,
      tags: ['products', 'product-fortnite-crew'],
      timeoutMs: 2500,
    });
    if (prod) return prod;
  } catch {
    // Fallback to default product detail when remote backend is unreachable
  }

  return DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL;
}

export default async function FortniteCrewPage() {
  const product = await getFortniteCrewProduct();
  const pricing = resolveCrewPricing(product);

  const cartProduct = {
    slug: 'fortnite-crew',
    title: product.title || CREW_HERO_CONTENT.title,
    image: product.image ?? null,
    price: pricing.priceToman,
    originalPrice: pricing.originalPriceToman,
    requiresGameAccount: product.requiresGameAccount ?? true,
    credentialType: product.credentialType ?? ('email_password' as const),
  };

  const priceRials = Math.round(pricing.priceToman * 10);
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${CANONICAL_URL}#product`,
    name: CREW_HERO_CONTENT.title,
    description: CREW_SEO_METADATA.description,
    image: [OG_IMAGE_URL],
    sku: 'fortnite-crew',
    url: CANONICAL_URL,
    offers: {
      '@type': 'Offer',
      url: CANONICAL_URL,
      priceCurrency: 'IRR',
      price: String(priceRials),
      availability:
        product.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };

  const faqJsonLd = buildFaqSchema(
    CREW_FAQ_ITEMS.map((item) => ({
      question: item.question,
      answer: item.answer,
    }))
  );

  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: 'خانه', path: '/' },
    { name: 'فروشگاه', path: '/store' },
    { name: 'فورتنایت', path: '/store/fortnite' },
    { name: 'کروپک فورتنایت', path: '/product/fortnite-crew' },
  ]);

  return (
    <div id="crew-page-root" dir="rtl" className={styles.page}>
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <CrewRevealObserver rootId="crew-page-root" cartProduct={cartProduct} />

      {/* 1. HERO */}
      <section className={styles.hero}>
        <CrewCarousel
          items={CREW_BENEFIT_BLOCKS}
          hint={CREW_HERO_CONTENT.carouselHint}
        />

        <div className={styles.heroTextCol}>
          <span className={styles.t1}>{CREW_HERO_CONTENT.eyebrow}</span>
          <h1 className={styles.t2}>{CREW_HERO_CONTENT.title}</h1>
          <p className={styles.t3}>{CREW_HERO_CONTENT.lead}</p>
          <div className={styles.t4}>
            {CREW_HERO_CONTENT.factChips.map((chip) => (
              <span key={chip} className={styles.factChip}>
                {chip}
              </span>
            ))}
          </div>
          <div id="buy" className={styles.t5}>
            <button
              type="button"
              data-crew-buy-btn="true"
              className={styles.btn}
            >
              {CREW_HERO_CONTENT.ctaLabel}
            </button>
            <div className={styles.priceStack}>
              <span className={styles.oldPrice}>
                {pricing.originalPriceFormatted}
              </span>
              <span className={styles.currentPrice}>
                {pricing.priceFormatted}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTRO */}
      <section className={styles.introSection} data-rv="rv">
        <span className={styles.kicker}>{CREW_INTRO_CONTENT.kicker}</span>
        <h2 className={styles.h2_36_16}>{CREW_INTRO_CONTENT.title}</h2>
        <p className={styles.bodyP}>
          {CREW_INTRO_CONTENT.p1BeforeLink}
          <a
            href={CREW_INTRO_CONTENT.p1LinkHref}
            target="_blank"
            rel="noopener nofollow"
          >
            {CREW_INTRO_CONTENT.p1LinkLabel}
          </a>
          {CREW_INTRO_CONTENT.p1AfterLink}
        </p>
        <p className={styles.bodyP}>{CREW_INTRO_CONTENT.p2}</p>
        <p className={styles.bodyP}>{CREW_INTRO_CONTENT.p3}</p>
      </section>

      {/* 3. BENEFITS */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader} data-rv="rv">
          <span className={styles.kicker}>{CREW_BENEFITS_HEADER.kicker}</span>
          <h2 className={styles.h2_38_15}>{CREW_BENEFITS_HEADER.title}</h2>
        </div>

        {CREW_BENEFIT_BLOCKS.map((item, i) => {
          const isEven = i % 2 === 0;
          return (
            <div
              key={item.id}
              id={item.id}
              className={`${styles.benefitRow} ${
                isEven ? styles.benefitRowNormal : styles.benefitRowReverse
              }`}
            >
              <div
                className={styles.benefitVisualCol}
                data-rv={isEven ? 'sr' : 'sl'}
              >
                <div
                  className={styles.benefitVisualPanel}
                  style={{ background: item.grad }}
                >
                  <div className={styles.orbit} />
                  <div className={styles.innerRing} />
                  <div
                    className={styles.benefitGlow}
                    style={{
                      background: `radial-gradient(circle,${item.glow},transparent 65%)`,
                    }}
                  />
                  <div className={`${styles.benefitIconTile} ${styles.fl}`}>
                    <CrewIcon
                      icon={item.icon}
                      size={88}
                      stroke={item.ink}
                      strokeWidth={1.4}
                    />
                  </div>
                  <span className={styles.benefitBadge}>{item.tag}</span>
                </div>
              </div>

              <div className={styles.benefitTextCol}>
                <span className={styles.benefitKicker} data-rv="x1">
                  {item.kicker}
                </span>
                <h3 className={styles.benefitTitle} data-rv="x2">
                  {item.title}
                </h3>
                <p className={styles.bodyP} data-rv="x3">
                  {item.p1}
                </p>
                <p className={styles.bodyP} data-rv="x4">
                  {item.p2}
                </p>
                <div className={styles.benefitLinks} data-rv="x5">
                  <a className={styles.lnk} href={item.href}>
                    {item.link} <span aria-hidden="true">←</span>
                  </a>
                  <a
                    className={`${styles.lnk} ${styles.lnkSecondary}`}
                    href={item.href2}
                  >
                    {item.link2}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. ACTIVATION STEPS */}
      <section id="steps" className={styles.stepsSection}>
        <div className={styles.sectionHeader} data-rv="rv">
          <span className={styles.kicker}>{CREW_ACTIVATION_CONTENT.kicker}</span>
          <h2 className={styles.h2_38_15}>{CREW_ACTIVATION_CONTENT.title}</h2>
          <p className={styles.sectionLead}>
            {CREW_ACTIVATION_CONTENT.subtitle}
          </p>
        </div>

        <div className={styles.stepsRow}>
          <div className={styles.stepsLine} data-rv="ln" />

          <div className={styles.stepCard} data-rv="rv">
            <div className={styles.stepNum}>
              {CREW_ACTIVATION_CONTENT.steps[0].num}
            </div>
            <h3 className={styles.stepTitle}>
              {CREW_ACTIVATION_CONTENT.steps[0].title}
            </h3>
            <p className={styles.stepText}>
              {CREW_ACTIVATION_CONTENT.steps[0].text}
            </p>
          </div>

          <div className={styles.stepCard} data-rv="rv">
            <div className={styles.stepNum}>
              {CREW_ACTIVATION_CONTENT.steps[1].num}
            </div>
            <h3 className={styles.stepTitle}>
              {CREW_ACTIVATION_CONTENT.steps[1].title}
            </h3>
            <p className={styles.stepText}>
              {CREW_ACTIVATION_INFO ? `${CREW_ACTIVATION_INFO} ` : null}
              {CREW_ACTIVATION_CONTENT.steps[1].consoleBeforeLink}
              <a
                href={CREW_ACTIVATION_CONTENT.steps[1].consoleLinkHref}
                target="_blank"
                rel="noopener nofollow"
              >
                {CREW_ACTIVATION_CONTENT.steps[1].consoleLinkLabel}
              </a>
              {CREW_ACTIVATION_CONTENT.steps[1].consoleAfterLink}
            </p>
          </div>

          <div className={styles.stepCard} data-rv="rv">
            <div className={styles.stepNum}>
              {CREW_ACTIVATION_CONTENT.steps[2].num}
            </div>
            <h3 className={styles.stepTitle}>
              {CREW_ACTIVATION_CONTENT.steps[2].title}
            </h3>
            <p className={styles.stepText}>
              {CREW_ACTIVATION_CONTENT.steps[2].text}
            </p>
          </div>

          <div className={styles.stepCard} data-rv="rv">
            <div className={styles.stepNum}>
              {CREW_ACTIVATION_CONTENT.steps[3].num}
            </div>
            <h3 className={styles.stepTitle}>
              {CREW_ACTIVATION_CONTENT.steps[3].title}
            </h3>
            <p className={styles.stepText}>
              {CREW_ACTIVATION_CONTENT.steps[3].text}
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICE AND DELIVERY */}
      <section className={styles.priceSection}>
        <div className={styles.sectionHeader} data-rv="rv">
          <span className={styles.kicker}>
            {CREW_PRICE_DELIVERY_CONTENT.kicker}
          </span>
          <h2 className={styles.h2_38_15}>
            {CREW_PRICE_DELIVERY_CONTENT.title}
          </h2>
          <p className={styles.sectionLead}>
            {CREW_PRICE_DELIVERY_CONTENT.subtitle}
          </p>
        </div>

        <div className={styles.tilesGrid} data-rv="rv">
          <div className={styles.tile}>
            <span className={styles.tileLabel}>قیمت اشتراک یک‌ماهه</span>
            <span className={styles.tileValueAccent}>
              {pricing.priceFormatted}
            </span>
            <span className={styles.tileSub}>
              با {pricing.discountFormatted} تخفیف نسبت به قیمت پایه{' '}
              {pricing.originalPriceFormatted}
            </span>
          </div>

          <div className={styles.tile}>
            <span className={styles.tileLabel}>زمان تحویل</span>
            <span className={styles.tileValueLarge}>
              {pricing.deliveryTime}
            </span>
            <span className={styles.tileSub}>
              پس از ثبت نهایی سفارش، در ساعات کاری
            </span>
          </div>

          <div className={styles.tile}>
            <span className={styles.tileLabel}>روش تحویل</span>
            <span className={styles.tileValueMedium}>
              فعال‌سازی مستقیم روی اکانت
            </span>
            <span className={styles.tileSub}>
              قابل استفاده روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل
            </span>
          </div>
        </div>

        <p className={styles.guideNote} data-rv="rv">
          {CREW_PRICE_DELIVERY_CONTENT.guideBeforeLink}
          <a href={CREW_PRICE_DELIVERY_CONTENT.guideLinkHref}>
            {CREW_PRICE_DELIVERY_CONTENT.guideLinkLabel}
          </a>
          {CREW_PRICE_DELIVERY_CONTENT.guideAfterLink}
        </p>
      </section>

      {/* 6. COMPARISON */}
      <section className={styles.comparisonSection}>
        <div className={styles.comparisonTextCol} data-rv="rv">
          <span className={styles.kicker}>{CREW_COMPARISON_CONTENT.kicker}</span>
          <h2 className={styles.h2_36_16}>{CREW_COMPARISON_CONTENT.title}</h2>
          <p className={styles.bodyP}>{CREW_COMPARISON_CONTENT.p1}</p>
          <p className={styles.bodyP}>
            {CREW_COMPARISON_CONTENT.p2BeforeVbucks}
            <a href={CREW_COMPARISON_CONTENT.p2VbucksHref}>
              {CREW_COMPARISON_CONTENT.p2VbucksLabel}
            </a>
            {CREW_COMPARISON_CONTENT.p2BetweenLinks}
            <a
              href={CREW_COMPARISON_CONTENT.p2EpicHref}
              target="_blank"
              rel="noopener nofollow"
            >
              {CREW_COMPARISON_CONTENT.p2EpicLabel}
            </a>
            {CREW_COMPARISON_CONTENT.p2AfterEpic}
          </p>
        </div>

        <div className={styles.comparisonTableCard} data-rv="rv">
          <div className={styles.comparisonTableHead}>
            {CREW_COMPARISON_CONTENT.tableHeading}
          </div>
          {CREW_COMPARISON_ROWS.map((row) => (
            <div key={row.label} className={styles.comparisonRow}>
              <span>{row.label}</span>
              <span className={styles.comparisonValue}>{row.value}</span>
            </div>
          ))}
          <div className={styles.comparisonTotalRow}>
            <span className={styles.comparisonTotalLabel}>
              {CREW_COMPARISON_TOTAL.label}
            </span>
            <span className={styles.comparisonTotalValue}>
              {CREW_COMPARISON_TOTAL.value}
            </span>
          </div>
        </div>
      </section>

      {/* 7. SUPPORT AND REFUND */}
      <section className={styles.supportSection} data-rv="rv">
        <span className={styles.kicker}>{CREW_SUPPORT_CONTENT.kicker}</span>
        <h2 className={styles.h2_34_16}>{CREW_SUPPORT_CONTENT.title}</h2>
        <p className={styles.bodyP}>
          {CREW_SUPPORT_CONTENT.beforeLink}
          <a href={CREW_SUPPORT_CONTENT.linkHref}>
            {CREW_SUPPORT_CONTENT.linkLabel}
          </a>
          {CREW_SUPPORT_CONTENT.afterLink}
        </p>
      </section>

      {/* 8. RELATED LINKS */}
      <section className={styles.relatedSection} data-rv="rv">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>{CREW_RELATED_HEADER.kicker}</span>
          <h2 className={styles.h2_34_15}>{CREW_RELATED_HEADER.title}</h2>
        </div>
        <div className={styles.chipsWrap}>
          {CREW_RELATED_LINKS.map((link) => (
            <a key={link.href} className={styles.chip} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* 9. FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqHeaderCol} data-rv="rv">
          <span className={styles.kicker}>{CREW_FAQ_HEADER.kicker}</span>
          <h2 className={styles.h2_36_15}>{CREW_FAQ_HEADER.title}</h2>
          <p className={styles.faqSub}>
            {CREW_FAQ_HEADER.beforeContact}
            <a href={CREW_FAQ_HEADER.contactHref}>
              {CREW_FAQ_HEADER.contactLabel}
            </a>
            {CREW_FAQ_HEADER.betweenLinks}
            <a href={CREW_FAQ_HEADER.faqHref}>{CREW_FAQ_HEADER.faqLabel}</a>
            {CREW_FAQ_HEADER.afterFaq}
          </p>
        </div>

        <div className={styles.faqListCol}>
          {CREW_FAQ_ITEMS.map((faq) => (
            <details
              key={faq.question}
              className={styles.faqItem}
              data-rv="rv"
            >
              <summary className={styles.faqSummary}>
                {faq.question}
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={styles.faqAnswer}>
                {faq.segments
                  ? faq.segments.map((seg, idx) =>
                      seg.type === 'link' ? (
                        <a key={idx} href={seg.href}>
                          {seg.label}
                        </a>
                      ) : (
                        <React.Fragment key={idx}>{seg.value}</React.Fragment>
                      )
                    )
                  : faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className={styles.ctaSection} data-rv="rv">
        <div className={styles.ctaTextWrap}>
          <h2 className={styles.ctaTitle}>{CREW_FINAL_CTA_CONTENT.title}</h2>
          <p className={styles.ctaSub}>{CREW_FINAL_CTA_CONTENT.subtitle}</p>
        </div>
        <a className={styles.btnCta} href={CREW_FINAL_CTA_CONTENT.ctaHref}>
          {CREW_FINAL_CTA_CONTENT.ctaLabel}
        </a>
      </section>
    </div>
  );
}
