'use client';

import React, { useState, Suspense } from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ModalType = string | null;

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>در حال بارگذاری...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'orders': return <OrdersTab />;
      case 'favorites': return <FavoritesTab />;
      case 'teams': return <TeamsTab openModal={setActiveModal} />;
      case 'tournaments': return <TournamentsTab openModal={setActiveModal} />;
      case 'notifications': return <NotificationsTab />;
      default: return <OverviewTab />;
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      {renderContent()}

      {/* Global Modals */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{getModalTitle(activeModal)}</h3>
              <button className={styles.closeModalBtn} onClick={closeModal}><Icon name="x" /></button>
            </div>
            {renderModalBody(activeModal, closeModal)}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================
   Modal Rendering Helpers
========================================= */
function getModalTitle(type: ModalType) {
  switch (type) {
    default: return '';
  }
}

function renderModalBody(type: ModalType, closeModal: () => void) {
  switch (type) {
    default:
      return null;
  }
}

/* =========================================
   Tabs Components
========================================= */

function OverviewTab() {
  return (
    <>
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.wallet}`}>
          <div className={styles.statIcon}><Icon name="bag" /></div>
          <div>
            <div className={styles.statValue}>۱,۴۵۰,۰۰۰</div>
            <div className={styles.statLabel}>موجودی کیف پول (تومان)</div>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.tourney}`}>
          <div className={styles.statIcon}><Icon name="trophy" /></div>
          <div>
            <div className={styles.statValue}>۱۲</div>
            <div className={styles.statLabel}>تورنومنت‌های شرکت کرده</div>
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.teams}`}>
          <div className={styles.statIcon}><Icon name="users" /></div>
          <div>
            <div className={styles.statValue}>۳</div>
            <div className={styles.statLabel}>تیم‌های فعال من</div>
          </div>
        </div>
      </section>

      <div className={styles.grid2Col}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>تاریخچه رقابت‌ها</h3>
          </div>
          <div className={styles.emptyState}>
            <Icon name="swords" />
            <p>هنوز در رقابتی شرکت نکرده‌اید.</p>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>آخرین سفارش‌ها</h3>
          </div>
          <div className={styles.emptyState}>
            <Icon name="cart" />
            <p>سبد خرید شما خالی بوده است.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileTab() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>اطلاعات حساب کاربری</h3>
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ transform: 'scale(1.2)', transformOrigin: 'right center', marginRight: '8px' }}>
          <ProfileAvatar seed={5} score={0} />
        </div>
        <div>
          <button className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '13px' }}>تغییر آواتار</button>
        </div>
      </div>
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label>نام و نام خانوادگی</label>
          <input type="text" className={styles.input} defaultValue="طاها" />
        </div>
        <div className={styles.formGroup}>
          <label>ایمیل</label>
          <input type="email" className={styles.input} defaultValue="taha@example.com" />
        </div>
        <div className={styles.formGroup}>
          <label>شماره موبایل</label>
          <input type="text" className={styles.input} defaultValue="۰۹۱۲۳۴۵۶۷۸۹" />
        </div>
        <div className={styles.formGroup}>
          <label>نام کاربری (Game ID)</label>
          <input type="text" className={styles.input} defaultValue="TahaTitan" />
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <button className={styles.btnPrimary}>ذخیره تغییرات</button>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>سفارش‌های من</h3>
      </div>
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon}><Icon name="game" /></div>
          <div className={styles.itemDetails}>
            <h4>گیفت کارت استیم 50 دلاری</h4>
            <p>کد سفارش: ORD-12345 • تاریخ: ۲ روز پیش</p>
          </div>
        </div>
        <div>
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>تکمیل شده</span>
        </div>
      </div>
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon}><Icon name="cursor" /></div>
          <div className={styles.itemDetails}>
            <h4>موس گیمینگ لاجیتک G Pro</h4>
            <p>کد سفارش: ORD-12344 • تاریخ: ۵ روز پیش</p>
          </div>
        </div>
        <div>
          <span className={`${styles.badge} ${styles.badgeWarning}`}>در حال ارسال</span>
        </div>
      </div>
    </div>
  );
}

function FavoritesTab() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>لیست علاقه‌مندی‌ها</h3>
      </div>
      <div className={styles.emptyState}>
        <Icon name="heart" />
        <p>لیست علاقه‌مندی‌های شما خالی است.</p>
        <Link href="/store" className={styles.btnPrimary}>مشاهده فروشگاه</Link>
      </div>
    </div>
  );
}

function TeamsTab({ openModal }: { openModal: (t: ModalType) => void }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>تیم‌های من</h3>
        <Link href="/teams/create" className={styles.btnPrimary} style={{ padding: '8px 16px', textDecoration: 'none' }}><Icon name="plus" /> ساخت تیم</Link>
      </div>
      
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff' }}>IR</div>
          <div className={styles.itemDetails}>
            <h4>Iran Titans</h4>
            <p>بازی: Valorant • ۵ عضو • نقش: کاپیتان</p>
          </div>
        </div>
        <Link href="/teams/1/manage" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>مدیریت تیم</Link>
      </div>

      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #7c2d12, #450a0a)', color: '#fff' }}>SN</div>
          <div className={styles.itemDetails}>
            <h4>Sniper Elite</h4>
            <p>بازی: CS2 • ۳ عضو • نقش: بازیکن</p>
          </div>
        </div>
        <Link href="/teams/2" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>مشاهده</Link>
      </div>
    </div>
  );
}

function TournamentsTab({ openModal }: { openModal: (t: ModalType) => void }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>تورنومنت‌های من</h3>
      </div>
      
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: '#222' }}><Icon name="trophy" /></div>
          <div className={styles.itemDetails}>
            <h4>تورنومنت فصلی ولورانت</h4>
            <p>وضعیت: در حال برگزاری • مرحله: نیمه‌نهایی</p>
          </div>
        </div>
        <Link href="/tournaments/1/bracket" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>ورود به براکت</Link>
      </div>

      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: '#222' }}><Icon name="clock" /></div>
          <div className={styles.itemDetails}>
            <h4>جام قهرمانان دوتا ۲</h4>
            <p>وضعیت: ثبت‌نام شده • شروع: ۲ روز دیگر</p>
          </div>
        </div>
        <Link href="/tournaments/2" className={styles.btnSecondary} style={{ textDecoration: 'none' }}>جزئیات</Link>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>پیام‌ها و اعلان‌ها</h3>
        <button className={styles.btnSecondary} style={{ padding: '6px 12px' }}>خواندن همه</button>
      </div>
      
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ color: '#3ddc84', background: 'rgba(61, 220, 132, 0.1)' }}><Icon name="bell" /></div>
          <div className={styles.itemDetails}>
            <h4>تایید ثبت‌نام در تورنومنت</h4>
            <p>ثبت نام تیم شما در جام قهرمانان دوتا ۲ با موفقیت تایید شد.</p>
          </div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>۲ ساعت پیش</span>
      </div>

      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ color: '#a5c6ff', background: 'rgba(165, 198, 255, 0.1)' }}><Icon name="users" /></div>
          <div className={styles.itemDetails}>
            <h4>دعوتنامه تیم</h4>
            <p>تیم Shadow Strike شما را دعوت به عضویت کرده است.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.btnPrimary} style={{ padding: '6px 12px' }}>قبول</button>
          <button className={styles.btnSecondary} style={{ padding: '6px 12px' }}>رد</button>
        </div>
      </div>
    </div>
  );
}
