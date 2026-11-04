'use client';

import { Anton, Lalezar } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Icon } from '@/components/Icons';
import { ErrorState, Loading } from '@/components/ui/State';
import { faNumber } from '@/lib/format';
import {
  CODM_REGIONS,
  CODM_REVALIDATE_SECONDS,
  type CodmFilterCategory,
  type CodmRegionKey,
  type CodmStoreData,
  type CodmStoreOffer,
} from '@/lib/codmStore';

import './codm-store.css';

const codmDisplayFont = Lalezar({
  weight: '400',
  subsets: ['arabic', 'latin'],
  variable: '--codm-font-display',
  display: 'swap',
});

const codmLatinFont = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--codm-font-latin',
  display: 'swap',
});

interface QuickCategoryConfig {
  key: CodmFilterCategory;
  title: string;
  desc: string;
  iconName: string;
  accentColor: string;
}

const QUICK_CATEGORIES: QuickCategoryConfig[] = [
  {
    key: 'all',
    title: 'همه پیشنهادها',
    desc: 'تمامی بسته‌های سی‌پی، باندل‌ها و هدایای وب‌استور',
    iconName: 'grid',
    accentColor: '#ffba00',
  },
  {
    key: 'cp',
    title: 'بسته‌های سی‌پی',
    desc: 'بسته‌های رسمی CP همراه با بونوس اضافه وب‌استور',
    iconName: 'zap',
    accentColor: '#f59e0b',
  },
  {
    key: 'bundle',
    title: 'باندل‌های ویژه',
    desc: 'باندل‌های ترکیبی سی‌پی، اسکین اپراتور و بلوپرینت سلاح',
    iconName: 'layers',
    accentColor: '#f97316',
  },
  {
    key: 'event',
    title: 'رویدادهای فصل',
    desc: 'پیشنهادهای محدود رویدادهای ویژه و همکاری‌های رسمی',
    iconName: 'star',
    accentColor: '#38bdf8',
  },
  {
    key: 'freebie',
    title: 'هدیه رایگان',
    desc: 'جوایز و جعبه‌های رایگان روزانه وب‌استور',
    iconName: 'gift',
    accentColor: '#22c55e',
  },
];

type SortKey = 'featured' | 'bonus-desc' | 'discount-desc' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'چیدمان رسمی وب‌استور' },
  { key: 'bonus-desc', label: 'بیشترین بونوس سی‌پی' },
  { key: 'discount-desc', label: 'بیشترین تخفیف' },
  { key: 'price-asc', label: 'ارزان‌ترین قیمت' },
  { key: 'price-desc', label: 'گران‌ترین قیمت' },
];

const SORTERS: Record<SortKey, (a: CodmStoreOffer, b: CodmStoreOffer) => number> = {
  featured: (a, b) => a.sortOrder - b.sortOrder,
  'bonus-desc': (a, b) => b.bonusCp - a.bonusCp || b.bonusPercent - a.bonusPercent || a.sortOrder - b.sortOrder,
  'discount-desc': (a, b) =>
    b.discountPercent - a.discountPercent ||
    Number(b.isFirstPurchaseOffer) - Number(a.isFirstPurchaseOffer) ||
    a.sortOrder - b.sortOrder,
  'price-asc': (a, b) => a.price - b.price || a.sortOrder - b.sortOrder,
  'price-desc': (a, b) => b.price - a.price || a.sortOrder - b.sortOrder,
};

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPersianDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatRemainingValidity(endTimeIso: string | null, refreshType: string | null): string | null {
  if (refreshType === 'DAILY') {
    return 'تجدید روزانه';
  }
  if (!endTimeIso) return null;
  try {
    const endMs = new Date(endTimeIso).getTime();
    const diffMs = endMs - Date.now();
    const dateFa = new Intl.DateTimeFormat('fa-IR', {
      month: 'long',
      day: 'numeric',
    }).format(new Date(endTimeIso));

    if (diffMs <= 0) {
      return `پایان یافته (${dateFa})`;
    }
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (daysLeft > 30) {
      return `معتبر تا ${dateFa}`;
    }
    if (daysLeft >= 1) {
      return `${faNumber(daysLeft)} روز باقی‌مانده`;
    }
    return `${faNumber(Math.max(1, hoursLeft))} ساعت باقی‌مانده`;
  } catch {
    return null;
  }
}

