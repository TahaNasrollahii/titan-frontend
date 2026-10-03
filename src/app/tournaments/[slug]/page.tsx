'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { BracketView } from '@/components/BracketView';
import { Avatar, Icon } from '@/components/Icons';
import { Empty, ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { tournamentsApi, walletApi } from '@/lib/api/endpoints';
import type { PaymentMethod, Tournament } from '@/lib/api/types';
import { faNumber, jalaliDateTime, prize, TOURNAMENT_STATUS_LABELS, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import '../../tournament/tournament.css';
import styles from './details.module.css';

type Tab = 'overview' | 'rules' | 'participants' | 'bracket';

const PLACE_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

function RegistrationWidget({ tournament, onChanged }: { tournament: Tournament; onChanged: () => void }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToast } = useAppContext();
  const isTeam = tournament.participantType === 'team';
  const canRegister = tournament.status === 'registration_open' && !tournament.isFull && !tournament.myRegistration;

  const teams = useApi(isAuthenticated && isTeam && canRegister ? () => tournamentsApi.eligibleTeams(tournament.slug) : null, [
    isAuthenticated,
    tournament.slug,
    canRegister,
  ]);
  const wallet = useApi(isAuthenticated && !tournament.isFree && canRegister ? walletApi.get : null, [
    isAuthenticated,
    canRegister,
  ]);

  const [chosenTeamId, setTeamId] = useState<number | null>(null);
  const teamId = chosenTeamId ?? teams.data?.[0]?.id ?? null;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gateway');
  const [busy, setBusy] = useState(false);

  const unit = isTeam ? 'تیم' : 'نفر';
  const fillPercent = Math.min(100, (tournament.participantsCount / tournament.maxParticipants) * 100);
  const walletCovers = (wallet.data?.balance ?? 0) >= tournament.entryFee;

  const register = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/tournaments/${tournament.slug}`);
      return;
    }
    if (isTeam && !teamId) {
      addToast({ title: 'یک تیم انتخاب کنید', icon: 'users' });
      return;
    }
    setBusy(true);
    try {
      const result = await tournamentsApi.register(tournament.slug, {
        team: isTeam ? teamId : null,
        paymentMethod: tournament.isFree ? null : paymentMethod,
      });
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }
      addToast({ title: 'ثبت‌نام انجام شد', text: tournament.title, icon: 'trophy' });
      onChanged();
    } catch (error) {
      addToast({ title: 'ثبت‌نام انجام نشد', text: errorMessage(error), icon: 'info' });
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm('از انصراف در این تورنمنت مطمئن هستید؟ هزینه ورودی به کیف پول بازگردانده می‌شود.')) return;
    setBusy(true);
    try {
      await tournamentsApi.withdraw(tournament.slug);
      addToast({ title: 'انصراف ثبت شد', icon: 'check' });
      onChanged();
    } catch (error) {
      addToast({ title: 'انصراف انجام نشد', text: errorMessage(error), icon: 'info' });
    } finally {
      setBusy(false);
    }
  };

  const registration = tournament.myRegistration;
  let blockedReason: string | null = null;
  if (!registration && !canRegister) {
    blockedReason = tournament.isFull ? 'ظرفیت تکمیل است' : TOURNAMENT_STATUS_LABELS[tournament.status];
  }

  return (
    <div className={`${styles.registrationWidget} spot spot-track reveal`} style={{ '--d': 2 } as React.CSSProperties}>
      <h3>ثبت‌نام در تورنومنت</h3>
      <div className={styles.priceTag}>
        <div className={styles.priceHeader}>
          <span className={styles.priceLabel}>هزینه ورودی</span>
          {tournament.entryDiscountPercent > 0 && (
            <span className={styles.discountBadge}>٪{faNumber(tournament.entryDiscountPercent)} تخفیف</span>
          )}
        </div>
        <div className={styles.priceValues}>
          {tournament.entryFeeOriginal && <span className={styles.priceOld}>{toman(tournament.entryFeeOriginal)}</span>}
          <span className={styles.priceNew}>
            {tournament.isFree ? 'رایگان' : faNumber(tournament.entryFee)}
            {!tournament.isFree && <span className={styles.currency}>تومان</span>}
            <span className={styles.perUnit}>/ هر {unit}</span>
          </span>
        </div>
      </div>

      <div className={styles.capacityBar}>
        <div className={styles.capLabels}>
          <span>ظرفیت</span>
          <span>
            {faNumber(tournament.participantsCount)} / {faNumber(tournament.maxParticipants)} {unit}
          </span>
        </div>
        <div className={styles.capTrack}>
          <div className={styles.capFill} style={{ width: `${fillPercent}%` }}></div>
        </div>
      </div>

      {registration ? (
        <>
          <div className={styles.teamSelection}>
            <div className={styles.teamSelectionLabel}>
              {registration.status === 'confirmed' ? 'ثبت‌نام شما تایید شده است' : 'در انتظار پرداخت'}
              {registration.team && ` — تیم ${registration.team.name}`}
            </div>
          </div>
          {tournament.status !== 'live' && tournament.status !== 'completed' && (
            <button className={styles.btnRegister} onClick={withdraw} disabled={busy}>
              <Icon name="x" /> انصراف از تورنمنت
            </button>
          )}
          {tournament.status === 'live' && (
            <Link href={`/tournaments/${tournament.slug}/bracket`} className={styles.btnRegister}>
              <Icon name="play" /> ورود به براکت
            </Link>
          )}
        </>
      ) : blockedReason ? (
        <button className={styles.btnRegister} disabled>
          {blockedReason}
        </button>
      ) : (
        <>
          {isTeam && isAuthenticated && (
            <div className={styles.teamSelection}>
              <div className={styles.teamSelectionLabel}>انتخاب تیم برای شرکت در مسابقه:</div>
              {teams.loading && <Loading />}
              {teams.data?.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                  تیمی با بازی {tournament.game.title} که کاپیتان آن باشید ندارید.{' '}
                  <Link href="/teams/create">ساخت تیم</Link>
                </p>
              )}
              {teams.data?.map(team => (
                <div
                  key={team.id}
                  className={`${styles.teamOption} ${teamId === team.id ? styles.selected : ''}`}
                  onClick={() => setTeamId(team.id)}
                >
                  <div className={styles.teamOptionCrest}>{team.tag}</div>
                  <div className={styles.teamOptionName}>
                    {team.name} · {faNumber(team.memberCount)} عضو
                  </div>
                  <div className={styles.radioCircle}></div>
                </div>
              ))}
            </div>
          )}

          {!tournament.isFree && isAuthenticated && (
            <div className={styles.teamSelection}>
              <div className={styles.teamSelectionLabel}>روش پرداخت:</div>
              <div
                className={`${styles.teamOption} ${paymentMethod === 'gateway' ? styles.selected : ''}`}
                onClick={() => setPaymentMethod('gateway')}
              >
                <div className={styles.teamOptionName}>درگاه زرین‌پال</div>
                <div className={styles.radioCircle}></div>
              </div>
              <div
                className={`${styles.teamOption} ${paymentMethod === 'wallet' ? styles.selected : ''}`}
                style={walletCovers ? undefined : { opacity: 0.5, cursor: 'not-allowed' }}
                onClick={() => walletCovers && setPaymentMethod('wallet')}
              >
                <div className={styles.teamOptionName}>کیف پول ({toman(wallet.data?.balance ?? 0)})</div>
                <div className={styles.radioCircle}></div>
              </div>
            </div>
          )}

          <button
            className={styles.btnRegister}
            onClick={register}
            disabled={busy || (isTeam && isAuthenticated && !teams.data?.length)}
          >
            <Icon name="play" />{' '}
            {!isAuthenticated
              ? 'ورود و ثبت‌نام'
              : tournament.isFree
                ? 'ثبت‌نام رایگان'
                : isTeam
                  ? 'پرداخت و ثبت‌نام تیم'
                  : 'پرداخت و ثبت‌نام'}
          </button>
        </>
      )}

      <div className={styles.widgetMeta}>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>
            <Icon name="chat" />
          </div>
          <span>پشتیبانی اختصاصی</span>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>
            <Icon name="shield" />
          </div>
          <span>سیستم آنتی‌چیت پیشرفته</span>
        </div>
      </div>
    </div>
  );
}

function Participants({ slug }: { slug: string }) {
  const participants = useApi(() => tournamentsApi.participants(slug), [slug]);
  if (participants.loading) return <Loading />;
  if (!participants.data?.length) return <Empty icon="users">هنوز شرکت‌کننده‌ای ثبت‌نام نکرده است.</Empty>;

  return (
    <div className={styles.participantsList}>
      {participants.data.map((p, i) => {
        const row = (
          <div className={`${styles.participantListRow} spot spot-track`} style={{ '--d': i } as React.CSSProperties}>
            <div className={styles.participantIndex}>{String(i + 1).padStart(2, '0')}</div>
            <div className={`${styles.participantAvatar} ${p.kind === 'team' ? styles.participantCrest : ''}`}>
              {p.logo ? (
                <img src={p.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : p.kind === 'team' ? (
                p.tag
              ) : (
                <Avatar seed={p.avatarSeed ?? 1} />
              )}
            </div>
            <div className={styles.participantDetails}>
              <div className={styles.participantName}>{p.name}</div>
              <div className={styles.participantRank}>
                <Icon name="chart" />{' '}
                {p.finalPlacement
                  ? `رتبه نهایی: ${faNumber(p.finalPlacement)}`
                  : p.seed
                    ? `سید ${faNumber(p.seed)}`
                    : p.rank
                      ? `رنک: ${p.rank}`
                      : 'ثبت‌نام شده'}
              </div>
            </div>
            <div className={styles.participantStats}>
              <div className={styles.statGroup}>
                <span className={styles.statLabel}>امتیاز کلی</span>
                <span className={styles.statScore}>{faNumber(p.points)}</span>
              </div>
              <div className={styles.participantAction}>
                <Icon name="chevron-left" />
              </div>
            </div>
          </div>
        );
        return p.teamId ? (
          <Link key={p.id} href={`/teams/${p.teamId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {row}
          </Link>
        ) : (
          <div key={p.id}>{row}</div>
        );
      })}
    </div>
  );
}

