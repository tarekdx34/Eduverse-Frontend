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
  // Mock user data
  private static MOCK_USER: User = {
    userId: 1,
    email: 'tarekstudent@test.com',
    firstName: 'Tarek',
    lastName: 'Student',
    fullName: 'Tarek Student',
    phone: '+20 123 456 7890',
    profilePictureUrl: null,
    campusId: 'CAIRO-01',
    status: 'active',
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
    roles: ['student'],
    createdAt: '2024-01-01T00:00:00Z',
  };

  private static MOCK_TOKENS = {
    accessToken: 'mock_access_token_' + Math.random().toString(36).substr(2, 9),
    refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substr(2, 9),
  };

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Mock login - check for hardcoded credentials
      if (credentials.email === 'tarekstudent@test.com' && credentials.password === '123456') {
        const response: LoginResponse = {
          accessToken: this.MOCK_TOKENS.accessToken,
          refreshToken: this.MOCK_TOKENS.refreshToken,
          user: this.MOCK_USER,
        };

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refreshToken);
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(response.user));

        return response;
      } else {
        throw new Error('Invalid email or password');
      }
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
