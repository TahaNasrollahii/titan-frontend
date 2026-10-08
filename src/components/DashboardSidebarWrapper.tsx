'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import styles from '@/app/(dashboard)/dashboard/page.module.css';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

const MENU: { tab: string; label: string; icon: string; dividerBefore?: boolean }[] = [
  { tab: 'overview', label: 'پیشخوان', icon: '/icons/home.png' },
  { tab: 'profile', label: 'اطلاعات حساب کاربری', icon: '/icons/account.png' },
  { tab: 'accounts', label: 'اکانت‌های من', icon: '/icons/accounts.png' },
  { tab: 'orders', label: 'سفارش‌های من', icon: '/icons/cart.png' },
  { tab: 'favorites', label: 'لیست علاقه‌مندی‌ها', icon: '/icons/favorite.png' },
  { tab: 'teams', label: 'تیم‌های من', icon: '/icons/team.png', dividerBefore: true },
  { tab: 'tournaments', label: 'تورنومنت‌های من', icon: '/icons/tournament.png' },
  { tab: 'notifications', label: 'پیام‌ها و اعلان‌ها', icon: '/icons/notif.png' },
];

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

  let activeTab = 'overview';
  if (pathname.startsWith('/teams')) activeTab = 'teams';
  else if (pathname.startsWith('/tournaments')) activeTab = 'tournaments';
  else if (pathname.startsWith('/dashboard/orders')) activeTab = 'orders';
  else if (pathname === '/dashboard') activeTab = searchParams.get('tab') || 'overview';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuHeader}>
        <h2>پنل کاربری {user?.fullName || user?.displayName || ''}</h2>
      </div>

      {MENU.map(item => (
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
  );
}
