'use client';

import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { gameAccountsApi } from '@/lib/api/endpoints';
import type { GameAccount } from '@/lib/api/types';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';

const EMPTY = { title: '', username: '', password: '' };

export function AccountsTab() {
  const { addToast } = useAppContext();
  const accounts = useApi(gameAccountsApi.list);
  /** ``null`` = closed, ``'new'`` = adding, a number = editing that account. */
  const [editing, setEditing] = useState<'new' | number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const open = (account?: GameAccount) => {
    setEditing(account ? account.id : 'new');
    setForm(account ? { title: account.title, username: account.username, password: '' } : EMPTY);
  };

  const save = async () => {
    if (!form.title.trim() || !form.username.trim() || (editing === 'new' && !form.password)) {
      addToast({ title: 'خطا', text: 'لطفاً تمام فیلدها را پر کنید', icon: 'info' });
      return;
    }
    setBusy(true);
    try {
      if (editing === 'new') {
        const created = await gameAccountsApi.create(form);
        accounts.setData(current => [...(current ?? []), created]);
      } else if (typeof editing === 'number') {
        const updated = await gameAccountsApi.update(editing, form);
        accounts.setData(current => (current ?? []).map(a => (a.id === updated.id ? updated : a)));
      }
      setEditing(null);
      addToast({ title: 'ذخیره شد', icon: 'check' });
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (account: GameAccount) => {
    if (!window.confirm(`اکانت «${account.title}» حذف شود؟`)) return;
    try {
      await gameAccountsApi.remove(account.id);
      accounts.setData(current => (current ?? []).filter(a => a.id !== account.id));
    } catch (error) {
      addToast({ title: 'خطا', text: errorMessage(error), icon: 'info' });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>اکانت‌های من</h3>
        {editing === null && (
          <button className={styles.btnPrimary} style={{ padding: '8px 16px' }} onClick={() => open()}>
            <Icon name="plus" /> افزودن اکانت
          </button>
        )}
      </div>

      {editing !== null && (
        <div className={styles.inlineForm}>
          <h4 style={{ marginBottom: '16px', fontSize: '15px' }}>{editing === 'new' ? 'افزودن اکانت جدید' : 'ویرایش اکانت'}</h4>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>نام اکانت (مثلا: اکانت استیم)</label>
              <input
                type="text"
                className={styles.input}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>ایمیل یا نام کاربری</label>
              <input
                type="text"
                className={styles.input}
                dir="ltr"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{editing === 'new' ? 'رمز عبور' : 'رمز عبور جدید (خالی = بدون تغییر)'}</label>
              <input
                type="password"
                className={styles.input}
                dir="ltr"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnPrimary} onClick={save} disabled={busy}>
              ذخیره اکانت
            </button>
            <button className={styles.btnSecondary} onClick={() => setEditing(null)}>
              انصراف
            </button>
          </div>
        </div>
      )}

      {accounts.loading && <Loading />}
      {accounts.data?.map(account => (
        <div key={account.id} className={styles.listItem}>
          <div className={styles.listItemInfo}>
            <div className={styles.itemIcon} style={{ background: '#222' }}>
              <img src="/icons/accounts.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <div className={styles.itemDetails}>
              <h4>{account.title}</h4>
              <p>
                نام کاربری: {account.username} • رمز عبور: {account.hasPassword ? '••••••••' : 'ثبت نشده'}
              </p>
            </div>
          </div>
          <div className={styles.itemActions}>
            <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={() => open(account)}>
              ویرایش
            </button>
            <button
              className={`${styles.btnSecondary} ${styles.dangerBtn}`}
              style={{ padding: '6px 12px' }}
              onClick={() => remove(account)}
            >
              حذف
            </button>
          </div>
        </div>
      ))}

      {accounts.data?.length === 0 && editing === null && (
        <div className={styles.emptyState}>
          <img
            src="/icons/accounts.png"
            alt=""
            style={{ width: '64px', height: '64px', objectFit: 'contain', opacity: 0.7, marginBottom: '8px' }}
          />
          <p>شما هنوز هیچ اکانتی اضافه نکرده‌اید.</p>
        </div>
      )}
    </div>
  );
}
