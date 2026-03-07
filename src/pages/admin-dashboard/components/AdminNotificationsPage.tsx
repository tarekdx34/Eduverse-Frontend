import React, { useState } from 'react';
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Users,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


type Tab = 'overview' | 'templates' | 'settings';
type StatusFilter = 'All' | 'Sent' | 'Pending' | 'Failed' | 'Scheduled';

interface Notification {
  id: number;
  title: string;
  audience: string;
  status: 'Sent' | 'Pending' | 'Failed' | 'Scheduled';
  date: string;
  recipients: string;
}

interface Template {
  id: number;
  name: string;
  category: 'Auto' | 'Manual' | 'Scheduled';
  preview: string;
  usedCount: number;
}

const notifications: Notification[] = [
  { id: 1, title: 'System Maintenance Scheduled', audience: 'All Users', status: 'Sent', date: 'Feb 25, 2025', recipients: '4,200' },
  { id: 2, title: 'New Course Registration Open', audience: 'Students', status: 'Sent', date: 'Feb 24, 2025', recipients: '5,200' },
  { id: 3, title: 'Grade Submission Reminder', audience: 'Instructors', status: 'Pending', date: 'Feb 26, 2025', recipients: '205' },
  { id: 4, title: 'Payment Due Reminder', audience: 'Students (unpaid)', status: 'Scheduled', date: 'Mar 1, 2025', recipients: '320' },
  { id: 5, title: 'Security Alert: Password Update', audience: 'All Users', status: 'Failed', date: 'Feb 23, 2025', recipients: '0/5,420' },
  { id: 6, title: 'Welcome New Semester', audience: 'All Users', status: 'Sent', date: 'Feb 20, 2025', recipients: '5,420' },
];

const templates: Template[] = [
  { id: 1, name: 'Welcome Message', category: 'Auto', preview: 'Welcome to EduVerse...', usedCount: 1200 },
  { id: 2, name: 'Grade Published', category: 'Auto', preview: 'Your grades for...', usedCount: 850 },
  { id: 3, name: 'Payment Reminder', category: 'Scheduled', preview: 'Your payment of...', usedCount: 320 },
  { id: 4, name: 'Custom Alert', category: 'Manual', preview: 'Important update...', usedCount: 45 },
];

const statusFilters: StatusFilter[] = ['All', 'Sent', 'Pending', 'Failed', 'Scheduled'];

