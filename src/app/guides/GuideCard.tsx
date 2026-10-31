import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideSummary } from '@/lib/api/types';
import { gameIconSrc, isLocalAsset } from '@/lib/gameIcons';

import { cleanGuideText, getGuideTheme, guideCategoryMeta } from './getGuides';
import styles from './guides.module.css';

export function GuideCard({ guide }: { guide: GuideSummary; featured?: boolean }) {
  const icon = guide.game ? gameIconSrc(guide.game.slug, guide.game.iconImage) : null;
  const theme = getGuideTheme(guide);
  const category = guideCategoryMeta(guide.category);
  const summary = cleanGuideText(guide.summary);

  return (
    <article
      className={styles.card}
      style={{ '--card-accent': theme.accent } as CSSProperties}
    >
      <div className={styles.cardTop}>
        {guide.game ? (
          <span className={styles.cardGame}>
            {icon && (
              <Image
                src={icon}
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
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
      </div>

      <h3 className={styles.cardTitle}>
        <Link href={`/guides/${guide.slug}`} className={styles.cardLink}>
          {cleanGuideText(guide.title)}
        </Link>
      </h3>

      <p className={styles.cardSummary}>{summary}</p>

      <div className={styles.cardFooter}>
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
