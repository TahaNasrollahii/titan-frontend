'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ScoreWidget } from '@/components/ScoreWidget';
import { TournamentCard } from '@/components/TournamentCard';
import { Empty, Loading } from '@/components/ui/State';
import { useAuth } from '@/context/AuthContext';
import { catalogApi, contentApi, meApi, tournamentsApi } from '@/lib/api/endpoints';
import { faNumber, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';
import { getOrnamentSVGWrapper, getRingSVG, rankFromApi } from '@/utils/ranks';

import './tournament.css';

const STEPS = [
  { num: '۱', icon: 'users', t: 'تیم خود را بسازید', d: 'یک تیم جدید با دوستان خود بسازید یا با لینک دعوت به تیمی که قبلاً ساخته شده ملحق شوید.' },
  { num: '۲', icon: 'search', t: 'مسابقه را انتخاب کنید', d: 'به لیست مسابقات فعال بروید و تورنومنتی که با زمان و بازی شما همخوانی دارد را انتخاب کنید.' },
  { num: '۳', icon: 'game', t: 'تکمیل ثبت‌نام', d: 'تیم یا حساب خود را انتخاب کرده و در صورت نیاز هزینه ورودی را از کیف پول یا درگاه پرداخت کنید.' },
  { num: '۴', icon: 'trophy', t: 'شروع رقابت و جوایز', d: 'پس از بسته شدن ثبت‌نام، براکت مسابقات منتشر می‌شود و حریف خود را در همین صفحه می‌بینید.' },
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
  useEffect(() => {
    const el = game ? tabRefs.current[game] : null;
    const indicator = indicatorRef.current;
    if (!el || !indicator) return;
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    indicator.style.width = `${el.offsetWidth}px`;
  }, [game, games.data]);

  const loading = mode === 'teams' ? teams.loading : players.loading;
  const rows =
    mode === 'teams'
      ? (teams.data?.results ?? []).map(row => ({
          key: `t${row.team.id}`,
          rank: row.rank,
          name: row.team.name,
          badge: <div className="lb-crest">{row.team.tag}</div>,
          wins: row.wins,
          losses: row.losses,
          points: row.points,
        }))
      : (players.data?.results ?? []).map(row => ({
          key: `p${row.player.id}`,
          rank: row.rank,
          name: row.player.displayName,
          badge: (
            <div className="lb-avatar" style={{ transform: 'scale(0.8)' }}>
              <ProfileAvatar seed={row.player.avatarSeed} score={row.player.points} image={row.player.avatar} />
            </div>
          ),
          wins: row.wins,
          losses: row.losses,
          points: row.points,
        }));

  return (
    <>
      <div className="tour-sec-h reveal" style={{ '--d': 9 } as React.CSSProperties}>
        <h3>جدول رتبه‌بندی فصل</h3>
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
              {item.iconImage && <img src={item.iconImage} alt="" />}
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="tour-table-controls reveal" style={{ '--d': 10 } as React.CSSProperties}>
        <div className="lb-tabs-new">
          <button className={`lb-tab-btn ${mode === 'teams' ? 'active' : ''}`} onClick={() => setMode('teams')}>
            <Icon name="users" /> برترین تیم‌ها
          </button>
          <button className={`lb-tab-btn ${mode === 'players' ? 'active' : ''}`} onClick={() => setMode('players')}>
            <Icon name="user" /> برترین بازیکنان
          </button>
        </div>
      </div>

      <div className="tour-table-wrapper spot spot-track reveal" style={{ '--d': 11 } as React.CSSProperties}>
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty icon="trophy">هنوز رکوردی برای این بازی ثبت نشده است.</Empty>
        ) : (
          <table className={`tour-table ${mode === 'players' ? 'table-players' : ''}`}>
            <thead>
              <tr>
                <th>رتبه</th>
                <th>{mode === 'teams' ? 'تیم' : 'بازیکن'}</th>
                <th>تعداد برد</th>
                <th>تعداد باخت</th>
                <th>امتیاز کلی</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className={row.rank <= 3 ? `top-rank-${row.rank}` : ''}>
                  <td>
                    <div className="lb-rank-badge">
                      {row.rank <= 3 ? <Icon name="trophy" /> : <span>{faNumber(row.rank)}</span>}
                    </div>
                  </td>
                  <td>
                    <div className={mode === 'teams' ? 'lb-team-cell' : 'lb-player-cell'}>
                      {row.badge}
                      <strong>{row.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="lb-stat">{faNumber(row.wins)}</span>
                  </td>
                  <td>
                    <span className="lb-stat" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                      {faNumber(row.losses)}
                    </span>
                  </td>
                  <td>
                    <strong className="lb-pts-stat">{faNumber(row.points)}</strong>
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
              <img src={promo?.image ?? '/images/banner-hero.png'} alt="" className="th-art" />
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
        <h3>مسیر پیشرفت و رنک‌ها</h3>
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
        <h3>مسابقات پیش‌رو</h3>
        <Link href="/tournaments" className="arrow" aria-label="مشاهده تمام مسابقات">
          <Icon name="arrow" />
        </Link>
      </div>
      {upcoming.loading ? (
        <Loading />
      ) : (
        <div className="tour-matches">
          {(upcoming.data?.results ?? []).map((tournament, i) => (
            <TournamentCard key={tournament.id} tournament={tournament} index={i} />
          ))}
        </div>
      )}

      <div className="tour-sec-h reveal" style={{ '--d': 7 } as React.CSSProperties}>
        <h3>چطور در مسابقات شرکت کنم؟</h3>
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
