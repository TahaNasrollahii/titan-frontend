'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Icon } from '@/components/Icons';
import { faNumber } from '@/lib/format';
import { RANKS, getOrnamentSVGWrapper, getRingSVG } from '@/utils/ranks';

import styles from './guides.module.css';

interface RankTierDetail {
  id: string;
  faName: string;
  rangeLabel: string;
  ornamentLabel: string;
  perk: string;
}

const RANK_TIER_DETAILS: Record<string, RankTierDetail> = {
  bronze: {
    id: 'bronze',
    faName: 'برنز',
    rangeLabel: '۰ تا ۱,۴۹۹ امتیاز',
    ornamentLabel: 'نشان لوزی برنزی',
    perk: 'ورود به تمام تورنومنت‌های عمومی، ثبت آمار فصل و دریافت قاب آواتار برنزی',
  },
  silver: {
    id: 'silver',
    faName: 'نقره',
    rangeLabel: '۱,۵۰۰ تا ۴,۹۹۹ امتیاز',
    ornamentLabel: 'نشان ستاره نقره‌ای',
    perk: 'ارتقای سید (Seed) اولیه در براکت مسابقات و قاب نقره‌ای درخشان در پروفایل',
  },
  gold: {
    id: 'gold',
    faName: 'طلا',
    rangeLabel: '۵,۰۰۰ تا ۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان تاج طلایی',
    perk: 'جایگاه ویژه در سیدبندی دور اول براکت‌ها و نمایش تاج طلایی روی آواتار',
  },
  platinum: {
    id: 'platinum',
    faName: 'پلاتینیوم',
    rangeLabel: '۱۰,۰۰۰ تا ۱۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان الماس بنفش',
    perk: 'اولویت استراحت دور اول (Bye) در جداول غیرکامل و حضور در صدر لیدربرد',
  },
  titan: {
    id: 'titan',
    faName: 'تایتان',
    rangeLabel: '+۲۰,۰۰۰ امتیاز',
    ornamentLabel: 'نشان اسطوره‌ای تایتان',
    perk: 'بالاترین سید ممکن در تمام تورنومنت‌ها، قاب سرخ-مشکی تایتان و تالار افتخارات',
  },
};

const RANK_MECHANICS = [
  {
    icon: 'trophy',
    badge: '+۲۵ تا +۱,۰۰۰ امتیاز',
    title: 'نحوه کسب امتیاز رنک (Points)',
    desc: 'با پیروزی در هر مسابقه از جدول براکت ۲۵ امتیاز رنک می‌گیرید و نفرات برتر هر تورنومنت نیز از ۱۵۰ تا ۱,۰۰۰ امتیاز پاداش می‌گیرند.',
    accent: '#f59e0b',
  },
  {
    icon: 'bolt',
    badge: '+۱۲۰ XP برد / +۴۰ XP حضور',
    title: 'تفاوت امتیاز رنک با تجربه (XP) و لول',
    desc: 'امتیاز رنک سطح رقابتی شما (برنز تا تایتان) را مشخص می‌کند، اما XP سابقه فعالیت شماست و در هر بازی به برنده و بازنده تعلق می‌گیرد.',
    accent: '#00d4ff',
  },
  {
    icon: 'users',
    badge: 'سیدبندی هوشمند',
    title: 'تاثیر رنک در براکت و مسابقات تیمی',
    desc: 'در مسابقات تیمی امتیاز هم به تیم و هم به بازیکنان ترکیب (Roster) اضافه می‌شود و جدول براکت بر اساس امتیاز سیدبندی می‌شود.',
    accent: '#9d6fff',
  },
  {
    icon: 'crown',
    badge: '۵ نشان افتخار',
    title: 'نشان‌های افتخار (Badges) پروفایل',
    desc: 'با فتح فینال تورنومنت نشان «قهرمان» و با ثبت رکوردهای ویژه نشان‌های «برد پیاپی»، «کهنه‌کار»، «سلطان هدشات» و «استاد کلاچ» فعال می‌شوند.',
    accent: '#e2453f',
  },
];

