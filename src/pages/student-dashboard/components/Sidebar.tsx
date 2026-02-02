import { ChevronDown, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
}

interface SidebarSection {
  title: string;
  items: string[];
}

interface SidebarProps {
  onTabChange?: (tab: string) => void;
  tabs?: Tab[];
  activeTab?: string;
  isOpen?: boolean;
  onToggle?: () => void;
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

export default function Sidebar({ onTabChange, tabs, activeTab, isOpen, onToggle }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div className={`w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isRTL ? 'border-l' : 'border-r'} h-screen overflow-hidden`}>
      {/* Logo */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Eduverse</span>
          <button onClick={onToggle} className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Menu size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
        {/* Vertical Tabs Section */}
        {tabs && tabs.length > 0 && (
          <div className="mb-6">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const translationKey = tabTranslationKeys[tab.id] || tab.id;
                const translatedLabel = t(translationKey);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? isDark 
                          ? 'bg-purple-900/50 text-purple-400' 
                          : 'bg-purple-100 text-purple-600'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{translatedLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
