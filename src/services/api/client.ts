import { API_BASE_URL, TOKEN_KEYS } from './config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

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

    // Add auth token if available
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // console.log(`[API] ${options.method || 'GET'} ${url}`);
    // console.log('[API Headers]', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      /*
      console.log(`[API Response] Status: ${response.status}`);
      console.log('[API Response Headers]', {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      });
      */

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // console.log('[API Response Data]', data);

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

        const errorMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? (data as Record<string, unknown>).message
            : 'API request failed';

        console.error('[API Error]', errorMessage);
        throw new Error(String(errorMessage) || `HTTP ${response.status}`);
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

  static async patch<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
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
