import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface SidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout?: () => void;
  logo?: ReactNode;
  title?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  variant?: 'indigo' | 'cyan' | 'red' | 'purple';
  className?: string;
}

const variantStyles = {
  indigo: {
    bg: 'bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900',
    activeTab: 'bg-white/15 text-white',
    hoverTab: 'hover:bg-white/10',
    logo: 'text-indigo-400',
    accent: 'bg-indigo-500',
  },
  cyan: {
    bg: 'bg-gradient-to-b from-cyan-900 via-cyan-800 to-cyan-900',
    activeTab: 'bg-white/15 text-white',
    hoverTab: 'hover:bg-white/10',
    logo: 'text-cyan-400',
    accent: 'bg-cyan-500',
  },
  red: {
    bg: 'bg-gradient-to-b from-red-900 via-red-800 to-red-900',
    activeTab: 'bg-white/15 text-white',
    hoverTab: 'hover:bg-white/10',
    logo: 'text-red-400',
    accent: 'bg-red-500',
  },
  purple: {
    bg: 'bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900',
    activeTab: 'bg-white/15 text-white',
    hoverTab: 'hover:bg-white/10',
    logo: 'text-purple-400',
    accent: 'bg-purple-500',
  },
};

export function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  logo,
  title = 'EduVerse',
  collapsed = false,
  onToggle,
  variant = 'indigo',
  className,
}: SidebarProps) {
  const styles = variantStyles[variant];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out',
        styles.bg,
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/10 px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        {logo || (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', styles.accent)}>
            <span className="text-white font-bold text-lg">E</span>
          </div>
        )}
        {!collapsed && (
          <span className="text-white font-bold text-xl tracking-tight">{title}</span>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors',
              collapsed ? '' : 'ml-auto'
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    'text-white/70',
                    isActive ? styles.activeTab : styles.hoverTab,
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? tab.label : undefined}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-white')} />
                  {!collapsed && (
                    <>
                      <span className={cn('flex-1 text-left text-sm font-medium', isActive && 'text-white')}>
                        {tab.label}
                      </span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              'text-white/70 hover:text-red-400 hover:bg-red-500/10',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
