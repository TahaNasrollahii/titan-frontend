import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';
import { API_URL } from '@/lib/api/client';

interface ProductItem {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}

interface TournamentItem {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  startsAt?: string;
}

interface GameItem {
  slug: string;
  updatedAt?: string;
}

// Fixed stable date for static pages instead of dynamic new Date() on every request
const STATIC_LASTMOD = new Date('2026-10-15T12:00:00.000Z');

const FALLBACK_GAMES = [
  'fortnite',
  'valorant',
  'apex-legends',
  'premium',
  'call-of-duty',
  'ea-fc',
  'pubg',
  'minecraft',
  'cs2',
  'dota-2',
];

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
  'elden-crown-deluxe',
  'titan-gift-card-50',
];

const FALLBACK_TOURNAMENTS = [
  'titan-apex-solo',
  'titan-valorant-champions',
  'titan-fortnite-duo',
  'cod-search-destroy',
  'fortnite-ranked-arena',
  'apex-arena-showdown',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static core routes with stable lastmod
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: STATIC_LASTMOD,
    },
    {
      url: `${SITE_URL}/store`,
      lastModified: STATIC_LASTMOD,
    },
    {
      url: `${SITE_URL}/fortnite-shop`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/tournaments`,
      lastModified: STATIC_LASTMOD,
    },
    {
      url: `${SITE_URL}/tournament`,
      lastModified: STATIC_LASTMOD,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_LASTMOD,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: STATIC_LASTMOD,
    },
  ];

  // Game category routes (/store/[game])
  let gameRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/games/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const games: GameItem[] = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
      if (games.length > 0) {
        gameRoutes = games.map(g => ({
          url: `${SITE_URL}/store/${g.slug}`,
          lastModified: g.updatedAt ? new Date(g.updatedAt) : STATIC_LASTMOD,
        }));
      }
    }
  } catch {
    // Backend unreachable: use fallback list
  }

  if (gameRoutes.length === 0) {
    gameRoutes = FALLBACK_GAMES.map(slug => ({
      url: `${SITE_URL}/store/${slug}`,
      lastModified: STATIC_LASTMOD,
    }));
  }

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
          lastModified: p.updatedAt ? new Date(p.updatedAt) : (p.createdAt ? new Date(p.createdAt) : STATIC_LASTMOD),
        }));
      }
    }
  } catch {
    // Backend unreachable: use fallback list
  }

  if (productRoutes.length === 0) {
    productRoutes = FALLBACK_PRODUCTS.map(slug => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: STATIC_LASTMOD,
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
          lastModified: t.updatedAt
            ? new Date(t.updatedAt)
            : (t.createdAt
              ? new Date(t.createdAt)
              : (t.startsAt ? new Date(t.startsAt) : STATIC_LASTMOD)),
        }));
      }
    }
  } catch {
    // Backend unreachable: use fallback list
  }

  if (tournamentRoutes.length === 0) {
    tournamentRoutes = FALLBACK_TOURNAMENTS.map(slug => ({
      url: `${SITE_URL}/tournaments/${slug}`,
      lastModified: STATIC_LASTMOD,
    }));
  }

  return [...staticRoutes, ...gameRoutes, ...productRoutes, ...tournamentRoutes];
}
