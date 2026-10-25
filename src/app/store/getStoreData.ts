import { API_URL, DEFAULT_CLASH_PRODUCT_SUMMARY, sanitizeApiPayload } from '@/lib/api/client';
import { fetchEntity } from '@/lib/api/server';
import type { Game, Paginated, ProductSummary, Promo } from '@/lib/api/types';

export const FALLBACK_FEATURED_GAMES: Record<string, Game> = {
  'call-of-duty': {
    slug: 'call-of-duty',
    title: 'کال آو دیوتی',
    titleEn: 'Call of Duty',
    iconImage: null,
    accentColor: '#f59e0b',
    accentGradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
    description:
      'خرید قانونی و فوری سی‌پی کال آو دیوتی (CP) و بتل‌پس برای Call of Duty Mobile و Warzone با تحویل آنی.',
    genre: 'شوتر اول‌شخص',
    kind: 'game',
    coverImage: '/images/games/callof-background.webp',
    logoImage: null,
    backgroundImage: '/images/games/callof-background.webp',
    characterImage: '/images/games/callof-character-v2.webp',
    isFeatured: true,
    productCount: 1,
    tournamentCount: 2,
    playerCount: 120,
  },
  'clash-of-clans': {
    slug: 'clash-of-clans',
    title: 'کلش آف کلنز',
    titleEn: 'Clash of Clans',
    iconImage: null,
    accentColor: '#38bdf8',
    accentGradient: 'linear-gradient(135deg,#0c4a6e,#38bdf8)',
    description:
      'خرید قانونی و فوری جم کلش آف کلنز (Gems) و گلدپس (Gold Pass) با بهترین قیمت و تحویل آنی در تایتان.',
    genre: 'استراتژی آنلاین',
    kind: 'game',
    coverImage: '/images/games/clash-background.webp',
    logoImage: null,
    backgroundImage: '/images/games/clash-background.webp',
    characterImage: '/images/games/clash-character.webp',
    isFeatured: true,
    productCount: 1,
    tournamentCount: 0,
    playerCount: 95,
  },
};

export function normalizeFeaturedGames(rawGames: Game[] | null | undefined): Game[] {
  const list = Array.isArray(rawGames) ? rawGames : [];
  const hasCod = list.some(g => g.slug === 'call-of-duty');
  const result: Game[] = [];

  for (const g of list) {
    if (g.slug === 'apex-legends') {
      if (!hasCod) {
        result.push({
          ...FALLBACK_FEATURED_GAMES['call-of-duty'],
        });
      }
      continue;
    }
    if (g.slug === 'call-of-duty') {
      result.push({
        ...g,
        isFeatured: true,
        backgroundImage: '/images/games/callof-background.webp',
        characterImage: '/images/games/callof-character-v2.webp',
        coverImage: g.coverImage || '/images/games/callof-background.webp',
      });
      continue;
    }
    if (g.slug === 'clash-of-clans') {
      result.push({
        ...g,
        isFeatured: true,
        backgroundImage: '/images/games/clash-background.webp',
        characterImage: '/images/games/clash-character.webp',
        coverImage: g.coverImage || '/images/games/clash-background.webp',
      });
      continue;
    }
    result.push(g);
  }

  if (!result.some(g => g.slug === 'call-of-duty')) {
    const premIdx = result.findIndex(g => g.slug === 'premium');
    if (premIdx >= 0) result.splice(premIdx, 0, FALLBACK_FEATURED_GAMES['call-of-duty']);
    else result.push(FALLBACK_FEATURED_GAMES['call-of-duty']);
  }

  if (!result.some(g => g.slug === 'clash-of-clans')) {
    const premIdx = result.findIndex(g => g.slug === 'premium');
    if (premIdx >= 0) result.splice(premIdx, 0, FALLBACK_FEATURED_GAMES['clash-of-clans']);
    else result.push(FALLBACK_FEATURED_GAMES['clash-of-clans']);
  }

  return result;
}

export async function getStoreProducts(
  game?: string,
  pageSize = 12,
  page = 1,
): Promise<Paginated<ProductSummary> | null> {
  try {
    const url = new URL(`${API_URL}/products/`);
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('ordering', '-popularity');
    if (page > 1) {
      url.searchParams.set('page', String(page));
    }
    if (game) {
      url.searchParams.set('game', game);
    }
    const tags = game ? ['products', `products-${game}`] : ['products'];
    const res = await fetch(url.toString(), {
      next: { revalidate: 30, tags },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: Paginated<ProductSummary> = sanitizeApiPayload(await res.json());
    if (data && Array.isArray(data.results)) {
      const filtered = data.results.filter(
        p => p.slug !== 'apex-coins' && p.game?.slug !== 'apex-legends',
      );
      if (game === 'clash-of-clans' && filtered.length === 0) {
        return { count: 1, next: null, previous: null, results: [DEFAULT_CLASH_PRODUCT_SUMMARY] };
      }
      if (!game && page === 1 && !filtered.some(p => p.slug === 'clash-of-clans-gems')) {
        filtered.push(DEFAULT_CLASH_PRODUCT_SUMMARY);
      }
      return {
        ...data,
        count: Math.max(filtered.length, data.count ?? filtered.length),
        results: filtered,
      };
    }
    return data;
  } catch {
    return null;
  }
}

export async function getStoreGames(): Promise<Game[] | null> {
  try {
    const res = await fetch(`${API_URL}/games/?is_featured=true`, {
      next: { revalidate: 60, tags: ['games'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return normalizeFeaturedGames(null);
    const data = await res.json();
    const list: Game[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
    return normalizeFeaturedGames(list);
  } catch {
    return normalizeFeaturedGames(null);
  }
}

export async function getAllGames(): Promise<Game[] | null> {
  try {
    const res = await fetch(`${API_URL}/games/`, {
      next: { revalidate: 60, tags: ['games'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return normalizeFeaturedGames(null);
    const data = await res.json();
    const list: Game[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
    return normalizeFeaturedGames(list);
  } catch {
    return normalizeFeaturedGames(null);
  }
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  if (slug === 'apex-legends') return null;
  const game = await fetchEntity<Game>(`/games/${slug}/`, {
    revalidate: 60,
    tags: ['games', `game-${slug}`],
  });
  if (game) {
    if (slug === 'call-of-duty' || slug === 'clash-of-clans') {
      const fb = FALLBACK_FEATURED_GAMES[slug];
      return {
        ...game,
        backgroundImage: fb.backgroundImage,
        characterImage: fb.characterImage,
        coverImage: game.coverImage || fb.coverImage,
      };
    }
    return game;
  }
  return FALLBACK_FEATURED_GAMES[slug] ?? null;
}

export async function getStorePromos(placement: 'store_discount' | 'store_bestseller'): Promise<Promo[] | null> {
  try {
    const res = await fetch(`${API_URL}/content/promos/?placement=${placement}`, {
      next: { revalidate: 60, tags: ['promos'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return sanitizeApiPayload(await res.json());
  } catch {
    return null;
  }
}
