import { Search, Bell, Globe, Moon, Sun, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  userName?: string;
  onProfileClick?: () => void;
}

export default function Header({ userName = 'Tarek Mohamed', onProfileClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [darkMode, setDarkMode] = useState(false);
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

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <div className="fixed top-0 right-0 flex items-center justify-end gap-4 pr-6 py-3 bg-transparent z-40 pointer-events-none">
      {/* Search */}
      <div className="relative w-64 pointer-events-auto">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search Here"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Notification */}
      <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto">
        <Bell size={20} className="text-gray-600" />
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {/* Language Selection */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Language</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('english')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    language === 'english'
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
                <button
                  onClick={() => setLanguage('arabic')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    language === 'arabic'
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  العربية
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
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
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
                <span className="text-sm text-gray-700">View Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
