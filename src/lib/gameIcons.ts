// Local copies of the API's game icons. The uploaded originals are ~1 MB, 1536px PNGs;
// these are the same artwork at 192px (1-2 KB) and need no image-optimizer round trip.
const LOCAL_GAME_ICONS: Record<string, string> = {
  'call-of-duty': '/images/categories/callof.webp',
  'clash-of-clans': '/images/categories/clash.webp',
  fortnite: '/images/categories/fortnite.webp',
  valorant: '/images/categories/valorant.webp',
  premium: '/images/categories/premium.webp',
};

export function gameIconSrc(slug: string, remoteIcon?: string | null): string | null {
  return LOCAL_GAME_ICONS[slug] ?? remoteIcon ?? null;
}

/** 512px version of the same artwork for large decorative use (product page watermark). */
export function gameWatermarkSrc(slug: string): string | null {
  const icon = LOCAL_GAME_ICONS[slug];
  return icon ? icon.replace('/images/categories/', '/images/categories/large/') : null;
}

/** Local files are already small; only remote uploads should go through the optimizer. */
export function isLocalAsset(src: string): boolean {
  return src.startsWith('/');
}
