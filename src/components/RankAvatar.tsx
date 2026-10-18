'use client';

import React from 'react';

import type { UserMini } from '@/lib/api/types';
import { getOrnamentSVGWrapper, getRingSVG, getTierByScore } from '@/utils/ranks';

import { Avatar } from './Icons';
import styles from './RankAvatar.module.css';

export interface RankAvatarProps {
  user?: Pick<UserMini, 'avatar' | 'avatarSeed' | 'points'> | null;
  score?: number;
  size: number;
  uid: string;
  avatar?: string | null;
  avatarSeed?: number | null;
  crestText?: string | null;
  crestBackground?: string | null;
  /** Pull the ornament down onto the ring (for tight spots like the tab bar). */
  tuckOrnament?: boolean;
  className?: string;
}

/**
 * The user's picture or team crest inside their rank frame (the ring and ornament), drawn at
 * ``size`` px. ``uid`` must be unique per instance on the page: a gradient id shared with a hidden
 * copy does not paint.
 */
export function RankAvatar({
  user,
  score,
  size,
  uid,
  avatar,
  avatarSeed,
  crestText,
  crestBackground,
  tuckOrnament = false,
  className = '',
}: RankAvatarProps) {
  const points = score !== undefined ? score : user?.points || 0;
  const rank = getTierByScore(points);
  const imgUrl = avatar !== undefined ? avatar : user?.avatar;
  const seed = avatarSeed !== undefined ? (avatarSeed ?? 5) : user?.avatarSeed || 5;

  return (
    <span
      className={`${styles.frame} ${className}`}
      style={{ '--size': `${size}px`, '--scale': size / 68 } as React.CSSProperties}
    >
      <span
        className={`rank-frame-wrap ${styles.ring} ${tuckOrnament ? styles.tuck : ''}`}
        data-tier={rank.id}
        style={{ '--tier-glow': rank.glow } as React.CSSProperties}
        aria-hidden
      >
        <span className="rank-frame-glow"></span>
        <span className="rank-frame-ring">{getRingSVG(rank, uid)}</span>
        <span className={styles.picture}>
          {crestText ? (
            <span
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: crestBackground || 'linear-gradient(140deg, #ff5a35, #7a1f16)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '18px',
                userSelect: 'none',
              }}
            >
              {crestText}
            </span>
          ) : imgUrl ? (
            <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Avatar seed={seed} />
          )}
        </span>
        <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank, uid)}</span>
      </span>
    </span>
  );
}
