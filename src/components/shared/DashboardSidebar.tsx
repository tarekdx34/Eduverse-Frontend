import { LogOut } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface DashboardSidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  isDark: boolean;
  isRTL?: boolean;
  accentColor?: string;
}

export function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  isDark,
  isRTL = false,
  accentColor = '#7C3AED',
}: DashboardSidebarProps) {
  return (
    <aside
      className={`w-64 h-screen flex flex-col ${isDark ? 'bg-card-dark border-white/5' : 'glass border-slate-200'} ${isRTL ? 'border-l' : 'border-r'} p-6`}
    >
      {/* Branding */}
      <div className="flex items-center mb-10 px-2">
        <span
          className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}
        >
          Eduverse
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll space-y-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm ${
                isActive
                  ? isDark
                    ? 'font-semibold'
                    : 'sidebar-item-active text-white font-semibold'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
              style={
                isActive
                  ? isDark
                    ? { backgroundColor: `${accentColor}15`, color: accentColor }
                    : undefined
                  : undefined
              }
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
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
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
