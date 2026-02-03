import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarProps {
  onTabChange?: (tab: string) => void;
  tabs?: Tab[];
  activeTab?: string;
  onLogout?: () => void;
}

// Map tab IDs to translation keys
const tabTranslationKeys: Record<string, string> = {
  dashboard: 'dashboard',
  myclass: 'myClass',
  registration: 'registration',
  community: 'community',
  schedule: 'schedule',
  assignments: 'assignments',
  labs: 'labSessions',
  grades: 'grades',
  attendance: 'attendance',
  analytics: 'analytics',
  todo: 'todoList',
  ai: 'aiFeatures',
  gamification: 'achievements',
  notifications: 'notifications',
  payments: 'payments',
  chat: 'chat',
  settings: 'settings',
};

export default function Sidebar({ onTabChange, tabs, activeTab, onLogout }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();

  return (
    <aside className={`w-56 h-screen flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isRTL ? 'border-l' : 'border-r'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-inherit">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0" />
        <h2 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('studentDashboard')}
        </h2>
      </div>
      
      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {tabs && tabs.map((tab) => {
          const IconComponent = tab.icon;
          const translationKey = tabTranslationKeys[tab.id] || tab.id;
          const translatedLabel = t(translationKey);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-xs ${
                activeTab === tab.id
                  ? isDark 
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-800'
              }`}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">{translatedLabel}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-3 border-t border-inherit">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-xs ${
            isDark
              ? 'hover:bg-red-900/50 text-red-400'
              : 'hover:bg-red-50 text-red-600'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
