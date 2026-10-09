'use client';

import React from 'react';

import type { UserMini } from '@/lib/api/types';
import { getOrnamentSVGWrapper, getRingSVG, getTierByScore } from '@/utils/ranks';

import { Avatar } from './Icons';
import styles from './RankAvatar.module.css';

/**
 * The user's picture inside their rank frame (the desktop rail's ring and ornament), drawn at
 * ``size`` px. ``uid`` must be unique per instance on the page: a gradient id shared with a hidden
 * copy does not paint.
 */
export function RankAvatar({
  user,
  size,
  uid,
  tuckOrnament = false,
}: {
  user: Pick<UserMini, 'avatar' | 'avatarSeed' | 'points'>;
  size: number;
  uid: string;
  /** Pull the ornament down onto the ring (for tight spots like the tab bar). */
  tuckOrnament?: boolean;
}) {
  const rank = getTierByScore(user.points || 0);
  return (
    <span className={styles.frame} style={{ '--size': `${size}px`, '--scale': size / 68 } as React.CSSProperties}>
      <span
        className={`rank-frame-wrap ${styles.ring} ${tuckOrnament ? styles.tuck : ''}`}
        data-tier={rank.id}
        style={{ '--tier-glow': rank.glow } as React.CSSProperties}
        aria-hidden
      >
        <span className="rank-frame-glow"></span>
        <span className="rank-frame-ring">{getRingSVG(rank, uid)}</span>
        <span className={styles.picture}>
          {user.avatar ? <img src={user.avatar} alt="" /> : <Avatar seed={user.avatarSeed || 5} />}
        </span>
        <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank, uid)}</span>
      </span>
    </span>
  );
}
