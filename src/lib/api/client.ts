import type { AuthTokens, Product, ProductSummary } from './types';

export const API_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    if (host.includes('vercel.app')) {
      return 'https://titan-backend-taha.vercel.app/api/v1';
    }
    return `http://${host}:8000/api/v1`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://titan-backend-taha.vercel.app/api/v1';
  }
  return 'http://127.0.0.1:8000/api/v1';
})();

const TOKENS_KEY = 'titan.tokens';
const AUTH_EVENT = 'titan:auth-changed';

// ------------------------------------------------------------------ token storage
let memoryTokens: AuthTokens | null = null;

export function getTokens(): AuthTokens | null {
  if (memoryTokens?.access) {
    return memoryTokens;
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthTokens;
      if (parsed && parsed.access) {
        memoryTokens = { access: parsed.access, refresh: parsed.refresh ?? '' };
        return memoryTokens;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function setTokens(tokens: AuthTokens | null): void {
  if (tokens?.access) {
    const prevRefresh = memoryTokens?.refresh || '';
    memoryTokens = {
      access: tokens.access,
      refresh: tokens.refresh || prevRefresh,
    };
  } else {
    memoryTokens = null;
  }
  if (typeof window !== 'undefined') {
    try {
      if (memoryTokens) {
        window.localStorage.setItem(TOKENS_KEY, JSON.stringify(memoryTokens));
      } else {
        window.localStorage.removeItem(TOKENS_KEY);
      }
    } catch {
      // ignore storage quota errors
    }
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

/** Subscribe to login/logout happening anywhere (including token expiry). Returns an unsubscribe function. */
export function onAuthChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
}

// ------------------------------------------------------------------ errors
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: string,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(detail);
    this.name = 'ApiError';
  }

  /** First field-level message, falling back to the general detail. */
  get firstMessage(): string {
    const first = Object.values(this.errors)[0] as unknown;
    if (typeof first === 'string' && first.trim()) return first;
    if (Array.isArray(first) && first.length > 0 && typeof first[0] === 'string') return first[0];
    return this.detail;
  }
}

export function errorMessage(error: unknown, fallback = 'خطایی رخ داد. دوباره تلاش کنید.'): string {
  if (error instanceof ApiError) return error.firstMessage;
  return fallback;
}

// ------------------------------------------------------------------ requests
type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  /** Send the bearer token when available (default true). */
  auth?: boolean;
  /** Extra request headers, e.g. the live-chat visitor token. */
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_URL}/${path.replace(/^\//, '')}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach(item => url.searchParams.append(key, String(item)));
    else url.searchParams.set(key, String(value));
  }
  return url.toString();
}

let refreshInFlight: Promise<boolean> | null = null;

/** Exchange the stored refresh token (or HttpOnly cookie) for a new access token. Concurrent callers share one request. */
export function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const currentRefresh = getTokens()?.refresh || '';
      const response = await fetch(buildUrl('auth/token/refresh/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(currentRefresh ? { refresh: currentRefresh } : {}),
      });
      if (!response.ok) {
        setTokens(null);
        return false;
      }
      const data = (await response.json()) as AuthTokens;
      setTokens({
        access: data.access,
        refresh: data.refresh || currentRefresh,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'fa',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };
  const access = options.auth === false ? undefined : getTokens()?.access;
  if (access) headers.Authorization = `Bearer ${access}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) body = options.body;
  else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body,
  });
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const payload = await response.json();
    return new ApiError(response.status, payload.code ?? 'error', payload.detail ?? response.statusText, payload.errors);
  } catch {
    return new ApiError(response.status, 'network_error', 'ارتباط با سرور برقرار نشد.');
  }
}

function replaceApexText(value: string): string {
  if (!value) return value;
  if (value.includes('apexlegends-background')) return '/images/games/callof-background.webp';
  if (value.includes('apexlegends-character') || value.includes('callof-character.webp')) return '/images/games/callof-character-v2.webp';
  if (value.includes('categories/apex') || value.includes('categories/callof.webp')) return '/images/categories/codm-official-m-20x20.svg';
  if (value.includes('hero/characters/apexlegends') || value.includes('hero/characters/callof.webp')) return '/images/hero/characters/callof-v2.webp';
  if (value.includes('hero/characters/fortnite-crewpack-october2026.webp')) return '/images/hero/characters/fortnite-crew-subscription-character.webp';
  if (value.includes('fortnite-crewpack-october2026.webp')) return '/images/fortnite-crew-subscription-banner.webp';
  if (value.includes('tournoment-banner.webp')) return '/images/titan-tournament-banner.webp';
  if (value.includes('Barbarian-Pig-Rider-Reward-Rush.webp')) return '/images/products/clash-of-clans-gold-pass-rider.webp';
  if (value.includes('goblin_transparent.webp')) return '/images/products/clash-of-clans-gems-goblin.webp';
  if (value.includes('Jett-Inspired Agent with Turkish 375 VP Badge.webp') || value.includes('Jett-Inspired%20Agent%20with%20Turkish%20375%20VP%20Badge.webp')) {
    return '/images/products/valorant-points-375-turkish-agent.webp';
  }
  if (value.includes('Molten-Gold-Lightning-King.webp')) return '/images/products/call-of-duty-mobile-cp-king.webp';
  if (value.includes('Starter-Pack-Fortnite.webp')) return '/images/products/fortnite-starter-pack-character.webp';
  if (value === '/images/products/vbucks.webp') return '/images/products/fortnite-vbucks-coins.webp';
  if (value === '/images/products/giftcard.svg') return '/images/products/digital-gift-card-icon.svg';
  return value
    .replace(/Apex\s+Predators/gi, 'Task Force 141')
    .replace(/Apex_Predator/gi, 'Ghost_Operator')
    .replace(/WraithMain/gi, 'SoapMacTavish')
    .replace(/OctaneRush/gi, 'PriceCaptain')
    .replace(/Apex\s+Legends/gi, 'Call of Duty Mobile')
    .replace(/Apex\s+Coins/gi, 'COD Points')
    .replace(/باندل ویژه\s+(?:Apex|Call of Duty)/gi, 'CP کالاف دیوتی موبایل')
    .replace(/شامل اسکین (?:اپیک و ۱۰۰۰ کوین|اپراتور و ۱,۱۰۰ سی‌پی)/g, 'شارژ سریع سی‌پی روی اکانت اکتیویژن')
    .replace(/ایپکس\s*لجندز|اپکس\s*لجندز/g, 'کالاف دیوتی موبایل')
    .replace(/ایپکس\s*کوین|اپکس\s*کوین/g, 'سی‌پی کالاف دیوتی موبایل')
    .replace(/ایپکس|اپکس/g, 'کالاف دیوتی موبایل')
    .replace(/\bApex\b/g, 'Call of Duty Mobile')
    .replace(/کال\s*آو\s*دیوتی(?!\s*موبایل)/g, 'کالاف دیوتی موبایل')
    .replace(/کال\s*آو\s*دیوتی\s*موبایل/g, 'کالاف دیوتی موبایل')
    .replace(/کالاف\s*دیوتی(?!\s*موبایل)/g, 'کالاف دیوتی موبایل')
    .replace(/ولورنت/g, 'ولورانت')
    .replace(/تورنمنت/g, 'تورنومنت')
    .replace(/۱۰۰٪\s*قانونی\s*و\s*اورجینال/g, 'تحویل سریع و پشتیبانی ۲۴ ساعته')
    .replace(/۱۰۰٪\s*قانونی/g, 'تحویل امن و سریع')
    .replace(/خرید\s+قانونی/g, 'خرید امن')
    .replace(/شارژ\s+فوری\s+و\s+قانونی/g, 'شارژ سریع و امن')
    .replace(/کاملاً\s+قانونی/g, 'از طریق روش‌های معتبر');
}

function isGameArray(arr: unknown[]): boolean {
  return (
    arr.length > 0 &&
    typeof arr[0] === 'object' &&
    arr[0] !== null &&
    'slug' in arr[0] &&
    'titleEn' in arr[0] &&
    !('prizePool' in arr[0]) &&
    !('price' in arr[0])
  );
}

const DEFAULT_COD_GAME = {
  slug: 'call-of-duty',
  title: 'کالاف دیوتی موبایل',
  titleEn: 'Call of Duty Mobile',
  iconImage: '/images/categories/codm-official-m-20x20.svg',
  accentColor: '#f59e0b',
  accentGradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
  description:
    'خرید سریع سی‌پی کالاف دیوتی موبایل (CP) و بتل‌پس برای Call of Duty Mobile با پشتیبانی ۲۴ ساعته.',
  genre: 'شوتر اول‌شخص',
  kind: 'game',
  coverImage: '/images/games/callof-background.webp',
  logoImage: null,
  backgroundImage: '/images/games/callof-background.webp',
  characterImage: '/images/games/callof-character-v2.webp',
  isFeatured: true,
  productCount: 1,
  tournamentCount: 2,
  playerCount: 120,
};

const DEFAULT_CLASH_GAME = {
  slug: 'clash-of-clans',
  title: 'کلش آف کلنز',
  titleEn: 'Clash of Clans',
  iconImage: '/images/categories/clash.webp',
  accentColor: '#38bdf8',
  accentGradient: 'linear-gradient(135deg,#0c4a6e,#38bdf8)',
  description:
    'خرید سریع جم کلش آف کلنز (Gems) و گلدپس (Gold Pass) روی اکانت Supercell ID در تایتان.',
  genre: 'استراتژی آنلاین',
  kind: 'game',
  coverImage: '/images/games/clash-background.webp',
  logoImage: null,
  backgroundImage: '/images/games/clash-background.webp',
  characterImage: '/images/games/clash-character.webp',
  isFeatured: true,
  productCount: 1,
  tournamentCount: 0,
  playerCount: 95,
};

export const DEFAULT_CLASH_PRODUCT_SUMMARY: ProductSummary = {
  id: 9902,
  slug: 'clash-of-clans-gems',
  title: 'جم کلش آف کلنز (Gems)',
  subtitle: 'شارژ مستقیم اکانت Supercell ID',
  image: '/images/products/clash-of-clans-gems-goblin.webp',
  imageAlt: 'خرید جم کلش آف کلنز (Clash of Clans Gems) در فروشگاه تایتان',
  sku: 'TITAN-COC-GEMS',
  price: 95000,
  originalPrice: 110000,
  discountPercent: 14,
  hasVariants: true,
  priceMax: 1850000,
  rating: 4.9,
  reviewCount: 18,
  badges: ['bestseller', 'discount'] as ('bestseller' | 'discount' | 'new')[],
  inStock: true,
  vendor: 'Supercell',
  deliveryType: 'account' as const,
  game: {
    slug: 'clash-of-clans',
    title: 'کلش آف کلنز',
    titleEn: 'Clash of Clans',
    iconImage: '/images/categories/clash.webp',
    accentColor: '#38bdf8',
  },
  category: { slug: 'game-currency', name: 'ارز بازی' },
  platforms: ['Mobile'],
  isWishlisted: false,
  popularity: 88,
};

export const DEFAULT_CLASH_PRODUCT_DETAIL: Product = {
  ...DEFAULT_CLASH_PRODUCT_SUMMARY,
  mpn: 'COC-GEMS',
  metaTitle: 'خرید جم کلش آف کلنز (Clash of Clans Gems) | شارژ سریع و ارزان',
  metaDescription:
    'خرید جم کلش آف کلنز (Clash of Clans Gems) در بسته‌های ۸۰ تا ۲۵۰۰ تایی با شارژ سریع روی اکانت Supercell ID و پشتیبانی ۲۴ ساعته در تایتان.',
  platforms: [{ slug: 'mobile', name: 'Mobile', icon: null }],
  description:
    'جم کلش آف کلنز (Clash of Clans Gems) اصلی‌ترین ارز درون‌برنامه‌ای بازی استراتژیک سوپرسل است که برای استخدام کارگران بیشتر (Builder\'s Hut)، خرید تجهیزات اپیک هیروها (Hero Equipment)، اسکین‌های قهرمانان، کتاب‌های جادویی تاجر (Trader) و تکمیل سریع ارتقای ساختمان‌ها و نیروها استفاده می‌شود. بسته‌های جم در فروشگاه تایتان از طریق Supercell ID روی اکانت شما شارژ می‌شوند.',
  deliveryInfo: 'شارژ مستقیم اکانت Supercell ID',
  requiresGameAccount: true,
  stock: null,
  features: [
    { title: 'تحویل سریع', description: 'در کمتر از ۱۵ دقیقه', icon: 'flame' },
    { title: 'تضمین تحویل', description: 'شارژ امن روی Supercell ID', icon: 'shield' },
    { title: 'پشتیبانی ۲۴/۷', description: 'پاسخگویی سریع در چت', icon: 'chat' },
  ],
  tags: ['تحویل سریع', 'شارژ روی Supercell ID', 'پشتیبانی ۲۴ ساعته'],
  specs: { region: 'Global', delivery: 'زیر ۱۵ دقیقه', activation: 'شارژ مستقیم اکانت' },
  variants: [
    { id: 99021, label: '۸۰ جم', price: 95000, originalPrice: 110000, discountPercent: 14, inStock: true },
    { id: 99022, label: '۵۰۰ جم', price: 390000, originalPrice: 440000, discountPercent: 11, inStock: true },
    { id: 99023, label: '۱,۲۰۰ جم', price: 790000, originalPrice: 890000, discountPercent: 11, inStock: true },
    { id: 99024, label: '۲,۵۰۰ جم', price: 1850000, originalPrice: 2050000, discountPercent: 10, inStock: true },
  ],
  gallery: [],
};

export const DEFAULT_FORTNITE_CREW_PRODUCT_DETAIL: Product = {
  id: 9903,
  slug: 'fortnite-crew',
  title: 'خرید کروپک فورتنایت (Fortnite Crew) از تایتان',
  subtitle:
    'سفارش اشتراک ماهانه کروپک فورتنایت با پرداخت ریالی؛ شامل ۱٬۰۰۰ وی‌باکس، اسکین ماهانه و دسترسی به پس‌های فصل ({{VERIFY}})',
  image: '/images/fortnite-crew-subscription-banner.webp',
  imageAlt: 'نمایش اشتراک ماهانه کروپک فورتنایت (Fortnite Crew) در فروشگاه تایتان',
  sku: 'TITAN-FN-CREW',
  mpn: 'FN-CREW-1M',
  price: null,
  originalPrice: null,
  discountPercent: 0,
  hasVariants: false,
  priceMax: null,
  rating: 0,
  reviewCount: 0,
  badges: ['bestseller'],
  inStock: true,
  vendor: 'Epic Games',
  deliveryType: 'account',
  credentialType: 'email_password',
  game: {
    slug: 'fortnite',
    title: 'فورتنایت',
    titleEn: 'Fortnite',
    iconImage: '/images/categories/fortnite.webp',
    accentColor: '#00d4ff',
  },
  category: { slug: 'subscriptions', name: 'اشتراک بازی' },
  platforms: [
    { slug: 'pc', name: 'PC', icon: null },
    { slug: 'playstation', name: 'PlayStation', icon: null },
    { slug: 'xbox', name: 'Xbox', icon: null },
    { slug: 'mobile', name: 'Mobile', icon: null },
  ],
  isWishlisted: false,
  description: '',
  deliveryInfo: '{{DELIVERY_METHOD}} (زمان تحویل: {{DELIVERY_TIME}})',
  requiresGameAccount: true,
  stock: null,
  features: [
    { title: 'تضمین تحویل سفارش', description: 'پیگیری و بازگشت وجه طبق قوانین', icon: 'shield' },
    { title: 'تحویل در {{DELIVERY_TIME}}', description: 'روش فعال‌سازی: {{DELIVERY_METHOD}}', icon: 'flame' },
    { title: 'پشتیبانی ۲۴ ساعته', description: 'همراه شما تا تکمیل سفارش', icon: 'chat' },
  ],
  tags: [],
  specs: {
    region: '{{VERIFY}}',
    delivery: '{{DELIVERY_TIME}}',
    activation: '{{DELIVERY_METHOD}}',
  },
  variants: [],
  gallery: [],
};

export function sanitizeApiPayload<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return replaceApexText(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    const mapped = input.map(item => sanitizeApiPayload(item));
    if (isGameArray(mapped)) {
      const seen = new Set<string>();
      const deduped: Record<string, unknown>[] = [];
      for (const g of mapped as Record<string, unknown>[]) {
        if (!g || typeof g.slug !== 'string' || seen.has(g.slug)) continue;
        seen.add(g.slug);
        deduped.push(g);
      }
      if (!seen.has('call-of-duty')) {
        deduped.push({ ...DEFAULT_COD_GAME });
      }
      if (!seen.has('clash-of-clans')) {
        deduped.push({ ...DEFAULT_CLASH_GAME });
      }
      // Move 'premium' to the very end of game list
      const nonPrem: Record<string, unknown>[] = [];
      const prem: Record<string, unknown>[] = [];
      for (const g of deduped) {
        const slug = String(g.slug || '');
        const title = String(g.title || '');
        if (slug === 'premium' || slug.includes('premium') || /پرمیوم|پریمیوم/i.test(title)) {
          prem.push(g);
        } else {
          nonPrem.push(g);
        }
      }
      return nonPrem.concat(prem) as unknown as T;
    }
    return mapped as unknown as T;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;

    // Game or GameMini or GameRef object with apex-legends
    if (obj.slug === 'apex-legends' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        ...DEFAULT_COD_GAME,
      } as unknown as T;
    }
    if (obj.slug === 'call-of-duty' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        title: 'کالاف دیوتی موبایل',
        titleEn: 'Call of Duty Mobile',
        iconImage: '/images/categories/codm-official-m-20x20.svg',
        accentColor: obj.accentColor || '#f59e0b',
        backgroundImage: '/images/games/callof-background.webp',
        characterImage: '/images/games/callof-character-v2.webp',
        coverImage: obj.coverImage || '/images/games/callof-background.webp',
      } as unknown as T;
    }
    if (obj.slug === 'clash-of-clans' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        title: 'کلش آف کلنز',
        titleEn: 'Clash of Clans',
        iconImage: '/images/categories/clash.webp',
        accentColor: obj.accentColor || '#38bdf8',
        backgroundImage: '/images/games/clash-background.webp',
        characterImage: '/images/games/clash-character.webp',
        coverImage: obj.coverImage || '/images/games/clash-background.webp',
      } as unknown as T;
    }

    // Promo with apex-coins or cod-points bestseller banner
    if (
      'placement' in obj &&
      (obj.product === 'apex-coins' ||
        obj.product === 'cod-points' ||
        /apex|ایپکس|اپکس|باندل ویژه Call of Duty/i.test(String(obj.title ?? '')))
    ) {
      return {
        ...obj,
        title: 'CP کالاف دیوتی موبایل',
        subtitle: 'شارژ سریع سی‌پی روی اکانت اکتیویژن',
        price: 95000,
        image: '/images/products/call-of-duty-mobile-cp-king.webp',
        backgroundImage: '/images/games/callof-background.webp',
        product: 'cod-points',
      } as unknown as T;
    }

    // Product with slug === 'apex-coins'
    if (obj.slug === 'apex-coins' && 'price' in obj) {
      const gameObj = obj.game && typeof obj.game === 'object' ? (obj.game as Record<string, unknown>) : null;
      return {
        ...obj,
        slug: 'cod-points',
        title: 'سی‌پی کالاف دیوتی موبایل (COD Points)',
        description: 'خرید سی‌پی کالاف دیوتی موبایل (CP) برای خرید بتل‌پس، اسکین اپراتور و گردونه با شارژ سریع.',
        image: '/images/products/call-of-duty-mobile-cp-king.webp',
        game: gameObj
          ? {
              ...gameObj,
              slug: 'call-of-duty',
              title: 'کالاف دیوتی موبایل',
              titleEn: 'Call of Duty Mobile',
              iconImage: '/images/categories/codm-official-m-20x20.svg',
              accentColor: '#f59e0b',
            }
          : obj.game,
      } as unknown as T;
    }

    if (obj.slug === 'cod-points' && 'price' in obj && (!obj.image || String(obj.image).includes('callof-character') || String(obj.image).includes('Molten-Gold'))) {
      obj.image = '/images/products/call-of-duty-mobile-cp-king.webp';
    }
    if (obj.slug === 'clash-of-clans-gems' && 'price' in obj && (!obj.image || String(obj.image).includes('clash-character') || String(obj.image).includes('goblin_transparent'))) {
      obj.image = '/images/products/clash-of-clans-gems-goblin.webp';
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'favoriteGame' && v === 'apex-legends') {
        out[k] = 'call-of-duty';
      } else {
        out[k] = sanitizeApiPayload(v);
      }
    }

    // Deduplicate paginated product results if apex-coins was converted to cod-points alongside existing cod-points
    if (Array.isArray(out.results)) {
      const seenSlugs = new Set<string>();
      out.results = out.results.filter((item: unknown) => {
        if (item && typeof item === 'object' && 'slug' in item) {
          const slugVal = (item as Record<string, unknown>).slug;
          if (typeof slugVal === 'string') {
            if (seenSlugs.has(slugVal)) return false;
            seenSlugs.add(slugVal);
          }
        }
        return true;
      });
    }

    return out as T;
  }
  return input;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await send(path, options);
    if (response.status === 401 && options.auth !== false) {
      // Attempt silent refresh via HttpOnly cookie
      const refreshed = await refreshTokens();
      if (refreshed) {
        response = await send(path, options);
      }
    }
  } catch {
    throw new ApiError(0, 'network_error', 'ارتباط با سرور برقرار نشد.');
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const json = (await response.json()) as T;
  return sanitizeApiPayload(json);
}
