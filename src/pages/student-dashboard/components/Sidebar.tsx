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
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  return (
    <aside className={`w-64 h-screen flex flex-col ${isDark ? 'bg-card-dark border-white/5' : 'glass border-slate-200'} ${isRTL ? 'border-l' : 'border-r'} p-6`}>
      {/* Branding */}
      <div className="flex items-center mb-10 px-2">
        <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Eduverse
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll space-y-2">
        {tabs && tabs.map((tab) => {
          const IconComponent = tab.icon;
          const translationKey = tabTranslationKeys[tab.id] || tab.id;
          const translatedLabel = t(translationKey);
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm ${
                isActive
                  ? isDark
                    ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold'
                    : 'sidebar-item-active text-white font-semibold'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5'
                    : 'text-slate-500 hover:text-[var(--accent-color)]'
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{translatedLabel}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div className={`pt-6 mt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10 font-medium text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
