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
    notifications: 'Notifications',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    viewProfile: 'View Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    itAdminDashboard: 'IT Admin Dashboard',
    systemConfig: 'System Configuration',
    integrations: 'Integrations & APIs',
    database: 'Database Management',
    monitoring: 'Monitoring & Performance',
    security: 'Security Management',
    aiManagement: 'AI Management',
    multiCampus: 'Multi-Campus',
    serverHealth: 'Server Health',
    apiStatus: 'API Status',
    uptime: 'Uptime',
    responseTime: 'Response Time',
    errorRate: 'Error Rate',
    activeConnections: 'Active Connections',
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    diskSpace: 'Disk Space',
    networkTraffic: 'Network Traffic',
    backupStatus: 'Backup Status',
    lastBackup: 'Last Backup',
    nextBackup: 'Next Backup',
    runBackup: 'Run Backup Now',
    restoreBackup: 'Restore Backup',
    sslCertificates: 'SSL Certificates',
    accessLogs: 'Access Logs',
    securityEvents: 'Security Events',
    firewallRules: 'Firewall Rules',
    rateLimiting: 'Rate Limiting',
    sessionManagement: 'Session Management',
    aiModels: 'AI Models',
    aiUsage: 'AI Usage Statistics',
    aiCosts: 'AI Costs',
    campusSettings: 'Campus Settings',
    domainSettings: 'Domain Settings',
    brandingSettings: 'Branding Settings',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    actions: 'Actions',
    status: 'Status',
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled',
    configure: 'Configure',
    viewDetails: 'View Details',
    refresh: 'Refresh',
    export: 'Export',
  },
  ar: {
    search: 'بحث...',
    notifications: 'الإشعارات',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    viewProfile: 'عرض الملف الشخصي',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    itAdminDashboard: 'لوحة تحكم مدير تقنية المعلومات',
    systemConfig: 'إعدادات النظام',
    integrations: 'التكاملات و APIs',
    database: 'إدارة قواعد البيانات',
    monitoring: 'المراقبة والأداء',
    security: 'إدارة الأمان',
    aiManagement: 'إدارة الذكاء الاصطناعي',
    multiCampus: 'متعدد الحرم الجامعي',
    serverHealth: 'صحة الخادم',
    apiStatus: 'حالة API',
    uptime: 'وقت التشغيل',
    responseTime: 'وقت الاستجابة',
    errorRate: 'معدل الأخطاء',
    activeConnections: 'الاتصالات النشطة',
    cpuUsage: 'استخدام المعالج',
    memoryUsage: 'استخدام الذاكرة',
    diskSpace: 'مساحة القرص',
    networkTraffic: 'حركة الشبكة',
    backupStatus: 'حالة النسخ الاحتياطي',
    lastBackup: 'آخر نسخة احتياطية',
    nextBackup: 'النسخة الاحتياطية التالية',
    runBackup: 'تشغيل نسخة احتياطية الآن',
    restoreBackup: 'استعادة نسخة احتياطية',
    sslCertificates: 'شهادات SSL',
    accessLogs: 'سجلات الوصول',
    securityEvents: 'الأحداث الأمنية',
    firewallRules: 'قواعد جدار الحماية',
    rateLimiting: 'تحديد المعدل',
    sessionManagement: 'إدارة الجلسات',
    aiModels: 'نماذج الذكاء الاصطناعي',
    aiUsage: 'إحصائيات استخدام الذكاء الاصطناعي',
    aiCosts: 'تكاليف الذكاء الاصطناعي',
    campusSettings: 'إعدادات الحرم الجامعي',
    domainSettings: 'إعدادات النطاق',
    brandingSettings: 'إعدادات العلامة التجارية',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    close: 'إغلاق',
    confirm: 'تأكيد',
    actions: 'الإجراءات',
    status: 'الحالة',
    healthy: 'سليم',
    warning: 'تحذير',
    critical: 'حرج',
    active: 'نشط',
    inactive: 'غير نشط',
    enabled: 'مفعل',
    disabled: 'معطل',
    configure: 'تكوين',
    viewDetails: 'عرض التفاصيل',
    refresh: 'تحديث',
    export: 'تصدير',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduverse-it-admin-language');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eduverse-it-admin-language', lang);
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
