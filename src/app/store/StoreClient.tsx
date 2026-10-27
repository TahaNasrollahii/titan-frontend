'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { catalogApi, contentApi } from '@/lib/api/endpoints';
import type { Game, Paginated, ProductSummary, Promo } from '@/lib/api/types';
import { countdown, faNumber, mediaUrl, toman, toEnglishDigits } from '@/lib/format';
import { gameIconSrc, isLocalAsset } from '@/lib/gameIcons';
import { useApi } from '@/lib/hooks/useApi';

import './store.css';

const PRICE_LIMIT = 10_000_000;
const PAGE_SIZE = 12;
const PREMIUM_SLUG = 'premium';

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
  if (promo.product === 'apex-coins') return '/store/call-of-duty';
  if (promo.product) return `/product/${promo.product}`;
  if (promo.tournament) return `/tournaments/${promo.tournament}`;
  return promo.link || '/store';
}

function getOptimizedAssetUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.includes('games-apexlegends-background') || url.includes('games-callof-background')) return '/images/games/callof-background.webp';
  if (url.includes('games-clash-background')) return '/images/games/clash-background.webp';
  if (url.includes('games-fortnite-background')) return '/images/games/fortnite-background.webp';
  if (url.includes('games-valorant-background')) return '/images/games/valorant-background.webp';
  if (url.includes('games-apexlegends-character') || url.includes('games-callof-character')) return '/images/games/callof-character-v2.webp';
  if (url.includes('games-clash-character')) return '/images/games/clash-character.webp';
  if (url.includes('games-fortnite-character')) return '/images/games/fortnite-character.webp';
  if (url.includes('games-valorant-character')) return '/images/games/valorant-character.webp';
  return mediaUrl(url);
}

