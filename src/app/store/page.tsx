'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { catalogApi, contentApi } from '@/lib/api/endpoints';
import type { Paginated, ProductSummary, Promo } from '@/lib/api/types';
import { countdown, faNumber, toman, toEnglishDigits } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import './store.css';

const PRICE_LIMIT = 10_000_000;
const PAGE_SIZE = 12;
const PREMIUM_SLUG = 'premium';

const LOCAL_ICONS: Record<string, string> = {
  'apex-legends': 'apex',
  fortnite: 'fortnite',
  valorant: 'valorant',
  premium: 'premium'
};

const SORTS: { label: string; ordering: string }[] = [
  { label: 'محبوبیت', ordering: '-popularity' },
  { label: 'قیمت: کم به زیاد', ordering: 'price' },
  { label: 'قیمت: زیاد به کم', ordering: '-price' },
  { label: 'جدیدترین', ordering: '-created_at' },
];

/** Seconds left until ``iso``, ticking every second. */
function useSecondsUntil(iso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [iso]);
  return iso ? Math.max(0, (new Date(iso).getTime() - now) / 1000) : 0;
}

/** Auto-rotating index that pauses while hovered. */
function useRotation(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || length < 2) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % length), intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, length, intervalMs]);
  return { index: length ? index % length : 0, setIndex, setPaused };
}

function promoHref(promo: Promo) {
  if (promo.product) return `/product/${promo.product}`;
  if (promo.tournament) return `/tournaments/${promo.tournament}`;
  return promo.link || '/store';
}

