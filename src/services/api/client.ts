import axios from 'axios';
import { API_BASE_URL, TOKEN_KEYS } from './config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

const CONFIGURED_API_TARGET = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(
  /\/api\/?$/,
  ''
);

// Axios client used by newer API services.
export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  const isMock = accessToken === 'mock-dev-token';

  if (isMock) {
    // Override the adapter for this request to return mock data immediately
    config.adapter = (cfg) => {
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: cfg,
      });
    };
  }

  // Do not set Authorization header for auth endpoints
  const authlessEndpoints = ['/auth/login', '/auth/refresh-token', '/auth/logout'];
  if (
    accessToken &&
    accessToken !== 'mock-dev-token' &&
    !authlessEndpoints.some((p) => (config.url || '').includes(p))
  ) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const isMock = accessToken === 'mock-dev-token';

    if (error?.response?.status === 401) {
      if (isMock) {
        // In mock mode, we just return empty data to facilitate empty-state design
        return Promise.resolve({ data: [] });
      }
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (isMock) {
      // For any other error in mock mode (500, 404, etc), be silent and return empty
      return Promise.resolve({ data: [] });
    }

    return Promise.reject(error);
  }
);

export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static rawBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');

  private static isExpectedNotFound(
    endpoint: string,
    status: number,
    errorMessage: string
  ): boolean {
    if (status !== 404) {
      return false;
    }

    const isSubmissionLookup = /\/submissions\/my$/i.test(endpoint);
    const isNotFoundMessage = /submission not found|not found/i.test(errorMessage);
    return isSubmissionLookup && isNotFoundMessage;
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);
    const isRawPath = endpoint.startsWith('~/');
    let url = isAbsoluteUrl
      ? endpoint
      : isRawPath
        ? `${this.rawBaseURL}${endpoint.slice(1)}`
        : `${this.baseURL}${endpoint}`;

    if (options.params) {
      const query = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const qs = query.toString();
      if (qs) {
        url += `${url.includes('?') ? '&' : '?'}${qs}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (accessToken === 'mock-dev-token') {
      // Return a minimal valid response to prevent common crashes
      // Most of our lists are arrays, but specific endpoints need object shapes
      if (endpoint.includes('/schedule/my/daily')) {
        return Promise.resolve({
          date: new Date().toISOString().split('T')[0],
          dayOfWeek: 'TODAY',
          schedules: [],
          events: [],
          exams: [],
          campusEvents: [],
        } as unknown as T);
      }
      if (endpoint.includes('/schedule/my/weekly')) {
        return Promise.resolve({
          weekStart: '',
          weekEnd: '',
          days: [],
        } as unknown as T);
      }

      // Generic fallback: array for lists, empty object for others
      // Most GET requests that aren't specific above are likely lists in this project
      return Promise.resolve([] as unknown as T);
    }

    // Do not send Authorization header for auth endpoints (login/refresh/logout)
    const authlessEndpoints = ['/auth/login', '/auth/refresh-token', '/auth/logout'];
    if (accessToken && !authlessEndpoints.some((p) => endpoint.includes(p))) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      // Avoid sending cookies for auth endpoints to prevent large Cookie headers causing 431.
      const fetchCredentials = authlessEndpoints.some((p) => endpoint.includes(p))
        ? 'omit'
        : (options.credentials ?? 'same-origin');

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: fetchCredentials as RequestCredentials,
      });

      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
          const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
          if (token === 'mock-dev-token') {
            // In mock mode, we ignore 401s silently to allow empty state design
            return [] as unknown as T;
          }

          console.warn('[API Auth] Session expired or invalid. Clearing auth and redirecting...');
          localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(TOKEN_KEYS.USER);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        let errorMessage: string;
        if (typeof data === 'object' && data !== null && 'message' in data) {
          errorMessage = String((data as Record<string, unknown>).message);
        } else if (typeof data === 'string' && data.trim()) {
          errorMessage = data.trim().slice(0, 300);
        } else {
          errorMessage = 'API request failed';
        }

        if (response.status >= 500 && response.status < 600) {
          const generic =
            !errorMessage ||
            errorMessage === 'API request failed' ||
            errorMessage.toLowerCase().includes('internal server error');
          if (generic) {
            errorMessage =
              `Cannot reach the Nest API (or it returned a server error). Check backend at ${CONFIGURED_API_TARGET}; Vite proxies /api to that target in development.`;
          }
        }

        const expectedNotFound = this.isExpectedNotFound(endpoint, response.status, errorMessage);
        if (!expectedNotFound) {
          console.error('[API Error]', errorMessage);
        }
        throw new Error(errorMessage || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      const expectedNotFound = this.isExpectedNotFound(endpoint, 404, errorMessage);
      if (!expectedNotFound) {
        console.error('[API Fetch Error]', errorMessage);
      }

      if (!expectedNotFound && errorMessage.includes('Failed to fetch')) {
        console.error(
          '⚠️ CORS or Network Error. Possible causes:\n' +
            '1. Backend server not running on http://localhost:8081\n' +
            '2. Backend CORS not configured for http://localhost:5176\n' +
            '3. Network connectivity issue\n' +
            '\nTips:\n' +
            '- Check if backend is running\n' +
            '- Check browser Network tab for details\n' +
            '- Check backend CORS configuration'
        );
      }

      throw new Error(errorMessage);
    }
  }

  static async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  static async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
