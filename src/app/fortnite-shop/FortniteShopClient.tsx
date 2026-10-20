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
  type ShopFilterCategory,
  type ShopSection,
} from '@/lib/fortniteShop';

import './fortnite-shop.css';

const FILTER_TABS: { key: ShopFilterCategory; label: string }[] = [
  { key: 'all', label: 'همه آیتم‌ها' },
  { key: 'bundle', label: 'باندل‌ها (Bundles)' },
  { key: 'outfit', label: 'اسکین‌ها (Outfits)' },
  { key: 'emote', label: 'ایموت‌ها (Emotes)' },
  { key: 'pickaxe', label: 'پیککس‌ها (Pickaxes)' },
  { key: 'backpack', label: 'بک‌بلینگ (Back Blings)' },
  { key: 'glider', label: 'گلایدر (Gliders)' },
  { key: 'wrap', label: 'رپ (Wraps)' },
  { key: 'car', label: 'خودرو (Vehicles)' },
  { key: 'instrument', label: 'سازها (Instruments)' },
  { key: 'track', label: 'موزیک‌ها (Jam Tracks)' },
  { key: 'other', label: 'سایر آیتم‌ها' },
];

const FALLBACK_ITEM_IMAGE = '/images/hero/characters/fortnite.webp';
const INITIAL_SECTION_LIMIT = 12;
const LOAD_MORE_STEP = 24;

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

function formatUtcShopDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
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
 * Isolated countdown component so ticking every second only re-renders the 3 timer cells,
 * never re-rendering the item grid on mobile devices.
 */
