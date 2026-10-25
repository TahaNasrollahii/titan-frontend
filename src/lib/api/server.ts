import { API_URL, sanitizeApiPayload } from './client';

interface EntityFetchOptions {
  revalidate: number;
  tags: string[];
  timeoutMs?: number;
}

/**
 * Server-side lookup for the record a page is about (product, game, tournament).
 *
 * Returns `null` only when the API answers 404. Any other failure (timeout, 5xx,
 * network) throws instead: a thrown render keeps ISR serving the last good page,
 * whereas returning null would make the page call `notFound()` and cache a 404
 * with `noindex` for a real product until the next revalidation.
 */
export async function fetchEntity<T>(path: string, options: EntityFetchOptions): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: options.revalidate, tags: options.tags },
    signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API ${path} responded with ${res.status}`);
  }
  const json = (await res.json()) as T;
  return sanitizeApiPayload(json);
}
