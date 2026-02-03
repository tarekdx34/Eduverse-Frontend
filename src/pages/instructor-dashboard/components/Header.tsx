import { Search, Bell, Globe, Moon, Sun, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlobalSearch } from '../../../components/shared';

interface HeaderProps {
  userName?: string;
  onProfileClick?: () => void;
}

export function Header({ userName = 'Prof. Sarah Martinez', onProfileClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
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
    }
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <>
      <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} flex items-center justify-end gap-4 ${isRTL ? 'pl-6' : 'pr-6'} py-3 bg-transparent z-40 pointer-events-none`}>
        {/* Search */}
        <button 
          onClick={() => setShowSearch(true)}
          className={`relative w-64 pointer-events-auto flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            isDark 
              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:border-gray-500' 
              : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
          }`}
        >
          <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
          <span className="flex-1 text-left">{t('search')}</span>
          <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>⌘K</kbd>
        </button>

        {/* Notification */}
        <button className={`relative p-2 rounded-lg transition-colors pointer-events-auto ${
          isDark ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-100 bg-white'
        }`}>
          <Bell size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <div className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-red-500 rounded-full`} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative pointer-events-auto" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`rounded-lg p-1 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-white text-sm font-semibold">
              SM
            </div>
          </button>

          {showDropdown && (
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-xl shadow-lg border py-2 z-50 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* User Info */}
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Instructor</p>
              </div>

              {/* Language Selection */}
              <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('language')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    {t('english')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === 'ar'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    {t('arabic')}
                  </button>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
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
                      {isDark ? t('darkMode') : t('lightMode')}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      isDark ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('viewProfile')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 ${
                    isDark ? 'hover:bg-red-900/20' : ''
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        userRole="instructor"
      />
    </>
  );
}

export default Header;