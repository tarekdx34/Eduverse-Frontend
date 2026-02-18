import React, { useState } from 'react';
import {
  Send,
  Bell,
  Mail,
  Users,
  MessageSquare,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Megaphone,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationTemplate {
  id: number;
  name: string;
  type: string;
  subject: string;
  content: string;
  lastUpdated: string;
}

interface CommunicationPageProps {
  templates: NotificationTemplate[];
  onCreateTemplate: (template: any) => void;
  onEditTemplate: (id: number, template: any) => void;
  onDeleteTemplate: (id: number) => void;
  onSendBroadcast: (message: any) => void;
}

export function CommunicationPage({ templates, onCreateTemplate, onEditTemplate, onDeleteTemplate, onSendBroadcast }: CommunicationPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates'>('broadcast');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Broadcast form state
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    audience: 'all',
    channels: ['push'],
    scheduleType: 'now',
    scheduleDate: '',
  });

  const audienceOptions = [
    { value: 'all', label: t('allUsersAudience'), count: 5420 },
    { value: 'students', label: t('studentsOnly'), count: 5200 },
    { value: 'instructors', label: t('instructorsOnly'), count: 205 },
    { value: 'admins', label: t('adminsOnly'), count: 15 },
  ];

  const recentBroadcasts = [
    { id: 1, title: 'System Maintenance Notice', audience: 'All Users', sent: '2026-02-03 09:00', status: 'delivered' },
    { id: 2, title: 'New Feature: AI Quiz Generator', audience: 'Instructors', sent: '2026-02-01 14:30', status: 'delivered' },
    { id: 3, title: 'Registration Deadline Reminder', audience: 'Students', sent: '2026-01-28 10:00', status: 'delivered' },
  ];

  const handleChannelToggle = (channel: string) => {
    setBroadcastData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('communication')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('sendBroadcastsSub')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`p-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'broadcast'
                ? 'bg-red-600 text-white'
                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Megaphone size={18} />
            {t('broadcastNotification')}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-red-600 text-white'
                : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={18} />
            {t('notificationTemplates')}
          </button>
        </div>
      </div>

      {/* Broadcast Section */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Broadcast Form */}
          <div className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('composeBroadcast')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('title')}</label>
                <input
                  type="text"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  placeholder="Enter notification title..."
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('messageBody')}</label>
                <textarea
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={5}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('targetAudience')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {audienceOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setBroadcastData({ ...broadcastData, audience: option.value })}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        broadcastData.audience === option.value
                          ? isDark ? 'bg-red-900/50 border-red-600' : 'bg-red-50 border-red-200'
                          : isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{option.label}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{option.count.toLocaleString()} users</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('notificationChannels')}</label>
                <div className="flex gap-3">
                  {[
                    { id: 'push', label: 'Push', icon: Bell },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'sms', label: 'SMS', icon: MessageSquare },
                  ].map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelToggle(channel.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        broadcastData.channels.includes(channel.id)
                          ? isDark ? 'bg-red-900/50 border-red-600 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                          : isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <channel.icon size={16} />
                      {channel.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('sendTime')}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setBroadcastData({ ...broadcastData, scheduleType: 'now' })}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      broadcastData.scheduleType === 'now'
                        ? isDark ? 'bg-red-900/50 border-red-600' : 'bg-red-50 border-red-200'
                        : isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sendNow')}</div>
                  </button>
                  <button
                    onClick={() => setBroadcastData({ ...broadcastData, scheduleType: 'scheduled' })}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      broadcastData.scheduleType === 'scheduled'
                        ? isDark ? 'bg-red-900/50 border-red-600' : 'bg-red-50 border-red-200'
                        : isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('scheduleSend')}</div>
                  </button>
                </div>
                {broadcastData.scheduleType === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={broadcastData.scheduleDate}
                    onChange={(e) => setBroadcastData({ ...broadcastData, scheduleDate: e.target.value })}
                    className={`w-full mt-3 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPreview(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Eye size={18} />
                  {t('preview')}
                </button>
                <button
                  onClick={() => onSendBroadcast(broadcastData)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Send size={18} />
                  {t('sendBroadcast')}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Broadcasts */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('recentBroadcasts')}</h3>
            <div className="space-y-4">
              {recentBroadcasts.map(broadcast => (
                <div key={broadcast.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{broadcast.title}</h4>
                  <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>To: {broadcast.audience}</div>
                    <div>Sent: {broadcast.sent}</div>
                  </div>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {broadcast.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Section */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={18} />
              {t('createTemplate')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.type === 'email' ? 'bg-blue-100 text-blue-700' :
                      template.type === 'push' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {template.type.toUpperCase()}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Updated: {template.lastUpdated}</span>
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
                </div>
                <div className={`p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>{t('messageSubject')}:</strong> {template.subject}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                    {template.content}
                  </div>
                </div>
                <div className={`p-4 flex items-center gap-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Edit2 size={14} />
                    {t('edit')}
                  </button>
                  <button className={`p-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('notificationPreview')}</h3>
            </div>
            <div className="p-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <Bell className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{broadcastData.title || 'Notification Title'}</h4>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{broadcastData.message || 'Your message will appear here...'}</p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Just now</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-4 border-t flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {(showTemplateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingTemplate ? t('editTemplate') : t('createTemplate')}
            </h2>
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('templateName')}</label>
                <input type="text" defaultValue={editingTemplate?.name} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('type')}</label>
                <select defaultValue={editingTemplate?.type} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="email">Email</option>
                  <option value="push">Push Notification</option>
                  <option value="broadcast">Broadcast</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('messageSubject')}</label>
                <input type="text" defaultValue={editingTemplate?.subject} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('content')}</label>
                <textarea rows={5} defaultValue={editingTemplate?.content} placeholder="Use {{name}}, {{courseName}}, {{date}} for dynamic content..." className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingTemplate ? t('save') : t('createTemplate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationPage;
