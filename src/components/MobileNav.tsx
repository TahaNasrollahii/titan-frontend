'use client';

import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { faNumber } from '@/lib/format';
import { useMounted, useOverlay } from '@/lib/hooks/useOverlay';
import { getTierByScore } from '@/utils/ranks';

import { Avatar, Icon } from './Icons';
import styles from './MobileNav.module.css';

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

const SHEET_LINKS = [
  { href: '/cart', label: 'سبد خرید', icon: '/icons/cart.png', badge: 'cart' as const },
  { href: '/dashboard?tab=notifications', label: 'اعلان‌ها', icon: '/icons/notif.png', badge: 'unread' as const },
  { href: '/dashboard?tab=orders', label: 'سفارش‌ها', icon: '/icons/store.png' },
  { href: '/dashboard?tab=teams', label: 'تیم‌های من', icon: '/icons/team.png' },
  { href: '/dashboard?tab=favorites', label: 'علاقه‌مندی‌ها', icon: '/icons/favorite.png' },
  { href: '/dashboard?tab=accounts', label: 'اکانت‌ها', icon: '/icons/accounts.png' },
  { href: '/contact', label: 'ارتباط با ما', icon: '/icons/contact-us.png' },
  { href: '/about', label: 'درباره ما', icon: '/icons/about-us.png' },
];

/** Tap feedback + lift for one tab's content. The shared pill slides between tabs. */
function TabInner({ active, icon, label, dot }: { active: boolean; icon: React.ReactNode; label: string; dot?: boolean }) {
  return (
    <>
      {active && <motion.span layoutId="mobile-tab-pill" className={styles.pill} transition={SPRING} />}
      <motion.span className={styles.tabInner} whileTap={{ scale: 0.86 }} transition={SPRING}>
        <motion.span className={styles.icon} animate={{ y: active ? -1 : 0, scale: active ? 1.1 : 1 }} transition={SPRING}>
          {icon}
          {dot && <span className={styles.dot} />}
        </motion.span>
        <span className={styles.label}>{label}</span>
      </motion.span>
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

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, unreadNotifications } = useAppContext();
  const drag = useDragControls();
  useOverlay(open, onClose);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };
  const badgeFor = (kind?: 'cart' | 'unread') =>
    kind === 'cart' ? cartCount : kind === 'unread' && isAuthenticated ? unreadNotifications : 0;

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="منوی بیشتر"
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            exit={{ y: '105%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            {/* Drag from the top strip only, so the rest of the sheet can scroll on short screens */}
            <div className={styles.grab} onPointerDown={event => drag.start(event)} aria-hidden>
              <span className={styles.handle} />
            </div>

            {isAuthenticated && user ? (
              <Link href="/dashboard" className={styles.userCard} onClick={onClose}>
                <span className={styles.userAvatar}>
                  {user.avatar ? <img src={user.avatar} alt="" /> : <Avatar seed={user.avatarSeed || 5} />}
                </span>
                <span className={styles.userText}>
                  <b>{user.username || user.displayName || 'کاربر'}</b>
                  <small>
                    {getTierByScore(user.points || 0).name} · {faNumber(user.points || 0)} امتیاز
                  </small>
                </span>
                <Icon name="chev" className={styles.userChev} />
              </Link>
            ) : (
              <div className={styles.guestCard}>
                <div>
                  <b>به تایتان خوش اومدی</b>
                  <small>وارد شو تا سفارش‌ها، تیم‌ها و تورنومنت‌هات اینجا باشن.</small>
                </div>
                <Link href="/login" className={styles.loginBtn} onClick={onClose}>
                  ورود / ثبت‌نام
                </Link>
              </div>
            )}

            <motion.ul
              className={styles.grid}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } }}
            >
              {SHEET_LINKS.map(item => {
                const badge = badgeFor(item.badge);
                return (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 18, scale: 0.9 },
                      show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
                    }}
                  >
                    <Link href={item.href} className={styles.tile} onClick={onClose}>
                      <span className={styles.tileIcon}>
                        <img src={item.icon} alt="" />
                        {badge > 0 && <span className={styles.badge}>{faNumber(badge)}</span>}
                      </span>
                      <span className={styles.tileLabel}>{item.label}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>

            {isAuthenticated && (
              <button
                type="button"
                className={styles.logout}
                onClick={() => {
                  onClose();
                  logout();
                }}
              >
                <img src="/icons/login.png" alt="" />
                خروج از حساب
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
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

  return (
    <>
      <nav className={styles.bar} aria-label="منوی اصلی">
        {LINK_TABS.map(tab => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`${styles.tab} ${current === tab.key ? styles.active : ''}`}
            aria-current={current === tab.key ? 'page' : undefined}
          >
            <TabInner active={current === tab.key} label={tab.label} icon={<img src={tab.icon} alt="" />} />
          </Link>
        ))}

        <Link
          href={isAuthenticated ? '/dashboard' : '/login'}
          className={`${styles.tab} ${current === 'me' ? styles.active : ''}`}
          aria-current={current === 'me' ? 'page' : undefined}
        >
          <TabInner
            active={current === 'me'}
            label={isAuthenticated ? 'پروفایل' : 'ورود'}
            dot={isAuthenticated && unreadNotifications > 0}
            icon={
              isAuthenticated && user ? (
                <span className={styles.meAvatar}>
                  {user.avatar ? <img src={user.avatar} alt="" /> : <Avatar seed={user.avatarSeed || 5} />}
                </span>
              ) : (
                <img src="/icons/login.png" alt="" />
              )
            }
          />
        </Link>

        <button
          type="button"
          className={`${styles.tab} ${current === 'more' ? styles.active : ''}`}
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
          onClick={() => setSheetPath(sheetOpen ? null : pathname)}
        >
          <TabInner active={current === 'more'} label="بیشتر" icon={<MoreIcon open={sheetOpen} />} />
        </button>
      </nav>

      <MoreSheet open={sheetOpen} onClose={closeSheet} />
    </>
  );
}
