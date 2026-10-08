'use client';

import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';

import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage } from '@/lib/api/client';
import { meApi } from '@/lib/api/endpoints';
import { faNumber } from '@/lib/format';

import styles from '../page.module.css';

export function ProfileTab() {
  const { user, setUser } = useAuth();
  const { addToast } = useAppContext();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      setUser(await meApi.update({ ...form, username: form.username || undefined }));
      addToast({ title: 'ذخیره شد', text: 'اطلاعات حساب بروزرسانی شد', icon: 'check', tone: 'success' });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.errors);
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUser(await meApi.uploadAvatar(file));
      addToast({ title: 'آواتار بروزرسانی شد', icon: 'check', tone: 'success' });
    } catch (error) {
      addToast({ title: 'آپلود آواتار', text: errorMessage(error), icon: 'info', tone: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [name]: e.target.value }),
  });

  return (
    <form className={styles.panel} onSubmit={save}>
      <div className={styles.panelHeader}>
        <h3>اطلاعات حساب کاربری</h3>
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ transform: 'scale(1.2)', transformOrigin: 'right center', marginRight: '8px' }}>
          <ProfileAvatar seed={user.avatarSeed} score={user.points} image={user.avatar} />
        </div>
        <div>
          <button
            type="button"
            className={styles.btnSecondary}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => fileInput.current?.click()}
          >
            تغییر آواتار
          </button>
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={uploadAvatar} />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            سطح {faNumber(user.level)} • {faNumber(user.points)} امتیاز{user.rank && ` • رنک ${user.rank.name}`}
          </p>
        </div>
      </div>
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label>نام و نام خانوادگی</label>
          <input type="text" className={styles.input} {...field('fullName')} />
        </div>
        <div className={styles.formGroup}>
          <label>ایمیل</label>
          <input type="email" className={styles.input} dir="ltr" {...field('email')} />
          {errors.email && <small style={{ color: '#ff8a80' }}>{errors.email[0]}</small>}
        </div>
        <div className={styles.formGroup}>
          <label>شماره موبایل</label>
          <input type="text" className={styles.input} value={user.phone} dir="ltr" disabled />
        </div>
        <div className={styles.formGroup}>
          <label>نام کاربری (Game ID)</label>
          <input type="text" className={styles.input} dir="ltr" {...field('username')} />
          {errors.username && <small style={{ color: '#ff8a80' }}>{errors.username[0]}</small>}
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <button type="submit" className={styles.btnPrimary} disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </div>
    </form>
  );
}
