'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useMemo, useState } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideCategory, GuideSummary } from '@/lib/api/types';
import { faNumber } from '@/lib/format';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import { GuideCard } from './GuideCard';
import { GUIDE_CATEGORIES, cleanGuideText } from './getGuides';
import styles from './guides.module.css';

interface GameFilterOption {
  key: string;
  label: string;
  icon: string;
  accent: string;
}

const GAME_FILTERS: GameFilterOption[] = [
  {
    key: 'all',
    label: 'همه آموزش‌ها',
    icon: '/icons/guides.svg',
    accent: '#e2453f',
  },
  {
    key: 'fortnite',
    label: 'فورتنایت',
    icon: '/images/categories/fortnite.webp',
    accent: '#00d4ff',
  },
  {
    key: 'valorant',
    label: 'ولورانت',
    icon: '/images/categories/valorant.webp',
    accent: '#ff4655',
  },
  {
    key: 'call-of-duty',
    label: 'کالاف دیوتی موبایل',
    icon: '/images/categories/callof-v2.webp',
    accent: '#f59e0b',
  },
  {
    key: 'clash-of-clans',
    label: 'کلش آف کلنز',
    icon: '/images/categories/clash.webp',
    accent: '#38bdf8',
  },
  {
    key: 'premium',
    label: 'اشتراک پریمیوم',
    icon: '/images/categories/premium.webp',
    accent: '#3ddc84',
  },
  {
    key: 'general',
    label: 'پلتفرم و تورنومنت',
    icon: '/icons/tournament.webp',
    accent: '#9d6fff',
  },
];

const QUICK_TAGS = [
  { label: 'وی‌باکس فورتنایت', query: 'وی‌باکس' },
  { label: 'ولورانت پوینت', query: 'ولورانت پوینت' },
  { label: 'سی‌پی کالاف', query: 'سی‌پی' },
  { label: 'سوپرسل آیدی', query: 'سوپرسل' },
  { label: 'تأیید دومرحله‌ای 2FA', query: 'دومرحله‌ای' },
  { label: 'ثبت‌نام تورنومنت', query: 'تورنومنت' },
];

const QUICK_START_STEPS = [
  {
    step: '۰۱',
    badge: 'پیش‌نیاز خرید',
    title: 'آماده‌سازی و اتصال اکانت بازی',
    description:
      'قبل از ثبت سفارش، اکانت بازی خود را بسازید یا به حساب رسمی (اپیک گیمز، رایوت، اکتیویژن یا سوپرسل آیدی) متصل کنید.',
    icon: '/icons/accounts.webp',
    accent: '#00d4ff',
    links: [
      { label: 'ساخت اکانت اپیک گیمز', href: '/guides/epic-games-account' },
      { label: 'اتصال سوپرسل آیدی کلش', href: '/guides/supercell-id' },
      { label: 'ساخت اکانت رایوت ولورانت', href: '/guides/riot-account' },
    ],
  },
  {
    step: '۰۲',
    badge: 'خرید سریع و امن',
    title: 'ثبت سفارش و ذخیره امن اکانت',
    description:
      'محصول دلخواه را انتخاب کنید، اطلاعات اکانت را یک بار به‌صورت رمزنگاری‌شده ثبت کنید و با کیف پول یا درگاه زرین‌پال پرداخت کنید.',
    icon: '/icons/store.webp',
    accent: '#e2453f',
    links: [
      { label: 'راهنمای گام‌به‌گام خرید', href: '/guides/how-to-buy' },
      { label: 'ثبت امن اکانت در تایتان', href: '/guides/save-game-account' },
      { label: 'شارژ و استفاده از کیف پول', href: '/guides/wallet' },
    ],
  },
  {
    step: '۰۳',
    badge: 'تحویل و رقابت',
    title: 'پیگیری سفارش، امنیت و تورنومنت‌ها',
    description:
      'وضعیت شارژ سفارش را لحظه‌ای در داشبورد دنبال کنید، نکات امنیتی پس از تحویل را انجام دهید و وارد مسابقات نقدی شوید.',
    icon: '/icons/tournament.webp',
    accent: '#9d6fff',
    links: [
      { label: 'پیگیری وضعیت سفارش', href: '/guides/order-tracking' },
      { label: 'امنیت اکانت بعد از خرید', href: '/guides/account-security-after-purchase' },
      { label: 'ثبت‌نام در تورنومنت‌ها', href: '/guides/tournament-registration' },
    ],
  },
];

