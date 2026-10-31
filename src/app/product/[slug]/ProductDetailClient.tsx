'use client';

import {
  BadgePercent,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Flame,
  Gamepad2,
  Headphones,
  Heart,
  Info,
  KeyRound,
  MessageSquare,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { catalogApi } from '@/lib/api/endpoints';
import type {
  DeliveryType,
  GuideSummary,
  Paginated,
  Product,
  ProductSummary,
  ProductVariant,
  Review,
} from '@/lib/api/types';
import { gameIconSrc, gameWatermarkSrc, isLocalAsset } from '@/lib/gameIcons';
import { faNumber, mediaUrl, productPrice, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './product.module.css';
import { enrichProductSeo, getProductKeywords, parseDescriptionBlocks } from './productSeoContent';
import { ReviewsSection, Stars } from './ReviewsSection';

const TITAN_RED = '#e2453f';
const MAX_QUANTITY = 20;

const FEATURE_ICONS: Record<string, React.ElementType> = {
  shield: ShieldCheck,
  chat: MessageSquare,
  flame: Flame,
};

// Shown when a product has no features of its own; same promises as the site footer
const DEFAULT_PERKS = [
  { icon: 'shield', title: 'خرید قانونی و اورجینال', description: 'ضمانت اصالت کالا' },
  { icon: 'flame', title: 'تحویل سریع', description: 'پردازش فوری سفارش' },
  { icon: 'chat', title: 'پشتیبانی ۲۴ ساعته', description: 'همراه شما تا تحویل' },
];

const SPEC_LABELS: Record<string, string> = {
  region: 'ریجن',
  delivery: 'زمان تحویل',
  activation: 'نحوه فعال‌سازی',
  warranty: 'گارانتی',
  condition: 'وضعیت کالا',
};

const DELIVERY_LABELS: Record<DeliveryType, string> = {
  code: 'تحویل به صورت کد',
  account: 'شارژ مستقیم روی اکانت',
  manual: 'تحویل با هماهنگی پشتیبانی',
};

const DELIVERY_STEPS: Record<DeliveryType, { icon: React.ElementType; title: string; text: string }[]> = {
  code: [
    { icon: CreditCard, title: 'انتخاب و پرداخت', text: 'گزینه‌ی دلخواه را انتخاب کنید و از درگاه امن پرداخت را انجام دهید.' },
    { icon: KeyRound, title: 'دریافت کد', text: 'کد اختصاصی شما در صفحه‌ی سفارش، داخل پنل کاربری نمایش داده می‌شود.' },
    { icon: Sparkles, title: 'فعال‌سازی', text: 'کد را در پلتفرم مربوط وارد کنید؛ اعتبار بلافاصله فعال می‌شود.' },
  ],
  account: [
    { icon: CreditCard, title: 'انتخاب و پرداخت', text: 'گزینه‌ی دلخواه را انتخاب کنید و از درگاه امن پرداخت را انجام دهید.' },
    { icon: UserRound, title: 'انتخاب اکانت بازی', text: 'هنگام تسویه حساب، اکانت بازی‌ای را که باید شارژ شود انتخاب یا ثبت می‌کنید.' },
    { icon: Zap, title: 'شارژ روی اکانت', text: 'تیم تایتان سفارش را مستقیم روی همان اکانت اعمال می‌کند.' },
  ],
  manual: [
    { icon: CreditCard, title: 'ثبت سفارش', text: 'گزینه‌ی دلخواه را انتخاب کنید و سفارش را پرداخت کنید.' },
    { icon: Headphones, title: 'هماهنگی', text: 'کارشناسان پشتیبانی برای تحویل با شما هماهنگ می‌کنند.' },
    { icon: Package, title: 'تحویل', text: 'سفارش مطابق توضیحات محصول به شما تحویل داده می‌شود.' },
  ],
};

const SECTIONS = [
  { id: 'pd-about', label: 'توضیحات' },
  { id: 'pd-specs', label: 'مشخصات' },
  { id: 'pd-delivery', label: 'نحوه دریافت' },
  { id: 'pd-reviews', label: 'نظرات' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

/** Pick the cheapest in-stock option so the page opens on something purchasable. */
function defaultVariant(product: Product): ProductVariant | null {
  return product.variants.find(v => v.inStock) ?? product.variants[0] ?? null;
}

function scrollToSection(id: string) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function PlatformGlyph({ slug, icon }: { slug: string; icon?: string | null }) {
  switch (slug) {
    case 'pc':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 5.45 10.9 4.3v7.15H3V5.45Zm0 13.1 7.9 1.15v-7.15H3v6Zm8.8 1.28L21 21.2v-8.65h-9.2v7.28Zm0-15.66v7.28H21V2.8l-9.2 1.37Z" />
        </svg>
      );
    case 'playstation':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9.5 4.2v14.9l3.3 1.1V8.3c0-.7.3-1.1.8-1 .6.2.7.7.7 1.4v5.2c2.1.7 3.8-.1 3.8-2.9 0-2.7-1-3.9-3.9-4.9-1.3-.5-3.1-1.2-4.7-1.9ZM8.3 13.4l-4.2 1.5c-1.6.6-2.5 1.4-2.1 2.4.4 1 1.9 1.3 3.7.7l2.6-.9v-1.8l-2.1.7c-.7.2-1.4.1-1.5-.3-.1-.3.3-.7 1-.9l2.6-.9v-.5Zm12.9 1.4c-1.3-.5-3-.6-4.7-.1l-2.8.9v1.9l2.4-.8c.8-.3 1.7-.2 1.9.2.2.4-.2.8-1 1.1l-3.3 1.2v1.9l4.9-1.8c1.6-.6 2.4-1.4 2.1-2.4-.2-.9-.7-1.6-1.5-2.1Z" />
        </svg>
      );
    case 'xbox':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-4.9 3.05c1.4-.3 3.3.35 4.9 1.75 1.6-1.4 3.5-2.05 4.9-1.75.45.1.85.3 1.2.55-1.45.75-3.15 2.15-4.65 3.9 1.95 2.45 3.65 5.65 3.75 8.45-.85.9-1.9 1.6-3.1 2.05-.35-2.55-2.15-5.55-5.1-8.2-2.95 2.65-4.75 5.65-5.1 8.2-1.2-.45-2.25-1.15-3.1-2.05.1-2.8 1.8-6 3.75-8.45-1.5-1.75-3.2-3.15-4.65-3.9.35-.25.75-.45 1.2-.55Z" />
        </svg>
      );
    case 'nintendo':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10.4 3H7.2A4.2 4.2 0 0 0 3 7.2v9.6A4.2 4.2 0 0 0 7.2 21h3.2V3Zm-1.6 1.8v14.4H7.2a2.4 2.4 0 0 1-2.4-2.4V7.2a2.4 2.4 0 0 1 2.4-2.4h1.6ZM6.8 7.6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM16.8 3h-3.2v18h3.2a4.2 4.2 0 0 0 4.2-4.2V7.2A4.2 4.2 0 0 0 16.8 3Zm.4 12.2a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z" />
        </svg>
      );
    case 'mobile':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6" y="2.5" width="12" height="19" rx="3" />
          <path d="M10 18.2h4" />
        </svg>
      );
    default:
      return icon ? (
        <Image src={mediaUrl(icon)} alt="" width={18} height={18} sizes="18px" />
      ) : (
        <Gamepad2 size={16} aria-hidden="true" />
      );
  }
}

