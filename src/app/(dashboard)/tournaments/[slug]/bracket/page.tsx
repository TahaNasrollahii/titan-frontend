'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import { BracketView } from '@/components/BracketView';
import { Icon } from '@/components/Icons';
import { Empty, ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { tournamentsApi } from '@/lib/api/endpoints';
import { useApi } from '@/lib/hooks/useApi';

import styles from './page.module.css';

export default function BracketPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useAppContext();
  const tournament = useApi(() => tournamentsApi.get(slug), [slug]);
  const bracket = useApi(() => tournamentsApi.bracket(slug), [slug]);

  if (tournament.loading || bracket.loading) return <Loading />;
  if (!tournament.data) return <ErrorState error={tournament.error} onRetry={tournament.reload} />;

  const rounds = bracket.data ?? [];
  const myLiveMatch = rounds.flatMap(r => r.matches).find(m => m.isMine && m.status === 'live');

  const showLobby = () => {
    if (myLiveMatch?.lobbyCode) {
      void navigator.clipboard?.writeText(myLiveMatch.lobbyCode);
      addToast({ title: 'کد لابی کپی شد', text: myLiveMatch.lobbyCode, icon: 'copy' });
    } else {
      addToast({ title: 'لابی', text: 'کد لابی هنوز توسط ادمین ثبت نشده است.', icon: 'info' });
    }
  };

  return (
    <div className={styles.bracketWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1>براکت مسابقات ({tournament.data.title})</h1>
          <p>وضعیت لحظه‌ای رقابت‌ها و جایگاه تیم‌ها</p>
        </div>
        {myLiveMatch ? (
          <button className={styles.btnPrimary} onClick={showLobby}>
            <Icon name="play" /> ورود به لابی مسابقه (شما)
          </button>
        ) : (
          <Link href={`/tournaments/${slug}`} className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
            جزئیات تورنمنت
          </Link>
        )}
      </div>

      {rounds.length ? (
        <BracketView rounds={rounds} />
      ) : (
        <Empty icon="chart">براکت این تورنمنت هنوز منتشر نشده است.</Empty>
      )}
    </div>
  );
}