export function AdminNotificationsPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sendForm, setSendForm] = useState({ title: '', body: '', recipients: 'All', channel: 'Push', schedule: 'Now', datetime: '' });
  const [templateForm, setTemplateForm] = useState({ name: '', category: 'Auto', subject: '', body: '' });

  // Settings state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [maxPerDay, setMaxPerDay] = useState(10);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [retryFailed, setRetryFailed] = useState(true);

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.audience.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Sent':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'Pending':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'Failed':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      case 'Scheduled':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      default:
        return base;
    }
  };

  const categoryBadge = (category: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (category) {
      case 'Auto':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case 'Manual':
        return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`;
      case 'Scheduled':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      default:
        return base;
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Bell size={16} /> },
    { key: 'templates', label: 'Templates', icon: <MessageSquare size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const statsCards = [
    { label: 'Total Sent', value: '1,240', icon: <Send size={20} />, color: 'blue' },
    { label: 'Pending', value: '15', icon: <Clock size={20} />, color: 'yellow' },
    { label: 'Failed', value: '3', icon: <XCircle size={20} />, color: 'red' },
    { label: 'Read Rate', value: '78%', icon: <CheckCircle size={20} />, color: 'green' },
  ];

  const statColorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Notifications Management</h1>
          <p className={textSecondary}>Manage and send notifications to users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : `border-transparent ${textSecondary} hover:text-blue-500`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <div key={stat.label} className={cardClass}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${textPrimary}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${statColorClasses[stat.color]}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} size={18} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className={textSecondary} />
              <CleanSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {statusFilters.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </CleanSelect>
            </div>
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Send Notification
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((n) => (
              <div key={n.id} className={cardClass}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Bell size={20} className={n.status === 'Failed' ? 'text-red-500' : n.status === 'Pending' ? 'text-yellow-500' : n.status === 'Scheduled' ? 'text-blue-500' : 'text-green-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${textPrimary}`}>{n.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className={`text-sm flex items-center gap-1 ${textSecondary}`}>
                          <Users size={14} /> {n.audience}
                        </span>
                        <span className={statusBadge(n.status)}>{n.status}</span>
                        <span className={`text-sm flex items-center gap-1 ${textSecondary}`}>
                          <Clock size={14} /> {n.date}
                        </span>
                        <span className={`text-sm ${textSecondary}`}>
                          {n.recipients} recipients
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.status === 'Failed' && (
                      <button className="flex items-center gap-1 px-3 py-1.5 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors">
                        <Send size={14} /> Resend
                      </button>
                    )}
                    {n.status === 'Scheduled' && (
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Create Template
            </button>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className={cardClass}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-semibold ${textPrimary}`}>{tmpl.name}</h3>
                    <span className={`${categoryBadge(tmpl.category)} mt-1 inline-block`}>{tmpl.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${textSecondary}`}>
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${textSecondary} mb-3`}>"{tmpl.preview}"</p>
                <p className={`text-xs ${textSecondary}`}>Used {tmpl.usedCount.toLocaleString()} times</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Channels */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Notification Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Push */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell size={20} className="text-blue-500" />
                    <h3 className={`font-semibold ${textPrimary}`}>Push Notifications</h3>
                  </div>
                  <button
                    onClick={() => setPushEnabled(!pushEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${pushEnabled ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pushEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {pushEnabled ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                  <span className={`text-sm ${textSecondary}`}>{pushEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <p className={`text-sm mt-2 ${textSecondary}`}>Delivery rate: {pushEnabled ? '95%' : 'N/A'}</p>
              </div>

              {/* Email */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail size={20} className="text-blue-500" />
                    <h3 className={`font-semibold ${textPrimary}`}>Email Notifications</h3>
                  </div>
                  <button
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {emailEnabled ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                  <span className={`text-sm ${textSecondary}`}>{emailEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <p className={`text-sm mt-2 ${textSecondary}`}>Delivery rate: {emailEnabled ? '88%' : 'N/A'}</p>
              </div>

              {/* SMS */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-500" />
                    <h3 className={`font-semibold ${textPrimary}`}>SMS Notifications</h3>
                  </div>
                  <button
                    onClick={() => setSmsEnabled(!smsEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${smsEnabled ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${smsEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {smsEnabled ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                  <span className={`text-sm ${textSecondary}`}>{smsEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <p className={`text-sm mt-2 ${textSecondary}`}>Delivery rate: {smsEnabled ? '92%' : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Delivery Settings</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className={`text-sm font-medium ${textPrimary}`}>Max notifications per day per user</label>
                <input
                  type="number"
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(Number(e.target.value))}
                  className={`w-24 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className={`text-sm font-medium ${textPrimary}`}>Quiet hours</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <span className={textSecondary}>to</span>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className={`text-sm font-medium ${textPrimary}`}>Retry failed notifications</label>
                <button
                  onClick={() => setRetryFailed(!retryFailed)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${retryFailed ? 'bg-green-500' : 'bg-gray-400'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${retryFailed ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-xl border shadow-xl p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Send Notification</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Title</label>
                <input
                  type="text"
                  value={sendForm.title}
                  onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                  className={inputClass}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Body</label>
                <textarea
                  value={sendForm.body}
                  onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="Notification body..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Recipients</label>
                <CleanSelect
                  value={sendForm.recipients}
                  onChange={(e) => setSendForm({ ...sendForm, recipients: e.target.value })}
                  className={inputClass}
                >
                  <option value="All">All Users</option>
                  <option value="Students">Students</option>
                  <option value="Instructors">Instructors</option>
                  <option value="TAs">TAs</option>
                  <option value="Admins">Admins</option>
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Channel</label>
                <CleanSelect
                  value={sendForm.channel}
                  onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
                  className={inputClass}
                >
                  <option value="Push">Push</option>
                  <option value="Email">Email</option>
                  <option value="Both">Both</option>
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Schedule</label>
                <CleanSelect
                  value={sendForm.schedule}
                  onChange={(e) => setSendForm({ ...sendForm, schedule: e.target.value })}
                  className={inputClass}
                >
                  <option value="Now">Send Now</option>
                  <option value="Later">Schedule for Later</option>
                </CleanSelect>
              </div>
              {sendForm.schedule === 'Later' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={sendForm.datetime}
                    onChange={(e) => setSendForm({ ...sendForm, datetime: e.target.value })}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSendModal(false)}
                className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-colors"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-xl border shadow-xl p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Create Template</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className={inputClass}
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Category</label>
                <CleanSelect
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className={inputClass}
                >
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                  <option value="Scheduled">Scheduled</option>
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Subject</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className={inputClass}
                  placeholder="Template subject"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Body</label>
                <textarea
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="Use {{placeholders}} for dynamic content..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