interface ProductDetailClientProps {
  initialData?: Product | null;
  initialRelated?: ProductSummary[];
  initialReviews?: Paginated<Review>;
  /** How-to guide for buying or activating this product. */
  guide?: GuideSummary | null;
}

export default function ProductPage({ initialData, initialRelated, initialReviews, guide }: ProductDetailClientProps) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToast } = useAppContext();

  const product = useApi(() => catalogApi.product(slug), [slug], initialData ?? undefined);
  const related = useApi(() => catalogApi.related(slug), [slug], initialRelated);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('pd-about');
  const [showBuyBar, setShowBuyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(true);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRelated = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const checkRelatedScroll = () => {
    const el = relatedScrollRef.current;
    if (!el) return;
    const scrollPos = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollRight(scrollPos > 10);
    setCanScrollLeft(scrollPos < maxScroll - 10);
  };

  useEffect(() => {
    const el = relatedScrollRef.current;
    if (!el) return;
    checkRelatedScroll();
    el.addEventListener('scroll', checkRelatedScroll, { passive: true });
    window.addEventListener('resize', checkRelatedScroll);
    return () => {
      el.removeEventListener('scroll', checkRelatedScroll);
      window.removeEventListener('resize', checkRelatedScroll);
    };
  }, [related.data]);

  const scrollRelated = (direction: 'left' | 'right') => {
    const el = relatedScrollRef.current;
    if (!el) return;
    const step = 460;
    const delta = direction === 'left' ? -step : step;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleRelatedMouseDown = (e: React.MouseEvent) => {
    const el = relatedScrollRef.current;
    if (!el) return;
    isDraggingRelated.current = true;
    dragMoved.current = false;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = el.scrollLeft;
  };

  const handleRelatedMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRelated.current) return;
    const el = relatedScrollRef.current;
    if (!el) return;
    const deltaX = e.pageX - dragStartX.current;
    if (Math.abs(deltaX) > 4) {
      dragMoved.current = true;
      e.preventDefault();
      el.scrollLeft = dragScrollLeft.current - deltaX;
    }
  };

  const handleRelatedMouseUp = () => {
    isDraggingRelated.current = false;
  };

  const data = useMemo(() => (product.data ? enrichProductSeo(product.data) : null), [product.data]);
  const hasData = Boolean(data);
  // Until the user picks one, the cheapest in-stock option is selected.
  const variant = useMemo(
    () => (data ? data.variants.find(v => v.id === variantId) ?? defaultVariant(data) : null),
    [data, variantId],
  );

  const fallbackImage = useMemo(() => {
    if (!data) return '/images/banner-hero.webp';
    if (data.slug === 'cod-points') return '/images/products/Molten-Gold-Lightning-King.webp';
    if (data.slug === 'clash-of-clans-gems') return '/images/products/goblin_transparent.webp';
    if (data.slug === 'clash-of-clans-gold-pass') return '/images/products/Barbarian-Pig-Rider-Reward-Rush.webp';
    if (data.slug === 'fortnite-starter-pack') return '/images/products/Starter-Pack-Fortnite.webp';
    if (data.slug === 'fortnite-final-reckoning-pack') return '/images/products/fortnite-final-reckoning-pack.webp';
    if (data.slug?.includes('valorant') || data.game?.slug === 'valorant') {
      return '/images/products/Jett-Inspired%20Agent%20with%20Turkish%20375%20VP%20Badge.webp';
    }
    return '/images/banner-hero.webp';
  }, [data]);

  const currentImage = selectedImage || (data?.image ? mediaUrl(data.image) : fallbackImage);

  // Activate matching tab if the URL contains a section hash on mount or hash change
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (SECTIONS.some(s => s.id === hash)) {
        setActiveSection(hash as SectionId);
      }
    };
    const frameId = window.requestAnimationFrame(syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  // Close the option picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!optionsOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOptionsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [optionsOpen]);

  // Compact buy bar once the main button has scrolled away; hidden over the footer
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const footer = document.querySelector('main > footer');
    let ctaPassed = false;
    let footerInView = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === cta) ctaPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        else footerInView = entry.isIntersecting;
      }
      setShowBuyBar(ctaPassed && !footerInView);
    });
    observer.observe(cta);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [hasData]);

  // Lets the support widget lift its button above the bar on phones
  useEffect(() => {
    document.documentElement.toggleAttribute('data-buy-bar', showBuyBar);
    return () => document.documentElement.removeAttribute('data-buy-bar');
  }, [showBuyBar]);

  if (product.loading && !data) return <Loading />;
  if (!data) return <ErrorState error={product.error} onRetry={product.reload} />;

  // The selected option drives price/discount/stock; fixed-price products use their own values.
  const price = variant ? variant.price : data.price;
  const originalPrice = variant ? variant.originalPrice : data.originalPrice;
  const discount = variant ? variant.discountPercent : data.discountPercent;
  const inStock = variant ? variant.inStock : data.inStock;
  const savings = price != null && originalPrice != null && originalPrice > price ? originalPrice - price : 0;

  const accent = data.game?.accentColor || TITAN_RED;
  const gameIcon = data.game ? gameIconSrc(data.game.slug, data.game.iconImage) : null;
  const watermark = data.game ? gameWatermarkSrc(data.game.slug) : null;
  const deliveryLabel = data.deliveryInfo || DELIVERY_LABELS[data.deliveryType];
  const perks = data.features.length > 0 ? data.features : DEFAULT_PERKS;
  const descriptionBlocks = parseDescriptionBlocks(data.description || '');
  const keywords = getProductKeywords(data);
  const mainAlt = data.imageAlt || data.title;
  const galleryImages = [
    ...(data.image ? [{ src: mediaUrl(data.image), alt: mainAlt }] : []),
    ...data.gallery.filter(g => g.image).map(g => ({ src: mediaUrl(g.image), alt: g.alt || mainAlt })),
  ];

  const specs: [string, string][] = [
    ...(data.game ? [['بازی', `${data.game.title} (${data.game.titleEn})`] as [string, string]] : []),
    ['دسته‌بندی', data.category.name],
    ...(data.vendor ? [['ناشر / فروشگاه', data.vendor] as [string, string]] : []),
    ...(data.platforms.length
      ? [['پلتفرم‌ها', data.platforms.map(p => p.name).join('، ')] as [string, string]]
      : []),
    ['نوع تحویل', deliveryLabel],
    ...Object.entries(data.specs)
      .filter(([key]) => key !== 'keywords')
      .map(([key, value]) => [SPEC_LABELS[key] ?? key, String(value)] as [string, string]),
  ];

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/product/${data.slug}`);
      return;
    }
    const wished = data.isWishlisted;
    product.setData({ ...data, isWishlisted: !wished });
    try {
      if (wished) await catalogApi.removeFromWishlist(data.slug);
      else await catalogApi.addToWishlist(data.slug);
    } catch (error) {
      product.setData({ ...data, isWishlisted: wished });
      addToast({ title: 'علاقه‌مندی‌ها', text: errorMessage(error), icon: 'favorite', tone: 'error' });
    }
  };

  const handleAddToCart = async () => {
    if (data.hasVariants && !variant) {
      addToast({ title: 'یک گزینه انتخاب کنید', icon: 'store', tone: 'warning' });
      return;
    }
    setAdding(true);
    await addToCart({
      product: {
        slug: data.slug,
        title: data.title,
        image: data.image,
        price: data.price,
        originalPrice: data.originalPrice,
        requiresGameAccount: data.requiresGameAccount,
        credentialType: data.credentialType,
      },
      variant,
      quantity,
    });
    setAdding(false);
  };

  // Radio-group keys; in RTL the left arrow moves to the next option
  const handleOptionKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const choices = data.variants.filter(v => v.inStock);
    if (!choices.length) return;
    const current = choices.findIndex(v => v.id === variant?.id);
    const next = choices[(current + step + choices.length) % choices.length];
    setVariantId(next.id);
    e.currentTarget.querySelector<HTMLElement>(`[data-variant-id="${next.id}"]`)?.focus();
  };

  const priceText = price != null ? faNumber(price) : productPrice(data);
  const cartLabel = !inStock ? 'ناموجود' : adding ? 'در حال افزودن…' : 'افزودن به سبد خرید';

  return (
    <div className={styles.page} dir="rtl" style={{ '--accent': accent } as React.CSSProperties}>
      {/* ---------- Hero: product stage + purchase panel ---------- */}
      <section className={styles.hero}>
        <div className={styles.stageColumn}>
          <div className={styles.stage}>
            <div className={styles.stageBackdrop} aria-hidden="true">
              <span className={styles.stageGlow} />
              <span className={styles.stageRing} />
              <span className={styles.stageGrid} />
              {watermark && (
                <Image src={watermark} alt="" width={512} height={341} className={styles.stageWatermark} unoptimized />
              )}
            </div>

            <div className={styles.stageBadges}>
              {data.badges.includes('bestseller') && (
                <span className={`${styles.badge} ${styles.badgeGold}`}>
                  <Trophy size={14} aria-hidden="true" /> پرفروش
                </span>
              )}
              {data.badges.includes('new') && <span className={styles.badge}>جدید</span>}
              {discount > 0 && (
                <span className={`${styles.badge} ${styles.badgeSale}`}>
                  <BadgePercent size={14} aria-hidden="true" /> ٪{faNumber(discount)} تخفیف
                </span>
              )}
            </div>

            <div className={styles.stageArt}>
              <Image
                src={currentImage}
                alt={mainAlt}
                className={styles.stageImage}
                width={560}
                height={560}
                priority
                sizes="(max-width: 900px) 80vw, 480px"
                unoptimized={process.env.NODE_ENV !== 'production'}
                onError={() => {
                  if (currentImage !== fallbackImage) setSelectedImage(fallbackImage);
                }}
              />
              <span className={styles.stageFloor} aria-hidden="true" />
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className={styles.thumbs} role="list" aria-label="تصاویر محصول">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.src + idx}
                  type="button"
                  role="listitem"
                  className={`${styles.thumb} ${currentImage === img.src ? styles.thumbActive : ''}`}
                  onClick={() => setSelectedImage(img.src)}
                  aria-label={`نمایش تصویر ${faNumber(idx + 1)}`}
                  aria-current={currentImage === img.src}
                >
                  <Image
                    src={img.src}
                    alt=""
                    width={72}
                    height={72}
                    sizes="72px"
                    unoptimized={process.env.NODE_ENV !== 'production'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.eyebrow}>
            {data.game ? (
              <Link href={`/store/${data.game.slug}`} className={styles.gameChip}>
                {gameIcon ? (
                  <Image src={gameIcon} alt="" width={20} height={20} sizes="20px" unoptimized={isLocalAsset(gameIcon)} />
                ) : (
                  <Gamepad2 size={16} aria-hidden="true" />
                )}
                {data.game.title}
              </Link>
            ) : null}
            <span className={styles.categoryChip}>{data.category.name}</span>
            {guide && (
              <Link href={`/guides/${guide.slug}`} className={styles.guideChip} title={guide.title}>
                <BookOpen size={15} aria-hidden="true" />
                آموزش خرید و فعال‌سازی
              </Link>
            )}
          </div>

          <h1 className={styles.title}>{data.title}</h1>
          {data.subtitle && <p className={styles.subtitle}>{data.subtitle}</p>}

          <div className={styles.metaRow}>
            <a
              href="#pd-reviews"
              className={styles.ratingLink}
              onClick={e => {
                e.preventDefault();
                setActiveSection('pd-reviews');
                scrollToSection('pd-tabs');
              }}
            >
              <span className={styles.ratingGlow} aria-hidden="true" />
              {data.reviewCount > 0 ? (
                <>
                  <span className={styles.ratingBadge}>
                    <Star size={14} fill="currentColor" aria-hidden="true" />
                    <span className={styles.ratingScore}>{faNumber(Number(data.rating.toFixed(1)))}</span>
                    <span className={styles.ratingOut}>/ ۵</span>
                  </span>
                  <span className={styles.ratingBody}>
                    <Stars value={data.rating} />
                    <span className={styles.ratingCount}>{faNumber(data.reviewCount)} دیدگاه خریداران</span>
                  </span>
                  <span className={styles.ratingAction}>
                    <span>نظرات</span>
                    <ChevronLeft size={14} aria-hidden="true" />
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.ratingBadge}>
                    <Star size={14} fill="currentColor" aria-hidden="true" />
                    <span className={styles.ratingScore}>۵.۰</span>
                  </span>
                  <span className={styles.ratingBody}>
                    <span className={styles.ratingCount}>هنوز نظری ثبت نشده؛ اولین نفر باشید</span>
                  </span>
                  <span className={styles.ratingAction}>
                    <span>ثبت نظر</span>
                    <ChevronLeft size={14} aria-hidden="true" />
                  </span>
                </>
              )}
            </a>

            {data.platforms.length > 0 && (
              <div className={styles.platformsDock}>
                <div className={styles.platformsHead}>
                  <span className={styles.platformsTitle}>
                    <Gamepad2 size={14} aria-hidden="true" />
                    پلتفرم‌های قابل اجرا
                  </span>
                  <span className={styles.platformsCount}>
                    {data.platforms.length > 1
                      ? `${faNumber(data.platforms.length)} پلتفرم رسمی`
                      : 'پلتفرم رسمی'}
                  </span>
                </div>
                <ul
                  className={styles.platforms}
                  data-count={data.platforms.length}
                  dir="ltr"
                  aria-label="پلتفرم‌های پشتیبانی‌شده"
                >
                  {data.platforms.map(platform => (
                    <li
                      key={platform.slug}
                      className={styles.platform}
                      data-platform={platform.slug}
                      title={platform.name}
                    >
                      <span className={styles.platformIcon} aria-hidden="true">
                        <PlatformGlyph slug={platform.slug} icon={platform.icon} />
                      </span>
                      <span className={styles.platformName}>{platform.name}</span>
                      <span className={styles.platformDot} aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.purchase}>
            {data.hasVariants && (
              <div className={styles.options} ref={optionsRef}>
                <div className={styles.optionsHead}>
                  <span className={styles.optionsLegend}>انتخاب گزینه</span>
                  <span className={styles.optionsCountBadge}>
                    {faNumber(data.variants.length)} گزینه موجود
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.optionTrigger} ${optionsOpen ? styles.optionTriggerOpen : ''}`}
                  onClick={() => setOptionsOpen(open => !open)}
                  aria-expanded={optionsOpen}
                  aria-haspopup="listbox"
                >
                  <span className={styles.optionTriggerGlow} aria-hidden="true" />
                  <span className={styles.optionTriggerIcon} aria-hidden="true">
                    <Check size={14} strokeWidth={3.5} />
                  </span>
                  <span className={styles.optionTriggerMain}>
                    <span className={styles.optionTriggerTop}>
                      <span className={styles.optionTriggerLabel}>
                        {variant ? variant.label : 'یک گزینه انتخاب کنید'}
                      </span>
                      {variant && variant.discountPercent > 0 && variant.inStock && (
                        <span className={styles.optionDiscount}>٪{faNumber(variant.discountPercent)}</span>
                      )}
                    </span>
                    {variant && (
                      <span className={styles.optionTriggerMeta}>
                        <span className={styles.optionTriggerPrice}>{toman(variant.price)}</span>
                        {variant.inStock &&
                          variant.originalPrice != null &&
                          variant.originalPrice > variant.price && (
                            <span className={styles.optionOld}>{faNumber(variant.originalPrice)}</span>
                          )}
                      </span>
                    )}
                  </span>
                  <span className={styles.optionTriggerAction}>
                    <span>{optionsOpen ? 'بستن' : 'تغییر گزینه'}</span>
                    <span className={styles.optionTriggerChevron} aria-hidden="true">
                      <ChevronDown size={15} />
                    </span>
                  </span>
                </button>

                <div
                  className={`${styles.optionsCollapse} ${optionsOpen ? styles.optionsCollapseOpen : ''}`}
                  aria-hidden={!optionsOpen}
                >
                  <div className={styles.optionsCollapseInner}>
                    <div
                      className={styles.optionsGrid}
                      role="radiogroup"
                      aria-label="انتخاب گزینه محصول"
                      onKeyDown={handleOptionKeys}
                    >
                      {data.variants.map(option => {
                        const selected = option.id === variant?.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            // Roving tab stop: Tab enters the group once, arrows move within it
                            tabIndex={optionsOpen ? (selected ? 0 : -1) : -1}
                            data-variant-id={option.id}
                            disabled={!option.inStock}
                            className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                            onClick={() => {
                              setVariantId(option.id);
                              setOptionsOpen(false);
                            }}
                          >
                            <span className={styles.optionCheck} aria-hidden="true">
                              <Check size={12} strokeWidth={3.5} />
                            </span>
                            <span className={styles.optionMain}>
                              <span className={styles.optionLabel}>{option.label}</span>
                              {option.discountPercent > 0 && option.inStock && (
                                <span className={styles.optionDiscount}>٪{faNumber(option.discountPercent)}</span>
                              )}
                            </span>
                            <span className={styles.optionPriceGroup}>
                              {option.inStock ? (
                                <>
                                  {option.originalPrice != null &&
                                    option.originalPrice > option.price && (
                                      <span className={styles.optionOld}>{faNumber(option.originalPrice)}</span>
                                    )}
                                  <span className={styles.optionPrice}>{toman(option.price)}</span>
                                </>
                              ) : (
                                <span className={styles.optionOut}>ناموجود</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.priceBlock}>
              <div className={styles.priceMain}>
                <span className={styles.priceLabel}>قیمت</span>
                <span className={styles.price}>
                  {priceText} <small>تومان</small>
                </span>
              </div>
              {savings > 0 && (
                <div className={styles.priceSide}>
                  <span className={styles.oldPrice}>{faNumber(originalPrice!)} تومان</span>
                  <span className={styles.savings}>{faNumber(savings)} تومان صرفه‌جویی</span>
                </div>
              )}
            </div>

            {quantity > 1 && price != null && (
              <p className={styles.total}>
                جمع {faNumber(quantity)} عدد: <strong>{toman(price * quantity)}</strong>
              </p>
            )}

            {data.requiresGameAccount && (
              <p className={styles.note}>
                <Info size={16} aria-hidden="true" />
                {data.credentialType === 'supercell_id' || data.game?.slug === 'clash-of-clans'
                  ? 'برای فعال‌سازی این محصول فقط به «آی‌دی سوپرسل (Supercell ID)» شما نیاز است که در مرحله تسویه حساب از شما دریافت می‌شود.'
                  : 'برای فعال‌سازی این محصول روی اکانت شما، «ایمیل و رمز عبور» اکانت در مرحله تسویه حساب از شما دریافت می‌شود.'}
              </p>
            )}

            <div className={styles.ctaRow} ref={ctaRef}>
              <div className={styles.stepper} role="group" aria-label="تعداد">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(q + 1, MAX_QUANTITY))}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="افزایش تعداد"
                >
                  <Plus size={16} />
                </button>
                <span aria-live="polite">{faNumber(quantity)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                  disabled={quantity <= 1}
                  aria-label="کاهش تعداد"
                >
                  <Minus size={16} />
                </button>
              </div>
              <button
                type="button"
                className={styles.cartButton}
                onClick={handleAddToCart}
                disabled={!inStock || adding}
              >
                <ShoppingCart size={19} aria-hidden="true" />
                {cartLabel}
              </button>
              <button
                type="button"
                className={`${styles.wishButton} ${data.isWishlisted ? styles.wishActive : ''}`}
                onClick={toggleWishlist}
                aria-pressed={data.isWishlisted}
                aria-label={data.isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              >
                <Heart size={20} fill={data.isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <ul className={styles.perks} aria-label="تضمین‌ها و مزایای خرید">
            {perks.map((perk, idx) => {
              const PerkIcon = FEATURE_ICONS[perk.icon] ?? Zap;
              return (
                <li
                  key={perk.title}
                  className={styles.perk}
                  data-perk={perk.icon || `perk-${idx}`}
                >
                  <span className={styles.perkGlow} aria-hidden="true" />
                  <span className={styles.perkIconWrap} aria-hidden="true">
                    <span className={styles.perkIcon}>
                      <PerkIcon size={20} strokeWidth={2.2} />
                    </span>
                    <span className={styles.perkVerify}>
                      <Check size={9} strokeWidth={3.5} />
                    </span>
                  </span>
                  <span className={styles.perkText}>
                    <strong>{perk.title}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Details: tab switcher + active tab panel ---------- */}
      <div id="pd-tabs" className={styles.sectionNav} role="tablist" aria-label="بخش‌های صفحه محصول">
        {SECTIONS.map(section => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`tab-${section.id}`}
              aria-selected={isActive}
              aria-controls={section.id}
              className={`${styles.sectionLink} ${isActive ? styles.sectionLinkActive : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
              {section.id === 'pd-reviews' && <span className={styles.sectionCount}>{faNumber(data.reviewCount)}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.details}>
        {activeSection === 'pd-about' && (
          <section id="pd-about" role="tabpanel" aria-labelledby="tab-pd-about" className={styles.block}>
            <h2 id="pd-about-title" className={styles.blockTitle}>
              درباره {data.title}
            </h2>
            {descriptionBlocks.length > 0 ? (
              <div className={styles.prose}>
                {descriptionBlocks.map((block, i) => {
                  if (block.type === 'heading') {
                    return (
                      <h3 key={i} className={styles.proseHeading}>
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.type === 'list') {
                    return (
                      <ul key={i} className={styles.proseList}>
                        {block.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i}>{block.text}</p>;
                })}
              </div>
            ) : (
              <p className={styles.prose}>
                {data.title} را با پرداخت امن و تحویل سریع از فروشگاه تایتان تهیه کنید. برای راهنمایی بیشتر،
                پشتیبانی ۲۴ ساعته همراه شماست.
              </p>
            )}
            {data.tags.length > 0 && (
              <ul className={styles.tags} aria-label="ویژگی‌ها">
                {data.tags.map(tag => (
                  <li key={tag} className={styles.tag}>
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {keywords.length > 0 && (
              <div className={styles.keywordsBlock}>
                <span className={styles.keywordsLabel}>کلمات کلیدی:</span>
                <ul className={styles.keywordsList} aria-label="کلمات کلیدی محصول">
                  {keywords.map(kw => (
                    <li key={kw} className={styles.keywordChip}>
                      {kw}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {activeSection === 'pd-specs' && (
          <section id="pd-specs" role="tabpanel" aria-labelledby="tab-pd-specs" className={styles.block}>
            <h2 id="pd-specs-title" className={styles.blockTitle}>
              مشخصات
            </h2>
            <dl className={styles.specs}>
              {specs.map(([label, value]) => (
                <div key={label} className={styles.spec}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {activeSection === 'pd-delivery' && (
          <section id="pd-delivery" role="tabpanel" aria-labelledby="tab-pd-delivery" className={styles.block}>
            <h2 id="pd-delivery-title" className={styles.blockTitle}>
              نحوه دریافت
            </h2>
            <ol className={styles.steps}>
              {DELIVERY_STEPS[data.deliveryType].map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <li key={step.title} className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden="true">
                      <StepIcon size={20} />
                      <span className={styles.stepNumber}>{faNumber(i + 1)}</span>
                    </span>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Plain: the reviews UI brings its own cards */}
        {activeSection === 'pd-reviews' && (
          <section
            id="pd-reviews"
            role="tabpanel"
            aria-labelledby="tab-pd-reviews"
            className={`${styles.block} ${styles.blockPlain}`}
          >
            <h2 id="pd-reviews-title" className={styles.blockTitle}>
              نظرات کاربران
            </h2>
            <ReviewsSection product={data} onChanged={product.reload} initialData={initialReviews} />
          </section>
        )}
      </div>

      {(related.data?.length ?? 0) > 0 && (
        <section className={styles.related} aria-labelledby="pd-related-title">
          <div className={styles.relatedHead}>
            <h2 id="pd-related-title" className={styles.blockTitle}>
              محصولات مرتبط
            </h2>
            <Link href={data.game ? `/store/${data.game.slug}` : '/store'} className={styles.relatedMore}>
              مشاهده همه
            </Link>
          </div>

          <div className={styles.relatedWrapper}>
            <button
              type="button"
              className={`${styles.relatedFloatBtn} ${styles.relatedFloatBtnRight} ${!canScrollRight ? styles.relatedFloatBtnHidden : ''}`}
              onClick={() => scrollRelated('right')}
              aria-label="محصولات قبلی"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${styles.relatedFloatBtn} ${styles.relatedFloatBtnLeft} ${!canScrollLeft ? styles.relatedFloatBtnHidden : ''}`}
              onClick={() => scrollRelated('left')}
              aria-label="محصولات بعدی"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>

            <div
              ref={relatedScrollRef}
              className={styles.relatedList}
              onMouseDown={handleRelatedMouseDown}
              onMouseMove={handleRelatedMouseMove}
              onMouseUp={handleRelatedMouseUp}
              onMouseLeave={handleRelatedMouseUp}
            >
              {related.data!.map(item => {
                // No product image uploaded: show the game's mark (or Titan's) on its colour
                const fallbackArt = (item.game && gameIconSrc(item.game.slug, item.game.iconImage)) || '/titan-logo.webp';
                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className={styles.relatedCard}
                    onClick={(e) => {
                      if (dragMoved.current) {
                        e.preventDefault();
                      }
                    }}
                    style={{ '--card-accent': item.game?.accentColor || TITAN_RED } as React.CSSProperties}
                  >
                    <span className={styles.relatedArt}>
                      {item.image ? (
                        <Image
                          src={mediaUrl(item.image)}
                          alt={item.imageAlt || item.title}
                          width={220}
                          height={220}
                          sizes="220px"
                          draggable={false}
                          unoptimized={process.env.NODE_ENV !== 'production'}
                        />
                      ) : (
                        <Image
                          src={fallbackArt}
                          alt=""
                          width={96}
                          height={96}
                          sizes="96px"
                          className={styles.relatedFallback}
                          unoptimized={isLocalAsset(fallbackArt)}
                        />
                      )}
                      {item.discountPercent > 0 && (
                        <span className={styles.relatedDiscount}>٪{faNumber(item.discountPercent)}</span>
                      )}
                    </span>
                    <span className={styles.relatedBody}>
                      <span className={styles.relatedGame}>{item.game?.title || item.category?.name || '\u00A0'}</span>
                      <span className={styles.relatedTitle}>{item.title}</span>
                      <span className={styles.relatedPrice}>{productPrice(item)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Compact purchase bar once the main button is off screen */}
      <div className={`${styles.buyBar} ${showBuyBar ? styles.buyBarVisible : ''}`} aria-hidden={!showBuyBar}>
        <div className={styles.buyBarInfo}>
          <span className={styles.buyBarTitle}>{variant ? `${data.title} — ${variant.label}` : data.title}</span>
          <span className={styles.buyBarPrice}>
            {priceText} <small>تومان</small>
          </span>
        </div>
        <button
          type="button"
          className={styles.buyBarButton}
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          tabIndex={showBuyBar ? 0 : -1}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          {inStock ? 'افزودن به سبد' : 'ناموجود'}
        </button>
      </div>
    </div>
  );
}
