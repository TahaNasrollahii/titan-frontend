'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import Link from 'next/link';

type ModalType = 'newAddress' | 'editAddress' | 'createTeam' | 'manageTeam' | 'viewTeam' | 'enterBracket' | 'tournamentDetails' | null;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'orders': return <OrdersTab />;
      case 'addresses': return <AddressesTab openModal={setActiveModal} />;
      case 'favorites': return <FavoritesTab />;
      case 'teams': return <TeamsTab openModal={setActiveModal} />;
      case 'tournaments': return <TournamentsTab openModal={setActiveModal} />;
      case 'notifications': return <NotificationsTab />;
      default: return <OverviewTab />;
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className={styles.dashboardWrapper}>
      {/* Inner Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.menuHeader}>
          <h2>پنل کاربری طاها</h2>
        </div>
        
        <button className={`${styles.menuItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>
          <Icon name="home" /> پیشخوان
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>
          <Icon name="user" /> اطلاعات حساب کاربری
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>
          <Icon name="bag" /> سفارش‌های من
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'addresses' ? styles.active : ''}`} onClick={() => setActiveTab('addresses')}>
          <Icon name="cursor" /> آدرس‌های من
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'favorites' ? styles.active : ''}`} onClick={() => setActiveTab('favorites')}>
          <Icon name="heart" /> لیست علاقه‌مندی‌ها
        </button>
        
        <div className={styles.menuDivider}></div>
        
        <button className={`${styles.menuItem} ${activeTab === 'teams' ? styles.active : ''}`} onClick={() => setActiveTab('teams')}>
          <Icon name="users" /> تیم‌های من
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'tournaments' ? styles.active : ''}`} onClick={() => setActiveTab('tournaments')}>
          <Icon name="trophy" /> تورنومنت‌های من
        </button>
        <button className={`${styles.menuItem} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}>
          <Icon name="bell" /> پیام‌ها و اعلان‌ها
        </button>
        
        <div className={styles.menuDivider}></div>
        
        <button className={`${styles.menuItem} ${styles.logoutBtn}`}>
          <Icon name="x" /> خروج از حساب
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        {renderContent()}
      </main>

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
    </div>
  );
}

/* =========================================
   Modal Rendering Helpers
========================================= */
function getModalTitle(type: ModalType) {
  switch (type) {
    case 'newAddress': return 'افزودن آدرس جدید';
    case 'editAddress': return 'ویرایش آدرس';
    case 'createTeam': return 'ساخت تیم جدید';
    case 'manageTeam': return 'مدیریت تیم';
    case 'viewTeam': return 'اطلاعات تیم';
    case 'enterBracket': return 'براکت تورنومنت';
    case 'tournamentDetails': return 'جزئیات تورنومنت';
    default: return '';
  }
}

function renderModalBody(type: ModalType, closeModal: () => void) {
  switch (type) {
    case 'newAddress':
    case 'editAddress':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.formGroup}>
            <label>عنوان آدرس</label>
            <input type="text" className={styles.input} placeholder="مثلا: خانه، محل کار" defaultValue={type === 'editAddress' ? 'خانه (تهران)' : ''} />
          </div>
          <div className={styles.formGroup}>
            <label>آدرس کامل</label>
            <textarea className={styles.input} rows={3} placeholder="استان، شهر، خیابان، پلاک، واحد" defaultValue={type === 'editAddress' ? 'تهران، خیابان ولیعصر، کوچه فلان، پلاک ۱۲، واحد ۳' : ''}></textarea>
          </div>
          <div style={{ marginTop: '8px' }}>
            <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={closeModal}>ثبت آدرس</button>
          </div>
        </div>
      );
    case 'createTeam':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.formGroup}>
            <label>نام تیم</label>
            <input type="text" className={styles.input} placeholder="Titan Slayers" />
          </div>
          <div className={styles.formGroup}>
            <label>تگ تیم</label>
            <input type="text" className={styles.input} placeholder="TS" maxLength={4} />
          </div>
          <div className={styles.formGroup}>
            <label>بازی اصلی</label>
            <select className={styles.input} style={{ appearance: 'none' }}>
              <option value="valorant">Valorant</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="dota2">Dota 2</option>
            </select>
          </div>
          <div style={{ marginTop: '8px' }}>
            <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={closeModal}>ایجاد تیم</button>
          </div>
        </div>
      );
    case 'manageTeam':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--muted)' }}>
          <p>شما کاپیتان تیم <strong>Iran Titans</strong> هستید.</p>
          <div className={styles.formGroup}>
            <label>لینک دعوت اعضا (ارسال برای دوستان)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className={styles.input} value="https://titan.ir/invite/t-1x9a2" readOnly />
              <button className={styles.btnSecondary}>کپی</button>
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
            <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={closeModal}>ذخیره تغییرات</button>
            <button className={styles.btnSecondary} style={{ color: '#ff6a6a', borderColor: 'rgba(226,69,63,0.3)' }} onClick={closeModal}>انحلال تیم</button>
          </div>
        </div>
      );
    case 'viewTeam':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--muted)' }}>
          <p>تیم <strong>Sniper Elite</strong> در حال حاضر ۳ عضو دارد و نیازمند ۲ بازیکن برای شرکت در تورنومنت CS2 است.</p>
          <button className={styles.btnSecondary} style={{ width: '100%', color: '#ff6a6a' }} onClick={closeModal}>خروج از تیم</button>
        </div>
      );
    case 'enterBracket':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', color: 'var(--muted)' }}>
          <Icon name="swords" />
          <p style={{ fontSize: '15px', color: '#fff' }}>مسابقه بعدی شما: امشب ساعت ۲۱:۰۰</p>
          <p>شما در مرحله نیمه‌نهایی در مقابل تیم <strong>Dark Phoenix</strong> قرار خواهید گرفت.</p>
          <div style={{ marginTop: '8px', width: '100%' }}>
            <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={closeModal}>ورود به صفحه مسابقه (لابی)</button>
          </div>
        </div>
      );
    case 'tournamentDetails':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--muted)' }}>
          <p><strong>جام قهرمانان دوتا ۲</strong></p>
          <ul style={{ listStyle: 'inside', lineHeight: '1.8' }}>
            <li>شروع مسابقات: پس‌فردا ساعت ۱۸:۰۰</li>
            <li>جایزه تیم اول: ۲۰ میلیون تومان</li>
            <li>تیم‌های ثبت‌نام کرده: ۳۲ / ۳۲</li>
          </ul>
          <button className={styles.btnSecondary} style={{ width: '100%', marginTop: '8px' }} onClick={closeModal}>انصراف از تورنومنت</button>
        </div>
      );
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

