import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  ChevronRight,
  Filter,
  History,
  TrendingUp,
  Star,
  Folder,
  Bell
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'course' | 'assignment' | 'file' | 'announcement' | 'user' | 'event';
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

const mockResults: SearchResult[] = [
  // Courses
  { id: 'c1', type: 'course', title: 'Database Management Systems', description: 'CS220 - Dr. James Wilson', meta: 'Course', highlight: 'database' },
  { id: 'c2', type: 'course', title: 'Data Structures & Algorithms', description: 'CS201 - Prof. Michael Chen', meta: 'Course', highlight: 'data' },
  { id: 'c3', type: 'course', title: 'Web Development Fundamentals', description: 'CS150 - Dr. Sarah Johnson', meta: 'Course' },
  
  // Assignments
  { id: 'a1', type: 'assignment', title: 'Database Design Project', description: 'CS220 - Due Dec 10, 2025', meta: 'Assignment', highlight: 'database' },
  { id: 'a2', type: 'assignment', title: 'Algorithm Analysis Report', description: 'CS201 - Due Dec 6, 2025', meta: 'Assignment', highlight: 'algorithm' },
  { id: 'a3', type: 'assignment', title: 'Mobile App Prototype', description: 'CS350 - Due Dec 8, 2025', meta: 'Assignment' },
  
  // Files
  { id: 'f1', type: 'file', title: 'Lecture 8 - SQL Joins.pdf', description: 'CS220 - Database Management', meta: 'File', highlight: 'sql' },
  { id: 'f2', type: 'file', title: 'Algorithm Complexity Notes.pdf', description: 'CS201 - Data Structures', meta: 'File', highlight: 'algorithm' },
  { id: 'f3', type: 'file', title: 'React Native Setup Guide.pdf', description: 'CS350 - Mobile Development', meta: 'File' },
  
  // Announcements
  { id: 'n1', type: 'announcement', title: 'Midterm Exam Schedule Released', description: 'Posted by Academic Office', meta: 'Announcement' },
  { id: 'n2', type: 'announcement', title: 'Lab 8 Instructions Updated', description: 'CS220 - Dr. James Wilson', meta: 'Announcement', highlight: 'lab' },
  
  // Users
  { id: 'u1', type: 'user', title: 'Dr. Sarah Johnson', description: 'Instructor - Computer Science', meta: 'Instructor' },
  { id: 'u2', type: 'user', title: 'Prof. Michael Chen', description: 'Instructor - Computer Science', meta: 'Instructor' },
  { id: 'u3', type: 'user', title: 'Ahmed Hassan', description: 'Student - Computer Science', meta: 'Student' },
  
  // Events
  { id: 'e1', type: 'event', title: 'CS Department Seminar', description: 'Dec 12, 2025 - Room 401', meta: 'Event' },
  { id: 'e2', type: 'event', title: 'Career Fair 2025', description: 'Dec 18, 2025 - Main Hall', meta: 'Event' },
];

const recentSearches: RecentSearch[] = [
  { query: 'database project', timestamp: '2 hours ago' },
  { query: 'algorithm complexity', timestamp: '5 hours ago' },
  { query: 'Dr. Sarah Johnson', timestamp: 'Yesterday' },
  { query: 'mobile app assignment', timestamp: '2 days ago' },
];

const quickLinks = [
  { icon: BookOpen, label: 'My Courses', color: 'bg-blue-100 text-blue-600' },
  { icon: FileText, label: 'Assignments', color: 'bg-amber-100 text-amber-600' },
  { icon: Calendar, label: 'Schedule', color: 'bg-green-100 text-green-600' },
  { icon: Bell, label: 'Notifications', color: 'bg-red-100 text-red-600' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(result => {
          const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                              result.description.toLowerCase().includes(query.toLowerCase()) ||
                              (result.highlight && result.highlight.toLowerCase().includes(query.toLowerCase()));
          const matchesFilter = selectedFilter === 'all' || result.type === selectedFilter;
          return matchesQuery && matchesFilter;
        });
        setResults(filtered);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, selectedFilter]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      case 'file':
        return <Folder className="w-5 h-5" />;
      case 'announcement':
        return <Bell className="w-5 h-5" />;
      case 'user':
        return <User className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-600';
      case 'assignment':
        return 'bg-amber-100 text-amber-600';
      case 'file':
        return 'bg-purple-100 text-purple-600';
      case 'announcement':
        return 'bg-red-100 text-red-600';
      case 'user':
        return 'bg-green-100 text-green-600';
      case 'event':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark> : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative max-w-3xl mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'course', label: 'Courses' },
              { id: 'assignment', label: 'Assignments' },
              { id: 'file', label: 'Files' },
              { id: 'announcement', label: 'Announcements' },
              { id: 'user', label: 'Users' },
              { id: 'event', label: 'Events' },
            ].map((filter) => (
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
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            /* Default State - Recent & Quick Links */
            <div className="p-4">
              {/* Quick Links */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Quick Links
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {quickLinks.map((link, idx) => (
                    <button
                      key={idx}
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
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, idx) => (
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
            /* Loading State */
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            /* Results */
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">{results.length} results found</p>
              <div className="space-y-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(result.type)}`}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {highlightMatch(result.title, query)}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {highlightMatch(result.description, query)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {result.meta}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* No Results */
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No results found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Esc</kbd>
              Close
            </span>
          </div>
          <span>Powered by EduVerse Search</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