export function RanksGuideShowcase({ variant = 'hub' }: { variant?: 'hub' | 'article' }) {
  const isHub = variant === 'hub';

  return (
    <section
      id="ranks-guide"
      className={`${styles.ranksSection} ${!isHub ? styles.ranksSectionArticle : ''}`}
      aria-labelledby="ranks-guide-title"
    >
      <div className={styles.ranksHeader}>
        <div className={styles.ranksHeaderRight}>
          <h2 id="ranks-guide-title" className={styles.ranksTitle}>
            {isHub ? 'رنک‌ها و سیستم امتیازدهی تایتان' : 'سطح‌های ۵گانه رنک و نحوه امتیازگیری'}
          </h2>
          <p className={styles.ranksSubtitle}>
            بر اساس امتیازهای کسب‌شده در تورنومنت‌ها، اکانت و تیم شما از سطح ۱ (برنز) تا سطح ۵ (تایتان) ارتقا می‌یابد.
          </p>
        </div>

        {isHub && (
          <div className={styles.ranksHeaderActions}>
            <Link href="/guides/ranks" className={styles.btnPrimary}>
              <span>آموزش کامل رنک‌ها و امتیازات</span>
              <Icon name="arrow" />
            </Link>
          </div>
        )}
      </div>

      {/* 5 Rank Tiers Grid (1 to 5 from Left to Right) */}
      <div className={styles.ranksTiersGrid}>
        {RANKS.map((rank, index) => {
          const detail = RANK_TIER_DETAILS[rank.id] ?? RANK_TIER_DETAILS.bronze;
          return (
            <Link
              key={rank.id}
              href="/guides/ranks"
              className={`${styles.rankTierCard} ${isHub ? styles.rankTierCardCompact : ''}`}
              data-tier={rank.id}
              style={
                {
                  '--rank-from': rank.from,
                  '--rank-to': rank.to,
                  '--rank-glow': rank.glow,
                } as CSSProperties
              }
            >
              <div className={styles.rankVisualStage}>
                <div
                  className={`rank-frame-wrap ${styles.rankFrameBox}`}
                  data-tier={rank.id}
                  style={{ '--tier-glow': rank.glow } as CSSProperties}
                >
                  <span className="rank-frame-glow" aria-hidden="true" />
                  <span className="rank-frame-ring" aria-hidden="true">
                    {getRingSVG(rank, `guide-${variant}-${rank.id}`)}
                  </span>
                  <span className="rank-frame-ornament" aria-hidden="true">
                    {getOrnamentSVGWrapper(rank, `guide-${variant}-${rank.id}`)}
                  </span>
                  <div className="rank-inner-circle">{faNumber(index + 1)}</div>
                </div>
              </div>

              <div className={styles.rankTierIdentity}>
                <div className={styles.rankTierNames}>
                  <h3 style={{ color: rank.from }}>{detail.faName}</h3>
                  <span>{rank.name}</span>
                </div>
                <div className={styles.rankTierPointsBadge}>{detail.rangeLabel}</div>
              </div>

              <p className={styles.rankTierMotto}>{rank.desc}</p>

              {!isHub && (
                <div className={styles.rankTierMeta}>
                  <p className={styles.rankTierPerk}>{detail.perk}</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* 4 Mechanics Cards — only shown on the dedicated /guides/ranks page */}
      {!isHub && (
        <div className={styles.ranksMechanicsGrid}>
          {RANK_MECHANICS.map(item => (
            <div
              key={item.title}
              className={styles.rankMechanicCard}
              style={{ '--mech-accent': item.accent } as CSSProperties}
            >
              <div className={styles.rankMechanicHead}>
                <span className={styles.rankMechanicIcon} aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span className={styles.rankMechanicBadge}>{item.badge}</span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
