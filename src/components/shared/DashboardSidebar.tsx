import { LogOut, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import './DashboardSidebar.css';

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
  compactMode?: boolean;
  desktopExpanded?: boolean;
  onToggleDesktopExpanded?: () => void;
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
  accentColor = '#3b82f6',
  isMobileOpen = false,
  onMobileClose,
  groupOrder,
  compactMode = false,
  desktopExpanded = false,
  onToggleDesktopExpanded,
}: DashboardSidebarProps) {
  const groups = groupTabs(tabs, groupOrder);
  const hasGroups = groups.length > 1 || groups[0]?.label !== '';
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onMobileClose?.();
      setIsClosing(false);
    }, 300);
  };

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
          handleClose();
        }}
        className={`w-full flex items-center ${compactMode && !desktopExpanded ? 'justify-center gap-0 px-2' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all text-sm ${isActive
            ? 'font-semibold shadow-sm'
            : isDark
              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        style={
          isActive
            ? {
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              borderLeft: `3px solid ${accentColor}`,
            }
            : { borderLeft: '3px solid transparent' }
        }
        title={tab.label}
      >
        <IconComponent className="w-4 h-4 shrink-0" />
        {(!compactMode || desktopExpanded) && <span className="truncate">{tab.label}</span>}
      </button>
    );
  };

  const sidebarContent = (
    <aside
      role="navigation"
      aria-label="Dashboard navigation"
      className={`${compactMode && !desktopExpanded ? 'w-20' : 'w-72'} h-screen flex flex-col ${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'} ${isRTL ? 'border-l' : 'border-r'} ${compactMode && !desktopExpanded ? 'p-4' : 'p-6'} transition-all duration-300`}
    >
      {/* Branding + Mobile Close */}
      <div
        className={`flex items-center justify-between ${compactMode && !desktopExpanded ? 'mb-6 px-0' : 'mb-10 px-2'}`}
      >
        {compactMode && !desktopExpanded ? (
          <button
            onClick={onToggleDesktopExpanded}
            className={`hidden lg:flex w-10 h-10 rounded-lg items-center justify-center transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
            aria-label="Open full sidebar"
            title="Open full sidebar"
          >
            <ChevronDown className={`w-5 h-5 ${isRTL ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        ) : (
          <span
            className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            Eduverse
          </span>
        )}
        {onMobileClose && (
          <button
            onClick={handleClose}
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
        className={`flex-1 overflow-y-auto sidebar-scroll space-y-1 ${isRTL ? 'pl-2' : 'pr-2'}`}
      >
        {hasGroups && (!compactMode || desktopExpanded) ? (
          groups.map((group, i) => (
            <div key={group.label || 'ungrouped'} className={i === 0 ? 'mb-1' : 'mt-6 mb-1'}>
              {group.label && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-2 pb-2 rounded transition-colors ${isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{group.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform opacity-50 ${collapsedGroups.has(group.label) ? '-rotate-90' : ''}`}
                  />
                </button>
              )}
              {!collapsedGroups.has(group.label) && (
                <div className="space-y-0.5">{group.tabs.map(renderTab)}</div>
              )}
            </div>
          ))
        ) : (
          <div className={compactMode && !desktopExpanded ? 'space-y-3' : 'space-y-2'}>
            {tabs.map(renderTab)}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className={`pt-6 mt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={onLogout}
          aria-label="Logout"
          className={`w-full flex items-center ${compactMode && !desktopExpanded ? 'justify-center gap-0 px-2' : 'gap-3 px-3'} py-2.5 rounded-lg transition-colors text-red-500 hover:bg-red-50 font-medium text-sm dark:hover:bg-red-500/10`}
          style={{ borderLeft: '3px solid transparent' }}
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!compactMode || desktopExpanded) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible, fixed */}
      <div
        className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen ${compactMode && desktopExpanded ? 'opacity-0 pointer-events-none' : ''
          }`}
      >
        {sidebarContent}
      </div>


      {compactMode && desktopExpanded && (
        <div
          className="hidden lg:block fixed inset-0 z-54 bg-black/40"
          onClick={onToggleDesktopExpanded}
          aria-hidden="true"
        />
      )}

      {compactMode && desktopExpanded && (
        <div
          className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-55 h-screen`}
        >
          {sidebarContent}
        </div>
      )}

      {/* Mobile: overlay drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-60">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${isClosing ? 'overlay-exit' : 'overlay-enter'}`}
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className={`relative z-10 ${isClosing ? (isRTL ? 'sidebar-exit-rtl' : 'sidebar-exit') : isRTL ? 'sidebar-enter-rtl float-right' : 'sidebar-enter float-left'}`}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
