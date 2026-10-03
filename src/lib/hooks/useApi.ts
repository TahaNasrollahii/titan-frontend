'use client';

import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/client';

export interface ApiState<T> {
  data: T | undefined;
  error: ApiError | null;
  loading: boolean;
  reload: () => Promise<void>;
  setData: (updater: T | undefined | ((current: T | undefined) => T | undefined)) => void;
}

/**
 * Load data on mount and whenever ``deps`` change. Pass ``null`` as the fetcher to skip loading
 * (e.g. while the user is not logged in). Stale responses from superseded requests are ignored.
 */
export function useApi<T>(fetcher: (() => Promise<T>) | null, deps: DependencyList = []): ApiState<T> {
  const [data, setDataState] = useState<T>();
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(fetcher !== null);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);

  // Keep the latest fetcher without re-running the load effect on every render.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async () => {
    const current = fetcherRef.current;
    if (!current) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await current();
      if (id === requestId.current) {
        setDataState(result);
        setError(null);
      }
    } catch (err) {
      if (id === requestId.current) setError(err instanceof ApiError ? err : new ApiError(0, 'error', String(err)));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers control reloading through ``deps``
  }, [fetcher === null, ...deps]);

  const setData = useCallback((updater: T | undefined | ((current: T | undefined) => T | undefined)) => {
    setDataState(current =>
      typeof updater === 'function' ? (updater as (value: T | undefined) => T | undefined)(current) : updater,
    );
  }, []);

  return { data, error, loading, reload: load, setData };
}
