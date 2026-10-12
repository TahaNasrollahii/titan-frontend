/** Line icons and Titan's red crystal for the live chat, drawn inline so they inherit ``currentColor``. */

import React, { useId } from 'react';

type IconProps = { className?: string };

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** The crystal from the Titan logo. Gradient ids are per instance so several can share a page. */
export function Gem({ className }: IconProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 24 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc2b8" />
          <stop offset="1" stopColor="#ff6b5c" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7302a" />
          <stop offset="1" stopColor="#7d0f10" />
        </linearGradient>
      </defs>
      <polygon points="12,0 4,15 12,17.5" fill={`url(#${id}h)`} />
      <polygon points="12,0 20,15 12,17.5" fill="#f0453a" />
      <polygon points="4,15 12,17.5 12,40" fill={`url(#${id}l)`} />
      <polygon points="20,15 12,17.5 12,40" fill="#c4231f" />
      <polygon points="12,2.5 8.6,12 12,13.2" fill="#fff" opacity=".6" />
    </svg>
  );
}

const make = (paths: React.ReactNode, viewBox = '0 0 24 24') =>
  function SupportIcon({ className }: IconProps) {
    return (
      <svg className={className} viewBox={viewBox} aria-hidden="true">
        {paths}
      </svg>
    );
  };

export const XIcon = make(<path d="M6 6l12 12M18 6L6 18" {...line} strokeWidth={2.4} />);
export const ChevronDown = make(<path d="M6 9l6 6 6-6" {...line} strokeWidth={2.2} />);
export const MoreIcon = make(
  <g fill="currentColor">
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
  </g>,
);
export const SendIcon = make(
  <path d="M4 12l16-8-6 17-3-7-7-2z" fill="currentColor" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />,
);
export const ClipIcon = make(
  <path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.5-8.5a3.3 3.3 0 014.7 4.7l-8.5 8.5a1.7 1.7 0 01-2.4-2.4l7.8-7.8" {...line} strokeWidth={1.9} />,
);
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="9" {...line} strokeWidth={2} />
    <path d="M12 7v5l3 2" {...line} strokeWidth={2} />
  </>,
);
export const LockIcon = make(
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="3" {...line} strokeWidth={1.9} />
    <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" {...line} strokeWidth={1.9} />
  </>,
);
export const CheckIcon = make(<path d="M5 12.5l4.5 4.5L19 7.5" {...line} strokeWidth={2.6} />);
export const DoubleCheckIcon = make(
  <path d="M2 12.5l4.5 4.5L16 7.5M11 15.5l1.5 1.5L22 7.5" {...line} strokeWidth={2.6} />,
  '0 0 28 24',
);
export const BellIcon = make(<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 004 0" {...line} strokeWidth={1.9} />);
export const EndIcon = make(<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 8l-4 4 4 4M6 12h10" {...line} strokeWidth={1.9} />);
export const ImageIcon = make(
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" {...line} strokeWidth={1.9} />
    <circle cx="9" cy="10" r="1.8" fill="currentColor" />
    <path d="M5 18l5-5 3 3 2.5-2.5L20 18" {...line} strokeWidth={1.9} />
  </>,
);
export const MoonIcon = make(<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" {...line} strokeWidth={1.9} />);
export const HashIcon = make(<path d="M9 4L7 20M17 4l-2 16M4.5 9h15M4 15h15" {...line} strokeWidth={1.9} />);
export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="6.5" {...line} strokeWidth={2} />
    <path d="M20 20l-4-4" {...line} strokeWidth={2} />
  </>,
);
export const UserIcon = make(
  <>
    <circle cx="12" cy="8" r="4" {...line} strokeWidth={1.9} />
    <path d="M4.5 20a7.5 7.5 0 0115 0" {...line} strokeWidth={1.9} />
  </>,
);
export const TransferIcon = make(<path d="M7 7h12l-3-3M17 17H5l3 3" {...line} strokeWidth={1.9} />);
export const NoteIcon = make(
  <>
    <path d="M5 4h10l4 4v12H5z" {...line} strokeWidth={1.9} />
    <path d="M9 12h6M9 16h4" {...line} strokeWidth={1.9} />
  </>,
);
export const CopyIcon = make(
  <>
    <rect x="8" y="8" width="12" height="12" rx="3" {...line} strokeWidth={1.9} />
    <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" {...line} strokeWidth={1.9} />
  </>,
);
export const BoltIcon = make(<path d="M13 3L5 14h6l-1 7 8-11h-6z" {...line} strokeWidth={1.9} />);
