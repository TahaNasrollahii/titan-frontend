'use client';

import React from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import dashboardStyles from '@/app/dashboard/page.module.css';

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <DashboardSidebar activeTab="teams" />
      
      <main className={dashboardStyles.contentArea}>
        <div className={styles.teamWrapper}>
      {/* Banner & Logo */}
      <div className={styles.banner}>
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>IR</div>
        </div>
      </div>

      {/* Header Info */}
      <div className={styles.headerInfo}>
        <h1 className={styles.teamName}>
          Iran Titans <span className={styles.teamTag}>IR</span>
        </h1>
        <div className={styles.gameLabel}>
          <Icon name="game" /> تیم اختصاصی Valorant
        </div>
      </div>

      <div className={styles.grid}>
        {/* Main Content (Roster) */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <Icon name="users" /> لیست اعضای تیم
          </div>
          
          <div className={styles.memberList}>
            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                  <ProfileAvatar seed={5} score={100} />
                </div>
                <div>
                  <div className={styles.memberName}>TahaTitan</div>
                  <div className={styles.memberRole}>عضو شده در ۱۴ مهر</div>
                </div>
              </div>
              <div className={`${styles.roleBadge} ${styles.roleCaptain}`}>کاپیتان</div>
            </div>

            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                  <ProfileAvatar seed={12} score={50} />
                </div>
                <div>
                  <div className={styles.memberName}>ShadowHunter</div>
                  <div className={styles.memberRole}>عضو شده در ۲۰ آبان</div>
                </div>
              </div>
              <div className={styles.roleBadge}>بازیکن</div>
            </div>
            
            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                  <ProfileAvatar seed={3} score={20} />
                </div>
                <div>
                  <div className={styles.memberName}>ProSniperX</div>
                  <div className={styles.memberRole}>عضو شده در ۵ آذر</div>
                </div>
              </div>
              <div className={styles.roleBadge}>بازیکن</div>
            </div>
          </div>
        </div>

        {/* Sidebar (Stats & Info) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <Icon name="flame" /> آمار تیم
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>۱۲</div>
                <div className={styles.statLabel}>مسابقات</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue} style={{ color: '#3ddc84' }}>٪۶۸</div>
                <div className={styles.statLabel}>نرخ برد</div>
              </div>
            </div>
          </div>
          
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <Icon name="trophy" /> آخرین تورنومنت‌ها
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
              این تیم هنوز در هیچ تورنومنتی مقام نیاورده است.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
