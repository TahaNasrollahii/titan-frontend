'use client';

import Link from 'next/link';
import React from 'react';

import { faNumber } from '@/lib/format';

import styles from './appTile.module.css';

/** A glyph on a squircle tinted with ``tone`` ("R G B"), like a phone app icon. */
export function ToneIcon({
  icon,
  tone,
  badge = 0,
  active = false,
  className = '',
}: {
  icon: string;
  tone: string;
  badge?: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`${styles.icon} ${active ? styles.iconActive : ''} ${className}`}
      style={{ '--tone': tone } as React.CSSProperties}
    >
      <img src={icon} alt="" />
      {badge > 0 && <span className={styles.badge}>{faNumber(badge)}</span>}
    </span>
  );
}

type TileProps = {
  icon: string;
  tone: string;
  label: string;
  badge?: number;
  active?: boolean;
} & ({ href: string; onClick?: () => void } | { href?: undefined; onClick: () => void });

/** Icon tile with its label underneath: a link with ``href``, otherwise a button. */
export function AppTile({ icon, tone, label, badge, active, href, onClick }: TileProps) {
  const content = (
    <>
      <ToneIcon icon={icon} tone={tone} badge={badge} active={active} />
      <span className={styles.label}>{label}</span>
    </>
  );
  const className = `${styles.tile} ${active ? styles.active : ''}`;
  return href ? (
    <Link href={href} className={className} onClick={onClick} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={onClick} aria-current={active ? 'page' : undefined}>
      {content}
    </button>
  );
}

/** Full-width row: tinted icon, label (and optional hint), chevron. */
export function AppRow({
  icon,
  tone,
  label,
  hint,
  href,
  onClick,
  danger = false,
}: {
  icon: string;
  tone: string;
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <ToneIcon icon={icon} tone={tone} className={styles.rowIcon} />
      <span className={styles.rowText}>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      {!danger && (
        <svg viewBox="0 0 24 24" className={styles.rowChev} aria-hidden>
          <path d="M14.5 6.5 9 12l5.5 5.5" />
        </svg>
      )}
    </>
  );
  const className = `${styles.row} ${danger ? styles.rowDanger : ''}`;
  return href ? (
    <Link href={href} className={className} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
