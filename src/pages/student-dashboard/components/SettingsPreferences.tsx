import { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Shield,
  Bell,
  Download,
  Smartphone,
  Monitor,
  Key,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronRight,
  Palette,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    deadlines: boolean;
    grades: boolean;
    announcements: boolean;
    messages: boolean;
  };
  privacy: {
    showOnline: boolean;
    showActivity: boolean;
    showProgress: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
  twoFactor: {
    enabled: boolean;
    method: 'sms' | 'authenticator' | 'email';
  };
  offline: {
    autoDownload: boolean;
    downloadOnWifi: boolean;
    storageUsed: number;
    storageLimit: number;
  };
}

interface OfflineItem {
  id: string;
  name: string;
  type: 'course' | 'file' | 'video';
  size: string;
  downloaded: boolean;
  courseCode?: string;
}

const offlineItems: OfflineItem[] = [
  { id: '1', name: 'CS220 - Database Management', type: 'course', size: '245 MB', downloaded: true, courseCode: 'CS220' },
  { id: '2', name: 'Lecture 8 - SQL Joins.pdf', type: 'file', size: '12 MB', downloaded: true, courseCode: 'CS220' },
  { id: '3', name: 'CS201 - Data Structures', type: 'course', size: '180 MB', downloaded: false, courseCode: 'CS201' },
  { id: '4', name: 'Algorithm Tutorial Video', type: 'video', size: '320 MB', downloaded: false, courseCode: 'CS201' },
  { id: '5', name: 'CS150 - Web Development', type: 'course', size: '156 MB', downloaded: true, courseCode: 'CS150' },
];

// Arabic translations
const translations = {
  en: {
    settings: 'Settings & Preferences',
    subtitle: 'Customize your learning experience',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    notifications: 'Notifications',
    emailNotif: 'Email Notifications',
    pushNotif: 'Push Notifications',
    soundNotif: 'Sound Alerts',
    deadlineNotif: 'Deadline Reminders',
    gradeNotif: 'Grade Updates',
    announcementNotif: 'Announcements',
    messageNotif: 'Messages',
    security: 'Security',
    twoFactor: 'Two-Factor Authentication',
    twoFactorDesc: 'Add an extra layer of security to your account',
    enable2FA: 'Enable 2FA',
    disable2FA: 'Disable 2FA',
    privacy: 'Privacy',
    showOnline: 'Show Online Status',
    showActivity: 'Show Activity Status',
    showProgress: 'Share Progress with Classmates',
    accessibility: 'Accessibility',
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    highContrast: 'High Contrast Mode',
    reduceMotion: 'Reduce Motion',
    offline: 'Offline Access',
    autoDownload: 'Auto-download Course Materials',
    wifiOnly: 'Download on Wi-Fi Only',
    storage: 'Storage',
    storageUsed: 'Used',
    clearCache: 'Clear Cache',
    downloadedItems: 'Downloaded Items',
    download: 'Download',
    remove: 'Remove',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
  },
  ar: {
    settings: 'الإعدادات والتفضيلات',
    subtitle: 'خصص تجربة التعلم الخاصة بك',
    appearance: 'المظهر',
    theme: 'السمة',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    notifications: 'الإشعارات',
    emailNotif: 'إشعارات البريد الإلكتروني',
    pushNotif: 'الإشعارات الفورية',
    soundNotif: 'تنبيهات صوتية',
    deadlineNotif: 'تذكيرات المواعيد النهائية',
    gradeNotif: 'تحديثات الدرجات',
    announcementNotif: 'الإعلانات',
    messageNotif: 'الرسائل',
    security: 'الأمان',
    twoFactor: 'المصادقة الثنائية',
    twoFactorDesc: 'أضف طبقة إضافية من الأمان لحسابك',
    enable2FA: 'تفعيل المصادقة الثنائية',
    disable2FA: 'إلغاء المصادقة الثنائية',
    privacy: 'الخصوصية',
    showOnline: 'إظهار حالة الاتصال',
    showActivity: 'إظهار حالة النشاط',
    showProgress: 'مشاركة التقدم مع زملاء الدراسة',
    accessibility: 'إمكانية الوصول',
    fontSize: 'حجم الخط',
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    highContrast: 'وضع التباين العالي',
    reduceMotion: 'تقليل الحركة',
    offline: 'الوصول دون اتصال',
    autoDownload: 'تنزيل مواد الدورة تلقائياً',
    wifiOnly: 'التنزيل عبر Wi-Fi فقط',
    storage: 'التخزين',
    storageUsed: 'مستخدم',
    clearCache: 'مسح ذاكرة التخزين المؤقت',
    downloadedItems: 'العناصر المحملة',
    download: 'تنزيل',
    remove: 'إزالة',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
  }
};

