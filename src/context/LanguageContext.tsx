import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as Language;

  // Fallback t function for backward compatibility
  const t = (en: string, ar: string): string => {
    return currentLanguage === 'en' ? en : ar;
  };

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  // Ensure RTL/LTR is set correctly
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = currentLanguage;
    htmlElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

    // Also update body dir for compatibility
    document.body.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

    // Store preference
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, setLanguage, t }}>
      <div dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
