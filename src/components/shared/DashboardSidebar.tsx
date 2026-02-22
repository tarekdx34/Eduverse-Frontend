import { LogOut, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  group?: string;
}

interface TabGroup {
  label: string;
  tabs: Tab[];
}

interface DashboardSidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  isDark: boolean;
  isRTL?: boolean;
  accentColor?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  groupOrder?: string[];
}

function groupTabs(tabs: Tab[], groupOrder?: string[]): TabGroup[] {
  const grouped = new Map<string, Tab[]>();
  tabs.forEach((tab) => {
    const group = tab.group || '';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(tab);
  });
  if (!groupOrder || grouped.size <= 1) {
    return [{ label: '', tabs }];
  }
  const result: TabGroup[] = [];
  groupOrder.forEach((g) => {
    if (grouped.has(g)) result.push({ label: g, tabs: grouped.get(g)! });
  });
  grouped.forEach((t, g) => {
    if (!groupOrder.includes(g)) result.push({ label: g, tabs: t });
  });
  return result;
}

export function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  isDark,
  isRTL = false,
  accentColor = '#7C3AED',
  isMobileOpen = false,
  onMobileClose,
  groupOrder,
}: DashboardSidebarProps) {
  const groups = groupTabs(tabs, groupOrder);
  const hasGroups = groups.length > 1 || groups[0]?.label !== '';
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderTab = (tab: Tab) => {
    const IconComponent = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        role="tab"
        aria-selected={isActive}
        aria-label={`${tab.label} tab`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => {
          onTabChange(tab.id);
          onMobileClose?.();
        }}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-sm ${
          isActive
            ? 'font-semibold'
            : isDark
              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
        style={isActive ? { backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{tab.label}</span>
      </button>
    );
  };

  const sidebarContent = (
    <aside
      role="navigation"
      aria-label="Dashboard navigation"
      className={`w-64 h-screen flex flex-col ${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'} ${isRTL ? 'border-l' : 'border-r'} p-6`}
    >
      {/* Branding + Mobile Close */}
      <div className="flex items-center justify-between mb-10 px-2">
        <span
          className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}
        >
          Eduverse
        </span>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        role="tablist"
        aria-label="Navigation tabs"
        className="flex-1 overflow-y-auto sidebar-scroll space-y-1"
      >
        {hasGroups ? (
          groups.map((group) => (
            <div key={group.label || 'ungrouped'} className="mb-2">
              {group.label && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${collapsedGroups.has(group.label) ? '-rotate-90' : ''}`}
                  />
                </button>
              )}
              {!collapsedGroups.has(group.label) && (
                <div className="space-y-1">{group.tabs.map(renderTab)}</div>
              )}
            </div>
          ))
        ) : (
          <div className="space-y-2">{tabs.map(renderTab)}</div>
        )}
      </nav>

      {/* Logout */}
      <div className={`pt-6 mt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={onLogout}
          aria-label="Logout"
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 font-medium text-sm dark:hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible, fixed */}
      <div className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen`}>
        {sidebarContent}
      </div>

      {/* Mobile: overlay drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className={`relative z-10 ${isRTL ? 'float-right' : 'float-left'}`}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
