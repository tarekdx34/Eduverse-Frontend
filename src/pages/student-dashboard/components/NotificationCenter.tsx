import { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import { useApi, useMutation } from '../../../hooks/useApi';
import { notificationService } from '../../../services/api/notificationService';
import { LoadingSkeleton } from '../../../components/shared';

interface MappedNotification {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: string;
  category: string;
}

function formatTimestamp(createdAt: string): string {
  const now = new Date();
  const date = new Date(createdAt);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function mapNotification(n: any): MappedNotification {
  return {
    id: n.id,
    type: n.type || 'announcement',
    title: n.title,
    description: n.message,
    timestamp: formatTimestamp(n.createdAt),
    read: n.isRead,
    actionUrl: n.actionUrl,
    priority: 'medium',
    category: n.category || '',
  };
}

export function NotificationCenter() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { data: rawNotifications, loading } = useApi(() => notificationService.list(), []);
  const { mutate: apiMarkAsRead } = useMutation((id: number) => notificationService.markAsRead(id));
  const { mutate: apiDelete } = useMutation((id: number) => notificationService.delete(id));
  const [notificationList, setNotificationList] = useState<MappedNotification[]>([]);

  useEffect(() => {
    if (rawNotifications) {
      setNotificationList(rawNotifications.map(mapNotification));
    }
  }, [rawNotifications]);

  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    deadlines: true,
    grades: true,
    announcements: true,
    messages: true,
    achievements: true,
    warnings: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: false
  });

  const unreadCount = notificationList.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-5 h-5" />;
      case 'grade':
        return <FileText className="w-5 h-5" />;
      case 'announcement':
        return <Info className="w-5 h-5" />;
      case 'reminder':
        return <Calendar className="w-5 h-5" />;
      case 'achievement':
        return <Award className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return isDark ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-red-100 text-red-600 border-red-200';
    if (priority === 'high') return isDark ? 'bg-orange-900/50 text-orange-400 border-orange-800' : 'bg-orange-100 text-orange-600 border-orange-200';
    
    switch (type) {
      case 'deadline':
        return isDark ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-red-100 text-red-600 border-red-200';
      case 'grade':
        return isDark ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-green-100 text-green-600 border-green-200';
      case 'announcement':
        return isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-600 border-blue-200';
      case 'reminder':
        return isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-600 border-blue-200';
      case 'achievement':
        return isDark ? 'bg-amber-900/50 text-amber-400 border-amber-800' : 'bg-amber-100 text-amber-600 border-amber-200';
      case 'message':
        return 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20';
      case 'warning':
        return isDark ? 'bg-orange-900/50 text-orange-400 border-orange-800' : 'bg-orange-100 text-orange-600 border-orange-200';
      default:
        return isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const markAsRead = (id: number) => {
    setNotificationList(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    apiMarkAsRead(id);
  };

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    notificationService.markAllAsRead();
  };

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(n => n.id !== id));
    apiDelete(id);
  };

  const clearAllRead = () => {
    setNotificationList(prev => prev.filter(n => !n.read));
  };

  const filteredNotifications = filterType === 'all' 
    ? notificationList 
    : filterType === 'unread'
    ? notificationList.filter(n => !n.read)
    : notificationList.filter(n => n.type === filterType);

  if (loading) {
    return <LoadingSkeleton variant="list" count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stay updated with your courses, deadlines, and achievements</p>
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
                  { id: 'deadline', label: 'Deadlines' },
                  { id: 'warning', label: 'Warnings' },
                  { id: 'grade', label: 'Grades' },
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
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>No Notifications</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    !notification.read ? 'border-[var(--accent-color)]/20 bg-[var(--accent-color)]/10/30' : `${isDark ? 'border-white/5' : 'border-slate-100'}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-semibold ${!notification.read ? `${isDark ? 'text-white' : 'text-slate-800'}` : `${isDark ? 'text-slate-300' : 'text-slate-700'}`}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[var(--accent-color)]/100 rounded-full" />
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>{notification.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{notification.timestamp}</span>
                          <span className={`px-2 py-0.5 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded`}>{notification.category}</span>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
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
              <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <Settings className="w-5 h-5 text-slate-600" />
                  Notification Settings
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}>Notification Types</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'deadlines', label: 'Deadline Reminders', icon: <Clock className="w-4 h-4" /> },
                      { key: 'grades', label: 'Grade Updates', icon: <FileText className="w-4 h-4" /> },
                      { key: 'announcements', label: 'Announcements', icon: <Info className="w-4 h-4" /> },
                      { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
                      { key: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
                      { key: 'warnings', label: 'Progress Warnings', icon: <AlertTriangle className="w-4 h-4" /> },
                    ].map((setting) => (
                      <label key={setting.key} className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-background-light hover:bg-slate-50'} rounded-lg cursor-pointer transition-all`}>
                        <div className="flex items-center gap-3">
                          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{setting.icon}</span>
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{setting.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked
                          })}
                          className="w-5 h-5 text-[var(--accent-color)] rounded border-slate-200 focus:ring-[var(--accent-color)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}>Delivery Methods</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications' },
                      { key: 'pushNotifications', label: 'Push Notifications' },
                      { key: 'soundEnabled', label: 'Sound Alerts' },
                    ].map((setting) => (
                      <label key={setting.key} className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-background-light hover:bg-slate-50'} rounded-lg cursor-pointer transition-all`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{setting.label}</span>
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked
                          })}
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
              <div className={`rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
                <div className={`${isDark ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border-b border-red-800/50' : 'bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200'} p-4`}>
                  <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-900'} flex items-center gap-2`}>
                    <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                    Urgent Alerts
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList.filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`p-3 ${isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'} rounded-lg`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-900'}`}>{alert.title}</p>
                          <p className={`text-xs ${isDark ? 'text-red-400/70' : 'text-red-700'} mt-1`}>{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notificationList.filter(n => n.priority === 'urgent' || n.priority === 'high').length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No urgent alerts</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass rounded-[2.5rem] overflow-hidden">
                <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                    <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                    Upcoming Deadlines
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList.filter(n => n.type === 'deadline' || n.type === 'reminder').slice(0, 4).map((deadline) => (
                    <div key={deadline.id} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-lg`}>
                      <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[var(--accent-color)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} truncate`}>{deadline.title}</p>
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