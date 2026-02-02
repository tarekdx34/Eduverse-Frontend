import { Search, Bell, Globe, Moon, Sun, User, Command } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  userName?: string;
  onProfileClick?: () => void;
}

export default function Header({ userName = 'Tarek Mohamed', onProfileClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();

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
    navigate('/profile');
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  return (
    <>
      <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} flex items-center justify-end gap-4 ${isRTL ? 'pl-6' : 'pr-6'} py-3 bg-transparent z-40 pointer-events-none`}>
        {/* Search */}
        <button 
          onClick={() => setShowSearch(true)}
          className="relative w-64 pointer-events-auto flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-white hover:border-gray-300 transition-colors"
        >
          <Search size={16} className="text-gray-400" />
          <span className="flex-1 text-left">{t('search')}</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">⌘K</kbd>
        </button>

        {/* Notification */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto bg-white">
          <Bell size={20} className="text-gray-600" />
          <div className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-red-500 rounded-full`} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative pointer-events-auto" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full cursor-pointer hover:opacity-80 transition-opacity" />
          </button>

          {showDropdown && (
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50`}>
              {/* Language Selection */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{t('language')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
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
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    {t('arabic')}
                  </button>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-700">
                      {darkMode ? t('darkMode') : t('lightMode')}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${
                        darkMode ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Profile Link */}
              <div className="px-2 py-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('viewProfile')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
