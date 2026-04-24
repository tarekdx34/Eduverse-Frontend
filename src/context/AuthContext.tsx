import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from '../services/api/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  loginMock: (role: string) => void;
  logout: () => Promise<void>;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    const response = await AuthService.login({ email, password, rememberMe });
    setUser(response.user);
    return response.user;
  };

  const loginMock = (role: string) => {
    const mockUser: User = {
      userId: 9999,
      email: `${role}.mock@eduverse.com`,
      firstName: 'Mock',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      fullName: `Mock ${role}`,
      phone: '000-000-0000',
      profilePictureUrl: null,
      campusId: 1,
      status: 'active',
      emailVerified: true,
      lastLoginAt: new Date().toISOString(),
      roles: [role],
      createdAt: new Date().toISOString(),
    };
    AuthService.setStoredUser(mockUser);
    setUser(mockUser);
  };

  const logout = async () => {
    await AuthService.serverLogout();
    setUser(null);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return AuthService.getDashboardPath(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, loginMock, logout, getDashboardPath }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