function DiscountPromos({ promos }: { promos: Promo[] }) {
  const { index, setIndex, setPaused } = useRotation(promos.length, 6000);
  const secondsLeft = useSecondsUntil(promos[index]?.endsAt);
  if (!promos.length) return null;

  return (
    <article
      className="store-promo main-promo spot"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="sp-bg discount-bg"></div>
      <img src={promos[index]?.backgroundImage ?? '/images/discount.png'} alt="" className="sp-discount-overlay" />
      {promos.map((promo, i) => (
        <div key={promo.id} className={`promo-slide-layer ${index === i ? 'active' : ''}`}>
          <div className="sp-content">
            <div className="sp-badges">
              <span className="sp-badge live-red">
                <Icon name="flame" /> <span className="live-badge-text">{promo.badge || 'پیشنهاد ویژه'}</span>
              </span>
              {promo.endsAt && (
                <span className="sp-badge dark">
                  <Icon name="clock" /> پایان در {countdown(secondsLeft)}
                </span>
              )}
              {promo.discountLabel && (
                <span className="sp-badge" style={{ background: '#ffeb3b', color: '#000' }}>
                  {promo.discountLabel} تخفیف
                </span>
              )}
            </div>
            <h2>{promo.title}</h2>
            <p>{promo.subtitle}</p>
            <div className="sp-foot">
              <Link href={promoHref(promo)} className="sp-btn" style={{ textDecoration: 'none' }}>
                مشاهده محصول
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '16px' }}>
                {promo.originalPrice && <span className="sp-strike">{toman(promo.originalPrice)}</span>}
                {promo.price && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{toman(promo.price)}</span>}
              </div>
            </div>
          </div>
          <div className="sp-art-wrap">
            <img
              src={promo.image ?? '/images/support-robot.png'}
              alt=""
              className="sp-art discount-art"
              style={{
                transform: `translate(calc(var(--px) * 10px), calc(var(--py) * 10px))`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="sp-dots">
        {promos.map((promo, i) => (
          <button key={promo.id} className={`sp-dot ${index === i ? 'active' : ''}`} onClick={() => setIndex(i)}>
            <span>
              <i></i>
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

function BestsellerPromos({ promos }: { promos: Promo[] }) {
  const { index, setIndex, setPaused } = useRotation(promos.length, 5000);
  if (!promos.length) return null;

  return (
    <article
      className="store-promo side-promo spot"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {promos.map((promo, i) => (
        <div key={promo.id} className={`promo-slide-layer ${index === i ? 'active' : ''}`}>
          <div
            className="sp-bg side-bg"
            style={{
              backgroundImage: [promo.backgroundGradient, `url(${promo.backgroundImage ?? '/images/banner-hero.png'})`]
                .filter(Boolean)
                .join(', '),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="sp-content side-content">
            <div className="sp-badges">
              <span className="sp-badge cream">
                <Icon name="trophy" /> {promo.badge || 'پرفروش‌ها'}
              </span>
            </div>
            <h3>{promo.title}</h3>
            <p className="side-subtitle">{promo.subtitle}</p>
            <div className="sp-foot">
              <Link
                href={promoHref(promo)}
                className="sp-btn"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                مشاهده محصول
              </Link>
              {promo.price && (
                <div style={{ marginRight: '4px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{toman(promo.price)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="sp-art-wrap side-art-wrap">
            <img
              src={promo.image ?? '/images/character-behind-login-form.png'}
              alt=""
              className="sp-art"
              style={{
                transform: `translate(calc(var(--px) * 10px), calc(var(--py) * 10px))`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="sp-dots">
        {promos.map((promo, i) => (
          <button key={promo.id} className={`sp-dot ${index === i ? 'active' : ''}`} onClick={() => setIndex(i)}>
            <span>
              <i></i>
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

const SILHOUETTE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 270">' +
      '<circle cx="80" cy="70" r="38" fill="#1b1b24"/>' +
      '<path d="M10 270 C10 170 40 130 80 130 C120 130 150 170 150 270 Z" fill="#1b1b24"/></svg>'
  );

const ACCENT_COLORS = ['#ff7a2f', '#7a3cff', '#2f8bff', '#ef2f5a', '#35d07f', '#ffb800'];

const GAME_ACCENTS: Record<string, string> = {
  fortnite: '#2f8bff',
  'apex-legends': '#ff7a2f',
  valorant: '#ef2f5a',
  premium: '#ffb800',
};

const LOCAL_CHARACTERS = [
  '/images/products/vbucks.png',
  '/images/hero/characters/fortnite.png',
  '/images/hero/characters/apexlegends.png',
  '/images/hero/characters/valorant.png',
  '/images/support-robot.png',
  '/images/character-behind-login-form.png',
];

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '226, 69, 63';
}

function ProductCard({
  product,
  index,
  onToggleWishlist,
}: {
  product: ProductSummary;
  index: number;
  onToggleWishlist: (product: ProductSummary) => void;
}) {
  const gameSlug = product.game?.slug || '';
  const accent =
    product.game?.accentColor ||
    GAME_ACCENTS[gameSlug] ||
    ACCENT_COLORS[index % ACCENT_COLORS.length];
  const accentRgb = hexToRgb(accent);

  const defaultImage =
    product.image ??
    (gameSlug === 'fortnite'
      ? '/images/hero/characters/fortnite.png'
      : gameSlug === 'apex-legends'
      ? '/images/hero/characters/apexlegends.png'
      : gameSlug === 'valorant'
      ? '/images/hero/characters/valorant.png'
      : LOCAL_CHARACTERS[index % LOCAL_CHARACTERS.length]);

  const [imgSrc, setImgSrc] = useState(defaultImage);

  useEffect(() => {
    setImgSrc(defaultImage);
  }, [defaultImage]);

  const discountPercent =
    product.discountPercent > 0
      ? product.discountPercent
      : product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const hasDiscount = discountPercent > 0 || product.badges.includes('discount');
  const isHot = product.badges.includes('bestseller');
  const isNew = product.badges.includes('new');

  const deliveryBadge =
    product.deliveryType === 'code'
      ? 'کد آنی'
      : product.deliveryType === 'account'
      ? 'شارژ مستقیم'
      : product.deliveryType === 'manual'
      ? 'تحویل فوری'
      : null;

  return (
    <article
      className="tc-card spot reveal"
      style={
        {
          '--accent': accent,
          '--accent-rgb': accentRgb,
          '--d': index + 3,
        } as React.CSSProperties
      }
    >
      {/* Full card clickable link */}
      <Link href={`/product/${product.slug}`} className="tc-card-link" aria-label={product.title} />

      {/* Atmospheric cyber background glow */}
      <div className="tc-ambient-glow" />

      {/* Visual Showcase Stage */}
      <div className="tc-stage">
        <div className="tc-stage-aura" />
        <div className="tc-stage-grid" />

        {/* Floating Badges & Wishlist (Top) */}
        <div className="tc-badges-top">
          <div className="tc-badge-group">
            {hasDiscount && (
              <span className="tc-badge tc-b-discount">
                <Icon name="flame" />
                <span>{discountPercent > 0 ? `${faNumber(discountPercent)}٪` : 'تخفیف'}</span>
              </span>
            )}
            {isHot && (
              <span className="tc-badge tc-b-hot">
                <Icon name="trophy" />
                <span>پرفروش</span>
              </span>
            )}
            {isNew && <span className="tc-badge tc-b-new">جدید</span>}
          </div>

          <button
            type="button"
            className={`tc-fav-btn ${product.isWishlisted ? 'active' : ''}`}
            aria-label="افزودن به علاقه‌مندی"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={product.isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Product Artwork Showcase */}
        <div className="tc-art-wrapper">
          <img
            className="tc-product-img"
            src={imgSrc}
            alt={product.title}
            onError={() => setImgSrc(SILHOUETTE_PLACEHOLDER)}
          />
        </div>

        {/* Stage Bottom Footer */}
        <div className="tc-stage-footer">
          <span className={`tc-stock-pill ${product.inStock ? 'in' : 'out'}`}>
            <span className="tc-stock-dot" />
            <span>{product.inStock ? 'موجود' : 'ناموجود'}</span>
          </span>

          {product.rating > 0 && (
            <span className="tc-rating-pill">
              <i>★</i>
              <span>{faNumber(product.rating)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Content Section */}
      <div className="tc-content">
        <div className="tc-meta-row">
          <span className="tc-game-tag">
            <span className="tc-game-dot" />
            {product.game?.title || product.category.name}
          </span>
          {deliveryBadge && <span className="tc-delivery-badge">{deliveryBadge}</span>}
        </div>

        <h3 className="tc-title" title={product.title}>
          {product.title}
        </h3>

        <div className="tc-price-box">
          <div className="tc-price-main">
            {product.hasVariants && <span className="tc-from-label">از</span>}
            <span className="tc-amount">
              {product.price != null ? faNumber(product.price) : '—'}
            </span>
            <span className="tc-currency">تومان</span>
          </div>
          {product.originalPrice != null && product.originalPrice > (product.price || 0) && (
            <span className="tc-original-price">{faNumber(product.originalPrice)}</span>
          )}
        </div>

        {/* Action Button */}
        <div className="tc-cta-wrap">
          <Link
            href={`/product/${product.slug}`}
            className="tc-cta-btn"
            onClick={e => e.stopPropagation()}
          >
            <span>{product.hasVariants ? 'انتخاب گزینه' : 'مشاهده و خرید'}</span>
            <Icon name="chev" className="tc-cta-icon" />
          </Link>
        </div>
      </div>
    </article>
  );
}

interface ProductQueryState {
  game?: string;
  price_max?: number;
  ordering: string;
}

/** Paginated product grid. Keyed by its query, so a filter change starts again from page 1. */
function ProductResults({ query }: { query: ProductQueryState }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToast } = useAppContext();
  const [pages, setPages] = useState<Paginated<ProductSummary>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    (page: number, isActive: () => boolean = () => true) =>
      catalogApi
        .products({ ...query, page, page_size: PAGE_SIZE })
        .then(result => {
          if (!isActive()) return;
          setPages(current => (page === 1 ? [result] : [...current, result]));
          setError(null);
        })
        .catch(err => isActive() && setError(errorMessage(err)))
        .finally(() => isActive() && setLoading(false)),
    [query],
  );

  useEffect(() => {
    let active = true;
    void fetchPage(1, () => active);
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const loadMore = () => {
    setLoading(true);
    void fetchPage(pages.length + 1);
  };

  const products = pages.flatMap(page => page.results);
  const hasMore = Boolean(pages.at(-1)?.next);

  const toggleWishlist = async (product: ProductSummary) => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent('/store')}`);
      return;
    }
    const setFlag = (value: boolean) =>
      setPages(current =>
        current.map(page => ({
          ...page,
          results: page.results.map(p => (p.slug === product.slug ? { ...p, isWishlisted: value } : p)),
        })),
      );
    setFlag(!product.isWishlisted);
    try {
      if (product.isWishlisted) await catalogApi.removeFromWishlist(product.slug);
      else await catalogApi.addToWishlist(product.slug);
    } catch (err) {
      setFlag(product.isWishlisted);
      addToast({ title: 'علاقه‌مندی‌ها', text: errorMessage(err), icon: 'favorite', tone: 'error' });
    }
  };

  if (error && !products.length) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setLoading(true);
          void fetchPage(1);
        }}
      />
    );
  }

  return (
    <>
      <div className="store-grid">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i % PAGE_SIZE} onToggleWishlist={toggleWishlist} />
        ))}
      </div>

      {loading && <Loading compact={products.length > 0} />}
      {!loading && hasMore && (
        <div className="store-load-wrap">
          <button className="store-load-btn" onClick={loadMore}>
            بارگذاری بیشتر <Icon name="chev" />
          </button>
        </div>
      )}
      {!loading && products.length === 0 && <div className="store-empty">هیچ محصولی با فیلترهای شما مطابقت ندارد.</div>}
    </>
  );
}

function StorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeGame = searchParams.get('game') ?? '';
  const games = useApi(() => catalogApi.games({ is_featured: true }));
  const discountPromos = useApi(() => contentApi.promos('store_discount'));
  const bestsellerPromos = useApi(() => contentApi.promos('store_bestseller'));

  const [priceMax, setPriceMax] = useState(PRICE_LIMIT);
  const [appliedPriceMax, setAppliedPriceMax] = useState(PRICE_LIMIT);
  const [priceOpen, setPriceOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState(SORTS[0]);

  // Debounce the price slider so dragging doesn't fire a request per pixel.
  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedPriceMax(priceMax), 350);
    return () => window.clearTimeout(timer);
  }, [priceMax]);

  const { isAuthenticated } = useAuth();
  const query = useMemo<ProductQueryState>(
    () => ({
      game: activeGame || undefined,
      price_max: appliedPriceMax < PRICE_LIMIT ? appliedPriceMax : undefined,
      ordering: sort.ordering,
    }),
    [activeGame, appliedPriceMax, sort],
  );

  // Tab underline indicator.
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = tabRefs.current[activeGame];
    const indicator = indicatorRef.current;
    if (!el || !indicator) return;
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    indicator.style.width = `${el.offsetWidth}px`;
  }, [activeGame, games.data]);

  // Pointer parallax and spotlight on the promo cards.
  useEffect(() => {
    const move = (e: Event) => {
      const pe = e as PointerEvent;
      const el = pe.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = pe.clientX - rect.left;
      const y = pe.clientY - rect.top;
      el.style.setProperty('--px', String((x / rect.width) * 2 - 1));
      el.style.setProperty('--py', String((y / rect.height) * 2 - 1));
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const leave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };
    const promos = document.querySelectorAll('.store-promo');
    promos.forEach(el => {
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', leave, { passive: true });
    });
    return () =>
      promos.forEach(el => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
  }, [discountPromos.data, bestsellerPromos.data]);

  const selectGame = (slug: string) => router.replace(slug ? `/store?game=${slug}` : '/store', { scroll: false });

  const tabs = [{ slug: '', title: 'همه', icon: null as string | null }].concat(
    (games.data ?? []).map(game => {
      const localIcon = LOCAL_ICONS[game.slug] ? `/images/categories/${LOCAL_ICONS[game.slug]}.png` : null;
      return { slug: game.slug, title: game.title, icon: game.iconImage ?? localIcon };
    }),
  );

  return (
    <div className="store-content reveal" style={{ '--d': 2 } as React.CSSProperties}>
      {(discountPromos.data?.length || bestsellerPromos.data?.length) ? (
        <div className="store-promos reveal" style={{ '--d': 3 } as React.CSSProperties}>
          <DiscountPromos promos={discountPromos.data ?? []} />
          <BestsellerPromos promos={bestsellerPromos.data ?? []} />
        </div>
      ) : null}

      <div className="store-sec-h">
        <div className="store-sec-l">
          <h3>همه محصولات</h3>
        </div>
      </div>

      <div className="store-cat-row">
        <div className="store-tabs">
          <span className="store-tab-ind" ref={indicatorRef}></span>
          {tabs.map(tab => (
            <button
              key={tab.slug || 'all'}
              ref={el => {
                tabRefs.current[tab.slug] = el;
              }}
              className={`store-tab ${activeGame === tab.slug ? 'active' : ''}`}
              onClick={() => selectGame(tab.slug)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                // The premium artwork has built-in padding; the original design compensates for it.
                marginRight: tab.slug === PREMIUM_SLUG ? '-15px' : '0',
              }}
            >
              {tab.icon && (
                <img
                  src={tab.icon}
                  alt=""
                  style={{
                    width: tab.slug === PREMIUM_SLUG ? '34px' : '32px',
                    height: tab.slug === PREMIUM_SLUG ? '34px' : '32px',
                    objectFit: 'contain',
                  }}
                />
              )}
              {tab.title}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="store-sort">
            <button
              className="store-sort-btn"
              onClick={() => {
                setPriceOpen(!priceOpen);
                setSortOpen(false);
              }}
            >
              <Icon name="sliders" /> قیمت تا: {priceMax >= PRICE_LIMIT ? 'نامحدود' : toman(priceMax)}{' '}
              <Icon name="chev" className="sort-chev" />
            </button>
            {priceOpen && (
              <div className="store-sort-drop" style={{ minWidth: '260px', padding: '24px 16px', zIndex: 101 }}>
                <div className="sf-range-wrap" dir="ltr">
                  <input
                    type="range"
                    min="0"
                    max={PRICE_LIMIT}
                    step="100000"
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                    className="sf-range"
                  />
                  <div className="sf-range-track" style={{ width: `${(priceMax / PRICE_LIMIT) * 100}%` }}></div>
                  <div
                    className="sf-range-pill"
                    style={{
                      left: `${(priceMax / PRICE_LIMIT) * 100}%`,
                      transform: `translate(-${(priceMax / PRICE_LIMIT) * 100}%, -50%)`,
                    }}
                    dir="rtl"
                  >
                    <input
                      type="text"
                      value={faNumber(priceMax)}
                      onChange={e => {
                        const value = Number(toEnglishDigits(e.target.value).replace(/\D/g, ''));
                        setPriceMax(Math.min(value, PRICE_LIMIT));
                      }}
                      className="sf-pill-input"
                      dir="ltr"
                    />
                    <span>تومان</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="store-sort">
            <button
              className="store-sort-btn"
              onClick={() => {
                setSortOpen(!sortOpen);
                setPriceOpen(false);
              }}
            >
              <Icon name="arrow" className="sort-icon-rev" /> مرتب‌سازی: {sort.label}{' '}
              <Icon name="chev" className="sort-chev" />
            </button>
            {sortOpen && (
              <div className="store-sort-drop">
                {SORTS.map(option => (
                  <button
                    key={option.ordering}
                    onClick={() => {
                      setSort(option);
                      setSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductResults key={`${JSON.stringify(query)}:${isAuthenticated}`} query={query} />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<Loading label="در حال بارگذاری فروشگاه..." />}>
      <StorePageContent />
    </Suspense>
  );
}
