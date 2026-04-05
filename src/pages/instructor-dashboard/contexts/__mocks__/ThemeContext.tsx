import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    isDark: false,
    toggleTheme: () => {},
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { isDark: false, toggleTheme: () => {} };
  }
  return context;
};
