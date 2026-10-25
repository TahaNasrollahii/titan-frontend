'use client';

import {
  BadgePercent,
  Check,
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

interface ProductDetailClientProps {
  initialData?: Product | null;
  initialRelated?: ProductSummary[];
  initialReviews?: Paginated<Review>;
}

export default function ProductPage({ initialData, initialRelated, initialReviews }: ProductDetailClientProps) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToast } = useAppContext();

  const product = useApi(() => catalogApi.product(slug), [slug], initialData ?? undefined);
  const related = useApi(() => catalogApi.related(slug), [slug], initialRelated);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('pd-about');
  const [showBuyBar, setShowBuyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const data = product.data;
  const hasData = Boolean(data);
  // Until the user picks one, the cheapest in-stock option is selected.
  const variant = useMemo(
    () => (data ? data.variants.find(v => v.id === variantId) ?? defaultVariant(data) : null),
    [data, variantId],
  );

  const fallbackImage = useMemo(() => {
    if (!data) return '/images/banner-hero.webp';
    if (data.slug?.includes('valorant') || data.game?.slug === 'valorant') {
      return '/images/products/Jett-Inspired%20Agent%20with%20Turkish%20375%20VP%20Badge.webp';
    }
    return '/images/banner-hero.webp';
  }, [data]);

  const currentImage = selectedImage || (data?.image ? mediaUrl(data.image) : fallbackImage);

  // Activate matching tab if the URL contains a section hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash as SectionId);
    }
  }, []);

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
  const paragraphs = (data.description || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
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
    ...Object.entries(data.specs).map(([key, value]) => [SPEC_LABELS[key] ?? key, String(value)] as [string, string]),
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
              {data.reviewCount > 0 ? (
                <>
                  <span className={styles.ratingScore}>{faNumber(Number(data.rating.toFixed(1)))}</span>
                  <Stars value={data.rating} />
                  <span className={styles.ratingCount}>({faNumber(data.reviewCount)} نظر)</span>
                </>
              ) : (
                // A zero score would read as a bad rating
                <span className={styles.ratingCount}>هنوز نظری ثبت نشده؛ اولین نفر باشید</span>
              )}
            </a>
            {data.platforms.length > 0 && (
              <ul className={styles.platforms} aria-label="پلتفرم‌های پشتیبانی‌شده">
                {data.platforms.map(platform => (
                  <li key={platform.slug} className={styles.platform} title={platform.name}>
                    {platform.icon && (
                      <Image src={platform.icon} alt="" width={16} height={16} sizes="16px" />
                    )}
                    <span>{platform.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.purchase}>
            {data.hasVariants && (
              <fieldset className={styles.options}>
                <legend className={styles.optionsLegend}>انتخاب گزینه</legend>
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
                        tabIndex={selected ? 0 : -1}
                        data-variant-id={option.id}
                        disabled={!option.inStock}
                        className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                        onClick={() => setVariantId(option.id)}
                      >
                        <span className={styles.optionCheck} aria-hidden="true">
                          <Check size={12} strokeWidth={3.5} />
                        </span>
                        <span className={styles.optionLabel}>{option.label}</span>
                        <span className={styles.optionPrice}>{toman(option.price)}</span>
                        {option.inStock ? (
                          option.originalPrice != null &&
                          option.originalPrice > option.price && (
                            <span className={styles.optionOld}>{faNumber(option.originalPrice)}</span>
                          )
                        ) : (
                          <span className={styles.optionOut}>ناموجود</span>
                        )}
                        {option.discountPercent > 0 && option.inStock && (
                          <span className={styles.optionDiscount}>٪{faNumber(option.discountPercent)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
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
                این محصول روی اکانت بازی شما شارژ می‌شود؛ اکانت را هنگام تسویه حساب انتخاب می‌کنید.
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

          <ul className={styles.perks}>
            {perks.map(perk => {
              const PerkIcon = FEATURE_ICONS[perk.icon] ?? Zap;
              return (
                <li key={perk.title} className={styles.perk}>
                  <span className={styles.perkIcon} aria-hidden="true">
                    <PerkIcon size={18} />
                  </span>
                  <span className={styles.perkText}>
                    <strong>{perk.title}</strong>
                    {perk.description && <small>{perk.description}</small>}
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
            {paragraphs.length > 0 ? (
              <div className={styles.prose}>
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
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
          <div className={styles.relatedList}>
            {related.data!.map(item => {
              // No product image uploaded: show the game's mark (or Titan's) on its colour
              const fallbackArt = (item.game && gameIconSrc(item.game.slug, item.game.iconImage)) || '/titan-logo.webp';
              return (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className={styles.relatedCard}
                style={{ '--card-accent': item.game?.accentColor || TITAN_RED } as React.CSSProperties}
              >
                <span className={styles.relatedArt}>
                  {item.image ? (
                    <Image
                      src={mediaUrl(item.image)}
                      alt={item.imageAlt || item.title}
                      width={220}
                      height={220}
                      sizes="(max-width: 640px) 45vw, 220px"
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
                  {item.game && <span className={styles.relatedGame}>{item.game.title}</span>}
                  <span className={styles.relatedTitle}>{item.title}</span>
                  <span className={styles.relatedPrice}>{productPrice(item)}</span>
                </span>
              </Link>
              );
            })}
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
