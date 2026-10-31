'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideCategory, GuideSummary } from '@/lib/api/types';
import { faNumber } from '@/lib/format';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import { GuideCard } from './GuideCard';
import { RanksGuideShowcase } from './RanksGuideShowcase';
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
    label: 'همه بازی‌ها',
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
    label: 'کالاف دیوتی',
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

const QUICK_SPOTLIGHTS = [
  {
    slug: 'how-to-buy',
    kicker: 'شروع سریع خرید',
    title: 'نحوه خرید و تحویل فوری محصولات',
    desc: 'مراحل انتخاب محصول، ثبت اطلاعات اکانت و پیگیری لحظه‌ای سفارش در تایتان',
    icon: '/icons/store.webp',
    accent: '#ff645a',
  },
  {
    slug: 'tournament-registration',
    kicker: 'مسابقات و جوایز',
    title: 'راهنمای ثبت‌نام و شرکت در تورنومنت‌ها',
    desc: 'نحوه ورود به براکت مسابقات، دریافت کد لابی و واریز جوایز نقدی',
    icon: '/icons/tournament.webp',
    accent: '#f59e0b',
  },
  {
    slug: 'ranks',
    kicker: '۵ سطح رقابتی',
    title: 'سیستم رنک‌بندی، امتیازات و XP تایتان',
    desc: 'مسیر ارتقا از برنز تا تایتان، نحوه کسب امتیاز در مسابقات و نشان‌های افتخار',
    icon: '/icons/sparkles.svg',
    accent: '#9d6fff',
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
  const [activeCategory, setActiveCategory] = useState<GuideCategory | 'all'>('purchase');

  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace('#', '');
      const matched = GUIDE_CATEGORIES.find(c => c.key === rawHash);
      if (matched) {
        setActiveCategory(matched.key);
      } else if (rawHash === 'ranks-guide') {
        setActiveCategory('tournament');
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearchOrGameFilter = normalizedQuery.length > 0 || activeGame !== 'all';

  // When searching by text or filtering by a specific game, search across all categories
  // unless the user explicitly filtered a category that also has results.
  const effectiveCategory: GuideCategory | 'all' = useMemo(() => {
    if (activeCategory === 'all') return 'all';
    if (!isSearchOrGameFilter) return activeCategory;

    const hasMatchInActiveCategory = guides.some(guide => {
      if (guide.category !== activeCategory) return false;
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

    return hasMatchInActiveCategory ? activeCategory : 'all';
  }, [activeCategory, activeGame, guides, isSearchOrGameFilter, normalizedQuery]);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      if (effectiveCategory !== 'all' && guide.category !== effectiveCategory) {
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
  }, [guides, effectiveCategory, activeGame, normalizedQuery]);

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

  useSpotlight(`.${styles.heroStage}, .${styles.spotCard}`, [
    effectiveCategory,
    activeGame,
    normalizedQuery,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveGame('all');
    setActiveCategory('purchase');
  };

  const handleSelectGame = (gameKey: string) => {
    const nextGame = activeGame === gameKey && gameKey !== 'all' ? 'all' : gameKey;
    setActiveGame(nextGame);
    if (nextGame === 'general') {
      setActiveCategory('all');
    } else if (nextGame !== 'all') {
      setActiveCategory('all');
    } else if (activeCategory === 'all') {
      setActiveCategory('purchase');
    }
  };

  return (
    <>
      {/* ─── Hero Section with 3D Character Stage & Upgraded Command Deck ─── */}
      <header className={styles.hubHeader}>
        <div className={styles.heroAmbientGlow} aria-hidden="true" />
        <div className={styles.heroGridMask} aria-hidden="true" />

        <div className={styles.hubHeroSplit}>
          <div className={styles.hubHeroMain}>
            <div className={styles.hubHeaderTitles}>
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

              <h1 className={styles.hubTitle}>
                {title}؛ <span className={styles.gradientText}>سریع، امن و قدم‌به‌قدم</span>
              </h1>
              <p className={styles.hubSubtitle}>
                دسته‌بندی یا بازی مورد نظر خود را انتخاب کنید تا فقط آموزش‌های مرتبط با همان بخش را به‌صورت خلاصه و گام‌به‌گام ببینید.
              </p>
            </div>

            {/* Search Input */}
            <div className={styles.hubSearchBox} role="search" aria-label="جستجو در آموزش‌ها">
              <span className={styles.hubSearchIcon} aria-hidden="true">
                <Icon name="search" />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="جستجو در آموزش‌ها (مثلاً: وی‌باکس، سوپرسل، تورنومنت، رنک...)"
                aria-label="جستجو در عنوان یا متن آموزش‌ها"
                className={styles.hubSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.hubSearchClear}
                  aria-label="پاک کردن جستجو"
                >
                  <Icon name="x" />
                </button>
              )}
            </div>
          </div>

          {/* 3D Character & Game Emblem Visual Stage */}
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

            <div className={`${styles.stageOrbit} ${styles.stageOrbitA}`}>
              <Image src="/images/glossy-fortnite-logo.webp" alt="" width={64} height={64} draggable={false} />
            </div>
            <div className={`${styles.stageOrbit} ${styles.stageOrbitB}`}>
              <Image src="/images/glossy-valorant-logo.webp" alt="" width={60} height={60} draggable={false} />
            </div>
            <div className={`${styles.stageOrbit} ${styles.stageOrbitC}`}>
              <Image src="/images/glossy-cod-logo.webp" alt="" width={56} height={56} draggable={false} />
            </div>
            <div className={`${styles.stageOrbit} ${styles.stageOrbitD}`}>
              <Image src="/images/products/vbucks.webp" alt="" width={58} height={58} draggable={false} />
            </div>
          </div>
        </div>

        {/* ─── Upgraded Two-Tier Command Dock (Categories + Game Filter) ─── */}
        {guides.length > 0 && (
          <div className={styles.hubCommandDock}>
            {/* Tier 1: Interactive 4-Category Bento Deck */}
            <div className={styles.hubDeckGroup}>
              <div className={styles.hubDeckHeader}>
                <span className={styles.hubDeckLabel}>
                  <Icon name="grid" />
                  <span>دسته‌بندی آموزش‌ها</span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory(effectiveCategory === 'all' ? 'purchase' : 'all')
                  }
                  className={`${styles.hubShowAllToggle} ${
                    effectiveCategory === 'all' ? styles.hubShowAllToggleActive : ''
                  }`}
                >
                  <span>
                    {effectiveCategory === 'all'
                      ? 'بازگشت به نمای دسته‌بندی‌شده'
                      : `نمایش یکجای همه (${faNumber(guides.length)})`}
                  </span>
                </button>
              </div>

              <nav aria-label="دسته‌بندی آموزش‌ها" className={styles.hubCategoryDeckGrid}>
                {GUIDE_CATEGORIES.map((cat, idx) => {
                  const count = guides.filter(g => g.category === cat.key).length;
                  if (count === 0) return null;
                  const isActive = effectiveCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.key);
                        if (activeGame === 'general' && cat.key !== 'tournament' && cat.key !== 'site') {
                          setActiveGame('all');
                        }
                      }}
                      className={`${styles.hubCategoryCard} ${
                        isActive ? styles.hubCategoryCardActive : ''
                      }`}
                      style={{ '--tab-accent': cat.accent } as CSSProperties}
                    >
                      <div className={styles.hubCategoryCardTop}>
                        <div className={styles.hubCategoryIconWrap}>
                          <Image
                            src={cat.icon}
                            alt=""
                            aria-hidden="true"
                            width={24}
                            height={24}
                            unoptimized
                          />
                        </div>
                        <span className={styles.hubCategoryCountPill}>
                          {faNumber(count)} آموزش
                        </span>
                      </div>

                      <div className={styles.hubCategoryCardBody}>
                        <div className={styles.hubCategoryTitleRow}>
                          <span className={styles.hubCategoryStepNum}>
                            {faNumber(idx + 1)}
                          </span>
                          <strong>{cat.shortTitle}</strong>
                        </div>
                        <p>{cat.badge}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tier 2: Sleek Game Filter Strip */}
            <div className={styles.hubGameBar}>
              <span className={styles.hubGameBarLabel}>
                <Icon name="sparkles" />
                <span>فیلتر بازی:</span>
              </span>

              <div
                className={styles.gameFilterPills}
                role="tablist"
                aria-label="فیلتر بر اساس بازی"
              >
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
                      onClick={() => handleSelectGame(gf.key)}
                      className={`${styles.gameFilterBtn} ${
                        isSelected ? styles.gameFilterBtnActive : ''
                      }`}
                      style={{ '--filter-accent': gf.accent } as CSSProperties}
                    >
                      <Image
                        src={gf.icon}
                        alt=""
                        aria-hidden="true"
                        width={18}
                        height={18}
                        unoptimized
                        className={styles.gameFilterIcon}
                      />
                      <span>{gf.label}</span>
                      <span className={styles.gameFilterCount}>{faNumber(count)}</span>
                    </button>
                  );
                })}
              </div>

              {isSearchOrGameFilter && (
                <div className={styles.activeFilterStatus}>
                  <span>
                    <b>{faNumber(filteredGuides.length)}</b> نتیجه
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={styles.resetFilterBtn}
                  >
                    <Icon name="x" />
                    <span>پاک کردن فیلتر</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── 3-Card Featured Quick-Start Spotlight (Only when not searching) ─── */}
      {!isSearchOrGameFilter && guides.length > 0 && (
        <section className={styles.spotlightSection} aria-label="پرمخاطب‌ترین آموزش‌ها">
          <div className={styles.spotlightGrid}>
            {QUICK_SPOTLIGHTS.map(item => (
              <Link
                key={item.slug}
                href={`/guides/${item.slug}`}
                className={`${styles.spotlightCard} ${styles.spotCard}`}
                style={{ '--card-accent': item.accent } as CSSProperties}
              >
                <div className={styles.spotlightIconBox} aria-hidden="true">
                  <Image src={item.icon} alt="" width={26} height={26} unoptimized />
                </div>
                <div className={styles.spotlightBody}>
                  <span className={styles.spotlightKicker}>{item.kicker}</span>
                  <strong className={styles.spotlightTitle}>{item.title}</strong>
                  <p className={styles.spotlightDesc}>{item.desc}</p>
                </div>
                <span className={styles.spotlightArrow} aria-hidden="true">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Focused Guide Explorer Stage ─── */}
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
          <p>عبارت دیگری را امتحان کنید یا فیلترها را پاک کنید.</p>
          <button type="button" onClick={resetFilters} className={styles.btnPrimary}>
            <span>نمایش همه آموزش‌ها ({faNumber(guides.length)})</span>
          </button>
        </div>
      ) : (
        <div className={styles.explorerWorkspace}>
          {/* Ranks 1-5 Progression Showcase: Shown when on Tournament tab or searching ranks */}
          {(effectiveCategory === 'tournament' ||
            (normalizedQuery &&
              'رنک امتیاز برنز نقره طلا پلاتینیوم تایتان لول xp سیدبندی تورنومنت'.includes(
                normalizedQuery,
              ))) && <RanksGuideShowcase variant="hub" />}

          {sections.map(section => (
            <section
              key={section.key}
              id={section.key}
              className={styles.section}
              aria-label={section.title}
              style={{ '--section-accent': section.accent } as CSSProperties}
            >
              <div className={styles.bentoGrid}>
                {section.guides.map((guide, idx) => (
                  <GuideCard
                    key={guide.slug}
                    guide={guide}
                    index={idx + 1}
                    featured={idx === 0 && section.guides.length % 2 === 1}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Bottom Category Switcher Bar when viewing a single category */}
          {effectiveCategory !== 'all' && !isSearchOrGameFilter && (
            <div className={styles.bottomCategoryBar}>
              <div className={styles.bottomCategoryInfo}>
                <span>در حال مشاهده بخش:</span>
                <strong>
                  {GUIDE_CATEGORIES.find(c => c.key === effectiveCategory)?.title}
                </strong>
              </div>

              <div className={styles.bottomCategoryActions}>
                {GUIDE_CATEGORIES.map(cat => {
                  if (cat.key === effectiveCategory) return null;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.key);
                        window.scrollTo({ top: 280, behavior: 'smooth' });
                      }}
                      className={styles.bottomCatPill}
                      style={{ '--tab-accent': cat.accent } as CSSProperties}
                    >
                      <Image src={cat.icon} alt="" width={16} height={16} unoptimized />
                      <span>{cat.shortTitle}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={styles.bottomCatAllBtn}
                >
                  <span>نمایش همه ({faNumber(guides.length)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
