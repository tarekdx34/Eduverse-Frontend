import React from 'react';

type TabItem = { key: string; label: string; icon: any };

export function Sidebar({ tabs, activeTab, onChangeTab }: { tabs: TabItem[]; activeTab: string; onChangeTab: (k: any) => void }) {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        <h2 className="text-lg font-semibold">Instructor Panel</h2>
      </div>
      <nav className="space-y-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTab === key
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
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