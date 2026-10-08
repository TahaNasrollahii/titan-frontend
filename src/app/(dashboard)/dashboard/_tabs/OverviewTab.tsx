'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { meApi, walletApi } from '@/lib/api/endpoints';
import { faNumber, ORDER_STATUS_LABELS, timeAgo, toEnglishDigits, TOURNAMENT_STATUS_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { redirectToGateway } from '@/lib/gateway';

import styles from '../page.module.css';
import { orderBadgeClass } from './shared';

const TOPUP_PRESETS = [100_000, 500_000, 1_000_000];

function TopupForm({ onClose }: { onClose: () => void }) {
  const { addToast } = useAppContext();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (value: number) => {
    setBusy(true);
    try {
      const { paymentUrl } = await walletApi.topup(value);
      await redirectToGateway(paymentUrl, addToast);
    } catch (error) {
      addToast({ title: 'شارژ کیف پول', text: errorMessage(error), icon: 'dashboard', tone: 'error' });
      setBusy(false);
    }
  };

  return (
    <div className={styles.inlineForm}>
      <h4 style={{ marginBottom: 12 }}>شارژ کیف پول</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {TOPUP_PRESETS.map(preset => (
          <button key={preset} className={styles.btnSecondary} disabled={busy} onClick={() => submit(preset)}>
            {faNumber(preset)} تومان
          </button>
        ))}
      </div>
      <div className={styles.formGroup}>
        <label>مبلغ دلخواه (تومان)</label>
        <input
          className={styles.input}
          inputMode="numeric"
          value={amount}
          onChange={e => setAmount(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
          placeholder="مثلاً 250000"
          dir="ltr"
        />
      </div>
      <div className={styles.formActions}>
        <button className={styles.btnPrimary} disabled={busy || !amount} onClick={() => submit(Number(amount))}>
          پرداخت
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          انصراف
        </button>
      </div>
    </div>
  );
}

export function OverviewTab() {
  const dashboard = useApi(meApi.dashboard);
  const [toppingUp, setToppingUp] = useState(false);

  if (dashboard.loading) return <Loading />;
  const data = dashboard.data;
  if (!data) return <ErrorState error={dashboard.error} onRetry={dashboard.reload} />;

  return (
    <>
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.wallet}`}>
          <div className={styles.statIcon}>
            <img src="/icons/cart.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.statValue}>{faNumber(data.walletBalance)}</div>
            <div className={styles.statLabel}>موجودی کیف پول (تومان)</div>
          </div>
          <button className={styles.btnSecondary} style={{ padding: '6px 12px' }} onClick={() => setToppingUp(true)}>
            <Icon name="plus" /> شارژ
          </button>
        </div>

        <div className={`${styles.statCard} ${styles.tourney}`}>
          <div className={styles.statIcon}>
            <img src="/icons/tournament.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className={styles.statValue}>{faNumber(data.tournamentsJoined)}</div>
            <div className={styles.statLabel}>تورنومنت‌های شرکت کرده</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.teams}`}>
          <div className={styles.statIcon}>
            <img src="/icons/team.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className={styles.statValue}>{faNumber(data.activeTeams)}</div>
            <div className={styles.statLabel}>تیم‌های فعال من</div>
          </div>
        </div>
      </section>

      {toppingUp && <TopupForm onClose={() => setToppingUp(false)} />}

      <div className={styles.grid2Col}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>تاریخچه رقابت‌ها</h3>
          </div>
          {data.recentTournaments.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="swords" />
              <p>هنوز در رقابتی شرکت نکرده‌اید.</p>
              <Link href="/tournaments" className={styles.btnPrimary}>
                مشاهده مسابقات
              </Link>
            </div>
          ) : (
            data.recentTournaments.map(entry => (
              <Link
                key={entry.id}
                href={`/tournaments/${entry.tournament.slug}`}
                className={styles.listItem}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={styles.listItemInfo}>
                  <div className={styles.itemThumb}>
                    {entry.tournament.coverImage ? <img src={entry.tournament.coverImage} alt="" /> : <Icon name="trophy" />}
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>{entry.tournament.title}</h4>
                    <p>
                      {TOURNAMENT_STATUS_LABELS[entry.tournament.status]}
                      {entry.currentStage && ` • ${entry.currentStage}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>آخرین سفارش‌ها</h3>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="cart" />
              <p>هنوز سفارشی ثبت نکرده‌اید.</p>
            </div>
          ) : (
            <>
              {data.recentOrders.slice(0, 2).map(order => (
                <Link
                  key={order.number}
                  href="/dashboard?tab=orders"
                  className={styles.listItem}
                  style={{ textDecoration: 'none', color: 'inherit', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>
                      سفارش #{order.number} • {timeAgo(order.createdAt)}
                    </span>
                    <span className={`${styles.badge} ${orderBadgeClass(order.status)}`} style={{ padding: '3px 8px', fontSize: '9.5px' }}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                    {order.items[0]?.title}
                    {order.items.length > 1 && ` و ${faNumber(order.items.length - 1)} مورد دیگر`}
                  </h4>
                </Link>
              ))}
              <Link href="/dashboard?tab=orders" className={styles.btnSecondary} style={{ width: '100%' }}>
                مشاهده تاریخچه سفارشات
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
