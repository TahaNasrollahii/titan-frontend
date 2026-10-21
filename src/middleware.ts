import { NextRequest, NextResponse } from 'next/server';

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'ref',
];

const NOINDEX_PREFIXES = [
  '/cart',
  '/checkout',
  '/dashboard',
  '/desk',
  '/login',
  '/payment',
  '/invite',
];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Canonical custom domain redirect (if NEXT_PUBLIC_SITE_URL is set)
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (canonicalUrl) {
    try {
      const canonicalHost = new URL(canonicalUrl).host;
      const requestHost = request.headers.get('host');
      if (
        requestHost &&
        canonicalHost &&
        requestHost !== canonicalHost &&
        !requestHost.startsWith('localhost') &&
        !requestHost.startsWith('127.0.0.1')
      ) {
        const url = request.nextUrl.clone();
        url.host = canonicalHost;
        url.protocol = 'https:';
        url.port = '';
        return NextResponse.redirect(url, 301);
      }
    } catch {
      // Ignore invalid URL
    }
  }

  // Legacy route redirect
  if (pathname === '/item-shop') {
    const url = request.nextUrl.clone();
    url.pathname = '/fortnite-shop';
    return NextResponse.redirect(url, 308);
  }

  // Canonicalize /store?game=slug -> /store/slug
  if (pathname === '/store' && searchParams.has('game')) {
    const game = searchParams.get('game');
    if (game) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${encodeURIComponent(game)}`;
      url.searchParams.delete('game');
      return NextResponse.redirect(url, 301);
    }
  }

  // Strip tracking parameters and redundant ?page=1 so duplicate URLs 301 to canonical
  let shouldRedirectParams = false;
  const cleanedUrl = request.nextUrl.clone();

  if (cleanedUrl.searchParams.get('page') === '1') {
    cleanedUrl.searchParams.delete('page');
    shouldRedirectParams = true;
  }

  for (const param of TRACKING_PARAMS) {
    if (cleanedUrl.searchParams.has(param)) {
      cleanedUrl.searchParams.delete(param);
      shouldRedirectParams = true;
    }
  }

  if (shouldRedirectParams) {
    return NextResponse.redirect(cleanedUrl, 301);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const isNonProdEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_NOINDEX === 'true';

  const scriptSrc = isProd
    ? `'self' 'unsafe-inline' https://challenges.cloudflare.com`
    : `'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com`;

  const cspHeader = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob: https://titan-backend-taha.vercel.app https://*.public.blob.vercel-storage.com https://cdn.zarinpal.com https://fortnite-api.com https://*.fortnite-api.com https://cdn2.unrealengine.com https://*.fn-api.cc${isProd ? '' : ' http://localhost:8000 http://127.0.0.1:8000'}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://titan-backend-taha.vercel.app https://payment.zarinpal.com https://challenges.cloudflare.com${isProd ? '' : ' http://localhost:8000'}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://payment.zarinpal.com",
    "object-src 'none'",
    isProd ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  if (isNonProdEnv) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else if (
    NOINDEX_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