function AddressesTab({ openModal }: { openModal: (t: ModalType) => void }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>آدرس‌های من</h3>
        <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={() => openModal('newAddress')}><Icon name="plus" /> آدرس جدید</button>
      </div>
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon}><Icon name="home" /></div>
          <div className={styles.itemDetails}>
            <h4>خانه (تهران)</h4>
            <p>تهران، خیابان ولیعصر، کوچه فلان، پلاک ۱۲، واحد ۳</p>
          </div>
        </div>
        <button className={styles.btnSecondary} style={{ padding: '6px' }} onClick={() => openModal('editAddress')}><Icon name="sliders" /></button>
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
        <button className={styles.btnPrimary} style={{ padding: '8px 16px' }} onClick={() => openModal('createTeam')}><Icon name="plus" /> ساخت تیم</button>
      </div>
      
      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff' }}>IR</div>
          <div className={styles.itemDetails}>
            <h4>Iran Titans</h4>
            <p>بازی: Valorant • ۵ عضو • نقش: کاپیتان</p>
          </div>
        </div>
        <button className={styles.btnSecondary} onClick={() => openModal('manageTeam')}>مدیریت تیم</button>
      </div>

      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: 'linear-gradient(135deg, #7c2d12, #450a0a)', color: '#fff' }}>SN</div>
          <div className={styles.itemDetails}>
            <h4>Sniper Elite</h4>
            <p>بازی: CS2 • ۳ عضو • نقش: بازیکن</p>
          </div>
        </div>
        <button className={styles.btnSecondary} onClick={() => openModal('viewTeam')}>مشاهده</button>
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
        <button className={styles.btnPrimary} onClick={() => openModal('enterBracket')}>ورود به براکت</button>
      </div>

      <div className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <div className={styles.itemIcon} style={{ background: '#222' }}><Icon name="clock" /></div>
          <div className={styles.itemDetails}>
            <h4>جام قهرمانان دوتا ۲</h4>
            <p>وضعیت: ثبت‌نام شده • شروع: ۲ روز دیگر</p>
          </div>
        </div>
        <button className={styles.btnSecondary} onClick={() => openModal('tournamentDetails')}>جزئیات</button>
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
