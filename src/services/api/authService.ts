import { TOKEN_KEYS } from './config';
import { ApiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  profilePictureUrl: string | null;
  campusId: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string;
  roles: string[];
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const data = await ApiClient.post<LoginResponse>('/auth/login', credentials);

      // Store tokens and user data
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refreshToken);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(data.user));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
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

  static logout(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  }
}
