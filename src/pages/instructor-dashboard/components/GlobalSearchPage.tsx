import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Search,
  X,
  Clock,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Megaphone,
  ClipboardCheck,
  FilePlus,
  Upload,
  UserCheck,
  Lightbulb,
  ChevronRight,
  SearchX,
  Loader2,
  Star,
} from 'lucide-react';

type Category = 'all' | 'students' | 'courses' | 'assignments' | 'grades' | 'materials' | 'announcements';

interface SearchResult {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: Category;
  color: string;
}

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'all', label: 'All', icon: <Search size={14} />, color: '#6366F1' },
  { key: 'students', label: 'Students', icon: <Users size={14} />, color: '#8B5CF6' },
  { key: 'courses', label: 'Courses', icon: <BookOpen size={14} />, color: '#F59E0B' },
  { key: 'assignments', label: 'Assignments', icon: <FileText size={14} />, color: '#EC4899' },
  { key: 'grades', label: 'Grades', icon: <BarChart3 size={14} />, color: '#0EA5E9' },
  { key: 'materials', label: 'Materials', icon: <FileText size={14} />, color: '#06B6D4' },
  { key: 'announcements', label: 'Announcements', icon: <Megaphone size={14} />, color: '#F59E0B' },
];

const MOCK_RESULTS: SearchResult[] = [
  { title: 'John Smith', subtitle: 'CS 101, CS 201 • john.smith@university.edu', icon: <Users size={18} />, category: 'students', color: '#8B5CF6' },
  { title: 'Emily Johnson', subtitle: 'CS 101 • emily.j@university.edu', icon: <Users size={18} />, category: 'students', color: '#8B5CF6' },
  { title: 'CS 101 - Introduction to Computer Science', subtitle: '45 students • Fall 2024', icon: <BookOpen size={18} />, category: 'courses', color: '#F59E0B' },
  { title: 'CS 201 - Data Structures', subtitle: '32 students • Fall 2024', icon: <BookOpen size={18} />, category: 'courses', color: '#F59E0B' },
  { title: 'Assignment 3: Linked Lists', subtitle: 'CS 201 • Due: Oct 15, 2024 • 28 submissions', icon: <FileText size={18} />, category: 'assignments', color: '#EC4899' },
  { title: 'Midterm Exam', subtitle: 'CS 101 • Due: Oct 20, 2024 • 42 submissions', icon: <FileText size={18} />, category: 'assignments', color: '#EC4899' },
  { title: 'CS 101 - Midterm Grades', subtitle: 'Posted Oct 25, 2024 • 45 students', icon: <BarChart3 size={18} />, category: 'grades', color: '#0EA5E9' },
  { title: 'Week 5 Lecture Slides', subtitle: 'CS 101 • PDF • 2.4 MB', icon: <FileText size={18} />, category: 'materials', color: '#06B6D4' },
  { title: 'Lab 3 Instructions', subtitle: 'CS 201 • PDF • 1.1 MB', icon: <FileText size={18} />, category: 'materials', color: '#06B6D4' },
  { title: 'Exam Schedule Update', subtitle: 'CS 101, CS 201 • Oct 10, 2024', icon: <Megaphone size={18} />, category: 'announcements', color: '#F59E0B' },
];

const QUICK_ACTIONS = [
  { title: 'Grade Submissions', icon: <ClipboardCheck size={22} />, color: '#8B5CF6', description: 'Review and grade' },
  { title: 'Create Assignment', icon: <FilePlus size={22} />, color: '#F59E0B', description: 'New assignment' },
  { title: 'Upload Materials', icon: <Upload size={22} />, color: '#06B6D4', description: 'Add resources' },
  { title: 'Post Announcement', icon: <Megaphone size={22} />, color: '#EC4899', description: 'Notify students' },
  { title: 'Take Attendance', icon: <UserCheck size={22} />, color: '#10B981', description: 'Record attendance' },
  { title: 'View Reports', icon: <BarChart3 size={22} />, color: '#3B82F6', description: 'Analytics' },
];

const SEARCH_TIPS = [
  'Search by student name, email, or ID',
  'Filter by course code (e.g., CS101)',
  'Find assignments by title or due date',
];

const INITIAL_RECENT = ['John Smith', 'CS 101', 'Assignment 3', 'Midterm grades'];

