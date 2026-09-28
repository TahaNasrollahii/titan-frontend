'use client';

import React, { useState, useEffect } from 'react';
import './tournament.css';
import { Icon } from '@/components/Icons';

import { ScoreWidget } from '@/components/ScoreWidget';

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState('teams');

  // Mouse tracking for parallax and spot hover effects on cards
  useEffect(() => {
    const handlePointerMove = (e: Event) => {
      const pe = e as PointerEvent;
      const el = pe.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = pe.clientX - rect.left;
      const y = pe.clientY - rect.top;

      const px = (x / rect.width) * 2 - 1;
      const py = (y / rect.height) * 2 - 1;

      el.style.setProperty('--px', px.toString());
      el.style.setProperty('--py', py.toString());
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
    };

    const handlePointerLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };

    const elements = document.querySelectorAll('.spot-track');
    elements.forEach(el => {
      el.addEventListener('pointermove', handlePointerMove, { passive: true });
      el.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    });

    return () => {
      elements.forEach(el => {
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerleave', handlePointerLeave);
      });
    };
  }, []);

  return (
    <div className="tour-wrapper liquid-theme">
      {/* Liquid Background Blobs */}
      <div className="liquid-bg" aria-hidden="true">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className="cols" style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
        {/* 1. Hero Promo (70%) */}
        <section className="col col-a" style={{ flex: '7', display: 'flex' }}>
          <article className="tour-hero spot spot-track reveal" style={{ '--d': 2, flex: 1, width: '100%' } as any}>
            <div className="th-bg"></div>
            <div className="th-content">
              <div className="th-badges">
                <span className="th-badge red"><Icon name="flame" /> <span className="pulse-text">تورنومنت‌های تایتان</span></span>
                <span className="th-badge dark">فصل ۳ مسابقات</span>
              </div>
              <h1>میدان نبردِ قهرمانان</h1>
              <p>در رقابت‌های نفس‌گیر تایتان شرکت کنید و سهمی از جوایز نقدی این فصل ببرید.</p>
              <div className="th-foot">
                <button className="th-btn-primary">
                  <Icon name="game" />
                  ثبت‌نام - ۵۰,۰۰۰ 
                </button>
                <span style={{ textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', fontWeight: 600 }}>۱۵۰,۰۰۰ تومان</span>
              </div>
            </div>
            <div className="th-art-wrap">
              <img src="/images/banner-hero.png" alt="" className="th-art" />
            </div>
          </article>
        </section>

        {/* Your Score Widget (30%) */}
        <section className="col col-b" style={{ flex: '3', display: 'flex' }}>
          <ScoreWidget />
        </section>
      </div>

      {/* 2. Global Stats */}
      <div className="tour-stats-row reveal" style={{ '--d': 3 } as any}>
        <div className="tour-stat-card spot spot-track">
          <div className="ts-icon" style={{ background: 'rgba(226, 69, 63, 0.15)', color: 'var(--red)' }}><Icon name="trophy" /></div>
          <div className="ts-info">
            <span className="ts-val">۴۸۵</span>
            <span className="ts-lbl">مجموع مسابقات</span>
          </div>
        </div>
        <div className="tour-stat-card spot spot-track">
          <div className="ts-icon" style={{ background: 'rgba(61, 220, 132, 0.15)', color: 'var(--green)' }}><Icon name="game" /></div>
          <div className="ts-info">
            <span className="ts-val">۳ زنده</span>
            <span className="ts-lbl">مسابقات در جریان</span>
          </div>
        </div>
        <div className="tour-stat-card spot spot-track">
          <div className="ts-icon" style={{ background: 'rgba(255, 240, 179, 0.15)', color: 'var(--cream)' }}><Icon name="users" /></div>
          <div className="ts-info">
            <span className="ts-val">۱۲۴۰</span>
            <span className="ts-lbl">تیم ثبت‌نام کرده</span>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Matches */}
      <div className="tour-sec-h reveal" style={{ '--d': 4 } as any}>
        <h3>مسابقات پیش‌رو</h3>
      </div>
      <div className="tour-matches">
        {[
          { id: 1, game: 'Valorant', image: '/images/games/valorant-background.png', prize: '۵۰,۰۰۰,۰۰۰ تومان', team1: 'Shadow Wolves', tag1: 'مدافع عنوان', team2: 'Crimson Fangs', tag2: 'صعود گروهی', time: 'امروز · ۲۱:۰۰', status: 'ثبت‌نام باز' },
          { id: 2, game: 'Apex Legends', image: '/images/games/apexlegends-background.png', prize: '۳۰,۰۰۰,۰۰۰ تومان', team1: 'Night Phantoms', tag1: 'رتبه ۳', team2: 'Iron Falcons', tag2: 'تازه‌وارد', time: 'پنجشنبه · ۱۹:۳۰', status: '۲ روز دیگر' },
          { id: 3, game: 'Fortnite', image: '/images/games/fortnite-background.png', prize: '۲۰,۰۰۰,۰۰۰ تومان', team1: 'Neon Riders', tag1: 'قهرمان فصل قبل', team2: 'Dark Eagles', tag2: 'رتبه ۵', time: 'جمعه · ۱۸:۰۰', status: 'تکمیل ظرفیت' }
        ].map((m, i) => (
          <article key={m.id} className="match-card-premium spot spot-track reveal" style={{ '--d': 5 + i } as any}>
            <div className="mc-hero" style={{ backgroundImage: `url(${m.image})` }}>
              <div className="mc-hero-overlay"></div>
              
              <div className="mc-status-bar">
                <span className="mc-game">{m.game}</span>
                <div className={`mc-status ${m.status === 'ثبت‌نام باز' ? 'open' : ''}`}>
                  <span className="mc-status-dot"></span> {m.status}
                </div>
              </div>

              <div className="mc-teams">
                <div className="mc-team-side">
                  <div className="mc-crest">{m.team1.substring(0, 2).toUpperCase()}</div>
                  <h4>{m.team1}</h4>
                  <span>{m.tag1}</span>
                </div>
                
                <div className="mc-vs-badge">VS</div>
                
                <div className="mc-team-side">
                  <div className="mc-crest crest-alt">{m.team2.substring(0, 2).toUpperCase()}</div>
                  <h4>{m.team2}</h4>
                  <span>{m.tag2}</span>
                </div>
              </div>
            </div>

            <div className="mc-content">
              <div className="mc-info-row">
                <div className="mc-info-item">
                  <div className="mc-info-icon"><Icon name="clock" /></div>
                  <div className="mc-info-text">
                    <span className="mc-lbl">زمان شروع</span>
                    <strong className="mc-val">{m.time}</strong>
                  </div>
                </div>
                <div className="mc-info-item">
                  <div className="mc-info-icon prize"><Icon name="trophy" /></div>
                  <div className="mc-info-text">
                    <span className="mc-lbl">جایزه مسابقه</span>
                    <strong className="mc-val text-cream">{m.prize}</strong>
                  </div>
                </div>
              </div>
              <button className="mc-btn-full">ثبت‌نام و مشاهده جزئیات <Icon name="arrow" /></button>
            </div>
          </article>
        ))}
      </div>

      {/* 4. Steps & About (Full Width Redesign) */}
      <div className="tour-sec-h reveal" style={{ '--d': 7, marginTop: '48px' } as any}>
        <h3>چطور در مسابقات شرکت کنم؟</h3>
      </div>
      <div className="tour-steps-grid reveal" style={{ '--d': 8 } as any}>
        {[
          { num: '۱', icon: 'users', t: 'تیم خود را بسازید', d: 'یک تیم جدید با دوستان خود بسازید یا با کد دعوت به تیمی که قبلاً ساخته شده ملحق شوید.' },
          { num: '۲', icon: 'search', t: 'مسابقه را انتخاب کنید', d: 'به لیست مسابقات فعال بروید و تورنومنتی که با زمان و بازی شما همخوانی دارد را انتخاب کنید.' },
          { num: '۳', icon: 'game', t: 'تکمیل ثبت‌نام', d: 'اطلاعات تیم و شناسه‌ی درون‌بازی بازیکن‌ها را وارد کرده و مبلغ ورودی را پرداخت کنید.' },
          { num: '۴', icon: 'trophy', t: 'شروع رقابت و جوایز', d: '۴۸ ساعت قبل از شروع مسابقات، جدول قرعه‌کشی و حریف خود را در همین صفحه می‌بینید.' }
        ].map((st, i) => (
          <div key={st.num} className="tour-step-card spot spot-track" data-step={st.num} style={{ '--d': 8 + i } as any}>
            <div className="tsc-icon"><Icon name={st.icon} /></div>
            <div className="tsc-content">
              <span className="tsc-step">مرحله {st.num}</span>
              <h4>{st.t}</h4>
              <p>{st.d}</p>
            </div>
            <div className="tsc-glow"></div>
          </div>
        ))}
      </div>

      {/* 5. Leaderboard (Tables Redesign) */}
      <div className="tour-sec-h reveal" style={{ '--d': 9, marginTop: '48px' } as any}>
        <h3>جدول رتبه‌بندی فصل</h3>
        <div className="lb-tabs-new">
          <button className={`lb-tab-btn ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>برترین تیم‌ها</button>
          <button className={`lb-tab-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>برترین بازیکنان</button>
        </div>
      </div>

      <div className="tour-table-wrapper spot spot-track reveal" style={{ '--d': 10 } as any}>
        {activeTab === 'teams' ? (
          <table className="tour-table">
            <thead>
              <tr>
                <th>رتبه</th>
                <th>تیم</th>
                <th>قهرمانی‌ها</th>
                <th>مجموع جوایز</th>
                <th>امتیاز فصل</th>
              </tr>
            </thead>
            <tbody>
              {[
                { r: 1, n: 'Shadow Wolves', tag: 'SW', w: 12, prize: '۱۵۰ میلیون تومان', pts: '9,240' },
                { r: 2, n: 'Crimson Fangs', tag: 'CF', w: 9, prize: '۱۱۰ میلیون تومان', pts: '8,910' },
                { r: 3, n: 'Night Phantoms', tag: 'NP', w: 7, prize: '۸۵ میلیون تومان', pts: '8,470' },
                { r: 4, n: 'Iron Falcons', tag: 'IF', w: 5, prize: '۶۰ میلیون تومان', pts: '7,930' },
                { r: 5, n: 'Neon Riders', tag: 'NR', w: 4, prize: '۴۵ میلیون تومان', pts: '7,120' },
              ].map(lb => (
                <tr key={lb.r} className={lb.r <= 3 ? `top-rank-${lb.r}` : ''}>
                  <td>
                    <div className="lb-rank-badge">
                      {lb.r <= 3 ? <Icon name="trophy" /> : <span>{lb.r}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="lb-team-cell">
                      <div className="lb-crest">{lb.n.substring(0,2).toUpperCase()}</div>
                      <strong>{lb.n}</strong>
                    </div>
                  </td>
                  <td><span className="lb-stat">{lb.w}</span></td>
                  <td><span className="lb-prize-stat">{lb.prize}</span></td>
                  <td><strong className="lb-pts-stat">{lb.pts}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="tour-table table-players">
            <thead>
              <tr>
                <th>رتبه</th>
                <th>بازیکن</th>
                <th>بازی تخصصی</th>
                <th>نسبت برد (K/D)</th>
                <th>ساعت بازی</th>
                <th>امتیاز کل</th>
              </tr>
            </thead>
            <tbody>
              {[
                { r: 1, n: 'Ali_Gamer99', game: 'Valorant', kd: '2.4', hr: '1,200', pts: '12,450' },
                { r: 2, n: 'ProSniper_IR', game: 'CS 2', kd: '2.1', hr: '980', pts: '11,200' },
                { r: 3, n: 'DarkKnight', game: 'Dota 2', kd: '1.9', hr: '2,400', pts: '10,850' },
                { r: 4, n: 'NoobMaster', game: 'Fortnite', kd: '1.7', hr: '650', pts: '9,400' },
                { r: 5, n: 'Apex_Predator', game: 'Apex Legends', kd: '1.8', hr: '890', pts: '8,900' },
              ].map(lb => (
                <tr key={lb.r} className={lb.r <= 3 ? `top-rank-${lb.r}` : ''}>
                  <td>
                    <div className="lb-rank-badge">
                      {lb.r <= 3 ? <Icon name="trophy" /> : <span>{lb.r}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="lb-player-cell">
                      <div className="lb-avatar"><Icon name="users" /></div>
                      <strong>{lb.n}</strong>
                    </div>
                  </td>
                  <td><span className="lb-game-tag">{lb.game}</span></td>
                  <td><span className="lb-stat">{lb.kd}</span></td>
                  <td><span className="lb-stat">{lb.hr}h</span></td>
                  <td><strong className="lb-pts-stat">{lb.pts}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
