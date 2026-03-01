import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  primaryColor: string;
  primaryHex: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const normalizePrimaryColor = (color: string | null | undefined) =>
  color === 'violet' ? 'blue' : color || 'blue';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-instructor-theme');
      return (saved as Theme) || 'light';
    }
    return 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizePrimaryColor(localStorage.getItem('eduverse-primary-color'));
    }
    return 'blue';
  });

  const setPrimaryColor = (color: string) => {
    const nextColor = normalizePrimaryColor(color);
    setPrimaryColorState(nextColor);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduverse-primary-color', nextColor);
      // Dispatch a custom event to sync across components easily if they don't subscribe to this specific ThemeContext instance
      window.dispatchEvent(new CustomEvent('eduverse-color-change', { detail: nextColor }));
    }
  };

  useEffect(() => {
    localStorage.setItem('eduverse-instructor-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync color from other dashboards via custom event
  useEffect(() => {
    const handleColorChange = (e: any) => {
      setPrimaryColorState(normalizePrimaryColor(e.detail));
    };
    window.addEventListener('eduverse-color-change', handleColorChange);
    return () => window.removeEventListener('eduverse-color-change', handleColorChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  const hexMap: Record<string, string> = {
    blue: '#3b82f6',
    emerald: '#10b981',
    violet: '#3b82f6',
    rose: '#f43f5e',
    amber: '#f59e0b',
  };
  const primaryHex = hexMap[primaryColor] || '#3b82f6';

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark, primaryColor, primaryHex, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
