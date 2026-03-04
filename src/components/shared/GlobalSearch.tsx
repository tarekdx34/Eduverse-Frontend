import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  User,
  Calendar,
  Bell,
  Clock,
  ChevronRight,
  History,
  TrendingUp,
  Folder,
  Users,
  GraduationCap,
} from 'lucide-react';

export interface SearchResult {
  id: string;
  type: 'course' | 'assignment' | 'file' | 'announcement' | 'user' | 'event' | 'student';
  title: string;
  description: string;
  meta: string;
  url?: string;
  highlight?: string;
}

interface RecentSearch {
  query: string;
  timestamp: string;
}

interface QuickLink {
  icon: React.ElementType;
  label: string;
  color: string;
  action: () => void;
}

interface GlobalSearchProps {
  onNavigate?: (url: string) => void;
  userRole?: 'student' | 'instructor' | 'admin';
  customResults?: SearchResult[];
  customQuickLinks?: QuickLink[];
  onSearch?: (query: string) => Promise<SearchResult[]>;
  isDark?: boolean;
  placeholder?: string;
}

const defaultMockResults: SearchResult[] = [
  {
    id: 'c1',
    type: 'course',
    title: 'Database Management Systems',
    description: 'CS220 - Dr. James Wilson',
    meta: 'Course',
    highlight: 'database',
  },
  {
    id: 'c2',
    type: 'course',
    title: 'Data Structures & Algorithms',
    description: 'CS201 - Prof. Michael Chen',
    meta: 'Course',
    highlight: 'data',
  },
  {
    id: 'a1',
    type: 'assignment',
    title: 'Database Design Project',
    description: 'CS220 - Due Dec 10, 2025',
    meta: 'Assignment',
    highlight: 'database',
  },
  {
    id: 'a2',
    type: 'assignment',
    title: 'Algorithm Analysis Report',
    description: 'CS201 - Due Dec 6, 2025',
    meta: 'Assignment',
    highlight: 'algorithm',
  },
  {
    id: 'f1',
    type: 'file',
    title: 'Lecture 8 - SQL Joins.pdf',
    description: 'CS220 - Database Management',
    meta: 'File',
    highlight: 'sql',
  },
  {
    id: 'f2',
    type: 'file',
    title: 'Algorithm Complexity Notes.pdf',
    description: 'CS201 - Data Structures',
    meta: 'File',
    highlight: 'algorithm',
  },
  {
    id: 'n1',
    type: 'announcement',
    title: 'Midterm Exam Schedule Released',
    description: 'Posted by Academic Office',
    meta: 'Announcement',
  },
  {
    id: 'u1',
    type: 'user',
    title: 'Dr. Sarah Johnson',
    description: 'Instructor - Computer Science',
    meta: 'Instructor',
  },
  {
    id: 's1',
    type: 'student',
    title: 'John Smith',
    description: 'CS220, CS201 - GPA: 3.5',
    meta: 'Student',
  },
  {
    id: 'e1',
    type: 'event',
    title: 'CS Department Seminar',
    description: 'Dec 12, 2025 - Room 401',
    meta: 'Event',
  },
];

const defaultRecentSearches: RecentSearch[] = [
  { query: 'database project', timestamp: '2 hours ago' },
  { query: 'algorithm complexity', timestamp: '5 hours ago' },
  { query: 'Dr. Sarah Johnson', timestamp: 'Yesterday' },
];

