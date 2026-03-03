import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Search,
  X,
  Clock,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
  Plus,
  Shield,
} from 'lucide-react';

interface SearchResult {
  id: string;
  category: 'users' | 'courses' | 'settings' | 'logs';
  title: string;
  subtitle: string;
  meta: string;
  icon: React.ElementType;
}

const mockResults: SearchResult[] = [
  { id: '1', category: 'users', title: 'Dr. Sarah Smith', subtitle: 'Instructor • Computer Science', meta: 'dr.smith@uni.edu', icon: Users },
  { id: '2', category: 'users', title: 'Ahmed Hassan', subtitle: 'Teaching Assistant • Computer Science', meta: 'ahmed@uni.edu', icon: Users },
  { id: '3', category: 'users', title: 'Mohamed Ali', subtitle: 'Student', meta: 'ID: STU-2024-001', icon: Users },
  { id: '4', category: 'courses', title: 'CS101 - Introduction to Programming', subtitle: '120 students', meta: 'Active', icon: BookOpen },
  { id: '5', category: 'courses', title: 'CS202 - Data Structures', subtitle: '95 students', meta: 'Active', icon: BookOpen },
  { id: '6', category: 'settings', title: 'Security Settings', subtitle: 'System Configuration', meta: '/config/security', icon: Shield },
  { id: '7', category: 'settings', title: 'Backup Settings', subtitle: 'System Configuration', meta: '/config/backup', icon: Settings },
  { id: '8', category: 'logs', title: 'Login Activity - Feb 25, 2025', subtitle: '245 events', meta: 'Logs', icon: FileText },
];

const categories = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'Users' },
  { key: 'courses', label: 'Courses' },
  { key: 'settings', label: 'Settings' },
  { key: 'reports', label: 'Reports' },
  { key: 'logs', label: 'Logs' },
] as const;

type CategoryKey = (typeof categories)[number]['key'];

const categoryBadgeColor: Record<string, string> = {
  users: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  courses: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  settings: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  logs: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
};

export function GlobalSearchPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [recentSearches, setRecentSearches] = useState([
    { text: 'Dr. Smith', type: 'User search' },
    { text: 'CS101', type: 'Course search' },
    { text: 'Backup settings', type: 'Settings search' },
    { text: 'Security logs', type: 'Logs search' },
  ]);

  const hasQuery = query.trim().length > 0;

  const filtered = mockResults.filter((r) => {
    const matchesQuery =
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const getCategoryCount = (key: CategoryKey) => {
    if (key === 'all') return mockResults.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase())).length;
    if (key === 'reports') return 0;
    return mockResults.filter((r) => r.category === key && (r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase()))).length;
  };

  const removeRecent = (index: number) => {
    setRecentSearches((prev) => prev.filter((_, i) => i !== index));
  };

  const quickActions = [
    { label: 'Add New User', icon: Plus, action: () => console.log('Add New User') },
    { label: 'Create Course', icon: BookOpen, action: () => console.log('Create Course') },
    { label: 'View Reports', icon: BarChart3, action: () => console.log('View Reports') },
    { label: 'System Settings', icon: Settings, action: () => console.log('System Settings') },
  ];

  const suggestions = ['enrollment stats', 'inactive users', 'pending grades', 'server status'];

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search Header */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, courses, settings, reports..."
          className={`w-full rounded-xl text-lg p-4 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'} border outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'}`}
        />
        {hasQuery && (
          <button
            onClick={() => setQuery('')}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const count = hasQuery ? getCategoryCount(cat.key) : null;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                    : 'bg-blue-50 text-blue-600 border-blue-500'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat.label}
              {count !== null && <span className="ml-1.5 opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Before Search */}
      {!hasQuery && (
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Searches</h3>
              <button
                onClick={() => setRecentSearches([])}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear All
              </button>
            </div>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                    onClick={() => setQuery(item.text)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.text}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeRecent(idx); }}
                      className={`p-1 rounded ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No recent searches</p>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`${cardClass} flex flex-col items-center gap-3 text-center hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                    <action.icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Try searching for:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {term}
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* After Search - Results */}
      {hasQuery && filtered.length > 0 && (
        <div className={cardClass}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {filtered.length} result{filtered.length !== 1 && 's'} found
          </h3>
          <div className="space-y-2">
            {filtered.map((result) => (
              <div
                key={result.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
              >
                <div className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <result.icon className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.title}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle}</p>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} hidden sm:block`}>{result.meta}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${categoryBadgeColor[result.category]}`}>
                  {result.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasQuery && filtered.length === 0 && (
        <div className={`${cardClass} text-center py-12`}>
          <Search className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Try different keywords or categories.
          </p>
        </div>
      )}
    </div>
  );
}
