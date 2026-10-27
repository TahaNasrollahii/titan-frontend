import type { AuthTokens, Product, ProductSummary } from './types';

export const API_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8000/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
})();

const TOKENS_KEY = 'titan.tokens';
const AUTH_EVENT = 'titan:auth-changed';

// ------------------------------------------------------------------ token storage
// In-memory access token storage prevents XSS script access to tokens
let memoryAccessToken: string | null = null;

export function getTokens(): AuthTokens | null {
  if (memoryAccessToken) {
    return { access: memoryAccessToken, refresh: '' };
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthTokens;
      memoryAccessToken = parsed.access || null;
      // Immediately purge refresh token from localStorage if present (migrating to HttpOnly cookie)
      if (parsed.refresh) {
        window.localStorage.removeItem(TOKENS_KEY);
      }
      return memoryAccessToken ? { access: memoryAccessToken, refresh: '' } : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function setTokens(tokens: AuthTokens | null): void {
  memoryAccessToken = tokens?.access ?? null;
  if (typeof window !== 'undefined') {
    // Only keep access token in memory. Clear refresh token from localStorage.
    window.localStorage.removeItem(TOKENS_KEY);
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

/** Exchange the HttpOnly cookie (or fallback body refresh) for a new access token. Concurrent callers share one request. */
export function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(buildUrl('auth/token/refresh/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        setTokens(null);
        return false;
      }
      const data = (await response.json()) as AuthTokens;
      setTokens(data);
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
  if (value.includes('categories/apex') || value.includes('categories/callof.webp')) return '/images/categories/callof-v2.webp';
  if (value.includes('hero/characters/apexlegends') || value.includes('hero/characters/callof.webp')) return '/images/hero/characters/callof-v2.webp';
  return value
    .replace(/Apex\s+Predators/gi, 'Task Force 141')
    .replace(/Apex_Predator/gi, 'Ghost_Operator')
    .replace(/WraithMain/gi, 'SoapMacTavish')
    .replace(/OctaneRush/gi, 'PriceCaptain')
    .replace(/Apex\s+Legends/gi, 'Call of Duty')
    .replace(/Apex\s+Coins/gi, 'COD Points')
    .replace(/باندل ویژه\s+(?:Apex|Call of Duty)/gi, 'CP کال آو دیوتی')
    .replace(/شامل اسکین (?:اپیک و ۱۰۰۰ کوین|اپراتور و ۱,۱۰۰ سی‌پی)/g, 'شارژ فوری و قانونی سی‌پی روی اکانت اکتیویژن')
    .replace(/ایپکس\s*لجندز|اپکس\s*لجندز/g, 'کال آو دیوتی')
    .replace(/ایپکس\s*کوین|اپکس\s*کوین/g, 'سی‌پی کال آو دیوتی')
    .replace(/ایپکس|اپکس/g, 'کال آو دیوتی')
    .replace(/\bApex\b/g, 'Call of Duty');
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
  title: 'کال آو دیوتی',
  titleEn: 'Call of Duty',
  iconImage: '/images/categories/callof-v2.webp',
  accentColor: '#f59e0b',
  accentGradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
  description:
    'خرید قانونی و فوری سی‌پی کال آو دیوتی (CP) و بتل‌پس برای Call of Duty Mobile و Warzone با تحویل آنی.',
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
    'خرید قانونی و فوری جم کلش آف کلنز (Gems) و گلدپس (Gold Pass) با بهترین قیمت و تحویل آنی در تایتان.',
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
  subtitle: 'شارژ فوری و قانونی اکانت Supercell ID',
  image: '/images/products/goblin_transparent.webp',
  imageAlt: 'خرید جم کلش آف کلنز (Clash of Clans Gems) با تحویل آنی',
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
  metaTitle: 'خرید جم کلش آف کلنز (Clash of Clans Gems) | شارژ فوری و ارزان',
  metaDescription:
    'خرید قانونی و ارزان جم کلش آف کلنز (Clash of Clans Gems) در بسته‌های ۸۰ تا ۲۵۰۰ تایی با شارژ فوری روی اکانت Supercell ID، بدون خطر بن و پشتیبانی ۲۴ ساعته.',
  platforms: [{ slug: 'mobile', name: 'Mobile', icon: null }],
  description:
    'جم کلش آف کلنز (Clash of Clans Gems) اصلی‌ترین ارز درون‌برنامه‌ای بازی استراتژیک سوپرسل است که برای استخدام کارگران بیشتر (Builder\'s Hut)، خرید تجهیزات اپیک هیروها (Hero Equipment)، اسکین‌های قهرمانان، کتاب‌های جادویی تاجر (Trader) و تکمیل سریع ارتقای ساختمان‌ها و نیروها استفاده می‌شود. تمامی بسته‌های جم در فروشگاه تایتان به صورت کاملاً قانونی و از طریق درگاه رسمی Supercell روی اکانت شما شارژ می‌شوند.',
  deliveryInfo: 'تحویل آنی — شارژ مستقیم اکانت',
  requiresGameAccount: true,
  stock: null,
  features: [
    { title: 'تحویل آنی', description: 'در کمتر از ۱۵ دقیقه', icon: 'flame' },
    { title: '۱۰۰٪ قانونی', description: 'بدون خطر بن اکانت', icon: 'shield' },
    { title: 'پشتیبانی ۲۴/۷', description: 'پاسخگویی سریع در چت', icon: 'chat' },
  ],
  tags: ['تحویل آنی', '۱۰۰٪ قانونی و اورجینال', 'پشتیبانی ۲۴ ساعته'],
  specs: { region: 'Global', delivery: 'زیر ۱۵ دقیقه', activation: 'شارژ مستقیم اکانت' },
  variants: [
    { id: 99021, label: '۸۰ جم', price: 95000, originalPrice: 110000, discountPercent: 14, inStock: true },
    { id: 99022, label: '۵۰۰ جم', price: 390000, originalPrice: 440000, discountPercent: 11, inStock: true },
    { id: 99023, label: '۱,۲۰۰ جم', price: 790000, originalPrice: 890000, discountPercent: 11, inStock: true },
    { id: 99024, label: '۲,۵۰۰ جم', price: 1850000, originalPrice: 2050000, discountPercent: 10, inStock: true },
  ],
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
        const premIdx = deduped.findIndex(g => g.slug === 'premium');
        if (premIdx >= 0) deduped.splice(premIdx, 0, { ...DEFAULT_COD_GAME });
        else deduped.push({ ...DEFAULT_COD_GAME });
      }
      if (!seen.has('clash-of-clans')) {
        const premIdx = deduped.findIndex(g => g.slug === 'premium');
        if (premIdx >= 0) deduped.splice(premIdx, 0, { ...DEFAULT_CLASH_GAME });
        else deduped.push({ ...DEFAULT_CLASH_GAME });
      }
      return deduped as unknown as T;
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
        title: 'کال آو دیوتی',
        titleEn: 'Call of Duty',
        iconImage: '/images/categories/callof-v2.webp',
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
        title: 'CP کال آو دیوتی',
        subtitle: 'شارژ فوری و قانونی سی‌پی روی اکانت اکتیویژن',
        price: 95000,
        image: '/images/products/Molten-Gold-Lightning-King.webp',
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
        title: 'سی‌پی کال آو دیوتی (COD Points)',
        description: 'خرید قانونی و فوری سی‌پی کال آو دیوتی (CP) برای خرید بتل‌پس، اسکین اپراتور و گردونه.',
        image: '/images/products/Molten-Gold-Lightning-King.webp',
        game: gameObj
          ? {
              ...gameObj,
              slug: 'call-of-duty',
              title: 'کال آو دیوتی',
              titleEn: 'Call of Duty',
              iconImage: '/images/categories/callof-v2.webp',
              accentColor: '#f59e0b',
            }
          : obj.game,
      } as unknown as T;
    }

    if (obj.slug === 'cod-points' && 'price' in obj && (!obj.image || String(obj.image).includes('callof-character'))) {
      obj.image = 'https://35tmectztpibboo6.public.blob.vercel-storage.com/products/Molten-Gold-Lightning-King.webp';
    }
    if (obj.slug === 'clash-of-clans-gems' && 'price' in obj && (!obj.image || String(obj.image).includes('clash-character'))) {
      obj.image = 'https://35tmectztpibboo6.public.blob.vercel-storage.com/products/goblin_transparent.webp';
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