export function SettingsPreferences() {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sound: false,
      deadlines: true,
      grades: true,
      announcements: true,
      messages: true,
    },
    privacy: {
      showOnline: true,
      showActivity: true,
      showProgress: false,
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
    },
    twoFactor: {
      enabled: false,
      method: 'authenticator',
    },
    offline: {
      autoDownload: true,
      downloadOnWifi: true,
      storageUsed: 593,
      storageLimit: 2048,
    },
  });

  const [activeSection, setActiveSection] = useState<string>('appearance');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [downloadedItems, setDownloadedItems] = useState(offlineItems);

  const t = translations[settings.language];
  const isRTL = settings.language === 'ar';

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const toggleDownload = (itemId: string) => {
    setDownloadedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, downloaded: !item.downloaded } : item
      )
    );
  };

  const sections = [
    { id: 'appearance', icon: Palette, label: t.appearance },
    { id: 'notifications', icon: Bell, label: t.notifications },
    { id: 'security', icon: Shield, label: t.security },
    { id: 'privacy', icon: Eye, label: t.privacy },
    { id: 'accessibility', icon: Monitor, label: t.accessibility },
    { id: 'offline', icon: Download, label: t.offline },
  ];

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Preferences</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t.settings}</h1>
        <p className="text-slate-300 text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl border overflow-hidden sticky top-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                      : isDark 
                        ? 'hover:bg-gray-700 text-gray-300 border-2 border-transparent' 
                        : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} ${activeSection === section.id ? 'text-indigo-500' : isDark ? 'text-gray-500' : 'text-gray-400'} ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Palette className="w-5 h-5 text-indigo-500" />
                  {t.appearance}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.theme}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', icon: Sun, label: t.light },
                      { id: 'dark', icon: Moon, label: t.dark },
                      { id: 'system', icon: Monitor, label: t.system },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          updateSettings('theme', theme.id);
                          if (theme.id === 'dark' && !isDark) toggleTheme();
                          if (theme.id === 'light' && isDark) toggleTheme();
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          settings.theme === theme.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : isDark 
                              ? 'border-gray-600 hover:border-gray-500' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          settings.theme === theme.id ? 'bg-indigo-100' : isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <theme.icon className={`w-6 h-6 ${
                            settings.theme === theme.id ? 'text-indigo-600' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          settings.theme === theme.id ? 'text-indigo-700' : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {theme.label}
                        </span>
                        {settings.theme === theme.id && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.language}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateSettings('language', 'en')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.language === 'en'
                          ? 'border-indigo-500 bg-indigo-50'
                          : isDark 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${settings.language === 'en' ? 'text-indigo-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${settings.language === 'en' ? 'text-indigo-700' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t.english}
                      </span>
                      {settings.language === 'en' && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                    <button
                      onClick={() => updateSettings('language', 'ar')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.language === 'ar'
                          ? 'border-indigo-500 bg-indigo-50'
                          : isDark 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${settings.language === 'ar' ? 'text-indigo-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${settings.language === 'ar' ? 'text-indigo-700' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t.arabic}
                      </span>
                      {settings.language === 'ar' && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Bell className="w-5 h-5 text-indigo-500" />
                  {t.notifications}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'email', label: t.emailNotif, icon: Bell },
                  { key: 'push', label: t.pushNotif, icon: Smartphone },
                  { key: 'sound', label: t.soundNotif, icon: settings.notifications.sound ? Volume2 : VolumeX },
                  { key: 'deadlines', label: t.deadlineNotif, icon: AlertTriangle },
                  { key: 'grades', label: t.gradeNotif, icon: CheckCircle },
                  { key: 'announcements', label: t.announcementNotif, icon: Info },
                  { key: 'messages', label: t.messageNotif, icon: Bell },
                ].map((item) => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                    </div>
                    <button
                      onClick={() => updateSettings(`notifications.${item.key}`, !settings.notifications[item.key as keyof typeof settings.notifications])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          settings.notifications[item.key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section (2FA) */}
          {activeSection === 'security' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Shield className="w-5 h-5 text-indigo-500" />
                  {t.security}
                </h3>
              </div>
              <div className="p-6">
                {/* Two-Factor Authentication */}
                <div className={`p-6 rounded-xl border-2 ${settings.twoFactor.enabled ? 'border-green-200 bg-green-50' : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        settings.twoFactor.enabled ? 'bg-green-100' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <Shield className={`w-6 h-6 ${settings.twoFactor.enabled ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark && !settings.twoFactor.enabled ? 'text-white' : 'text-gray-900'}`}>{t.twoFactor}</h4>
                        <p className={`text-sm mt-1 ${isDark && !settings.twoFactor.enabled ? 'text-gray-400' : 'text-gray-600'}`}>{t.twoFactorDesc}</p>
                        {settings.twoFactor.enabled && (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-700">Enabled via {settings.twoFactor.method}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShow2FAModal(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        settings.twoFactor.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {settings.twoFactor.enabled ? t.disable2FA : t.enable2FA}
                    </button>
                  </div>

                  {/* 2FA Methods */}
                  {!settings.twoFactor.enabled && (
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        { id: 'authenticator', label: 'Authenticator App', icon: Smartphone },
                        { id: 'sms', label: 'SMS Code', icon: Bell },
                        { id: 'email', label: 'Email Code', icon: Bell },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => updateSettings('twoFactor.method', method.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            settings.twoFactor.method === method.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : isDark 
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-800' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <method.icon className={`w-6 h-6 ${
                            settings.twoFactor.method === method.id ? 'text-indigo-600' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs font-medium text-center ${
                            settings.twoFactor.method === method.id ? 'text-indigo-700' : isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Eye className="w-5 h-5 text-indigo-500" />
                  {t.privacy}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'showOnline', label: t.showOnline },
                  { key: 'showActivity', label: t.showActivity },
                  { key: 'showProgress', label: t.showProgress },
                ].map((item) => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                    <button
                      onClick={() => updateSettings(`privacy.${item.key}`, !settings.privacy[item.key as keyof typeof settings.privacy])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.privacy[item.key as keyof typeof settings.privacy] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          settings.privacy[item.key as keyof typeof settings.privacy] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility Section */}
          {activeSection === 'accessibility' && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Monitor className="w-5 h-5 text-indigo-500" />
                  {t.accessibility}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Font Size */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.fontSize}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'small', label: t.small, size: 'text-sm' },
                      { id: 'medium', label: t.medium, size: 'text-base' },
                      { id: 'large', label: t.large, size: 'text-lg' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => updateSettings('accessibility.fontSize', option.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          settings.accessibility.fontSize === option.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : isDark 
                              ? 'border-gray-600 hover:border-gray-500' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`${option.size} font-medium ${
                          settings.accessibility.fontSize === option.id ? 'text-indigo-700' : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                {[
                  { key: 'highContrast', label: t.highContrast },
                  { key: 'reduceMotion', label: t.reduceMotion },
                ].map((item) => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                    <button
                      onClick={() => updateSettings(`accessibility.${item.key}`, !settings.accessibility[item.key as keyof typeof settings.accessibility])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.accessibility[item.key as keyof typeof settings.accessibility] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          settings.accessibility[item.key as keyof typeof settings.accessibility] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Access Section */}
          {activeSection === 'offline' && (
            <div className="space-y-6">
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                  <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Download className="w-5 h-5 text-indigo-500" />
                    {t.offline}
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Storage Usage */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.storage}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {settings.offline.storageUsed} MB / {settings.offline.storageLimit} MB
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-indigo-500 h-3 rounded-full transition-all"
                        style={{ width: `${(settings.offline.storageUsed / settings.offline.storageLimit) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {t.storageUsed}: {settings.offline.storageUsed} MB
                      </span>
                      <button className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        {t.clearCache}
                      </button>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  {[
                    { key: 'autoDownload', label: t.autoDownload, icon: Download },
                    { key: 'downloadOnWifi', label: t.wifiOnly, icon: settings.offline.downloadOnWifi ? Wifi : WifiOff },
                  ].map((item) => (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                      <button
                        onClick={() => updateSettings(`offline.${item.key}`, !settings.offline[item.key as keyof typeof settings.offline])}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.offline[item.key as keyof typeof settings.offline] ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            settings.offline[item.key as keyof typeof settings.offline] ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloaded Items */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.downloadedItems}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {downloadedItems.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      isDark 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.downloaded ? 'bg-green-100' : isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {item.type === 'course' ? (
                            <HardDrive className={`w-5 h-5 ${item.downloaded ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : item.type === 'video' ? (
                            <Monitor className={`w-5 h-5 ${item.downloaded ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <Download className={`w-5 h-5 ${item.downloaded ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.size} • {item.courseCode}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDownload(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          item.downloaded
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {item.downloaded ? t.remove : t.download}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button className={`px-6 py-3 border-2 rounded-xl font-medium transition-all ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
              {t.cancel}
            </button>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all">
              {t.saveChanges}
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                settings.twoFactor.enabled ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Shield className={`w-8 h-8 ${settings.twoFactor.enabled ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {settings.twoFactor.enabled ? 'Disable Two-Factor Authentication?' : 'Enable Two-Factor Authentication'}
              </h2>
              <p className="text-gray-600 mt-2">
                {settings.twoFactor.enabled 
                  ? 'This will make your account less secure. Are you sure you want to continue?'
                  : `Set up ${settings.twoFactor.method === 'authenticator' ? 'an authenticator app' : settings.twoFactor.method === 'sms' ? 'SMS verification' : 'email verification'} for added security.`
                }
              </p>
            </div>

            {!settings.twoFactor.enabled && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mb-3">
                    <Key className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {settings.twoFactor.method === 'authenticator' 
                      ? 'Scan QR code with your authenticator app'
                      : `Enter the code sent to your ${settings.twoFactor.method}`
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSettings('twoFactor.enabled', !settings.twoFactor.enabled);
                  setShow2FAModal(false);
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  settings.twoFactor.enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {settings.twoFactor.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPreferences;
