'use client';

import { useEffect, useState } from 'react';

import { contentApi } from '@/lib/api/endpoints';
import type { SearchResults } from '@/lib/api/types';

const SEARCH_DEBOUNCE_MS = 250;

export interface ResultRow {
  key: string;
  title: string;
  kind: 'game' | 'tournament' | 'product';
  href: string;
}

export const KIND_LABELS: Record<ResultRow['kind'], string> = {
  game: 'بازی',
  tournament: 'تورنمنت',
  product: 'محصول',
};

function toRows(results: SearchResults): ResultRow[] {
  return [
    ...results.games.map(game => ({
      key: `g-${game.slug}`,
      title: game.title,
      kind: 'game' as const,
      href: `/store?game=${game.slug}`,
    })),
    ...results.tournaments.map(tournament => ({
      key: `t-${tournament.slug}`,
      title: tournament.title,
      kind: 'tournament' as const,
      href: `/tournaments/${tournament.slug}`,
    })),
    ...results.products.map(product => ({
      key: `p-${product.slug}`,
      title: product.title,
      kind: 'product' as const,
      href: `/product/${product.slug}`,
    })),
  ];
}

/** Debounced search results while `enabled`; an empty query returns popular picks. */
export function useSearchRows(query: string, enabled: boolean) {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await contentApi.search(query.trim());
        if (!cancelled) setRows(toRows(results).slice(0, 8));
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, enabled]);

  return { rows, searching };
}
