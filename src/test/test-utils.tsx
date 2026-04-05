import React, { ReactElement, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock Theme Context (matches instructor dashboard structure)
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    isDark: false,
    toggleTheme: () => {},
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Mock Language Context
const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  t: (key: string) => key,
});

const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    language: 'en',
    changeLanguage: () => {},
    t: (key: string) => key,
  };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Don't cache in tests
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MockThemeProvider>
          <MockLanguageProvider>{children}</MockLanguageProvider>
        </MockThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
