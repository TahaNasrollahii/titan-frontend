'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { meApi } from '@/lib/api/endpoints';
import type { MyTeam, Presence } from '@/lib/api/types';
import { useApi } from '@/lib/hooks/useApi';
import { getTierByScore } from '@/utils/ranks';

import { Icon, Avatar } from './Icons';
import { ProfileAvatar } from './ProfileAvatar';

const RAIL_REFRESH_MS = 60_000;

/** Rail CSS knows three states: in game, online and away (offline is shown as away). */
const statusClass = (presence: Presence) => (presence === 'offline' ? 'away' : presence === 'in_game' ? 'game' : presence);

function tooltip(team: MyTeam) {
  const label =
    team.activity === 'in_game'
      ? `در بازی — ${team.game.titleEn}`
      : team.activity === 'online'
        ? 'آنلاین'
        : 'آفلاین';
  return `${team.name} · ${label}`;
}

export function Rail() {
  const { user, isAuthenticated, logout } = useAuth();
  const teams = useApi(isAuthenticated ? meApi.teams : null, [isAuthenticated]);
  const { reload } = teams;

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setInterval(() => void reload(), RAIL_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, reload]);

  return (
    <aside className="rail" aria-label="تیم‌ها">
      <div className="panel p1 reveal" style={{ '--d': 1 } as React.CSSProperties}>
        <div className="sticky-nav-inner">
          
          {!isAuthenticated ? (
            <Link href="/login" className="rail-icon-btn cta" data-tip="ورود یا ثبت‌نام" style={{ marginBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/icons/login.png" alt="ورود" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </Link>
          ) : (
            <div className="acct" style={{ marginBottom: '8px' }}>
              <Link href="/dashboard" className="acct-frame">
                <span className="acct-glow"></span>
                <ProfileAvatar seed={user?.avatarSeed} score={user?.points} image={user?.avatar} />
                <span className="acct-online"></span>
              </Link>

              <div className="acct-menu">
                <div className="acct-menu-head">
                  <span className="av" style={{ position: 'relative', display: 'flex', width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Avatar seed={user?.avatarSeed || 5} />
                    )}
                  </span>
                  <div>
                    <b>{user?.username || user?.displayName || 'کاربر'}</b>
                    <span>رنک: {getTierByScore(user?.points || 0).name}</span>
                  </div>
                </div>
                <Link href="/dashboard?tab=overview" className="menu-item">
                  <img className="menu-ic" src="/icons/dashboard.png" alt="" /> پیشخوان
                </Link>
                <Link href="/dashboard?tab=profile" className="menu-item">
                  <img className="menu-ic" src="/icons/account.png" alt="" /> اطلاعات حساب کاربری
                </Link>
                <Link href="/dashboard?tab=notifications" className="menu-item">
                  <img className="menu-ic" src="/icons/notif.png" alt="" /> پیام‌ها و اعلان‌ها
                </Link>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>

                <button className="menu-item danger" onClick={() => logout()}>
                  <img className="menu-ic" src="/icons/login.png" alt="" /> خروج از حساب
                </button>
              </div>
            </div>
          )}

          <i className="rail-ic">
            <img src="/icons/team.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </i>
          <div className="list">
            {(teams.data ?? []).map(team => {
              const state = statusClass(team.activity);
              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className={`av ${state === 'game' ? 'game' : ''}`}
                  data-tip={tooltip(team)}
                >
                  <div className="face" style={{ display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                    {team.logo ? (
                      <img src={team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      team.tag
                    )}
                  </div>
                  <span className={`st ${state}`}></span>
                  {state === 'game' && <span className="ingame">در بازی</span>}
                </Link>
              );
            })}
          </div>
          <Link href={isAuthenticated ? '/teams/create' : '/login?next=/teams/create'} className="add-btn" aria-label="ساخت تیم" data-label="ساخت تیم">
            <span className="plus">
              <Icon name="plus" />
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
