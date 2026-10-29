import Image from 'next/image';
import Link from 'next/link';

import type { GuideSummary } from '@/lib/api/types';
import { gameIconSrc, isLocalAsset } from '@/lib/gameIcons';

import styles from './guides.module.css';

export function GuideCard({ guide }: { guide: GuideSummary }) {
  const icon = guide.game ? gameIconSrc(guide.game.slug, guide.game.iconImage) : null;
  return (
    <article className={styles.card}>
      {guide.game && (
        <span className={styles.cardGame}>
          {icon && <Image src={icon} alt="" width={18} height={18} unoptimized={isLocalAsset(icon)} />}
          {guide.game.title}
        </span>
      )}
      <h3 className={styles.cardTitle}>
        <Link href={`/guides/${guide.slug}`} className={styles.cardLink}>
          {guide.title}
        </Link>
      </h3>
      <p className={styles.cardSummary}>{guide.summary}</p>
      <span className={styles.cardMore} aria-hidden="true">
        خواندن آموزش ←
      </span>
    </article>
  );
}
