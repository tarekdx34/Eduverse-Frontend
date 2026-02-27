import {
  Bell,
  Globe,
  Moon,
  Sun,
  User,
  Check,
  Clock,
  FileText,
  AlertTriangle,
  Award,
  MessageSquare,
  Info,
  X,
  Search,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';

interface HeaderNotification {
  id: string;
  type: 'deadline' | 'grade' | 'announcement' | 'reminder' | 'achievement' | 'message' | 'warning';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'Assignment Due Tomorrow',
    description: 'Database Design Project is due in 24 hours.',
    timestamp: '10 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Attendance Alert',
    description: 'Your attendance in DBMS is at 76%.',
    timestamp: '1 hr ago',
    read: false,
  },
  {
    id: '3',
    type: 'grade',
    title: 'New Grade Posted',
    description: 'Web Portfolio Project: 95/100.',
    timestamp: '2 hrs ago',
    read: false,
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked! 🎉',
    description: 'Earned "Perfect Score" badge.',
    timestamp: '3 hrs ago',
    read: true,
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Class Cancelled',
    description: "Tomorrow's SE lecture cancelled.",
    timestamp: '5 hrs ago',
    read: true,
  },
];

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  isDark: boolean;
  isRTL?: boolean;
  accentColor?: string;
  avatarGradient?: string;
  language?: 'en' | 'ar';
  onToggleTheme: () => void;
  onSetLanguage: (lang: 'en' | 'ar') => void;
  onProfileClick?: () => void;
  searchRole?: string;
  notifications?: HeaderNotification[];
  primaryColor?: string;
  onSetPrimaryColor?: (color: string) => void;
  availableColors?: { id: string; colorClass: string; hex: string }[];
  translations?: {
    search?: string;
    language?: string;
    english?: string;
    arabic?: string;
    darkMode?: string;
    lightMode?: string;
    viewProfile?: string;
    logout?: string;
  };
}

