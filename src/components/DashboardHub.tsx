'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import { useAppContext } from '@/context/AppContext';
import type { Dashboard } from '@/lib/api/types';
import { meApi } from '@/lib/api/endpoints';
import { faNumber, ORDER_STATUS_LABELS, timeAgo } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './DashboardHub.module.css';
import { DASHBOARD_SECTIONS, sectionByTab } from './dashboardSections';
import { AppTile } from './ui/AppTile';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING },
};

/** The one thing worth doing next, shown big on top of the phone dashboard. */
interface Focus {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: string;
  tone: string;
  live?: boolean;
  cover?: string | null;
}

const OPEN_ORDER = new Set(['pending_payment', 'paid', 'processing']);
const UPCOMING = new Set(['upcoming', 'registration_open', 'registration_closed']);

/** Most urgent first: a live match, the next match, an open order, unread messages, then a nudge. */
function pickFocus(summary: Dashboard | undefined, unread: number): Focus {
  const entries = summary?.recentTournaments ?? [];
  const live = entries.find(entry => entry.tournament.status === 'live');
  if (live)
    return {
      eyebrow: 'در جریان',
      title: live.tournament.title,
      text: live.currentStage ?? 'مسابقه‌ات شروع شده؛ حریفت منتظره.',
      cta: 'ورود به براکت',
      href: `/tournaments/${live.tournament.slug}/bracket`,
      icon: '/icons/tournament.png',
      tone: '255 77 94',
      live: true,
      cover: live.tournament.coverImage,
    };

  const next = entries
    .filter(entry => UPCOMING.has(entry.tournament.status) && new Date(entry.tournament.startsAt).getTime() > Date.now())
    .sort((a, b) => a.tournament.startsAt.localeCompare(b.tournament.startsAt))[0];
  if (next)
    return {
      eyebrow: 'مسابقه بعدی',
      title: next.tournament.title,
      text: `شروع ${timeAgo(next.tournament.startsAt)} · ${next.tournament.game.title}`,
      cta: 'جزئیات مسابقه',
      href: `/tournaments/${next.tournament.slug}`,
      icon: '/icons/tournament.png',
      tone: '240 193 75',
      cover: next.tournament.coverImage,
    };

  const order = summary?.recentOrders.find(item => OPEN_ORDER.has(item.status));
  if (order)
    return {
      eyebrow: ORDER_STATUS_LABELS[order.status],
      title: `سفارش #${order.number}`,
      text: order.items[0]?.title ?? 'سفارشت در جریانه.',
      cta: 'پیگیری سفارش',
      href: '/dashboard?tab=orders',
      icon: '/icons/cart.png',
      tone: '255 146 64',
    };

  if (unread > 0)
    return {
      eyebrow: 'پیام تازه',
      title: `${faNumber(unread)} پیام نخونده داری`,
      text: 'دعوت تیم، نتیجه مسابقه یا خبر تازه از تایتان.',
      cta: 'خواندن پیام‌ها',
      href: '/dashboard?tab=notifications',
      icon: '/icons/notif.png',
      tone: '47 210 122',
    };

  const isNew = summary !== undefined && summary.tournamentsJoined === 0;
  return {
    eyebrow: isNew ? 'شروع کن' : 'آماده‌ای؟',
    title: isNew ? 'اولین رقابتت رو شروع کن' : 'رقابت بعدی منتظرته',
    text: isNew ? 'یه تورنومنت باز انتخاب کن و ثبت‌نام کن.' : 'تورنومنت‌های باز این هفته رو ببین.',
    cta: 'دیدن تورنومنت‌ها',
    href: '/tournaments',
    icon: '/icons/tournament.png',
    tone: '240 193 75',
  };
}

function FocusCard({ focus }: { focus: Focus }) {
  return (
    <Link
      href={focus.href}
      className={styles.focus}
      style={{ '--tone': focus.tone } as React.CSSProperties}
      onPointerDown={trackSpot}
      onPointerMove={trackSpot}
    >
      {focus.cover && <img src={focus.cover} alt="" className={styles.cover} />}
      <img src={focus.icon} alt="" className={styles.watermark} />

      <span className={styles.top}>
        <span className={styles.eyebrow}>
          <span className={`${styles.pulse} ${focus.live ? styles.pulseLive : ''}`} aria-hidden />
          {focus.eyebrow}
        </span>
        <span className={styles.icon}>
          <img src={focus.icon} alt="" />
        </span>
      </span>

      <span className={styles.body}>
        <b>{focus.title}</b>
        <small>{focus.text}</small>
      </span>

      <span className={styles.cta}>
        {focus.cta}
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </span>
    </Link>
  );
}

/** Moves the card's spotlight to the finger / pointer. */
function trackSpot(event: React.PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--x', `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty('--y', `${event.clientY - box.top}px`);
}

/**
 * Phone dashboard hub: one "next step" card chosen from the user's state, and all dashboard sections,
 * shown in a grid.
 */
export function DashboardHub() {
  const { unreadNotifications } = useAppContext();
  const summary = useApi(meApi.dashboard).data;
  const focus = pickFocus(summary, unreadNotifications);

  return (
    <motion.div
      className={styles.hub}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
    >
      <motion.div variants={fadeUp}>
        <FocusCard focus={focus} />
      </motion.div>

      <motion.div className={styles.dockContainer} variants={fadeUp}>
        <h4 className={styles.dockTitle}>تمامی بخش‌ها</h4>
        <nav className={styles.dock} aria-label="تمامی بخش‌ها">
          {DASHBOARD_SECTIONS.map(item => (
            <AppTile
              key={item.tab}
              href={`/dashboard?tab=${item.tab}`}
              icon={item.icon}
              tone={item.tone}
              label={item.short}
              badge={item.tab === 'notifications' ? unreadNotifications : 0}
              compact
            />
          ))}
        </nav>
      </motion.div>
    </motion.div>
  );
}
