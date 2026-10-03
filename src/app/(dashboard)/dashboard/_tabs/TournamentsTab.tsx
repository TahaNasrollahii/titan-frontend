'use client';

import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { meApi } from '@/lib/api/endpoints';
import { jalaliDate, timeAgo, TOURNAMENT_STATUS_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';

const REGISTRATION_LABELS: Record<string, string> = {
  pending_payment: 'در انتظار پرداخت',
  confirmed: 'ثبت‌نام شده',
  withdrawn: 'انصراف داده',
};

export function TournamentsTab() {
  const entries = useApi(meApi.tournaments);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>تورنومنت‌های من</h3>
      </div>

      {entries.loading && <Loading />}
      {entries.data?.results.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="trophy" />
          <p>در هیچ تورنمنتی ثبت‌نام نکرده‌اید.</p>
          <Link href="/tournaments" className={styles.btnPrimary}>
            مشاهده مسابقات
          </Link>
        </div>
      )}
      {entries.data?.results.map(entry => {
        const { tournament } = entry;
        const live = tournament.status === 'live' || tournament.status === 'completed';
        let detail: string;
        if (live) detail = entry.currentStage ?? TOURNAMENT_STATUS_LABELS[tournament.status];
        else if (entry.status === 'confirmed') detail = `شروع: ${timeAgo(tournament.startsAt)} (${jalaliDate(tournament.startsAt)})`;
        else detail = REGISTRATION_LABELS[entry.status] ?? entry.status;

        return (
          <div key={entry.id} className={styles.listItem}>
            <div className={styles.listItemInfo}>
              <div className={styles.itemIcon} style={{ background: '#222' }}>
                <img
                  src={live ? '/icons/tournament.png' : '/icons/clock.png'}
                  alt=""
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              </div>
              <div className={styles.itemDetails}>
                <h4>{tournament.title}</h4>
                <p>
                  وضعیت: {TOURNAMENT_STATUS_LABELS[tournament.status]} • {detail}
                  {entry.team && ` • تیم ${entry.team.name}`}
                </p>
              </div>
            </div>
            {live ? (
              <Link href={`/tournaments/${tournament.slug}/bracket`} className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
                ورود به براکت
              </Link>
            ) : (
              <Link href={`/tournaments/${tournament.slug}`} className={styles.btnSecondary} style={{ textDecoration: 'none' }}>
                جزئیات
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
