'use client';

import React from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';

export default function BracketPage({ params }: { params: { id: string } }) {
  return (
    <div className={styles.bracketWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1>براکت مسابقات (تورنومنت ولورانت)</h1>
          <p>وضعیت لحظه‌ای رقابت‌ها و جایگاه تیم‌ها</p>
        </div>
        <button className={styles.btnPrimary}><Icon name="play" /> ورود به لابی مسابقه (شما)</button>
      </div>

      <div className={styles.bracketContainer}>
        {/* Quarter Finals */}
        <div className={styles.round}>
          <div className={styles.roundTitle}>یک چهارم نهایی</div>
          
          <div className={styles.match}>
            <div className={`${styles.matchConnector} ${styles.connectorTop}`}></div>
            <div className={`${styles.teamRow} ${styles.winner}`}>
              <div className={styles.teamName}><div className={styles.teamIcon}>IR</div> Iran Titans</div>
              <div className={styles.score}>۱۳</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>NV</div> Nova</div>
              <div className={styles.score}>۸</div>
            </div>
          </div>

          <div className={styles.match}>
            <div className={`${styles.matchConnector} ${styles.connectorBottom}`}></div>
            <div className={`${styles.teamRow} ${styles.winner}`}>
              <div className={styles.teamName}><div className={styles.teamIcon}>DP</div> Dark Phoenix</div>
              <div className={styles.score}>۱۳</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>TL</div> Team Liquid</div>
              <div className={styles.score}>۱۱</div>
            </div>
          </div>
          
          <div className={styles.match}>
            <div className={`${styles.matchConnector} ${styles.connectorTop}`}></div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>G2</div> G2 Esports</div>
              <div className={styles.score}>۹</div>
            </div>
            <div className={`${styles.teamRow} ${styles.winner}`}>
              <div className={styles.teamName}><div className={styles.teamIcon}>SN</div> Sentinels</div>
              <div className={styles.score}>۱۳</div>
            </div>
          </div>

          <div className={styles.match}>
            <div className={`${styles.matchConnector} ${styles.connectorBottom}`}></div>
            <div className={`${styles.teamRow} ${styles.winner}`}>
              <div className={styles.teamName}><div className={styles.teamIcon}>FNC</div> Fnatic</div>
              <div className={styles.score}>۱۳</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>PRX</div> Paper Rex</div>
              <div className={styles.score}>۱۰</div>
            </div>
          </div>
        </div>

        {/* Semi Finals */}
        <div className={styles.round} style={{ justifyContent: 'space-around' }}>
          <div className={styles.roundTitle}>نیمه نهایی</div>
          
          <div className={`${styles.match} ${styles.liveMatch}`}>
            <div className={`${styles.matchConnector} ${styles.connectorTop}`}></div>
            <div className={styles.liveBadge}>LIVE</div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>IR</div> Iran Titans (شما)</div>
              <div className={styles.score}>۷</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>DP</div> Dark Phoenix</div>
              <div className={styles.score}>۵</div>
            </div>
          </div>

          <div className={styles.match}>
            <div className={`${styles.matchConnector} ${styles.connectorBottom}`}></div>
            <div className={`${styles.teamRow} ${styles.winner}`}>
              <div className={styles.teamName}><div className={styles.teamIcon}>SN</div> Sentinels</div>
              <div className={styles.score}>۱۳</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>FNC</div> Fnatic</div>
              <div className={styles.score}>۱۱</div>
            </div>
          </div>
        </div>

        {/* Grand Final */}
        <div className={styles.round} style={{ justifyContent: 'center' }}>
          <div className={styles.roundTitle} style={{ color: 'gold', borderColor: 'rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)' }}>فینال بزرگ</div>
          
          <div className={`${styles.match} ${styles.finalMatch}`}>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>?</div> برنده نیمه‌نهایی ۱</div>
              <div className={styles.score}>-</div>
            </div>
            <div className={styles.teamRow}>
              <div className={styles.teamName}><div className={styles.teamIcon}>SN</div> Sentinels</div>
              <div className={styles.score}>-</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
