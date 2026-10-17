import type { Metadata } from 'next';
import React from 'react';
import ProductDetailClient from './ProductDetailClient';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';

interface ProductData {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  game?: {
    slug: string;
    title: string;
  };
  category?: {
    name: string;
  };
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  const title = product ? `${product.title} | خرید از تایتان` : 'مشخصات و خرید محصول';
  const rawDesc =
    product?.description?.replace(/[\r\n]+/g, ' ').trim() ||
    `خرید و تحویل سریع و قانونی ${product?.title || 'محصولات گیمینگ'} با بهترین قیمت و ضمانت در فروشگاه تایتان.`;
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;

  const imageUrl = product?.image
    ? product.image.startsWith('http')
      ? product.image
      : `${SITE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
    : DEFAULT_OG_IMAGE.url;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${slug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product?.title || 'محصول تایتان',
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // Generate Structured Data (JSON-LD)
  const productPriceInRials = (product?.price || 0) * 10;
  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.title || slug,
    description: product?.description || 'محصول گیمینگ فروشگاه تایتان',
    sku: product?.slug || slug,
    brand: {
      '@type': 'Brand',
      name: product?.game?.title || SITE_NAME,
    },
    image: product?.image
      ? [product.image.startsWith('http') ? product.image : `${SITE_URL}/${product.image.replace(/^\//, '')}`]
      : [`${SITE_URL}/images/banner-hero.webp`],
    offers: {
      '@type': 'Offer',
      price: productPriceInRials,
      priceCurrency: 'IRR',
      priceValidUntil: '2026-12-31',
      availability: product?.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${slug}`,
    },
  };

  if (product?.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating.toFixed(1)),
      reviewCount: product.reviewCount,
    };
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'صفحه اصلی',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'فروشگاه',
        item: `${SITE_URL}/store`,
      },
      ...(product?.game
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.game.title,
              item: `${SITE_URL}/store/${product.game.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.title,
              item: `${SITE_URL}/product/${slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product?.title || slug,
              item: `${SITE_URL}/product/${slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {product?.image && (
        <link
          rel="preload"
          as="image"
          href={product.image.startsWith('http') ? product.image : `${SITE_URL}/${product.image.replace(/^\//, '')}`}
          fetchPriority="high"
        />
      )}
      <ProductDetailClient initialData={product as any} />
    </>
  );
}
