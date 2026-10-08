import type { AuthTokens } from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

const TOKENS_KEY = 'titan.tokens';
const AUTH_EVENT = 'titan:auth-changed';

// ------------------------------------------------------------------ token storage
export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens | null): void {
  if (tokens) window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  else window.localStorage.removeItem(TOKENS_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Subscribe to login/logout happening anywhere (including token expiry). Returns an unsubscribe function. */
export function onAuthChange(listener: () => void): () => void {
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

/** Exchange the refresh token for new tokens. Concurrent callers share one request. */
function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const refresh = getTokens()?.refresh;
    if (!refresh) return false;
    try {
      const response = await fetch(buildUrl('auth/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        setTokens(null);
        return false;
      }
      setTokens((await response.json()) as AuthTokens);
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
  const headers: Record<string, string> = { Accept: 'application/json', 'Accept-Language': 'fa' };
  const access = options.auth === false ? undefined : getTokens()?.access;
  if (access) headers.Authorization = `Bearer ${access}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) body = options.body;
  else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  return fetch(buildUrl(path, options.query), { method: options.method ?? 'GET', headers, body });
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
    if (response.status === 401 && options.auth !== false && getTokens()?.refresh) {
      // A dead session must not break public endpoints: once the refresh fails the tokens are
      // cleared, so the retry goes out anonymously.
      await refreshTokens();
      response = await send(path, options);
    }
  } catch {
    throw new ApiError(0, 'network_error', 'ارتباط با سرور برقرار نشد.');
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
