'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useMemo, useState } from 'react';

import { Icon } from '@/components/Icons';
import type { GuideCategory, GuideSummary } from '@/lib/api/types';
import { faNumber } from '@/lib/format';

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

  const resetFilters = () => {
    setSearchQuery('');
    setActiveGame('all');
    setActiveCategory('all');
  };

  return (
    <>
      {/* ─── Clean, Focused Header & Filter Bar ─── */}
      <header className={styles.hubHeader}>
        <div className={styles.hubHeaderTop}>
          <div className={styles.hubHeaderTitles}>
            <h1 className={styles.hubTitle}>{title}</h1>
            <p className={styles.hubSubtitle}>
              راهنمای گام‌به‌گام خرید محصولات، اتصال اکانت بازی‌ها، شرکت در تورنومنت‌ها و سیستم رنک‌بندی تایتان
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

        {/* Category Filter Tabs */}
        {guides.length > 0 && (
          <div className={styles.hubFilterBar}>
            <nav aria-label="دسته‌بندی آموزش‌ها" className={styles.hubCategoryTabs}>
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`${styles.hubCatTab} ${activeCategory === 'all' ? styles.hubCatTabActive : ''}`}
              >
                <span>همه دسته‌ها</span>
                <span className={styles.hubCatCount}>{faNumber(guides.length)}</span>
              </button>
              {GUIDE_CATEGORIES.map(cat => {
                const count = guides.filter(g => g.category === cat.key).length;
                if (count === 0) return null;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(isActive ? 'all' : cat.key)}
                    className={`${styles.hubCatTab} ${isActive ? styles.hubCatTabActive : ''}`}
                    style={{ '--tab-accent': cat.accent } as CSSProperties}
                  >
                    <Image src={cat.icon} alt="" aria-hidden="true" width={18} height={18} unoptimized />
                    <span>{cat.shortTitle}</span>
                    <span className={styles.hubCatCount}>{faNumber(count)}</span>
                  </button>
                );
              })}
            </nav>

            {/* Game Filter Pills */}
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
                        width={18}
                        height={18}
                        unoptimized
                        className={styles.gameFilterIcon}
                      />
                      <span>{gf.label}</span>
                    </button>
                  );
                })}
              </div>

              {isFiltering && (
                <div className={styles.activeFilterStatus}>
                  <span>
                    <b>{faNumber(filteredGuides.length)}</b> آموزش
                  </span>
                  <button type="button" onClick={resetFilters} className={styles.resetFilterBtn}>
                    <Icon name="x" />
                    <span>پاک کردن فیلتر</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

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
          <p>عبارت دیگری را امتحان کنید یا فیلترها را پاک کنید.</p>
          <button type="button" onClick={resetFilters} className={styles.btnPrimary}>
            <span>نمایش همه آموزش‌ها ({faNumber(guides.length)})</span>
          </button>
        </div>
      ) : (
        <>
          {(activeCategory === 'all' || activeCategory === 'tournament') &&
            (activeGame === 'all' || activeGame === 'general') &&
            (!normalizedQuery ||
              'رنک امتیاز برنز نقره طلا پلاتینیوم تایتان لول xp سیدبندی تورنومنت'.includes(
                normalizedQuery,
              )) && <RanksGuideShowcase variant="hub" />}

          {sections.map(section => (
            <section
              key={section.key}
              id={section.key}
              className={styles.section}
              aria-labelledby={`${section.key}-title`}
              style={{ '--section-accent': section.accent } as CSSProperties}
            >
              <div className={styles.sectionSimpleHeader}>
                <div className={styles.sectionSimpleTitleWrap}>
                  <Image src={section.icon} alt="" width={24} height={24} unoptimized />
                  <h2 id={`${section.key}-title`}>{section.title}</h2>
                </div>
                <span className={styles.sectionSimpleCount}>
                  {faNumber(section.guides.length)} آموزش
                </span>
              </div>

              <div className={styles.grid}>
                {section.guides.map(guide => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
