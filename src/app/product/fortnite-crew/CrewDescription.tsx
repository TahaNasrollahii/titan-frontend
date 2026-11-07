'use client';

import React, { useState } from 'react';
import type { Product, ProductVariant } from '@/lib/api/types';
import { CREW_ACTIVATION_INFO } from './content';
import {
  getFortniteProductTemplate,
  resolveFortniteTemplatePricing,
} from './fortniteTemplates';
import { CrewCarousel } from './CrewCarousel';
import { CrewIcon } from './CrewIcon';
import { CrewRevealObserver } from './CrewRevealObserver';
import styles from './crew.module.css';

interface CrewDescriptionProps {
  product?: Product | null;
  selectedVariant?: ProductVariant | null;
  onAddToCart?: () => void;
}

export function CrewDescription({
  product,
  selectedVariant,
  onAddToCart,
}: CrewDescriptionProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const currentSlug = product?.slug || 'fortnite-crew';
  const expanded = expandedSlug === currentSlug;

  const template = getFortniteProductTemplate(currentSlug, product);
  const pricing = resolveFortniteTemplatePricing(
    template,
    product,
    selectedVariant
  );

  const handleActiveCardClick = (targetId: string) => {
    if (!expanded) {
      setExpandedSlug(currentSlug);
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 60);
    }
  };

  const cartProduct = {
    slug: product?.slug || template.slugs[0] || 'fortnite-crew',
    title: product?.title || template.hero.title,
    image: product?.image ?? null,
    price: pricing.priceToman,
    originalPrice: pricing.originalPriceToman,
    requiresGameAccount: product?.requiresGameAccount ?? true,
    credentialType: product?.credentialType ?? ('email_password' as const),
  };

  return (
    <div
      id="crew-page-root"
      dir="rtl"
      className={`${styles.page} ${!expanded ? styles.pageCollapsed : ''}`}
    >
      <CrewRevealObserver
        rootId="crew-page-root"
        cartProduct={onAddToCart ? undefined : cartProduct}
        expanded={expanded}
      />

      {/* 1. HERO */}
      <section className={styles.hero}>
        <CrewCarousel
          key={currentSlug}
          items={template.benefitBlocks}
          hint={template.hero.carouselHint}
          onActiveCardClick={handleActiveCardClick}
        />

        <div className={styles.heroTextCol}>
          <span className={styles.t1}>{template.hero.eyebrow}</span>
          <h2 className={styles.t2}>{template.hero.title}</h2>
          <p className={styles.t3}>{template.hero.lead}</p>
          <div className={styles.t4}>
            {template.hero.factChips.map((chip) => (
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
              onClick={onAddToCart}
            >
              {template.hero.ctaLabel}
            </button>
            <div className={styles.priceStack}>
              {pricing.hasDiscount && (
                <span className={styles.oldPrice}>
                  {pricing.originalPriceFormatted}
                </span>
              )}
              <span className={styles.currentPrice}>
                {pricing.priceFormatted}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div
        id="crew-more-body"
        className={`${styles.moreBody} ${expanded ? styles.moreBodyExpanded : ''}`}
      >
        {/* 2. INTRO */}
        <section className={styles.introSection} data-rv="rv">
          <span className={styles.kicker}>{template.intro.kicker}</span>
          <h2 className={styles.h2_36_16}>{template.intro.title}</h2>
          <p className={styles.bodyP}>
            {template.intro.p1BeforeLink}
            <a
              href={template.intro.p1LinkHref}
              target="_blank"
              rel="noopener nofollow"
            >
              {template.intro.p1LinkLabel}
            </a>
            {template.intro.p1AfterLink}
          </p>
          <p className={styles.bodyP}>{template.intro.p2}</p>
          <p className={styles.bodyP}>{template.intro.p3}</p>
        </section>

        {/* 3. BENEFITS */}
        <section className={styles.benefitsSection}>
          <div className={styles.sectionHeader} data-rv="rv">
            <span className={styles.kicker}>{template.benefitsHeader.kicker}</span>
            <h2 className={styles.h2_38_15}>{template.benefitsHeader.title}</h2>
          </div>

          {template.benefitBlocks.map((item, i) => {
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
            <span className={styles.kicker}>{template.activation.kicker}</span>
            <h2 className={styles.h2_38_15}>{template.activation.title}</h2>
            <p className={styles.sectionLead}>{template.activation.subtitle}</p>
          </div>

          <div className={styles.stepsRow}>
            <div className={styles.stepsLine} data-rv="ln" />

            <div className={styles.stepCard} data-rv="rv">
              <div className={styles.stepNum}>
                {template.activation.steps[0].num}
              </div>
              <h3 className={styles.stepTitle}>
                {template.activation.steps[0].title}
              </h3>
              <p className={styles.stepText}>
                {template.activation.steps[0].text}
              </p>
            </div>

            <div className={styles.stepCard} data-rv="rv">
              <div className={styles.stepNum}>
                {template.activation.steps[1].num}
              </div>
              <h3 className={styles.stepTitle}>
                {template.activation.steps[1].title}
              </h3>
              <p className={styles.stepText}>
                {CREW_ACTIVATION_INFO ? `${CREW_ACTIVATION_INFO} ` : null}
                {template.activation.steps[1].consoleBeforeLink}
                <a
                  href={template.activation.steps[1].consoleLinkHref}
                  target="_blank"
                  rel="noopener nofollow"
                >
                  {template.activation.steps[1].consoleLinkLabel}
                </a>
                {template.activation.steps[1].consoleAfterLink}
              </p>
            </div>

            <div className={styles.stepCard} data-rv="rv">
              <div className={styles.stepNum}>
                {template.activation.steps[2].num}
              </div>
              <h3 className={styles.stepTitle}>
                {template.activation.steps[2].title}
              </h3>
              <p className={styles.stepText}>
                {template.activation.steps[2].text}
              </p>
            </div>

            <div className={styles.stepCard} data-rv="rv">
              <div className={styles.stepNum}>
                {template.activation.steps[3].num}
              </div>
              <h3 className={styles.stepTitle}>
                {template.activation.steps[3].title}
              </h3>
              <p className={styles.stepText}>
                {template.activation.steps[3].text}
              </p>
            </div>
          </div>
        </section>

        {/* 5. PRICE AND DELIVERY */}
        <section className={styles.priceSection}>
          <div className={styles.sectionHeader} data-rv="rv">
            <span className={styles.kicker}>
              {template.priceDelivery.kicker}
            </span>
            <h2 className={styles.h2_38_15}>
              {template.priceDelivery.title}
            </h2>
            <p className={styles.sectionLead}>
              {template.priceDelivery.subtitle}
            </p>
          </div>

          <div className={styles.tilesGrid} data-rv="rv">
            <div className={styles.tile}>
              <span className={styles.tileLabel}>{pricing.tile1Label}</span>
              <span className={styles.tileValueAccent}>
                {pricing.priceFormatted}
              </span>
              <span className={styles.tileSub}>{pricing.tile1Sub}</span>
            </div>

            <div className={styles.tile}>
              <span className={styles.tileLabel}>
                {template.priceDelivery.tile2Label}
              </span>
              <span className={styles.tileValueLarge}>
                {pricing.deliveryTime}
              </span>
              <span className={styles.tileSub}>
                {template.priceDelivery.tile2Sub}
              </span>
            </div>

            <div className={styles.tile}>
              <span className={styles.tileLabel}>
                {template.priceDelivery.tile3Label}
              </span>
              <span className={styles.tileValueMedium}>
                {template.priceDelivery.tile3Value}
              </span>
              <span className={styles.tileSub}>
                {template.priceDelivery.tile3Sub}
              </span>
            </div>
          </div>

          <p className={styles.guideNote} data-rv="rv">
            {template.priceDelivery.guideBeforeLink}
            <a href={template.priceDelivery.guideLinkHref}>
              {template.priceDelivery.guideLinkLabel}
            </a>
            {template.priceDelivery.guideAfterLink}
          </p>
        </section>

        {/* 6. COMPARISON */}
        <section className={styles.comparisonSection}>
          <div className={styles.comparisonTextCol} data-rv="rv">
            <span className={styles.kicker}>{template.comparison.kicker}</span>
            <h2 className={styles.h2_36_16}>{template.comparison.title}</h2>
            <p className={styles.bodyP}>{template.comparison.p1}</p>
            <p className={styles.bodyP}>
              {template.comparison.p2BeforeLink1}
              <a href={template.comparison.p2Link1Href}>
                {template.comparison.p2Link1Label}
              </a>
              {template.comparison.p2BetweenLinks}
              <a
                href={template.comparison.p2EpicHref}
                target="_blank"
                rel="noopener nofollow"
              >
                {template.comparison.p2EpicLabel}
              </a>
              {template.comparison.p2AfterEpic}
            </p>
          </div>

          <div className={styles.comparisonTableCard} data-rv="rv">
            <div className={styles.comparisonTableHead}>
              {template.comparison.tableHeading}
            </div>
            {template.comparison.rows.map((row) => (
              <div key={row.label} className={styles.comparisonRow}>
                <span>{row.label}</span>
                <span className={styles.comparisonValue}>{row.value}</span>
              </div>
            ))}
            <div className={styles.comparisonTotalRow}>
              <span className={styles.comparisonTotalLabel}>
                {template.comparison.total.label}
              </span>
              <span className={styles.comparisonTotalValue}>
                {template.comparison.total.value}
              </span>
            </div>
          </div>
        </section>

        {/* 7. SUPPORT AND REFUND */}
        <section className={styles.supportSection} data-rv="rv">
          <span className={styles.kicker}>{template.support.kicker}</span>
          <h2 className={styles.h2_34_16}>{template.support.title}</h2>
          <p className={styles.bodyP}>
            {template.support.beforeLink}
            <a href={template.support.linkHref}>{template.support.linkLabel}</a>
            {template.support.afterLink}
          </p>
        </section>

        {/* 8. RELATED LINKS */}
        <section className={styles.relatedSection} data-rv="rv">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>{template.relatedHeader.kicker}</span>
            <h2 className={styles.h2_34_15}>{template.relatedHeader.title}</h2>
          </div>
          <div className={styles.chipsWrap}>
            {template.relatedLinks.map((link) => (
              <a key={link.href + link.label} className={styles.chip} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* 9. FAQ */}
        <section className={styles.faqSection}>
          <div className={styles.faqHeaderCol} data-rv="rv">
            <span className={styles.kicker}>{template.faqHeader.kicker}</span>
            <h2 className={styles.h2_36_15}>{template.faqHeader.title}</h2>
            <p className={styles.faqSub}>
              {template.faqHeader.beforeContact}
              <a href={template.faqHeader.contactHref}>
                {template.faqHeader.contactLabel}
              </a>
              {template.faqHeader.betweenLinks}
              <a href={template.faqHeader.faqHref}>
                {template.faqHeader.faqLabel}
              </a>
              {template.faqHeader.afterFaq}
            </p>
          </div>

          <div className={styles.faqListCol}>
            {template.faqItems.map((faq) => (
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
            <h2 className={styles.ctaTitle}>{template.finalCta.title}</h2>
            <p className={styles.ctaSub}>{pricing.ctaSubtitle}</p>
          </div>
          <a className={styles.btnCta} href={template.finalCta.ctaHref}>
            {template.finalCta.ctaLabel}
          </a>
        </section>

        {expanded && (
          <div className={styles.readLessWrap}>
            <button
              type="button"
              className={styles.readLessBtn}
              onClick={() => {
                setExpandedSlug(null);
                document.getElementById('crew-page-root')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              <span>بستن جزئیات و بازگشت به بالا</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {!expanded && (
        <div className={styles.readMoreGate}>
          <div className={styles.readMoreDivider} aria-hidden="true">
            <span className={styles.readMoreLine} />
            <span className={styles.readMoreDiamond} />
            <span className={styles.readMoreLine} />
          </div>
          <button
            type="button"
            className={styles.readMoreBtn}
            aria-expanded={expanded}
            aria-controls="crew-more-body"
            onClick={() => setExpandedSlug(currentSlug)}
          >
            <span className={styles.readMoreGlow} aria-hidden="true" />
            <span className={styles.readMoreBadge} aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
              </svg>
            </span>
            <span className={styles.readMoreTextCol}>
              <span className={styles.readMoreTitle}>بیشتر بخوانید</span>
              <span className={styles.readMoreSub}>{template.readMoreSub}</span>
            </span>
            <span className={styles.readMoreArrow} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
