import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';

interface SitemapEntryItem {
  slug: string;
  updated_at?: string;
  updatedAt?: string;
  createdAt?: string;
  startsAt?: string;
  noindex?: boolean;
}

interface SeoSitemapResponse {
  products?: SitemapEntryItem[];
  games?: SitemapEntryItem[];
  categories?: SitemapEntryItem[];
  tournaments?: SitemapEntryItem[];
}

// Stable baseline date for static pages
const STATIC_LASTMOD = new Date('2026-10-15T12:00:00.000Z');

const FALLBACK_GAMES = [
  'fortnite',
  'valorant',
  'call-of-duty',
  'clash-of-clans',
  'premium',
  'ea-fc',
  'pubg',
  'minecraft',
  'cs2',
  'dota-2',
];

// Used only when the API is unreachable; every slug here must exist on the live site
const FALLBACK_PRODUCTS = [
  'fortnite-vbucks',
  'fortnite-crew',
  'fortnite-battle-pass',
  'valorant-points-1700',
  'cod-points',
  'clash-of-clans-gems',
  'pubg-uc',
  'ea-fc-points',
  'steam-wallet',
  'psn-gift-card',
  'xbox-gift-card',
  'google-play-gift-card',
  'spotify-premium',
  'telegram-premium',
];

const FALLBACK_TOURNAMENTS = [
  'fifa',
  'titan-valorant-championship',
  'titan-fortnite-squads',
  'cod-search-destroy',
  'fortnite-ranked-arena',
];

function parseDate(item: SitemapEntryItem): Date {
  const raw = item.updated_at || item.updatedAt || item.createdAt || item.startsAt;
  if (!raw) return STATIC_LASTMOD;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? STATIC_LASTMOD : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/store`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/fortnite-shop`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/tournaments`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tournament`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/about`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.5 },
  ];

  let gameRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];
  let tournamentRoutes: MetadataRoute.Sitemap = [];

  // 1. Primary: lightweight cached /api/v1/seo/sitemap/ endpoint (canonical, active, indexable items only)
  try {
    const seoRes = await fetch(`${API_URL}/seo/sitemap/`, {
      next: { revalidate: 3600, tags: ['sitemap', 'products', 'games', 'tournaments'] },
      signal: AbortSignal.timeout(4000),
    });
    if (seoRes.ok) {
      const seoData: SeoSitemapResponse = await seoRes.json();
      if (Array.isArray(seoData.games) && seoData.games.length > 0) {
        gameRoutes = seoData.games.map((g) => ({
          url: `${SITE_URL}/store/${g.slug}`,
          lastModified: parseDate(g),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
      if (Array.isArray(seoData.products) && seoData.products.length > 0) {
        productRoutes = seoData.products.map((p) => ({
          url: `${SITE_URL}/product/${p.slug}`,
          lastModified: parseDate(p),
          changeFrequency: 'daily',
          priority: 0.85,
        }));
      }
      if (Array.isArray(seoData.tournaments) && seoData.tournaments.length > 0) {
        tournamentRoutes = seoData.tournaments.map((t) => ({
          url: `${SITE_URL}/tournaments/${t.slug}`,
          lastModified: parseDate(t),
          changeFrequency: 'daily',
          priority: 0.8,
        }));
      }
    }
  } catch {
    // Fall back to individual endpoints below if /seo/sitemap/ is not yet deployed on remote backend
  }

  // 2. Fallback to standard REST endpoints if any collection is still empty
  if (gameRoutes.length === 0) {
    try {
      const res = await fetch(`${API_URL}/games/`, {
        next: { revalidate: 3600, tags: ['games'] },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        const games: SitemapEntryItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];
        gameRoutes = games
          .filter((g) => !g.noindex)
          .map((g) => ({
            url: `${SITE_URL}/store/${g.slug}`,
            lastModified: parseDate(g),
            changeFrequency: 'weekly',
            priority: 0.8,
          }));
      }
    } catch {
      // Ignore
    }
  }

  if (productRoutes.length === 0) {
    try {
      const res = await fetch(`${API_URL}/products/?page_size=100`, {
        next: { revalidate: 3600, tags: ['products'] },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        const items: SitemapEntryItem[] = Array.isArray(data.results) ? data.results : [];
        productRoutes = items
          .filter((p) => !p.noindex)
          .map((p) => ({
            url: `${SITE_URL}/product/${p.slug}`,
            lastModified: parseDate(p),
            changeFrequency: 'daily',
            priority: 0.85,
          }));
      }
    } catch {
      // Ignore
    }
  }

  if (tournamentRoutes.length === 0) {
    try {
      const res = await fetch(`${API_URL}/tournaments/?page_size=100`, {
        next: { revalidate: 3600, tags: ['tournaments'] },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        const items: SitemapEntryItem[] = Array.isArray(data.results) ? data.results : [];
        tournamentRoutes = items
          .filter((t) => !t.noindex)
          .map((t) => ({
            url: `${SITE_URL}/tournaments/${t.slug}`,
            lastModified: parseDate(t),
            changeFrequency: 'daily',
            priority: 0.8,
          }));
      }
    } catch {
      // Ignore
    }
  }

  // 3. Offline static fallbacks
  if (gameRoutes.length === 0) {
    gameRoutes = FALLBACK_GAMES.map((slug) => ({
      url: `${SITE_URL}/store/${slug}`,
      lastModified: STATIC_LASTMOD,
    }));
  }
  if (productRoutes.length === 0) {
    productRoutes = FALLBACK_PRODUCTS.map((slug) => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: STATIC_LASTMOD,
    }));
  }
  if (tournamentRoutes.length === 0) {
    tournamentRoutes = FALLBACK_TOURNAMENTS.map((slug) => ({
      url: `${SITE_URL}/tournaments/${slug}`,
      lastModified: STATIC_LASTMOD,
    }));
  }

  return [...staticRoutes, ...gameRoutes, ...productRoutes, ...tournamentRoutes];
}
