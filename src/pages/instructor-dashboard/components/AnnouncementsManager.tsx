import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MessagingChat } from '../../../components/shared';
import { CleanSelect } from '../../../components/shared';
import { announcementService, type Announcement } from '../../../services/api/announcementService';
import { toast } from 'sonner';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle,
  FileEdit,
  MoreVertical,
  X,
  AlertTriangle,
  Trash2,
  Edit3,
  Send,
  MessageSquare,
  Users,
  Pin,
  Loader2,
} from 'lucide-react';

interface AnnouncementFormState {
  title: string;
  content: string;
  courseId: string;
  priority: string;
  publishNow: boolean;
}

const emptyForm: AnnouncementFormState = {
  title: '',
  content: '',
  courseId: '0',
  priority: 'medium',
  publishNow: false,
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
};

const normalizeAnnouncements = (payload: Announcement[] | { data?: Announcement[] } | undefined) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
};

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

export function AnnouncementsManager({ isMockMode = false }: { isMockMode?: boolean }) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeCommTab, setActiveCommTab] = useState<'announcements' | 'chats' | 'messages'>(
    'announcements'
  );
  const [form, setForm] = useState<AnnouncementFormState>(emptyForm);

  const loadAnnouncements = useCallback(async () => {
    if (isMockMode) {
      setAnnouncements([
        {
          id: 'mock-1',
          courseId: '1',
          createdBy: 1,
          title: 'Welcome to CS101',
          content: 'This is a mock announcement for the mock course.',
          isPublished: 1,
          createdAt: new Date().toISOString(),
          author: { firstName: 'System', lastName: 'Admin' },
          course: { id: '1', name: 'Intro to CS', code: 'CS101' },
          viewCount: 42,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements();
      setAnnouncements(normalizeAnnouncements(response as Announcement[]));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isMockMode]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const counts = useMemo(
    () => ({
      all: announcements.length,
      published: announcements.filter((a) => a.isPublished === 1).length,
      draft: announcements.filter((a) => a.isPublished !== 1).length,
    }),
    [announcements]
  );

  const filtered = useMemo(
    () =>
      announcements.filter((a) => {
        const status = a.isPublished === 1 ? 'published' : 'draft';
        const matchesFilter = filter === 'all' || status === filter;
        const target = `${a.title} ${a.content}`.toLowerCase();
        const matchesSearch = !searchTerm || target.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [announcements, filter, searchTerm]
  );

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    announcements.forEach((a) => {
      const id = a.course?.id;
      if (id !== undefined) {
        map.set(String(id), getCourseLabel(a));
      }
    });

    return [{ id: '0', label: 'Campus-wide' }, ...Array.from(map, ([id, label]) => ({ id, label }))];
  }, [announcements]);

  const openCreate = () => {
    setEditingAnnouncement(null);
    setForm(emptyForm);
    setShowCreateModal(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
      setForm({
        title: announcement.title,
        content: announcement.content,
        courseId: String(announcement.course?.id ?? 0),
        priority: announcement.priority ?? 'medium',
        publishNow: announcement.isPublished === 1,
      });
    setShowCreateModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;

    try {
      await announcementService.deleteAnnouncement(deletingAnnouncement.id);
      toast.success('Announcement deleted successfully');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setShowDeleteConfirm(false);
      setDeletingAnnouncement(null);
    }
  };

  const handlePublish = async (announcement: Announcement) => {
    try {
      await announcementService.publishAnnouncement(announcement.id);
      toast.success('Announcement published');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setOpenMenuId(null);
    }
  };

  const handlePin = async (announcement: Announcement) => {
    try {
      await announcementService.pinAnnouncement(announcement.id, announcement.isPinned !== 1);
      toast.success(announcement.isPinned === 1 ? 'Announcement unpinned' : 'Announcement pinned');
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const parsedCourseId = Number(form.courseId || 0);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      priority: form.priority,
      ...(parsedCourseId > 0 ? { courseId: parsedCourseId } : {}),
    };

    try {
      setSaving(true);

      if (editingAnnouncement) {
        await announcementService.updateAnnouncement(editingAnnouncement.id, {
          title: payload.title,
          content: payload.content,
          priority: payload.priority,
        });

        if (form.publishNow && editingAnnouncement.isPublished !== 1) {
          await announcementService.publishAnnouncement(editingAnnouncement.id);
        }

        toast.success('Announcement updated');
      } else {
        const created = await announcementService.createAnnouncement(payload);
        if (form.publishNow) {
          await announcementService.publishAnnouncement(created.id);
        }

        toast.success('Announcement created');
      }

      setShowCreateModal(false);
      setEditingAnnouncement(null);
      setForm(emptyForm);
      await loadAnnouncements();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const badge = (isPublished: number) =>
    isPublished === 1 ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
        <CheckCircle size={12} /> Published
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
        <FileEdit size={12} /> Draft
      </span>
    );

  const cardClass = `rounded-xl p-5 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900'}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div
        className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}
      >
        {(
          [
            { key: 'announcements', label: 'Announcements', icon: Megaphone },
            { key: 'chats', label: 'Course Chats', icon: MessageSquare },
            { key: 'messages', label: 'Direct Messages', icon: Users },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCommTab(tab.key)}
            style={activeCommTab === tab.key ? { backgroundColor: primaryHex } : undefined}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
              activeCommTab === tab.key
                ? 'text-white shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeCommTab === 'announcements' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Announcements</h2>
              <p className={`text-sm mt-1 ${textSecondary}`}>
                Create and manage course announcements for your students
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: primaryHex }}
            >
              <Plus size={18} /> New Announcement
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Announcements', value: counts.all },
              { label: 'Published', value: counts.published },
              { label: 'Drafts', value: counts.draft },
            ].map((stat) => (
              <div key={stat.label} className={cardClass}>
                <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${textPrimary}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'all', label: 'All' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'text-white'
                    : isDark
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={filter === f.key ? { backgroundColor: primaryHex } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className={`${cardClass} flex items-center gap-3`}>
                <Loader2 className="animate-spin" size={18} /> Loading announcements...
              </div>
            ) : filtered.length === 0 ? (
              <div className={`${cardClass} text-center py-12`}>
                <Megaphone size={40} className={`mx-auto mb-3 ${textSecondary}`} />
                <p className={textPrimary}>No announcements found</p>
              </div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className={`${cardClass} relative`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {badge(a.isPublished)}
                        {a.isPinned === 1 && <Pin className="w-4 h-4 text-amber-500" />}
                      </div>

                      <h3 className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            a.priority === 'urgent'
                              ? 'bg-red-600'
                              : a.priority === 'high'
                                ? 'bg-orange-500'
                                : a.priority === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                          }`}
                        />
                        {a.title}
                      </h3>

                      <p className={`mt-1 text-sm line-clamp-3 ${textSecondary}`}>{a.content}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {getCourseLabel(a)}
                        </span>
                        <span className={textSecondary}>Author: {getAuthorLabel(a)}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {a.announcementType ?? (a as Announcement & { type?: string }).type ?? 'course'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            a.priority === 'urgent'
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                              : a.priority === 'high'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                                : a.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                          }`}
                        >
                          {a.priority ?? 'low'}
                        </span>
                        <span className={textSecondary}>Views: {a.viewCount ?? 0}</span>
                        <span className={textSecondary}>
                          {formatDisplayDate(a.publishedAt ?? a.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                        }`}
                      >
                        <MoreVertical size={18} className={textSecondary} />
                      </button>
                      {openMenuId === a.id && (
                        <div
                          className={`absolute right-0 top-10 z-20 w-48 rounded-lg border shadow-lg py-1 ${
                            isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => openEdit(a)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                              isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          {a.isPublished !== 1 && (
                            <button
                              onClick={() => handlePublish(a)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                                isDark
                                  ? 'hover:bg-white/5 text-gray-300'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Send size={14} /> Publish
                            </button>
                          )}
                          <button
                            onClick={() => handlePin(a)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                              isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Pin size={14} /> {a.isPinned === 1 ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => confirmDelete(a)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeCommTab === 'chats' && (
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={22} className="text-indigo-500" />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Course Chats</h2>
          </div>
          <MessagingChat height="600px" showVideoCall={true} showVoiceCall={true} isDark={isDark} />
        </div>
      )}

      {activeCommTab === 'messages' && (
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={22} className="text-indigo-500" />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Direct Messages</h2>
          </div>
          <MessagingChat
            height="600px"
            currentUserName="Professor Martinez"
            showVideoCall={false}
            showVoiceCall={true}
            isDark={isDark}
          />
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-2xl ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Content</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Course</label>
                  <CleanSelect
                    value={form.courseId}
                    onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                    className={inputClass}
                  >
                    {courseOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </CleanSelect>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Priority</label>
                    <CleanSelect
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </CleanSelect>
                </div>
              </div>

              <label className={`flex items-center gap-2 text-sm ${textPrimary}`}>
                <input
                  type="checkbox"
                  checked={form.publishNow}
                  onChange={(e) => setForm((f) => ({ ...f, publishNow: e.target.checked }))}
                />
                Publish immediately
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm ${
                  isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                {saving ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-sm ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}>
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Delete this announcement?</h3>
              <p className={`text-sm font-medium ${textPrimary}`}>{deletingAnnouncement.title}</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAnnouncement(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                  isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
