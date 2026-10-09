'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { faNumber } from '@/lib/format';

import { DashboardBento } from './DashboardBento';
import styles from './DashboardMobileNav.module.css';
import { DASHBOARD_SECTIONS, sectionByTab } from './dashboardSections';
import { ProfileHero } from './ProfileHero';
import { AppRow, AppTile, ToneIcon } from './ui/AppTile';
import { BottomSheet } from './ui/BottomSheet';

const SPRING = { type: 'spring', stiffness: 460, damping: 34 } as const;

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.gridIcon} aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2.2" />
    </svg>
  );
}

/**
 * Phone dashboard navigation (hidden above 768px, where the sidebar takes over). The overview is
 * a hub listing every section as a tile; every other section gets a header naming it, with a way
 * back and a sheet for jumping to any section.
 */
export function DashboardMobileNav({
  activeTab,
  isSectionHome,
  onLogout,
}: {
  activeTab: string;
  /** False on pages below a section (a team, an order): "back" then returns to that section. */
  isSectionHome: boolean;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { user } = useAuth();
  const { unreadNotifications } = useAppContext();
  // Remember where the sheet was opened: navigating anywhere closes it.
  const location = `${pathname}?${search}`;
  const [sheetAt, setSheetAt] = useState<string | null>(null);
  const sheetOpen = sheetAt === location;
  const closeSheet = useCallback(() => setSheetAt(null), []);

  const badgeFor = (tab: string) => (tab === 'notifications' ? unreadNotifications : 0);
  const section = sectionByTab(activeTab);
  const index = DASHBOARD_SECTIONS.indexOf(section);
  const isHub = activeTab === 'overview' && isSectionHome;

  return (
    <div className={styles.root}>
      {isHub ? (
        <>
          {user && <ProfileHero user={user} uid="-dash" eyebrow="پنل کاربری" />}

          <section aria-label="بخش‌های پنل کاربری">
            <h2 className={styles.hubTitle}>بخش‌های پنل</h2>
            <DashboardBento onLogout={onLogout} />
          </section>
        </>
      ) : (
        <header className={styles.header} style={{ '--tone': section.tone } as React.CSSProperties}>
          <Link
            href={isSectionHome ? '/dashboard' : `/dashboard?tab=${activeTab}`}
            className={styles.back}
            aria-label={isSectionHome ? 'بازگشت به پیشخوان' : `بازگشت به ${section.label}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M9.5 6.5 15 12l-5.5 5.5" />
            </svg>
          </Link>

          <button
            type="button"
            className={styles.current}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetAt(location)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={section.tab}
                className={styles.currentInner}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SPRING}
              >
                <ToneIcon icon={section.icon} tone={section.tone} active className={styles.currentIcon} />
                <span className={styles.currentText}>
                  <small>
                    پنل کاربری
                    <span className={styles.sep} aria-hidden />
                    بخش {faNumber(index + 1)} از {faNumber(DASHBOARD_SECTIONS.length)}
                  </small>
                  <b>{section.label}</b>
                </span>
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            type="button"
            className={styles.switch}
            aria-label="همه بخش‌ها"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetAt(location)}
          >
            <GridIcon />
            <span className={styles.switchLabel}>بخش‌ها</span>
            {activeTab !== 'notifications' && unreadNotifications > 0 && <span className={styles.switchDot} />}
          </button>
        </header>
      )}

      <BottomSheet open={sheetOpen} onClose={closeSheet} label="بخش‌های پنل کاربری" title="بخش‌های پنل کاربری">
        <ul className={`${styles.grid} ${styles.sheetGrid}`}>
          {DASHBOARD_SECTIONS.map(item => (
            <li key={item.tab}>
              <AppTile
                href={`/dashboard?tab=${item.tab}`}
                icon={item.icon}
                tone={item.tone}
                label={item.short}
                badge={badgeFor(item.tab)}
                active={item.tab === activeTab}
                onClick={closeSheet}
              />
            </li>
          ))}
        </ul>
        <AppRow
          icon="/icons/login.png"
          tone="255 90 80"
          label="خروج از حساب"
          danger
          onClick={() => {
            closeSheet();
            onLogout();
          }}
        />
      </BottomSheet>
    </div>
  );
}
