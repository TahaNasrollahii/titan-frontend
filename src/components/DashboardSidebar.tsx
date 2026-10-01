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
