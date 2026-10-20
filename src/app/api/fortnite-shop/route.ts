import { NextRequest, NextResponse } from 'next/server';
import { getFortniteShop, getSmartRevalidateSeconds } from '@/lib/fortniteShop';

export async function GET(request: NextRequest) {
  const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';
  const data = await getFortniteShop(forceFresh);

  if (!data) {
    return NextResponse.json(
      { detail: 'در حال حاضر دریافت اطلاعات آیتم شاپ فورتنایت امکان‌پذیر نیست. لطفاً چند لحظه دیگر تلاش کنید.' },
      { status: 503 },
    );
  }

  const maxAge = getSmartRevalidateSeconds();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=600`,
    },
  });
}

