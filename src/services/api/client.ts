import { API_BASE_URL, TOKEN_KEYS } from './config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiClient {
  private static baseURL = API_BASE_URL;

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log(`[API] ${options.method || 'GET'} ${url}`);
    console.log('[API Headers]', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API Response] Status: ${response.status}`);
      console.log('[API Response Headers]', {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('[API Response Data]', data);

      if (!response.ok) {
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

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
