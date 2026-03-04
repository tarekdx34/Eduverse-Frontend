import { API_BASE_URL, TOKEN_KEYS } from './config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static isRefreshing = false;
  private static refreshQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  }> = [];

  private static async tryRefreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    const newToken = data.accessToken;
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, newToken);
    return newToken;
  }

  private static handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    return this.tryRefreshToken()
      .then((token) => {
        this.refreshQueue.forEach((cb) => cb.resolve(token));
        return token;
      })
      .catch((err) => {
        this.refreshQueue.forEach((cb) => cb.reject(err));
        // Clear auth and redirect to login
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.USER);
        window.location.href = '/login';
        throw err;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshQueue = [];
      });
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      ...options.headers,
    };

    // Set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 — attempt token refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
        try {
          const newToken = await this.handleTokenRefresh();
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          const contentType = retryResponse.headers.get('content-type');
          const retryData = contentType?.includes('application/json')
            ? await retryResponse.json()
            : await retryResponse.text();
          if (!retryResponse.ok) {
            throw new Error(
              typeof retryData === 'object' && retryData?.message
                ? retryData.message
                : `HTTP ${retryResponse.status}`
            );
          }
          return retryData as T;
        } catch {
          throw new Error('Session expired. Please log in again.');
        }
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? (data as Record<string, unknown>).message
            : 'API request failed';

        throw new Error(String(errorMessage) || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';

      if (errorMessage.includes('Failed to fetch')) {
        console.error(
          '⚠️ CORS or Network Error — check that backend is running on http://localhost:8081'
        );
      }

      throw new Error(errorMessage);
    }
  }

  static async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = endpoint;
    if (params) {
      const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (query) url += `?${query}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = data instanceof FormData;
    const options: RequestOptions = {
      method: 'POST',
      body: isFormData ? (data as BodyInit) : data ? JSON.stringify(data) : undefined,
    };
    if (isFormData) {
      options.headers = {}; // let browser set Content-Type with boundary
    }
    return this.request<T>(endpoint, options);
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
