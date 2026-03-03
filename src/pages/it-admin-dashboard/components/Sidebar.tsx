import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type TabItem = { key: string; label: string; icon: any };

export function Sidebar({ tabs, activeTab, onChangeTab }: { tabs: TabItem[]; activeTab: string; onChangeTab: (k: any) => void }) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { isRTL, t } = useLanguage();

  return (
    <aside className={`w-64 min-h-screen p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isRTL ? 'border-l' : 'border-r'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('itAdminDashboard')}
        </h2>
      </div>
      <nav className="space-y-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTab === key
                ? isDark 
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
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
