'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import { Avatar, Icon } from '@/components/Icons';
import { Empty, ErrorState, Loading } from '@/components/ui/State';

const BracketView = dynamic(
  () => import('@/components/BracketView').then((m) => m.BracketView),
  { ssr: false, loading: () => <Loading /> }
);
import { SpecialEventBracket } from '@/components/SpecialEventBracket';
import { convertBracketRoundsToEventData, getSpecialEvent } from '@/lib/specialEvents';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { API_URL, errorMessage } from '@/lib/api/client';
import { teamsApi, tournamentsApi, walletApi } from '@/lib/api/endpoints';
import type { PaymentMethod, Tournament, UserMini } from '@/lib/api/types';
import { faNumber, initials, jalaliDateTime, prize, TOURNAMENT_STATUS_LABELS, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';
import { redirectToGateway } from '@/lib/gateway';

import '../../tournament/tournament.css';
import styles from './details.module.css';

type Tab = 'overview' | 'rules' | 'participants' | 'bracket';

const PLACE_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

interface Candidate {
  user: UserMini;
  /** The entry this player already plays for in the tournament, if any. */
  registeredWith?: string | null;
}

/** Checklist for picking exactly ``size`` players out of a team. */
function LineupPicker({
  candidates,
  size,
  value,
  onChange,
}: {
  candidates: Candidate[];
  size: number;
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id));
    else if (value.length < size) onChange([...value, id]);
  };

  return (
    <div className={styles.teamSelection}>
      <div className={styles.teamSelectionLabel}>
        بازیکنان این تورنومنت ({faNumber(value.length)} از {faNumber(size)}):
      </div>
      {candidates.map(({ user, registeredWith }) => {
        const selected = value.includes(user.id);
        const blocked = !selected && (!!registeredWith || value.length >= size);
        return (
          <div
            key={user.id}
            className={`${styles.teamOption} ${selected ? styles.selected : ''}`}
            style={blocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => !registeredWith && toggle(user.id)}
          >
            <div className={styles.teamOptionName}>
              {user.displayName}
              {registeredWith && (
                <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 400 }}>
                  با {registeredWith} ثبت‌نام شده
                </small>
              )}
            </div>
            <div className={`${styles.radioCircle} ${styles.checkBox}`}></div>
          </div>
        );
      })}
    </div>
  );
}

