import axios from 'axios';
import { API_BASE_URL, TOKEN_KEYS } from './config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// Axios client used by newer API services.
export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static rawBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');

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
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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
              'Cannot reach the Nest API (or it returned a server error). Start EduVerse-Backend with npm run start:dev in that project; Vite proxies /api to http://localhost:8081.';
          }
        }

        console.error('[API Error]', errorMessage);
        throw new Error(errorMessage || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error('[API Fetch Error]', errorMessage);

      if (errorMessage.includes('Failed to fetch')) {
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
