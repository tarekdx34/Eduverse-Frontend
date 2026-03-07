import { useState, useMemo } from 'react';
import {
  Bell,
  Search,
  CheckCheck,
  FileText,
  CheckSquare,
  MessageCircle,
  Clock,
  AlertTriangle,
  Settings,
  AlertCircle,
  BarChart3,
  MessagesSquare,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  X,
  Inbox,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'submission' | 'grading' | 'message' | 'deadline' | 'attendance' | 'system';
  timestamp: string;
  read: boolean;
  student: string | null;
  course: string | null;
  icon: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Assignment Submission',
    message: 'Ahmed Hassan submitted Assignment 3 for CS201',
    type: 'submission',
    timestamp: '5 minutes ago',
    read: false,
    student: 'Ahmed Hassan',
    course: 'CS201',
    icon: 'FileText',
  },
  {
    id: 2,
    title: 'Grading Reminder',
    message: '12 pending submissions need grading for CS301',
    type: 'grading',
    timestamp: '1 hour ago',
    read: false,
    student: null,
    course: 'CS301',
    icon: 'CheckSquare',
  },
  {
    id: 3,
    title: 'New Message',
    message: 'Sara Ali sent you a message about the midterm exam',
    type: 'message',
    timestamp: '2 hours ago',
    read: true,
    student: 'Sara Ali',
    course: null,
    icon: 'MessageCircle',
  },
  {
    id: 4,
    title: 'Assignment Deadline Tomorrow',
    message: 'Assignment 4 for CS201 is due tomorrow at 11:59 PM',
    type: 'deadline',
    timestamp: '5 hours ago',
    read: false,
    student: null,
    course: 'CS201',
    icon: 'Clock',
  },
  {
    id: 5,
    title: 'Low Attendance Alert',
    message: '5 students in CS401 have attendance below 75%',
    type: 'attendance',
    timestamp: '1 day ago',
    read: true,
    student: null,
    course: 'CS401',
    icon: 'AlertTriangle',
  },
  {
    id: 6,
    title: 'System Update',
    message: "New grading features are now available. Check what's new!",
    type: 'system',
    timestamp: '2 days ago',
    read: true,
    student: null,
    course: null,
    icon: 'Settings',
  },
  {
    id: 7,
    title: 'Late Submission',
    message: 'Omar Khaled submitted Assignment 2 for CS201 (2 days late)',
    type: 'submission',
    timestamp: '1 day ago',
    read: false,
    student: 'Omar Khaled',
    course: 'CS201',
    icon: 'AlertCircle',
  },
  {
    id: 8,
    title: 'Quiz Results Published',
    message: 'Quiz 2 results for CS101 have been published',
    type: 'grading',
    timestamp: '3 days ago',
    read: true,
    student: null,
    course: 'CS101',
    icon: 'BarChart3',
  },
  {
    id: 9,
    title: 'New Discussion Post',
    message: 'Fatma Ali posted in CS201 discussion forum',
    type: 'message',
    timestamp: '4 days ago',
    read: true,
    student: 'Fatma Ali',
    course: 'CS201',
    icon: 'MessagesSquare',
  },
  {
    id: 10,
    title: 'Upcoming Deadline',
    message: 'Final Project for CS301 is due in 3 days',
    type: 'deadline',
    timestamp: '12 hours ago',
    read: false,
    student: null,
    course: 'CS301',
    icon: 'Calendar',
  },
];

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  CheckSquare,
  MessageCircle,
  Clock,
  AlertTriangle,
  Settings,
  AlertCircle,
  BarChart3,
  MessagesSquare,
  Calendar,
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  submission: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500',
  },
  grading: {
    bg: 'bg-indigo-100 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500',
  },
  message: {
    bg: 'bg-green-100 dark:bg-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500',
  },
  deadline: {
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500',
  },
  attendance: {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500',
  },
  system: {
    bg: 'bg-gray-100 dark:bg-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500',
  },
};

const categoryFilters = [
  { key: 'all', label: 'All' },
  { key: 'submission', label: 'Submissions' },
  { key: 'grading', label: 'Grading' },
  { key: 'message', label: 'Messages' },
  { key: 'deadline', label: 'Deadlines' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'system', label: 'System' },
];

