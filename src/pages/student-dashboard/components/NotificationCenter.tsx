import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Settings,
  Filter,
  Trash2,
  Check,
  BookOpen,
  Award,
  MessageSquare,
  TrendingDown,
  FileText,
  Users,
  Loader2,
} from 'lucide-react';
import { NotificationService } from '../../../services/api/notificationService';
import { announcementService, type Announcement } from '../../../services/api/announcementService';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type:
    | 'system'
    | 'assignment'
    | 'grade'
    | 'announcement'
    | 'enrollment'
    | 'deadline'
    | 'reminder'
    | 'achievement'
    | 'message'
    | 'warning';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  announcementType?: 'course' | 'campus' | 'system';
  isPublished?: number;
  authorName?: string;
  courseLabel?: string;
  viewCount?: number;
  source: 'notification' | 'announcement';
  rawCreatedAt?: string;
}

const formatDateTime = (value?: string) => {
  const date = new Date(value ?? Date.now());
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
};

const mapNotificationType = (value?: string): Notification['type'] => {
  if (value === 'system') return 'system';
  if (value === 'assignment') return 'assignment';
  if (value === 'grade') return 'grade';
  if (value === 'announcement') return 'announcement';
  if (value === 'enrollment') return 'enrollment';
  return 'system';
};

const mapAnnouncementToNotification = (announcement: Announcement): Notification => ({
  id: `announcement-${announcement.id}`,
  type: 'announcement',
  title: announcement.title,
  description: announcement.content,
  timestamp: formatDateTime(announcement.publishedAt ?? announcement.createdAt),
  read: true,
  priority: (announcement.priority as Notification['priority']) || 'medium',
  category: announcement.announcementType || 'course',
  announcementType:
    announcement.announcementType ||
    ((announcement as Announcement & { type?: 'course' | 'campus' | 'system' }).type ?? 'course'),
  isPublished: announcement.isPublished,
  authorName:
    `${announcement.author?.firstName ?? ''} ${announcement.author?.lastName ?? ''}`.trim() ||
    announcement.author?.email ||
    'System',
  courseLabel:
    announcement.course?.name || announcement.course?.code
      ? `${announcement.course?.name ?? ''}${announcement.course?.code ? ` (${announcement.course.code})` : ''}`.trim()
      : 'Campus-wide',
  viewCount: announcement.viewCount ?? 0,
  source: 'announcement',
  rawCreatedAt: announcement.publishedAt ?? announcement.createdAt,
});

interface NotificationCenterProps {
  refreshSignal?: number;
  externalUnreadCount?: number;
}

