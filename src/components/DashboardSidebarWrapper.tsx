'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import styles from '@/app/(dashboard)/dashboard/page.module.css';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

import { DashboardMobileNav } from './DashboardMobileNav';
import { activeSection, DASHBOARD_SECTIONS } from './dashboardSections';

export function DashboardSidebarWrapper() {
  return (
    <React.Suspense fallback={<aside className={styles.sidebar}></aside>}>
      <DashboardSidebarContent />
    </React.Suspense>
  );
}

function DashboardSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadNotifications } = useAppContext();

  const asideRef = React.useRef<HTMLElement>(null);
  const activeTab = activeSection(pathname, searchParams.get('tab'));

  // On tablets the menu is a horizontally scrolling tab bar: keep the active tab in view.
  React.useEffect(() => {
    const aside = asideRef.current;
    if (!aside || aside.scrollWidth <= aside.clientWidth) return;
    aside.querySelector(`.${styles.active}`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <aside ref={asideRef} className={styles.sidebar}>
        <div className={styles.menuHeader}>
          <h2>پنل کاربری {user?.fullName || user?.displayName || ''}</h2>
        </div>

        {DASHBOARD_SECTIONS.map(item => (
          <React.Fragment key={item.tab}>
            {item.dividerBefore && <div className={styles.menuDivider}></div>}
            <button
              className={`${styles.menuItem} ${activeTab === item.tab ? styles.active : ''}`}
              onClick={() => router.push(`/dashboard?tab=${item.tab}`)}
            >
              <img src={item.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              {item.label}
              {item.tab === 'notifications' && unreadNotifications > 0 && (
                <span className={styles.menuBadge}>{unreadNotifications.toLocaleString('fa-IR')}</span>
              )}
            </button>
          </React.Fragment>
        ))}

        <div className={styles.menuDivider}></div>

        <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
          <img src="/icons/login.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> خروج از حساب
        </button>
      </aside>

      <DashboardMobileNav
        activeTab={activeTab}
        isSectionHome={pathname === '/dashboard'}
        onLogout={handleLogout}
      />
    </>
  );
}
