import React, { createContext, useContext } from 'react';

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    language: 'en',
    changeLanguage: () => {},
    t: (key: string) => key,
  };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return { language: 'en', changeLanguage: () => {}, t: (key: string) => key };
  }
  return context;
};
