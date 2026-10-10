'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ErrorState, Loading } from '@/components/ui/State';
import { teamsApi } from '@/lib/api/endpoints';
import { faNumber, initials, jalaliDate, ROLE_LABELS } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { getTierByScore } from '@/utils/ranks';

import styles from './page.module.css';

const PRESENCE_LABELS: Record<string, string> = { online: 'آنلاین', in_game: 'در بازی', away: 'دور از سیستم', offline: 'آفلاین' };
const PRESENCE_COLORS: Record<string, string> = { online: '#3ddc84', in_game: '#8e44ad', away: '#f39c12', offline: '#95a5a6' };

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const team = useApi(() => teamsApi.get(id), [id]);
  const history = useApi(() => teamsApi.tournaments(id), [id]);

  if (team.loading) return <Loading />;
  const data = team.data;
  if (!data) return <ErrorState error={team.error} onRetry={team.reload} />;

  return (
    <div className={styles.premiumWrapper}>
      {/* Banner & Header Section */}
      <div className={styles.heroSection}>
        <div className="th-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
        <div className="th-grid" aria-hidden="true"></div>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              {data.logo ? <img src={data.logo} alt="" /> : initials(data.name)}
            </div>
          </div>
          
          <div className={styles.teamInfo}>
            <div className={styles.teamTitleRow}>
              <h1 className={styles.teamName}>{data.name}</h1>
              {data.myRole === 'captain' && (
                <Link href={`/teams/${data.id}/manage`} className={styles.manageBtn}>
                  <Icon name="settings" /> مدیریت تیم
                </Link>
              )}
            </div>
            <div className={styles.teamMeta}>

              <span className={styles.metaBadge}>
                <Icon name="users" /> اعضا: {faNumber(data.memberCount)}/{faNumber(data.maxMembers)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Members Section with Background */}
        <div className={`${styles.mainContent} ${styles.membersPanel}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Icon name="users" /></div>
            <h2>اعضای تیم</h2>
          </div>
          
          <div className={styles.membersGrid}>
            {data.members.map(member => {
              const pts = member.user.points || 0;
              const tier = getTierByScore(pts);
              return (
              <div key={member.user.id} className={styles.memberCard}>
                <div className={styles.memberAvatarWrapper}>
                  <div className={styles.presenceDot} style={{ background: PRESENCE_COLORS[member.user.presence] }}></div>
                  <ProfileAvatar seed={member.user.avatarSeed} score={pts} image={member.user.avatar} />
                </div>
                <div className={styles.memberCardInfo}>
                  <div className={styles.memberNameWrapper}>
                    <div className={styles.memberName}>{member.user.displayName}</div>
                    <span className={styles.tier} style={{ '--tier-from': tier.from } as React.CSSProperties}>{tier.name}</span>
                  </div>
                </div>
                <div className={`${styles.roleTag} ${member.role === 'captain' ? styles.roleCaptain : ''}`}>
                  {ROLE_LABELS[member.role]}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stats & Tournaments */}
        <div className={styles.sideContent}>
          
          {/* Stats Box */}
          <div className={styles.glassPanel}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><Icon name="flame" /></div>
              <h2>آمار عملکرد</h2>
            </div>
            <div className={styles.statBoxes}>
              <div className={`${styles.statBox} ${styles.matches}`}>
                <div className={styles.statValue}>{faNumber(data.matchesPlayed)}</div>
                <div className={styles.statLabel}>مسابقات</div>
              </div>
              <div className={`${styles.statBox} ${styles.losses}`}>
                <div className={styles.statValue} style={{ color: '#ff6a6a', textShadow: '0 0 10px rgba(255,106,106,0.4)' }}>
                  {faNumber(data.matchesPlayed - data.wins)}
                </div>
                <div className={styles.statLabel}>باخت</div>
              </div>
              <div className={`${styles.statBox} ${styles.wins}`}>
                <div className={styles.statValue} style={{ color: '#f0c14b' }}>{faNumber(data.wins)}</div>
                <div className={styles.statLabel}>برد</div>
              </div>
              <div className={`${styles.statBox} ${styles.points}`}>
                <div className={styles.statValue} style={{ color: '#a5c6ff' }}>{faNumber(data.points)}</div>
                <div className={styles.statLabel}>امتیاز</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width: Tournaments Box */}
      <div className={styles.glassPanel}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><Icon name="trophy" /></div>
          <h2>آخرین مسابقات</h2>
        </div>
        
        {history.data?.results.length ? (
          <div className={styles.tourneyGrid}>
            {history.data.results.slice(0, 5).map(entry => (
              <Link key={entry.id} href={`/tournaments/${entry.tournament.slug}`} className={styles.tourneyItem}>
                <div className={styles.tourneyBullet}></div>
                <div className={styles.tourneyDetails}>
                  <span className={styles.tourneyName}>{entry.tournament.title}</span>
                  {entry.finalPlacement && (
                    <span className={styles.tourneyRank}>رتبه {faNumber(entry.finalPlacement)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Icon name="game" />
            <p>این تیم هنوز در هیچ تورنومنتی شرکت نکرده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