function padPersianTwoDigits(val: number): string {
  return faNumber(Math.floor(val / 10)) + faNumber(val % 10);
}

const FALLBACK_OFFER_IMAGE = '/images/products/Molten-Gold-Lightning-King.webp';

interface TilePalette {
  rarityColor: string;
  primary: string;
  secondary: string;
  accent: string;
  plate: string;
  tagEn: string;
  tagFa: string;
}

function getOfferPalette(offer: CodmStoreOffer): TilePalette {
  if (offer.isFreebie || offer.category === 'freebie') {
    return {
      rarityColor: '#22c55e',
      primary: '#15803d',
      secondary: '#071f12',
      accent: '#4ade80',
      plate: '#071b10',
      tagEn: 'FREE GIFT',
      tagFa: 'هدیه روزانه',
    };
  }
  if (offer.category === 'bundle') {
    return {
      rarityColor: '#f97316',
      primary: '#9a3412',
      secondary: '#1c0f0a',
      accent: '#fb923c',
      plate: '#1a0e09',
      tagEn: 'BUNDLE',
      tagFa: 'باندل ویژه',
    };
  }
  if (offer.category === 'event') {
    return {
      rarityColor: '#38bdf8',
      primary: '#1d4ed8',
      secondary: '#0a1428',
      accent: '#60a5fa',
      plate: '#0a1326',
      tagEn: 'EVENT',
      tagFa: 'رویداد فصل',
    };
  }
  return {
    rarityColor: '#ffba00',
    primary: '#92400e',
    secondary: '#171108',
    accent: '#fbbf24',
    plate: '#161108',
    tagEn: 'CP PACK',
    tagFa: 'بسته سی‌پی',
  };
}