/** Captain-only: swap players of a registered team while registration is open. */
function LineupEditor({
  tournament,
  teamId,
  current,
  onDone,
}: {
  tournament: Tournament;
  teamId: number;
  current: number[];
  onDone: (saved: boolean) => void;
}) {
  const { addToast } = useAppContext();
  const team = useApi(() => teamsApi.get(teamId), [teamId]);
  const [lineup, setLineup] = useState(current);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await tournamentsApi.updateLineup(tournament.slug, lineup);
      addToast({ title: 'ترکیب تیم به‌روزرسانی شد', icon: 'team', tone: 'success' });
      onDone(true);
    } catch (error) {
      addToast({ title: 'ویرایش ترکیب انجام نشد', text: errorMessage(error), icon: 'team', tone: 'error' });
      setBusy(false);
    }
  };

  if (team.loading) return <Loading compact />;
  return (
    <>
      <LineupPicker candidates={team.data?.members ?? []} size={tournament.teamSize} value={lineup} onChange={setLineup} />
      <button className={styles.btnRegister} onClick={save} disabled={busy || lineup.length !== tournament.teamSize}>
        <Icon name="check" /> ذخیره ترکیب
      </button>
      <button className={styles.btnRegister} onClick={() => onDone(false)} disabled={busy}>
        انصراف
      </button>
    </>
  );
}

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

  const teamSize = tournament.teamSize;
  const bigEnough = (teams.data ?? []).filter(team => team.memberCount >= teamSize);
  const [chosenTeamId, setChosenTeamId] = useState<number | null>(null);
  const teamId = chosenTeamId ?? bigEnough[0]?.id ?? null;
  const team = teams.data?.find(t => t.id === teamId) ?? null;
  const [lineup, setLineup] = useState<number[]>([]);
  const [editingLineup, setEditingLineup] = useState(false);
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
    if (isTeam && (!teamId || lineup.length !== teamSize)) {
      addToast({ title: `${faNumber(teamSize)} بازیکن برای ترکیب تیم انتخاب کنید`, icon: 'team', tone: 'warning' });
      return;
    }
    setBusy(true);
    try {
      const result = await tournamentsApi.register(tournament.slug, {
        team: isTeam ? teamId : null,
        members: isTeam ? lineup : undefined,
        paymentMethod: tournament.isFree ? null : paymentMethod,
      });
      if (result.paymentUrl) {
        if (result.paymentUrl.includes('Authority=FAKE-') || result.paymentUrl.includes('status=paid')) {
          try {
            const parsed = new URL(result.paymentUrl);
            const authority = parsed.searchParams.get('Authority');
            if (authority) {
              await fetch(`${API_URL}/payments/callback/?Authority=${encodeURIComponent(authority)}&Status=OK`, {
                method: 'GET',
              }).catch(() => {});
            }
          } catch {
            // ignore
          }
          addToast({ title: 'ثبت‌نام انجام شد', text: tournament.title, icon: 'tournament', tone: 'success' });
          onChanged();
          return;
        }
        await redirectToGateway(result.paymentUrl, addToast);
        return;
      }
      addToast({ title: 'ثبت‌نام انجام شد', text: tournament.title, icon: 'tournament', tone: 'success' });
      onChanged();
    } catch (error) {
      addToast({ title: 'ثبت‌نام انجام نشد', text: errorMessage(error), icon: 'tournament', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm('از انصراف در این تورنمنت مطمئن هستید؟ هزینه ورودی به کیف پول بازگردانده می‌شود.')) return;
    setBusy(true);
    try {
      await tournamentsApi.withdraw(tournament.slug);
      addToast({ title: 'انصراف ثبت شد', icon: 'tournament', tone: 'info' });
      onChanged();
    } catch (error) {
      addToast({ title: 'انصراف انجام نشد', text: errorMessage(error), icon: 'tournament', tone: 'error' });
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
            {registration.team && !editingLineup && (
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                ترکیب: {registration.members.map(member => member.displayName).join('، ')}
              </p>
            )}
          </div>
          {editingLineup && registration.team ? (
            <LineupEditor
              tournament={tournament}
              teamId={registration.team.id}
              current={registration.members.map(member => member.id)}
              onDone={saved => {
                setEditingLineup(false);
                if (saved) onChanged();
              }}
            />
          ) : (
            registration.canManage &&
            registration.team &&
            tournament.status === 'registration_open' && (
              <button className={styles.btnRegister} onClick={() => setEditingLineup(true)} disabled={busy}>
                <Icon name="users" /> ویرایش ترکیب
              </button>
            )
          )}
          {registration.canManage && !editingLineup && tournament.status !== 'live' && tournament.status !== 'completed' && (
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
              {teams.loading && <Loading compact />}
              {teams.data?.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                  تیمی که کاپیتان آن باشید ندارید. <Link href="/teams/create">ساخت تیم</Link>
                </p>
              )}
              {teams.data?.map(option => {
                const tooSmall = option.memberCount < teamSize;
                return (
                  <div
                    key={option.id}
                    className={`${styles.teamOption} ${teamId === option.id ? styles.selected : ''}`}
                    style={tooSmall ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                    onClick={() => {
                      if (tooSmall || option.id === teamId) return;
                      setChosenTeamId(option.id);
                      setLineup([]);
                    }}
                  >
                    <div className={styles.teamOptionCrest}>{initials(option.name)}</div>
                    <div className={styles.teamOptionName}>
                      {option.name} · {faNumber(option.memberCount)} عضو
                      {tooSmall && (
                        <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 400 }}>
                          حداقل {faNumber(teamSize)} عضو لازم است
                        </small>
                      )}
                    </div>
                    <div className={styles.radioCircle}></div>
                  </div>
                );
              })}
            </div>
          )}

          {isTeam && team && (
            <LineupPicker candidates={team.members} size={teamSize} value={lineup} onChange={setLineup} />
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
            disabled={busy || (isTeam && isAuthenticated && lineup.length !== teamSize)}
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

const FIFA_DETAIL_MOCK: Tournament = {
  id: 9999,
  slug: 'fifa',
  title: 'مسابقات فیفا',
  game: {
    id: 10,
    slug: 'fifa',
    title: 'فیفا ۲۴',
    titleEn: 'FIFA 24',
    genre: 'ورزشی',
    kind: 'game',
  },
  coverImage: null,
  status: 'live',
  participantType: 'team',
  teamSize: 1,
  format: 'single_elimination',
  formatLabel: 'تیمی حذفی — ۱۶ تیم',
  bestOf: 1,
  region: 'me',
  maxParticipants: 16,
  participantsCount: 16,
  entryFee: 0,
  entryFeeOriginal: null,
  entryDiscountPercent: 0,
  isFree: true,
  isFull: true,
  prizePool: 150000000,
  prizeCurrency: 'IRT',
  registrationOpensAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  registrationClosesAt: new Date(Date.now() - 86400000).toISOString(),
  startsAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  endsAt: new Date(Date.now() + 4 * 86400000).toISOString(),
  isFeatured: true,
  viewerCount: 12408,
  isRegistered: false,
  featuredMatch: null,
  description: 'تورنمنت حذفی جام ویژه فیفا ۲۴ با حضور ۱۶ تیم برتر و جدول مسابقات زنده تایتان.',
  rules: [
    'مسابقات به صورت تک‌حذفی (Knockout) برگزار می‌شود',
    'زمان هر بازی: دو نیمه ۶ دقیقه‌ای',
    'استفاده از تمام تیم‌های رسمی مجاز است',
    'در صورت تساوی، بازی در وقت اضافه و ضربات پنالتی تعیین می‌شود',
  ],
  prizes: [
    { place: 1, label: 'قهرمان جام فیفا', amount: 80000000, points: 1000 },
    { place: 2, label: 'نایب‌قهرمان', amount: 45000000, points: 600 },
    { place: 3, label: 'مقام سوم', amount: 25000000, points: 300 },
  ],
  season: {
    number: 1,
    name: 'فصل اول تایتان',
    startsAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    endsAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    isCurrent: true,
  },
  streamUrl: '',
  myRegistration: null,
};

const FIFA_PARTICIPANTS_MOCK = [
  { id: 1, kind: 'team' as const, name: 'Shadow Wolves', logo: null, avatarSeed: 1, teamId: null, username: null, points: 9240, rank: 'قهرمان', seed: 1, finalPlacement: 1 },
  { id: 2, kind: 'team' as const, name: 'Red Titans', logo: null, avatarSeed: 2, teamId: null, username: null, points: 8980, rank: 'نایب‌قهرمان', seed: 2, finalPlacement: 2 },
  { id: 3, kind: 'team' as const, name: 'Arctic Wolves', logo: null, avatarSeed: 3, teamId: null, username: null, points: 8520, rank: 'نیمه‌نهایی', seed: 3, finalPlacement: 3 },
  { id: 4, kind: 'team' as const, name: 'Crimson Fangs', logo: null, avatarSeed: 4, teamId: null, username: null, points: 8100, rank: 'یک‌چهارم', seed: 4, finalPlacement: 4 },
  { id: 5, kind: 'team' as const, name: 'Night Phantoms', logo: null, avatarSeed: 5, teamId: null, username: null, points: 7850, rank: 'یک‌چهارم', seed: 5, finalPlacement: 5 },
  { id: 6, kind: 'team' as const, name: 'Neon Vipers', logo: null, avatarSeed: 6, teamId: null, username: null, points: 7420, rank: 'یک‌چهارم', seed: 6, finalPlacement: 6 },
  { id: 7, kind: 'team' as const, name: 'Ghost Unit', logo: null, avatarSeed: 7, teamId: null, username: null, points: 7200, rank: 'یک‌چهارم', seed: 7, finalPlacement: 7 },
  { id: 8, kind: 'team' as const, name: 'Iron Falcons', logo: null, avatarSeed: 8, teamId: null, username: null, points: 6900, rank: 'یک‌هشتم', seed: 8, finalPlacement: null },
  { id: 9, kind: 'team' as const, name: 'Dark Orbit', logo: null, avatarSeed: 9, teamId: null, username: null, points: 6700, rank: 'یک‌هشتم', seed: 9, finalPlacement: null },
  { id: 10, kind: 'team' as const, name: 'Pixel Kings', logo: null, avatarSeed: 10, teamId: null, username: null, points: 6500, rank: 'یک‌هشتم', seed: 10, finalPlacement: null },
  { id: 11, kind: 'team' as const, name: 'Thunder Lynx', logo: null, avatarSeed: 11, teamId: null, username: null, points: 6300, rank: 'یک‌هشتم', seed: 11, finalPlacement: null },
  { id: 12, kind: 'team' as const, name: 'Solar Hawks', logo: null, avatarSeed: 12, teamId: null, username: null, points: 6100, rank: 'یک‌هشتم', seed: 12, finalPlacement: null },
  { id: 13, kind: 'team' as const, name: 'Storm Riders', logo: null, avatarSeed: 13, teamId: null, username: null, points: 5900, rank: 'یک‌هشتم', seed: 13, finalPlacement: null },
  { id: 14, kind: 'team' as const, name: 'Omega Five', logo: null, avatarSeed: 14, teamId: null, username: null, points: 5700, rank: 'یک‌هشتم', seed: 14, finalPlacement: null },
  { id: 15, kind: 'team' as const, name: 'Void Walkers', logo: null, avatarSeed: 15, teamId: null, username: null, points: 5500, rank: 'یک‌هشتم', seed: 15, finalPlacement: null },
  { id: 16, kind: 'team' as const, name: 'Cyber Lions', logo: null, avatarSeed: 16, teamId: null, username: null, points: 5300, rank: 'یک‌هشتم', seed: 16, finalPlacement: null },
];

function Participants({ slug }: { slug: string }) {
  const isFifa = /fifa/i.test(slug);
  const participants = useApi(() => tournamentsApi.participants(slug), [slug]);
  if (participants.loading && !isFifa) return <Loading compact />;
  const data = (participants.data?.length ? participants.data : isFifa ? FIFA_PARTICIPANTS_MOCK : []);
  if (!data.length) return <Empty icon="users">هنوز شرکت‌کننده‌ای ثبت‌نام نکرده است.</Empty>;

  return (
    <div className={styles.participantsList}>
      {data.map((p, i) => {
        const row = (
          <div className={`${styles.participantListRow} spot spot-track`} style={{ '--d': i } as React.CSSProperties}>
            <div className={styles.participantIndex}>{String(i + 1).padStart(2, '0')}</div>
            <div className={`${styles.participantAvatar} ${p.kind === 'team' ? styles.participantCrest : ''}`}>
              {p.logo ? (
                <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : p.kind === 'team' ? (
                initials(p.name)
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

function Bracket({ tournament }: { tournament: Tournament }) {
  // 1. Direct custom special bracket from Django Admin (specialBracket) or local registry
  const specialEvent = getSpecialEvent(tournament.slug, tournament.game?.slug, tournament);
  if (specialEvent) {
    return <SpecialEventBracket event={specialEvent} />;
  }

  // 2. Fetch database matches (from Django Admin "Generate bracket & start")
  const bracket = useApi(() => tournamentsApi.bracket(tournament.slug), [tournament.slug]);
  if (bracket.loading) return <Loading compact />;

  // 3. If database matches exist, automatically convert them into SpecialEventBracket!
  if (bracket.data && bracket.data.length > 0) {
    const convertedEvent = convertBracketRoundsToEventData(bracket.data, tournament);
    return <SpecialEventBracket event={convertedEvent} />;
  }

  return (
    <div className={styles.emptyTab}>
      <Icon name="chart" />
      <p>براکت و جدول مسابقات پس از بسته شدن ثبت‌نام و قرعه‌کشی منتشر می‌شود.</p>
    </div>
  );
}

export default function TournamentDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const isFifa = /fifa/i.test(slug);
  const specialEvent = getSpecialEvent(slug);
  const tournament = useApi(() => tournamentsApi.get(slug), [slug]);
  const [tab, setTab] = useState<Tab>('overview');

  useSpotlight('.spot-track', [tab, tournament.data]);

  const fallbackTournament = specialEvent
    ? {
        ...FIFA_DETAIL_MOCK,
        slug,
        title: specialEvent.title.replace('جدول حذفی — ', ''),
        description: specialEvent.sub,
      }
    : (isFifa ? FIFA_DETAIL_MOCK : null);

  const t = tournament.data ?? fallbackTournament;
  if (tournament.loading && !t) return <Loading />;
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
          {t.coverImage && (
            <Image
              src={t.coverImage}
              alt={`تصویر کاور مسابقه ${t.title} - ${t.game.title}`}
              className={styles.heroImage}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          )}
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
                onClick={() => {
                  setTab(key);
                  if (key === 'bracket') {
                    const el = document.getElementById('tournament-bracket-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
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
            {tab === 'bracket' && (
              <div className={styles.overviewPane}>
                <h3>جدول مسابقات</h3>
                <p>جدول کامل حذفی مسابقات در بخش پایین به صورت تمام‌عرض همیشه فعال و قابل مشاهده است.</p>
                <button
                  type="button"
                  className={styles.tabBtn}
                  style={{ background: 'var(--red)', color: '#fff', marginTop: '8px' }}
                  onClick={() => {
                    const el = document.getElementById('tournament-bracket-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  مشاهده جدول کامل حذفی ↓
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <RegistrationWidget tournament={t} onChanged={tournament.reload} />
        </aside>
      </div>

      {/* Full-width Tournament Bracket Section: Always at the bottom below registration & tournament info */}
      <section id="tournament-bracket-section" className={`${styles.fullWidthBracketSection} reveal`} style={{ '--d': 4 } as React.CSSProperties}>
        <Bracket tournament={t} />
      </section>
    </main>
  );
}
