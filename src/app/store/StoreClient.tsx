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
      <img src={promos[index]?.backgroundImage ?? '/images/discount.webp'} alt="" className="sp-discount-overlay" />
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
              src={
                (promo.title.toLowerCase().includes('fortnite') ||
                promo.product === 'fortnite-crew-pack' ||
                promo.subtitle.includes('فورتنایت') ||
                (promo.image && promo.image.includes('fortnite')))
                  ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
                  : (promo.image ?? '/images/support-robot.webp')
              }
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
              backgroundImage: [promo.backgroundGradient, `url(${promo.backgroundImage ?? '/images/banner-hero.webp'})`]
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
              src={
                (promo.title.toLowerCase().includes('fortnite') ||
                promo.product === 'fortnite-crew-pack' ||
                promo.subtitle.includes('فورتنایت') ||
                (promo.image && promo.image.includes('fortnite')))
                  ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
                  : (promo.image ?? '/images/character-behind-login-form.webp')
              }
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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200">' +
      '<circle cx="80" cy="62" r="34" fill="rgba(255,255,255,.22)"/>' +
      '<path d="M14 200 C14 130 42 100 80 100 C118 100 146 130 146 200 Z" fill="rgba(255,255,255,.22)"/></svg>'
  );

const TEMPLATE_CHARACTER =
  'data:image/webp;base64,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';

const ACCENT_COLORS = ['#ff7a2f', '#4a8bff', '#35c6ff', '#ef2f5a', '#35d07f', '#ffb800'];

const GAME_ACCENTS: Record<string, string> = {
  fortnite: '#35c6ff',
  'apex-legends': '#ff7a2f',
  valorant: '#ef2f5a',
  steam: '#4a8bff',
  premium: '#ef2f5a',
};

const LOCAL_CHARACTERS = [
  TEMPLATE_CHARACTER,
  '/images/hero/characters/fortnite.webp',
  '/images/hero/characters/apexlegends.webp',
  '/images/hero/characters/valorant.webp',
  '/images/products/vbucks.webp',
  '/images/character-behind-login-form.webp',
  '/images/support-robot.webp',
  '/images/games/premium.webp',
];

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

  const defaultImage =
    (product.slug.includes('elden') ? TEMPLATE_CHARACTER : null) ||
    (product.image && !product.image.endsWith('.jpg') ? product.image : null) ||
    (gameSlug === 'fortnite'
      ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
      : gameSlug === 'apex-legends'
      ? '/images/hero/characters/apexlegends.webp'
      : gameSlug === 'valorant'
      ? '/images/hero/characters/valorant.webp'
      : product.slug.includes('v-bucks') || product.slug.includes('vbucks')
      ? '/images/products/vbucks.webp'
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
  const isHot = product.badges.includes('bestseller') || ((product.popularity ?? 0) > 80);
  const isNew = product.badges.includes('new');

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', `${x * 7}deg`);
    card.style.setProperty('--rx', `${-y * 7}deg`);
    card.style.setProperty('--px', `${x * 10}px`);
    card.style.setProperty('--py', `${y * 8}px`);
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    const card = e.currentTarget;
    ['--rx', '--ry', '--px', '--py'].forEach(v => card.style.removeProperty(v));
  };

  const categoryLabel = product.subtitle || product.game?.title || product.category.name;

  return (
    <article
      className={`card ${product.inStock ? '' : 'sold'} spot reveal`}
      dir="rtl"
      style={
        {
          '--accent': accent,
          '--d': index + 3,
        } as React.CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Full card clickable link */}
      <Link href={`/product/${product.slug}`} className="card-link" aria-label={product.title} />

      {/* Atmospheric glowing backdrop */}
      <div className="bg">
        <div className="glow" />
      </div>

      {/* Top Badges and Rating */}
      <div className="top">
        <div className="tags">
          {hasDiscount && (
            <span className="pill sale">
              <span className="flame">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z" />
                </svg>
              </span>
              <span className="txt">{faNumber(discountPercent)}٪ تخفیف</span>
            </span>
          )}
          {isHot && (
            <span className="pill hot">
              پرفروش{' '}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8" />
              </svg>
            </span>
          )}
          {isNew && <span className="pill new">جدید</span>}
        </div>
        {product.rating > 0 && (
          <span className="pill rate">
            <i>★</i>{faNumber(Number(product.rating.toFixed(product.rating % 1 === 0 ? 0 : 2)))}
          </span>
        )}
      </div>

      {/* Floating Character / Artwork Stage */}
      <div className="stage">
        <img
          className="pic"
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc(SILHOUETTE_PLACEHOLDER)}
        />
      </div>

      {/* Glass Bottom Info Panel with Expandable Actions */}
      <div className="panel" dir="rtl">
        <div className="meta" dir="rtl">
          <span className="cat" title={categoryLabel} dir="rtl">
            {categoryLabel}
          </span>
          <span className={`stock ${product.inStock ? '' : 'off'}`} dir="rtl">
            {product.inStock ? 'موجود' : 'ناموجود'}
          </span>
        </div>

        <h3 className="title" title={product.title} dir="rtl">
          <Link href={`/product/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.title}
          </Link>
        </h3>

        <div className="priceRow">
          <span className="price">
            {product.hasVariants && <span className="from">از</span>}
            {product.price != null ? faNumber(product.price) : '—'}
            <small>تومان</small>
          </span>
          {product.originalPrice != null && product.originalPrice > (product.price || 0) && (
            <span className="old">{faNumber(product.originalPrice)}</span>
          )}
        </div>

        <div className="reveal">
          <div>
            <div className="actions">
              <Link
                href={`/product/${product.slug}`}
                className={`view ${product.inStock ? '' : 'ghost'}`}
                onClick={e => e.stopPropagation()}
              >
                {product.inStock ? 'مشاهده محصول' : 'موجود شد خبرم کن'}
              </Link>
              <button
                type="button"
                className={`fav ${product.isWishlisted ? 'active' : ''}`}
                aria-label="افزودن به علاقه‌مندی"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.7 4.5 7 4.5c2 0 3.4 1 5 2.8 1.6-1.8 3-2.8 5-2.8 3.3 0 5.2 3.1 4 6.3-2 4.8-9 9.2-9 9.2z" />
                </svg>
              </button>
            </div>
          </div>
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
      const localIcon = LOCAL_ICONS[game.slug] ? `/images/categories/${LOCAL_ICONS[game.slug]}.webp` : null;
      return { slug: game.slug, title: game.title, icon: game.iconImage ?? localIcon };
    }),
  );

  return (
    <div className="store-content reveal" style={{ '--d': 2 } as React.CSSProperties}>
      <div
        className="store-promos reveal"
        style={{
          '--d': 3,
          minHeight: (discountPromos.loading && !discountPromos.data) || discountPromos.data?.length || bestsellerPromos.data?.length ? '240px' : '0px',
        } as React.CSSProperties}
      >
        {discountPromos.loading && !discountPromos.data ? (
          <div
            className="store-promo promo-skeleton"
            style={{
              flex: 1,
              minHeight: '240px',
              borderRadius: '34px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          />
        ) : (
          <>
            {Boolean(discountPromos.data?.length) && <DiscountPromos promos={discountPromos.data ?? []} />}
            {Boolean(bestsellerPromos.data?.length) && <BestsellerPromos promos={bestsellerPromos.data ?? []} />}
          </>
        )}
      </div>

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
