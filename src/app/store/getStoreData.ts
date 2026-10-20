import { API_URL } from '@/lib/api/client';
import type { Game, Paginated, ProductSummary, Promo } from '@/lib/api/types';

export async function getStoreProducts(game?: string, pageSize = 12): Promise<Paginated<ProductSummary> | null> {
  try {
    const url = new URL(`${API_URL}/products/`);
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('ordering', '-popularity');
    if (game) {
      url.searchParams.set('game', game);
    }
    const tags = game ? ['products', `products-${game}`] : ['products'];
    const res = await fetch(url.toString(), {
      next: { revalidate: 30, tags },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
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
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllGames(): Promise<Game[] | null> {
  try {
    const res = await fetch(`${API_URL}/games/`, {
      next: { revalidate: 60, tags: ['games'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  try {
    const res = await fetch(`${API_URL}/games/${slug}/`, {
      next: { revalidate: 60, tags: ['games', `game-${slug}`] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getStorePromos(placement: 'store_discount' | 'store_bestseller'): Promise<Promo[] | null> {
  try {
    const res = await fetch(`${API_URL}/content/promos/?placement=${placement}`, {
      next: { revalidate: 60, tags: ['promos'] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