export function NotificationCenter({
  refreshSignal = 0,
  externalUnreadCount,
}: NotificationCenterProps = {}) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    deadlines: true,
    grades: true,
    announcements: true,
    messages: true,
    achievements: true,
    warnings: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: false,
  });

  const loadNotificationData = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse, announcementsResponse] = await Promise.all([
        NotificationService.getAll(),
        NotificationService.getUnreadCount(),
        announcementService.getAnnouncements(),
      ]);
      const mappedNotifications: Notification[] = (notificationsResponse || []).map((n) => ({
        id: String(n.id),
        type: mapNotificationType(n.notificationType),
        title: n.title,
        description: n.body,
        timestamp: formatDateTime(n.createdAt),
        read: n.isRead === 1,
        priority: (n.priority as Notification['priority']) || 'medium',
        category: n.notificationType || 'system',
        actionUrl: n.actionUrl || undefined,
        source: 'notification',
        rawCreatedAt: n.createdAt,
      }));

      const sortedAnnouncements = (
        Array.isArray(announcementsResponse) ? announcementsResponse : []
      )
        .slice()
        .sort((a, b) => {
          if ((a.isPinned ?? 0) === 1 && (b.isPinned ?? 0) !== 1) return -1;
          if ((a.isPinned ?? 0) !== 1 && (b.isPinned ?? 0) === 1) return 1;
          return (
            new Date(b.publishedAt ?? b.createdAt ?? 0).getTime() -
            new Date(a.publishedAt ?? a.createdAt ?? 0).getTime()
          );
        });

      const mappedAnnouncements: Notification[] = sortedAnnouncements.map(
        mapAnnouncementToNotification
      );

      setNotificationList([...mappedNotifications, ...mappedAnnouncements]);
      setUnreadCount(Number(unreadResponse?.count ?? 0));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotificationData();
  }, [loadNotificationData]);

  useEffect(() => {
    if (refreshSignal > 0) {
      void loadNotificationData();
    }
  }, [refreshSignal, loadNotificationData]);

  useEffect(() => {
    if (typeof externalUnreadCount === 'number') {
      setUnreadCount(externalUnreadCount);
    }
  }, [externalUnreadCount]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`rounded-xl border-2 p-4 animate-pulse ${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-100'}`}
          >
            <div className={`h-4 w-1/3 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className={`h-3 w-full mt-3 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className={`h-3 w-2/3 mt-2 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Clock className="w-5 h-5" />;
      case 'grade':
        return <FileText className="w-5 h-5" />;
      case 'announcement':
        return <Info className="w-5 h-5" />;
      case 'enrollment':
        return <Users className="w-5 h-5" />;
      case 'system':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent')
      return isDark
        ? 'bg-red-900/50 text-red-400 border-red-800'
        : 'bg-red-100 text-red-600 border-red-200';
    if (priority === 'high')
      return isDark
        ? 'bg-orange-900/50 text-orange-400 border-orange-800'
        : 'bg-orange-100 text-orange-600 border-orange-200';

    switch (type) {
      case 'deadline':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-800'
          : 'bg-red-100 text-red-600 border-red-200';
      case 'grade':
        return isDark
          ? 'bg-green-900/50 text-green-400 border-green-800'
          : 'bg-green-100 text-green-600 border-green-200';
      case 'announcement':
        return isDark
          ? 'bg-blue-900/50 text-blue-400 border-blue-800'
          : 'bg-blue-100 text-blue-600 border-blue-200';
      case 'assignment':
        return isDark
          ? 'bg-orange-900/50 text-orange-400 border-orange-800'
          : 'bg-orange-100 text-orange-600 border-orange-200';
      case 'enrollment':
        return isDark
          ? 'bg-purple-900/50 text-purple-300 border-purple-800'
          : 'bg-purple-100 text-purple-700 border-purple-200';
      case 'system':
        return isDark
          ? 'bg-gray-800 text-gray-300 border-gray-700'
          : 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return isDark
          ? 'bg-slate-800 text-slate-400 border-slate-700'
          : 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getNotificationTypeBadge = (type: Notification['type']) => {
    if (type === 'system') return 'bg-gray-100 text-gray-700';
    if (type === 'announcement') return 'bg-blue-100 text-blue-700';
    if (type === 'assignment') return 'bg-orange-100 text-orange-700';
    if (type === 'grade') return 'bg-green-100 text-green-700';
    if (type === 'enrollment') return 'bg-purple-100 text-purple-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-400 text-slate-900';
      case 'low':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const markAsRead = (id: string) => {
    const target = notificationList.find((n) => n.id === id);
    if (!target || target.read || target.source !== 'notification') return;

    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    NotificationService.markAsRead(id).catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to mark notification as read');
      setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      setUnreadCount((prev) => prev + 1);
    });
  };

  const markAllAsRead = () => {
    setNotificationList((prev) =>
      prev.map((n) => (n.source === 'notification' ? { ...n, read: true } : n))
    );
    setUnreadCount(0);
    NotificationService.markAllAsRead().catch((error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      );
      void loadNotificationData();
    });
  };

  const deleteNotification = (id: string) => {
    const target = notificationList.find((n) => n.id === id);
    setNotificationList((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read && target.source === 'notification') {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const clearAllRead = () => {
    const prevList = notificationList;
    setNotificationList(notificationList.filter((n) => !n.read));
    NotificationService.clearRead().catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to clear read notifications');
      setNotificationList(prevList);
    });
  };

  const filteredNotifications =
    filterType === 'all'
      ? notificationList
      : filterType === 'unread'
        ? notificationList.filter((n) => !n.read)
        : notificationList.filter((n) => n.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold text-white bg-red-500">
                {unreadCount}
              </span>
            )}
          </div>
          <p className={`text-slate-500 mt-1 font-medium`}>
            Stay updated with your courses, deadlines, and achievements
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <Settings className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters and Actions */}
          <div className="glass rounded-[2.5rem] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'system', label: 'System' },
                  { id: 'assignment', label: 'Assignments' },
                  { id: 'grade', label: 'Grades' },
                  { id: 'enrollment', label: 'Enrollment' },
                  { id: 'announcement', label: 'Announcements' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterType === filter.id
                        ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-2 border-[var(--accent-color)]/30'
                        : `${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} border-2 border-transparent ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'} rounded-lg transition-all`}
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
              <button
                onClick={clearAllRead}
                className={`flex items-center gap-2 px-3 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-lg transition-all`}
              >
                <Trash2 className="w-4 h-4" />
                Clear read
              </button>
            </div>
          </div>

          {/* Notification Items */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="glass rounded-[2.5rem] p-12 text-center">
                <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}
                >
                  No notifications yet
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  You're all caught up!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    !notification.read
                      ? 'border-[var(--accent-color)]/20 bg-[var(--accent-color)]/10/30'
                      : `${isDark ? 'border-white/5' : 'border-slate-100'}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`font-semibold ${!notification.read ? `${isDark ? 'text-white' : 'text-slate-800'}` : `${isDark ? 'text-slate-300' : 'text-slate-700'}`}`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getNotificationTypeBadge(notification.type)}`}
                          >
                            {notification.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          notification.type === 'announcement' &&
                          expandedAnnouncementId !== notification.id
                            ? 'line-clamp-3'
                            : ''
                        } ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                      >
                        {notification.description}
                      </p>
                      {notification.type === 'announcement' && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                            {notification.announcementType ?? 'course'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              notification.isPublished === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {notification.isPublished === 1 ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-slate-500">{notification.courseLabel}</span>
                          <span className="text-xs text-slate-500">
                            Author: {notification.authorName}
                          </span>
                          <span className="text-xs text-slate-500">
                            Views: {notification.viewCount ?? 0}
                          </span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedAnnouncementId((prev) =>
                                prev === notification.id ? null : notification.id
                              );
                            }}
                            type="button"
                            className="text-xs text-[var(--accent-color)] font-medium"
                          >
                            {expandedAnnouncementId === notification.id
                              ? 'Hide details'
                              : 'View details'}
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{notification.timestamp}</span>
                          <span
                            className={`px-2 py-0.5 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded`}
                          >
                            {notification.category}
                          </span>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            type="button"
                            className="text-xs text-[var(--accent-color)] hover:text-[var(--accent-color)] font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          {showSettings ? (
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-background-light border-b border-slate-100'} p-4`}
              >
                <h3
                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                  Notification Settings
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4
                    className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}
                  >
                    Notification Types
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        key: 'deadlines',
                        label: 'Deadline Reminders',
                        icon: <Clock className="w-4 h-4" />,
                      },
                      {
                        key: 'grades',
                        label: 'Grade Updates',
                        icon: <FileText className="w-4 h-4" />,
                      },
                      {
                        key: 'announcements',
                        label: 'Announcements',
                        icon: <Info className="w-4 h-4" />,
                      },
                      {
                        key: 'messages',
                        label: 'Messages',
                        icon: <MessageSquare className="w-4 h-4" />,
                      },
                      {
                        key: 'achievements',
                        label: 'Achievements',
                        icon: <Award className="w-4 h-4" />,
                      },
                      {
                        key: 'warnings',
                        label: 'Progress Warnings',
                        icon: <AlertTriangle className="w-4 h-4" />,
                      },
                    ].map((setting) => (
                      <label
                        key={setting.key}
                        className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-background-light hover:bg-slate-50'} rounded-lg cursor-pointer transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {setting.icon}
                          </span>
                          <span
                            className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            {setting.label}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={
                            notificationSettings[
                              setting.key as keyof typeof notificationSettings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [setting.key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-[var(--accent-color)] rounded border-slate-200 focus:ring-[var(--accent-color)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <h4
                    className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}
                  >
                    Delivery Methods
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications' },
                      { key: 'pushNotifications', label: 'Push Notifications' },
                      { key: 'soundEnabled', label: 'Sound Alerts' },
                    ].map((setting) => (
                      <label
                        key={setting.key}
                        className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-background-light hover:bg-slate-50'} rounded-lg cursor-pointer transition-all`}
                      >
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {setting.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={
                            notificationSettings[
                              setting.key as keyof typeof notificationSettings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [setting.key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-[var(--accent-color)] rounded border-slate-200 focus:ring-[var(--accent-color)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all font-medium">
                  Save Settings
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Urgent Alerts */}
              <div
                className={`rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
              >
                <div
                  className={`${isDark ? 'bg-red-900/20 border-b border-red-800/50' : 'bg-red-50 border-b border-red-200'} p-4`}
                >
                  <h3
                    className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-900'} flex items-center gap-2`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                    />
                    Urgent Alerts
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList
                    .filter((n) => n.priority === 'urgent' || n.priority === 'high')
                    .slice(0, 3)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 ${isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'} rounded-lg`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-900'}`}
                            >
                              {alert.title}
                            </p>
                            <p
                              className={`text-xs ${isDark ? 'text-red-400/70' : 'text-red-700'} mt-1`}
                            >
                              {alert.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {notificationList.filter((n) => n.priority === 'urgent' || n.priority === 'high')
                    .length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle
                        className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`}
                      />
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No urgent alerts
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass rounded-[2.5rem] overflow-hidden">
                <div
                  className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-background-light border-b border-slate-100'} p-4`}
                >
                  <h3
                    className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                  >
                    <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                    Upcoming Deadlines
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList
                    .filter((n) => n.type === 'deadline' || n.type === 'reminder')
                    .slice(0, 4)
                    .map((deadline) => (
                      <div
                        key={deadline.id}
                        className={`flex items-center gap-3 p-3 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-lg`}
                      >
                        <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[var(--accent-color)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} truncate`}
                          >
                            {deadline.title}
                          </p>
                          <p className="text-xs text-slate-500">{deadline.category}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
