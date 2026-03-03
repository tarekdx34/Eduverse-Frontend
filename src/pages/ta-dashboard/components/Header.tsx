import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Globe, Moon, Sun, User, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  ta: { name: string; email: string };
  onProfileClick?: () => void;
}

export function Header({ title, ta, onProfileClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    return (localStorage.getItem('eduverse-ta-language') as 'en' | 'ar') || 'en';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('eduverse-ta-theme', next ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('eduverse-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleLogout = () => {
    setShowDropdown(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (onProfileClick) onProfileClick();
  };

  const initials = ta.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={`border-b p-6 flex items-center justify-between ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className={`relative p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <Bell size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-3 rounded-lg p-1.5 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-400 rounded-full cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <div className={`text-sm text-left ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <div className="font-semibold">{ta.name}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {ta.email}
              </div>
            </div>
          </button>

          {showDropdown && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border py-2 z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* User Info */}
              <div
                className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {ta.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Teaching Assistant
                </p>
              </div>

              {/* Language Selection */}
              <div
                className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Language
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === 'ar'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    العربية
                  </button>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div
                className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Moon className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    ) : (
                      <Sun className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    )}
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${
                        isDark ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Profile & Logout */}
              <div className="px-2 py-2">
                <button
                  onClick={handleProfileClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    View Profile
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 ${
                    isDark ? 'hover:bg-red-900/20' : ''
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
