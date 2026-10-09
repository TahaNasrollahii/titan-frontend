'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { faNumber } from '@/lib/format';

import { sectionByTab } from './dashboardSections';
import styles from './MobileNav.module.css';
import { ProfileHero } from './ProfileHero';
import { RankAvatar } from './RankAvatar';
import { AppRow, AppTile, ToneIcon } from './ui/AppTile';
import { BottomSheet } from './ui/BottomSheet';

type TabKey = 'home' | 'store' | 'tournament' | 'me' | 'more';

const SPRING = { type: 'spring', stiffness: 520, damping: 38 } as const;

/** Which tab a route belongs to. */
function tabFor(pathname: string): TabKey {
  if (pathname === '/') return 'home';
  if (/^\/(store|product|cart|checkout|payment)/.test(pathname)) return 'store';
  if (/^\/tournaments\/[^/]+\/bracket/.test(pathname)) return 'me';
  if (/^\/tournaments?(\/|$)/.test(pathname)) return 'tournament';
  if (/^\/(contact|about)/.test(pathname)) return 'more';
  return 'me';
}

const LINK_TABS: { key: Exclude<TabKey, 'me' | 'more'>; href: string; label: string; icon: string }[] = [
  { key: 'home', href: '/', label: 'خانه', icon: '/icons/home.png' },
  { key: 'store', href: '/store', label: 'فروشگاه', icon: '/icons/store.png' },
  { key: 'tournament', href: '/tournament', label: 'تورنومنت', icon: '/icons/tournament.png' },
];

const ACCOUNT_TABS = ['orders', 'teams', 'favorites', 'accounts'].map(sectionByTab);

/** A light tap on phones that support it. */
const tick = () => navigator.vibrate?.(8);

/** Icon, and the label beside it while active; the glowing pill grows in behind the active tab. */
function TabInner({ icon, label, dot }: { icon: React.ReactNode; label: string; dot?: boolean }) {
  return (
    <>
      <span className={styles.pill} aria-hidden />
      <span className={styles.tabInner}>
        <span className={styles.icon}>
          {icon}
          {dot && <span className={styles.dot} />}
        </span>
        <span className={styles.label}>{label}</span>
      </span>
    </>
  );
}

