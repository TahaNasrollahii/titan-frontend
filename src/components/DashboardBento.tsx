'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import { useAppContext } from '@/context/AppContext';
import { meApi } from '@/lib/api/endpoints';
import { faNumber } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './DashboardBento.module.css';
import { sectionByTab, type DashboardSection } from './dashboardSections';

const cardIn = {
  hidden: { opacity: 0, y: 18, scale: 0.94, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
} as const;

/** Moves the card's spotlight to the finger / pointer. */
function trackSpot(event: React.PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--x', `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty('--y', `${event.clientY - box.top}px`);
}

function GoArrow() {
  return (
    <span className={styles.go} aria-hidden>
      <svg viewBox="0 0 24 24">
        <path d="M17 17 7 7M7 15V7h8" />
      </svg>
    </span>
  );
}

/** Big figure: a shimmering placeholder until it loads. */
function Figure({ value }: { value: number | undefined }) {
  return value === undefined ? (
    <span className={styles.figureSkeleton} aria-hidden />
  ) : (
    <span className={styles.figure}>{faNumber(value)}</span>
  );
}

function Card({
  section,
  variant = 'small',
  hint,
  children,
}: {
  section: DashboardSection;
  variant?: 'small' | 'feature' | 'tall';
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.li variants={cardIn} className={styles[variant]}>
      <Link
        href={`/dashboard?tab=${section.tab}`}
        className={styles.card}
        style={{ '--tone': section.tone } as React.CSSProperties}
        onPointerDown={trackSpot}
        onPointerMove={trackSpot}
      >
        <img src={section.icon} alt="" className={styles.watermark} />
        <span className={styles.head}>
          <span className={styles.icon}>
            <img src={section.icon} alt="" />
          </span>
          <GoArrow />
        </span>
        {children}
        <span className={styles.text}>
          <b>{variant === 'feature' ? section.label : section.short}</b>
          <small>{hint ?? section.hint}</small>
        </span>
      </Link>
    </motion.li>
  );
}

/** Phone dashboard hub: every section as a card, with live figures where the API has them. */
export function DashboardBento({ onLogout }: { onLogout: () => void }) {
  const { unreadNotifications } = useAppContext();
  const summary = useApi(meApi.dashboard).data;

  return (
    <motion.ul
      className={styles.grid}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
    >
      <Card section={sectionByTab('tournaments')} variant="feature">
        <span className={styles.stat}>
          <Figure value={summary?.tournamentsJoined} />
          <span>رقابت تا امروز</span>
        </span>
      </Card>

      <Card
        section={sectionByTab('notifications')}
        variant="tall"
        hint={unreadNotifications > 0 ? 'پیام تازه' : 'همه خوانده شده'}
      >
        <span className={styles.stat}>
          {unreadNotifications > 0 && <span className={styles.live} aria-hidden />}
          <Figure value={unreadNotifications} />
        </span>
      </Card>

      <Card
        section={sectionByTab('teams')}
        hint={summary ? `${faNumber(summary.activeTeams)} تیم فعال` : undefined}
      />
      <Card section={sectionByTab('orders')} />
      <Card section={sectionByTab('favorites')} />
      <Card section={sectionByTab('profile')} />
      <Card section={sectionByTab('accounts')} />

      <motion.li variants={cardIn} className={styles.small}>
        <button
          type="button"
          className={`${styles.card} ${styles.logout}`}
          style={{ '--tone': '255 90 80' } as React.CSSProperties}
          onPointerDown={trackSpot}
          onPointerMove={trackSpot}
          onClick={onLogout}
        >
          <span className={styles.head}>
            <span className={styles.icon}>
              <img src="/icons/login.png" alt="" />
            </span>
          </span>
          <span className={styles.text}>
            <b>خروج</b>
            <small>از حساب کاربری</small>
          </span>
        </button>
      </motion.li>
    </motion.ul>
  );
}
