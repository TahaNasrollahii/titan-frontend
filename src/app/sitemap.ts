import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';

interface ProductItem {
  slug: string;
  updatedAt?: string;
}

interface TournamentItem {
  slug: string;
  updatedAt?: string;
  startsAt?: string;
}

const FALLBACK_PRODUCTS = [
  'fortnite-vbucks',
  'fortnite-crew-pack',
  'valorant-points',
  'apex-coins',
  'psn-gift-card',
  'steam-gift-card',
  'xbox-game-pass',
  'spotify-premium',
  'telegram-premium',
];

const FALLBACK_TOURNAMENTS = [
  'titan-apex-solo',
  'titan-valorant-champions',
  'titan-fortnite-duo',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/store`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tournaments`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tournament`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Game category routes in the store
  const gameCategories = ['fortnite', 'valorant', 'apex-legends', 'premium'].map(slug => ({
    url: `${SITE_URL}/store?game=${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch products from backend
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/products/?page_size=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const items: ProductItem[] = Array.isArray(data.results) ? data.results : [];
      if (items.length > 0) {
        productRoutes = items.map(p => ({
          url: `${SITE_URL}/product/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch {
    // If backend is not reached during static build, use fallback list
  }

  if (productRoutes.length === 0) {
    productRoutes = FALLBACK_PRODUCTS.map(slug => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // Fetch tournaments from backend
  let tournamentRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/tournaments/?page_size=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const items: TournamentItem[] = Array.isArray(data.results) ? data.results : [];
      if (items.length > 0) {
        tournamentRoutes = items.map(t => ({
          url: `${SITE_URL}/tournaments/${t.slug}`,
          lastModified: t.updatedAt ? new Date(t.updatedAt) : (t.startsAt ? new Date(t.startsAt) : now),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    }
  } catch {
    // If backend is not reached during static build, use fallback list
  }

  if (tournamentRoutes.length === 0) {
    tournamentRoutes = FALLBACK_TOURNAMENTS.map(slug => ({
      url: `${SITE_URL}/tournaments/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...gameCategories, ...productRoutes, ...tournamentRoutes];
}
