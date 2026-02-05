import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  notifications?: Notification[];
  onNotificationClick?: (id: string) => void;
  onViewAllNotifications?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  language?: 'en' | 'ar';
  onToggleLanguage?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  variant?: 'indigo' | 'cyan' | 'red' | 'purple';
  logo?: ReactNode;
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  headerChildren?: ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  tabs,
  activeTab,
  onTabChange,
  userName,
  userRole,
  userAvatar,
  notifications = [],
  onNotificationClick,
  onViewAllNotifications,
  isDark = false,
  onToggleTheme,
  language = 'en',
  onToggleLanguage,
  onLogout,
  onProfile,
  onSettings,
  variant = 'indigo',
  logo,
  title,
  showSearch = true,
  searchPlaceholder,
  onSearch,
  headerChildren,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRTL = language === 'ar';

  return (
    <div
      className={cn(
        'min-h-screen bg-gray-50 dark:bg-gray-900',
        isRTL && 'rtl'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'lg:block',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => {
            onTabChange(id);
            setMobileMenuOpen(false);
          }}
          onLogout={onLogout}
          logo={logo}
          title={title}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          variant={variant}
          className={cn(isRTL && 'left-auto right-0')}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
          isRTL && (sidebarCollapsed ? 'lg:pr-20 lg:pl-0' : 'lg:pr-64 lg:pl-0'),
          className
        )}
      >
        {/* Header */}
        <Header
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onViewAllNotifications={onViewAllNotifications}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          language={language}
          onToggleLanguage={onToggleLanguage}
          onLogout={onLogout}
          onProfile={onProfile}
          onSettings={onSettings}
          showMenuButton
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            sidebarCollapsed ? 'lg:left-20' : 'lg:left-64',
            isRTL && (sidebarCollapsed ? 'lg:right-20 lg:left-0' : 'lg:right-64 lg:left-0')
          )}
        >
          {headerChildren}
        </Header>

        {/* Content */}
        <main className="pt-20 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
