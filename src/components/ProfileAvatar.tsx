import React from 'react';
import { Avatar } from './Icons';
import { getTierByScore, getRingSVG, getOrnamentSVGWrapper } from '@/utils/ranks';

export function ProfileAvatar({ seed = 5, score = 0 }: { seed?: number; score?: number }) {
  // Get rank data dynamically (0 score = Bronze)
  const rank = getTierByScore(score);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="rank-frame-wrap" 
        data-tier={rank.id} 
        style={{ 
          '--tier-glow': rank.glow, 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.82)',
          pointerEvents: 'none',
          zIndex: 10
        } as any}
      >
        <span className="rank-frame-glow" aria-hidden="true"></span>
        <span className="rank-frame-ring">{getRingSVG(rank)}</span>
        <span className="rank-frame-ornament">
          {getOrnamentSVGWrapper(rank)}
        </span>
      </div>

      {/* عکس خود آواتار */}
      <span className="face" style={{ position: 'relative', zIndex: 2 }}>
        <Avatar seed={seed} />
      </span>
    </div>
  );
}
