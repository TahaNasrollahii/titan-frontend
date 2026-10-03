'use client';

import { Flame, Heart, MessageSquare, Minus, Plus, ShieldCheck, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { ErrorState, Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api/client';
import { catalogApi } from '@/lib/api/endpoints';
import type { Product, ProductVariant } from '@/lib/api/types';
import { faNumber, productPrice, toman } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './product.module.css';
import { ReviewsSection, Stars } from './ReviewsSection';

const FEATURE_ICONS: Record<string, React.ElementType> = {
  shield: ShieldCheck,
  chat: MessageSquare,
  flame: Flame,
};

const SPEC_LABELS: Record<string, string> = {
  region: 'ریجن',
  delivery: 'زمان تحویل',
  activation: 'نحوه فعال‌سازی',
  warranty: 'گارانتی',
  condition: 'وضعیت کالا',
};

type Tab = 'description' | 'specs' | 'reviews';

/** Pick the cheapest in-stock option so the page opens on something purchasable. */
function defaultVariant(product: Product): ProductVariant | null {
  return product.variants.find(v => v.inStock) ?? product.variants[0] ?? null;
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToast } = useAppContext();

  const product = useApi(() => catalogApi.product(slug), [slug]);
  const related = useApi(() => catalogApi.related(slug), [slug]);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>('description');
  const [adding, setAdding] = useState(false);

  const data = product.data;
  // Until the user picks one, the cheapest in-stock option is selected.
  const variant = useMemo(
    () => (data ? (data.variants.find(v => v.id === variantId) ?? defaultVariant(data)) : null),
    [data, variantId],
  );

  if (product.loading && !data) return <Loading />;
  if (!data) return <ErrorState error={product.error} onRetry={product.reload} />;

  // The selected option drives price/discount/stock; fixed-price products use their own values.
  const price = variant ? variant.price : data.price;
  const originalPrice = variant ? variant.originalPrice : data.originalPrice;
  const discount = variant ? variant.discountPercent : data.discountPercent;
  const inStock = variant ? variant.inStock : data.inStock;
  const lowStock = !data.hasVariants && data.stock !== null && data.stock > 0 && data.stock <= 5 ? data.stock : null;

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
      addToast({ title: 'علاقه‌مندی‌ها', text: errorMessage(error), icon: 'heart' });
    }
  };

  const handleAddToCart = async () => {
    if (data.hasVariants && !variant) {
      addToast({ title: 'یک گزینه انتخاب کنید', icon: 'info' });
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

  const specs: [string, string][] = [
    ...(data.vendor ? [['ناشر / فروشگاه', data.vendor] as [string, string]] : []),
    ['دسته‌بندی', data.category.name],
    ...(data.platforms.length ? [['پلتفرم‌ها', data.platforms.map(p => p.name).join('، ')] as [string, string]] : []),
    ...(data.deliveryInfo ? [['نحوه تحویل', data.deliveryInfo] as [string, string]] : []),
    ...Object.entries(data.specs).map(([key, value]) => [SPEC_LABELS[key] ?? key, String(value)] as [string, string]),
  ];

  return (
    <div className={styles.container} dir="rtl">
      <nav className={styles.breadcrumb}>
        <Link href="/store">فروشگاه</Link>
        {data.game && (
          <>
            <span className={styles.separator}>&gt;</span>
            <Link href={`/store?game=${data.game.slug}`}>{data.game.title}</Link>
          </>
        )}
        <span className={styles.separator}>&gt;</span>
        <span className={styles.current}>{data.title}</span>
      </nav>

      <div className={styles.mainSection}>
        <div className={styles.detailsColumn}>
          <div className={styles.headerRow}>
            {data.badges.includes('bestseller') ? (
              <div className={styles.badgePopular}>
                <Trophy size={16} className={styles.flameIcon} />
                <span>پرفروش</span>
              </div>
            ) : (
              <span />
            )}
            <div className={styles.actionsTop}>
              {data.platforms.map(platform => (
                <span key={platform.slug} className={styles.iconBtn} title={platform.name}>
                  {platform.icon ? (
                    <img src={platform.icon} alt={platform.name} className={styles.boldIcon} />
                  ) : (
                    <small>{platform.name}</small>
                  )}
                </span>
              ))}
            </div>
          </div>

          {data.game && (
            <div className={styles.categoryTitle}>
              {data.game.title} ({data.game.titleEn})
            </div>
          )}
          <h1 className={styles.productTitle}>{data.title}</h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              <span className={styles.ratingScore}>{faNumber(data.rating)}</span>
              <Stars value={data.rating} />
            </div>
            <div className={styles.reviewers}>
              <span className={styles.reviewersCount}>{faNumber(data.reviewCount)} نظر</span>
            </div>
          </div>

          {data.hasVariants && (
            <div className={styles.optionsBlock}>
              <div className={styles.sectionLabel}>انتخاب گزینه</div>
              <div className={styles.optionsGrid} role="radiogroup">
                {data.variants.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={option.id === variant?.id}
                    disabled={!option.inStock}
                    className={`${styles.optionCard} ${option.id === variant?.id ? styles.optionSelected : ''}`}
                    onClick={() => setVariantId(option.id)}
                  >
                    {option.discountPercent > 0 && (
                      <span className={styles.optionTag}>٪{faNumber(option.discountPercent)}</span>
                    )}
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionPrice}>{toman(option.price)}</span>
                    {option.originalPrice && <span className={styles.optionOld}>{faNumber(option.originalPrice)}</span>}
                    {!option.inStock && <span className={styles.optionOld}>ناموجود</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              <div className={styles.priceValues}>
                <span className={styles.currentPrice}>
                  {price != null ? faNumber(price) : productPrice(data)} <span>تومان</span>
                </span>
                {originalPrice && <span className={styles.oldPrice}>{faNumber(originalPrice)}</span>}
              </div>
              {discount > 0 && (
                <div className={styles.discountBadge}>
                  <Flame size={16} /> ٪{faNumber(discount)} تخفیف
                </div>
              )}
            </div>
            <div className={styles.stockInfo}>
              {!inStock ? (
                <div className={styles.stockLeft}>
                  <span className={styles.redDot}></span>
                  <span>ناموجود</span>
                </div>
              ) : (
                lowStock && (
                  <div className={styles.stockLeft}>
                    <span className={styles.redDot}></span>
                    <span>فقط {faNumber(lowStock)} عدد باقی مانده</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              className={`${styles.wishlistBtn} ${data.isWishlisted ? styles.liked : ''}`}
              onClick={toggleWishlist}
              aria-label="علاقه‌مندی"
            >
              <Heart
                size={20}
                fill={data.isWishlisted ? '#ef4444' : 'none'}
                color={data.isWishlisted ? '#ef4444' : 'currentColor'}
              />
            </button>
            <button className={styles.addToCartBtn} onClick={handleAddToCart} disabled={!inStock || adding}>
              <Plus size={20} />
              {inStock ? 'افزودن به سبد' : 'ناموجود'}
            </button>
            <div className={styles.quantityControl}>
              <button onClick={() => setQuantity(q => Math.min(q + 1, 20))} aria-label="افزایش">
                <Plus size={16} />
              </button>
              <span>{faNumber(quantity)}</span>
              <button onClick={() => setQuantity(q => Math.max(q - 1, 1))} aria-label="کاهش">
                <Minus size={16} />
              </button>
            </div>
          </div>

          {data.features.length > 0 && (
            <div className={styles.featuresList}>
              {data.features.map(feature => {
                const FeatureIcon = FEATURE_ICONS[feature.icon] ?? Zap;
                return (
                  <div key={feature.title} className={styles.featureItem}>
                    <div className={styles.featureIcon}>
                      <FeatureIcon size={24} />
                    </div>
                    <div className={styles.featureText}>
                      <div className={styles.featureTitle}>{feature.title}</div>
                      <div className={styles.featureDesc}>{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.imageColumn}>
          <div className={styles.mainImageArea}>
            {data.image && <img src={data.image} alt={data.title} className={styles.mainImage} />}
          </div>
        </div>
      </div>

      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabItem} ${tab === 'description' ? styles.tabActive : ''}`}
          onClick={() => setTab('description')}
        >
          توضیحات
        </button>
        <button className={`${styles.tabItem} ${tab === 'specs' ? styles.tabActive : ''}`} onClick={() => setTab('specs')}>
          مشخصات
        </button>
        <button
          className={`${styles.tabItem} ${tab === 'reviews' ? styles.tabActive : ''}`}
          onClick={() => setTab('reviews')}
        >
          نظرات <span className={styles.tabBadge}>{faNumber(data.reviewCount)}</span>
        </button>
      </div>

      {tab === 'description' && (
        <div className={styles.aboutSection}>
          <h2>درباره {data.title}</h2>
          <p>{data.description || 'توضیحاتی برای این محصول ثبت نشده است.'}</p>
          {data.tags.length > 0 && (
            <div className={styles.aboutTags}>
              {data.tags.map(tag => (
                <span key={tag} className={styles.aboutTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'specs' && (
        <div className={styles.aboutSection}>
          <h2>مشخصات</h2>
          <table className={styles.specTable}>
            <tbody>
              {specs.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && <ReviewsSection product={data} onChanged={product.reload} />}

      {(related.data?.length ?? 0) > 0 && (
        <div className={styles.recommendedSection}>
          <div className={styles.recommendedHeader}>
            <div className={styles.recommendedTitle}>
              <span className={styles.redBar}></span>
              شاید بپسندید
            </div>
          </div>

          <Swiper className={styles.recommendedScroll} spaceBetween={16} slidesPerView="auto" grabCursor dir="rtl">
            {related.data!.map(item => (
              <SwiperSlide key={item.id} style={{ width: 'auto' }}>
                <Link href={`/product/${item.slug}`} className={styles.recCard}>
                  {item.image && <img src={item.image} className={styles.recImage} alt={item.title} draggable={false} />}
                  <div className={styles.recOverlay}>
                    <h3 className={styles.recTitle}>{item.title}</h3>
                    <p className={styles.recPrice}>{productPrice(item)}</p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
