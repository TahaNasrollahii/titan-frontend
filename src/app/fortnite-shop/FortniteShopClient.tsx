'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { Empty, ErrorState, Loading } from '@/components/ui/State';
import { faNumber } from '@/lib/format';
import {
  compareShopEntries,
  type FortniteShopData,
  getNextShopResetIso,
  type ShopEntry,
} from '@/lib/fortniteShop';

import './fortnite-shop.css';

export type QuickCategoryKey =
  | 'all'
  | 'outfit'
  | 'bundle'
  | 'emote'
  | 'pickaxe'
  | 'glider'
  | 'gear'
  | 'other';

interface QuickCategoryConfig {
  key: QuickCategoryKey;
  title: string;
  desc: string;
  iconName: string;
}

const QUICK_CATEGORIES: QuickCategoryConfig[] = [
  // ردیف ۱: ۴ آیتم
  {
    key: 'all',
    title: 'همه آیتم‌ها',
    desc: 'مشاهده کامل تمام آیتم‌ها و اسکین‌های شاپ امروز',
    iconName: 'grid',
  },
  {
    key: 'outfit',
    title: 'اسکین‌های بازی',
    desc: 'کاراکترها و اسکین‌های موجود در شاپ امروز',
    iconName: 'user',
  },
  {
    key: 'bundle',
    title: 'باندل‌های ویژه',
    desc: 'پک‌های چندتایی به همراه تخفیف ویژه',
    iconName: 'gift',
  },
  {
    key: 'emote',
    title: 'ایموت و دنس‌ها',
    desc: 'حرکات نمایشی، رقص‌ها و ایموت‌های بازی',
    iconName: 'sparkles',
  },

  // ردیف ۲: ۴ آیتم
  {
    key: 'pickaxe',
    title: 'پیککس و کلنگ',
    desc: 'کلنگ‌ها و ابزارهای استخراج و ضربه',
    iconName: 'pickaxe',
  },
  {
    key: 'glider',
    title: 'گلایدر و چترها',
    desc: 'گلایدرها و چترهای فرود بازی',
    iconName: 'parachute',
  },
  {
    key: 'gear',
    title: 'تجهیزات و رپ',
    desc: 'بک‌بلینگ‌ها و رپ‌های اسلحه و تجهیزات',
    iconName: 'bag',
  },
  {
    key: 'other',
    title: 'موزیک و ماشین',
    desc: 'ترک‌های جم، بدنه خودرو و سازهای موسیقی',
    iconName: 'music',
  },
];

const FALLBACK_ITEM_IMAGE = '/images/hero/characters/fortnite.webp';
const PAGE_CHUNK = 24;

function formatPersianShopDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function padPersianTwoDigits(val: number): string {
  return faNumber(Math.floor(val / 10)) + faNumber(val % 10);
}

/**
 * High-End Cybernetic Countdown Timer
 */
const ShopCountdownTimer = memo(function ShopCountdownTimer({
  resetsAt,
  onResetReached,
}: {
  resetsAt?: string;
  onResetReached: () => void;
}) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);

      if (resetsAt) {
        const targetMs = new Date(resetsAt).getTime();
        if (current >= targetMs + 3000) {
          onResetReached();
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resetsAt, onResetReached]);

  const targetResetIso = resetsAt || getNextShopResetIso(nowMs);
  const secondsUntilReset = Math.max(
    0,
    Math.floor((new Date(targetResetIso).getTime() - nowMs) / 1000),
  );
  const hoursLeft = Math.floor(secondsUntilReset / 3600);
  const minutesLeft = Math.floor((secondsUntilReset % 3600) / 60);
  const secondsLeft = secondsUntilReset % 60;

  return (
    <div className="fn-hero-side fn-cartoon-timer" aria-label="شمارش معکوس تا ریست بعدی آیتم شاپ">
      <div className="fn-timer-head">
        <span className="fn-timer-head-title">
          <span className="fn-timer-icon-wrap" aria-hidden="true">
            ⏱️
          </span>
          زمان تا چرخش شاپ
        </span>
        <span className="fn-timer-utc" dir="ltr">
          <span className="fn-timer-utc-star" aria-hidden="true">
            ★
          </span>
          00:00 UTC
        </span>
      </div>

      <div className="fn-timer-grid" role="timer" aria-live="off">
        <div className="fn-timer-cell fn-cell-hours">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(hoursLeft)}
          </span>
          <span className="fn-timer-lbl fn-lbl-hours">ساعت</span>
        </div>

        <div className="fn-timer-sep-wrap" aria-hidden="true">
          <span className="fn-timer-dot" />
          <span className="fn-timer-dot" />
        </div>

        <div className="fn-timer-cell fn-cell-minutes">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(minutesLeft)}
          </span>
          <span className="fn-timer-lbl fn-lbl-minutes">دقیقه</span>
        </div>

        <div className="fn-timer-sep-wrap" aria-hidden="true">
          <span className="fn-timer-dot" />
          <span className="fn-timer-dot" />
        </div>

        <div className="fn-timer-cell fn-cell-seconds">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(secondsLeft)}
          </span>
          <span className="fn-timer-lbl fn-lbl-seconds">ثانیه</span>
        </div>
      </div>

      <div className="fn-stats-bar">
        <span className="fn-stats-note">⚡ بروزرسانی لحظه‌ای شاپ</span>
        <span className="fn-live-status-dot">
          <span className="fn-live-dot" aria-hidden="true" /> فعال و زنده
        </span>
      </div>
    </div>
  );
});

