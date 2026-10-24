import { timingSafeEqual } from 'node:crypto';

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Matches the backend's local default. It is visible in the source, so it may only
// ever be accepted outside production.
const DEV_FALLBACK_SECRET = 'titan-revalidate-default-secret';
const DEFAULT_TAGS = ['products', 'games', 'promos', 'home'];

function configuredSecret(): string | null {
  if (process.env.REVALIDATE_SECRET) return process.env.REVALIDATE_SECRET;
  return process.env.NODE_ENV === 'production' ? null : DEV_FALLBACK_SECRET;
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expectedSecret = configuredSecret();
  if (!expectedSecret) {
    console.error('[revalidate] REVALIDATE_SECRET is not set; on-demand revalidation is disabled.');
    return NextResponse.json({ revalidated: false, detail: 'Revalidation is not configured' }, { status: 503 });
  }
  const headerSecret = request.headers.get('x-revalidate-secret');

  let body: { secret?: string; tags?: string[]; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // Allow empty JSON body when secret is provided via header
  }

  const providedSecret = headerSecret || body.secret;
  if (typeof providedSecret !== 'string' || !secretsMatch(providedSecret, expectedSecret)) {
    return NextResponse.json({ revalidated: false, detail: 'Invalid secret' }, { status: 401 });
  }

  const tagsToRevalidate = new Set<string>([
    ...DEFAULT_TAGS,
    ...(Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string' && Boolean(t)) : []),
  ]);

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag, { expire: 0 });
  }

  // Revalidate main store, category routes, product detail routes, and home page
  revalidatePath('/store');
  revalidatePath('/store/[game]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/');

  if (Array.isArray(body.paths)) {
    for (const path of body.paths) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
      }
    }
  }

  return NextResponse.json({
    revalidated: true,
    tags: Array.from(tagsToRevalidate),
    now: Date.now(),
  });
}