function Bracket({ slug }: { slug: string }) {
  const bracket = useApi(() => tournamentsApi.bracket(slug), [slug]);
  if (bracket.loading) return <Loading />;
  if (!bracket.data?.length) {
    return (
      <div className={styles.emptyTab}>
        <Icon name="chart" />
        <p>براکت و جدول مسابقات پس از بسته شدن ثبت‌نام و قرعه‌کشی منتشر می‌شود.</p>
      </div>
    );
  }
  return <BracketView rounds={bracket.data} />;
}

export default function TournamentDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const tournament = useApi(() => tournamentsApi.get(slug), [slug]);
  const [tab, setTab] = useState<Tab>('overview');

  useSpotlight('.spot-track', [tab, tournament.data]);

  if (tournament.loading && !tournament.data) return <Loading />;
  const t = tournament.data;
  if (!t) return <ErrorState error={tournament.error} onRetry={tournament.reload} />;

  const isTeam = t.participantType === 'team';
  const isOpen = t.status === 'registration_open' && !t.isFull;

  return (
    <main className={styles.wrapper}>
      <div className="liquid-bg" aria-hidden="true">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className={styles.topLayout}>
        <div className={`${styles.heroSection} spot spot-track reveal`} style={{ '--d': 1 } as React.CSSProperties}>
          {t.coverImage && <img src={t.coverImage} alt={t.game.titleEn} className={styles.heroImage} />}
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.titleArea}>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${styles.badgePrimary}`}>
                  <Icon name="game" /> {t.game.titleEn}
                </span>
                <span className={styles.badge}>{t.season.name}</span>
                <span className={`${styles.badge} ${isOpen ? styles.badgeOpen : ''}`}>
                  {t.isFull && t.status === 'registration_open' ? 'تکمیل ظرفیت' : TOURNAMENT_STATUS_LABELS[t.status]}
                </span>
              </div>
              <h1 className={styles.title}>{t.title}</h1>
              <p className={styles.subtitle}>{t.description}</p>

              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <Icon name={isTeam ? 'users' : 'user'} /> {t.formatLabel || (isTeam ? 'تیمی' : 'تک نفره')}
                </div>
                <div className={styles.statItem}>
                  <Icon name="clock" /> {jalaliDateTime(t.startsAt)}
                </div>
                <div className={styles.statItem}>
                  <Icon name="trophy" /> {prize(t.prizePool, t.prizeCurrency)} جایزه
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <div className={`${styles.tabs} reveal`} style={{ '--d': 2 } as React.CSSProperties}>
            {(
              [
                ['overview', 'اطلاعات کلی'],
                ['rules', 'قوانین و مقررات'],
                ['participants', 'شرکت‌کنندگان'],
                ['bracket', 'جدول مسابقات'],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.tabBtn} ${tab === key ? styles.activeTab : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={`${styles.tabContent} reveal spot spot-track`} style={{ '--d': 3 } as React.CSSProperties}>
            {tab === 'overview' && (
              <div className={styles.overviewPane}>
                <h3>درباره تورنومنت</h3>
                <p>{t.description}</p>
                <p>
                  شروع ثبت‌نام: {jalaliDateTime(t.registrationOpensAt)} · پایان ثبت‌نام:{' '}
                  {jalaliDateTime(t.registrationClosesAt)}
                  {t.bestOf > 1 && ` · مسابقات Best of ${faNumber(t.bestOf)}`}
                </p>

                {t.prizes.length > 0 && (
                  <div className={styles.prizePool}>
                    <h4>توزیع جوایز</h4>
                    <div className={styles.prizeList}>
                      {t.prizes.map(p => (
                        <div key={p.place} className={styles.prizeRow}>
                          <span className={styles.prizeRank}>
                            <Icon name="trophy" style={{ color: PLACE_COLORS[p.place - 1] ?? 'var(--muted)' }} />{' '}
                            {p.label || `رتبه ${faNumber(p.place)}`}
                          </span>
                          <span className={styles.prizeAmount}>
                            {prize(p.amount, t.prizeCurrency)}
                            {p.points > 0 && ` + ${faNumber(p.points)} امتیاز`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'rules' && (
              <div className={styles.overviewPane}>
                <h3>قوانین و مقررات</h3>
                {t.rules.length ? (
                  <ul style={{ paddingRight: 20, lineHeight: 2.2 }}>
                    {t.rules.map(rule => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p>قوانین این تورنمنت به‌زودی منتشر می‌شود.</p>
                )}
              </div>
            )}

            {tab === 'participants' && <Participants slug={t.slug} />}
            {tab === 'bracket' && <Bracket slug={t.slug} />}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <RegistrationWidget tournament={t} onChanged={tournament.reload} />
        </aside>
      </div>
    </main>
  );
}
