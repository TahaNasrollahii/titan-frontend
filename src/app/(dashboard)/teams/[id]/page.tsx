'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ErrorState, Loading } from '@/components/ui/State';
import { teamsApi } from '@/lib/api/endpoints';
import { faNumber, jalaliDate, REGION_LABELS, ROLE_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './page.module.css';

const PRESENCE_LABELS: Record<string, string> = { online: 'آنلاین', in_game: 'در بازی', away: 'دور از سیستم', offline: 'آفلاین' };

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const team = useApi(() => teamsApi.get(id), [id]);
  const history = useApi(() => teamsApi.tournaments(id), [id]);

  if (team.loading) return <Loading />;
  const data = team.data;
  if (!data) return <ErrorState error={team.error} onRetry={team.reload} />;

  return (
    <div className={styles.teamWrapper}>
      <div className={styles.teamHeader}>
        <div className={styles.logo}>
          {data.logo ? <img src={data.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : data.tag}
        </div>
        <div className={styles.teamInfo}>
          <h1 className={styles.teamName}>
            {data.name} <span className={styles.teamTag}>{data.tag}</span>
          </h1>
          <div className={styles.gameLabel}>
            <Icon name="game" /> تیم اختصاصی {data.game.titleEn} • {REGION_LABELS[data.region]}
          </div>
        </div>
        {data.myRole === 'captain' && (
          <Link href={`/teams/${data.id}/manage`} className={styles.roleBadge} style={{ marginRight: 'auto', textDecoration: 'none' }}>
            <Icon name="settings" /> مدیریت تیم
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <Icon name="users" /> لیست اعضای تیم ({faNumber(data.memberCount)} / {faNumber(data.maxMembers)})
          </div>

          <div className={styles.memberList}>
            {data.members.map(member => (
              <div key={member.user.id} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                    <ProfileAvatar seed={member.user.avatarSeed} score={member.user.points} image={member.user.avatar} />
                  </div>
                  <div>
                    <div className={styles.memberName}>{member.user.displayName}</div>
                    <div className={styles.memberRole}>
                      عضو شده در {jalaliDate(member.joinedAt)} • {PRESENCE_LABELS[member.user.presence]}
                    </div>
                  </div>
                </div>
                <div className={`${styles.roleBadge} ${member.role === 'captain' ? styles.roleCaptain : ''}`}>
                  {ROLE_LABELS[member.role]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <Icon name="flame" /> آمار تیم
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{faNumber(data.matchesPlayed)}</div>
                <div className={styles.statLabel}>مسابقات</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue} style={{ color: '#3ddc84' }}>
                  ٪{faNumber(data.winRate)}
                </div>
                <div className={styles.statLabel}>نرخ برد</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{faNumber(data.wins)}</div>
                <div className={styles.statLabel}>برد</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{faNumber(data.points)}</div>
                <div className={styles.statLabel}>امتیاز</div>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <Icon name="trophy" /> آخرین تورنومنت‌ها
            </div>
            {history.data?.results.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                {history.data.results.slice(0, 5).map(entry => (
                  <Link key={entry.id} href={`/tournaments/${entry.tournament.slug}`} style={{ color: 'inherit' }}>
                    {entry.tournament.title}
                    {entry.finalPlacement && ` — رتبه ${faNumber(entry.finalPlacement)}`}
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                این تیم هنوز در هیچ تورنومنتی شرکت نکرده است.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