const ShopCountdownTimer = memo(function ShopCountdownTimer({
  resetsAt,
  totalEntries,
  sectionsCount,
  onResetReached,
}: {
  resetsAt?: string;
  totalEntries?: number;
  sectionsCount?: number;
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
    <div className="fn-hero-side" aria-label="شمارش معکوس تا ریست بعدی آیتم شاپ">
      <div className="fn-timer-head">
        <span>
          <Icon name="clock" /> زمان باقی‌مانده تا ریست بعدی شاپ
        </span>
        <span className="fn-timer-utc" dir="ltr">
          00:00 UTC
        </span>
      </div>

      <div className="fn-timer-grid" role="timer" aria-live="off">
        <div className="fn-timer-cell">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(hoursLeft)}
          </span>
          <span className="fn-timer-lbl">ساعت</span>
        </div>
        <div className="fn-timer-cell">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(minutesLeft)}
          </span>
          <span className="fn-timer-lbl">دقیقه</span>
        </div>
        <div className="fn-timer-cell">
          <span className="fn-timer-val" suppressHydrationWarning>
            {padPersianTwoDigits(secondsLeft)}
          </span>
          <span className="fn-timer-lbl">ثانیه</span>
        </div>
      </div>

      <div className="fn-stats-bar">
        <span>
          تعداد کل آیتم‌های امروز:{' '}
          <strong>{totalEntries != null ? faNumber(totalEntries) : '—'}</strong>
        </span>
        <span>
          کالکشن‌های فعال: <strong>{sectionsCount != null ? faNumber(sectionsCount) : '—'}</strong>
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

      <div className="fn-card-body">
        <div className="fn-card-meta">
          <span className="fn-type-tag">
            {entry.typeFa} ({entry.typeEn})
            {entry.sectionName ? ` · ${entry.sectionName}` : ''}
          </span>
          {showBundleList && (
            <span className="fn-bundle-count-tag">
              {faNumber(entry.bundleItems.length)} آیتم
            </span>
          )}
        </div>

        <h3 className="fn-card-title" title={entry.name} dir="auto">
          {entry.name}
        </h3>

        {showBundleList && (
          <button
            type="button"
            className="fn-bundle-popup-btn"
            onClick={() => onInspectBundle(entry)}
          >
            <span>مشاهده آیتم‌های باندل ({faNumber(entry.bundleItems.length)} مورد)</span>
            <span className="fn-bundle-popup-arrow" aria-hidden="true">
              ←
            </span>
          </button>
        )}

        <div className="fn-card-foot">
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

          <Link href="/product/fortnite-vbucks" className="fn-buy-vbucks-btn">
            خرید ویباکس
          </Link>
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

  const [selectedCategory, setSelectedCategory] = useState<ShopFilterCategory>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedBundle, setInspectedBundle] = useState<ShopEntry | null>(null);
  const [visiblePerSection, setVisiblePerSection] = useState<Record<string, number>>({});

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

  const categoryCounts = useMemo(() => {
    const counts: Record<ShopFilterCategory, number> = {
      all: 0,
      bundle: 0,
      outfit: 0,
      emote: 0,
      pickaxe: 0,
      backpack: 0,
      glider: 0,
      wrap: 0,
      car: 0,
      instrument: 0,
      track: 0,
      other: 0,
    };
    if (!shop) return counts;
    for (const sec of shop.sections) {
      for (const entry of sec.entries) {
        counts.all += 1;
        counts[entry.category] = (counts[entry.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [shop]);

  const filteredSections = useMemo<ShopSection[]>(() => {
    if (!shop) return [];
    const q = searchQuery.trim().toLowerCase();

    const matchesFilter = (entry: ShopEntry, sec: ShopSection) => {
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
        return false;
      }
      if (onlyDiscounted && entry.discountAmount <= 0) {
        return false;
      }
      if (q) {
        const matchEntry =
          entry.name.toLowerCase().includes(q) ||
          entry.typeEn.toLowerCase().includes(q) ||
          entry.typeFa.includes(q) ||
          entry.rarityEn.toLowerCase().includes(q) ||
          entry.rarityFa.includes(q) ||
          sec.name.toLowerCase().includes(q) ||
          (sec.nameFa && sec.nameFa.includes(q)) ||
          entry.bundleItems.some(sub => sub.name.toLowerCase().includes(q));
        if (!matchEntry) return false;
      }
      return true;
    };

    if (selectedSectionId !== 'all') {
      return shop.sections
        .filter(sec => sec.id === selectedSectionId)
        .map(sec => ({
          ...sec,
          entries: sec.entries.filter(e => matchesFilter(e, sec)).sort(compareShopEntries),
        }))
        .filter(sec => sec.entries.length > 0);
    }

    const allMatching: ShopEntry[] = [];
    for (const sec of shop.sections) {
      for (const entry of sec.entries) {
        if (matchesFilter(entry, sec)) {
          allMatching.push({
            ...entry,
            sectionName: entry.sectionName || sec.name,
          });
        }
      }
    }

    allMatching.sort(compareShopEntries);

    const priorityGroups: {
      id: string;
      name: string;
      nameFa: string;
      match: (e: ShopEntry) => boolean;
    }[] = [
      {
        id: 'priority-bundles',
        name: 'باندل‌ها',
        nameFa: 'Bundles',
        match: e => e.category === 'bundle',
      },
      {
        id: 'priority-outfits',
        name: 'اسکین‌ها',
        nameFa: 'Outfits',
        match: e => e.category === 'outfit',
      },
      {
        id: 'priority-emotes',
        name: 'ایموت‌ها',
        nameFa: 'Emotes',
        match: e => e.category === 'emote',
      },
      {
        id: 'priority-pickaxes',
        name: 'پیککس‌ها',
        nameFa: 'Pickaxes',
        match: e => e.category === 'pickaxe',
      },
      {
        id: 'priority-gear',
        name: 'بک‌بلینگ، گلایدر و رپ',
        nameFa: 'Back Blings, Gliders & Wraps',
        match: e => e.category === 'backpack' || e.category === 'glider' || e.category === 'wrap',
      },
      {
        id: 'priority-vehicles-instruments',
        name: 'خودرو، سازها و سایر آیتم‌ها',
        nameFa: 'Vehicles, Instruments & More',
        match: e => e.category === 'car' || e.category === 'instrument' || e.category === 'other',
      },
      {
        id: 'priority-tracks',
        name: 'موزیک‌ها',
        nameFa: 'Jam Tracks',
        match: e => e.category === 'track',
      },
    ];

    return priorityGroups
      .map((group, idx) => ({
        id: group.id,
        name: group.name,
        nameFa: group.nameFa,
        rank: 100 - idx,
        index: idx,
        entries: allMatching.filter(group.match),
      }))
      .filter(sec => sec.entries.length > 0);
  }, [shop, selectedSectionId, selectedCategory, onlyDiscounted, searchQuery]);

  const visibleItemCount = useMemo(
    () => filteredSections.reduce((sum, s) => sum + s.entries.length, 0),
    [filteredSections],
  );

  const persianDate = shop ? formatPersianShopDate(shop.date) : '';
  const utcDate = shop ? formatUtcShopDate(shop.date) : '';

  const showMoreInSection = (secId: string, totalInSec: number) => {
    setVisiblePerSection(prev => {
      const current = prev[secId] ?? INITIAL_SECTION_LIMIT;
      return { ...prev, [secId]: Math.min(totalInSec, current + LOAD_MORE_STEP) };
    });
  };

  return (
    <div className="fn-shop-page reveal" style={{ '--d': 2 } as React.CSSProperties}>
      {/* Hero Banner */}
      <section className="fn-hero spot" aria-labelledby="fn-shop-heading">
        <div className="fn-hero-content">
          <div className="fn-hero-title-row">
            <h1 id="fn-shop-heading" className="fn-hero-title">
              آیتم شاپ فورتنایت
            </h1>
            <span className="fn-live-pill">
              <span className="fn-live-dot" aria-hidden="true" />
              بروزرسانی زنده و خودکار
            </span>
          </div>

          <div className="fn-date-row">
            {persianDate && (
              <span className="fn-date-chip">
                <Icon name="clock" /> {persianDate}
              </span>
            )}
            {utcDate && (
              <span className="fn-date-chip" dir="ltr">
                {utcDate} (00:00 UTC)
              </span>
            )}
          </div>

          <p className="fn-hero-desc">
            مشاهده لحظه‌ای تمامی باندل‌ها، اسکین‌ها، ایموت‌ها و آیتم‌های امروز فورتنایت همراه با قیمت دقیق ویباکس.
            برای خرید هر آیتم یا باندل در بازی، همین حالا ویباکس قانونی و فوری را با بهترین قیمت از تایتان تهیه کنید.
          </p>

          <div className="fn-hero-actions">
            <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
              <Icon name="cart" /> خرید ویباکس فورتنایت
            </Link>
            <Link href="/store/fortnite" className="fn-cta-secondary">
              مشاهده کروپک و بتل‌پس فورتنایت
            </Link>
          </div>
        </div>

        {/* Isolated Live Countdown to 00:00 UTC */}
        <ShopCountdownTimer
          resetsAt={shop?.resetsAt}
          totalEntries={shop?.totalEntries}
          sectionsCount={shop?.sections.length}
          onResetReached={handleResetReached}
        />
      </section>

      {/* Error State if API is unavailable */}
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

      {/* Shop Controls & Sections */}
      {shop && (
        <>
          <section className="fn-controls" aria-label="فیلتر و جستجوی آیتم شاپ">
            <div className="fn-controls-top">
              <div className="fn-search-box" role="search">
                <Icon name="search" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام اسکین، باندل، ایموت یا کالکشن..."
                  aria-label="جستجوی آیتم در شاپ فورتنایت"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="fn-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="پاک کردن جستجو"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="fn-Quick-Toggles">
                <button
                  type="button"
                  className={`fn-toggle-pill ${onlyDiscounted ? 'active' : ''}`}
                  onClick={() => setOnlyDiscounted(v => !v)}
                >
                  <Icon name="flame" /> فقط تخفیف‌دارها
                </button>
                {(selectedCategory !== 'all' || selectedSectionId !== 'all' || onlyDiscounted || searchQuery) && (
                  <button
                    type="button"
                    className="fn-toggle-pill"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSectionId('all');
                      setOnlyDiscounted(false);
                      setSearchQuery('');
                    }}
                  >
                    حذف فیلترها ({faNumber(visibleItemCount)})
                  </button>
                )}
              </div>
            </div>

            {/* Item Type Filter Tabs */}
            <div className="fn-filter-scroll" role="tablist" aria-label="دسته‌بندی آیتم‌ها">
              {FILTER_TABS.map(tab => {
                const count = categoryCounts[tab.key] ?? 0;
                if (tab.key !== 'all' && count === 0) return null;
                const active = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`fn-filter-btn ${active ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(tab.key)}
                  >
                    <span>{tab.label}</span>
                    <span className="fn-filter-count">{faNumber(count)}</span>
                  </button>
                );
              })}
            </div>

            {/* Section Quick Filter Pills */}
            {shop.sections.length > 1 && (
              <div className="fn-sections-nav" aria-label="فیلتر بر اساس کالکشن‌های شاپ">
                <span className="fn-sections-nav-label">کالکشن‌ها:</span>
                <button
                  type="button"
                  className={`fn-sec-pill ${selectedSectionId === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedSectionId('all')}
                >
                  همه (به ترتیب اولویت) <small>({faNumber(shop.totalEntries)})</small>
                </button>
                {shop.sections.map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    className={`fn-sec-pill ${selectedSectionId === sec.id ? 'active' : ''}`}
                    onClick={() => setSelectedSectionId(prev => (prev === sec.id ? 'all' : sec.id))}
                  >
                    <span dir="auto">{sec.name}</span>
                    <small>({faNumber(sec.entries.length)})</small>
                  </button>
                ))}
              </div>
            )}
          </section>

          {filteredSections.length === 0 ? (
            <Empty icon="search">
              آیتمی با فیلتر یا عبارت جستجوی شما در شاپ امروز پیدا نشد.
            </Empty>
          ) : (
            filteredSections.map((section, secIdx) => {
              const isFilteredView =
                selectedCategory !== 'all' ||
                selectedSectionId !== 'all' ||
                Boolean(searchQuery.trim()) ||
                onlyDiscounted;
              const limit = isFilteredView
                ? Math.max(24, visiblePerSection[section.id] ?? 24)
                : (visiblePerSection[section.id] ?? INITIAL_SECTION_LIMIT);
              const displayedEntries = section.entries.slice(0, limit);
              const remainingCount = Math.max(0, section.entries.length - displayedEntries.length);

              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="fn-section"
                  aria-labelledby={`sec-title-${section.id}`}
                >
                  <header className="fn-section-header">
                    <div className="fn-section-title-wrap">
                      <h2 id={`sec-title-${section.id}`} className="fn-section-title">
                        <span className="fn-section-dot" aria-hidden="true" />
                        <span dir="auto">{section.name}</span>
                      </h2>
                      {section.nameFa && <span className="fn-section-fa">{section.nameFa}</span>}
                    </div>
                    <span className="fn-section-count">{faNumber(section.entries.length)} آیتم</span>
                  </header>

                  <div className="fn-grid">
                    {displayedEntries.map((entry, entryIdx) => (
                      <ShopItemCard
                        key={entry.id}
                        entry={entry}
                        priority={secIdx === 0 && entryIdx < 4}
                        onInspectBundle={setInspectedBundle}
                      />
                    ))}
                  </div>

                  {remainingCount > 0 && (
                    <div className="fn-load-more-wrap">
                      <button
                        type="button"
                        className="fn-load-more-btn"
                        onClick={() => showMoreInSection(section.id, section.entries.length)}
                      >
                        نمایش آیتم‌های بیشتر در «{section.name}» (+{faNumber(remainingCount)} مورد)
                      </button>
                    </div>
                  )}
                </section>
              );
            })
          )}

          {/* Bottom V-Bucks Call to Action */}
          <aside className="fn-bottom-cta spot" aria-label="خرید ویباکس فورتنایت">
            <div className="fn-bottom-cta-text">
              <h2>ویباکس کافی برای خرید آیتم‌های امروز ندارید؟</h2>
              <p>
                شارژ سریع، قانونی و ارزان ویباکس فورتنایت، کروپک ماهانه و بتل‌پس با گارانتی کامل و تحویل فوری در فروشگاه تایتان.
              </p>
            </div>
            <div className="fn-hero-actions">
              <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
                <Icon name="cart" /> خرید فوری ویباکس
              </Link>
              <Link href="/store/fortnite" className="fn-cta-secondary">
                همه محصولات فورتنایت
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Bundle Items Modal / Drawer */}
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
              <h3 id="fn-drawer-title">
                اقلام داخل باندل: <span dir="auto">{inspectedBundle.name}</span>
              </h3>
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
              <div className="fn-drawer-list">
                {inspectedBundle.bundleItems.map(sub => (
                  <div key={`${sub.id}-${sub.typeEn}`} className="fn-drawer-item">
                    {sub.image && (
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        width={48}
                        height={48}
                        sizes="48px"
                        unoptimized
                        loading="lazy"
                        className="fn-drawer-item-img"
                      />
                    )}
                    <div className="fn-drawer-item-info">
                      <strong dir="auto">{sub.name}</strong>
                      <small>
                        {sub.typeFa} ({sub.typeEn})
                      </small>
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
                خرید ویباکس برای این باندل
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
