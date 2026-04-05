import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type TabItem = { key: string; label: string; icon: any };

export function Sidebar({
  tabs,
  activeTab,
  onChangeTab,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChangeTab: (k: any) => void;
}) {
  const { isDark } = useTheme();
  const { isRTL, t } = useLanguage();

  return (
    <aside
      className={`w-64 min-h-screen p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isRTL ? 'border-l' : 'border-r'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500" />
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('adminDashboard')}
        </h2>
      </div>
      <nav className="space-y-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTab === key
                ? isDark
                  ? 'bg-red-900/50 text-red-300 border border-red-700'
                  : 'bg-red-50 text-red-700 border border-red-100'
                : isDark
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-50 text-gray-800'
            }`}
            onClick={() => onChangeTab(key)}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
