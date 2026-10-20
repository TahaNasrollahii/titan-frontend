import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SECRET = 'titan-revalidate-default-secret';
const DEFAULT_TAGS = ['products', 'games', 'promos', 'home'];

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET || DEFAULT_SECRET;
  const headerSecret = request.headers.get('x-revalidate-secret');

  let body: { secret?: string; tags?: string[]; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // Allow empty JSON body when secret is provided via header
  }

  const providedSecret = headerSecret || body.secret;
  if (providedSecret !== configuredSecret) {
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

