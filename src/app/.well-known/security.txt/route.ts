import { NextResponse } from 'next/server';
import { SECURITY_CONTACT_EMAIL, SITE_URL } from '@/lib/siteConfig';

export const dynamic = 'force-static';

export function GET() {
  const content = [
    `Contact: mailto:${SECURITY_CONTACT_EMAIL}`,
    'Expires: 2027-12-31T23:59:59.000Z',
    'Preferred-Languages: fa, en',
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
  ].join('\n');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