function MoreIcon({ open }: { open: boolean }) {
  // Four dots that rotate into a plus-like cross while the sheet is open.
  return (
    <motion.svg viewBox="0 0 24 24" className={styles.moreIcon} animate={{ rotate: open ? 45 : 0 }} transition={SPRING}>
      {[
        [7, 7],
        [17, 7],
        [7, 17],
        [17, 17],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
    </motion.svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
};

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, unreadNotifications } = useAppContext();
  const unread = isAuthenticated ? unreadNotifications : 0;

  return (
    <BottomSheet open={open} onClose={onClose} label="منوی بیشتر" title="منو">
      <motion.div
        className={styles.sheetBody}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } } }}
      >
        <motion.div variants={fadeUp}>
          {isAuthenticated && user ? (
            <ProfileHero user={user} uid="-sheet" href="/dashboard" onClick={onClose} eyebrow="پنل کاربری" />
          ) : (
            <div className={styles.guestCard}>
              <span className={styles.guestGlow} aria-hidden />
              <img src="/titan-logo.png" alt="" className={styles.guestLogo} />
              <div>
                <b>به تایتان خوش اومدی</b>
                <small>وارد شو تا سفارش‌ها، تیم‌ها و تورنومنت‌هات اینجا باشن.</small>
              </div>
              <Link href="/login" className={styles.loginBtn} onClick={onClose}>
                ورود / ثبت‌نام
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div className={styles.quick} variants={fadeUp}>
          <Link href="/cart" className={styles.quickCard} onClick={onClose}>
            <ToneIcon icon="/icons/cart.png" tone="255 146 64" className={styles.quickIcon} />
            <span>
              <b>سبد خرید</b>
              <small>{cartCount > 0 ? `${faNumber(cartCount)} کالا` : 'خالی'}</small>
            </span>
          </Link>
          <Link
            href={isAuthenticated ? '/dashboard?tab=notifications' : '/login'}
            className={styles.quickCard}
            onClick={onClose}
          >
            <ToneIcon icon="/icons/notif.png" tone="47 210 122" className={styles.quickIcon} badge={unread} />
            <span>
              <b>اعلان‌ها</b>
              <small>
                {!isAuthenticated ? 'برای دیدن وارد شو' : unread > 0 ? `${faNumber(unread)} پیام تازه` : 'همه خوانده شده'}
              </small>
            </span>
          </Link>
        </motion.div>

        <motion.h4 className={styles.section} variants={fadeUp}>
          حساب من
        </motion.h4>
        <motion.ul className={styles.grid} variants={fadeUp}>
          {ACCOUNT_TABS.map(item => (
            <li key={item.tab}>
              <AppTile
                href={`/dashboard?tab=${item.tab}`}
                icon={item.icon}
                tone={item.tone}
                label={item.short}
                onClick={onClose}
              />
            </li>
          ))}
        </motion.ul>

        <motion.h4 className={styles.section} variants={fadeUp}>
          تایتان
        </motion.h4>
        <motion.div className={styles.rows} variants={fadeUp}>
          <AppRow
            href="/contact"
            icon="/icons/contact-us.png"
            tone="45 212 191"
            label="ارتباط با ما"
            hint="پشتیبانی، تلگرام و دیسکورد"
            onClick={onClose}
          />
          <AppRow
            href="/about"
            icon="/icons/about-us.png"
            tone="196 160 255"
            label="درباره ما"
            hint="داستان تایتان"
            onClick={onClose}
          />
        </motion.div>

        {isAuthenticated && (
          <motion.div variants={fadeUp}>
            <AppRow
              icon="/icons/login.png"
              tone="255 90 80"
              label="خروج از حساب"
              danger
              onClick={() => {
                onClose();
                logout();
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </BottomSheet>
  );
}

/** App-style bottom tab bar for phones (hidden above 768px by CSS). */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { unreadNotifications } = useAppContext();
  // Remember where the sheet was opened: navigating anywhere closes it.
  const [sheetPath, setSheetPath] = useState<string | null>(null);
  const sheetOpen = sheetPath === pathname;
  const closeSheet = useCallback(() => setSheetPath(null), []);

  const current = sheetOpen ? 'more' : tabFor(pathname);
  const tabClass = (key: TabKey) => `${styles.tab} ${current === key ? styles.active : ''}`;

  return (
    <>
      <nav className={styles.bar} aria-label="منوی اصلی">
        {LINK_TABS.map(tab => (
          <Link
            key={tab.key}
            href={tab.href}
            className={tabClass(tab.key)}
            aria-current={current === tab.key ? 'page' : undefined}
            onClick={tick}
          >
            <TabInner label={tab.label} icon={<img src={tab.icon} alt="" />} />
          </Link>
        ))}

        <Link
          href={isAuthenticated ? '/dashboard' : '/login'}
          className={tabClass('me')}
          aria-current={current === 'me' ? 'page' : undefined}
          onClick={tick}
        >
          <TabInner
            label={isAuthenticated ? 'پروفایل' : 'ورود'}
            dot={isAuthenticated && unreadNotifications > 0}
            icon={
              isAuthenticated && user ? (
                <RankAvatar user={user} size={34} uid="-tabbar" tuckOrnament />
              ) : (
                <img src="/icons/account.png" alt="" />
              )
            }
          />
        </Link>

        <button
          type="button"
          className={tabClass('more')}
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
          onClick={() => {
            tick();
            setSheetPath(sheetOpen ? null : pathname);
          }}
        >
          <TabInner label="بیشتر" icon={<MoreIcon open={sheetOpen} />} />
        </button>
      </nav>

      <MoreSheet open={sheetOpen} onClose={closeSheet} />
    </>
  );
}
