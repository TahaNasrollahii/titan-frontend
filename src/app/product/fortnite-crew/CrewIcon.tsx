import React from 'react';
import type { BenefitIconKey } from './content';

interface CrewIconProps {
  icon: BenefitIconKey;
  size: number;
  stroke: string;
  strokeWidth: number;
}

export function CrewIcon({ icon, size, stroke, strokeWidth }: CrewIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'gift':
      return (
        <svg {...commonProps}>
          <path d="M20 12v9H4v-9" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 21V7" />
          <path d="M12 7H8a2.5 2.5 0 1 1 0-5c2.5 0 4 5 4 5z" />
          <path d="M12 7h4a2.5 2.5 0 1 0 0-5c-2.5 0-4 5-4 5z" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="m4.9 4.9 2.1 2.1" />
          <path d="m17 17 2.1 2.1" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="m4.9 19.1 2.1-2.1" />
          <path d="m17 7 2.1-2.1" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...commonProps}>
          <path d="M21 7.5 12 3 3 7.5v9L12 21l9-4.5z" />
          <path d="M3 7.5 12 12l9-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case 'note':
      return (
        <svg {...commonProps}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...commonProps}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
  }
}

