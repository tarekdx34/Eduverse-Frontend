import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    search: 'Search...',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    viewProfile: 'View Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    courses: 'Courses',
    labs: 'Labs',
    grading: 'Grading',
    students: 'Students',
    attendance: 'Attendance',
    schedule: 'Schedule',
    announcements: 'Announcements',
    discussion: 'Discussion',
    communication: 'Communication',
    chat: 'Chat',
  },
  ar: {
    search: 'بحث...',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    viewProfile: 'عرض الملف الشخصي',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    courses: 'المقررات',
    labs: 'المعامل',
    grading: 'التصحيح',
    students: 'الطلاب',
    attendance: 'الحضور',
    schedule: 'الجدول',
    announcements: 'الإعلانات',
    discussion: 'المناقشات',
    communication: 'التواصل',
    chat: 'الدردشة',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-ta-language');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('eduverse-ta-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
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

export default LanguageContext;
