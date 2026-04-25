'use client';

import { useEffect, useState, type DependencyList } from 'react';

import api from '@/lib/api';

export type UseFetchOptions = {
  deps?: DependencyList;
  skip?: boolean;
};

export type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useFetch<T>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> {
  const { deps, skip = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url);
      setData(response.data?.data ?? response.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      if (skip) return;
      fetchData();
    },
    deps !== undefined ? [...deps, skip] : [url, skip],
  );

  return { data, loading, error, refetch: fetchData };
}
