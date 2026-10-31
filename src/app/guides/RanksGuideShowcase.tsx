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
    perk: 'ارتقای سید (Seed) اولیه در براکت مسابقات و قاب نقره‌ای درخشان در پروفایل و لیدربرد',
  },
  gold: {
    id: 'gold',
    faName: 'طلا',
    rangeLabel: '۵,۰۰۰ تا ۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان تاج طلایی',
    perk: 'جایگاه ویژه در سیدبندی دور اول براکت‌ها و نمایش تاج طلایی روی آواتار بازیکن و تیم',
  },
  platinum: {
    id: 'platinum',
    faName: 'پلاتینیوم',
    rangeLabel: '۱۰,۰۰۰ تا ۱۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان الماس بنفش',
    perk: 'اولویت دریافت استراحت دور اول (Bye) در جداول غیرکامل و قرارگیری در صدر جدول برترین‌ها',
  },
  titan: {
    id: 'titan',
    faName: 'تایتان',
    rangeLabel: '+۲۰,۰۰۰ امتیاز',
    ornamentLabel: 'نشان اسطوره‌ای تایتان با چشمان درخشان',
    perk: 'بالاترین سید ممکن در تمام تورنومنت‌ها، قاب سرخ-مشکی تایتان و جایگاه تالار افتخارات فصل',
  },
};

const RANK_MECHANICS = [
  {
    icon: 'trophy',
    badge: '+۲۵ تا +۱,۰۰۰ امتیاز',
    title: 'نحوه کسب امتیاز رنک (Points)',
    desc: 'با پیروزی در هر مسابقه از جدول براکت ۲۵ امتیاز رنک می‌گیرید. علاوه بر آن، نفرات و تیم‌های برتر هر تورنومنت (رتبه‌های اول تا سوم) پاداش امتیازی ویژه جدول (از ۱۵۰ تا ۱,۰۰۰ امتیاز) دریافت می‌کنند.',
    accent: '#f59e0b',
  },
  {
    icon: 'bolt',
    badge: '+۱۲۰ XP برد / +۴۰ XP حضور',
    title: 'تفاوت امتیاز رنک با تجربه (XP) و لول',
    desc: 'امتیاز رنک سطح رقابتی شما (برنز تا تایتان) را مشخص می‌کند، اما XP نشان‌دهنده سابقه فعالیت شماست. در هر بازی برنده ۱۲۰ XP و حتی بازنده ۴۰ XP می‌گیرد و با فرمول 500 + (Level × 300) لول اکانت ارتقا می‌یابد.',
    accent: '#00d4ff',
  },
  {
    icon: 'users',
    badge: 'سیدبندی هوشمند',
    title: 'تاثیر رنک در براکت و مسابقات تیمی',
    desc: 'در مسابقات تیمی امتیاز هم به تیم و هم به بازیکنان داخل ترکیب (Roster) اضافه می‌شود. همچنین جدول براکت بر اساس امتیاز سیدبندی می‌شود تا تیم‌های قوی در دور اول به هم نخورند.',
    accent: '#9d6fff',
  },
  {
    icon: 'crown',
    badge: '۵ نشان افتخار',
    title: 'نشان‌های افتخار (Badges) پروفایل',
    desc: 'با فتح فینال هر تورنومنت، نشان «قهرمان (Champion)» به‌صورت خودکار به پروفایل شما اضافه می‌شود. نشان‌های «استاد برد پیاپی»، «کهنه‌کار»، «سلطان هدشات» و «استاد کلاچ» نیز رکوردهای شما را نمایش می‌دهند.',
    accent: '#e2453f',
  },
];

export function RanksGuideShowcase({ variant = 'hub' }: { variant?: 'hub' | 'article' }) {
  return (
    <section
      id="ranks-guide"
      className={`${styles.ranksSection} ${variant === 'article' ? styles.ranksSectionArticle : ''}`}
      aria-labelledby="ranks-guide-title"
    >
      <div className={styles.ranksHeader}>
        <div className={styles.ranksHeaderRight}>
          <span className={styles.sectionKicker}>
            <span className={styles.kickerDot} aria-hidden="true" />
            سیستم رنک‌بندی و سطح‌بندی تایتان
          </span>
          <h2 id="ranks-guide-title" className={styles.ranksTitle}>
            آموزش کامل رنک‌های سایت، امتیازات (Points) و مسیر صعود تا تایتان
          </h2>
          <p className={styles.ranksSubtitle}>
            در تایتان هر بازیکن و هر تیم بر اساس امتیازهای کسب‌شده در تورنومنت‌ها در یکی از ۵ سطح رنک قرار می‌گیرد.
            رنک شما قاب و نشان آواتار، جایگاه در لیدربرد فصل و سیدبندی شما در جدول مسابقات را تعیین می‌کند.
          </p>
        </div>

        {variant === 'hub' && (
          <div className={styles.ranksHeaderActions}>
            <Link href="/guides/ranks" className={styles.btnPrimary}>
              <span>مطالعه راهنمای کامل رنک‌ها</span>
              <Icon name="arrow" />
            </Link>
            <Link href="/tournament" className={styles.btnGhost}>
              <span>مشاهده لیدربرد و رنک‌ها</span>
            </Link>
          </div>
        )}
      </div>

      {/* 5 Rank Tiers Grid */}
      <div className={styles.ranksTiersGrid}>
        {RANKS.map((rank, index) => {
          const detail = RANK_TIER_DETAILS[rank.id] ?? RANK_TIER_DETAILS.bronze;
          return (
            <div
              key={rank.id}
              className={`${styles.rankTierCard} ${styles.spotCard}`}
              data-tier={rank.id}
              style={
                {
                  '--rank-from': rank.from,
                  '--rank-to': rank.to,
                  '--rank-glow': rank.glow,
                } as CSSProperties
              }
            >
              <div className={styles.rankTierTop}>
                <span className={styles.rankTierStep}>سطح {faNumber(index + 1)}</span>
                <span className={styles.rankTierRange}>{detail.rangeLabel}</span>
              </div>

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
                <div className={styles.rankTierPointsBadge}>{rank.pts}</div>
              </div>

              <p className={styles.rankTierMotto}>«{rank.desc}»</p>

              <div className={styles.rankTierMeta}>
                <div className={styles.rankTierOrnamentTag}>
                  <Icon name="sparkles" />
                  <span>{detail.ornamentLabel}</span>
                </div>
                <p className={styles.rankTierPerk}>{detail.perk}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Mechanics Cards: Points, XP/Level, Seeding, Badges */}
      <div className={styles.ranksMechanicsGrid}>
        {RANK_MECHANICS.map(item => (
          <div
            key={item.title}
            className={`${styles.rankMechanicCard} ${styles.spotCard}`}
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
    </section>
  );
}
