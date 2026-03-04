import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/api/authService';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(AuthService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
          // Token expired or invalid — keep stored user for now
          // The token refresh interceptor will handle 401s
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await AuthService.login(credentials);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await AuthService.register(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()) ?? false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
