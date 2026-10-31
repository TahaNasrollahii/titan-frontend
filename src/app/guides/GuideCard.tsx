import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideSummary } from '@/lib/api/types';
import { faNumber } from '@/lib/format';
import { gameIconSrc, isLocalAsset } from '@/lib/gameIcons';

import { cleanGuideText, getGuideTheme, guideCategoryMeta } from './getGuides';
import styles from './guides.module.css';

export function GuideCard({
  guide,
  index,
  featured = false,
}: {
  guide: GuideSummary;
  index?: number;
  featured?: boolean;
}) {
  const icon = guide.game ? gameIconSrc(guide.game.slug, guide.game.iconImage) : null;
  const theme = getGuideTheme(guide);
  const category = guideCategoryMeta(guide.category);
  const summary = cleanGuideText(guide.summary);
  const visualSrc = icon || category.icon;
  const formattedIndex =
    typeof index === 'number' ? faNumber(index).padStart(2, '۰') : null;

  return (
    <article
      className={`${styles.card} ${styles.spotCard} ${featured ? styles.cardFeatured : ''}`}
      style={{ '--card-accent': theme.accent } as CSSProperties}
    >
      <div className={styles.cardGlow} aria-hidden="true" />
      <Image
        src={theme.floatingImage || visualSrc}
        alt=""
        aria-hidden="true"
        width={120}
        height={120}
        unoptimized
        className={styles.cardWatermark}
      />

      <div className={styles.cardTop}>
        <div className={styles.cardIdentity}>
          <div className={styles.cardIconBox} aria-hidden="true">
            <Image
              src={visualSrc}
              alt=""
              width={26}
              height={26}
              unoptimized={isLocalAsset(visualSrc)}
            />
          </div>

          <div className={styles.cardBadges}>
            {guide.game ? (
              <>
                <span className={styles.cardGame}>
                  <span>{guide.game.title}</span>
                </span>
                <span className={styles.cardSubTag}>{category.shortTitle}</span>
              </>
            ) : (
              <span className={styles.cardCategoryPill}>
                <span>{category.shortTitle}</span>
              </span>
            )}
          </div>
        </div>

        {formattedIndex && (
          <span className={styles.cardIndexBadge} aria-hidden="true">
            {formattedIndex}
          </span>
        )}
      </div>

      <h3 className={styles.cardTitle}>
        <Link href={`/guides/${guide.slug}`} className={styles.cardLink}>
          {cleanGuideText(guide.title)}
        </Link>
      </h3>

      <p className={styles.cardSummary}>{summary}</p>

      <div className={styles.cardFooter}>
        <span className={styles.cardStepBadge}>
          <span className={styles.cardStepDot} aria-hidden="true" />
          <span>راهنمای گام‌به‌گام</span>
        </span>

        <span className={styles.cardMore} aria-hidden="true">
          <span>مشاهده آموزش</span>
          <span className={styles.cardMoreArrow}>
            <Icon name="arrow" />
          </span>
        </span>
      </div>
    </article>
  );
}
