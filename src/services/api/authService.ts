import { TOKEN_KEYS } from './config';
import { ApiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  profilePictureUrl: string | null;
  campusId: number | null;
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
    const payload: { email: string; password: string; rememberMe?: boolean } = {
      email: credentials.email,
      password: credentials.password,
    };

    if (credentials.rememberMe === true) {
      payload.rememberMe = true;
    }

    const response = await ApiClient.post<LoginResponse>('/auth/login', payload);
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(response.user));
    return response;
  }

  static async serverLogout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await ApiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore server errors on logout — always clear local state
    } finally {
      this.clearLocalAuth();
    }
  }

  static async refreshAccessToken(): Promise<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await ApiClient.post<LoginResponse>('/auth/refresh-token', { refreshToken });
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(response.user));
    return response;
  }

  static async getMe(): Promise<User> {
    return ApiClient.get<User>('/auth/me');
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

  static setStoredUser(user: User): void {
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    // Set a dummy token so isAuthenticated() returns true
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, 'mock-dev-token');
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, 'mock-dev-token');
  }

  /** Clear only local storage (use serverLogout() for full logout including server-side session) */
  static clearLocalAuth(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
  }

  /** @deprecated Use serverLogout() or clearLocalAuth() instead */
  static logout(): void {
    this.clearLocalAuth();
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  }

  static getDashboardPath(user: User): string {
    const rawRole = user.roles?.[0];
    // Defensive: handle both string roles and object roles { roleName: '...' }
    const role =
      rawRole && typeof rawRole === 'object' && 'roleName' in (rawRole as object)
        ? (rawRole as unknown as { roleName: string }).roleName
        : (rawRole as string);

    switch (role) {
      case 'instructor':
        return '/instructordashboard';
      case 'admin':
        return '/admindashboard';
      case 'it_admin':
        return '/itadmindashboard';
      case 'teaching_assistant':
        return '/tadashboard';
      case 'department_head':
        return '/admindashboard';
      default:
        return '/studentdashboard';
    }
  }
}
