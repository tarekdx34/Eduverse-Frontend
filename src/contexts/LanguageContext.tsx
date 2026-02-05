import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.viewAll': 'View All',
    'common.refresh': 'Refresh',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.myClass': 'My Class',
    'nav.schedule': 'Schedule',
    'nav.assignments': 'Assignments',
    'nav.grades': 'Grades',
    'nav.attendance': 'Attendance',
    'nav.analytics': 'Analytics',
    'nav.ai': 'AI Features',
    'nav.chat': 'Chat',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.upcomingDeadlines': 'Upcoming Deadlines',
    'dashboard.studyStreak': 'Study Streak',
    
    // Stats
    'stats.credits': 'Credits Completed',
    'stats.gpa': 'GPA',
    'stats.courses': 'Active Courses',
    'stats.assignments': 'Pending Assignments',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.daysAgo': 'days ago',
    'time.hoursAgo': 'hours ago',
    'time.minutesAgo': 'minutes ago',
    'time.justNow': 'Just now',
  },
  ar: {
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.loading': 'جاري التحميل...',
    'common.noData': 'لا توجد بيانات',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.viewAll': 'عرض الكل',
    'common.refresh': 'تحديث',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.courses': 'المقررات',
    'nav.myClass': 'فصولي',
    'nav.schedule': 'الجدول',
    'nav.assignments': 'الواجبات',
    'nav.grades': 'الدرجات',
    'nav.attendance': 'الحضور',
    'nav.analytics': 'التحليلات',
    'nav.ai': 'الذكاء الاصطناعي',
    'nav.chat': 'المحادثات',
    'nav.notifications': 'الإشعارات',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    'nav.profile': 'الملف الشخصي',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بعودتك',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.upcomingDeadlines': 'المواعيد القادمة',
    'dashboard.studyStreak': 'سلسلة الدراسة',
    
    // Stats
    'stats.credits': 'الساعات المكتملة',
    'stats.gpa': 'المعدل التراكمي',
    'stats.courses': 'المقررات النشطة',
    'stats.assignments': 'الواجبات المعلقة',
    
    // Time
    'time.today': 'اليوم',
    'time.yesterday': 'أمس',
    'time.daysAgo': 'أيام مضت',
    'time.hoursAgo': 'ساعات مضت',
    'time.minutesAgo': 'دقائق مضت',
    'time.justNow': 'الآن',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-language') as Language;
      return saved || 'en';
    }
    return 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eduverse-language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, isRTL, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
