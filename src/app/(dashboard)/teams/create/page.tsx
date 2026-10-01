'use client';

import React from 'react';
import styles from '../[id]/manage/page.module.css'; // Reusing manage styles
import { Icon } from '@/components/Icons';
import Link from 'next/link';

export default function CreateTeamPage() {
  return (
    <div className={styles.manageWrapper}>
      <div className={styles.pageHeader}>
        <h1>ساخت تیم جدید</h1>
        <p>تیم خود را تشکیل دهید و برای مسابقات آماده شوید</p>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Icon name="users" /> مشخصات اولیه تیم
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontSize: '24px', color: 'var(--muted)' }}>
            <Icon name="plus" />
          </div>
          <div>
            <button className={styles.btnSecondary} style={{ marginBottom: '8px' }}>آپلود لوگوی تیم</button>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>حداکثر حجم: ۲ مگابایت (اختیاری)</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>نام تیم</label>
            <input type="text" className={styles.input} placeholder="مثلا: Titan Slayers" />
          </div>
          <div className={styles.formGroup}>
            <label>تگ تیم (کوتاه)</label>
            <input type="text" className={styles.input} placeholder="مثلا: TS" maxLength={4} />
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
        <div style={{ marginTop: '32px' }}>
          <Link href="/dashboard" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>ایجاد تیم و دریافت لینک دعوت</Link>
        </div>
      </div>
    </div>
  );
}