export function DashboardHeader({
  userName,
  userRole,
  isDark,
  isRTL = false,
  accentColor = '#7C3AED',
  avatarGradient = 'from-[#7C3AED] to-[#ec4899]',
  language = 'en',
  onToggleTheme,
  onSetLanguage,
  onProfileClick,
  searchRole,
  notifications = DEFAULT_NOTIFICATIONS,
  primaryColor,
  onSetPrimaryColor,
  availableColors,
  translations = {},
}: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState<HeaderNotification[]>(
    notifications || DEFAULT_NOTIFICATIONS
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'grade':
        return <FileText className="w-4 h-4" />;
      case 'announcement':
        return <Info className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'text-red-500 bg-red-100';
      case 'grade':
        return 'text-green-500 bg-green-100';
      case 'announcement':
        return 'text-blue-500 bg-blue-100';
      case 'achievement':
        return 'text-amber-500 bg-amber-100';
      case 'message':
        return 'text-purple-500 bg-purple-100';
      case 'warning':
        return 'text-orange-500 bg-orange-100';
      default:
        return 'text-slate-500 bg-slate-100';
    }
  };
  const navigate = useNavigate();

  const t = {
    search: translations.search || 'Search...',
    language: translations.language || 'Language',
    english: translations.english || 'English',
    arabic: translations.arabic || 'العربية',
    darkMode: translations.darkMode || 'Dark Mode',
    lightMode: translations.lightMode || 'Light Mode',
    viewProfile: translations.viewProfile || 'View Profile',
    logout: translations.logout || 'Logout',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate('/profile');
    }
  };

  return (
    <>
      <header
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        role="banner"
      >
        {/* Awab Changes: Integrated Tarek's polished search bar with CMD+K shortcut */}
        <div
          className={`relative group flex items-center rounded-2xl px-4 py-2 w-96 max-w-full focus-within:ring-2 transition-all ${
            isDark ? 'bg-white/5 border border-white/10' : 'glass'
          }`}
          style={{ '--tw-ring-color': `${accentColor}50` } as React.CSSProperties}
        >
          <span className="material-symbols-rounded text-slate-400 text-xl mr-2">search</span>
          <input
            onClick={() => setShowSearch && setShowSearch(true)}
            className={`bg-transparent border-none focus:ring-0 text-sm w-full cursor-pointer ${isDark ? 'placeholder:text-slate-400' : 'placeholder:text-slate-500'}`}
            placeholder={t.search}
            type="text"
            readOnly
            aria-label="Search"
          />
          <span
            className={`hidden md:block text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-500'}`}
          >
            ⌘K
          </span>
        </div>
        {/* End of Tarek's Search Bar UI */}
        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4 justify-end w-full md:w-auto">
          {/* Notification */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${
                isDark
                  ? 'border border-white/10 hover:bg-white/5 bg-transparent text-slate-300'
                  : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Bell size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: accentColor }}
                  aria-hidden="true"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 rounded-2xl shadow-sm z-50 overflow-hidden ${
                  isDark
                    ? 'bg-card-dark border border-white/10'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {/* Dropdown Header */}
                <div
                  className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}
                >
                  <h3
                    className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium hover:underline"
                      style={{ color: accentColor }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto">
                  {notificationList.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell
                        className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                      />
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No notifications
                      </p>
                    </div>
                  ) : (
                    notificationList.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                          !notification.read ? (isDark ? 'bg-white/5' : 'bg-slate-50') : ''
                        } ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: accentColor }}
                              />
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {notification.description}
                          </p>
                          <p
                            className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {notification.timestamp}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className={`p-1 rounded-lg flex-shrink-0 transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 cursor-pointer group"
              role="button"
              aria-label="User menu"
              aria-expanded={showDropdown}
              aria-haspopup="true"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowDropdown(!showDropdown);
                }
              }}
            >
              <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                <p
                  className={`text-sm font-bold leading-tight mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}
                >
                  {userName}
                </p>
                <p
                  className={`text-[11px] font-medium mb-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  {userRole}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl overflow-hidden transition-colors bg-gradient-to-tr opacity-90 group-hover:opacity-100 ${avatarGradient} p-0.5`}
              >
                <div
                  className={`w-full h-full rounded-[10px] bg-gradient-to-br ${avatarGradient}`}
                />
              </div>
            </div>

            {showDropdown && (
              <div
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-2xl shadow-sm py-2 z-50 ${
                  isDark
                    ? 'bg-card-dark border border-white/10'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {/* Language Selection */}
                <div
                  className={`px-4 py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}
                >
                  <p className="text-xs mb-2 text-slate-400">{t.language}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSetLanguage('en')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                        language === 'en'
                          ? 'border'
                          : isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={
                        language === 'en'
                          ? {
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                              borderColor: `${accentColor}30`,
                            }
                          : undefined
                      }
                    >
                      <Globe className="w-4 h-4" />
                      {t.english}
                    </button>
                    <button
                      onClick={() => onSetLanguage('ar')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                        language === 'ar'
                          ? 'border'
                          : isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={
                        language === 'ar'
                          ? {
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                              borderColor: `${accentColor}30`,
                            }
                          : undefined
                      }
                    >
                      <Globe className="w-4 h-4" />
                      {t.arabic}
                    </button>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div
                  className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}
                >
                  <button
                    onClick={onToggleTheme}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDark ? (
                        <Moon className="w-4 h-4 text-slate-300" />
                      ) : (
                        <Sun className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {isDark ? t.darkMode : t.lightMode}
                      </span>
                    </div>
                    <div
                      className="w-10 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: isDark ? accentColor : '#cbd5e1' }}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${
                          isDark ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </button>
                </div>

                {/* Theme Color Picker */}
                {primaryColor && onSetPrimaryColor && availableColors && (
                  <div
                    className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}
                  >
                    <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Theme Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => onSetPrimaryColor(color.id)}
                          className={`w-6 h-6 rounded-full transition-all ${color.colorClass} border-2 ${
                            primaryColor === color.id
                              ? `${isDark ? 'border-white' : 'border-slate-800'} scale-110 shadow-sm`
                              : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.id.charAt(0).toUpperCase() + color.id.slice(1)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Link */}
                <div className="px-2 py-2">
                  <button
                    onClick={handleProfileClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <User className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t.viewProfile}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default DashboardHeader;
