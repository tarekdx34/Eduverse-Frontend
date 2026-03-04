import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options?: { immediate?: boolean }
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(options?.immediate !== false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (options?.immediate === false) return;
    execute();
  }, [execute, options?.immediate]);

  return { data, loading, error, refetch: execute };
}

export function useMutation<TData, TVariables>(
  mutator: (variables: TVariables) => Promise<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutator(variables);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, loading, error, data };
}
