import React, { useState } from 'react';
import {
  Bell,
  MessageCircle,
  FileText,
  AlertTriangle,
  Brain,
  Settings,
  Search,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationService } from '../../../services/api/notificationService';
import { toast } from 'sonner';

type NotificationType =
  | 'question'
  | 'submission'
  | 'plagiarism'
  | 'ai_alert'
  | 'system'
  | 'deadline';

type Notification = {
  id: string;
  title: string;
  sender: string;
  preview: string;
  fullMessage: string;
  time: string;
  type: NotificationType;
  badge: string;
  read: boolean;
  replies?: number;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Question in Lab 3 Thread',
    sender: 'Ahmed Hassan',
    preview: 'About process synchronization',
    fullMessage:
      "Hi, I have a question about process synchronization in Lab 3. Specifically, I'm confused about how semaphores work in the producer-consumer problem. Could you explain the difference between binary and counting semaphores?",
    time: '5 mins ago',
    type: 'question',
    badge: 'Lab 3',
    read: false,
    replies: 3,
  },
  {
    id: 'n2',
    title: 'New Lab Submission',
    sender: 'Sara Johnson',
    preview: 'Lab assignment submitted',
    fullMessage:
      'Sara Johnson has submitted her Lab 3 assignment. The submission includes all required files and was submitted before the deadline. Please review and grade at your earliest convenience.',
    time: '15 mins ago',
    type: 'submission',
    badge: 'Lab 3',
    read: false,
  },
  {
    id: 'n3',
    title: 'Plagiarism Check Request',
    sender: 'Dr. Michael Chen',
    preview: 'Check plagiarism report',
    fullMessage:
      'Please review the plagiarism report for Assignment 2. The automated system flagged two submissions with a similarity score above 85%. Check the detailed report and provide your assessment before the grades are finalized.',
    time: '1 hour ago',
    type: 'plagiarism',
    badge: 'Assignment 2',
    read: true,
  },
  {
    id: 'n4',
    title: 'Students Needing Support',
    sender: 'CampusOne AI',
    preview: '2 struggling students in Lab 4',
    fullMessage:
      'AI analysis has identified 2 students who may need additional support in Lab 4. Their recent quiz scores and lab completion rates suggest they are falling behind. Consider reaching out to offer extra office hours or tutoring sessions.',
    time: '2 hours ago',
    type: 'ai_alert',
    badge: 'Lab 4',
    read: false,
  },
  {
    id: 'n5',
    title: 'System Maintenance',
    sender: 'CampusOne System',
    preview: 'Update scheduled 2 AM tonight',
    fullMessage:
      'Scheduled system maintenance will occur tonight at 2:00 AM. The platform will be unavailable for approximately 30 minutes. All submissions and grades will be preserved. No action is required on your part.',
    time: '3 hours ago',
    type: 'system',
    badge: 'System',
    read: true,
  },
  {
    id: 'n6',
    title: 'Lab Deadline Extension?',
    sender: 'Emily Rodriguez',
    preview: 'Asked about extending deadline',
    fullMessage:
      "Hi, I was wondering if it would be possible to get a deadline extension for Lab 3. I've been dealing with some personal issues and haven't been able to complete the assignment on time. I would really appreciate even a 2-day extension.",
    time: '5 hours ago',
    type: 'deadline',
    badge: 'Lab 3',
    read: true,
    replies: 2,
  },
];

type FilterKey = 'all' | 'students' | 'instructors' | 'ai' | 'system';

const FILTER_MAP: Record<FilterKey, NotificationType[]> = {
  all: ['question', 'submission', 'plagiarism', 'ai_alert', 'system', 'deadline'],
  students: ['question', 'submission', 'deadline'],
  instructors: ['plagiarism'],
  ai: ['ai_alert'],
  system: ['system'],
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'students', label: 'Students' },
  { key: 'instructors', label: 'Instructors' },
  { key: 'ai', label: 'AI Alerts' },
  { key: 'system', label: 'System' },
];

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'question':
      return <MessageCircle className="w-5 h-5" />;
    case 'submission':
      return <FileText className="w-5 h-5" />;
    case 'plagiarism':
      return <AlertTriangle className="w-5 h-5" />;
    case 'ai_alert':
      return <Brain className="w-5 h-5" />;
    case 'system':
      return <Settings className="w-5 h-5" />;
    case 'deadline':
      return <Bell className="w-5 h-5" />;
  }
}

function getTypeColor(type: NotificationType, isDark: boolean) {
  switch (type) {
    case 'question':
      return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600';
    case 'submission':
      return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600';
    case 'plagiarism':
      return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600';
    case 'ai_alert':
      return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600';
    case 'system':
      return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600';
    case 'deadline':
      return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600';
  }
}

export function NotificationsPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    const matchesFilter = FILTER_MAP[activeFilter].includes(n.type);
    const matchesSearch =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMarkAllRead = async () => {
    const prev = notifications;
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    try {
      await NotificationService.markAllAsRead();
    } catch {
      toast.error('Failed to mark all as read');
      setNotifications(prev);
    }
  };

  const handleClearRead = async () => {
    const prev = notifications;
    setNotifications((p) => p.filter((n) => !n.read));
    try {
      const result = await NotificationService.clearRead();
      if (result.affected > 0) {
        toast.success(`Cleared ${result.affected} read notification${result.affected !== 1 ? 's' : ''}`);
      }
    } catch {
      toast.error('Failed to clear read notifications');
      setNotifications(prev);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filtered.map((n) => n.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleMarkSelectedRead = () => {
    setNotifications((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n)));
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleMarkAllRead}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Mark All Read
          </button>
          <button
            onClick={handleClearRead}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <Trash2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Clear Read
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
        />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
          } outline-none`}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                    : 'bg-blue-50 text-blue-600 border-blue-500'
                  : isDark
                    ? 'bg-white/5 text-slate-400 border-white/10'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <div
          className={`flex flex-wrap items-center gap-3 border rounded-lg p-3 ${
            isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            {selectedIds.size} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSelectAll}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Deselect All
            </button>
            <button
              onClick={handleMarkSelectedRead}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Mark as Read
            </button>
            <button
              onClick={handleDeleteSelected}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Trash2 className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div
            className={`text-center py-12 border rounded-lg ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <Bell
              className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
            />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No notifications found
            </p>
          </div>
        )}

        {filtered.map((notification) => {
          const isExpanded = expandedId === notification.id;
          const isSelected = selectedIds.has(notification.id);

          return (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 sm:p-6 transition-colors ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              } ${!notification.read ? (isDark ? 'border-l-blue-500 border-l-2' : 'border-l-blue-500 border-l-2') : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleSelect(notification.id)}
                  className={`mt-1 flex-shrink-0 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Type Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type, isDark)}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>
                  {!notification.read && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <h3
                        className={`text-sm truncate ${
                          !notification.read ? 'font-bold' : 'font-medium'
                        } ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {notification.sender}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {notification.badge}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                        className={`p-1 rounded transition-colors ${
                          isDark
                            ? 'hover:bg-white/10 text-slate-400'
                            : 'hover:bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {notification.preview}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {notification.time}
                    </span>
                    {notification.replies && (
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        · {notification.replies} replies
                      </span>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      className={`mt-4 p-4 rounded-lg text-sm ${
                        isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {notification.fullMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
