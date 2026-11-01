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
    desc: 'کاتالوگ کامل وب‌استور رسمی کالاف دیوتی موبایل',
    iconName: 'grid',
    accentColor: '#ffba00',
  },
  {
    key: 'cp',
    title: 'بسته‌های سی‌پی (CP)',
    desc: 'سی‌پی پایه به همراه بونوس انحصاری وب‌استور',
    iconName: 'trophy',
    accentColor: '#ffba00',
  },
  {
    key: 'bundle',
    title: 'باندل‌های محدود',
    desc: 'پکیج‌های ترکیبی سی‌پی + اسکین سلاح و آیتم بونوس',
    iconName: 'bag',
    accentColor: '#f97316',
  },
  {
    key: 'event',
    title: 'پیشنهادات رویداد',
    desc: 'آیتم‌های رویداد همکاری و کریت‌های ویژه',
    iconName: 'flame',
    accentColor: '#38bdf8',
  },
  {
    key: 'freebie',
    title: 'هدیه رایگان روزانه',
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
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[ً-ٟـ‌‍‎‏]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function buildSearchText(offer: CodmStoreOffer): string {
  return normalizeForSearch(
    [
      offer.title,
      offer.titleFa,
      offer.subtitle ?? '',
      offer.subtitleFa ?? '',
      offer.descriptionFa,
      offer.categoryFa,
      offer.sectionName,
      offer.sectionNameFa,
      offer.totalCp > 0 ? `${offer.totalCp} ${offer.baseCp} ${offer.bonusCp} cp سی پی` : '',
      offer.isFreebie ? 'free رایگان هدیه روزانه' : '',
      offer.isFirstPurchaseOffer || offer.isFirstPurchaseDiscount ? 'تخفیف خرید اول دوبل' : '',
      ...offer.packageItems.flatMap(p => [p.title, p.titleFa, p.description ?? '', p.descriptionFa ?? '']),
    ].join(' '),
  );
}

function formatPersianDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatRemainingValidity(endTimeIso: string | null, refreshType: string | null): string | null {
  if (refreshType === 'DAILY') {
    return 'تجدید روزانه (۱ بار در روز)';
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
      return `${faNumber(daysLeft)} روز و ${faNumber(hoursLeft)} ساعت باقی‌مانده (تا ${dateFa})`;
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

const SyncTimerBox = memo(function SyncTimerBox({
  nextRevalidateAt,
  fetchedAt,
  isRefreshing,
  onRefresh,
}: {
  nextRevalidateAt?: string;
  fetchedAt?: string;
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

  const targetMs = nextRevalidateAt ? new Date(nextRevalidateAt).getTime() : nowMs + 1800 * 1000;
  const secondsLeft = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const updatedTimeFa = useMemo(() => {
    if (!fetchedAt) return 'لحظاتی پیش';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tehran',
      }).format(new Date(fetchedAt));
    } catch {
      return 'لحظاتی پیش';
    }
  }, [fetchedAt]);

  return (
    <div className="codm-hud-box" aria-label="وضعیت بروزرسانی خودکار وب‌استور">
      <div className="codm-hud-head">
        <span className="codm-hud-status">
          <span className="codm-live-dot" aria-hidden="true" />
          بروزرسانی خودکار سرور
        </span>
        <span className="codm-hud-tag" dir="ltr">
          SYNC // 30M
        </span>
      </div>

      <div className="codm-hud-grid">
        <div className="codm-hud-cell">
          <span className="codm-hud-lbl">آخرین همگام‌سازی</span>
          <strong className="codm-hud-val" suppressHydrationWarning>
            ساعت {updatedTimeFa}
          </strong>
        </div>
        <div className="codm-hud-cell">
          <span className="codm-hud-lbl">بروزرسانی بعدی تا</span>
          <strong className="codm-hud-val codm-hud-val--gold" suppressHydrationWarning>
            {padPersianTwoDigits(mins)}:{padPersianTwoDigits(secs)}
          </strong>
        </div>
      </div>

      <button
        type="button"
        className="codm-hud-refresh-btn"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <Icon name="refresh" className={isRefreshing ? 'codm-spin' : ''} />
        <span>{isRefreshing ? 'در حال دریافت آخرین تغییرات…' : 'بروزرسانی دستی اطلاعات'}</span>
      </button>
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

  const validityLabel = useMemo(
    () => formatRemainingValidity(offer.purchaseLimit?.endTime ?? null, offer.purchaseLimit?.refreshType ?? null),
    [offer.purchaseLimit],
  );

  const accentColor =
    offer.category === 'freebie'
      ? '#22c55e'
      : offer.category === 'bundle'
        ? '#f97316'
        : offer.category === 'event'
          ? '#38bdf8'
          : '#ffba00';

  return (
    <article
      className={`codm-card codm-card--${offer.category}${offer.isHighlighted ? ' is-highlighted' : ''}`}
      style={{ '--offer-accent': accentColor } as React.CSSProperties}
    >
      {/* Top tactical badges */}
      <div className="codm-card-top">
        <span className="codm-cat-badge">
          <span className="codm-cat-dot" aria-hidden="true" />
          <span>{offer.sectionNameFa}</span>
        </span>

        {offer.isFreebie ? (
          <span className="codm-promo-pill codm-promo-pill--free">هدیه رایگان</span>
        ) : offer.isFirstPurchaseOffer ? (
          <span className="codm-promo-pill codm-promo-pill--double">۲ برابر سی‌پی (خرید اول)</span>
        ) : offer.discountPercent > 0 ? (
          <span className="codm-promo-pill codm-promo-pill--discount">
            {faNumber(offer.discountPercent)}٪ تخفیف خرید اول
          </span>
        ) : offer.isPopular ? (
          <span className="codm-promo-pill codm-promo-pill--popular">پرفروش‌ترین</span>
        ) : offer.bonusPercent > 0 ? (
          <span className="codm-promo-pill codm-promo-pill--bonus">
            +{faNumber(offer.bonusPercent)}٪ بونوس وب‌استور
          </span>
        ) : (
          offer.webStoreExclusive && (
            <span className="codm-promo-pill codm-promo-pill--exclusive">انحصاری وب‌استور</span>
          )
        )}
      </div>

      {/* Visual stage */}
      <div
        className="codm-card-stage"
        onClick={() => onInspect(offer)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onInspect(offer);
          }
        }}
        aria-label={`مشاهده جزئیات ${offer.titleFa}`}
      >
        <Image
          src={imgSrc}
          alt={`${offer.titleFa} (${offer.title})`}
          width={240}
          height={210}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 260px"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="codm-card-img"
          onError={() => setImgError(true)}
        />

        {/* CP base + bonus breakdown overlay bar */}
        {offer.totalCp > 0 && (
          <div className="codm-cp-bar">
            {offer.bonusCp > 0 ? (
              <>
                <span className="codm-cp-base">{faNumber(offer.baseCp)} پایه</span>
                <span className="codm-cp-plus" aria-hidden="true">
                  +
                </span>
                <span className="codm-cp-bonus">{faNumber(offer.bonusCp)} بونوس وب‌استور</span>
              </>
            ) : (
              <span className="codm-cp-base">{faNumber(offer.totalCp)} سی‌پی به همراه آیتم بونوس</span>
            )}
          </div>
        )}
      </div>

      {/* Content body */}
      <div className="codm-card-body">
        <div className="codm-card-titles">
          <h3 className="codm-card-title">{offer.titleFa}</h3>
          <span className="codm-card-title-en" dir="ltr">
            {offer.title}
          </span>
        </div>

        <p className="codm-card-desc">{offer.descriptionFa}</p>

        {/* Validity or purchase limit meta */}
        {(validityLabel || offer.purchaseLimit?.limit) && (
          <div className="codm-card-meta-row">
            {validityLabel && (
              <span className="codm-validity-chip">
                <Icon name="clock" />
                <span>{validityLabel}</span>
              </span>
            )}
            {offer.purchaseLimit?.limit && !offer.isFreebie && (
              <span className="codm-limit-chip">
                محدودیت وب‌استور: {faNumber(offer.purchaseLimit.limit)} بار
              </span>
            )}
          </div>
        )}

        {/* Package sub-items preview */}
        {offer.packageItems.length > 0 && (
          <button
            type="button"
            className="codm-pkg-preview"
            onClick={() => onInspect(offer)}
            aria-label={`مشاهده ${faNumber(offer.packageItems.length)} آیتم داخل این پکیج`}
          >
            <div className="codm-pkg-thumbs">
              {offer.packageItems.slice(0, 4).map(sub => (
                <span key={sub.id} className="codm-pkg-thumb" title={sub.titleFa}>
                  {sub.image ? (
                    <Image
                      src={sub.image}
                      alt={sub.titleFa}
                      width={34}
                      height={34}
                      sizes="34px"
                      className="codm-pkg-thumb-img"
                    />
                  ) : (
                    <Icon name="gift" />
                  )}
                </span>
              ))}
            </div>
            <span className="codm-pkg-preview-label">
              شامل {faNumber(offer.packageItems.length)} آیتم · مشاهده محتویات
            </span>
            <Icon name="eye" />
          </button>
        )}

        {/* Footer: Price + Buy CP CTA */}
        <div className="codm-card-footer">
          <div className="codm-price-box">
            <span className="codm-price-lbl">قیمت در وب‌استور</span>
            <div className="codm-price-row">
              {offer.isFreebie ? (
                <span className="codm-price-free">رایگان (FREE)</span>
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
          </div>

          <div className="codm-card-actions">
            <button
              type="button"
              className="codm-inspect-btn"
              onClick={() => onInspect(offer)}
              title="مشاهده جزئیات پیشنهاد"
              aria-label={`جزئیات ${offer.titleFa}`}
            >
              <Icon name="eye" />
            </button>
            <Link href="/product/cod-points" className="codm-buy-cp-btn">
              <Icon name="cart" />
              <span>خرید سی‌پی</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

export default function CodmStoreClient({
  initialData,
}: {
  initialData: CodmStoreData | null;
}) {
  const [store, setStore] = useState<CodmStoreData | null>(initialData);
  const [region, setRegion] = useState<CodmRegionKey>(initialData?.region ?? 'us');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialData ? null : 'دریافت اطلاعات وب‌استور کالاف دیوتی موبایل با خطا مواجه شد.',
  );

  const [selectedCategory, setSelectedCategory] = useState<CodmFilterCategory>('all');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [inspectedOffer, setInspectedOffer] = useState<CodmStoreOffer | null>(null);

  const refreshingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(query);

  const fetchStoreData = useCallback(async (targetRegion: CodmRegionKey, forceFresh = false) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ region: targetRegion });
      if (forceFresh) params.set('fresh', '1');
      const res = await fetch(`/api/codm-store?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || 'خطا در برقراری ارتباط با وب‌استور کالاف دیوتی موبایل.');
      }
      const nextData = (await res.json()) as CodmStoreData;
      setStore(nextData);
      setRegion(nextData.region);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری پیشنهادات وب‌استور.');
    } finally {
      setLoading(false);
      refreshingRef.current = false;
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

  // Close modal on Escape
  useEffect(() => {
    if (!inspectedOffer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedOffer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectedOffer]);

  // Close sort dropdown on outside click or Escape
  useEffect(() => {
    if (!sortOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sortOpen]);

  const allOffers = useMemo(() => store?.offers ?? [], [store]);

  const searchIndex = useMemo(() => allOffers.map(buildSearchText), [allOffers]);

  const normalizedQuery = useMemo(() => normalizeForSearch(deferredQuery), [deferredQuery]);

  const matchingOffers = useMemo(() => {
    const terms = normalizedQuery ? normalizedQuery.split(' ').filter(Boolean) : [];
    return allOffers.filter((offer, idx) => {
      if (
        onlyPromos &&
        !(
          offer.discountPercent > 0 ||
          offer.isFirstPurchaseOffer ||
          offer.isFirstPurchaseDiscount ||
          offer.isFreebie
        )
      ) {
        return false;
      }
      if (terms.length === 0) return true;
      return terms.every(t => searchIndex[idx].includes(t));
    });
  }, [allOffers, searchIndex, normalizedQuery, onlyPromos]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CodmFilterCategory, number> = {
      all: matchingOffers.length,
      cp: 0,
      bundle: 0,
      event: 0,
      freebie: 0,
    };
    for (const offer of matchingOffers) {
      counts[offer.category] = (counts[offer.category] ?? 0) + 1;
    }
    return counts;
  }, [matchingOffers]);

  const filteredOffers = useMemo(() => {
    const byCat =
      selectedCategory === 'all'
        ? matchingOffers
        : matchingOffers.filter(o => o.category === selectedCategory);
    return [...byCat].sort(SORTERS[sortKey]);
  }, [matchingOffers, selectedCategory, sortKey]);

  const clearQuery = useCallback(() => {
    setQuery('');
    searchInputRef.current?.focus();
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
    setOnlyPromos(false);
    setSortKey('featured');
  }, []);

  const trimmedQuery = query.trim();
  const hasActiveFilters = trimmedQuery !== '' || selectedCategory !== 'all' || onlyPromos;
  const lastUpdatedFa = store ? formatPersianDateTime(store.fetchedAt) : '';
  const activeCategoryConfig =
    QUICK_CATEGORIES.find(c => c.key === selectedCategory) || QUICK_CATEGORIES[0];

  const showSectionedLayout =
    selectedCategory === 'all' && !trimmedQuery && !onlyPromos && sortKey === 'featured';

  return (
    <div
      className={`codm-store-page ${codmDisplayFont.variable} ${codmLatinFont.variable} reveal`}
      style={{ '--d': 2 } as React.CSSProperties}
    >
      {/* ---------- Hero ---------- */}
      <section className="codm-hero" aria-labelledby="codm-store-heading">
        <div className="codm-hero-bg" aria-hidden="true">
          <Image
            src="/images/games/callof-background.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="codm-hero-bg-img"
          />
          <div className="codm-hero-grid-overlay" />
          <div className="codm-hero-shade" />
        </div>

        <div className="codm-hero-content">
          <div className="codm-collab-badge" title="همکاری تایتان و وب‌استور کالاف دیوتی موبایل">
            <Image
              src="/titan-logo.webp"
              alt="لوگوی تایتان"
              width={28}
              height={28}
              className="codm-collab-img"
              priority
            />
            <span className="codm-collab-x" aria-hidden="true">
              ✕
            </span>
            <Image
              src="/images/glossy-cod-logo.webp"
              alt="لوگوی کالاف دیوتی موبایل"
              width={28}
              height={28}
              className="codm-collab-img"
              priority
            />
            <span className="codm-collab-text" dir="ltr">
              TITAN X CALL OF DUTY: MOBILE
            </span>
          </div>

          <p className="codm-hero-eyebrow" dir="ltr">
            OFFICIAL WEB STORE OFFERS // COD:M
          </p>

          <h1 id="codm-store-heading" className="codm-hero-title">
            پیشنهادات وب‌استور <span className="codm-hero-title-hl">کالاف دیوتی موبایل</span>
          </h1>

          <div className="codm-hero-meta">
            <span className="codm-live-pill">
              <span className="codm-live-dot" aria-hidden="true" />
              بروزرسانی خودکار از وب‌استور رسمی
            </span>
            {lastUpdatedFa && (
              <span className="codm-date-chip" suppressHydrationWarning>
                <Icon name="clock" />
                آخرین بروزرسانی: {lastUpdatedFa}
              </span>
            )}
            {store && (
              <span className="codm-region-chip">
                <Icon name="globe" />
                {store.regionNameFa}
              </span>
            )}
          </div>

          <p className="codm-hero-desc">
            بسته‌های سی‌پی با بونوس اضافه وب‌استور، تخفیف‌های اولین خرید، باندل‌های زمانی محدود و هدیه
            رایگان روزانه را به صورت زنده بررسی کنید و سی‌پی اکانت خود را فوری و قانونی از تایتان بخرید.
          </p>

          {store && (
            <dl className="codm-hero-stats">
              <div className="codm-hero-stat">
                <dt>کل پیشنهادها</dt>
                <dd>{faNumber(store.totalOffers)}</dd>
              </div>
              <div className="codm-hero-stat">
                <dt>بسته‌های سی‌پی</dt>
                <dd>{faNumber(store.cpPacksCount)}</dd>
              </div>
              <div className="codm-hero-stat">
                <dt>باندل و هدیه</dt>
                <dd>{faNumber(store.bundlesCount + store.freebiesCount)}</dd>
              </div>
              {store.maxBonusPercent > 0 && (
                <div className="codm-hero-stat codm-hero-stat--gold">
                  <dt>بونوس وب‌استور</dt>
                  <dd>
                    <small>تا</small> {faNumber(store.maxBonusPercent)}٪
                  </dd>
                </div>
              )}
              {store.maxDiscountPercent > 0 && (
                <div className="codm-hero-stat codm-hero-stat--hot">
                  <dt>تخفیف خرید اول</dt>
                  <dd>
                    <small>تا</small> {faNumber(store.maxDiscountPercent)}٪
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="codm-hero-actions">
            <Link href="/product/cod-points" className="codm-cta-primary">
              <Icon name="cart" />
              <span>خرید سی‌پی (CP)</span>
            </Link>
            <Link href="/store/call-of-duty" className="codm-cta-secondary">
              <span>تمام محصولات کالاف دیوتی</span>
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
          <SyncTimerBox
            nextRevalidateAt={store?.nextRevalidateAt}
            fetchedAt={store?.fetchedAt}
            isRefreshing={loading}
            onRefresh={handleManualRefresh}
          />
        </div>
      </section>

      {/* ---------- Official Web Store Exclusive Notice Banner ---------- */}
      <aside className="codm-exclusive-notice" aria-label="توضیحات پیشنهادات انحصاری وب‌استور">
        <div className="codm-notice-icon" aria-hidden="true">
          <Icon name="info" />
        </div>
        <div className="codm-notice-content">
          <strong>پیشنهادات انحصاری وب‌استور رسمی (Web Store Exclusive Offers)</strong>
          <p>
            این صفحه به صورت خودکار پیشنهادات موجود در وب‌استور رسمی اکتیویژن (
            <span dir="ltr">store.callofdutymobile.com</span>) شامل بسته‌های سی‌پی دارای بونوس اضافه،
            باندل‌های اینترنتی و هدایای روزانه را نمایش می‌دهد و فروشگاه درون بازی (Credit Store یا Black
            Market) نیست. برای شارژ مستقیم و ریالی سی‌پی روی اکانت خود، از دکمه «خرید سی‌پی» استفاده کنید.
          </p>
        </div>
        <Link href="/product/cod-points" className="codm-notice-cta">
          <span>شارژ فوری سی‌پی</span>
          <Icon name="chevron-left" />
        </Link>
      </aside>

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
          {/* ---------- Region Switcher & Filter Toolbar ---------- */}
          <section className="codm-filters" aria-labelledby="codm-filters-heading">
            <div className="codm-filters-top">
              <div className="codm-filters-title-group">
                <h2 id="codm-filters-heading">
                  <span className="codm-filters-kicker" dir="ltr">
                    TACTICAL LOADOUT
                  </span>
                  فیلتر، ریجن و دسته‌بندی پیشنهادات
                </h2>
              </div>

              {/* Region selector */}
              <div className="codm-region-bar" role="group" aria-label="انتخاب ریجن وب‌استور">
                <span className="codm-region-bar-label">
                  <Icon name="globe" />
                  ریجن وب‌استور:
                </span>
                <div className="codm-region-pills">
                  {CODM_REGIONS.map(r => {
                    const isSelected = r.key === region;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        className={`codm-region-pill${isSelected ? ' is-active' : ''}`}
                        onClick={() => handleRegionChange(r.key)}
                        disabled={loading && isSelected}
                        aria-pressed={isSelected}
                      >
                        <span className="codm-region-flag" aria-hidden="true">
                          {r.flag}
                        </span>
                        <span>{r.nameFa}</span>
                      </button>
                    );
                  })}
                </div>
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
                      clearQuery();
                    }
                  }}
                  placeholder="جستجو در بسته‌های سی‌پی، باندل هالووین، Honkai، جعبه یا هدیه روزانه…"
                  aria-label="جستجو در پیشنهادات وب‌استور کالاف دیوتی موبایل"
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    type="button"
                    className="codm-search-clear"
                    onClick={clearQuery}
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
                  onClick={() => setSortOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-label="مرتب‌سازی پیشنهادها"
                >
                  <span className="codm-sort-label">مرتب‌سازی:</span>
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
                            {isSelected && <Icon name="check" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <button
                type="button"
                className={`codm-toggle${onlyPromos ? ' is-on' : ''}`}
                onClick={() => setOnlyPromos(prev => !prev)}
                aria-pressed={onlyPromos}
              >
                <span className="codm-toggle-box" aria-hidden="true">
                  <Icon name="check" />
                </span>
                <span>فقط تخفیف‌دار و خرید اول</span>
              </button>

              {hasActiveFilters && (
                <button type="button" className="codm-reset-btn" onClick={resetFilters}>
                  <Icon name="refresh" />
                  <span>حذف فیلترها</span>
                </button>
              )}
            </div>

            <div className="codm-tabs" role="group" aria-label="دسته‌بندی پیشنهادها">
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

          {/* Loading overlay when switching regions */}
          {loading && (
            <div className="codm-region-loading" role="status" aria-live="polite">
              <Icon name="refresh" className="codm-spin" />
              <span>در حال بروزرسانی قیمت‌ها و پیشنهادات ریجن انتخابی…</span>
            </div>
          )}

          {/* ---------- Offers Display ---------- */}
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
              <button type="button" className="codm-cta-primary" onClick={resetFilters}>
                نمایش همه پیشنهادها
              </button>
            </div>
          ) : showSectionedLayout ? (
            <div className="codm-sections-stack">
              {store.sections.map((sec, secIdx) => (
                <section
                  key={sec.uuid || sec.id}
                  className="codm-section-block"
                  aria-labelledby={`codm-sec-${sec.id}`}
                >
                  <header className="codm-section-head">
                    <div className="codm-section-title-wrap">
                      {sec.imageUrl && (
                        <Image
                          src={sec.imageUrl}
                          alt={sec.nameFa}
                          width={44}
                          height={44}
                          className="codm-section-logo"
                        />
                      )}
                      <div>
                        <div className="codm-section-title-row">
                          <h2 id={`codm-sec-${sec.id}`} className="codm-section-title">
                            {sec.nameFa}
                          </h2>
                          <span className="codm-section-en" dir="ltr">
                            {sec.name}
                          </span>
                          <span className="codm-section-count">
                            {faNumber(sec.offers.length)} پیشنهاد
                          </span>
                        </div>
                        {sec.descriptionFa && (
                          <p className="codm-section-desc">{sec.descriptionFa}</p>
                        )}
                      </div>
                    </div>

                    <Link href="/product/cod-points" className="codm-section-buy-link">
                      <Icon name="cart" />
                      <span>خرید سی‌پی از تایتان</span>
                    </Link>
                  </header>

                  <div className="codm-grid">
                    {sec.offers.map((offer, idx) => (
                      <CodmOfferCard
                        key={offer.id}
                        offer={offer}
                        priority={secIdx === 0 && idx < 4}
                        onInspect={setInspectedOffer}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section className="codm-section-block" aria-label="لیست پیشنهادهای فیلترشده">
              <header className="codm-section-head">
                <div className="codm-section-title-row">
                  <h2 className="codm-section-title">
                    {trimmedQuery ? 'نتایج جستجو' : activeCategoryConfig.title}
                  </h2>
                  <span className="codm-section-count">
                    {faNumber(filteredOffers.length)} پیشنهاد
                  </span>
                </div>
              </header>

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
            </section>
          )}

          {/* ---------- Bottom Buy CP CTA Banner ---------- */}
          <aside className="codm-bottom-cta" aria-label="خرید سی‌پی کالاف دیوتی موبایل از تایتان">
            <div className="codm-bottom-cta-text">
              <span className="codm-bottom-kicker" dir="ltr">
                INSTANT CP TOP-UP // TITAN STORE
              </span>
              <h2>قصد خرید سی‌پی کالاف دیوتی موبایل با تحویل فوری و قیمت ریالی دارید؟</h2>
              <p>
                در فروشگاه تایتان، تمامی بسته‌های سی‌پی کالاف دیوتی موبایل به صورت کاملاً قانونی، با
                پشتیبانی ۲۴ ساعته و در سریع‌ترین زمان ممکن روی اکانت اکتیویژن شما شارژ می‌شوند.
              </p>
            </div>
            <div className="codm-hero-actions">
              <Link href="/product/cod-points" className="codm-cta-primary">
                <Icon name="cart" />
                <span>خرید سی‌پی کالاف دیوتی</span>
              </Link>
              <Link href="/store/call-of-duty" className="codm-cta-secondary">
                <span>مشاهده بتل‌پس و محصولات کالاف</span>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* ---------- Offer / Bundle Detail Modal ---------- */}
      {inspectedOffer && (
        <div
          className="codm-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="codm-modal-title"
          onClick={() => setInspectedOffer(null)}
        >
          <div className="codm-modal" onClick={e => e.stopPropagation()}>
            <div className="codm-modal-head">
              <div className="codm-modal-title-wrap">
                <span className="codm-modal-badge">{inspectedOffer.sectionNameFa}</span>
                <h3 id="codm-modal-title">{inspectedOffer.titleFa}</h3>
                <span className="codm-modal-title-en" dir="ltr">
                  {inspectedOffer.title}
                </span>
              </div>
              <button
                type="button"
                className="codm-modal-close"
                onClick={() => setInspectedOffer(null)}
                aria-label="بستن پنجره جزئیات"
              >
                <Icon name="x" />
              </button>
            </div>

            <div className="codm-modal-body">
              <div className="codm-modal-hero">
                <Image
                  src={inspectedOffer.image || FALLBACK_OFFER_IMAGE}
                  alt={inspectedOffer.titleFa}
                  width={150}
                  height={150}
                  className="codm-modal-img"
                />
                <div className="codm-modal-summary">
                  <p className="codm-modal-desc">{inspectedOffer.descriptionFa}</p>

                  {inspectedOffer.totalCp > 0 && (
                    <div className="codm-modal-cp-breakdown">
                      <div>
                        <span>سی‌پی پایه:</span>
                        <strong>{faNumber(inspectedOffer.baseCp)} CP</strong>
                      </div>
                      {inspectedOffer.bonusCp > 0 && (
                        <div>
                          <span>بونوس وب‌استور:</span>
                          <strong className="is-bonus">
                            +{faNumber(inspectedOffer.bonusCp)} CP ({faNumber(inspectedOffer.bonusPercent)}٪)
                          </strong>
                        </div>
                      )}
                      <div>
                        <span>مجموع دریافتی:</span>
                        <strong className="is-total">{faNumber(inspectedOffer.totalCp)} CP</strong>
                      </div>
                    </div>
                  )}

                  {inspectedOffer.purchaseLimit && (
                    <div className="codm-modal-limits">
                      {inspectedOffer.purchaseLimit.limit && (
                        <span>
                          محدودیت خرید: <strong>{faNumber(inspectedOffer.purchaseLimit.limit)} بار</strong>
                        </span>
                      )}
                      {inspectedOffer.purchaseLimit.endTime && (
                        <span>
                          اعتبار پیشنهاد:{' '}
                          <strong>
                            {formatRemainingValidity(
                              inspectedOffer.purchaseLimit.endTime,
                              inspectedOffer.purchaseLimit.refreshType,
                            )}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {inspectedOffer.packageItems.length > 0 && (
                <div className="codm-modal-pkg">
                  <h4 className="codm-modal-pkg-title">
                    محتویات داخل این باندل ({faNumber(inspectedOffer.packageItems.length)} آیتم):
                  </h4>
                  <div className="codm-modal-pkg-list">
                    {inspectedOffer.packageItems.map(sub => (
                      <div key={sub.id} className="codm-modal-pkg-item">
                        {sub.image && (
                          <Image
                            src={sub.image}
                            alt={sub.titleFa}
                            width={56}
                            height={56}
                            className="codm-modal-pkg-img"
                          />
                        )}
                        <div className="codm-modal-pkg-info">
                          <div className="codm-modal-pkg-head">
                            <strong>{sub.titleFa}</strong>
                            <span className="codm-modal-pkg-type">{sub.itemTypeFa}</span>
                          </div>
                          <span className="codm-modal-pkg-en" dir="ltr">
                            {sub.title}
                          </span>
                          {sub.descriptionFa && <p>{sub.descriptionFa}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="codm-modal-foot">
              <div className="codm-price-box">
                <span className="codm-price-lbl">قیمت رسمی در وب‌استور ({store?.currency})</span>
                <div className="codm-price-row">
                  {inspectedOffer.isFreebie ? (
                    <span className="codm-price-free">رایگان (FREE)</span>
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
                <span>خرید فوری سی‌پی از تایتان</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
