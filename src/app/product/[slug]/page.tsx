import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import ProductDetailClient from './ProductDetailClient';
import { enrichProductSeo, getProductKeywords, plainTextDescription } from './productSeoContent';
import { getGuides, primaryGuide } from '../../guides/getGuides';
import { JsonLd } from '@/components/seo/JsonLd';
import { composeMetaDescription } from '@/lib/seo/meta';
import { SITE_URL, SITE_NAME } from '@/lib/siteConfig';
import {
  API_URL,
  DEFAULT_CLASH_PRODUCT_DETAIL,
  DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL,
} from '@/lib/api/client';
import { fetchEntity } from '@/lib/api/server';
import type { Paginated, Product, ProductSummary, Review } from '@/lib/api/types';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
  resolveBackendRedirect,
  toAbsoluteUrl,
} from '@/lib/seo/schema';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products/?page_size=24&ordering=-popularity`, {
      next: { revalidate: 60, tags: ['products'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data) ? data : data.results || [];
    const slugs = new Set<string>(['fortnite-crew']);
    for (const p of results) {
      if (p?.slug) slugs.add(p.slug);
    }
    return Array.from(slugs).map((slug) => ({ slug }));
  } catch {
    return [{ slug: 'fortnite-crew' }];
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  if (slug === 'apex-coins') return null;
  const prod = await fetchEntity<Product>(`/products/${slug}/`, {
    revalidate: 60,
    tags: ['products', `product-${slug}`],
  });
  if (!prod && slug === 'fortnite-crew') {
    const altProd = await fetchEntity<Product>('/products/fortnite-crew-pack/', {
      revalidate: 60,
      tags: ['products', 'product-fortnite-crew'],
    });
    if (altProd) {
      return enrichProductSeo({ ...altProd, slug: 'fortnite-crew' });
    }
    return enrichProductSeo(DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL);
  }
  if (!prod && slug === 'clash-of-clans-gems') {
    return enrichProductSeo(DEFAULT_CLASH_PRODUCT_DETAIL);
  }
  return prod ? enrichProductSeo(prod) : null;
}

async function getProductReviews(slug: string): Promise<Paginated<Review> | undefined> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}/reviews/`, {
      next: { revalidate: 120, tags: ['products', `product-${slug}`] },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  } catch {
    return undefined;
  }
}

async function getRelatedProducts(slug: string): Promise<ProductSummary[] | undefined> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}/related/`, {
      next: { revalidate: 300, tags: ['products', `product-${slug}`] },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || undefined;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'محصول یافت نشد',
      robots: { index: false, follow: false },
    };
  }

  // Strip duplicate brand suffix because RootLayout applies `%s | تایتان`
  const rawTitle = (product.metaTitle || `خرید ${product.title}`).replace(/\s*\|\s*(فروشگاه\s*)?تایتان\s*$/u, '');
  const description = composeMetaDescription(
    product.metaDescription || plainTextDescription(product.description) || product.subtitle,
    `خرید ${product.title} با تحویل سریع، پرداخت امن ریالی و پشتیبانی ۲۴ ساعته در فروشگاه تایتان.`,
    'قیمت به‌روز، پیگیری آنلاین سفارش و پشتیبانی ۲۴ ساعته.',
  );

  const imageUrl = toAbsoluteUrl(product.ogImage || product.image);
  const canonicalUrl = product.canonicalUrl || `${SITE_URL}/product/${slug}`;

  return {
    title: rawTitle,
    keywords: getProductKeywords(product),
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    ...(product.noindex
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
    openGraph: {
      title: `${rawTitle} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.imageAlt || product.title,
        },
      ],
      locale: 'fa_IR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${rawTitle} | ${SITE_NAME}`,
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
  const [product, reviews, related, guides] = await Promise.all([
    getProduct(slug),
    getProductReviews(slug),
    getRelatedProducts(slug),
    getGuides({ product: slug }),
  ]);

  if (!product) {
    await resolveBackendRedirect(`/product/${slug}`);
    notFound();
  }

  const productJsonLd = buildProductSchema(product, reviews?.results ?? []);
  const breadcrumbItems = [
    { name: 'صفحه اصلی', path: '/' },
    { name: 'فروشگاه', path: '/store' },
    ...(product.game
      ? [{ name: product.game.title, path: `/store/${product.game.slug}` }]
      : []),
    { name: product.title, path: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {product.faqs && product.faqs.length > 0 && <JsonLd data={buildFaqSchema(product.faqs)} />}
      <ProductDetailClient
        initialData={product}
        initialReviews={reviews}
        initialRelated={related}
        guide={primaryGuide(guides)}
      />
    </>
  );
}
