import type { AuthTokens } from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

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
    const first = Object.values(this.errors)[0];
    return (Array.isArray(first) ? first[0] : undefined) ?? this.detail;
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
  return (await response.json()) as T;
}
