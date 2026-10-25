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
  compareShopEntries,
  type FortniteShopData,
  getNextShopResetIso,
  type ShopEntry,
} from '@/lib/fortniteShop';

import './fortnite-shop.css';

// Fortnite-style display faces: Lalezar for Persian headings and Anton as a
// Burbank-like condensed face for Latin labels and item names.
const fnDisplayFont = Lalezar({
  weight: '400',
  subsets: ['arabic', 'latin'],
  variable: '--fn-font-display',
  display: 'swap',
});

const fnLatinFont = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--fn-font-latin',
  display: 'swap',
});

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
  accentColor: string;
}

const QUICK_CATEGORIES: QuickCategoryConfig[] = [
  { key: 'all', title: 'همه آیتم‌ها', desc: 'کاتالوگ کامل شاپ امروز', iconName: 'grid', accentColor: '#ffe14d' },
  { key: 'outfit', title: 'اسکین‌ها', desc: 'کاراکترها و اسکین‌ها', iconName: 'user', accentColor: '#4cc9ff' },
  { key: 'bundle', title: 'باندل‌ها', desc: 'پک‌های دارای تخفیف', iconName: 'gift', accentColor: '#ffb020' },
  { key: 'emote', title: 'ایموت‌ها', desc: 'حرکات نمایشی و دنس', iconName: 'sparkles', accentColor: '#d08bff' },
  { key: 'pickaxe', title: 'پیکس‌ها', desc: 'کلنگ‌ها و ابزار ضربه', iconName: 'pickaxe', accentColor: '#3ee07a' },
  { key: 'glider', title: 'گلایدرها', desc: 'گلایدرها و چترهای فرود', iconName: 'parachute', accentColor: '#7ab8ff' },
  { key: 'gear', title: 'بک‌بلینگ و رپ', desc: 'بک‌بلینگ و رپ سلاح', iconName: 'bag', accentColor: '#ff6b9a' },
  { key: 'other', title: 'موزیک و ماشین', desc: 'ترک جم، بدنه و سازها', iconName: 'music', accentColor: '#a99bff' },
];

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'discount';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'پیشنهاد شاپ' },
  { key: 'price-asc', label: 'ارزان‌ترین' },
  { key: 'price-desc', label: 'گران‌ترین' },
  { key: 'discount', label: 'بیشترین تخفیف' },
];

const SORTERS: Record<SortKey, (a: ShopEntry, b: ShopEntry) => number> = {
  featured: compareShopEntries,
  'price-asc': (a, b) => a.finalPrice - b.finalPrice || compareShopEntries(a, b),
  'price-desc': (a, b) => b.finalPrice - a.finalPrice || compareShopEntries(a, b),
  discount: (a, b) => b.discountPercent - a.discountPercent || compareShopEntries(a, b),
};

// Categories that have their own quick filter; everything else is «other»
const NAMED_CATEGORIES = new Set<string>([
  'outfit',
  'bundle',
  'emote',
  'pickaxe',
  'glider',
  'backpack',
  'wrap',
]);

