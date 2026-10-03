import React from 'react';

import { getOrnamentSVGWrapper, getRingSVG, getTierByScore } from '@/utils/ranks';

import { Avatar } from './Icons';

interface ProfileAvatarProps {
  seed?: number;
  score?: number;
  /** Uploaded avatar URL; falls back to the generated avatar for ``seed``. */
  image?: string | null;
}

export function ProfileAvatar({ seed = 5, score = 0, image }: ProfileAvatarProps) {
  const rank = getTierByScore(score);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="rank-frame-wrap"
        data-tier={rank.id}
        style={
          {
            '--tier-glow': rank.glow,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.82)',
            pointerEvents: 'none',
            zIndex: 10,
          } as React.CSSProperties
        }
      >
        <span className="rank-frame-glow" aria-hidden="true"></span>
        <span className="rank-frame-ring">{getRingSVG(rank)}</span>
        <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank)}</span>
      </div>

      <span
        className="face"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {image ? (
          <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Avatar seed={seed} />
        )}
      </span>
    </div>
  );
}
