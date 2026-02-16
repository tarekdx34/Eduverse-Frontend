import { useState } from 'react';
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

interface Notification {
  id: string;
  type: 'deadline' | 'grade' | 'announcement' | 'reminder' | 'achievement' | 'message' | 'warning';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'Assignment Due Tomorrow',
    description: 'Database Design Project is due in 24 hours. Don\'t forget to submit!',
    timestamp: '10 minutes ago',
    read: false,
    priority: 'urgent',
    category: 'CS220'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Attendance Alert',
    description: 'Your attendance in Database Management Systems is at 76%. Minimum required is 75%.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'high',
    category: 'Attendance'
  },
  {
    id: '3',
    type: 'grade',
    title: 'New Grade Posted',
    description: 'Your grade for Web Portfolio Project has been posted. You scored 95/100.',
    timestamp: '2 hours ago',
    read: false,
    priority: 'medium',
    category: 'CS150'
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked! 🎉',
    description: 'You\'ve earned the "Perfect Score" badge for getting 100% on an assignment.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'low',
    category: 'Gamification'
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Class Cancelled',
    description: 'Tomorrow\'s Software Engineering lecture has been cancelled. Check announcements for details.',
    timestamp: '5 hours ago',
    read: true,
    priority: 'medium',
    category: 'CS305'
  },
  {
    id: '6',
    type: 'message',
    title: 'New Message from Prof. Sarah Johnson',
    description: 'Regarding your question about the database normalization assignment...',
    timestamp: '6 hours ago',
    read: true,
    priority: 'medium',
    category: 'Messages'
  },
  {
    id: '7',
    type: 'reminder',
    title: 'Exam in 3 Days',
    description: 'Midterm Exam for Web Development Fundamentals is scheduled for December 6th at 1:00 PM.',
    timestamp: '1 day ago',
    read: true,
    priority: 'high',
    category: 'CS150'
  },
  {
    id: '8',
    type: 'warning',
    title: 'Progress Alert',
    description: 'You\'re falling behind in Data Structures & Algorithms. Complete the pending assignments to catch up.',
    timestamp: '1 day ago',
    read: true,
    priority: 'high',
    category: 'CS201'
  },
  {
    id: '9',
    type: 'deadline',
    title: 'Quiz Deadline Approaching',
    description: 'Core Concepts Quiz for CS201 is due in 2 days.',
    timestamp: '2 days ago',
    read: true,
    priority: 'medium',
    category: 'CS201'
  },
  {
    id: '10',
    type: 'announcement',
    title: 'New Course Materials Available',
    description: 'New lecture slides and resources have been uploaded for Mobile Application Development.',
    timestamp: '3 days ago',
    read: true,
    priority: 'low',
    category: 'CS350'
  }
];

export function NotificationCenter() {
  const { isDark } = useTheme();
  const [notificationList, setNotificationList] = useState<Notification[]>(notifications);
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
    if (priority === 'urgent') return 'bg-red-100 text-red-600 border-red-200';
    if (priority === 'high') return 'bg-orange-100 text-orange-600 border-orange-200';
    
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'grade':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'announcement':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'reminder':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'achievement':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'message':
        return 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20';
      case 'warning':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
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

  const markAsRead = (id: string) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotificationList(notificationList.filter(n => n.id !== id));
  };

  const clearAllRead = () => {
    setNotificationList(notificationList.filter(n => !n.read));
  };

  const filteredNotifications = filterType === 'all' 
    ? notificationList 
    : filterType === 'unread'
    ? notificationList.filter(n => !n.read)
    : notificationList.filter(n => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#7C3AED] via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <BellRing className="w-8 h-8" />
              {unreadCount > 0 && (
                <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-purple-100">Stay updated with your courses, deadlines, and achievements</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-300" />
              <span className="text-sm text-purple-200">Deadlines</span>
            </div>
            <p className="text-2xl font-bold">{notificationList.filter(n => n.type === 'deadline').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-purple-200">Warnings</span>
            </div>
            <p className="text-2xl font-bold">{notificationList.filter(n => n.type === 'warning').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-purple-200">Messages</span>
            </div>
            <p className="text-2xl font-bold">{notificationList.filter(n => n.type === 'message').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-purple-200">Achievements</span>
            </div>
            <p className="text-2xl font-bold">{notificationList.filter(n => n.type === 'achievement').length}</p>
          </div>
        </div>
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
                        ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-2 border-[#7C3AED]/30'
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
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                    !notification.read ? 'border-[#7C3AED]/20 bg-[#7C3AED]/10/30' : `${isDark ? 'border-white/5' : 'border-slate-100'}`
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
                            <span className="w-2 h-2 bg-[#7C3AED]/100 rounded-full" />
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
                            className="text-xs text-[#7C3AED] hover:text-[#7C3AED] font-medium"
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
                          className="w-5 h-5 text-[#7C3AED] rounded border-slate-200 focus:ring-[#7C3AED]"
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
                          className="w-5 h-5 text-[#7C3AED] rounded border-slate-200 focus:ring-[#7C3AED]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-all font-medium">
                  Save Settings
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Urgent Alerts */}
              <div className="glass rounded-[2.5rem] overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-red-200">
                  <h3 className="font-semibold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Urgent Alerts
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList.filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-900">{alert.title}</p>
                          <p className="text-xs text-red-700 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notificationList.filter(n => n.priority === 'urgent' || n.priority === 'high').length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No urgent alerts</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass rounded-[2.5rem] overflow-hidden">
                <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                    <Calendar className="w-5 h-5 text-[#7C3AED]" />
                    Upcoming Deadlines
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notificationList.filter(n => n.type === 'deadline' || n.type === 'reminder').slice(0, 4).map((deadline) => (
                    <div key={deadline.id} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-lg`}>
                      <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#7C3AED]" />
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