function matchesQuickCategory(entry: ShopEntry, key: QuickCategoryKey): boolean {
  switch (key) {
    case 'all':
      return true;
    case 'bundle':
      return entry.category === 'bundle' || entry.isBundle;
    case 'gear':
      return entry.category === 'backpack' || entry.category === 'wrap';
    case 'other':
      return !NAMED_CATEGORIES.has(entry.category);
    default:
      return entry.category === key;
  }
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Folds Arabic/Persian letter variants, digits, ZWNJ and punctuation so
 * «ایموت ها», «ايموت‌ها» and «ایموتها» all match the same text.
 */
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

const PERSIAN_PLURAL_SUFFIX = /(های|ها)$/;
const SEARCH_STOPWORDS = new Set(['ها', 'های', 'و']);

/**
 * Each query word becomes a list of accepted spellings: «اسکین‌ها» also
 * matches the singular «اسکین» that item types are stored with.
 */
function toSearchTerms(query: string): string[][] {
  return normalizeForSearch(query)
    .split(' ')
    .filter(term => term && !SEARCH_STOPWORDS.has(term))
    .map(term => {
      const stem = term.replace(PERSIAN_PLURAL_SUFFIX, '');
      return stem !== term && stem.length >= 2 ? [term, stem] : [term];
    });
}

// Everyday words for each item type, including the tab labels used above
const TYPE_SYNONYMS: Record<string, string> = {
  outfit: 'اسکین کاراکتر skin',
  bundle: 'باندل پک بسته',
  emote: 'ایموت رقص دنس',
  pickaxe: 'پیکس پیکاکس کلنگ',
  glider: 'گلایدر چتر',
  backpack: 'بک بلینگ کوله',
  wrap: 'رپ اسلحه',
  track: 'موزیک موسیقی آهنگ ترک جم',
  car: 'ماشین خودرو',
  instrument: 'ساز موسیقی',
};

function buildSearchText(entry: ShopEntry): string {
  return normalizeForSearch(
    [
      TYPE_SYNONYMS[entry.category] ?? '',
      entry.isBundle ? TYPE_SYNONYMS.bundle : '',
      entry.name,
      entry.typeFa,
      entry.typeEn,
      entry.rarityFa,
      entry.rarityEn,
      entry.sectionName ?? '',
      entry.banner ?? '',
      ...entry.bundleItems.flatMap(item => [item.name, item.typeFa, item.typeEn]),
    ].join(' '),
  );
}

const FALLBACK_ITEM_IMAGE = '/images/hero/characters/fortnite.webp';
const PAGE_SIZE = 24;
const SHOP_CYCLE_SECONDS = 24 * 60 * 60;

type PageItem = number | 'gap';

/**
 * Page numbers with ellipsis gaps: always keeps first/last page and
 * `siblings` pages on each side of the current one.
 */
function getPageItems(current: number, total: number, siblings: number): PageItem[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  // first + last + current + 2 gaps
  if (total <= siblings * 2 + 5) return range(1, total);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftGap = left > 2;
  const showRightGap = right < total - 1;
  const edgeCount = 3 + siblings * 2;

  if (!showLeftGap) return [...range(1, edgeCount), 'gap', total];
  if (!showRightGap) return [1, 'gap', ...range(total - edgeCount + 1, total)];
  return [1, 'gap', ...range(left, right), 'gap', total];
}

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

const VBuckIcon = memo(function VBuckIcon({ src, size }: { src: string; size: number }) {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      className="fn-vbuck-icon"
    />
  );
});

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
  const cycleElapsed = Math.min(1, Math.max(0, 1 - secondsUntilReset / SHOP_CYCLE_SECONDS));

  const cells = [
    { value: hoursLeft, label: 'ساعت' },
    { value: minutesLeft, label: 'دقیقه' },
    { value: secondsLeft, label: 'ثانیه' },
  ];

  return (
    <div className="fn-timer" aria-label="شمارش معکوس تا ریست بعدی آیتم شاپ">
      <div className="fn-timer-head">
        <span className="fn-timer-title">
          <Icon name="clock" />
          ریست شاپ تا
        </span>
        <span className="fn-timer-utc" dir="ltr">
          00:00 UTC
        </span>
      </div>

      <div className="fn-timer-grid" role="timer" aria-live="off">
        {cells.map((cell, i) => (
          <React.Fragment key={cell.label}>
            {i > 0 && (
              <span className="fn-timer-sep" aria-hidden="true">
                :
              </span>
            )}
            <div className="fn-timer-cell">
              <span className="fn-timer-val" suppressHydrationWarning>
                {padPersianTwoDigits(cell.value)}
              </span>
              <span className="fn-timer-lbl">{cell.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="fn-cycle">
        <div className="fn-cycle-head">
          <span>پیشرفت چرخه امروز</span>
          <span className="fn-cycle-pct" suppressHydrationWarning>
            {faNumber(Math.round(cycleElapsed * 100))}٪
          </span>
        </div>
        <div className="fn-cycle-track" aria-hidden="true">
          <span
            className="fn-cycle-fill"
            style={{ transform: `scaleX(${cycleElapsed})` }}
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
});

const ShopItemCard = memo(function ShopItemCard({
  entry,
  priority,
  vbuckIcon,
  onInspectBundle,
}: {
  entry: ShopEntry;
  priority: boolean;
  vbuckIcon: string;
  onInspectBundle: (entry: ShopEntry) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const imgSrc = imageError || !entry.image ? FALLBACK_ITEM_IMAGE : entry.image;

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

  // Older cached payloads may not carry the tile palette yet
  const tile = entry.cardColors ?? null;

  return (
    <article
      className="fn-card"
      style={
        {
          '--rarity-color': entry.rarityColor,
          '--tile-1': tile?.primary ?? entry.rarityColor,
          '--tile-2': tile?.secondary ?? undefined,
          '--tile-3': tile?.accent ?? undefined,
          '--tile-plate': tile?.plate ?? undefined,
        } as React.CSSProperties
      }
    >
      <div className="fn-card-top">
        <span className="fn-rarity-badge" title={`${entry.rarityFa} (${entry.rarityEn})`}>
          <span className="fn-rarity-dot" aria-hidden="true" />
          <span className="fn-rarity-name">{entry.rarityFa}</span>
          <span className="fn-rarity-en" dir="ltr">
            {entry.rarityEn}
          </span>
        </span>

        {entry.discountPercent > 0 ? (
          <span className="fn-discount-pill">{faNumber(entry.discountPercent)}٪ تخفیف</span>
        ) : (
          entry.banner && (
            <span className="fn-banner-pill" dir="ltr" title={entry.banner}>
              {entry.banner}
            </span>
          )
        )}
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
            setImageError(true);
          }}
        />
      </div>

      <div className="fn-card-panel">
        <div className="fn-card-main-info">
          <h3 className="fn-card-title" title={entry.name} dir="auto">
            {entry.name}
          </h3>

          <div className="fn-price-wrap" title={`${faNumber(entry.finalPrice)} ویباکس`}>
            <VBuckIcon src={vbuckIcon} size={20} />
            <div className="fn-price-nums">
              <span className="fn-price-current">{faNumber(entry.finalPrice)}</span>
              {entry.regularPrice > entry.finalPrice && (
                <span className="fn-price-old">{faNumber(entry.regularPrice)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Hover reveal: extra info and actions */}
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
              <Link href="/product/fortnite-vbucks" className="fn-buy-vbucks-btn">
                <Icon name="cart" />
                <span className="fn-btn-label">خرید ویباکس</span>
              </Link>

              {showBundleList && (
                <button
                  type="button"
                  className="fn-bundle-popup-btn"
                  onClick={() => onInspectBundle(entry)}
                  title="مشاهده آیتم‌های این باندل"
                  aria-label={`مشاهده ${faNumber(entry.bundleItems.length)} آیتم باندل ${entry.name}`}
                >
                  <Icon name="eye" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

const ShopPagination = memo(function ShopPagination({
  page,
  totalPages,
  totalItems,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
}) {
  // Same items on server and client; narrow screens hide the neighbours in CSS
  // (deciding in JS after hydration changed the bar's height and shifted the page).
  const items = getPageItems(page, totalPages, 1);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <nav className="fn-pager" aria-label="صفحه‌بندی آیتم‌های شاپ">
      <p className="fn-pager-status" aria-live="polite">
        نمایش <strong>{faNumber(from)}</strong> تا <strong>{faNumber(to)}</strong> از{' '}
        <strong>{faNumber(totalItems)}</strong> آیتم
        <span className="fn-pager-status-page">
          صفحه {faNumber(page)} از {faNumber(totalPages)}
        </span>
      </p>

      <div className="fn-pager-controls">
        <button
          type="button"
          className="fn-pager-arrow fn-pager-arrow--prev"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="صفحه قبل"
        >
          <Icon name="chev" />
          <span className="fn-pager-arrow-label">قبلی</span>
        </button>

        <ol className="fn-pager-list">
          {items.map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className="fn-pager-gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li
                key={item}
                className={item !== page && item !== 1 && item !== totalPages ? 'is-neighbour' : undefined}
              >
                <button
                  type="button"
                  className={`fn-pager-num${item === page ? ' is-active' : ''}`}
                  onClick={() => onChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`صفحه ${faNumber(item)}`}
                >
                  {faNumber(item)}
                </button>
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          className="fn-pager-arrow"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="صفحه بعد"
        >
          <span className="fn-pager-arrow-label">بعدی</span>
          <Icon name="chev" />
        </button>
      </div>

      <div className="fn-pager-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${page / totalPages})` }} />
      </div>
    </nav>
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

  const [selectedCategory, setSelectedCategory] = useState<QuickCategoryKey>('all');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [page, setPage] = useState(1);
  const [inspectedBundle, setInspectedBundle] = useState<ShopEntry | null>(null);

  const refreshingRef = useRef(false);
  const resultsTopRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Typing stays responsive while the grid re-filters
  const deferredQuery = useDeferredValue(query);

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

  // Close sort menu on outside click or Escape
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

  const handleSelectCategory = useCallback((catKey: QuickCategoryKey) => {
    setSelectedCategory(catKey);
    setPage(1);
  }, []);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setPage(1);
    searchInputRef.current?.focus();
  }, []);

  const handleSelectSort = useCallback((nextSort: SortKey) => {
    setSortKey(nextSort);
    setPage(1);
    setSortOpen(false);
  }, []);

  const toggleDiscounted = useCallback(() => {
    setOnlyDiscounted(prev => !prev);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
    setOnlyDiscounted(false);
    setSortKey('featured');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultsTopRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  // Every offer once, in shop order, with its section name attached
  const allEntries = useMemo(() => {
    if (!shop) return [];
    const seenIds = new Set<string>();
    const list: ShopEntry[] = [];
    for (const sec of shop.sections) {
      for (const entry of sec.entries) {
        if (seenIds.has(entry.id)) continue;
        seenIds.add(entry.id);
        list.push({ ...entry, sectionName: entry.sectionName || sec.name });
      }
    }
    return list;
  }, [shop]);

  const searchIndex = useMemo(() => allEntries.map(buildSearchText), [allEntries]);

  const searchTerms = useMemo(() => toSearchTerms(deferredQuery), [deferredQuery]);

  // Search + discount applied; category counts are computed from this set
  const matchingEntries = useMemo(
    () =>
      allEntries.filter(
        (entry, i) =>
          (!onlyDiscounted || entry.discountPercent > 0) &&
          searchTerms.every(spellings => spellings.some(s => searchIndex[i].includes(s))),
      ),
    [allEntries, searchIndex, searchTerms, onlyDiscounted],
  );

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<QuickCategoryKey, number>;
    for (const cat of QUICK_CATEGORIES) {
      counts[cat.key] = matchingEntries.filter(e => matchesQuickCategory(e, cat.key)).length;
    }
    return counts;
  }, [matchingEntries]);

  const filteredEntries = useMemo(
    () =>
      matchingEntries
        .filter(e => matchesQuickCategory(e, selectedCategory))
        .sort(SORTERS[sortKey]),
    [matchingEntries, selectedCategory, sortKey],
  );

  // Shop-wide headline numbers for the hero (not affected by filters)
  const shopStats = useMemo(() => {
    let bundles = 0;
    let discounted = 0;
    let maxDiscount = 0;
    for (const e of allEntries) {
      if (matchesQuickCategory(e, 'bundle')) bundles += 1;
      if (e.discountPercent > 0) {
        discounted += 1;
        maxDiscount = Math.max(maxDiscount, e.discountPercent);
      }
    }
    return { total: allEntries.length, bundles, discounted, maxDiscount };
  }, [allEntries]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  // Clamp in case a shop refresh shrinks the list under the current page
  const currentPage = Math.min(page, totalPages);

  const displayedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, currentPage]);

  const trimmedQuery = query.trim();
  const hasActiveFilters = trimmedQuery !== '' || selectedCategory !== 'all' || onlyDiscounted;
  const persianDate = shop ? formatPersianShopDate(shop.date) : '';
  const vbuckIcon = shop?.vbuckIcon || 'https://fortnite-api.com/images/vbuck.png';

  const activeConfig =
    QUICK_CATEGORIES.find(c => c.key === selectedCategory) || QUICK_CATEGORIES[0];

  return (
    <div
      className={`fn-shop-page ${fnDisplayFont.variable} ${fnLatinFont.variable} reveal`}
      style={{ '--d': 2 } as React.CSSProperties}
    >
      {/* ---------- Hero ---------- */}
      <section className="fn-hero" aria-labelledby="fn-shop-heading">
        <div className="fn-hero-bg" aria-hidden="true">
          <Image
            src="/images/games/fortnite-background.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="fn-hero-map"
          />
          <div className="fn-hero-rays" />
          <div className="fn-hero-shade" />
        </div>

        <div className="fn-hero-content">
          <div className="fn-collab-badge" title="همکاری رسمی تایتان و شاپ زنده فورتنایت">
            <Image
              src="/titan-logo.webp"
              alt="لوگوی تایتان"
              width={30}
              height={30}
              className="fn-collab-img"
              priority
            />
            <span className="fn-collab-x" aria-hidden="true">
              ✕
            </span>
            <Image
              src="/images/glossy-fortnite-logo.webp"
              alt="لوگوی فورتنایت"
              width={30}
              height={30}
              className="fn-collab-img"
              priority
            />
            <span className="fn-collab-text" dir="ltr">
              TITAN X FORTNITE
            </span>
          </div>

          <p className="fn-hero-eyebrow" dir="ltr">
            ITEM SHOP
          </p>

          <h1 id="fn-shop-heading" className="fn-hero-title">
            آیتم شاپ امروز <span className="fn-hero-title-hl">فورتنایت</span>
          </h1>

          <div className="fn-hero-meta">
            <span className="fn-live-pill">
              <span className="fn-live-dot" aria-hidden="true" />
              زنده و خودکار
            </span>
            {persianDate && (
              <span className="fn-date-chip">
                <Icon name="clock" /> {persianDate}
              </span>
            )}
          </div>

          <p className="fn-hero-desc">
            کاتالوگ امروز را لحظه‌ای ببینید، آیتم دلخواهتان را پیدا کنید و ویباکس را فوری و قانونی از
            تایتان بخرید.
          </p>

          {shop && (
            <dl className="fn-hero-stats">
              <div className="fn-hero-stat">
                <dt>آیتم امروز</dt>
                <dd>{faNumber(shopStats.total)}</dd>
              </div>
              <div className="fn-hero-stat">
                <dt>باندل</dt>
                <dd>{faNumber(shopStats.bundles)}</dd>
              </div>
              {shopStats.maxDiscount > 0 && (
                <div className="fn-hero-stat fn-hero-stat--hot">
                  <dt>{faNumber(shopStats.discounted)} آیتم تخفیف‌دار</dt>
                  <dd>
                    <small>تا</small> {faNumber(shopStats.maxDiscount)}٪
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="fn-hero-actions">
            <Link href="/product/fortnite-vbucks" className="fn-cta-primary">
              <VBuckIcon src={vbuckIcon} size={22} />
              خرید فوری ویباکس
            </Link>
            <Link href="/store/fortnite" className="fn-cta-secondary">
              کروپک و بتل‌پس
            </Link>
          </div>
        </div>

        <div className="fn-hero-visual">
          <Image
            src="/images/hero/characters/fortnite.webp"
            alt=""
            aria-hidden="true"
            width={426}
            height={512}
            priority
            className="fn-hero-character"
          />
          <ShopCountdownTimer resetsAt={shop?.resetsAt} onResetReached={handleResetReached} />
        </div>
      </section>

      {!shop && error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => {
            void refreshShop(true);
          }}
        />
      )}

      {loading && !shop && <Loading label="در حال دریافت آیتم شاپ زنده فورتنایت" />}

      {shop && (
        <>
          {/* ---------- Search, sort & categories ---------- */}
          <section className="fn-filters" aria-labelledby="fn-filters-heading">
            <div className="fn-filters-head">
              <h2 id="fn-filters-heading">
                <span className="fn-filters-kicker" dir="ltr">
                  BROWSE
                </span>
                جستجو و دسته‌بندی
              </h2>
              {hasActiveFilters && (
                <button type="button" className="fn-filters-reset" onClick={resetFilters}>
                  <Icon name="refresh" />
                  <span>پاک کردن فیلترها</span>
                </button>
              )}
            </div>

            <div className="fn-toolbar">
              <div className="fn-search" role="search">
                <Icon name="search" />
                <input
                  ref={searchInputRef}
                  type="search"
                  className="fn-search-input"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={e => {
                    if (e.key === 'Escape' && query) {
                      e.preventDefault();
                      clearQuery();
                    }
                  }}
                  placeholder="جستجوی اسکین، ایموت، باندل یا نام آیتم…"
                  aria-label="جستجو در آیتم‌های شاپ امروز"
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    type="button"
                    className="fn-search-clear"
                    onClick={clearQuery}
                    aria-label="پاک کردن جستجو"
                  >
                    <Icon name="x" />
                  </button>
                )}
              </div>

              <div ref={sortRef} className={`fn-sort${sortOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="fn-sort-trigger"
                  onClick={() => setSortOpen(open => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-label="مرتب‌سازی آیتم‌ها"
                >
                  <span className="fn-sort-label">مرتب‌سازی</span>
                  <span className="fn-sort-value">
                    {SORT_OPTIONS.find(opt => opt.key === sortKey)?.label ?? SORT_OPTIONS[0].label}
                  </span>
                  <Icon name="chev" className="fn-sort-caret" />
                </button>

                {sortOpen && (
                  <ul className="fn-sort-menu" role="listbox" aria-label="گزینه‌های مرتب‌سازی">
                    {SORT_OPTIONS.map(opt => {
                      const isSelected = opt.key === sortKey;
                      return (
                        <li key={opt.key} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={`fn-sort-option${isSelected ? ' is-selected' : ''}`}
                            onClick={() => handleSelectSort(opt.key)}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="fn-sort-check" aria-hidden="true">
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
                className={`fn-toggle${onlyDiscounted ? ' is-on' : ''}`}
                onClick={toggleDiscounted}
                aria-pressed={onlyDiscounted}
              >
                <span className="fn-toggle-box" aria-hidden="true">
                  <Icon name="check" />
                </span>
                فقط تخفیف‌دارها
              </button>
            </div>

            <div className="fn-tabs" role="group" aria-label="دسته‌بندی آیتم‌ها">
              {QUICK_CATEGORIES.map(cat => {
                const count = categoryCounts[cat.key] ?? 0;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`fn-tab${isActive ? ' is-active' : ''}`}
                    onClick={() => handleSelectCategory(cat.key)}
                    aria-pressed={isActive}
                    disabled={count === 0 && !isActive && cat.key !== 'all'}
                    title={cat.desc}
                    style={{ '--cat-accent': cat.accentColor } as React.CSSProperties}
                  >
                    <span className="fn-tab-icon" aria-hidden="true">
                      <Icon name={cat.iconName} />
                    </span>
                    <span className="fn-tab-title">{cat.title}</span>
                    <span className="fn-tab-count">{faNumber(count)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ---------- Results ---------- */}
          <section className="fn-view-header" ref={resultsTopRef}>
            <h2>{trimmedQuery ? 'نتایج جستجو' : activeConfig.title}</h2>
            <span className="fn-view-count-badge" aria-live="polite">
              {faNumber(filteredEntries.length)} آیتم
              {trimmedQuery && (
                <>
                  {' '}
                  برای «<bdi>{trimmedQuery}</bdi>»
                </>
              )}
            </span>
          </section>

          {filteredEntries.length === 0 ? (
            <div className="fn-empty" role="status">
              <span className="fn-empty-icon" aria-hidden="true">
                <Icon name="search" />
              </span>
              <h3>
                {trimmedQuery ? (
                  <>
                    نتیجه‌ای برای «<bdi>{trimmedQuery}</bdi>» پیدا نشد
                  </>
                ) : (
                  'آیتمی با این فیلترها در شاپ امروز نیست'
                )}
              </h3>
              <p>املای نام آیتم را بررسی کنید یا دسته‌بندی و فیلترها را تغییر دهید.</p>
              <button type="button" className="fn-empty-btn" onClick={resetFilters}>
                پاک کردن جستجو و فیلترها
              </button>
            </div>
          ) : (
            <div className="fn-grid-container">
              <div className="fn-grid">
                {displayedEntries.map((entry, idx) => (
                  <ShopItemCard
                    key={entry.id}
                    entry={entry}
                    priority={idx < 4}
                    vbuckIcon={vbuckIcon}
                    onInspectBundle={setInspectedBundle}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <ShopPagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEntries.length}
                  onChange={handlePageChange}
                />
              )}
            </div>
          )}

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
                <VBuckIcon src={vbuckIcon} size={22} />
                خرید فوری ویباکس
              </Link>
              <Link href="/store/fortnite" className="fn-cta-secondary">
                تمام محصولات فورتنایت
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Bundle detail modal */}
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
                <Icon name="x" />
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
                <VBuckIcon src={vbuckIcon} size={22} />
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
