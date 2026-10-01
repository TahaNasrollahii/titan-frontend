'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from './Icons';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import styles from '@/app/(dashboard)/dashboard/page.module.css';

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

  let activeTab = 'overview';
  
  if (pathname.startsWith('/teams')) {
    activeTab = 'teams';
  } else if (pathname.startsWith('/tournaments')) {
    activeTab = 'tournaments';
  } else if (pathname === '/dashboard') {
    activeTab = searchParams.get('tab') || 'overview';
  }

  const handleTabClick = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuHeader}>
        <h2>پنل کاربری طاها</h2>
      </div>
      
      <button className={`${styles.menuItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => handleTabClick('overview')}>
        <Icon name="home" /> پیشخوان
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => handleTabClick('profile')}>
        <Icon name="user" /> اطلاعات حساب کاربری
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => handleTabClick('orders')}>
        <Icon name="bag" /> سفارش‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'addresses' ? styles.active : ''}`} onClick={() => handleTabClick('addresses')}>
        <Icon name="cursor" /> آدرس‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'favorites' ? styles.active : ''}`} onClick={() => handleTabClick('favorites')}>
        <Icon name="heart" /> لیست علاقه‌مندی‌ها
      </button>
      
      <div className={styles.menuDivider}></div>
      
      <button className={`${styles.menuItem} ${activeTab === 'teams' ? styles.active : ''}`} onClick={() => handleTabClick('teams')}>
        <Icon name="users" /> تیم‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'tournaments' ? styles.active : ''}`} onClick={() => handleTabClick('tournaments')}>
        <Icon name="trophy" /> تورنومنت‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => handleTabClick('notifications')}>
        <Icon name="bell" /> پیام‌ها و اعلان‌ها
      </button>
      
      <div className={styles.menuDivider}></div>
      
      <button className={`${styles.menuItem} ${styles.logoutBtn}`}>
        <Icon name="x" /> خروج از حساب
      </button>
    </aside>
  );
}
