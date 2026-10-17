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
import { openSupportChat } from './support/SupportWidget';
import { AppRow, AppTile, ToneIcon } from './ui/AppTile';
import { BottomSheet } from './ui/BottomSheet';

type TabKey = 'home' | 'store' | 'tournament' | 'me' | 'more';

/** Tab order in the bar; the bubble and the notch slide to the active tab's slot. */
const TAB_ORDER: TabKey[] = ['home', 'store', 'tournament', 'me', 'more'];

const SPRING = { type: 'spring', stiffness: 520, damping: 38 } as const;

/** Which tab a route belongs to. */
function tabFor(pathname: string | null | undefined): TabKey {
  const p = pathname?.replace(/\/+$/, '') || '/';
  if (p === '/') return 'home';
  if (/^\/(store|product|cart|checkout|payment)/.test(p)) return 'store';
  if (/^\/tournaments\/[^/]+\/bracket/.test(p)) return 'me';
  if (/^\/tournaments?(\/|$)/.test(p)) return 'tournament';
  if (/^\/(contact|about)/.test(p)) return 'more';
  if (/^\/(dashboard|login|teams|invite|desk)/.test(p)) return 'me';
  return 'home';
}

const LINK_TABS: { key: Exclude<TabKey, 'me' | 'more'>; href: string; label: string; icon: string }[] = [
  { key: 'home', href: '/', label: 'خانه', icon: '/icons/home.webp' },
  { key: 'store', href: '/store', label: 'فروشگاه', icon: '/icons/store.webp' },
  { key: 'tournament', href: '/tournament', label: 'تورنومنت', icon: '/icons/tournament.webp' },
];

const ACCOUNT_TABS = ['orders', 'teams', 'favorites', 'accounts'].map(sectionByTab);

/** A light tap on phones that support it. */
const tick = () => {
  try {
    navigator.vibrate?.(8);
  } catch {
    // Ignore vibration failure
  }
};

/** Icon, which rises into the floating bubble while active, with its label shown underneath. */
function TabInner({ icon, label, dot }: { icon: React.ReactNode; label: string; dot?: boolean }) {
  return (
    <span className={styles.tabInner}>
      <span className={styles.icon}>
        {icon}
        {dot && <span className={styles.dot} />}
      </span>
      <span className={styles.label}>{label}</span>
    </span>
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
              <img src="/titan-logo.webp" alt="لوگوی فروشگاه تایتان" className={styles.guestLogo} />
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
            <ToneIcon icon="/icons/cart.webp" tone="255 146 64" className={styles.quickIcon} />
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
            <ToneIcon icon="/icons/notif.webp" tone="47 210 122" className={styles.quickIcon} badge={unread} />
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
            icon="/icons/support.svg"
            tone="226 69 63"
            label="پشتیبانی آنلاین"
            hint="گفتگوی مستقیم با پشتیبان تایتان"
            onClick={() => {
              onClose();
              openSupportChat();
            }}
          />
          <AppRow
            href="/contact"
            icon="/icons/contact-us.webp"
            tone="45 212 191"
            label="ارتباط با ما"
            hint="پشتیبانی، تلگرام و دیسکورد"
            onClick={onClose}
          />
          <AppRow
            href="/about"
            icon="/icons/about-us.webp"
            tone="196 160 255"
            label="درباره ما"
            hint="داستان تایتان"
            onClick={onClose}
          />
        </motion.div>

        {isAuthenticated && (
          <motion.div variants={fadeUp}>
            <AppRow
              icon="/icons/login.webp"
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
  const tabIndex = Math.max(0, TAB_ORDER.indexOf(current));
  const tabClass = (key: TabKey) => `${styles.tab} ${current === key ? styles.active : ''}`;

  return (
    <>
      <nav
        className={styles.bar}
        aria-label="منوی اصلی"
        style={{ '--tab-i': tabIndex } as React.CSSProperties}
      >
        {/* Glass with a notch cut under the bubble, the notch's rim, and the bubble itself */}
        <span className={styles.bg} aria-hidden />
        <span className={styles.notch} aria-hidden />
        <span className={styles.bubble} aria-hidden />
        {LINK_TABS.map(tab => (
          <Link
            key={tab.key}
            href={tab.href}
            className={tabClass(tab.key)}
            aria-current={current === tab.key ? 'page' : undefined}
            onClick={() => {
              tick();
              if (tab.key === 'home' && (pathname === '/' || !pathname)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <TabInner label={tab.label} icon={<img src={tab.icon} alt="" aria-hidden="true" width="24" height="24" />} />
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
                <img src="/icons/account.webp" alt="" aria-hidden="true" width="24" height="24" />
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
