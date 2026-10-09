'use client';

import Link from 'next/link';
import React from 'react';

import type { Me } from '@/lib/api/types';
import { faNumber } from '@/lib/format';
import { getRankProgress, getTierByScore } from '@/utils/ranks';

import styles from './ProfileHero.module.css';
import { RankAvatar } from './RankAvatar';

/** Phone profile card: rank-framed picture, name, tier and progress towards the next tier. */
export function ProfileHero({
  user,
  uid,
  href,
  onClick,
  eyebrow,
}: {
  user: Me;
  uid: string;
  /** Makes the whole card a link. */
  href?: string;
  onClick?: () => void;
  eyebrow?: string;
}) {
  const points = user.points || 0;
  const tier = getTierByScore(points);
  const { next, progress, remaining } = getRankProgress(points);
  const name = user.fullName || user.displayName || user.username || 'کاربر';

  const body = (
    <>
      <span className={styles.top}>
        <RankAvatar user={user} size={60} uid={uid} />
        <span className={styles.text}>
          {eyebrow && <small className={styles.eyebrow}>{eyebrow}</small>}
          <b>{name}</b>
          <span className={styles.meta}>
            <span className={styles.tier}>{tier.name}</span>
            {user.username && <span dir="ltr">@{user.username}</span>}
          </span>
        </span>
        {href && (
          <svg viewBox="0 0 24 24" className={styles.chev} aria-hidden>
            <path d="M14.5 6.5 9 12l5.5 5.5" />
          </svg>
        )}
      </span>

      <span className={styles.progress}>
        <span className={styles.track}>
          <span className={styles.fill} style={{ '--p': Math.max(0.04, progress) } as React.CSSProperties} />
        </span>
        <span className={styles.legend}>
          <span>
            <b>{faNumber(points)}</b> امتیاز
          </span>
          <span>{next ? `${faNumber(remaining)} تا ${next.name}` : 'بالاترین رنک'}</span>
        </span>
      </span>
    </>
  );

  const style = { '--tier-from': tier.from, '--tier-glow': tier.glow } as React.CSSProperties;
  return href ? (
    <Link href={href} className={`${styles.hero} ${styles.link}`} style={style} onClick={onClick}>
      {body}
    </Link>
  ) : (
    <div className={styles.hero} style={style}>
      {body}
    </div>
  );
}
