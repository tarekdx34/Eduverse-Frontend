import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Generic hook for fetching data from the API.
 * @param fetcher - Async function that returns data
 * @param deps - Dependency array (re-fetches when deps change)
 * @param immediate - Whether to fetch immediately (default: true)
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  immediate = true
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetch = useCallback(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'An error occurred';
          setState((prev) => ({ ...prev, loading: false, error: message }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!immediate) return;
    return fetch();
  }, [fetch, immediate]);

  return { ...state, refetch: fetch };
}

/**
 * Hook for API mutations (POST, PUT, PATCH, DELETE).
 * Does not auto-fetch — call `mutate(data)` explicitly.
 */
export function useMutation<TInput, TOutput = unknown>(
  mutator: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(input);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, data, loading, error };
}
