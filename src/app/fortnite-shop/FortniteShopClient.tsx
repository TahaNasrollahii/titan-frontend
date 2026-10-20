'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { Empty, ErrorState, Loading } from '@/components/ui/State';
import { faNumber } from '@/lib/format';
import {
  type FortniteShopData,
  getNextShopResetIso,
  type ShopEntry,
  type ShopFilterCategory,
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

function ShopItemCard({
  entry,
  vbuckIcon,
  priority,
  onInspectBundle,
}: {
  entry: ShopEntry;
  vbuckIcon: string;
  priority: boolean;
  onInspectBundle: (entry: ShopEntry) => void;
}) {
  const [imgSrc, setImgSrc] = useState(entry.image || FALLBACK_ITEM_IMAGE);

  useEffect(() => {
    setImgSrc(entry.image || FALLBACK_ITEM_IMAGE);
  }, [entry.image]);

  const showBundleList = entry.isBundle && entry.bundleItems.length > 0;
  const previewBundleItems = showBundleList ? entry.bundleItems.slice(0, 3) : [];
  const extraBundleCount = showBundleList ? Math.max(0, entry.bundleItems.length - 3) : 0;

  return (
    <article
      className="fn-card spot"
      style={
        {
          '--rarity-color': entry.rarityColor,
          '--card-tint': entry.cardBgColor || '#3a121b',
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

      <div className="fn-card-stage">
        <Image
          src={imgSrc}
          alt={`${entry.name} — ${entry.typeFa} فورتنایت`}
          width={280}
          height={260}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 280px"
          priority={priority}
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
          </span>
          {showBundleList && (
            <span className="fn-bundle-count-tag">
              شامل {faNumber(entry.bundleItems.length)} آیتم
            </span>
          )}
        </div>

        <h3 className="fn-card-title" title={entry.name} dir="auto">
          {entry.name}
        </h3>

        {showBundleList && (
          <div className="fn-bundle-box">
            <span className="fn-bundle-label">آیتم‌های داخل باندل:</span>
            <div className="fn-bundle-chips">
              {previewBundleItems.map(sub => (
                <span key={`${sub.id}-${sub.typeEn}`} className="fn-bundle-chip" title={`${sub.name} (${sub.typeFa})`}>
                  {sub.image && (
                    <Image
                      src={sub.image}
                      alt={sub.name}
                      width={18}
                      height={18}
                      sizes="18px"
                      className="fn-bundle-chip-img"
                    />
                  )}
                  <span className="fn-bundle-chip-name" dir="auto">
                    {sub.name}
                  </span>
                </span>
              ))}
            </div>
            {(extraBundleCount > 0 || entry.bundleItems.length > 1) && (
              <button
                type="button"
                className="fn-bundle-more-btn"
                onClick={() => onInspectBundle(entry)}
              >
                {extraBundleCount > 0
                  ? `+ ${faNumber(extraBundleCount)} آیتم دیگر (مشاهده کامل)`
                  : 'مشاهده جزئیات اقلام باندل'}
              </button>
            )}
          </div>
        )}

        <div className="fn-card-foot">
          <div className="fn-price-wrap" title={`${faNumber(entry.finalPrice)} ویباکس`}>
            <Image
              src={vbuckIcon}
              alt="V-Bucks"
              width={22}
              height={22}
              sizes="22px"
              className="fn-vbuck-icon"
            />
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
}

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

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
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

  // Tick countdown every second and automatically trigger a live refresh right after 00:00 UTC reset
  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);

      if (shop?.resetsAt) {
        const targetMs = new Date(shop.resetsAt).getTime();
        // Trigger automatic live refresh 3 seconds after 00:00 UTC reset
        if (current >= targetMs + 3000 && !refreshingRef.current) {
          void refreshShop(true);
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [shop?.resetsAt, refreshShop]);

  // Close bundle modal on Escape
  useEffect(() => {
    if (!inspectedBundle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedBundle(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectedBundle]);

  const targetResetIso = shop?.resetsAt || getNextShopResetIso(nowMs);
  const secondsUntilReset = Math.max(
    0,
    Math.floor((new Date(targetResetIso).getTime() - nowMs) / 1000),
  );
  const hoursLeft = Math.floor(secondsUntilReset / 3600);
  const minutesLeft = Math.floor((secondsUntilReset % 3600) / 60);
  const secondsLeft = secondsUntilReset % 60;

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

  const filteredSections = useMemo(() => {
    if (!shop) return [];
    const q = searchQuery.trim().toLowerCase();

    return shop.sections
      .filter(sec => selectedSectionId === 'all' || sec.id === selectedSectionId)
      .map(sec => {
        const entries = sec.entries.filter(entry => {
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
        });
        return { ...sec, entries };
      })
      .filter(sec => sec.entries.length > 0);
  }, [shop, selectedSectionId, selectedCategory, onlyDiscounted, searchQuery]);

  const visibleItemCount = useMemo(
    () => filteredSections.reduce((sum, s) => sum + s.entries.length, 0),
    [filteredSections],
  );

  const persianDate = shop ? formatPersianShopDate(shop.date) : formatPersianShopDate(new Date().toISOString());
  const utcDate = shop ? formatUtcShopDate(shop.date) : formatUtcShopDate(new Date().toISOString());

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
            مشاهده لحظه‌ای تمامی اسکین‌ها، باندل‌ها، ایموت‌ها و آیتم‌های امروز فورتنایت همراه با قیمت دقیق ویباکس.
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

        {/* Live Countdown to 00:00 UTC */}
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
              تعداد کل آیتم‌های امروز: <strong>{shop ? faNumber(shop.totalEntries) : '—'}</strong>
            </span>
            <span>
              بخش‌های فعال: <strong>{shop ? faNumber(shop.sections.length) : '—'}</strong>
            </span>
          </div>
        </div>
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
                  placeholder="جستجوی نام اسکین، باندل، ایموت یا بخش..."
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
              <div className="fn-sections-nav" aria-label="فیلتر بر اساس بخش‌های شاپ">
                <span className="fn-sections-nav-label">بخش‌ها:</span>
                <button
                  type="button"
                  className={`fn-sec-pill ${selectedSectionId === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedSectionId('all')}
                >
                  همه بخش‌ها <small>({faNumber(shop.sections.length)})</small>
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
            filteredSections.map((section, secIdx) => (
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
                  {section.entries.map((entry, entryIdx) => (
                    <ShopItemCard
                      key={entry.id}
                      entry={entry}
                      vbuckIcon={shop.vbuckIcon}
                      priority={secIdx === 0 && entryIdx < 4}
                      onInspectBundle={setInspectedBundle}
                    />
                  ))}
                </div>
              </section>
            ))
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
                {shop && (
                  <Image
                    src={shop.vbuckIcon}
                    alt="V-Bucks"
                    width={24}
                    height={24}
                    sizes="24px"
                    className="fn-vbuck-icon"
                  />
                )}
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
