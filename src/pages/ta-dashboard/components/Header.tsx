import { Search, Bell, Globe, Moon, Sun, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  title?: string;
  ta: { name: string; email: string };
}

export function Header({ title, ta }: HeaderProps) {
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if (event.key === 'Escape') setShowSearch(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => setLanguage(lang);

  return (
    <>
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} flex items-center justify-end gap-4 ${
          isRTL ? 'pl-6' : 'pr-6'
        } py-3 bg-transparent z-40 pointer-events-none`}
      >
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`relative w-64 pointer-events-auto flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            isDark
              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:border-gray-500'
              : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
          }`}
        >
          <Search size={16} className="text-gray-400" />
          <span className="flex-1 text-left">{t('search')}</span>
          <kbd
            className={`px-1.5 py-0.5 text-xs rounded ${
              isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}
          >
            ⌘K
          </kbd>
        </button>

        <button
          className={`relative p-2 rounded-lg transition-colors pointer-events-auto ${
            isDark ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-100 bg-white'
          }`}
        >
          <Bell size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          <div
            className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-red-500 rounded-full`}
          />
        </button>

        <div className="relative pointer-events-auto" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`rounded-lg p-1 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full cursor-pointer hover:opacity-80 transition-opacity" />
          </button>

          {showDropdown && (
            <div
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-xl shadow-lg border py-2 z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('language')}
                </p>
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

              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-gray-300" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-600" />
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

              <div className="px-2 py-2">
                <button
                  onClick={handleProfileClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('viewProfile')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30"
          onClick={() => setShowSearch(false)}
        >
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl p-4 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