const StoreCountdownTimer = memo(function StoreCountdownTimer({
  nextRevalidateAt,
  isRefreshing,
  onRefresh,
}: {
  nextRevalidateAt?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const targetMs = nextRevalidateAt
    ? new Date(nextRevalidateAt).getTime()
    : nowMs + CODM_REVALIDATE_SECONDS * 1000;
  const secondsLeft = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const hoursLeft = Math.floor(secondsLeft / 3600);
  const minutesLeft = Math.floor((secondsLeft % 3600) / 60);
  const secsLeft = secondsLeft % 60;
  const cycleElapsed = Math.min(1, Math.max(0, 1 - secondsLeft / CODM_REVALIDATE_SECONDS));

  const cells = [
    { value: hoursLeft, label: 'ساعت' },
    { value: minutesLeft, label: 'دقیقه' },
    { value: secsLeft, label: 'ثانیه' },
  ];

  return (
    <div className="codm-timer" aria-label="شمارش معکوس تا بروزرسانی بعدی وب‌استور">
      <div className="codm-timer-head">
        <span className="codm-timer-title">
          <Icon name="clock" />
          بروزرسانی بعدی تا
        </span>
        <button
          type="button"
          className="codm-timer-sync-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="بروزرسانی دستی پیشنهادها"
        >
          <Icon name="refresh" className={isRefreshing ? 'codm-spin' : ''} />
          <span dir="ltr">{isRefreshing ? 'SYNCING' : 'AUTO SYNC'}</span>
        </button>
      </div>

      <div className="codm-timer-grid" role="timer" aria-live="off">
        {cells.map((cell, i) => (
          <React.Fragment key={cell.label}>
            {i > 0 && (
              <span className="codm-timer-sep" aria-hidden="true">
                :
              </span>
            )}
            <div className="codm-timer-cell">
              <span className="codm-timer-val" suppressHydrationWarning>
                {padPersianTwoDigits(cell.value)}
              </span>
              <span className="codm-timer-lbl">{cell.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="codm-cycle">
        <div className="codm-cycle-head">
          <span>چرخه بروزرسانی خودکار</span>
          <span className="codm-cycle-pct" suppressHydrationWarning>
            {faNumber(Math.round(cycleElapsed * 100))}٪
          </span>
        </div>
        <div className="codm-cycle-track" aria-hidden="true">
          <span
            className="codm-cycle-fill"
            style={{ transform: `scaleX(${cycleElapsed})` }}
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
});

const CodmOfferCard = memo(function CodmOfferCard({
  offer,
  priority,
  onInspect,
}: {
  offer: CodmStoreOffer;
  priority: boolean;
  onInspect: (offer: CodmStoreOffer) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError || !offer.image ? FALLBACK_OFFER_IMAGE : offer.image;
  const palette = useMemo(() => getOfferPalette(offer), [offer]);

  const validityLabel = useMemo(
    () => formatRemainingValidity(offer.purchaseLimit?.endTime ?? null, offer.purchaseLimit?.refreshType ?? null),
    [offer.purchaseLimit],
  );

  return (
    <article
      className="codm-card"
      style={
        {
          '--rarity-color': palette.rarityColor,
          '--tile-1': palette.primary,
          '--tile-2': palette.secondary,
          '--tile-3': palette.accent,
          '--tile-plate': palette.plate,
        } as React.CSSProperties
      }
    >
      {/* Top badges: section/type pill + skewed bonus/discount pill */}
      <div className="codm-card-top">
        <span className="codm-rarity-badge" title={`${offer.sectionNameFa} (${offer.sectionName})`}>
          <span className="codm-rarity-dot" aria-hidden="true" />
          <span className="codm-rarity-name">{palette.tagFa}</span>
          <span className="codm-rarity-en" dir="ltr">
            {palette.tagEn}
          </span>
        </span>

        {offer.isFreebie ? (
          <span className="codm-discount-pill codm-discount-pill--free">رایگان</span>
        ) : offer.isFirstPurchaseOffer ? (
          <span className="codm-discount-pill">۲ برابر سی‌پی</span>
        ) : offer.discountPercent > 0 ? (
          <span className="codm-discount-pill">{faNumber(offer.discountPercent)}٪ تخفیف</span>
        ) : offer.bonusPercent > 0 ? (
          <span className="codm-discount-pill">+{faNumber(offer.bonusPercent)}٪ بونوس</span>
        ) : offer.isPopular ? (
          <span className="codm-banner-pill">پرفروش</span>
        ) : null}
      </div>

      {/* Artwork stage */}
      <div
        className="codm-card-stage"
        onClick={() => onInspect(offer)}
        role="button"
        tabIndex={0}
        aria-label={`مشاهده جزئیات ${offer.titleFa}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onInspect(offer);
          }
        }}
      >
        <Image
          src={imgSrc}
          alt={offer.titleFa}
          width={240}
          height={220}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          priority={priority}
          className="codm-card-img"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Bottom name plate with hover reveal */}
      <div className="codm-card-panel">
        <div className="codm-card-main-info">
          <h3 className="codm-card-title" title={offer.titleFa}>
            {offer.titleFa}
          </h3>

          <div className="codm-price-wrap">
            <div className="codm-price-nums">
              {offer.isFreebie ? (
                <span className="codm-price-current codm-price-current--free">رایگان (FREE)</span>
              ) : (
                <>
                  <span className="codm-price-current" dir="ltr">
                    {offer.formattedPrice}
                  </span>
                  {offer.formattedRegularPrice && (
                    <span className="codm-price-old" dir="ltr">
                      {offer.formattedRegularPrice}
                    </span>
                  )}
                </>
              )}
            </div>

            {offer.totalCp > 0 ? (
              <span className="codm-cp-summary-pill">
                {offer.bonusCp > 0
                  ? `${faNumber(offer.baseCp)} + ${faNumber(offer.bonusCp)} CP`
                  : `${faNumber(offer.totalCp)} CP`}
              </span>
            ) : offer.packageItems.length > 0 ? (
              <span className="codm-cp-summary-pill">
                {faNumber(offer.packageItems.length)} آیتم
              </span>
            ) : null}
          </div>
        </div>

        {/* Hover reveal: extra info & action buttons */}
        <div className="codm-card-reveal">
          <div className="codm-card-reveal-inner">
            <div className="codm-card-extra-meta">
              <span className="codm-type-tag">
                {offer.sectionNameFa}
                {validityLabel ? ` · ${validityLabel}` : ''}
              </span>
              {offer.purchaseLimit?.limit && (
                <span className="codm-bundle-count-tag">
                  سقف {faNumber(offer.purchaseLimit.limit)} بار
                </span>
              )}
            </div>

            <div className="codm-card-actions">
              <Link href="/product/cod-points" className="codm-buy-cp-btn">
                <Icon name="cart" />
                <span className="codm-btn-label">خرید سی‌پی</span>
              </Link>

              <button
                type="button"
                className="codm-bundle-popup-btn"
                onClick={() => onInspect(offer)}
                aria-label={`جزئیات ${offer.titleFa}`}
                title="مشاهده جزئیات و محتویات بسته"
              >
                <Icon name={offer.packageItems.length > 0 ? 'layers' : 'eye'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

export default function CodmStoreClient({ initialData }: { initialData: CodmStoreData | null }) {
  const [store, setStore] = useState<CodmStoreData | null>(initialData);
  const [region, setRegion] = useState<CodmRegionKey>(initialData?.region ?? 'us');
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(
    initialData ? null : 'امکان دریافت اطلاعات وب‌استور کالاف دیوتی موبایل در حال حاضر وجود ندارد.',
  );

  const [selectedCategory, setSelectedCategory] = useState<CodmFilterCategory>('all');
  const [query, setQuery] = useState<string>('');
  const deferredQuery = useDeferredValue(query);
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [onlyBonusOrDiscount, setOnlyBonusOrDiscount] = useState<boolean>(false);
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [inspectedOffer, setInspectedOffer] = useState<CodmStoreOffer | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const fetchStoreData = useCallback(async (targetRegion: CodmRegionKey, forceFresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ region: targetRegion });
      if (forceFresh) qs.set('fresh', '1');
      const res = await fetch(`/api/codm-store?${qs.toString()}`, {
        cache: forceFresh ? 'no-store' : 'default',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as CodmStoreData;
      setStore(data);
    } catch {
      setError('خطا در برقراری ارتباط با وب‌استور کالاف دیوتی موبایل. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegionChange = useCallback(
    (nextRegion: CodmRegionKey) => {
      if (nextRegion === region && store) return;
      setRegion(nextRegion);
      void fetchStoreData(nextRegion, false);
    },
    [region, store, fetchStoreData],
  );

  const handleManualRefresh = useCallback(() => {
    void fetchStoreData(region, true);
  }, [region, fetchStoreData]);

  // Close sort menu on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [sortOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!inspectedOffer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedOffer(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [inspectedOffer]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CodmFilterCategory, number> = {
      all: 0,
      cp: 0,
      bundle: 0,
      event: 0,
      freebie: 0,
    };
    if (!store) return counts;
    counts.all = store.offers.length;
    for (const offer of store.offers) {
      counts[offer.category] = (counts[offer.category] || 0) + 1;
    }
    return counts;
  }, [store]);

  const normalizedQuery = useMemo(() => normalizeForSearch(deferredQuery), [deferredQuery]);

  const filteredOffers = useMemo(() => {
    if (!store) return [];
    const sorter = SORTERS[sortKey] || SORTERS.featured;

    return store.offers
      .filter(offer => {
        if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
          return false;
        }
        if (onlyBonusOrDiscount) {
          const hasPromo =
            offer.bonusCp > 0 ||
            offer.discountPercent > 0 ||
            offer.isFirstPurchaseOffer ||
            offer.isFreebie;
          if (!hasPromo) return false;
        }
        if (normalizedQuery) {
          const haystack = normalizeForSearch(
            `${offer.title} ${offer.titleFa} ${offer.subtitle || ''} ${offer.descriptionFa} ${offer.sectionName} ${offer.sectionNameFa} ${offer.totalCp}`,
          );
          if (!haystack.includes(normalizedQuery)) return false;
        }
        return true;
      })
      .sort(sorter);
  }, [store, selectedCategory, onlyBonusOrDiscount, normalizedQuery, sortKey]);

  const resetFilters = useCallback(() => {
    setSelectedCategory('all');
    setQuery('');
    setSortKey('featured');
    setOnlyBonusOrDiscount(false);
  }, []);

  const trimmedQuery = query.trim();
  const hasActiveFilters =
    trimmedQuery !== '' || selectedCategory !== 'all' || onlyBonusOrDiscount || sortKey !== 'featured';
  const persianDate = store ? formatPersianDate(store.fetchedAt) : '';
  const activeConfig =
    QUICK_CATEGORIES.find(c => c.key === selectedCategory) || QUICK_CATEGORIES[0];

  return (
    <div
      className={`codm-shop-page ${codmDisplayFont.variable} ${codmLatinFont.variable} reveal`}
      style={{ '--d': 2 } as React.CSSProperties}
    >
      {/* ---------- Hero ---------- */}
      <section className="codm-hero" aria-labelledby="codm-store-heading">
        <div className="codm-hero-bg" aria-hidden="true">
          <Image
            src="/images/games/cod-background.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="codm-hero-map"
          />
          <div className="codm-hero-rays" />
          <div className="codm-hero-shade" />
        </div>

        <div className="codm-hero-content">
          <div className="codm-collab-badge" title="همکاری تایتان و وب‌استور کالاف دیوتی موبایل">
            <Image
              src="/titan-logo.webp"
              alt="لوگوی تایتان"
              width={30}
              height={30}
              className="codm-collab-img"
              priority
            />
            <span className="codm-collab-x" aria-hidden="true">
              ✕
            </span>
            <Image
              src="/images/glossy-cod-logo-v2.webp"
              alt="لوگوی کالاف دیوتی موبایل"
              width={30}
              height={30}
              className="codm-collab-img"
              priority
            />
            <span className="codm-collab-text" dir="ltr">
              TITAN X CALL OF DUTY: MOBILE
            </span>
          </div>

          <p className="codm-hero-eyebrow" dir="ltr">
            WEB STORE OFFERS
          </p>

          <h1 id="codm-store-heading" className="codm-hero-title">
            پیشنهادات وب‌استور <span className="codm-hero-title-hl">کالاف دیوتی موبایل</span>
          </h1>

          <div className="codm-hero-meta">
            <span className="codm-live-pill">
              <span className="codm-live-dot" aria-hidden="true" />
              زنده و خودکار
            </span>
            {persianDate && (
              <span className="codm-date-chip" suppressHydrationWarning>
                <Icon name="clock" /> {persianDate}
              </span>
            )}
          </div>

          <p className="codm-hero-desc">
            پیشنهادات انحصاری وب‌استور رسمی اکتیویژن (بسته‌های سی‌پی با بونوس اضافه، باندل‌ها و هدیه
            روزانه) را لحظه‌ای ببینید و سی‌پی را با تحویل سریع از تایتان بخرید.
          </p>

          {store && (
            <dl className="codm-hero-stats">
              <div className="codm-hero-stat">
                <dt>پیشنهاد فعال</dt>
                <dd>{faNumber(store.totalOffers)}</dd>
              </div>
              <div className="codm-hero-stat">
                <dt>باندل و هدیه</dt>
                <dd>{faNumber(store.bundlesCount + store.freebiesCount)}</dd>
              </div>
              {store.maxBonusPercent > 0 && (
                <div className="codm-hero-stat codm-hero-stat--hot">
                  <dt>بونوس وب‌استور</dt>
                  <dd>
                    <small>تا</small> {faNumber(store.maxBonusPercent)}٪
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="codm-hero-actions">
            <Link href="/product/cod-points" className="codm-cta-primary">
              <Icon name="cart" />
              <span>خرید فوری سی‌پی</span>
            </Link>
            <Link href="/store/call-of-duty" className="codm-cta-secondary">
              <span>بتل‌پس و محصولات کالاف</span>
            </Link>
          </div>
        </div>

        <div className="codm-hero-visual">
          <Image
            src="/images/hero/characters/callof-v2.webp"
            alt=""
            aria-hidden="true"
            width={420}
            height={500}
            priority
            className="codm-hero-character"
          />
          <StoreCountdownTimer
            nextRevalidateAt={store?.nextRevalidateAt}
            isRefreshing={loading}
            onRefresh={handleManualRefresh}
          />
        </div>
      </section>

      {!store && error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => {
            void fetchStoreData(region, true);
          }}
        />
      )}

      {loading && !store && <Loading label="در حال دریافت پیشنهادات وب‌استور کالاف دیوتی موبایل" />}

      {store && (
        <>
          {/* ---------- Search, Sort, Region & Categories ---------- */}
          <section className="codm-filters" aria-labelledby="codm-filters-heading">
            <div className="codm-filters-head">
              <h2 id="codm-filters-heading">
                <span className="codm-filters-kicker" dir="ltr">
                  BROWSE
                </span>
                جستجو و دسته‌بندی
              </h2>

              <div className="codm-head-controls">
                <div className="codm-region-pills" role="group" aria-label="انتخاب ریجن وب‌استور">
                  {CODM_REGIONS.map(r => {
                    const isActive = r.key === region;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        className={`codm-region-pill${isActive ? ' is-active' : ''}`}
                        onClick={() => handleRegionChange(r.key)}
                        disabled={loading && isActive}
                        title={`${r.nameFa} (${r.currency})`}
                      >
                        <span>{r.flag}</span>
                        <span>{r.nameFa.replace('ریجن ', '')}</span>
                        <small dir="ltr">{r.currencySymbol}</small>
                      </button>
                    );
                  })}
                </div>

                {hasActiveFilters && (
                  <button type="button" className="codm-filters-reset" onClick={resetFilters}>
                    <Icon name="refresh" />
                    <span>پاک کردن فیلترها</span>
                  </button>
                )}
              </div>
            </div>

            <div className="codm-toolbar">
              <div className="codm-search" role="search">
                <Icon name="search" />
                <input
                  ref={searchInputRef}
                  type="search"
                  className="codm-search-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape' && query) {
                      e.preventDefault();
                      setQuery('');
                    }
                  }}
                  placeholder="جستجوی مقدار سی‌پی (مثلاً 880 یا 2400)، نام باندل یا هدیه…"
                  aria-label="جستجو در پیشنهادات وب‌استور"
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    type="button"
                    className="codm-search-clear"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="پاک کردن جستجو"
                  >
                    <Icon name="x" />
                  </button>
                )}
              </div>

              <div ref={sortRef} className={`codm-sort${sortOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="codm-sort-trigger"
                  onClick={() => setSortOpen(open => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-label="مرتب‌سازی پیشنهادها"
                >
                  <span className="codm-sort-label">مرتب‌سازی</span>
                  <span className="codm-sort-value">
                    {SORT_OPTIONS.find(opt => opt.key === sortKey)?.label ?? SORT_OPTIONS[0].label}
                  </span>
                  <Icon name="chev" className="codm-sort-caret" />
                </button>

                {sortOpen && (
                  <ul className="codm-sort-menu" role="listbox" aria-label="گزینه‌های مرتب‌سازی">
                    {SORT_OPTIONS.map(opt => {
                      const isSelected = opt.key === sortKey;
                      return (
                        <li key={opt.key} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={`codm-sort-option${isSelected ? ' is-selected' : ''}`}
                            onClick={() => {
                              setSortKey(opt.key);
                              setSortOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="codm-sort-check" aria-hidden="true">
                                <Icon name="check" />
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <button
                type="button"
                className={`codm-toggle${onlyBonusOrDiscount ? ' is-on' : ''}`}
                onClick={() => setOnlyBonusOrDiscount(v => !v)}
                aria-pressed={onlyBonusOrDiscount}
              >
                <span className="codm-toggle-box" aria-hidden="true">
                  <Icon name="check" />
                </span>
                فقط دارای بونوس / تخفیف
              </button>
            </div>

            <div className="codm-tabs" role="group" aria-label="دسته‌بندی پیشنهادات وب‌استور">
              {QUICK_CATEGORIES.map(cat => {
                const count = categoryCounts[cat.key] ?? 0;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`codm-tab${isActive ? ' is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat.key)}
                    aria-pressed={isActive}
                    disabled={count === 0 && !isActive && cat.key !== 'all'}
                    title={cat.desc}
                    style={{ '--cat-accent': cat.accentColor } as React.CSSProperties}
                  >
                    <span className="codm-tab-icon" aria-hidden="true">
                      <Icon name={cat.iconName} />
                    </span>
                    <span className="codm-tab-title">{cat.title}</span>
                    <span className="codm-tab-count">{faNumber(count)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------- Results Header ---------- */}
          <section className="codm-view-header">
            <div className="codm-view-title-group">
              <h2>{trimmedQuery ? 'نتایج جستجو' : activeConfig.title}</h2>
              <span className="codm-view-count-badge" aria-live="polite">
                {faNumber(filteredOffers.length)} پیشنهاد
                {trimmedQuery && (
                  <>
                    {' '}
                    برای «<bdi>{trimmedQuery}</bdi>»
                  </>
                )}
              </span>
            </div>

            <span className="codm-exclusive-pill">
              <Icon name="info" />
              پیشنهادات انحصاری وب‌استور رسمی (Web Store Exclusive)
            </span>
          </section>

          {/* ---------- Results Grid ---------- */}
          {filteredOffers.length === 0 ? (
            <div className="codm-empty" role="status">
              <span className="codm-empty-icon" aria-hidden="true">
                <Icon name="search" />
              </span>
              <h3>
                {trimmedQuery ? (
                  <>
                    نتیجه‌ای برای «<bdi>{trimmedQuery}</bdi>» پیدا نشد
                  </>
                ) : (
                  'پیشنهادی با این فیلترها در وب‌استور یافت نشد'
                )}
              </h3>
              <p>عبارت جستجو را تغییر دهید یا فیلترهای فعال را پاک کنید.</p>
              <button type="button" className="codm-empty-btn" onClick={resetFilters}>
                پاک کردن جستجو و فیلترها
              </button>
            </div>
          ) : (
            <div className="codm-grid-container">
              <div className="codm-grid">
                {filteredOffers.map((offer, idx) => (
                  <CodmOfferCard
                    key={offer.id}
                    offer={offer}
                    priority={idx < 4}
                    onInspect={setInspectedOffer}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ---------- Bottom Buy CP CTA Banner ---------- */}
          <aside className="codm-bottom-cta" aria-label="خرید سی‌پی کالاف دیوتی موبایل از تایتان">
            <div className="codm-bottom-cta-text">
              <h2>سی‌پی کافی برای خرید باندل‌ها و گردونه‌های کالاف دیوتی موبایل ندارید؟</h2>
              <p>
                شارژ مستقیم و مطمئن سی‌پی کالاف دیوتی موبایل روی اکانت اکتیویژن شما با قیمت ریالی و
                تحویل سریع در فروشگاه تایتان.
              </p>
            </div>
            <div className="codm-hero-actions">
              <Link href="/product/cod-points" className="codm-cta-primary">
                <Icon name="cart" />
                <span>خرید فوری سی‌پی</span>
              </Link>
              <Link href="/store/call-of-duty" className="codm-cta-secondary">
                <span>تمام محصولات کالاف دیوتی</span>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* ---------- Offer / Bundle Detail Drawer Modal ---------- */}
      {inspectedOffer && (
        <div
          className="codm-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="codm-drawer-title"
          onClick={() => setInspectedOffer(null)}
        >
          <div className="codm-drawer" onClick={e => e.stopPropagation()}>
            <div className="codm-drawer-head">
              <div className="codm-drawer-title-wrap">
                <span className="codm-drawer-badge">{inspectedOffer.sectionNameFa}</span>
                <h3 id="codm-drawer-title">{inspectedOffer.titleFa}</h3>
              </div>
              <button
                type="button"
                className="codm-drawer-close"
                onClick={() => setInspectedOffer(null)}
                aria-label="بستن پنجره جزئیات"
              >
                <Icon name="x" />
              </button>
            </div>

            <div className="codm-drawer-body">
              <div className="codm-drawer-hero">
                <Image
                  src={inspectedOffer.image || FALLBACK_OFFER_IMAGE}
                  alt={inspectedOffer.titleFa}
                  width={120}
                  height={120}
                  className="codm-drawer-img"
                />
                <div className="codm-drawer-summary">
                  <p className="codm-drawer-desc">{inspectedOffer.descriptionFa}</p>
                  {inspectedOffer.totalCp > 0 && (
                    <div className="codm-drawer-cp-pills">
                      <span className="codm-drawer-cp-pill">
                        سی‌پی پایه: <strong>{faNumber(inspectedOffer.baseCp)} CP</strong>
                      </span>
                      {inspectedOffer.bonusCp > 0 && (
                        <span className="codm-drawer-cp-pill is-bonus">
                          بونوس وب‌استور: <strong>+{faNumber(inspectedOffer.bonusCp)} CP</strong>
                        </span>
                      )}
                      <span className="codm-drawer-cp-pill is-total">
                        مجموع دریافتی: <strong>{faNumber(inspectedOffer.totalCp)} CP</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {inspectedOffer.packageItems.length > 0 && (
                <>
                  <div className="codm-drawer-meta-banner">
                    <span>
                      شامل <strong>{faNumber(inspectedOffer.packageItems.length)}</strong> آیتم داخل این پکیج:
                    </span>
                    {inspectedOffer.discountPercent > 0 && (
                      <span className="codm-discount-pill">
                        {faNumber(inspectedOffer.discountPercent)}٪ تخفیف
                      </span>
                    )}
                  </div>

                  <div className="codm-drawer-list">
                    {inspectedOffer.packageItems.map(sub => (
                      <div key={sub.id} className="codm-drawer-item">
                        {sub.image && (
                          <Image
                            src={sub.image}
                            alt={sub.titleFa}
                            width={54}
                            height={54}
                            className="codm-drawer-item-img"
                          />
                        )}
                        <div className="codm-drawer-item-info">
                          <strong>{sub.titleFa}</strong>
                          <span className="codm-drawer-sub-type">
                            {sub.itemTypeFa} ({sub.title})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="codm-drawer-foot">
              <div className="codm-price-wrap">
                <div className="codm-price-nums">
                  {inspectedOffer.isFreebie ? (
                    <span className="codm-price-current codm-price-current--free">رایگان (FREE)</span>
                  ) : (
                    <>
                      <span className="codm-price-current" dir="ltr">
                        {inspectedOffer.formattedPrice}
                      </span>
                      {inspectedOffer.formattedRegularPrice && (
                        <span className="codm-price-old" dir="ltr">
                          {inspectedOffer.formattedRegularPrice}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Link href="/product/cod-points" className="codm-cta-primary">
                <Icon name="cart" />
                <span>خرید فوری سی‌پی</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