export function GuidesHubClient({
  guides,
  title,
}: {
  guides: GuideSummary[];
  title: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<GuideCategory | 'all'>('all');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isFiltering =
    normalizedQuery.length > 0 || activeGame !== 'all' || activeCategory !== 'all';

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      if (activeCategory !== 'all' && guide.category !== activeCategory) {
        return false;
      }
      if (activeGame !== 'all') {
        if (activeGame === 'general') {
          if (guide.game !== null) return false;
        } else if (guide.game?.slug !== activeGame) {
          return false;
        }
      }
      if (normalizedQuery) {
        const haystack = `${guide.title} ${cleanGuideText(guide.summary)} ${guide.game?.title ?? ''} ${guide.game?.titleEn ?? ''}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [guides, activeCategory, activeGame, normalizedQuery]);

  const sections = useMemo(() => {
    return GUIDE_CATEGORIES.map(category => ({
      ...category,
      totalCount: guides.filter(g => g.category === category.key).length,
      guides: filteredGuides.filter(guide => guide.category === category.key),
    })).filter(section => section.guides.length > 0);
  }, [guides, filteredGuides]);

  const gameCounts = useMemo(() => {
    const counts: Record<string, number> = { all: guides.length, general: 0 };
    for (const g of guides) {
      if (!g.game) {
        counts.general = (counts.general ?? 0) + 1;
      } else {
        counts[g.game.slug] = (counts[g.game.slug] ?? 0) + 1;
      }
    }
    return counts;
  }, [guides]);

  useSpotlight(`.${styles.spotCard}, .${styles.heroStage}`, [
    activeCategory,
    activeGame,
    normalizedQuery,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveGame('all');
    setActiveCategory('all');
  };

  return (
    <>
      {/* ─── Cyber-Academy Hero Stage ─── */}
      <header className={styles.hero}>
        <div className={styles.heroAmbientGlow} aria-hidden="true" />
        <div className={styles.heroGridMask} aria-hidden="true" />

        <div className={styles.heroContent}>
          <nav aria-label="مسیر صفحه" className={styles.crumbs}>
            <Link href="/" className={styles.crumbLink}>
              <Icon name="home" />
              <span>تایتان</span>
            </Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <span className={styles.crumbCurrent} aria-current="page">
              مرکز آموزش و راهنما
            </span>
          </nav>

          <div className={styles.heroEyebrowRow}>
            <span className={styles.heroKicker}>
              <span className={styles.livePulseDot} aria-hidden="true" />
              <span>آکادمی و راهنمای رسمی تایتان</span>
            </span>
            {guides.length > 0 && (
              <span className={styles.heroCountBadge}>
                {faNumber(guides.length)} آموزش گام‌به‌گام
              </span>
            )}
          </div>

          <h1 className={styles.heroTitle}>
            {title}؛{' '}
            <span className={styles.gradientText}>سریع، امن و قدم‌به‌قدم</span>
          </h1>

          <p className={styles.heroText}>
            هر چیزی که برای خرید از تایتان لازم دارید، یک‌جا: از آماده کردن اکانت بازی و مراحل خرید
            وی‌باکس، ولورانت پوینت، سی‌پی کالاف، جم کلش و اشتراک‌های پریمیوم تا کیف پول، پیگیری
            سفارش و شرکت در تورنومنت‌ها.
          </p>

          {/* Interactive Search Bar */}
          <div className={styles.heroSearchBox} role="search" aria-label="جستجو در آموزش‌ها">
            <span className={styles.heroSearchIcon} aria-hidden="true">
              <Icon name="search" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجو در آموزش‌ها... (مثلاً: وی‌باکس، سوپرسل آیدی، تایید دومرحله‌ای، تورنومنت)"
              aria-label="جستجو در عنوان یا متن آموزش‌ها"
              className={styles.heroSearchInput}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.heroSearchClear}
                aria-label="پاک کردن جستجو"
              >
                <Icon name="x" />
              </button>
            ) : (
              <span className={styles.heroSearchHint} aria-hidden="true">
                {faNumber(filteredGuides.length)} راهنما
              </span>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className={styles.heroQuickTags} aria-label="جستجوهای پرکاربرد">
            <span className={styles.quickTagsLabel}>پرکاربرد:</span>
            {QUICK_TAGS.map(tag => {
              const isSelected = searchQuery === tag.query;
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSearchQuery(isSelected ? '' : tag.query)}
                  className={`${styles.quickTagChip} ${isSelected ? styles.quickTagChipActive : ''}`}
                >
                  <span>#</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>

          {/* Trust Highlights */}
          <div className={styles.heroTrustStrip}>
            <span className={styles.heroTrustItem}>
              <span className={styles.heroTrustIcon} aria-hidden="true">
                <Icon name="sparkles" />
              </span>
              <span>آموزش‌های کاربردی و مرحله‌به‌مرحله</span>
            </span>
            <span className={styles.heroTrustItem}>
              <span className={styles.heroTrustIcon} aria-hidden="true">
                <Icon name="shield" />
              </span>
              <span>استانداردهای کامل امنیت اکانت</span>
            </span>
            <span className={styles.heroTrustItem}>
              <span className={styles.heroTrustIcon} aria-hidden="true">
                <Icon name="chat" />
              </span>
              <span>پشتیبانی آنلاین ۲۴/۷ در تمام مراحل</span>
            </span>
          </div>
        </div>

        {/* Left 3D Visual Stage */}
        <div className={styles.heroStage} aria-hidden="true">
          <div className={styles.stageHalo} />
          <div className={styles.stageRingDashed} />
          <div className={styles.stageRingGlow} />

          <div className={`${styles.stageChar} ${styles.stageCharLeft}`}>
            <Image
              src="/images/hero/characters/fortnite.webp"
              alt=""
              width={320}
              height={320}
              priority
              draggable={false}
            />
          </div>
          <div className={`${styles.stageChar} ${styles.stageCharRight}`}>
            <Image
              src="/images/hero/characters/callof-v2.webp"
              alt=""
              width={320}
              height={320}
              priority
              draggable={false}
            />
          </div>
          <div className={`${styles.stageChar} ${styles.stageCharCenter}`}>
            <Image
              src="/images/hero/characters/valorant.webp"
              alt=""
              width={390}
              height={390}
              priority
              draggable={false}
            />
          </div>

          {/* Floating Game Emblems */}
          <div className={`${styles.stageOrbit} ${styles.stageOrbitA}`}>
            <Image src="/images/glossy-fortnite-logo.webp" alt="" width={68} height={68} draggable={false} />
          </div>
          <div className={`${styles.stageOrbit} ${styles.stageOrbitB}`}>
            <Image src="/images/glossy-valorant-logo.webp" alt="" width={64} height={64} draggable={false} />
          </div>
          <div className={`${styles.stageOrbit} ${styles.stageOrbitC}`}>
            <Image src="/images/glossy-cod-logo.webp" alt="" width={60} height={60} draggable={false} />
          </div>
          <div className={`${styles.stageOrbit} ${styles.stageOrbitD}`}>
            <Image src="/images/products/vbucks.webp" alt="" width={62} height={62} draggable={false} />
          </div>

          {/* Floating Holographic HUD Badges */}
          <div className={`${styles.stageHud} ${styles.stageHudTop}`}>
            <span className={styles.stageHudIcon}>
              <Icon name="flame" />
            </span>
            <div className={styles.stageHudText}>
              <strong>شارژ فوری زیر ۱۵ دقیقه</strong>
              <span>وی‌باکس، VP، سی‌پی و جم کلش</span>
            </div>
          </div>

          <div className={`${styles.stageHud} ${styles.stageHudBottom}`}>
            <span className={`${styles.stageHudIcon} ${styles.stageHudIconGreen}`}>
              <Icon name="shield" />
            </span>
            <div className={styles.stageHudText}>
              <strong>تضمین ۱۰۰٪ امنیت اکانت</strong>
              <span>رمزنگاری اطلاعات و راهنمای 2FA</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 3-Step Quick-Start Journey (Shown when not filtering) ─── */}
      {!isFiltering && guides.length > 0 && (
        <section className={styles.journeySection} aria-labelledby="journey-title">
          <div className={styles.journeyHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <span className={styles.kickerDot} aria-hidden="true" />
                مسیر پیشنهادی شروع
              </span>
              <h2 id="journey-title" className={styles.journeyTitle}>
                نقشه راه خرید امن و سریع در ۳ گام
              </h2>
            </div>
            <p className={styles.journeySubtitle}>
              اگر اولین بار است از تایتان خرید می‌کنید، این سه مرحله شما را از آماده‌سازی اکانت تا
              تحویل فوری محصول همراهی می‌کند.
            </p>
          </div>

          <div className={styles.journeyGrid}>
            {QUICK_START_STEPS.map(item => (
              <div
                key={item.step}
                className={`${styles.journeyCard} ${styles.spotCard}`}
                style={{ '--card-accent': item.accent } as CSSProperties}
              >
                <div className={styles.journeyCardTop}>
                  <div className={styles.journeyIconWrap}>
                    <Image src={item.icon} alt="" aria-hidden="true" width={34} height={34} unoptimized />
                  </div>
                  <span className={styles.journeyBadge}>{item.badge}</span>
                  <span className={styles.journeyStepNum} aria-hidden="true">
                    {item.step}
                  </span>
                </div>

                <h3 className={styles.journeyCardTitle}>{item.title}</h3>
                <p className={styles.journeyCardDesc}>{item.description}</p>

                <div className={styles.journeyLinks}>
                  {item.links.map(link => (
                    <Link key={link.href} href={link.href} className={styles.journeyLinkPill}>
                      <span>{link.label}</span>
                      <Icon name="arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Interactive Category & Game Filter Deck ─── */}
      {guides.length > 0 && (
        <section className={styles.controlDeck} aria-label="فیلتر و دسته‌بندی آموزش‌ها">
          {/* Category Bento Pills */}
          <nav aria-label="دسته‌های آموزش" className={styles.categoryDeckGrid}>
            {GUIDE_CATEGORIES.map(cat => {
              const count = guides.filter(g => g.category === cat.key).length;
              if (count === 0) return null;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? 'all' : cat.key)}
                  className={`${styles.categoryDeckCard} ${styles.spotCard} ${isActive ? styles.categoryDeckCardActive : ''}`}
                  style={{ '--card-accent': cat.accent } as CSSProperties}
                  aria-pressed={isActive}
                >
                  <div className={styles.categoryDeckTop}>
                    <span className={styles.categoryDeckIcon}>
                      <Image src={cat.icon} alt="" aria-hidden="true" width={26} height={26} unoptimized />
                    </span>
                    <span className={styles.categoryDeckCount}>
                      {faNumber(count)} آموزش
                    </span>
                  </div>
                  <div className={styles.categoryDeckBody}>
                    <strong>{cat.title}</strong>
                    <span>{cat.kicker}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Game Filter Pills Row */}
          <div className={styles.gameFilterRow}>
            <div className={styles.gameFilterPills} role="tablist" aria-label="فیلتر بر اساس بازی">
              {GAME_FILTERS.map(gf => {
                const count = gameCounts[gf.key] ?? 0;
                if (gf.key !== 'all' && count === 0) return null;
                const isSelected = activeGame === gf.key;
                return (
                  <button
                    key={gf.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveGame(isSelected && gf.key !== 'all' ? 'all' : gf.key)}
                    className={`${styles.gameFilterBtn} ${isSelected ? styles.gameFilterBtnActive : ''}`}
                    style={{ '--filter-accent': gf.accent } as CSSProperties}
                  >
                    <Image
                      src={gf.icon}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      unoptimized
                      className={styles.gameFilterIcon}
                    />
                    <span>{gf.label}</span>
                    <span className={styles.gameFilterCount}>{faNumber(count)}</span>
                  </button>
                );
              })}
            </div>

            {isFiltering && (
              <div className={styles.activeFilterStatus}>
                <span>
                  نمایش <b>{faNumber(filteredGuides.length)}</b> از {faNumber(guides.length)} آموزش
                </span>
                <button type="button" onClick={resetFilters} className={styles.resetFilterBtn}>
                  <Icon name="x" />
                  <span>حذف فیلترها</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Guide Category Sections ─── */}
      {guides.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon} aria-hidden="true">
            <Icon name="sparkles" />
          </div>
          <h2>آموزش‌ها به‌زودی در این صفحه قرار می‌گیرند</h2>
          <p>در حال آماده‌سازی راهنماهای گام‌به‌گام خرید و فعال‌سازی محصولات هستیم.</p>
          <Link href="/store" className={styles.btnPrimary}>
            <span>مشاهده فروشگاه تایتان</span>
            <Icon name="arrow" />
          </Link>
        </div>
      ) : sections.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon} aria-hidden="true">
            <Icon name="search" />
          </div>
          <h2>آموزشی مطابق با فیلتر یا جستجوی شما پیدا نشد</h2>
          <p>
            عبارت دیگری را امتحان کنید یا فیلترهای انتخاب‌شده را پاک کنید تا همه راهنماها نمایش داده
            شوند.
          </p>
          <button type="button" onClick={resetFilters} className={styles.btnPrimary}>
            <span>نمایش همه آموزش‌ها ({faNumber(guides.length)})</span>
          </button>
        </div>
      ) : (
        sections.map(section => (
          <section
            key={section.key}
            id={section.key}
            className={styles.section}
            aria-labelledby={`${section.key}-title`}
            style={{ '--section-accent': section.accent } as CSSProperties}
          >
            <div className={styles.sectionBanner}>
              <div className={styles.sectionBannerRight}>
                <div className={styles.sectionIconBox} aria-hidden="true">
                  <Image src={section.icon} alt="" width={34} height={34} unoptimized />
                </div>
                <div className={styles.sectionHeadText}>
                  <div className={styles.sectionKickerRow}>
                    <span className={styles.sectionKickerBadge}>{section.kicker}</span>
                    <span className={styles.sectionTagBadge}>{section.badge}</span>
                  </div>
                  <h2 id={`${section.key}-title`}>{section.title}</h2>
                  <p>{section.intro}</p>
                </div>
              </div>

              <div className={styles.sectionBannerLeft}>
                <span className={styles.sectionCountPill}>
                  <b>{faNumber(section.guides.length)}</b>
                  <span>راهنمای تخصصی</span>
                </span>
              </div>
            </div>

            <div className={styles.grid}>
              {section.guides.map((guide, idx) => (
                <GuideCard
                  key={guide.slug}
                  guide={guide}
                  featured={section.key === 'purchase' && idx === 0 && !isFiltering}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
