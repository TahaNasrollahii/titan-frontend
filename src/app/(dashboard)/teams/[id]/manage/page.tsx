'use client';

import React from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import Link from 'next/link';

export default function TeamManagePage({ params }: { params: { id: string } }) {
  return (
    <div className={styles.manageWrapper}>
      <div className={styles.pageHeader}>
        <h1>تنظیمات تیم Iran Titans</h1>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="settings" /> اطلاعات پایه‌ای تیم
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, #1f2937, #111827)', display: 'grid', placeItems: 'center', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
            IR
          </div>
          <div>
            <button className={styles.btnSecondary} style={{ marginBottom: '8px' }}>آپلود لوگوی جدید</button>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>حداکثر حجم: ۲ مگابایت (PNG یا JPG)</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>نام تیم</label>
            <input type="text" className={styles.input} defaultValue="Iran Titans" />
          </div>
          <div className={styles.formGroup}>
            <label>تگ تیم</label>
            <input type="text" className={styles.input} defaultValue="IR" maxLength={4} />
          </div>
          <div className={styles.formGroup}>
            <label>بازی اصلی</label>
            <select className={styles.input} defaultValue="valorant">
              <option value="valorant">Valorant</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="dota2">Dota 2</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>منطقه (Region)</label>
            <select className={styles.input} defaultValue="eu">
              <option value="eu">Europe (اروپا)</option>
              <option value="me">Middle East (خاورمیانه)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <button className={styles.btnPrimary}>ذخیره تغییرات اطلاعات</button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="users" /> مدیریت اعضای تیم
        </div>
        
        <div className={styles.formGroup} style={{ marginBottom: '32px' }}>
          <label>لینک دعوت اعضا (ارسال برای بازیکنان جدید)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" className={styles.input} value="https://titan.ir/invite/t-1x9a2" readOnly style={{ flex: 1 }} />
            <button className={styles.btnSecondary}>کپی لینک</button>
            <button className={styles.btnSecondary}><Icon name="refresh" /></button>
          </div>
        </div>

        <div className={styles.memberList}>
          <div className={styles.memberItem}>
            <div className={styles.memberInfo}>
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                <ProfileAvatar seed={5} score={100} />
              </div>
              <div>
                <div className={styles.memberName}>TahaTitan (شما)</div>
                <div className={styles.memberRole}>کاپیتان تیم</div>
              </div>
            </div>
          </div>

          <div className={styles.memberItem}>
            <div className={styles.memberInfo}>
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                <ProfileAvatar seed={12} score={50} />
              </div>
              <div>
                <div className={styles.memberName}>ShadowHunter</div>
                <div className={styles.memberRole}>بازیکن</div>
              </div>
            </div>
            <div className={styles.memberActions}>
              <button className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '13px' }}>ارتقا به کاپیتان</button>
              <button className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '13px' }}>اخراج</button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.panel} style={{ borderColor: 'rgba(226, 69, 63, 0.3)' }}>
        <div className={styles.panelTitle} style={{ color: '#ff6a6a' }}>
          <Icon name="alert-triangle" /> منطقه خطر
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          با انحلال تیم، تمامی رکوردها، سوابق مسابقات و لیست اعضا برای همیشه پاک شده و غیرقابل بازگشت خواهد بود. آیا از این کار اطمینان دارید؟
        </p>
        <button className={styles.btnDanger}>انحلال کامل تیم</button>
      </div>
    </div>
  );
}
