import { TOKEN_KEYS } from './config';
import { ApiClient } from './client';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '../../types/api';

export { type LoginRequest, type LoginResponse, type User };

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>('/auth/login', credentials);

    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(response.user));

    return response;
  }

  static async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>('/auth/register', data);

    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(response.user));

    return response;
  }

  static async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await ApiClient.post<{ accessToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );

    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
    return response;
  }

  static async getCurrentUser(): Promise<User> {
    return ApiClient.get<User>('/auth/me');
  }

  static async forgotPassword(email: string): Promise<void> {
    await ApiClient.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/reset-password', { token, newPassword });
  }

  static logout(): void {
    try {
      ApiClient.post('/auth/logout', {}).catch(() => {});
    } catch {
      // Logout even if the API call fails
    }
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
  }

  static getStoredUser(): User | null {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  }

  static getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.roles?.[0] || null;
  }
}
