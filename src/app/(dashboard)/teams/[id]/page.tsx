'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { teamsApi } from '@/lib/api/endpoints';
import { faNumber, initials, jalaliDate } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { getTierByScore } from '@/utils/ranks';

import styles from './page.module.css';

const PRESENCE_LABELS: Record<string, string> = {
  online: 'آنلاین',
  in_game: 'در بازی',
  away: 'دور از سیستم',
  offline: 'آفلاین',
};

const PRESENCE_COLORS: Record<string, string> = {
  online: '#3ddc84',
  in_game: '#a855f7',
  away: '#f59e0b',
  offline: '#6b7280',
};

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useAppContext();
  const team = useApi(() => teamsApi.get(id), [id]);
  const history = useApi(() => teamsApi.tournaments(id), [id]);
  const [copied, setCopied] = useState(false);

  if (team.loading) return <Loading />;
  const data = team.data;
  if (!data) return <ErrorState error={team.error} onRetry={team.reload} />;

  const isCaptain = data.myRole === 'captain';
  const captain = data.members.find(m => m.role === 'captain');
  const winRate = Math.round(data.winRate || (data.matchesPlayed > 0 ? (data.wins / data.matchesPlayed) * 100 : 0));
  const remainingSlots = Math.max(0, data.maxMembers - data.memberCount);

  const avgPoints = Math.round(
    data.members.reduce((acc, m) => acc + (m.user.points || 0), 0) / Math.max(1, data.members.length)
  );

  const copyInviteLink = () => {
    const url = data.inviteUrl || (typeof window !== 'undefined' ? `${window.location.origin}/invite/${data.inviteCode}` : '');
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast({
      title: 'لینک دعوت کپی شد',
      text: 'می‌توانید آن را برای دوستان خود ارسال کنید',
      icon: 'team',
      tone: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={styles.teamContainer}>
      {/* Top Bar / Breadcrumb & Actions */}
      <div className={styles.topBar}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard" className={styles.breadLink}>پیشخوان</Link>
          <span className={styles.breadDivider}>/</span>
          <Link href="/dashboard?tab=teams" className={styles.breadLink}>تیم‌ها</Link>
          <span className={styles.breadDivider}>/</span>
          <span className={styles.breadCurrent}>{data.name}</span>
          <span className={styles.teamTag}>#TEAM-{data.id}</span>
        </div>

        <div className={styles.headerActions}>
          {isCaptain && (
            <>
              {data.inviteCode && (
                <button
                  type="button"
                  className={styles.inviteHeaderBtn}
                  onClick={copyInviteLink}
                  title="کپی لینک دعوت به تیم"
                >
                  <Icon name={copied ? 'check' : 'user'} />
                  <span>{copied ? 'کپی شد!' : 'کپی لینک دعوت'}</span>
                </button>
              )}
              <Link href={`/teams/${data.id}/manage`} className={styles.manageHeaderBtn}>
                <Icon name="settings" />
                <span>مدیریت تیم</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className={styles.heroBanner}>
        <div className={styles.bannerBackdrop} aria-hidden="true">
          <div className={styles.gridOverlay}></div>
          <div className={styles.ambientGlowPrimary}></div>
          <div className={styles.ambientGlowSecondary}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.emblemContainer}>
            <div className={styles.emblemAura}></div>
            <div className={styles.teamEmblem}>
              {data.logo ? (
                <img src={data.logo} alt={data.name} className={styles.emblemImage} />
              ) : (
                <div className={styles.emblemPlaceholder}>
                  <span className={styles.emblemLetters}>{initials(data.name)}</span>
                  <div className={styles.emblemShieldGlow}></div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.teamMetaColumn}>
            <div className={styles.teamTitleRow}>
              <h1 className={styles.teamTitle}>{data.name}</h1>
              {data.myRole && (
                <span className={isCaptain ? styles.myRoleCaptainBadge : styles.myRoleMemberBadge}>
                  <Icon name={isCaptain ? 'trophy' : 'users'} />
                  {isCaptain ? 'کاپیتان تیم' : 'عضو تیم'}
                </span>
              )}
            </div>

            <div className={styles.badgesRow}>
              <div className={styles.infoBadge}>
                <Icon name="user" />
                <span>سرپرست: <strong>{captain?.user.displayName || 'نامشخص'}</strong></span>
              </div>

              <div className={styles.infoBadge}>
                <Icon name="users" />
                <span>ظرفیت ترکیب: <strong>{faNumber(data.memberCount)} از {faNumber(data.maxMembers)} نفر</strong></span>
              </div>

              <div className={styles.infoBadge}>
                <Icon name="clock" />
                <span>تأسیس: <strong>{jalaliDate(data.createdAt)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Strip */}
      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${styles.metricMatches}`}>
          <div className={styles.metricIconWrap}>
            <Icon name="game" />
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValue}>{faNumber(data.matchesPlayed)}</div>
            <div className={styles.metricLabel}>مسابقات رسمی</div>
            <div className={styles.metricSub}>مجموع بازی‌های تیمی</div>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.metricWins}`}>
          <div className={styles.metricIconWrap}>
            <Icon name="trophy" />
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValue}>{faNumber(data.wins)}</div>
            <div className={styles.metricLabel}>پیروزی‌ها</div>
            <div className={styles.metricSub}>بردهای ثبت‌شده تیم</div>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.metricLosses}`}>
          <div className={styles.metricIconWrap}>
            <Icon name="x" />
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValue}>{faNumber(data.losses)}</div>
            <div className={styles.metricLabel}>شکست‌ها</div>
            <div className={styles.metricSub}>باخت‌های تیمی</div>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.metricRating}`}>
          <div className={styles.metricIconWrap}>
            <Icon name="flame" />
          </div>
          <div className={styles.metricBody}>
            <div className={styles.ratingValueRow}>
              <span className={styles.metricValue}>{faNumber(winRate)}%</span>
              <span className={styles.metricScoreBadge}>{faNumber(data.points)} PTS</span>
            </div>
            <div className={styles.metricLabel}>نرخ برد و امتیاز</div>
            <div className={styles.winRateBar}>
              <div className={styles.winRateFill} style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Roster & Sidebar */}
      <div className={styles.contentLayout}>
        {/* Right / Main: Team Roster */}
        <div className={styles.rosterSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <Icon name="users" />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>ترکیب بازیکنان تیم</h2>
                <p className={styles.sectionSubtitle}>اعضای رسمی و آماده برای رقابت‌های تیمی</p>
              </div>
            </div>

            <div className={styles.rosterCountPill}>
              {faNumber(data.memberCount)} / {faNumber(data.maxMembers)} بازیکن
            </div>
          </div>

          <div className={styles.rosterGrid}>
            {data.members.map(member => {
              const pts = member.user.points || 0;
              const tier = getTierByScore(pts);
              const presenceColor = PRESENCE_COLORS[member.user.presence] || PRESENCE_COLORS.offline;
              const presenceLabel = PRESENCE_LABELS[member.user.presence] || 'آفلاین';
              const memberIsCaptain = member.role === 'captain';

              return (
                <div key={member.user.id} className={`${styles.memberCard} ${memberIsCaptain ? styles.captainCard : ''}`}>
                  <div className={styles.memberAvatarContainer}>
                    <ProfileAvatar
                      seed={member.user.avatarSeed}
                      score={pts}
                      image={member.user.avatar}
                    />
                    <span
                      className={styles.presenceIndicator}
                      style={{ backgroundColor: presenceColor }}
                      title={presenceLabel}
                    />
                  </div>

                  <div className={styles.memberInfo}>
                    <div className={styles.memberNameRow}>
                      <span className={styles.memberName}>{member.user.displayName}</span>
                      {memberIsCaptain ? (
                        <span className={styles.captainPill}>
                          <Icon name="trophy" /> کاپیتان
                        </span>
                      ) : (
                        <span className={styles.playerPill}>بازیکن</span>
                      )}
                    </div>

                    <div className={styles.memberMetaRow}>
                      <span
                        className={styles.tierTag}
                        style={{ '--tier-from': tier.from } as React.CSSProperties}
                      >
                        {tier.name}
                      </span>
                      <span className={styles.memberPoints}>
                        <Icon name="flame" /> {faNumber(pts)} امتیاز
                      </span>
                      <span className={styles.presenceText} style={{ color: presenceColor }}>
                        {presenceLabel}
                      </span>
                    </div>

                    <div className={styles.joinedDate}>
                      عضویت: {jalaliDate(member.joinedAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Roster Slots */}
            {remainingSlots > 0 && Array.from({ length: Math.min(2, remainingSlots) }).map((_, idx) => (
              <div key={`empty-slot-${idx}`} className={styles.emptySlotCard}>
                <div className={styles.emptySlotIcon}>
                  <Icon name="plus" />
                </div>
                <div className={styles.emptySlotInfo}>
                  <span className={styles.emptySlotTitle}>جایگاه خالی بازیکن</span>
                  <span className={styles.emptySlotDesc}>
                    {isCaptain
                      ? 'بازیکنان جدید را برای تکمیل ترکیب تیم دعوت کنید'
                      : 'این تیم هنوز ظرفیت خالی برای عضویت دارد'}
                  </span>
                </div>
                {isCaptain && data.inviteCode && (
                  <button
                    type="button"
                    className={styles.emptySlotAction}
                    onClick={copyInviteLink}
                  >
                    <Icon name="user" />
                    <span>دعوت بازیکن</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Left / Side: Sidebar Actions & Summary */}
        <div className={styles.sideSection}>
          {/* Captain Quick Invite Panel */}
          {isCaptain && data.inviteCode && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <div className={styles.sideCardIcon}>
                  <Icon name="users" />
                </div>
                <div>
                  <h3 className={styles.sideCardTitle}>عضوگیری و دعوت به تیم</h3>
                  <p className={styles.sideCardSub}>لینک دعوت را با بازیکنان خود به اشتراک بگذارید</p>
                </div>
              </div>

              <div className={styles.inviteBox}>
                <div className={styles.inviteInputRow}>
                  <input
                    type="text"
                    readOnly
                    value={data.inviteUrl || `کد دعوت: ${data.inviteCode}`}
                    className={styles.inviteInput}
                  />
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={copyInviteLink}
                  >
                    <Icon name={copied ? 'check' : 'user'} />
                    <span>{copied ? 'کپی شد' : 'کپی لینک'}</span>
                  </button>
                </div>
                <div className={styles.codeSnippet}>
                  کد مستقیم عضویت: <strong>{data.inviteCode}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Team Status Card */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <div className={styles.sideCardIcon}>
                <Icon name="shield" />
              </div>
              <div>
                <h3 className={styles.sideCardTitle}>وضعیت آمادگی تیم</h3>
                <p className={styles.sideCardSub}>اطلاعات کلی جهت شرکت در مسابقات</p>
              </div>
            </div>

            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>شرایط مسابقه:</span>
                <span className={data.memberCount >= 2 ? styles.statusSuccess : styles.statusWarning}>
                  {data.memberCount >= 2 ? 'ترکیب آماده رقابت ✓' : 'نیازمند جذب بازیکن'}
                </span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>میانگین امتیاز اعضا:</span>
                <span className={styles.statusValue}>{faNumber(avgPoints)} امتیاز</span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>امتیاز رسمی تیم:</span>
                <span className={styles.statusValueHighlight}>{faNumber(data.points)} PTS</span>
              </div>
            </div>

            <div className={styles.sideCardFooter}>
              <Link href="/tournament" className={styles.browseTournamentsBtn}>
                <Icon name="trophy" />
                <span>مشاهده تورنومنت‌های تیمی</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments History Section */}
      <div className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <div className={styles.sectionIcon}>
              <Icon name="trophy" />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>تورنومنت‌ها و رقابت‌های تیم</h2>
              <p className={styles.sectionSubtitle}>افتخارات و سابقه حضور تیم در مسابقات پلتفرم</p>
            </div>
          </div>

          <Link href="/tournament" className={styles.viewAllTourneysLink}>
            <span>تمام تورنومنت‌ها</span>
            <Icon name="chev" />
          </Link>
        </div>

        {history.data?.results.length ? (
          <div className={styles.tourneysGrid}>
            {history.data.results.map(entry => (
              <Link
                key={entry.id}
                href={`/tournaments/${entry.tournament.slug}`}
                className={styles.tourneyCard}
              >
                <div className={styles.tourneyHeader}>
                  <div className={styles.tourneyIcon}>
                    <Icon name="game" />
                  </div>
                  <div className={styles.tourneyInfo}>
                    <h4 className={styles.tourneyTitle}>{entry.tournament.title}</h4>
                    <span className={styles.tourneyGame}>
                      {entry.tournament.game?.title || 'مسابقه تیمی'}
                    </span>
                  </div>
                </div>

                <div className={styles.tourneyFooter}>
                  {entry.finalPlacement ? (
                    <span className={styles.placementBadge}>
                      مقام {faNumber(entry.finalPlacement)}
                    </span>
                  ) : (
                    <span className={styles.activeTourneyBadge}>در حال رقابت</span>
                  )}
                  <span className={styles.tourneyArrow}>
                    <Icon name="chev" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyHistoryBox}>
            <div className={styles.emptyHistoryIcon}>
              <Icon name="trophy" />
            </div>
            <h3 className={styles.emptyHistoryTitle}>هنوز در هیچ تورنومنتی ثبت‌نام نکرده‌اید</h3>
            <p className={styles.emptyHistoryDesc}>
              ترکیب تیم خود را کامل کنید و در تورنومنت‌های تیمی تایتان شرکت کنید تا نام تیم شما در جدول افتخارات ثبت شود.
            </p>
            <Link href="/tournament" className={styles.emptyHistoryCta}>
              <Icon name="trophy" />
              <span>مرور و ثبت‌نام در تورنومنت‌های تیمی</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
