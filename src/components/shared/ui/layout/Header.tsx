import { ReactNode, useState } from 'react';
import { Bell, Search, Settings, Moon, Sun, Globe, User, ChevronDown, LogOut, Menu } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  userName: string;
  userRole?: string;
  userAvatar?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
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
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Header({
  userName,
  userRole,
  userAvatar,
  showSearch = true,
  searchPlaceholder = 'Search...',
  onSearch,
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
  onMenuClick,
  showMenuButton = false,
  className,
  children,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-30 h-16',
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl',
        'border-b border-gray-200 dark:border-gray-700',
        'transition-all duration-300',
        className
      )}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search */}
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-64 pl-10 pr-4 py-2 rounded-xl text-sm',
                  'bg-gray-100 dark:bg-gray-700',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'border-0 focus:ring-2 focus:ring-indigo-500',
                  'transition-all duration-200'
                )}
              />
            </div>
          )}

          {children}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="w-5 h-5" />
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            onNotificationClick?.(notification.id);
                            setShowNotifications(false);
                          }}
                          className={cn(
                            'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                            !notification.read && 'bg-indigo-50 dark:bg-indigo-900/20'
                          )}
                        >
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        onViewAllNotifications?.();
                        setShowNotifications(false);
                      }}
                      className="w-full p-3 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700"
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                {userRole && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{userName}</p>
                    {userRole && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userRole}</p>
                    )}
                  </div>
                  <div className="p-2">
                    {onProfile && (
                      <button
                        onClick={() => {
                          onProfile();
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </button>
                    )}
                    {onSettings && (
                      <button
                        onClick={() => {
                          onSettings();
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>
                    )}
                    {onLogout && (
                      <>
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={() => {
                            onLogout();
                            setShowProfile(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
