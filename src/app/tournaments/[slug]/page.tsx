'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Avatar } from '@/components/Icons';
import styles from './details.module.css';
import '../../tournament/tournament.css';



export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  // Consider tournament ID '2' as a Solo tournament, and others as Team tournaments
  const isTeamTournament = params.id !== '2';

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
  }, [activeTab]); // re-bind when tabs change

  return (
    <main className={styles.wrapper}>
      {/* Liquid Background Blobs */}
      <div className="liquid-bg" aria-hidden="true">
        <div className="l-blob blob-1"></div>
        <div className="l-blob blob-2"></div>
        <div className="l-blob blob-3"></div>
      </div>

      <div className={styles.topLayout}>
        <div className={`${styles.heroSection} spot spot-track reveal`} style={{ '--d': 1 } as any}>
          <img src="/images/games/valorant-background.png" alt="Valorant" className={styles.heroImage} />
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.titleArea}>
              <div className={styles.badges}>
                 <span className={`${styles.badge} ${styles.badgePrimary}`}><Icon name="game" /> Valorant</span>
                 <span className={styles.badge}>فصل ۳ مسابقات</span>
                 <span className={`${styles.badge} ${styles.badgeOpen}`}>ثبت‌نام باز</span>
              </div>
              <h1 className={styles.title}>{isTeamTournament ? 'مسابقات قهرمانی ولورانت - تایتان' : 'تورنومنت انفرادی ایپکس - تایتان'}</h1>
              <p className={styles.subtitle}>{isTeamTournament ? 'بزرگترین رقابت تیمی ایران با جایزه نقدی ۵۰ میلیون تومانی. تیم خود را آماده کنید و مهارت‌های خود را در بالاترین سطح به چالش بکشید.' : 'بزرگترین رقابت تک‌نفره ایران. مهارت‌های فردی خود را در بالاترین سطح به چالش بکشید و قهرمان شوید.'}</p>
              
              <div className={styles.quickStats}>
                 <div className={styles.statItem}>
                   <Icon name={isTeamTournament ? "users" : "user"} /> {isTeamTournament ? '۵v۵ (تیمی)' : 'تک نفره (Solo)'}
                 </div>
                 <div className={styles.statItem}>
                   <Icon name="clock" /> ۲۵ شهریور · ۲۱:۰۰
                 </div>
                 <div className={styles.statItem}>
                   <Icon name="trophy" /> ۵۰,۰۰۰,۰۰۰ تومان جایزه
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
           {/* Tabs */}
           <div className={`${styles.tabs} reveal`} style={{ '--d': 2 } as any}>
              <button className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('overview')}>اطلاعات کلی</button>
              <button className={`${styles.tabBtn} ${activeTab === 'rules' ? styles.activeTab : ''}`} onClick={() => setActiveTab('rules')}>قوانین و مقررات</button>
              <button className={`${styles.tabBtn} ${activeTab === 'teams' ? styles.activeTab : ''}`} onClick={() => setActiveTab('teams')}>شرکت‌کنندگان</button>
              <button className={`${styles.tabBtn} ${activeTab === 'bracket' ? styles.activeTab : ''}`} onClick={() => setActiveTab('bracket')}>جدول مسابقات</button>
           </div>

           <div className={`${styles.tabContent} reveal spot spot-track`} style={{ '--d': 3 } as any}>
              {activeTab === 'overview' && (
                <div className={styles.overviewPane}>
                  <h3>درباره تورنومنت</h3>
                  <p>این تورنومنت به صورت حذفی و در قالب {isTeamTournament ? '۵ در مقابل ۵' : 'تک‌نفره'} برگزار می‌شود. مسابقات از مرحله مقدماتی آغاز شده و به صورت آنلاین انجام خواهد شد. مراحل نیمه‌نهایی و فینال به صورت Best of 3 و با پخش زنده همراه با گزارشگر اختصاصی تایتان برگزار می‌شود.</p>
                  <p>تیم‌های برتر علاوه بر جوایز نقدی، امتیاز رنکینگ فصل ۳ را دریافت می‌کنند که برای صعود به مسابقات جایزه بزرگ پایان سال حیاتی است.</p>
                  
                  <div className={styles.prizePool}>
                     <h4>توزیع جوایز</h4>
                     <div className={styles.prizeList}>
                        <div className={styles.prizeRow}>
                           <span className={styles.prizeRank}><Icon name="trophy" style={{color: '#ffd700'}}/> تیم اول (قهرمان)</span>
                           <span className={styles.prizeAmount}>۳۰,۰۰۰,۰۰۰ تومان</span>
                        </div>
                        <div className={styles.prizeRow}>
                           <span className={styles.prizeRank}><Icon name="trophy" style={{color: '#c0c0c0'}}/> تیم دوم (نایب قهرمان)</span>
                           <span className={styles.prizeAmount}>۱۵,۰۰۰,۰۰۰ تومان</span>
                        </div>
                        <div className={styles.prizeRow}>
                           <span className={styles.prizeRank}><Icon name="trophy" style={{color: '#cd7f32'}}/> تیم سوم</span>
                           <span className={styles.prizeAmount}>۵,۰۰۰,۰۰۰ تومان</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className={styles.overviewPane}>
                  <h3>قوانین و مقررات</h3>
                  <p>تمامی بازیکنان موظف به رعایت قوانین مسابقات هستند. استفاده از هرگونه چیت، گلیچ یا رفتار غیرورزشی منجر به حذف تیم از مسابقات و بن شدن حساب کاربری خواهد شد.</p>
                  <div className="dl-content trust-content" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="trust-item">
                      <div className="trust-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" /><div className="glow"></div></div>
                      <div className="trust-text">
                        <span>قوانین بازی جوانمردانه</span>
                        <small>آنتی‌چیت و عدم استفاده از گلیچ</small>
                      </div>
                    </div>
                    <div className="trust-divider"></div>
                    <div className="trust-item">
                      <div className="trust-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="clock" /><div className="glow"></div></div>
                      <div className="trust-text">
                        <span>حضور به‌موقع</span>
                        <small>۱۵ دقیقه قبل از شروع مسابقه</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className={styles.participantsList}>
                  {isTeamTournament ? (
                    <>
                      {[
                        { n: 'Shadow Wolves', tag: 'SW', rank: 'رده‌بندی جهانی: ۲', pts: '9,240' },
                        { n: 'Viper Squad', tag: 'VS', rank: 'رده‌بندی جهانی: ۵', pts: '9,100' },
                        { n: 'Aim Bots', tag: 'AB', rank: 'رده‌بندی جهانی: ۱۲', pts: '8,900' },
                        { n: 'Crimson Fangs', tag: 'CF', rank: 'رده‌بندی جهانی: ۱۹', pts: '8,400' },
                      ].map((t, i) => (
                        <div key={i} className={`${styles.participantListRow} spot spot-track`} style={{ '--d': i } as any}>
                          <div className={styles.participantIndex}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          
                          <div className={`${styles.participantAvatar} ${styles.participantCrest}`}>
                            {t.tag}
                          </div>
                          
                          <div className={styles.participantDetails}>
                            <div className={styles.participantName}>{t.n}</div>
                            <div className={styles.participantRank}>
                              <Icon name="chart" /> {t.rank}
                            </div>
                          </div>
                          
                          <div className={styles.participantStats}>
                            <div className={styles.statGroup}>
                              <span className={styles.statLabel}>امتیاز کلی</span>
                              <span className={styles.statScore}>{t.pts}</span>
                            </div>
                            <div className={styles.participantAction}>
                              <Icon name="chevron-left" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { n: 'Ali_Gamer99', rank: 'رنک: تایتان', pts: '12,450', seed: 42 },
                        { n: 'ProSniper_IR', rank: 'رنک: پلاتینیوم', pts: '11,200', seed: 15 },
                        { n: 'HeadshotKing', rank: 'رنک: گلد', pts: '9,800', seed: 7 },
                        { n: 'Apex_Predator', rank: 'رنک: دایموند', pts: '9,100', seed: 10 },
                      ].map((p, i) => (
                        <div key={i} className={`${styles.participantListRow} spot spot-track`} style={{ '--d': i } as any}>
                          <div className={styles.participantIndex}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          
                          <div className={styles.participantAvatar}>
                            <Avatar seed={p.seed} />
                          </div>
                          
                          <div className={styles.participantDetails}>
                            <div className={styles.participantName}>{p.n}</div>
                            <div className={styles.participantRank}>
                              <Icon name="chart" /> {p.rank}
                            </div>
                          </div>
                          
                          <div className={styles.participantStats}>
                            <div className={styles.statGroup}>
                              <span className={styles.statLabel}>امتیاز کلی</span>
                              <span className={styles.statScore}>{p.pts}</span>
                            </div>
                            <div className={styles.participantAction}>
                              <Icon name="chevron-left" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'bracket' && (
                <div className={styles.emptyTab}>
                  <Icon name="chart" />
                  <p>براکت و جدول مسابقات پس از قرعه‌کشی نهایی تیم‌ها در دسترس قرار می‌گیرد.</p>
                </div>
              )}
           </div>
        </div>

        <aside className={styles.sidebar}>
           <div className={`${styles.registrationWidget} spot spot-track reveal`} style={{ '--d': 2 } as any}>
              <h3>ثبت‌نام در تورنومنت</h3>
              <div className={styles.priceTag}>
                 <div className={styles.priceHeader}>
                    <span className={styles.priceLabel}>هزینه ورودی</span>
                    <span className={styles.discountBadge}>۶۶٪ تخفیف</span>
                 </div>
                 <div className={styles.priceValues}>
                    <span className={styles.priceOld}>۱۵۰,۰۰۰ تومان</span>
                    <span className={styles.priceNew}>
                       ۵۰,۰۰۰ 
                       <span className={styles.currency}>تومان</span>
                       <span className={styles.perUnit}>/ هر {isTeamTournament ? 'تیم' : 'نفر'}</span>
                    </span>
                 </div>
              </div>
              
              <div className={styles.capacityBar}>
                 <div className={styles.capLabels}>
                    <span>ظرفیت باقیمانده</span>
                    <span>۱۲ / ۳۲ {isTeamTournament ? 'تیم' : 'نفر'}</span>
                 </div>
                 <div className={styles.capTrack}>
                    <div className={styles.capFill} style={{width: '37.5%'}}></div>
                 </div>
              </div>

              {isTeamTournament && (
                <div className={styles.teamSelection}>
                  <div className={styles.teamSelectionLabel}>انتخاب تیم برای شرکت در مسابقه:</div>
                  {[
                    { id: 1, name: 'Shadow Wolves', tag: 'SW' },
                    { id: 2, name: 'Night Phantoms', tag: 'NP' }
                  ].map(team => (
                    <div 
                      key={team.id} 
                      className={`${styles.teamOption} ${selectedTeam === team.id ? styles.selected : ''}`}
                      onClick={() => setSelectedTeam(team.id)}
                    >
                      <div className={styles.teamOptionCrest}>{team.tag}</div>
                      <div className={styles.teamOptionName}>{team.name}</div>
                      <div className={styles.radioCircle}></div>
                    </div>
                  ))}
                </div>
              )}

              <button className={styles.btnRegister}>
                <Icon name="play" /> {isTeamTournament ? 'پرداخت و ثبت‌نام تیم' : 'پرداخت و ثبت‌نام'}
              </button>

              <div className={styles.widgetMeta}>
                 <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Icon name="chat" /></div>
                    <span>پشتیبانی اختصاصی</span>
                 </div>
                 <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Icon name="globe" /></div>
                    <span>سرور اختصاصی خاورمیانه</span>
                 </div>
                 <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Icon name="shield" /></div>
                    <span>سیستم آنتی‌چیت پیشرفته</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>

    </main>
  );
}
