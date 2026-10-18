'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ScoreWidget } from '@/components/ScoreWidget';
import { TournamentCard } from '@/components/TournamentCard';
import { Empty, Loading } from '@/components/ui/State';
import { useAuth } from '@/context/AuthContext';
import { catalogApi, contentApi, meApi, tournamentsApi } from '@/lib/api/endpoints';
import type { TournamentSummary } from '@/lib/api/types';
import { faNumber, initials, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';
import { getOrnamentSVGWrapper, getRingSVG, rankFromApi } from '@/utils/ranks';

import './tournament.css';

export const FIFA_SUMMARY_MOCK: TournamentSummary = {
  id: 9999,
  slug: 'fifa',
  title: 'مسابقات فیفا',
  game: { slug: 'fifa', title: 'فیفا ۲۴', titleEn: 'FIFA 24', iconImage: null, accentColor: '#10b981' },
  coverImage: null,
  status: 'live',
  participantType: 'team',
  teamSize: 1,
  formatLabel: 'تیمی حذفی — ۱۶ تیم',
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
  registrationClosesAt: new Date(Date.now() - 86400000).toISOString(),
  startsAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
  isFeatured: true,
  viewerCount: 12408,
  isRegistered: false,
  featuredMatch: {
    id: 1,
    round: 3,
    position: 0,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    bestOf: 1,
    scoreA: null,
    scoreB: null,
    winnerId: null,
    isMine: false,
    lobbyCode: null,
    participantA: {
      id: 1,
      kind: 'team',
      name: 'Shadow Wolves',
      logo: null,
      avatarSeed: 1,
      teamId: null,
      username: null,
      points: 9240,
      rank: 'قهرمان',
      seed: 1,
      finalPlacement: 1,
    },
    participantB: {
      id: 2,
      kind: 'team',
      name: 'Red Titans',
      logo: null,
      avatarSeed: 2,
      teamId: null,
      username: null,
      points: 8980,
      rank: 'نایب‌قهرمان',
      seed: 2,
      finalPlacement: 2,
    },
  },
};

const STEPS = [
  { num: '۱', icon: 'users', t: 'تیم خود را بسازید', d: 'یک تیم جدید با دوستان خود بسازید یا با لینک دعوت به تیمی که قبلاً ساخته شده ملحق شوید.' },
  { num: '۲', icon: 'search', t: 'مسابقه را انتخاب کنید', d: 'به لیست مسابقات فعال بروید و تورنومنتی که با زمان و بازی شما همخوانی دارد را انتخاب کنید.' },
  { num: '۳', icon: 'game', t: 'تکمیل ثبت‌نام', d: 'کاپیتان تیم را انتخاب می‌کند و بازیکنان این تورنومنت را از بین اعضا مشخص می‌کند (در مسابقات تک‌نفره خودتان ثبت‌نام کنید). در صورت نیاز هزینه ورودی را از کیف پول یا درگاه پرداخت کنید.' },
  { num: '۴', icon: 'trophy', t: 'شروع رقابت و جوایز', d: 'پس از بسته شدن ثبت‌نام، براکت مسابقات منتشر می‌شود و حریف خود را در همین صفحه می‌بینید.' },
];

const CREST_PALETTES = [
  ['#ff5a35', '#7a1f16'], // Flame Crimson
  ['#a97bd6', '#5a2b6e'], // Royal Violet
  ['#4ad0a0', '#1a6b52'], // Neon Emerald
  ['#6fa8dc', '#1c4a7a'], // Falcon Blue
  ['#f0c866', '#8a5a14'], // Gold Lynx
  ['#ff9a4a', '#9a4a14'], // Solar Hawk
  ['#e06fb0', '#7a2358'], // Pixel Pink
  ['#7fd6ff', '#1c6f99'], // Arctic Cyan
];

function Leaderboards() {
  const games = useApi(() => catalogApi.games({ is_featured: true }));
  const playable = (games.data ?? []).filter(game => game.kind === 'game');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [mode, setMode] = useState<'teams' | 'players'>('teams');
  const game = activeGame ?? playable[0]?.slug ?? null;

  const teams = useApi(game && mode === 'teams' ? () => tournamentsApi.teamLeaderboard(game) : null, [game, mode]);
  const players = useApi(game && mode === 'players' ? () => tournamentsApi.playerLeaderboard(game) : null, [
    game,
    mode,
  ]);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const modePillRef = useRef<HTMLSpanElement>(null);
  const teamsBtnRef = useRef<HTMLButtonElement>(null);
  const playersBtnRef = useRef<HTMLButtonElement>(null);

  const updateGamePill = useCallback(() => {
    const el = game ? tabRefs.current[game] : null;
    const indicator = indicatorRef.current;
    if (!el || !indicator) return;
    indicator.style.left = `${el.offsetLeft}px`;
    indicator.style.width = `${el.offsetWidth}px`;
  }, [game]);

  const updateModePill = useCallback(() => {
    const activeBtn = mode === 'teams' ? teamsBtnRef.current : playersBtnRef.current;
    const pill = modePillRef.current;
    if (!activeBtn || !pill) return;
    pill.style.left = `${activeBtn.offsetLeft}px`;
    pill.style.width = `${activeBtn.offsetWidth}px`;
  }, [mode]);

  useEffect(() => {
    updateGamePill();
    updateModePill();
    window.addEventListener('resize', updateGamePill);
    window.addEventListener('resize', updateModePill);
    return () => {
      window.removeEventListener('resize', updateGamePill);
      window.removeEventListener('resize', updateModePill);
    };
  }, [updateGamePill, updateModePill, games.data]);

  const loading = mode === 'teams' ? teams.loading : players.loading;
  const rows =
    mode === 'teams'
      ? (teams.data?.results ?? []).map((row, idx) => {
          const pal = CREST_PALETTES[idx % CREST_PALETTES.length];
          return {
            key: `t${row.team.id}`,
            rank: row.rank,
            name: row.team.name,
            badge: (
              <div
                className="lb-crest"
                style={{ background: `linear-gradient(140deg, ${pal[0]}, ${pal[1]})` }}
              >
                {initials(row.team.name)}
              </div>
            ),
            wins: row.wins,
            losses: row.losses,
            points: row.points,
          };
        })
      : (players.data?.results ?? []).map(row => ({
          key: `p${row.player.id}`,
          rank: row.rank,
          name: row.player.displayName,
          badge: (
            <div className="lb-avatar">
              <ProfileAvatar seed={row.player.avatarSeed} score={row.player.points} image={row.player.avatar} />
            </div>
          ),
          wins: row.wins,
          losses: row.losses,
          points: row.points,
        }));

  return (
    <>
      <div className="lb-header reveal" style={{ '--d': 9 } as React.CSSProperties}>
        <div className="lb-head-left">
          <div className="lb-accent-bar" />
          <div>
            <div className="lb-title-wrap">
              <h2>جدول رتبه‌بندی فصل</h2>
              <span className="lb-badge-season">★ فصل اول</span>
            </div>
            <p className="lb-head-sub">برترین تیم‌ها و بازیکنان لیگ تایتان · ثبت زنده امتیازات و جدول مسابقات</p>
          </div>
        </div>
        <div className="lb-head-right">
          <div className="lb-games-tabs">
            <span className="lb-game-tab-ind" ref={indicatorRef}></span>
            {playable.map(item => (
              <button
                key={item.slug}
                ref={el => {
                  tabRefs.current[item.slug] = el;
                }}
                className={`lb-game-tab ${game === item.slug ? 'active' : ''}`}
                onClick={() => setActiveGame(item.slug)}
              >
                {item.iconImage && <img src={item.iconImage} alt="" aria-hidden="true" />}
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tour-table-controls reveal" style={{ '--d': 10 } as React.CSSProperties}>
        <div className="lb-tabs-new">
          <span className="lb-mode-pill" ref={modePillRef}></span>
          <button
            ref={teamsBtnRef}
            className={`lb-tab-btn ${mode === 'teams' ? 'active' : ''}`}
            onClick={() => setMode('teams')}
          >
            <Icon name="users" /> برترین تیم‌ها
          </button>
          <button
            ref={playersBtnRef}
            className={`lb-tab-btn ${mode === 'players' ? 'active' : ''}`}
            onClick={() => setMode('players')}
          >
            <Icon name="user" /> برترین بازیکنان
          </button>
        </div>
        <div className="lb-meta-badge">
          <span className="lb-dot-live"></span>
          <span>لیگ رسمی تایتان</span>
        </div>
      </div>

      <div className="tour-table-wrapper spot spot-track reveal" style={{ '--d': 11 } as React.CSSProperties}>
        {loading ? (
          <Loading compact />
        ) : rows.length === 0 ? (
          <Empty icon="trophy">هنوز رکوردی برای این بازی ثبت نشده است.</Empty>
        ) : (
          <table className={`tour-table ${mode === 'players' ? 'table-players' : ''}`}>
            <thead>
              <tr>
                <th className="lb-col-rank">رتبه</th>
                <th className="lb-col-name">{mode === 'teams' ? 'تیم' : 'بازیکن'}</th>
                <th className="lb-col-wins">تعداد برد</th>
                <th className="lb-col-losses">تعداد باخت</th>
                <th className="lb-col-pts">امتیاز کلی</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className={row.rank <= 3 ? `top-rank-${row.rank}` : ''}>
                  <td className="lb-col-rank">
                    <div className="lb-rank-badge">
                      {row.rank <= 3 ? <Icon name="trophy" /> : <span>{faNumber(row.rank)}</span>}
                    </div>
                  </td>
                  <td className="lb-col-name">
                    <div className={mode === 'teams' ? 'lb-team-cell' : 'lb-player-cell'}>
                      {row.badge}
                      <div className="lb-name-meta">
                        <strong className="lb-name-txt" title={row.name}>
                          {row.name}
                        </strong>
                        <div className="lb-mobile-stats">
                          <span className="lb-stat stat-wins">برد: {faNumber(row.wins)}</span>
                          <span className="lb-stat-sep">·</span>
                          <span className="lb-stat stat-losses">باخت: {faNumber(row.losses)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="lb-col-wins">
                    <span className="lb-stat stat-wins">{faNumber(row.wins)}</span>
                  </td>
                  <td className="lb-col-losses">
                    <span className="lb-stat stat-losses">{faNumber(row.losses)}</span>
                  </td>
                  <td className="lb-col-pts">
                    <div className="lb-pts-box">
                      <strong className="lb-pts-stat">{faNumber(row.points)}</strong>
                      <span className="lb-pts-label">امتیاز</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function TournamentPage() {
  const { isAuthenticated } = useAuth();
  const hero = useApi(() => contentApi.promos('tournament_hero'));
  const ranks = useApi(tournamentsApi.ranks);
  const upcoming = useApi(() =>
    tournamentsApi.list({ status: ['registration_open', 'upcoming', 'live'], ordering: 'starts_at', page_size: 3 }),
  );
  const stats = useApi(isAuthenticated ? meApi.stats : null, [isAuthenticated]);

  useSpotlight('.spot-track', [upcoming.data, ranks.data, hero.data]);

  const promo = hero.data?.[0];
  const promoHref = promo?.tournament ? `/tournaments/${promo.tournament}` : promo?.link || '/tournaments';

  return (
    <div className="tour-wrapper liquid-theme">
      <div className="liquid-bg" aria-hidden="true">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className="tour-top">
        <section className="tour-top-main">
          <article className="tour-hero spot spot-track reveal" style={{ '--d': 2 } as React.CSSProperties}>
            <div className="th-bg"></div>
            <div className="th-content">
              {promo?.badge && (
                <div className="th-badges">
                  <span className="th-badge red">
                    <Icon name="flame" /> <span className="pulse-text">{promo.badge}</span>
                  </span>
                </div>
              )}
              <h1>تایتان تورنومنت</h1>
              <p>رقابت کنید و جایزه ببرید.</p>
              <div className="th-foot">
                <Link href={promoHref} className="th-btn-primary" style={{ textDecoration: 'none' }}>
                  <Icon name="game" />
                  {promo?.price ? `ثبت‌نام - ${toman(promo.price)}` : 'مشاهده مسابقات'}
                </Link>
                {promo?.originalPrice && (
                  <span
                    className="th-strike"
                    style={{
                      textDecoration: 'line-through',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {toman(promo.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            <div className="th-art-wrap">
              <Image
                src={promo?.image ?? '/images/banner-hero.webp'}
                alt={promo?.title ?? 'بنر تورنومنت تایتان'}
                className="th-art"
                width={500}
                height={500}
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </article>
        </section>

        <section className="tour-top-side">
          <ScoreWidget stats={stats.data ?? null} />
        </section>
      </div>

      <style>{`
        @media (min-width: 901px) {
          .score-widget-article {
            padding: 12px 16px !important;
            gap: 8px !important;
            justify-content: center !important;
          }
          .score-widget-blob {
            width: min(195px, 80%) !important;
            margin: 0 auto !important;
          }
          .score-widget-core {
            transform: scale(1) !important;
          }
          .score-widget-gh-row {
            transform: scale(0.75) !important;
            transform-origin: top center !important;
            margin-top: 4px !important;
          }
        }
      `}</style>

      <div className="tour-sec-h reveal" style={{ '--d': 3 } as React.CSSProperties}>
        <h2>مسیر پیشرفت و رنک‌ها</h2>
      </div>
      <div className="tour-timeline-wrap reveal" style={{ '--d': 4 } as React.CSSProperties}>
        <div className="tour-ranks-row">
          {(ranks.data ?? []).map(rankFromApi).map((rank, i) => (
            <div key={rank.id} className="tour-rank-card spot spot-track" style={{ '--d': 4 + i } as React.CSSProperties}>
              <div className="rank-frame-wrap" data-tier={rank.id} style={{ '--tier-glow': rank.glow } as React.CSSProperties}>
                <span className="rank-frame-glow" aria-hidden="true"></span>
                <span className="rank-frame-ring">{getRingSVG(rank)}</span>
                <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank)}</span>
                <div className="rank-inner-circle">{faNumber(i + 1)}</div>
              </div>
              <div className="rank-name-wrap">
                <div className="rank-name" style={{ color: rank.from }}>
                  {rank.name}
                </div>
                <div className="rank-points">{rank.pts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tour-sec-h reveal" style={{ '--d': 4 } as React.CSSProperties}>
        <h2>مسابقات پیش‌رو</h2>
        <Link href="/tournaments" className="arrow" aria-label="مشاهده تمام مسابقات">
          <Icon name="arrow" />
        </Link>
      </div>
      {upcoming.loading ? (
        <Loading compact />
      ) : (
        <div className="tour-matches">
          {(() => {
            const list = [...(upcoming.data?.results ?? [])];
            if (!list.some(t => t.slug === 'fifa')) {
              list.unshift(FIFA_SUMMARY_MOCK);
            }
            return list.map((tournament, i) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={i} />
            ));
          })()}
        </div>
      )}

      <div className="tour-sec-h reveal" style={{ '--d': 7 } as React.CSSProperties}>
        <h2>چطور در مسابقات شرکت کنم؟</h2>
      </div>
      <div className="tour-steps-grid reveal" style={{ '--d': 8 } as React.CSSProperties}>
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="tour-step-card spot spot-track"
            data-step={step.num}
            style={{ '--d': 8 + i } as React.CSSProperties}
          >
            <div className="tsc-icon">
              <Icon name={step.icon} />
            </div>
            <div className="tsc-content">
              <span className="tsc-step">مرحله {step.num}</span>
              <h4>{step.t}</h4>
              <p>{step.d}</p>
            </div>
            <div className="tsc-glow"></div>
          </div>
        ))}
      </div>

      <Leaderboards />
    </div>
  );
}