export function GlobalSearchPage() {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_RECENT);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Simulate search loading
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MOCK_RESULTS.filter((r) => {
      const matchesQuery = r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Show all results when query doesn't match any mock data but user has typed
  const displayResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    if (filteredResults.length > 0) return filteredResults;
    // If query is entered but no specific match, show all that match category
    const byCategory = activeCategory === 'all' ? MOCK_RESULTS : MOCK_RESULTS.filter((r) => r.category === activeCategory);
    return byCategory;
  }, [searchQuery, filteredResults, activeCategory]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of displayResults) {
      if (!groups[result.category]) groups[result.category] = [];
      groups[result.category].push(result);
    }
    return groups;
  }, [displayResults]);

  const totalCount = displayResults.length;

  const addRecentSearch = (term: string) => {
    setRecentSearches((prev) => [term, ...prev.filter((s) => s !== term)].slice(0, 8));
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
  };

  const getCategoryInfo = (key: string) => CATEGORIES.find((c) => c.key === key);

  const cardClass = isDark
    ? 'bg-white/5 border-white/10 border rounded-xl'
    : 'bg-white border border-gray-200 rounded-xl shadow-sm';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400';

  const showInitial = !searchQuery.trim();
  const showNoResults = hasSearched && !isSearching && displayResults.length === 0 && searchQuery.trim();
  const showResults = hasSearched && !isSearching && displayResults.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search Bar */}
      <div className={`${cardClass} p-6`}>
        <div className={`relative flex items-center gap-3 ${inputClass} border rounded-xl px-4 py-3`}>
          <Search size={22} className={subTextClass} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search') || 'Search students, courses, assignments...'}
            className="flex-1 bg-transparent outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${subTextClass}`}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      )}

      {/* Initial State */}
      {showInitial && !isSearching && (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-base font-semibold ${textClass}`}>Recent Searches</h3>
                <button
                  onClick={() => setRecentSearches([])}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Clock size={14} className={subTextClass} />
                    <span onClick={() => handleSearch(term)}>{term}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className={`${subTextClass} hover:text-red-500 transition-colors`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div>
            <h3 className={`text-base font-semibold mb-4 ${textClass}`}>Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.title}
                  className={`${cardClass} p-4 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform`}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <span style={{ color: action.color }}>{action.icon}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${textClass}`}>{action.title}</p>
                    <p className={`text-sm ${subTextClass}`}>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className={`${cardClass} p-5`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb size={18} className="text-amber-600" />
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${textClass}`}>Search Tips</h4>
                <ul className={`space-y-1 text-sm ${subTextClass}`}>
                  {SEARCH_TIPS.map((tip) => (
                    <li key={tip} className="flex items-center gap-2">
                      <Star size={12} className="text-indigo-500 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="space-y-4">
          <p className={`text-sm font-medium ${subTextClass}`}>
            {totalCount} result{totalCount !== 1 ? 's' : ''} found
          </p>

          {Object.entries(groupedResults).map(([category, results]) => {
            const catInfo = getCategoryInfo(category);
            if (!catInfo) return null;
            return (
              <div key={category} className={`${cardClass} overflow-hidden`}>
                {/* Category Header */}
                <div
                  className={`flex items-center gap-2 px-5 py-3 border-b ${
                    isDark ? 'border-white/10' : 'border-gray-100'
                  }`}
                >
                  <span style={{ color: catInfo.color }}>{catInfo.icon}</span>
                  <span className={`font-semibold text-sm ${textClass}`}>{catInfo.label}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                  >
                    {results.length}
                  </span>
                </div>

                {/* Results List */}
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {results.map((result, idx) => (
                    <button
                      key={`${result.title}-${idx}`}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Icon / Avatar */}
                      {result.category === 'students' ? (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                          style={{ backgroundColor: result.color }}
                        >
                          {result.title.charAt(0)}
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${result.color}20` }}
                        >
                          <span style={{ color: result.color }}>{result.icon}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${textClass}`}>{result.title}</p>
                        <p className={`text-sm truncate ${subTextClass}`}>{result.subtitle}</p>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`shrink-0 ${subTextClass} ${isRTL ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results State */}
      {showNoResults && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <SearchX size={32} className={subTextClass} />
          </div>
          <h3 className={`text-lg font-semibold ${textClass}`}>No results found</h3>
          <p className={`text-sm text-center max-w-md ${subTextClass}`}>
            Try searching for different keywords or use different filters
          </p>
        </div>
      )}
    </div>
  );
}