/** CSS backgrounds skip next/image, so send remote uploads through the optimizer by hand. */
function backgroundImageUrl(url: string | null | undefined, fallback: string): string {
  const src = getOptimizedAssetUrl(url, fallback);
  return /^https?:\/\//.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75` : src;
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
      <Image
        src={getOptimizedAssetUrl(promos[index]?.backgroundImage, '/images/discount.webp')}
        alt={promos[index]?.title || 'طرح تخفیف فروشگاه تایتان'}
        className="sp-discount-overlay"
        width={360}
        height={240}
        priority
      />
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
            <Image
              src={
                (promo.title.toLowerCase().includes('fortnite') ||
                  promo.product === 'fortnite-crew-pack' ||
                  promo.subtitle.includes('فورتنایت') ||
                  (promo.image && promo.image.includes('fortnite')))
                  ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
                  : getOptimizedAssetUrl(promo.image, '/images/support-robot.webp')
              }
              alt={promo.title || 'محصول ویژه فروشگاه تایتان'}
              className="sp-art discount-art"
              width={340}
              height={300}
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 340px"
              style={{
                transform: `translate(calc(var(--px) * 10px), calc(var(--py) * 10px))`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="sp-dots">
        {promos.map((promo, i) => (
          <button key={promo.id} className={`sp-dot ${index === i ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`مشاهده اسلاید ${i + 1}`}>
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
              backgroundImage: [promo.backgroundGradient, `url(${backgroundImageUrl(promo.backgroundImage, '/images/banner-hero.webp')})`]
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
            <h2>{promo.title}</h2>
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
            <Image
              src={
                (promo.title.toLowerCase().includes('fortnite') ||
                  promo.product === 'fortnite-crew-pack' ||
                  promo.subtitle.includes('فورتنایت') ||
                  (promo.image && promo.image.includes('fortnite')))
                  ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
                  : getOptimizedAssetUrl(promo.image, '/images/character-behind-login-form.webp')
              }
              alt={promo.title || 'محصول پرفروش فروشگاه تایتان'}
              className="sp-art"
              width={280}
              height={260}
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 280px"
              style={{
                transform: `translate(calc(var(--px) * 10px), calc(var(--py) * 10px))`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="sp-dots">
        {promos.map((promo, i) => (
          <button key={promo.id} className={`sp-dot ${index === i ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`مشاهده اسلاید پرفروش ${i + 1}`}>
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

const TEMPLATE_CHARACTER = '/images/character-behind-login-form.webp';

const ACCENT_COLORS = ['#ff7a2f', '#4a8bff', '#35c6ff', '#ef2f5a', '#35d07f', '#ffb800'];

const GAME_ACCENTS: Record<string, string> = {
  fortnite: '#35c6ff',
  'call-of-duty': '#f59e0b',
  'clash-of-clans': '#38bdf8',
  valorant: '#ef2f5a',
  steam: '#4a8bff',
  premium: '#ef2f5a',
};

const LOCAL_CHARACTERS = [
  TEMPLATE_CHARACTER,
  '/images/hero/characters/fortnite.webp',
  '/images/games/callof-character-v2.webp',
  '/images/games/clash-character.webp',
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
    (product.image && !product.image.endsWith('.jpg') ? mediaUrl(product.image) : null) ||
    (product.slug === 'cod-points' ? '/images/products/Molten-Gold-Lightning-King.webp' : null) ||
    (product.slug === 'clash-of-clans-gems' ? '/images/products/goblin_transparent.webp' : null) ||
    (product.slug === 'clash-of-clans-gold-pass' ? '/images/products/Barbarian-Pig-Rider-Reward-Rush.webp' : null) ||
    (product.slug === 'fortnite-starter-pack' ? '/images/products/Starter-Pack-Fortnite.webp' : null) ||
    (product.slug === 'fortnite-final-reckoning-pack' ? '/images/products/fortnite-final-reckoning-pack.webp' : null) ||
    (gameSlug === 'fortnite'
      ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
      : gameSlug === 'call-of-duty'
        ? '/images/products/Molten-Gold-Lightning-King.webp'
        : gameSlug === 'clash-of-clans'
          ? '/images/products/goblin_transparent.webp'
          : (gameSlug === 'valorant' || product.slug?.includes('valorant'))
            ? '/images/products/Jett-Inspired%20Agent%20with%20Turkish%20375%20VP%20Badge.webp'
            : product.slug.includes('v-bucks') || product.slug.includes('vbucks')
              ? '/images/products/vbucks.webp'
              : LOCAL_CHARACTERS[index % LOCAL_CHARACTERS.length]);

  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError ? SILHOUETTE_PLACEHOLDER : defaultImage;

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
        <Image
          className="pic"
          src={imgSrc}
          alt={product.imageAlt || product.title}
          width={260}
          height={285}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
          priority={index < 2}
          unoptimized={process.env.NODE_ENV !== 'production' || (typeof imgSrc === 'string' && (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')))}
          onError={() => {
            setImgError(true);
          }}
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
function ProductResults({
  query,
  initialProducts,
}: {
  query: ProductQueryState;
  initialProducts?: Paginated<ProductSummary> | null;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToast } = useAppContext();
  const isInitialMatch = useRef(Boolean(initialProducts));
  const [pages, setPages] = useState<Paginated<ProductSummary>[]>(() => (initialProducts ? [initialProducts] : []));
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    (page: number, isActive: () => boolean = () => true, silent = false) =>
      catalogApi
        .products({ ...query, page, page_size: PAGE_SIZE })
        .then(result => {
          if (!isActive()) return;
          setPages(current => (page === 1 ? [result] : [...current, result]));
          setError(null);
        })
        .catch(err => {
          if (!isActive()) return;
          if (silent) return;
          const msg = errorMessage(err);
          setError(msg);
          addToast({ title: 'خطا در بارگذاری', text: msg, icon: 'store', tone: 'error' });
        })
        .finally(() => {
          if (isActive()) setLoading(false);
        }),
    [query, addToast],
  );

  useEffect(() => {
    if (isInitialMatch.current) {
      isInitialMatch.current = false;
      return;
    }
    let active = true;
    void fetchPage(1, () => active, false);
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const hasMore = Boolean(lastPage?.next);

  const getNextPageNumber = () => {
    if (lastPage?.next) {
      try {
        const url = new URL(lastPage.next);
        const p = url.searchParams.get('page');
        if (p) return parseInt(p, 10);
      } catch {
        const match = lastPage.next.match(/[?&]page=(\d+)/);
        if (match) return parseInt(match[1], 10);
      }
    }
    return pages.length + 1;
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    void fetchPage(getNextPageNumber());
  };

  const seenIds = new Set<number>();
  const products = pages
    .flatMap(page => page?.results ?? [])
    .filter(product => {
      if (!product || seenIds.has(product.id)) return false;
      if (product.slug === 'apex-coins' || product.game?.slug === 'apex-legends') return false;
      seenIds.add(product.id);
      return true;
    });

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

export interface StoreClientProps {
  initialProducts?: Paginated<ProductSummary> | null;
  initialGames?: Game[] | null;
  initialDiscountPromos?: Promo[] | null;
  initialBestsellerPromos?: Promo[] | null;
  initialGame?: string;
}

function StorePageContent({
  initialProducts,
  initialGames,
  initialDiscountPromos,
  initialBestsellerPromos,
  initialGame,
}: StoreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeGame = initialGame !== undefined ? initialGame : (searchParams.get('game') ?? '');
  const games = useApi(() => catalogApi.games({ is_featured: true }), [], initialGames ?? undefined);
  const discountPromos = useApi(() => contentApi.promos('store_discount'), [], initialDiscountPromos ?? undefined);
  const bestsellerPromos = useApi(() => contentApi.promos('store_bestseller'), [], initialBestsellerPromos ?? undefined);

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
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
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

  const normalizedGames = useMemo(() => {
    const raw = games.data ?? [];
    const hasCod = raw.some(g => g.slug === 'call-of-duty');
    const list: Array<{ slug: string; title: string; iconImage: string | null }> = [];
    for (const g of raw) {
      if (g.slug === 'apex-legends') {
        if (!hasCod) {
          list.push({ slug: 'call-of-duty', title: 'کال آو دیوتی', iconImage: null });
        }
        continue;
      }
      list.push(g);
    }
    if (!list.some(g => g.slug === 'call-of-duty')) {
      const premIdx = list.findIndex(g => g.slug === 'premium');
      if (premIdx >= 0) list.splice(premIdx, 0, { slug: 'call-of-duty', title: 'کال آو دیوتی', iconImage: null });
      else list.push({ slug: 'call-of-duty', title: 'کال آو دیوتی', iconImage: null });
    }
    if (!list.some(g => g.slug === 'clash-of-clans')) {
      const premIdx = list.findIndex(g => g.slug === 'premium');
      if (premIdx >= 0) list.splice(premIdx, 0, { slug: 'clash-of-clans', title: 'کلش آف کلنز', iconImage: null });
      else list.push({ slug: 'clash-of-clans', title: 'کلش آف کلنز', iconImage: null });
    }
    return list;
  }, [games.data]);

  const tabs = [{ slug: '', title: 'همه', icon: null as string | null }].concat(
    normalizedGames.map(game => {
      return { slug: game.slug, title: game.title, icon: gameIconSrc(game.slug, game.iconImage) };
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
          <h2>همه محصولات</h2>
        </div>
        <Link href="/fortnite-shop" className="store-fn-shop-link">
          <span className="store-fn-shop-dot" aria-hidden="true" />
          <img
            src="/images/categories/fortnite.webp"
            alt=""
            width={32}
            height={32}
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span>آیتم شاپ زنده فورتنایت</span>
        </Link>
      </div>

      <div className="store-cat-row">
        <div className="store-tabs">
          <span className="store-tab-ind" ref={indicatorRef}></span>
          {tabs.map(tab => (
            <Link
              key={tab.slug || 'all'}
              href={tab.slug ? `/store/${tab.slug}` : '/store'}
              ref={el => {
                tabRefs.current[tab.slug] = el;
              }}
              className={`store-tab ${activeGame === tab.slug ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                // The premium artwork has built-in padding; the original design compensates for it.
                marginRight: tab.slug === PREMIUM_SLUG ? '-15px' : '0',
                textDecoration: 'none',
              }}
            >
              {tab.icon && (
                <Image
                  src={tab.icon}
                  alt=""
                  width={tab.slug === PREMIUM_SLUG ? 34 : 32}
                  height={tab.slug === PREMIUM_SLUG ? 34 : 32}
                  sizes="34px"
                  unoptimized={isLocalAsset(tab.icon)}
                  style={{
                    width: tab.slug === PREMIUM_SLUG ? '34px' : '32px',
                    height: tab.slug === PREMIUM_SLUG ? '34px' : '32px',
                    objectFit: 'contain',
                  }}
                />
              )}
              {tab.title}
            </Link>
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

      <ProductResults
        key={`${JSON.stringify(query)}:${isAuthenticated}`}
        query={query}
        initialProducts={
          query.game === (activeGame || undefined) &&
            !query.price_max &&
            query.ordering === SORTS[0].ordering
            ? initialProducts
            : null
        }
      />
    </div>
  );
}

export default function StoreClient(props: StoreClientProps) {
  return (
    <Suspense fallback={<Loading label="در حال بارگذاری فروشگاه..." />}>
      <StorePageContent {...props} />
    </Suspense>
  );
}
