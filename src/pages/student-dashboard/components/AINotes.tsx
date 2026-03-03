import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Sparkles,
  FileText,
  Clock,
  BookOpen,
  Target,
  Search,
  Heart,
  MoreVertical,
  X,
  FileUp,
  Video,
  Globe,
  Mic,
  ChevronDown,
  Trash2,
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  course: string;
  category: string;
  preview: string;
  date: string;
  studyTime: string;
  flashcards: number;
  bookmarked: boolean;
  color: string;
}

const initialNotes: Note[] = [
  {
    id: 1,
    title: 'Data Structures Overview',
    course: 'CS201',
    category: 'Data Structures',
    preview:
      'Comprehensive notes covering arrays, linked lists, trees, and graphs with complexity analysis...',
    date: 'Feb 20, 2026',
    studyTime: '2.5h',
    flashcards: 15,
    bookmarked: true,
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'Database Normalization',
    course: 'CS220',
    category: 'Databases',
    preview:
      'Detailed breakdown of 1NF, 2NF, 3NF, and BCNF with practical examples and exercises...',
    date: 'Feb 18, 2026',
    studyTime: '1.8h',
    flashcards: 10,
    bookmarked: false,
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Software Design Patterns',
    course: 'CS305',
    category: 'Software Engineering',
    preview: 'Notes on Singleton, Factory, Observer, and Strategy patterns with code examples...',
    date: 'Feb 15, 2026',
    studyTime: '3.0h',
    flashcards: 20,
    bookmarked: true,
    color: '#8B5CF6',
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    course: 'CS410',
    category: 'Machine Learning',
    preview: 'Introduction to supervised and unsupervised learning, regression, classification...',
    date: 'Feb 12, 2026',
    studyTime: '4.2h',
    flashcards: 25,
    bookmarked: false,
    color: '#F59E0B',
  },
  {
    id: 5,
    title: 'Operating Systems Concepts',
    course: 'CS310',
    category: 'Operating Systems',
    preview: 'Process management, memory management, file systems, and I/O systems...',
    date: 'Feb 10, 2026',
    studyTime: '2.0h',
    flashcards: 12,
    bookmarked: false,
    color: '#EF4444',
  },
  {
    id: 6,
    title: 'Web Development Frameworks',
    course: 'CS150',
    category: 'Web Development',
    preview:
      'Comparison of React, Angular, and Vue with architecture patterns and best practices...',
    date: 'Feb 8, 2026',
    studyTime: '1.5h',
    flashcards: 8,
    bookmarked: true,
    color: '#06B6D4',
  },
  {
    id: 7,
    title: 'Network Protocols',
    course: 'CS301',
    category: 'Computer Networks',
    preview: 'TCP/IP, HTTP, DNS, and other network protocols with packet analysis...',
    date: 'Feb 5, 2026',
    studyTime: '2.8h',
    flashcards: 18,
    bookmarked: false,
    color: '#8B5CF6',
  },
  {
    id: 8,
    title: 'Algorithm Complexity',
    course: 'CS250',
    category: 'Algorithms',
    preview: 'Big O notation, time and space complexity analysis for common algorithms...',
    date: 'Feb 2, 2026',
    studyTime: '3.5h',
    flashcards: 22,
    bookmarked: false,
    color: '#EC4899',
  },
];

const filters = [
  { key: 'all', label: 'All' },
  { key: 'bookmarked', label: 'Bookmarked' },
  { key: 'recent', label: 'Recent' },
  { key: 'category', label: 'By Category' },
] as const;

const sortOptions = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'A-Z' },
  { key: 'most-studied', label: 'Most Studied' },
] as const;

type FilterKey = (typeof filters)[number]['key'];
type SortKey = (typeof sortOptions)[number]['key'];

export const AINotes = () => {
  const { language } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const isRTL = language === 'ar';

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleBookmark = (id: number) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n)));
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setOpenMenuId(null);
  };

  const filteredNotes = notes
    .filter((note) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !note.title.toLowerCase().includes(q) &&
          !note.category.toLowerCase().includes(q) &&
          !note.course.toLowerCase().includes(q)
        )
          return false;
      }
      if (activeFilter === 'bookmarked') return note.bookmarked;
      if (activeFilter === 'recent') {
        const recentIds = [...notes]
          .sort((a, b) => b.id - a.id)
          .slice(0, 4)
          .map((n) => n.id);
        return recentIds.includes(note.id);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'most-studied') return parseFloat(b.studyTime) - parseFloat(a.studyTime);
      return b.id - a.id;
    });

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: FileText, color: accentColor },
    { label: 'Study Time', value: '48h', icon: Clock, color: '#3B82F6' },
    { label: 'Topics Covered', value: 12, icon: BookOpen, color: '#10B981' },
    { label: 'Completion', value: '78%', icon: Target, color: '#F59E0B' },
  ];

  const sources = [
    { icon: FileUp, title: 'Upload Document', desc: 'PDF, Word, images', color: '#3B82F6' },
    { icon: Video, title: 'From Video', desc: 'YouTube, Vimeo links', color: '#EF4444' },
    { icon: Globe, title: 'From URL', desc: 'Any web page', color: '#10B981' },
    { icon: Mic, title: 'From Audio', desc: 'MP3, voice recordings', color: accentColor },
  ];

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            <Sparkles className="w-6 h-6 text-[var(--accent-color)]" />
            AI Notes
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Your Smart Study Companion
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Generate Notes
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div
        className={`rounded-[2.5rem] p-4 mb-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-[var(--accent-color)]/50'
                  : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[var(--accent-color)]/50'
              }`}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f.key
                    ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20'
                    : isDark
                      ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {sortOptions.find((s) => s.key === sortBy)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortDropdown && (
              <div
                className={`absolute right-0 top-full mt-1 w-36 rounded-lg shadow-lg z-20 overflow-hidden ${
                  isDark
                    ? 'bg-slate-800 border border-white/10'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {sortOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setSortBy(s.key);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      sortBy === s.key
                        ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5'
                          : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-[2.5rem] p-5 hover:shadow-lg transition-all ${
                isDark ? 'bg-card-dark border border-white/5' : 'glass'
              }`}
            >
              {/* Category Badge & Actions */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: note.color }}
                >
                  {note.course} · {note.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleBookmark(note.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${note.bookmarked ? 'fill-red-500 text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === note.id && (
                      <div
                        className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg z-20 overflow-hidden ${
                          isDark
                            ? 'bg-slate-800 border border-white/10'
                            : 'bg-white border border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => deleteNote(note.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors ${
                            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {note.title}
              </h3>

              {/* Preview */}
              <p
                className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {note.preview}
              </p>

              {/* Metadata */}
              <div
                className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {note.date}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {note.studyTime}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {note.flashcards} cards
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center ${
            isDark ? 'bg-card-dark border border-white/5' : 'glass'
          }`}
        >
          <FileText className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No notes found
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Try adjusting your filters or create new notes
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-[2.5rem] p-6 ${
              isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Generate New Notes
                </h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Choose a source to generate AI notes from
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sources.map((src) => (
                <button
                  key={src.title}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl text-center transition-all hover:scale-[1.02] ${
                    isDark
                      ? 'bg-white/5 border border-white/10 hover:border-white/20'
                      : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${src.color}20` }}
                  >
                    <src.icon className="w-6 h-6" style={{ color: src.color }} />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {src.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {src.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