export function GlobalSearch({
  onNavigate,
  userRole = 'student',
  customResults,
  customQuickLinks,
  onSearch,
  isDark = false,
  placeholder = 'Search...',
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'course', label: 'Courses' },
    { id: 'assignment', label: 'Assignments' },
    { id: 'file', label: 'Files' },
    { id: 'announcement', label: 'Announcements' },
    { id: 'user', label: 'Users' },
    ...(userRole === 'instructor' ? [{ id: 'student', label: 'Students' }] : []),
    { id: 'event', label: 'Events' },
  ];

  const defaultQuickLinks: QuickLink[] = [
    {
      icon: BookOpen,
      label: 'My Courses',
      color: 'bg-blue-100 text-blue-600',
      action: () => onNavigate?.('/courses'),
    },
    {
      icon: FileText,
      label: 'Assignments',
      color: 'bg-amber-100 text-amber-600',
      action: () => onNavigate?.('/assignments'),
    },
    {
      icon: Calendar,
      label: 'Schedule',
      color: 'bg-green-100 text-green-600',
      action: () => onNavigate?.('/schedule'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      color: 'bg-red-100 text-red-600',
      action: () => onNavigate?.('/notifications'),
    },
  ];

  const instructorQuickLinks: QuickLink[] = [
    {
      icon: BookOpen,
      label: 'My Courses',
      color: 'bg-blue-100 text-blue-600',
      action: () => onNavigate?.('/courses'),
    },
    {
      icon: Users,
      label: 'Roster',
      color: 'bg-purple-100 text-purple-600',
      action: () => onNavigate?.('/roster'),
    },
    {
      icon: GraduationCap,
      label: 'Grades',
      color: 'bg-amber-100 text-amber-600',
      action: () => onNavigate?.('/grades'),
    },
    {
      icon: Calendar,
      label: 'Schedule',
      color: 'bg-green-100 text-green-600',
      action: () => onNavigate?.('/schedule'),
    },
  ];

  const quickLinks =
    customQuickLinks || (userRole === 'instructor' ? instructorQuickLinks : defaultQuickLinks);

  // Focus effect when opened via shortcut
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      // Don't clear query immediately so it doesn't flicker on close
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Keyboard navigation within the dropdown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));

      // Auto-scroll
      if (resultsRef.current && selectedIndex >= 0) {
        const itemArray = Array.from(resultsRef.current.querySelectorAll('.search-result-item'));
        const nextItem = itemArray[Math.min(selectedIndex + 1, results.length - 1)] as HTMLElement;
        if (nextItem) {
          nextItem.scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));

      // Auto-scroll
      if (resultsRef.current && selectedIndex > 0) {
        const itemArray = Array.from(resultsRef.current.querySelectorAll('.search-result-item'));
        const nextItem = itemArray[Math.max(selectedIndex - 1, 0)] as HTMLElement;
        if (nextItem) {
          nextItem.scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results.length > 0) {
      e.preventDefault();
      const selectedResult = results[selectedIndex];
      if (selectedResult?.url) {
        onNavigate?.(selectedResult.url);
        setIsOpen(false);
      }
    } else if (e.key === 'Enter' && query.trim() !== '') {
      // Option to trigger a full search page if no selection and enter pressed
    }
  };

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      setSelectedIndex(-1);

      const searchData = async () => {
        if (onSearch) {
          const searchResults = await onSearch(query);
          const filtered = searchResults.filter(
            (result) => selectedFilter === 'all' || result.type === selectedFilter
          );
          setResults(filtered);
        } else {
          const mockData = customResults || defaultMockResults;
          const filtered = mockData.filter((result) => {
            const matchesQuery =
              result.title.toLowerCase().includes(query.toLowerCase()) ||
              result.description.toLowerCase().includes(query.toLowerCase()) ||
              (result.highlight && result.highlight.toLowerCase().includes(query.toLowerCase()));
            const matchesFilter = selectedFilter === 'all' || result.type === selectedFilter;
            return matchesQuery && matchesFilter;
          });
          setResults(filtered);
        }
        setIsSearching(false);
      };

      const timer = setTimeout(searchData, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, selectedFilter, customResults, onSearch]);

  const getIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      course: BookOpen,
      assignment: FileText,
      file: Folder,
      announcement: Bell,
      user: User,
      student: GraduationCap,
      event: Calendar,
    };
    return icons[type] || Search;
  };

  const getIconColor = (type: string) => {
    const colors: Record<string, string> = {
      course: 'bg-blue-100 text-blue-600',
      assignment: 'bg-amber-100 text-amber-600',
      file: 'bg-purple-100 text-purple-600',
      announcement: 'bg-red-100 text-red-600',
      user: 'bg-green-100 text-green-600',
      student: 'bg-indigo-100 text-indigo-600',
      event: 'bg-pink-100 text-pink-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full max-w-xl" ref={containerRef}>
      {/* Search Input Bar */}
      <div
        className={`group flex items-center justify-between rounded-xl px-4 py-2 w-full transition-colors border ${
          isDark
            ? 'bg-transparent border-white/10 hover:border-white/20 focus-within:bg-white/5 focus-within:border-white/20 text-slate-300'
            : 'bg-slate-50 border-slate-200 hover:border-slate-300 focus-within:bg-white focus-within:border-slate-300 text-slate-700'
        }`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <Search
            className={`w-4 h-4 transition-colors ${isOpen ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full font-medium ${isDark ? 'text-white placeholder:text-gray-400' : 'text-slate-800 placeholder:text-gray-500'}`}
          />
        </div>

        {!query && (
          <kbd
            className={`hidden md:inline-flex items-center justify-center h-5 px-1.5 text-[10px] sm:text-xs font-semibold rounded border ${
              isDark
                ? 'bg-white/10 border-white/5 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            ⌘K
          </kbd>
        )}

        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className={`p-0.5 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Floating Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-[#1E293B] border border-white/10' : 'bg-white border border-slate-200'
          }`}
        >
          {/* Filters */}
          <div
            className={`px-3 py-3 border-b overflow-x-auto flex gap-2 no-scrollbar ${isDark ? 'border-white/10' : 'border-slate-100'}`}
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : isDark
                      ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="p-4">
                {/* Quick Links */}
                <div className="mb-6">
                  <h3
                    className={`text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickLinks.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          link.action();
                          setIsOpen(false);
                        }}
                        className={`flex flex-col items-center gap-2 p-3 border rounded-xl transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}
                        >
                          <link.icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[11px] font-medium text-center leading-tight ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        >
                          {link.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <h3
                    className={`text-xs font-semibold mb-2 flex items-center gap-2 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {defaultRecentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(search.query);
                          inputRef.current?.focus();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock
                            className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          />
                          <span
                            className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                          >
                            {search.query}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          {search.timestamp}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isSearching ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Searching...
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                <p
                  className={`text-xs px-2 py-1 mb-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  {results.length} results found
                </p>
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const Icon = getIcon(result.type);
                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          if (result.url) {
                            onNavigate?.(result.url);
                            setIsOpen(false);
                          }
                        }}
                        className={`search-result-item w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left group ${
                          index === selectedIndex
                            ? isDark
                              ? 'bg-indigo-500/20 border border-indigo-500/30'
                              : 'bg-indigo-50 border border-indigo-200'
                            : isDark
                              ? 'hover:bg-white/5 border border-transparent'
                              : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(result.type)}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {highlightMatch(result.title, query)}
                          </p>
                          <p
                            className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {highlightMatch(result.description, query)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {result.meta}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <Search
                  className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                />
                <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  No results found
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Try a different search term or check spelling.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
