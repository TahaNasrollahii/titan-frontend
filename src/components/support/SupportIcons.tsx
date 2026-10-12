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

export const XIcon = make(<path d="M18 6L6 18M6 6l12 12" {...line} strokeWidth={2.2} />);
export const ChevronDown = make(<path d="M6 9l6 6 6-6" {...line} strokeWidth={2.2} />);
export const MoreIcon = make(
  <g fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </g>,
);
export const SendIcon = make(
  <path
    d="M21.42 10.92l-16-7.5a1.2 1.2 0 00-1.67 1.34l1.6 6.32a.5.5 0 00.41.38l8.24 1.04-8.24 1.04a.5.5 0 00-.41.38l-1.6 6.32a1.2 1.2 0 001.67 1.34l16-7.5a1.2 1.2 0 000-2.16z"
    fill="currentColor"
  />,
);
export const ClipIcon = make(
  <path
    d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
    {...line}
    strokeWidth={2}
  />,
);
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="9.5" {...line} strokeWidth={2} />
    <path d="M12 6.5v5.5l3.5 2" {...line} strokeWidth={2} />
  </>,
);
export const LockIcon = make(
  <>
    <rect x="3.5" y="11" width="17" height="10" rx="3" {...line} strokeWidth={2} />
    <path d="M7 11V7a5 5 0 0110 0v4" {...line} strokeWidth={2} />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </>,
);
export const CheckIcon = make(<path d="M4.5 12.5l5 5L19.5 7.5" {...line} strokeWidth={2.4} />);
export const DoubleCheckIcon = make(
  <>
    <path d="M1.5 12.5l4.5 4.5L16 7" {...line} strokeWidth={2.4} />
    <path d="M7.5 12.5l4.5 4.5L22 7" {...line} strokeWidth={2.4} />
  </>,
  '0 0 24 24',
);
export const BellIcon = make(
  <>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...line} strokeWidth={2} />
    <path d="M13.73 21a2 2 0 01-3.46 0" {...line} strokeWidth={2} />
  </>,
);
export const EndIcon = make(
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" {...line} strokeWidth={2} />
    <polyline points="16 17 21 12 16 7" {...line} strokeWidth={2} />
    <line x1="21" y1="12" x2="9" y2="12" {...line} strokeWidth={2} />
  </>,
);
export const ImageIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="4" {...line} strokeWidth={2} />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15l-5-5L5 21" {...line} strokeWidth={2} />
  </>,
);
export const MoonIcon = make(<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...line} strokeWidth={2} />);
export const HashIcon = make(
  <>
    <line x1="4" y1="9" x2="20" y2="9" {...line} strokeWidth={2} />
    <line x1="4" y1="15" x2="20" y2="15" {...line} strokeWidth={2} />
    <line x1="10" y1="3" x2="8" y2="21" {...line} strokeWidth={2} />
    <line x1="16" y1="3" x2="14" y2="21" {...line} strokeWidth={2} />
  </>,
);
export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="7.5" {...line} strokeWidth={2} />
    <path d="M21 21l-4.35-4.35" {...line} strokeWidth={2} />
  </>,
);
export const UserIcon = make(
  <>
    <circle cx="12" cy="7.5" r="4" {...line} strokeWidth={2} />
    <path d="M4 20.5a8 8 0 0116 0" {...line} strokeWidth={2} />
  </>,
);
export const TransferIcon = make(
  <>
    <polyline points="17 2 21 6 17 10" {...line} strokeWidth={2} />
    <path d="M3 11V8a2 2 0 012-2h16" {...line} strokeWidth={2} />
    <polyline points="7 22 3 18 7 14" {...line} strokeWidth={2} />
    <path d="M21 13v3a2 2 0 01-2 2H3" {...line} strokeWidth={2} />
  </>,
);
export const NoteIcon = make(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" {...line} strokeWidth={2} />
    <polyline points="14 2 14 8 20 8" {...line} strokeWidth={2} />
    <line x1="16" y1="13" x2="8" y2="13" {...line} strokeWidth={2} />
    <line x1="14" y1="17" x2="8" y2="17" {...line} strokeWidth={2} />
  </>,
);
export const CopyIcon = make(
  <>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" {...line} strokeWidth={2} />
    <path d="M15.5 8.5V5.5a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2h3" {...line} strokeWidth={2} />
  </>,
);
export const BoltIcon = make(
  <path d="M13 2L4 13.5h7l-1 8.5 9-11.5h-7l1-8.5z" {...line} strokeWidth={2} strokeLinejoin="miter" />,
);
