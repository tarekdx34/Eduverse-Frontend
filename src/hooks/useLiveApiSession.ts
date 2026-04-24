import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TOKEN_KEYS } from '../services/api/config';
import { useAuth } from '../context/AuthContext';

/**
 * True when the app should call the real backend and must not substitute mock data.
 * False for dev mock token, explicit navigation mock, or missing access token.
 * Re-evaluates after login because it depends on `user` from auth context.
 */
export function useLiveApiSession(): boolean {
  const location = useLocation();
  const { user } = useAuth();

  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    if ((location.state as { isMock?: boolean } | null)?.isMock) return false;
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (!token || token === 'mock-dev-token') return false;
    return true;
  }, [location.state, user?.userId]);
}