type Tab = 'all' | 'unread' | 'read';

export function NotificationsPage() {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { isRTL } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (activeTab === 'unread') result = result.filter((n) => !n.read);
    if (activeTab === 'read') result = result.filter((n) => n.read);
    if (categoryFilter !== 'all') result = result.filter((n) => n.type === categoryFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.student && n.student.toLowerCase().includes(q)) ||
          (n.course && n.course.toLowerCase().includes(q))
      );
    }

    return result;
  }, [notifications, activeTab, categoryFilter, searchQuery]);

  const tabCounts = useMemo(
    () => ({
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      read: notifications.filter((n) => n.read).length,
    }),
    [notifications]
  );

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      submissions: notifications.filter((n) => n.type === 'submission').length,
      deadlines: notifications.filter((n) => n.type === 'deadline').length,
    }),
    [notifications]
  );

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderIcon = (iconName: string, className?: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const renderEmptyState = () => {
    let message = 'No notifications found';
    let description = 'You have no notifications at this time.';

    if (searchQuery.trim()) {
      message = 'No results found';
      description = `No notifications match "${searchQuery}".`;
    } else if (activeTab === 'unread') {
      message = 'All caught up!';
      description = 'You have no unread notifications.';
    } else if (activeTab === 'read') {
      message = 'No read notifications';
      description = "You haven't read any notifications yet.";
    } else if (categoryFilter !== 'all') {
      message = 'No notifications';
      description = `No ${categoryFilter} notifications found.`;
    }

    return (
      <div
        className={`flex flex-col items-center justify-center py-16 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
        >
          <Inbox className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {message}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>
    );
  };

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'Unread',
      value: stats.unread,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
    },
    {
      label: 'Submissions',
      value: stats.submissions,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Deadlines',
      value: stats.deadlines,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-medium align-middle" style={{ color: primaryHex }}>
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Stay up to date with student submissions, deadlines, and course activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-white/10 hover:bg-white/10 text-gray-300'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            } ${showSearch ? (isDark ? 'bg-white/10' : 'bg-gray-100') : ''}`}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              unreadCount === 0
                ? isDark
                  ? 'border-white/5 text-gray-600 cursor-not-allowed'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div
          className={`relative rounded-xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <div className="flex items-center px-4">
            <Search
              className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-3 py-3 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex gap-6">
          {(['all', 'unread', 'read'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? 'border-current'
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} border-transparent`
              }`}
              style={activeTab === tab ? { color: primaryHex, borderColor: primaryHex } : undefined}
            >
              {tab}
              <span
                className={`${isRTL ? 'mr-1.5' : 'ml-1.5'} text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                    : isDark
                      ? 'bg-white/10 text-gray-400'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat.key
                ? 'text-white'
                : isDark
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={categoryFilter === cat.key ? { backgroundColor: primaryHex } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const colors = typeColors[notification.type];
            return (
              <div
                key={notification.id}
                className={`group relative rounded-xl border overflow-hidden transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                    : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
                } ${!notification.read ? (isDark ? 'border-l-[3px]' : 'border-l-[3px]') : ''}`}
                style={
                  !notification.read
                    ? { borderLeftColor: colors.border.replace('border-', '').replace('-500', '') }
                    : undefined
                }
              >
                {/* Unread left bar via CSS class */}
                {!notification.read && (
                  <div
                    className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-[3px] ${colors.border.replace('border', 'bg')}`}
                  />
                )}

                <div
                  className={`flex items-start gap-4 p-4 ${!notification.read && !isRTL ? 'pl-5' : ''} ${!notification.read && isRTL ? 'pr-5' : ''}`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}
                  >
                    {renderIcon(notification.icon, `w-5 h-5 ${colors.text}`)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {notification.course && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md font-medium ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}
                            >
                              {notification.course}
                            </span>
                          )}
                          {notification.student && (
                            <span
                              className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              • {notification.student}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timestamp & Actions */}
                      <div
                        className={`flex items-center gap-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <span
                          className={`text-xs whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          {notification.timestamp}
                        </span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleRead(notification.id)}
                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                          >
                            {notification.read ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            title="Delete notification"
                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
