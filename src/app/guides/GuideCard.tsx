import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideSummary } from '@/lib/api/types';
import { jalaliDate } from '@/lib/format';
import { gameIconSrc, gameWatermarkSrc, isLocalAsset } from '@/lib/gameIcons';

import { cleanGuideText, getGuideTheme, guideCategoryMeta } from './getGuides';
import styles from './guides.module.css';

export function GuideCard({
  guide,
  featured = false,
}: {
  guide: GuideSummary;
  featured?: boolean;
}) {
  const icon = guide.game ? gameIconSrc(guide.game.slug, guide.game.iconImage) : null;
  const watermark = guide.game ? gameWatermarkSrc(guide.game.slug) : null;
  const theme = getGuideTheme(guide);
  const category = guideCategoryMeta(guide.category);
  const summary = cleanGuideText(guide.summary);

  return (
    <article
      className={`${styles.card} ${styles.spotCard} ${featured ? styles.cardFeatured : ''}`}
      style={{ '--card-accent': theme.accent } as CSSProperties}
    >
      <div className={styles.cardGlow} aria-hidden="true" />
      {watermark ? (
        <Image
          src={watermark}
          alt=""
          aria-hidden="true"
          width={180}
          height={180}
          unoptimized={isLocalAsset(watermark)}
          className={styles.cardWatermark}
        />
      ) : (
        <Image
          src={category.icon}
          alt=""
          aria-hidden="true"
          width={140}
          height={140}
          unoptimized
          className={`${styles.cardWatermark} ${styles.cardWatermarkIcon}`}
        />
      )}

      <div className={styles.cardTop}>
        <div className={styles.cardBadges}>
          {guide.game ? (
            <span className={styles.cardGame}>
              {icon && (
                <Image
                  src={icon}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  unoptimized={isLocalAsset(icon)}
                />
              )}
              <span>{guide.game.title}</span>
            </span>
          ) : (
            <span className={styles.cardCategoryPill}>
              <Image src={category.icon} alt="" aria-hidden="true" width={16} height={16} unoptimized />
              <span>{category.shortTitle}</span>
            </span>
          )}

          {guide.game && (
            <span className={styles.cardSubTag}>{category.shortTitle}</span>
          )}
        </div>

        <span className={styles.cardStepBadge}>
          <span className={styles.cardStepDot} aria-hidden="true" />
          گام‌به‌گام
        </span>
      </div>

      <h3 className={styles.cardTitle}>
        <Link href={`/guides/${guide.slug}`} className={styles.cardLink}>
          {cleanGuideText(guide.title)}
        </Link>
      </h3>

      <p className={styles.cardSummary}>{summary}</p>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>
          <Icon name="clock" />
          <span>{jalaliDate(guide.updatedAt)}</span>
        </span>

        <span className={styles.cardMore} aria-hidden="true">
          <span>مشاهده راهنما</span>
          <span className={styles.cardMoreArrow}>
            <Icon name="arrow" />
          </span>
        </span>
      </div>
    </article>
  );
}
