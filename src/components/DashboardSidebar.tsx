'use client';

import React from 'react';
import { Icon } from './Icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/dashboard/page.module.css';

interface Props {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onTabChange }: Props) {
  const router = useRouter();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // If we are on another page, navigate back to dashboard with the tab param
      router.push(`/dashboard?tab=${tab}`);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuHeader}>
        <h2>پنل کاربری طاها</h2>
      </div>
      
      <button className={`${styles.menuItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => handleTabClick('overview')}>
        <img src="/icons/home.png" alt="home" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> پیشخوان
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => handleTabClick('profile')}>
        <img src="/icons/account.png" alt="profile" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> اطلاعات حساب کاربری
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => handleTabClick('orders')}>
        <img src="/icons/cart.png" alt="orders" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> سفارش‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'favorites' ? styles.active : ''}`} onClick={() => handleTabClick('favorites')}>
        <img src="/icons/favorite.png" alt="favorites" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> لیست علاقه‌مندی‌ها
      </button>
      
      <div className={styles.menuDivider}></div>
      
      <button className={`${styles.menuItem} ${activeTab === 'teams' ? styles.active : ''}`} onClick={() => handleTabClick('teams')}>
        <img src="/icons/team.png" alt="teams" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> تیم‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'tournaments' ? styles.active : ''}`} onClick={() => handleTabClick('tournaments')}>
        <img src="/icons/tournament.png" alt="tournament" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> تورنومنت‌های من
      </button>
      <button className={`${styles.menuItem} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => handleTabClick('notifications')}>
        <img src="/icons/notif.png" alt="notifications" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> پیام‌ها و اعلان‌ها
      </button>
      
      <div className={styles.menuDivider}></div>
      
      <button className={`${styles.menuItem} ${styles.logoutBtn}`}>
        <Icon name="x" /> خروج از حساب
      </button>
    </aside>
  );
}
