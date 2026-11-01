import { NextRequest, NextResponse } from 'next/server';
import { CODM_REVALIDATE_SECONDS, getCodmStoreOffers } from '@/lib/codmStore';

// Public, credential-free data: the Telegram Mini App (another origin) can read it too.
const PUBLIC_CORS = { 'Access-Control-Allow-Origin': '*' };

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region') || 'us';
  const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';

  const data = await getCodmStoreOffers(region, forceFresh);

  if (!data || data.totalOffers === 0) {
    return NextResponse.json(
      {
        detail:
          'در حال حاضر دریافت اطلاعات پیشنهادات وباستور کالاف دیوتی موبایل امکان‌پذیر نیست. لطفاً چند لحظه دیگر تلاش کنید.',
      },
      { status: 503, headers: PUBLIC_CORS },
    );
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${CODM_REVALIDATE_SECONDS}, stale-while-revalidate=600`,
      ...PUBLIC_CORS,
    },
  });
}
