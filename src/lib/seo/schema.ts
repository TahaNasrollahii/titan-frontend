import { permanentRedirect, redirect } from 'next/navigation';
import { getProductKeywords, plainTextDescription } from '@/app/product/[slug]/productSeoContent';
import { API_URL } from '@/lib/api/client';
import type {
  ContactChannel,
  PlatformStats,
  Product,
  ProductSummary,
  Review,
  Tournament,
} from '@/lib/api/types';
import {
  DEFAULT_OG_IMAGE,
  SECURITY_CONTACT_EMAIL,
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_DISCORD,
  SOCIAL_TELEGRAM,
} from '@/lib/siteConfig';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function toAbsoluteUrl(urlOrPath?: string | null): string {
  if (!urlOrPath) return DEFAULT_OG_IMAGE.url;
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  const normalized = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Checks whether the backend has a 301/302 redirect rule for `path` (e.g. when a slug changed).
 * If found, triggers Next.js `permanentRedirect` or `redirect`.
 */
export async function resolveBackendRedirect(path: string): Promise<void> {
  let targetPath: string | null = null;
  let isPermanent = true;

  try {
    const res = await fetch(
      `${API_URL}/seo/redirects/?path=${encodeURIComponent(path)}`,
      {
        next: { revalidate: 300, tags: ['redirects'] },
        signal: AbortSignal.timeout(2000),
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.newPath && data.newPath !== path) {
        targetPath = data.newPath;
        isPermanent = data.isPermanent !== false;
      }
    }
  } catch {
    // Ignore network timeout and proceed to normal 404 handling
  }

  if (targetPath) {
    if (isPermanent) {
      permanentRedirect(targetPath);
    } else {
      redirect(targetPath);
    }
  }
}

export function buildGlobalGraphSchema() {
  const sameAs = [SOCIAL_TELEGRAM, SOCIAL_DISCORD].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/titan-logo.webp`,
        },
        description: SITE_DEFAULT_DESCRIPTION,
        email: SECURITY_CONTACT_EMAIL,
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DEFAULT_DESCRIPTION,
        inLanguage: 'fa-IR',
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/store?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path === '/' ? SITE_URL : `${SITE_URL}${item.path.startsWith('/') ? '' : '/'}${item.path}`,
    })),
  };
}

export function buildProductSchema(product: Product, reviews: Review[] = []) {
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const images: string[] = [];
  if (product.image) {
    images.push(toAbsoluteUrl(product.image));
  }
  if (Array.isArray(product.gallery)) {
    for (const g of product.gallery) {
      if (g?.image) {
        const abs = toAbsoluteUrl(g.image);
        if (!images.includes(abs)) images.push(abs);
      }
    }
  }
  if (images.length === 0) {
    images.push(DEFAULT_OG_IMAGE.url);
  }

  const lowPriceRials = Math.max(0, (product.price ?? 0) * 10);
  const highPriceRials = Math.max(lowPriceRials, (product.priceMax ?? product.price ?? 0) * 10);
  const availability =
    product.inStock !== false
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const hasMultipleVariants =
    Boolean(product.hasVariants) && Array.isArray(product.variants) && product.variants.length > 1;

  const offers = hasMultipleVariants
    ? {
        '@type': 'AggregateOffer',
        lowPrice: lowPriceRials,
        highPrice: highPriceRials,
        offerCount: product.variants.length,
        priceCurrency: 'IRR',
        availability,
        url: productUrl,
        offers: product.variants.map((v) => ({
          '@type': 'Offer',
          name: v.label,
          price: v.price * 10,
          priceCurrency: 'IRR',
          availability:
            v.inStock !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: productUrl,
        })),
      }
    : {
        '@type': 'Offer',
        price: lowPriceRials,
        priceCurrency: 'IRR',
        availability,
        url: productUrl,
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description:
      plainTextDescription(product.description) ||
      product.subtitle ||
      `خرید آنلاین ${product.title} با تحویل آنی در فروشگاه تایتان.`,
    keywords: getProductKeywords(product).join('، '),
    sku: product.sku || `TITAN-${product.id || product.slug}`,
    image: images,
    brand: {
      '@type': 'Brand',
      name: product.vendor || product.game?.title || SITE_NAME,
    },
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.mpn ? { mpn: product.mpn } : {}),
    offers,
  };

  if (product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating.toFixed(1)),
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const validReviews = reviews.filter((r) => r && r.rating >= 1 && r.rating <= 5);
  if (validReviews.length > 0) {
    schema.review = validReviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.authorName || r.user?.displayName || 'کاربر تایتان',
      },
      datePublished: r.createdAt ? r.createdAt.split('T')[0] : undefined,
      reviewBody: r.comment || undefined,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return schema;
}

export function buildCollectionPageSchema(options: {
  name: string;
  description: string;
  path: string;
  products: ProductSummary[];
}) {
  const url = `${SITE_URL}${options.path.startsWith('/') ? '' : '/'}${options.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.products.length,
      itemListElement: options.products.slice(0, 24).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/product/${p.slug}`,
        name: p.title,
      })),
    },
  };
}

export function buildSportsEventSchema(tournament: Partial<Tournament> & { slug: string; title: string }) {
  const eventUrl = `${SITE_URL}/tournaments/${tournament.slug}`;
  const imageUrl = toAbsoluteUrl(tournament.coverImage || '/images/tournoment-banner.webp');
  const rulesText = Array.isArray(tournament.rules)
    ? tournament.rules.join(' — ')
    : typeof tournament.rules === 'string'
    ? tournament.rules
    : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: tournament.title,
    description:
      tournament.description ||
      rulesText ||
      `مسابقه و تورنومنت آنلاین ${tournament.title} با جوایز نقدی در پلتفرم گیمینگ تایتان.`,
    startDate: tournament.startsAt,
    endDate: tournament.endsAt,
    eventStatus:
      tournament.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: eventUrl,
    },
    image: [imageUrl],
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(tournament.prizePool
      ? {
          award: `${tournament.prizePool.toLocaleString()} ${tournament.prizeCurrency || 'IRT'}`,
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: eventUrl,
      price: (tournament.entryFee || 0) * 10,
      priceCurrency: 'IRR',
      availability:
        tournament.status === 'registration_open'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildAboutPageSchema(stats?: PlatformStats | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `درباره ${SITE_NAME}`,
    url: `${SITE_URL}/about`,
    description: SITE_DEFAULT_DESCRIPTION,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      ...(stats?.players
        ? {
            interactionStatistic: {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/RegisterAction',
              userInteractionCount: stats.players,
            },
          }
        : {}),
    },
  };
}

export function buildContactPageSchema(channels: ContactChannel[] = []) {
  const contactPoints = channels
    .filter((c) => Boolean(c.url || c.title))
    .map((c) => ({
      '@type': 'ContactPoint',
      contactType: c.kind === 'live_chat' || c.kind === 'telegram_support' ? 'customer support' : 'public relations',
      name: c.title,
      url: c.url?.startsWith('http') ? c.url : `${SITE_URL}/contact`,
      availableLanguage: ['Persian', 'English'],
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `تماس با پشتیبانی ${SITE_NAME}`,
    url: `${SITE_URL}/contact`,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      email: SECURITY_CONTACT_EMAIL,
      ...(contactPoints.length > 0 ? { contactPoint: contactPoints } : {}),
    },
  };
}
