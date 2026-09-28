'use client';

import React, { useState } from 'react';
import '../tournament/tournament.css';
import './list.css';
import { Icon } from '@/components/Icons';

// Dummy data for tournaments
const ALL_TOURNAMENTS = [
  { id: 1, game: 'Valorant', image: '/images/games/valorant-background.png', prize: '۵۰,۰۰۰,۰۰۰ تومان', team1: 'Shadow Wolves', tag1: 'مدافع عنوان', team2: 'Crimson Fangs', tag2: 'صعود گروهی', time: 'امروز · ۲۱:۰۰', status: 'ثبت‌نام باز', dateMs: Date.now() + 86400000, prizeNum: 50000000 },
  { id: 2, game: 'Apex Legends', image: '/images/games/apexlegends-background.png', prize: '۳۰,۰۰۰,۰۰۰ تومان', team1: 'Night Phantoms', tag1: 'رتبه ۳', team2: 'Iron Falcons', tag2: 'تازه‌وارد', time: 'پنجشنبه · ۱۹:۳۰', status: 'ثبت‌نام باز', dateMs: Date.now() + 86400000 * 3, prizeNum: 30000000 },
  { id: 3, game: 'Fortnite', image: '/images/games/fortnite-background.png', prize: '۲۰,۰۰۰,۰۰۰ تومان', team1: 'Neon Riders', tag1: 'قهرمان فصل قبل', team2: 'Dark Eagles', tag2: 'رتبه ۵', time: 'جمعه · ۱۸:۰۰', status: 'تکمیل ظرفیت', dateMs: Date.now() + 86400000 * 4, prizeNum: 20000000 },
  { id: 4, game: 'CS 2', image: '/images/games/cs-background.png', prize: '۱۰۰,۰۰۰,۰۰۰ تومان', team1: 'TBA', tag1: 'آزاد', team2: 'TBA', tag2: 'آزاد', time: 'هفته آینده', status: 'به‌زودی', dateMs: Date.now() + 86400000 * 7, prizeNum: 100000000 },
  { id: 5, game: 'Dota 2', image: '/images/games/dota-background.png', prize: '۸۰,۰۰۰,۰۰۰ تومان', team1: 'Dire Force', tag1: 'سطح ۱', team2: 'Radiant Glow', tag2: 'سطح ۲', time: 'دوشنبه · ۱۶:۰۰', status: 'در جریان', dateMs: Date.now() - 86400000, prizeNum: 80000000 },
  { id: 6, game: 'Valorant', image: '/images/games/valorant-background.png', prize: '۱۰,۰۰۰,۰۰۰ تومان', team1: 'Aim Bots', tag1: 'تازه‌وارد', team2: 'Wall Hackers', tag2: 'آماتور', time: 'فردا · ۱۰:۰۰', status: 'ثبت‌نام باز', dateMs: Date.now() + 86400000 * 1, prizeNum: 10000000 },
];

export default function TournamentsListPage() {
  const [filterGame, setFilterGame] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortMethod, setSortMethod] = useState('Soonest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTournaments = ALL_TOURNAMENTS.filter(t => {
    if (filterGame !== 'All' && t.game !== filterGame) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!t.team1.toLowerCase().includes(q) && !t.team2.toLowerCase().includes(q) && !t.game.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortMethod === 'Soonest') return a.dateMs - b.dateMs;
    if (sortMethod === 'Prize High-Low') return b.prizeNum - a.prizeNum;
    return 0; // Default
  });

  return (
    <main className="tour-wrapper">
      <div className="liquid-bg">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className="tour-sec-h reveal" style={{ '--d': 1, marginTop: '20px' } as any}>
        <h3>لیست مسابقات</h3>
      </div>

      {/* Filter and Sort Bar */}
      <div className="filter-bar-wrapper spot reveal" style={{ '--d': 2 } as any}>
        <div className="filter-search">
          <Icon name="search" />
          <input 
            type="text" 
            placeholder="جستجوی تیم، بازی یا تورنومنت..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdowns">
          <select value={filterGame} onChange={e => setFilterGame(e.target.value)}>
            <option value="All">همه بازی‌ها</option>
            <option value="Valorant">Valorant</option>
            <option value="Apex Legends">Apex Legends</option>
            <option value="Fortnite">Fortnite</option>
            <option value="CS 2">CS 2</option>
            <option value="Dota 2">Dota 2</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">همه وضعیت‌ها</option>
            <option value="ثبت‌نام باز">ثبت‌نام باز</option>
            <option value="در جریان">در جریان</option>
            <option value="به‌زودی">به‌زودی</option>
            <option value="تکمیل ظرفیت">تکمیل ظرفیت</option>
          </select>

          <select value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
            <option value="Soonest">نزدیک‌ترین زمان</option>
            <option value="Prize High-Low">بیشترین جایزه</option>
          </select>
        </div>
      </div>

      <div className="tour-matches reveal" style={{ '--d': 3, marginTop: '24px' } as any}>
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((m, i) => (
            <article key={m.id} className="match-card-premium spot spot-track reveal" style={{ '--d': 4 + i } as any}>
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
          ))
        ) : (
          <div className="empty-state">
            <Icon name="search" />
            <p>هیچ تورنومنتی با این مشخصات یافت نشد!</p>
          </div>
        )}
      </div>
    </main>
  );
}