const ShopItemCard = memo(function ShopItemCard({
  entry,
  priority,
  onInspectBundle,
}: {
  entry: ShopEntry;
  priority: boolean;
  onInspectBundle: (entry: ShopEntry) => void;
}) {
  const [imgSrc, setImgSrc] = useState(entry.image || FALLBACK_ITEM_IMAGE);

  useEffect(() => {
    setImgSrc(entry.image || FALLBACK_ITEM_IMAGE);
  }, [entry.image]);

  const showBundleList = entry.isBundle && entry.bundleItems.length > 0;

  const normalizedTile = (entry.tileSize || '').toLowerCase();
  const stageTileClass =
    imgSrc === FALLBACK_ITEM_IMAGE
      ? ''
      : normalizedTile.startsWith('size_4_x_') || normalizedTile.startsWith('size_5_x_')
        ? ' fn-card-stage--wide-4'
        : normalizedTile.startsWith('size_3_x_')
          ? ' fn-card-stage--wide-3'
          : '';

  return (
    <article
      className="fn-card"
      style={
        {
          '--rarity-color': entry.rarityColor,
        } as React.CSSProperties
      }
    >
      <div className="fn-card-top">
        <span className="fn-rarity-badge" title={`${entry.rarityFa} (${entry.rarityEn})`}>
          <span className="fn-rarity-dot" aria-hidden="true" />
          <span>
            {entry.rarityFa} · {entry.rarityEn}
          </span>
        </span>

        <div className="fn-card-flags">
          {entry.discountPercent > 0 && (
            <span className="fn-discount-pill">{faNumber(entry.discountPercent)}٪ تخفیف</span>
          )}
          {entry.banner && !entry.discountPercent && (
            <span className="fn-banner-pill" dir="ltr">
              {entry.banner}
            </span>
          )}
        </div>
      </div>

      <div className={`fn-card-stage${stageTileClass}`}>
        <Image
          src={imgSrc}
          alt={`${entry.name} — ${entry.typeFa} فورتنایت`}
          width={240}
          height={220}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          priority={priority}
          unoptimized
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="fn-card-img"
          onError={() => {
            if (imgSrc !== FALLBACK_ITEM_IMAGE) {
              setImgSrc(FALLBACK_ITEM_IMAGE);
            }
          }}
        />
      </div>

      {/* Glass Bottom Info Panel with Expandable Hover Reveal */}
      <div className="fn-card-panel">
        {/* Default visible: Item Name + V-Bucks Price */}
        <div className="fn-card-main-info">
          <h3 className="fn-card-title" title={entry.name} dir="auto">
            {entry.name}
          </h3>

          <div className="fn-price-wrap" title={`${faNumber(entry.finalPrice)} ویباکس`}>
            <span className="fn-vbuck-badge" aria-hidden="true">
              V
            </span>
            <div className="fn-price-nums">
              <span className="fn-price-current">{faNumber(entry.finalPrice)}</span>
              {entry.regularPrice > entry.finalPrice && (
                <span className="fn-price-old">{faNumber(entry.regularPrice)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Reveal: Extra info and Action buttons */}
        <div className="fn-card-reveal">
          <div className="fn-card-reveal-inner">
            <div className="fn-card-extra-meta">
              <span className="fn-type-tag">
                {entry.typeFa} {entry.sectionName ? `· ${entry.sectionName}` : ''}
              </span>
              {showBundleList && (
                <span className="fn-bundle-count-tag">
                  {faNumber(entry.bundleItems.length)} آیتم
                </span>
              )}
            </div>

            <div className="fn-card-actions">
              {showBundleList && (
                <button
                  type="button"
                  className="fn-bundle-popup-btn"
                  onClick={() => onInspectBundle(entry)}
                >
                  <span>آیتم‌های باندل</span>
                  <span className="fn-bundle-popup-arrow" aria-hidden="true">
                    ←
                  </span>
                </button>
              )}

              <Link href="/product/fortnite-vbucks" className="fn-buy-vbucks-btn">
                <Icon name="cart" /> خرید ویباکس
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

export default function FortniteShopClient({
  initialData,
}: {
  initialData: FortniteShopData | null;
}) {
  const [shop, setShop] = useState<FortniteShopData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialData ? null : 'دریافت اطلاعات آیتم شاپ فورتنایت با خطا مواجه شد.',
  );

  // Active quick category (Default is 'all' - all items)
  const [selectedCategory, setSelectedCategory] = useState<QuickCategoryKey>('all');

  // Pagination limit
  const [displayLimit, setDisplayLimit] = useState(PAGE_CHUNK);
  const [inspectedBundle, setInspectedBundle] = useState<ShopEntry | null>(null);

  const refreshingRef = useRef(false);

  const refreshShop = useCallback(async (forceFresh = false) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fortnite-shop${forceFresh ? '?fresh=1' : ''}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || 'خطا در برقراری ارتباط با سرور آیتم شاپ فورتنایت.');
      }
      const nextData = (await res.json()) as FortniteShopData;
      setShop(nextData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری آیتم شاپ فورتنایت.');
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  }, []);

  const handleResetReached = useCallback(() => {
    void refreshShop(true);
  }, [refreshShop]);

  // Close bundle modal on Escape
  useEffect(() => {
    if (!inspectedBundle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedBundle(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectedBundle]);

  // Reset pagination limit when category changes
  useEffect(() => {
    setDisplayLimit(PAGE_CHUNK);
  }, [selectedCategory]);

  // Interactive Cursor Light Tracker
  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--cursor-x', `${x}px`);
    el.style.setProperty('--cursor-y', `${y}px`);
    el.style.setProperty('--cursor-opacity', '1');
  }, []);

  const handleHeroMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--cursor-opacity', '0');
  }, []);

  // Category counts for quick access cards
  const categoryCounts = useMemo(() => {
    const counts: Record<QuickCategoryKey, number> = {
      all: 0,
      outfit: 0,
      bundle: 0,
      emote: 0,
      pickaxe: 0,
      glider: 0,
      gear: 0,
      other: 0,
    };
    if (!shop) return counts;

    const seenIds = new Set<string>();

    for (const sec of shop.sections) {
      for (const e of sec.entries) {
        if (!seenIds.has(e.id)) {
          seenIds.add(e.id);
          counts.all += 1;
        }

        if (e.category === 'outfit') counts.outfit += 1;
        else if (e.category === 'bundle' || e.isBundle) counts.bundle += 1;
        else if (e.category === 'emote') counts.emote += 1;
        else if (e.category === 'pickaxe') counts.pickaxe += 1;
        else if (e.category === 'glider') counts.glider += 1;
        else if (e.category === 'backpack' || e.category === 'wrap') {
          counts.gear += 1;
        } else {
          counts.other += 1;
        }
      }
    }
    return counts;
  }, [shop]);

  // Filtered entries according to selected quick category
  const filteredEntries = useMemo(() => {
    if (!shop) return [];
    const list: ShopEntry[] = [];

    for (const sec of shop.sections) {
      for (const entry of sec.entries) {
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'outfit') {
            if (entry.category !== 'outfit') continue;
          } else if (selectedCategory === 'bundle') {
            if (entry.category !== 'bundle' && !entry.isBundle) continue;
          } else if (selectedCategory === 'emote') {
            if (entry.category !== 'emote') continue;
          } else if (selectedCategory === 'pickaxe') {
            if (entry.category !== 'pickaxe') continue;
          } else if (selectedCategory === 'glider') {
            if (entry.category !== 'glider') continue;
          } else if (selectedCategory === 'gear') {
            if (entry.category !== 'backpack' && entry.category !== 'wrap') {
              continue;
            }
          } else if (selectedCategory === 'other') {
            if (
              entry.category === 'outfit' ||
              entry.category === 'bundle' ||
              entry.category === 'emote' ||
              entry.category === 'pickaxe' ||
              entry.category === 'glider' ||
              entry.category === 'backpack' ||
              entry.category === 'wrap'
            ) {
              continue;
            }
          }
        }

        list.push({
          ...entry,
          sectionName: entry.sectionName || sec.name,
        });
      }
    }

    // Deduplicate offerIds
    const seen = new Set<string>();
    const unique: ShopEntry[] = [];
    for (const it of list) {
      if (!seen.has(it.id)) {
        seen.add(it.id);
        unique.push(it);
      }
    }

    return unique.sort(compareShopEntries);
  }, [shop, selectedCategory]);

  const displayedEntries = useMemo(() => {
    return filteredEntries.slice(0, displayLimit);
  }, [filteredEntries, displayLimit]);

  const remainingCount = Math.max(0, filteredEntries.length - displayedEntries.length);

  const persianDate = shop ? formatPersianShopDate(shop.date) : '';

  const activeConfig =
    QUICK_CATEGORIES.find(c => c.key === selectedCategory) || QUICK_CATEGORIES[0];

  return (
    <div className="fn-shop-page reveal" style={{ '--d': 2 } as React.CSSProperties}>
      {/* Liquid Background Blobs (Liquid-glass atmosphere matching Titan) */}
      <div className="fn-liquid-bg" aria-hidden="true">
        <div className="fn-l-blob fn-blob-1" />
        <div className="fn-l-blob fn-blob-2" />
        <div className="fn-l-blob fn-blob-3" />
      </div>

      {/* Collab Hero Banner: Titan x Fortnite */}
      <section
        className="fn-hero"
        aria-labelledby="fn-shop-heading"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Interactive Mouse Cursor Glow Spotlight */}
        <div className="fn-hero-cursor-light" aria-hidden="true" />

        {/* Dynamic Ambient Aurora Background (Softly flows and breathes) */}
        <div className="fn-hero-ambient" aria-hidden="true">
          <div className="fn-ambient-glow fn-glow-cyan" />
          <div className="fn-ambient-glow fn-glow-indigo" />
          <div className="fn-ambient-glow fn-glow-ruby" />
          <div className="fn-ambient-glow fn-glow-teal" />
        </div>

        {/* Cinematic Game Background Artwork (Inspired by Titan Hero Banners) */}
        <div className="fn-hero-banner-bg" aria-hidden="true">
          <Image
            src="/images/games/fortnite-background.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="fn-hero-bg-img"
          />
          <div className="fn-hero-bg-overlay" />
        </div>

        <div className="fn-hero-content">
          {/* Official Collab Badge: Titan x Fortnite */}
          <div className="fn-collab-badge" title="همکاری رسمی تایتان و شاپ زنده فورتنایت">
            <div className="fn-collab-logos">
              <div className="fn-collab-img-wrap fn-titan-wrap">
                <Image
                  src="/titan-logo.webp"
                  alt="لوگوی تایتان"
                  width={38}
                  height={38}
                  className="fn-collab-img"
                  priority
                />
              </div>
              <span className="fn-collab-x" aria-hidden="true">
                ✕
              </span>
              <div className="fn-collab-img-wrap fn-fortnite-wrap">
                <Image
                  src="/images/glossy-fortnite-logo.webp"
                  alt="لوگوی فورتنایت"
                  width={36}
                  height={36}
                  className="fn-collab-img"
                  priority
                />
              </div>
            </div>
            <div className="fn-collab-divider" aria-hidden="true" />
            <div className="fn-collab-text">
              <div className="fn-collab-title-row">
                <span className="fn-collab-title-titan">TITAN</span>
                <span className="fn-collab-cross">✕</span>
                <span className="fn-collab-title-fn">FORTNITE</span>
              </div>
              <span className="fn-collab-sub">آیتم شاپ زنده · بروزرسانی رسمی</span>
            </div>
          </div>

          <div className="fn-hero-title-row">
            <h1 id="fn-shop-heading" className="fn-hero-title">
              آیتم شاپ امروز فورتنایت
            </h1>
            <span className="fn-live-pill">
              <span className="fn-live-dot" aria-hidden="true" />
              زنده و خودکار
            </span>
          </div>

          <div className="fn-date-row">
            {persianDate && (
              <span className="fn-date-chip">
                <Icon name="clock" /> {persianDate}
              </span>
            )}
          </div>

          <p className="fn-hero-desc">
            مشاهده لحظه‌ای کاتالوگ امروز با قیمت دقیق و خرید فوری و قانونی ویباکس از تایتان.
          </p>

          <div className="fn-hero-actions">
            <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
              <Icon name="cart" /> خرید فوری ویباکس
            </Link>
            <Link href="/store/fortnite" className="fn-cta-secondary">
              کروپک و بتل‌پس
            </Link>
          </div>
        </div>

        {/* Eye-Catching Countdown Timer */}
        <ShopCountdownTimer resetsAt={shop?.resetsAt} onResetReached={handleResetReached} />
      </section>

      {/* Error State */}
      {!shop && error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => {
            void refreshShop(true);
          }}
        />
      )}

      {/* Loading State */}
      {loading && !shop && <Loading label="در حال دریافت آیتم شاپ زنده فورتنایت" />}

      {/* Main Content: Quick Access + Filtered Item Grid */}
      {shop && (
        <>
          {/* Quick Access Categories Deck */}
          <section className="fn-cat-shortcuts" aria-label="دسترسی سریع به دسته‌بندی‌های آیتم شاپ">
            <div className="fn-shortcuts-header">
              <div className="fn-shortcuts-header-text">
                <h3>دسترسی سریع به دسته‌بندی‌ها</h3>
              </div>
              <span className="fn-shortcuts-hint">
                برای مشاهده آیتم‌ها، روی دسته‌بندی مورد نظر خود کلیک کنید:
              </span>
            </div>

            <div className="fn-shortcuts-grid">
              {QUICK_CATEGORIES.map(cat => {
                const count = categoryCounts[cat.key] ?? 0;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`fn-shortcut-card ${cat.key} ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.key)}
                    aria-pressed={isActive}
                  >
                    <div className="fn-shortcut-icon">
                      <Icon name={cat.iconName} />
                    </div>
                    <div className="fn-shortcut-text">
                      <strong className="fn-shortcut-title">{cat.title}</strong>
                      <span className="fn-shortcut-desc">{cat.desc}</span>
                    </div>
                    <span className="fn-shortcut-count">{faNumber(count)} آیتم</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active Category Header */}
          <section className="fn-view-header">
            <div className="fn-view-header-title">
              <span className="fn-view-dot" aria-hidden="true" />
              <h2>{activeConfig.title}</h2>
              <span className="fn-view-count-badge">
                {faNumber(filteredEntries.length)} آیتم در شاپ امروز
              </span>
            </div>
          </section>

          {/* Items Grid */}
          {filteredEntries.length === 0 ? (
            <Empty icon="search">
              آیتمی در این دسته‌بندی در شاپ امروز فورتنایت موجود نیست.
            </Empty>
          ) : (
            <div className="fn-grid-container">
              <div className="fn-grid">
                {displayedEntries.map((entry, idx) => (
                  <ShopItemCard
                    key={entry.id}
                    entry={entry}
                    priority={idx < 4}
                    onInspectBundle={setInspectedBundle}
                  />
                ))}
              </div>

              {/* Pagination & Load More */}
              {remainingCount > 0 && (
                <div className="fn-pagination-bar">
                  <div className="fn-progress-track" aria-hidden="true">
                    <div
                      className="fn-progress-fill"
                      style={{
                        width: `${Math.round((displayedEntries.length / filteredEntries.length) * 100)}%`,
                      }}
                    />
                  </div>

                  <span className="fn-pagination-text">
                    نمایش <strong>{faNumber(displayedEntries.length)}</strong> از{' '}
                    <strong>{faNumber(filteredEntries.length)}</strong> {activeConfig.title}
                  </span>

                  <div className="fn-pagination-actions">
                    <button
                      type="button"
                      className="fn-load-more-btn"
                      onClick={() => setDisplayLimit(prev => prev + PAGE_CHUNK)}
                    >
                      نمایش {faNumber(Math.min(PAGE_CHUNK, remainingCount))} آیتم بیشتر (+
                      {faNumber(remainingCount)} مورد دیگر)
                    </button>
                    {remainingCount > PAGE_CHUNK && (
                      <button
                        type="button"
                        className="fn-show-all-btn"
                        onClick={() => setDisplayLimit(filteredEntries.length)}
                      >
                        نمایش همه ({faNumber(filteredEntries.length)} مورد)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Conversion Banner */}
          <aside className="fn-bottom-cta" aria-label="خرید فوری ویباکس">
            <div className="fn-bottom-cta-text">
              <h2>ویباکس کافی برای خرید آیتم‌های انتخابی خود ندارید؟</h2>
              <p>
                شارژ مستقیم، قانونی و مطمئن ویباکس فورتنایت روی اکانت شما با کمترین کارمزد و تحویل فوری در
                فروشگاه تایتان.
              </p>
            </div>
            <div className="fn-hero-actions">
              <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
                <Icon name="cart" /> خرید فوری ویباکس
              </Link>
              <Link href="/store/fortnite" className="fn-cta-secondary">
                تمام محصولات فورتنایت
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Bundle Detail Popup Modal */}
      {inspectedBundle && (
        <div
          className="fn-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fn-drawer-title"
          onClick={() => setInspectedBundle(null)}
        >
          <div className="fn-drawer" onClick={e => e.stopPropagation()}>
            <div className="fn-drawer-head">
              <div className="fn-drawer-title-wrap">
                <span className="fn-drawer-badge">باندل بازی</span>
                <h3 id="fn-drawer-title" dir="auto">
                  {inspectedBundle.name}
                </h3>
              </div>
              <button
                type="button"
                className="fn-drawer-close"
                onClick={() => setInspectedBundle(null)}
                aria-label="بستن پنجره"
              >
                ✕
              </button>
            </div>

            <div className="fn-drawer-body">
              <div className="fn-drawer-meta-banner">
                <span>
                  شامل <strong>{faNumber(inspectedBundle.bundleItems.length)}</strong> آیتم داخل این پکیج:
                </span>
                {inspectedBundle.discountPercent > 0 && (
                  <span className="fn-discount-pill">
                    {faNumber(inspectedBundle.discountPercent)}٪ تخفیف روی باندل
                  </span>
                )}
              </div>

              <div className="fn-drawer-list">
                {inspectedBundle.bundleItems.map(sub => (
                  <div
                    key={`${sub.id}-${sub.typeEn}`}
                    className="fn-drawer-item"
                    style={{ '--rarity-sub-color': sub.rarityColor } as React.CSSProperties}
                  >
                    {sub.image && (
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        width={54}
                        height={54}
                        sizes="54px"
                        unoptimized
                        loading="lazy"
                        className="fn-drawer-item-img"
                      />
                    )}
                    <div className="fn-drawer-item-info">
                      <strong dir="auto">{sub.name}</strong>
                      <span className="fn-drawer-sub-type">
                        {sub.typeFa} ({sub.typeEn})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fn-drawer-foot">
              <div className="fn-price-wrap">
                <span className="fn-vbuck-badge" aria-hidden="true">
                  V
                </span>
                <div className="fn-price-nums">
                  <span className="fn-price-current">
                    {faNumber(inspectedBundle.finalPrice)} ویباکس
                  </span>
                  {inspectedBundle.regularPrice > inspectedBundle.finalPrice && (
                    <span className="fn-price-old">{faNumber(inspectedBundle.regularPrice)}</span>
                  )}
                </div>
              </div>

              <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
                خرید فوری ویباکس
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
