import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isProd = process.env.NODE_ENV === 'production';

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://challenges.cloudflare.com`;

  const cspHeader = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://titan-backend-taha.vercel.app https://*.public.blob.vercel-storage.com https://cdn.zarinpal.com",
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
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

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

