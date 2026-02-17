import { Bell, Globe, Moon, Sun, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';

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
  translations = {},
}: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* Search bar */}
        <div
          className={`relative group flex items-center rounded-2xl px-4 py-2 w-96 max-w-full focus-within:ring-2 transition-all ${
            isDark ? 'bg-white/5 border border-white/10' : 'glass'
          }`}
          style={{ '--tw-ring-color': `${accentColor}50` } as React.CSSProperties}
        >
          <span className="material-symbols-rounded text-slate-400 text-xl mr-2">search</span>
          <input
            onClick={() => setShowSearch(true)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500 cursor-pointer"
            placeholder={t.search}
            type="text"
            readOnly
          />
          <span
            className={`hidden md:block text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-500'}`}
          >
            ⌘K
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              isDark
                ? 'bg-white/5 hover:bg-white/10'
                : 'bg-white border border-slate-200 shadow-sm hover:bg-slate-50'
            }`}
          >
            <Bell size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            <span
              className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0c]' : 'border-white'}`}
              style={{ backgroundColor: accentColor }}
            />
          </button>

          {isDark && <div className="h-8 w-px bg-white/10" />}

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {isDark && (
                <div className="text-right">
                  <p className="text-sm font-bold leading-tight mb-0">{userName}</p>
                  <p className="text-[11px] text-slate-500 font-medium mb-0">{userRole}</p>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-opacity-50 transition-all bg-gradient-to-tr ${avatarGradient} p-0.5`}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              >
                <div
                  className={`w-full h-full rounded-[10px] bg-gradient-to-br ${avatarGradient}`}
                />
              </div>
            </div>

            {showDropdown && (
              <div
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-2xl shadow-lg py-2 z-50 ${
                  isDark
                    ? 'bg-card-dark border border-white/10'
                    : 'glass'
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
                      <span
                        className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {isDark ? t.darkMode : t.lightMode}
                      </span>
                    </div>
                    <div
                      className="w-10 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: isDark ? accentColor : '#cbd5e1' }}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${
                          isDark ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </button>
                </div>

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

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        userRole={searchRole}
      />
    </>
  );
}

export default DashboardHeader;
