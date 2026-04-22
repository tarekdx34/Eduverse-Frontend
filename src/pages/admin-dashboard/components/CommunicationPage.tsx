import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Send,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Megaphone,
  Pin,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';
import { toast } from 'sonner';
import { announcementService, type Announcement } from '../../../services/api/announcementService';

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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const getCourseLabel = (announcement: Announcement) => {
  if (announcement.course?.name || announcement.course?.code) {
    return `${announcement.course.name ?? ''}${announcement.course?.code ? ` (${announcement.course.code})` : ''}`.trim();
  }

  return 'Campus-wide';
};

const getAuthorLabel = (announcement: Announcement) => {
  if (!announcement.author) return 'System';
  return (
    `${announcement.author.firstName ?? ''} ${announcement.author.lastName ?? ''}`.trim() ||
    announcement.author.email ||
    'System'
  );
};

const formatDisplayDate = (value?: string) =>
  new Date(value ?? Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getPriorityBadgeClass = (priority?: string) => {
  if (priority === 'urgent') return 'bg-red-100 text-red-700';
  if (priority === 'high') return 'bg-orange-100 text-orange-700';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
};

export function CommunicationPage({
  templates,
  onDeleteTemplate,
  onSendBroadcast,
}: CommunicationPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates'>('broadcast');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    audience: 'all',
    channels: ['push'],
    scheduleType: 'now',
    scheduleDate: '',
    courseId: '0',
    priority: 'medium',
    publishNow: true,
  });

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);
      const response = await announcementService.getAnnouncements();
      setAnnouncements(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    announcements.forEach((announcement) => {
      const courseId = announcement.course?.id;
      if (courseId !== undefined) {
        map.set(String(courseId), getCourseLabel(announcement));
      }
    });

    return [
      { id: '0', label: 'Campus-wide' },
      ...Array.from(map, ([id, label]) => ({ id, label })),
    ];
  }, [announcements]);

  const audienceOptions = [
    { value: 'all', label: t('allUsersAudience'), count: 5420 },
    { value: 'students', label: t('studentsOnly'), count: 5200 },
    { value: 'instructors', label: t('instructorsOnly'), count: 205 },
    { value: 'admins', label: t('adminsOnly'), count: 15 },
  ];

  const handleChannelToggle = (channel: string) => {
    setBroadcastData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSendAnnouncement = async () => {
    if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      if (editingAnnouncementId) {
        await announcementService.updateAnnouncement(editingAnnouncementId, {
          title: broadcastData.title.trim(),
          content: broadcastData.message.trim(),
          priority: broadcastData.priority,
        });

        if (broadcastData.publishNow) {
          await announcementService.publishAnnouncement(editingAnnouncementId);
        }

        toast.success('Announcement updated');
      } else {
        const parsedCourseId = Number(broadcastData.courseId || 0);
        const created = await announcementService.createAnnouncement({
          title: broadcastData.title.trim(),
          content: broadcastData.message.trim(),
          ...(parsedCourseId > 0 ? { courseId: parsedCourseId } : {}),
          priority: broadcastData.priority,
        });

        if (broadcastData.publishNow) {
          await announcementService.publishAnnouncement(created.id);
        }

        toast.success('Broadcast saved as announcement');
      }

      onSendBroadcast(broadcastData);
      setEditingAnnouncementId(null);
      setBroadcastData((prev) => ({ ...prev, title: '', message: '' }));
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const togglePublish = async (announcement: Announcement) => {
    if (announcement.isPublished === 1) {
      return;
    }

    try {
      await announcementService.publishAnnouncement(announcement.id);
      toast.success('Announcement published');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const togglePin = async (announcement: Announcement) => {
    try {
      await announcementService.pinAnnouncement(announcement.id, announcement.isPinned !== 1);
      toast.success(announcement.isPinned === 1 ? 'Announcement unpinned' : 'Announcement pinned');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteAnnouncement = async (announcement: Announcement) => {
    try {
      await announcementService.deleteAnnouncement(announcement.id);
      toast.success('Announcement deleted');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('communication')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('sendBroadcastsSub')}
          </p>
        </div>
      </div>

      <div
        className={`p-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'broadcast'
              ? 'bg-red-600 text-white'
              : isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Megaphone size={18} />
            {t('broadcastNotification')}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates'
              ? 'bg-red-600 text-white'
              : isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <FileText size={18} />
            {t('notificationTemplates')}
          </button>
        </div>
      </div>

      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('composeBroadcast')}
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('title')}
                </label>
                <input
                  type="text"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  placeholder="Enter notification title..."
                  className={`w-full px-4 py-2 rounded-lg border ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('messageBody')}
                </label>
                <textarea
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={5}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Course
                  </label>
                  <CleanSelect
                    value={broadcastData.courseId}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, courseId: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    {courseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.label}
                      </option>
                    ))}
                  </CleanSelect>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Priority
                  </label>
                  <CleanSelect
                    value={broadcastData.priority}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, priority: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </CleanSelect>
                </div>
              </div>

              <label
                className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <input
                  type="checkbox"
                  checked={broadcastData.publishNow}
                  onChange={(e) =>
                    setBroadcastData({ ...broadcastData, publishNow: e.target.checked })
                  }
                />
                Publish immediately
              </label>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('targetAudience')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {audienceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBroadcastData({ ...broadcastData, audience: option.value })}
                      className={`p-3 rounded-lg border text-left transition-colors ${broadcastData.audience === option.value
                        ? isDark
                          ? 'bg-red-900/50 border-red-600'
                          : 'bg-red-50 border-red-200'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {option.label}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {option.count.toLocaleString()} users
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('notificationChannels')}
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'push', label: 'Push', icon: Bell },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'sms', label: 'SMS', icon: MessageSquare },
                  ].map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelToggle(channel.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${broadcastData.channels.includes(channel.id)
                        ? isDark
                          ? 'bg-red-900/50 border-red-600 text-red-300'
                          : 'bg-red-50 border-red-200 text-red-700'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-gray-300'
                          : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                      <channel.icon size={16} />
                      {channel.label}
                    </button>
                  ))}
                </div>
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
                  onClick={handleSendAnnouncement}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Send size={18} />
                  {editingAnnouncementId ? 'Update Broadcast' : t('sendBroadcast')}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('recentBroadcasts')}
            </h3>
            <div className="space-y-4">
              {loadingAnnouncements ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : announcements.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No announcements yet.
                </p>
              ) : (
                announcements.slice(0, 5).map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {announcement.title}
                    </h4>
                    <p
                      className={`text-sm mt-2 line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {announcement.content}
                    </p>
                    <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div>{getCourseLabel(announcement)}</div>
                      <div>
                        {formatDisplayDate(announcement.publishedAt ?? announcement.createdAt)}
                      </div>
                      <div>Author: {getAuthorLabel(announcement)}</div>
                      <div>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {announcement.announcementType ??
                            (announcement as Announcement & { type?: string }).type ??
                            'course'}
                        </span>
                      </div>
                      <div>Views: {announcement.viewCount ?? 0}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${announcement.isPublished === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {announcement.isPublished === 1 ? 'Published' : 'Draft'}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(announcement.priority)}`}
                      >
                        {announcement.priority ?? 'low'}
                      </span>
                      {announcement.isPinned === 1 && (
                        <span className="inline-flex items-center text-xs text-amber-500">
                          <Pin size={12} className="mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingAnnouncementId(announcement.id);
                          setBroadcastData((prev) => ({
                            ...prev,
                            title: announcement.title,
                            message: announcement.content,
                            courseId: String(announcement.course?.id ?? 0),
                            priority: announcement.priority ?? 'medium',
                            publishNow: announcement.isPublished === 1,
                          }));
                        }}
                        className="text-xs px-2 py-1 rounded bg-slate-600 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePublish(announcement)}
                        className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                        disabled={announcement.isPublished === 1}
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => togglePin(announcement)}
                        className="text-xs px-2 py-1 rounded bg-amber-500 text-white"
                      >
                        {announcement.isPinned === 1 ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement)}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
            {templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${template.type === 'email' ? 'bg-blue-100 text-blue-700' : template.type === 'push' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {template.type.toUpperCase()}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Updated: {template.lastUpdated}
                    </span>
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </h3>
                </div>
                <div className={`p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>{t('messageSubject')}:</strong> {template.subject}
                  </div>
                  <div
                    className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}
                  >
                    {template.content}
                  </div>
                </div>
                <div
                  className={`p-4 flex items-center gap-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Edit2 size={14} />
                    {t('edit')}
                  </button>
                  <button
                    className={`p-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
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

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div
              className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('notificationPreview')}
              </h3>
            </div>
            <div className="p-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <Bell className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {broadcastData.title || 'Notification Title'}
                    </h4>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {broadcastData.message || 'Your message will appear here...'}
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Just now
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`p-4 border-t flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
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

      {(showTemplateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingTemplate ? t('editTemplate') : t('createTemplate')}
            </h2>
            <form className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('templateName')}
                </label>
                <input
                  type="text"
                  defaultValue={editingTemplate?.name}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('type')}
                </label>
                <CleanSelect
                  defaultValue={editingTemplate?.type}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value="email">Email</option>
                  <option value="push">Push Notification</option>
                  <option value="broadcast">Broadcast</option>
                </CleanSelect>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('messageSubject')}
                </label>
                <input
                  type="text"
                  defaultValue={editingTemplate?.subject}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('content')}
                </label>
                <textarea
                  rows={5}
                  defaultValue={editingTemplate?.content}
                  placeholder="Use {{name}}, {{courseName}}, {{date}} for dynamic content..."
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                  }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
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
