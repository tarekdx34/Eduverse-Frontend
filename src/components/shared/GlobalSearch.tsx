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
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url: string) => void;
  userRole?: 'student' | 'instructor' | 'admin';
  customResults?: SearchResult[];
  customQuickLinks?: QuickLink[];
  onSearch?: (query: string) => Promise<SearchResult[]>;
}

const defaultMockResults: SearchResult[] = [
  { id: 'c1', type: 'course', title: 'Database Management Systems', description: 'CS220 - Dr. James Wilson', meta: 'Course', highlight: 'database' },
  { id: 'c2', type: 'course', title: 'Data Structures & Algorithms', description: 'CS201 - Prof. Michael Chen', meta: 'Course', highlight: 'data' },
  { id: 'a1', type: 'assignment', title: 'Database Design Project', description: 'CS220 - Due Dec 10, 2025', meta: 'Assignment', highlight: 'database' },
  { id: 'a2', type: 'assignment', title: 'Algorithm Analysis Report', description: 'CS201 - Due Dec 6, 2025', meta: 'Assignment', highlight: 'algorithm' },
  { id: 'f1', type: 'file', title: 'Lecture 8 - SQL Joins.pdf', description: 'CS220 - Database Management', meta: 'File', highlight: 'sql' },
  { id: 'f2', type: 'file', title: 'Algorithm Complexity Notes.pdf', description: 'CS201 - Data Structures', meta: 'File', highlight: 'algorithm' },
  { id: 'n1', type: 'announcement', title: 'Midterm Exam Schedule Released', description: 'Posted by Academic Office', meta: 'Announcement' },
  { id: 'u1', type: 'user', title: 'Dr. Sarah Johnson', description: 'Instructor - Computer Science', meta: 'Instructor' },
  { id: 's1', type: 'student', title: 'John Smith', description: 'CS220, CS201 - GPA: 3.5', meta: 'Student' },
  { id: 'e1', type: 'event', title: 'CS Department Seminar', description: 'Dec 12, 2025 - Room 401', meta: 'Event' },
];

const defaultRecentSearches: RecentSearch[] = [
  { query: 'database project', timestamp: '2 hours ago' },
  { query: 'algorithm complexity', timestamp: '5 hours ago' },
  { query: 'Dr. Sarah Johnson', timestamp: 'Yesterday' },
];

export function GlobalSearch({
  isOpen,
  onClose,
  onNavigate,
  userRole = 'student',
  customResults,
  customQuickLinks,
  onSearch,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
    { icon: BookOpen, label: 'My Courses', color: 'bg-blue-100 text-blue-600', action: () => onNavigate?.('/courses') },
    { icon: FileText, label: 'Assignments', color: 'bg-amber-100 text-amber-600', action: () => onNavigate?.('/assignments') },
    { icon: Calendar, label: 'Schedule', color: 'bg-green-100 text-green-600', action: () => onNavigate?.('/schedule') },
    { icon: Bell, label: 'Notifications', color: 'bg-red-100 text-red-600', action: () => onNavigate?.('/notifications') },
  ];

  const instructorQuickLinks: QuickLink[] = [
    { icon: BookOpen, label: 'My Courses', color: 'bg-blue-100 text-blue-600', action: () => onNavigate?.('/courses') },
    { icon: Users, label: 'Roster', color: 'bg-purple-100 text-purple-600', action: () => onNavigate?.('/roster') },
    { icon: GraduationCap, label: 'Grades', color: 'bg-amber-100 text-amber-600', action: () => onNavigate?.('/grades') },
    { icon: Calendar, label: 'Schedule', color: 'bg-green-100 text-green-600', action: () => onNavigate?.('/schedule') },
  ];

  const quickLinks = customQuickLinks || (userRole === 'instructor' ? instructorQuickLinks : defaultQuickLinks);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selectedResult = results[selectedIndex];
        if (selectedResult?.url) {
          onNavigate?.(selectedResult.url);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, onNavigate]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />

      {/* Search Modal */}
      <div className="relative max-w-3xl mx-auto mt-20 rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/30">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, assignments, files, users..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-4">
              {/* Quick Links */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  Quick Links
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {quickLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={link.action}
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}>
                        <link.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-600">
                  <History className="w-4 h-4" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {defaultRecentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(search.query)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{search.query}</span>
                      </div>
                      <span className="text-xs text-gray-400">{search.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              <p className="text-sm mb-3 text-gray-600">{results.length} results found</p>
              <div className="space-y-2">
                {results.map((result, index) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        if (result.url) {
                          onNavigate?.(result.url);
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group ${
                        index === selectedIndex ? 'bg-indigo-50 border-2 border-indigo-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(result.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-900">
                          {highlightMatch(result.title, query)}
                        </p>
                        <p className="text-sm truncate text-gray-600">
                          {highlightMatch(result.description, query)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          {result.meta}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No results found</p>
              <p className="text-sm mt-1 text-gray-500">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/20 bg-white/50 backdrop-blur-sm flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">Esc</kbd>
              Close
            </span>
          </div>
          <span>Press Ctrl+K to search</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
