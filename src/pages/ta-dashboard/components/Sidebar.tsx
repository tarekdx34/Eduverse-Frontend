import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

type TabItem = { key: string; label: string; icon: React.ComponentType<{ className?: string; size?: number }> };

interface SidebarProps {
  tabs: TabItem[];
  activeTab: string;
  onChangeTab: (key: string) => void;
  onLogout?: () => void;
}

const tabTranslationKeys: Record<string, string> = {
  dashboard: 'dashboard',
  courses: 'courses',
  labs: 'labs',
  grading: 'grading',
  students: 'students',
  communication: 'communication',
};

export function Sidebar({ tabs, activeTab, onChangeTab, onLogout }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();

  return (
    <aside
      className={`w-56 h-screen flex flex-col ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${isRTL ? 'border-l' : 'border-r'}`}
    >
      <div className={`flex items-center gap-2 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0" />
        <h2 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('taPanel')}
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {tabs.map(({ key, label, icon: Icon }) => {
          const translationKey = tabTranslationKeys[key] || key;
          const translatedLabel = t(translationKey);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeTab(key)}
              aria-current={activeTab === key ? 'page' : undefined}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-xs ${
                activeTab === key
                  ? isDark
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">{translatedLabel}</span>
            </button>
          );
        })}
      </nav>

      {onLogout && (
        <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-xs ${
              isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-50 text-red-600'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
