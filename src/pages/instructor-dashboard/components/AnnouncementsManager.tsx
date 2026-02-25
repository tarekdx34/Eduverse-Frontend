import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MessagingChat } from '../../../components/shared';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle,
  Clock,
  FileEdit,
  MoreVertical,
  Paperclip,
  X,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Trash2,
  Edit3,
  Eye,
  Send,
  Upload,
  MessageSquare,
  Users,
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  status: 'published' | 'scheduled' | 'draft';
  audience: string;
  totalRecipients: number;
  reads: number;
  daysAgo?: number;
  scheduledFor?: string;
  attachments: string[];
  course: string;
  priority: 'normal' | 'high';
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Midterm Exam Details - Important',
    content:
      'The midterm exam will be held on March 15th in Hall A. Please bring your student ID and a calculator. The exam covers chapters 1-6.',
    status: 'published',
    audience: 'All Students',
    totalRecipients: 120,
    reads: 94,
    daysAgo: 5,
    attachments: ['exam_guidelines.pdf', 'seating_arrangement.pdf'],
    course: 'CS101',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Office Hours Update',
    content:
      'Starting next week, office hours will be moved to Tuesday and Thursday from 2-4 PM in Room 305.',
    status: 'published',
    audience: 'All Students',
    totalRecipients: 120,
    reads: 87,
    daysAgo: 2,
    attachments: [],
    course: 'CS201',
    priority: 'normal',
  },
  {
    id: 3,
    title: 'Assignment 4 Extension',
    content:
      'Due to the holiday weekend, Assignment 4 deadline has been extended by 48 hours. New deadline is March 20th at 11:59 PM.',
    status: 'scheduled',
    audience: 'All Students',
    totalRecipients: 120,
    reads: 0,
    scheduledFor: 'In 8 hours',
    attachments: [],
    course: 'CS201',
    priority: 'normal',
  },
  {
    id: 4,
    title: 'Guest Lecture - Cloud Computing',
    content:
      'We will have a special guest lecture on Cloud Computing by Dr. Smith from Google on March 25th. Attendance is highly encouraged.',
    status: 'draft',
    audience: 'All Students',
    totalRecipients: 120,
    reads: 0,
    attachments: [],
    course: 'CS101',
    priority: 'normal',
  },
  {
    id: 5,
    title: 'Lab Session Rescheduled',
    content:
      "This week's lab session has been rescheduled from Wednesday to Friday at 3 PM due to maintenance.",
    status: 'draft',
    audience: 'CS101 Students',
    totalRecipients: 45,
    reads: 0,
    attachments: [],
    course: 'CS101',
    priority: 'high',
  },
];

const emptyCourseForm = {
  title: '',
  content: '',
  course: 'CS101',
  audience: 'All Students',
  priority: 'normal' as 'normal' | 'high',
  attachments: [] as string[],
  publishImmediately: true,
  scheduledDate: '',
  scheduledTime: '',
};

export function AnnouncementsManager() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [filter, setFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsAnnouncement, setAnalyticsAnnouncement] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyCourseForm);
  const [activeCommTab, setActiveCommTab] = useState<'announcements' | 'chats' | 'messages'>('announcements');

  const counts = {
    all: announcements.length,
    published: announcements.filter((a) => a.status === 'published').length,
    scheduled: announcements.filter((a) => a.status === 'scheduled').length,
    draft: announcements.filter((a) => a.status === 'draft').length,
  };

  const filtered = announcements.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch =
      !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openCreate = () => {
    setEditingAnnouncement(null);
    setForm(emptyCourseForm);
    setShowCreateModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingAnnouncement(a);
    setForm({
      title: a.title,
      content: a.content,
      course: a.course,
      audience: a.audience,
      priority: a.priority,
      attachments: [...a.attachments],
      publishImmediately: a.status !== 'scheduled',
      scheduledDate: '',
      scheduledTime: '',
    });
    setShowCreateModal(true);
    setOpenMenuId(null);
  };

  const openAnalytics = (a: Announcement) => {
    setAnalyticsAnnouncement(a);
    setShowAnalyticsModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = (a: Announcement) => {
    setDeletingAnnouncement(a);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleDelete = () => {
    if (deletingAnnouncement) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingAnnouncement.id));
    }
    setShowDeleteConfirm(false);
    setDeletingAnnouncement(null);
  };

  const handlePublish = (a: Announcement) => {
    setAnnouncements((prev) =>
      prev.map((ann) =>
        ann.id === a.id ? { ...ann, status: 'published' as const, daysAgo: 0 } : ann
      )
    );
    setOpenMenuId(null);
  };

  const handleSave = (action: 'draft' | 'publish' | 'schedule') => {
    const newId = Math.max(...announcements.map((a) => a.id), 0) + 1;
    const base: Announcement = {
      id: editingAnnouncement?.id ?? newId,
      title: form.title,
      content: form.content,
      course: form.course,
      audience: form.audience,
      priority: form.priority,
      attachments: form.attachments,
      totalRecipients: form.audience === 'All Students' ? 120 : 45,
      reads: editingAnnouncement?.reads ?? 0,
      status: action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'draft',
      daysAgo: action === 'publish' ? 0 : undefined,
      scheduledFor: action === 'schedule' ? `${form.scheduledDate} ${form.scheduledTime}` : undefined,
    };

    if (editingAnnouncement) {
      setAnnouncements((prev) => prev.map((a) => (a.id === base.id ? base : a)));
    } else {
      setAnnouncements((prev) => [base, ...prev]);
    }
    setShowCreateModal(false);
    setForm(emptyCourseForm);
    setEditingAnnouncement(null);
  };

  const addAttachment = () => {
    const name = `file_${form.attachments.length + 1}.pdf`;
    setForm((f) => ({ ...f, attachments: [...f.attachments, name] }));
  };

  const removeAttachment = (idx: number) => {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const statusBadge = (status: string) => {
    if (status === 'published')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
          <CheckCircle size={12} /> Published
        </span>
      );
    if (status === 'scheduled')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
          <Clock size={12} /> Scheduled
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
        <FileEdit size={12} /> Draft
      </span>
    );
  };

  const cardClass = `rounded-xl p-5 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900'}`;
  const modalBg = isDark ? 'bg-[#1e293b] border border-white/10' : 'bg-white';


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Communication Hub Tabs */}
      <div className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
        {([
          { key: 'announcements', label: 'Announcements', icon: Megaphone },
          { key: 'chats', label: 'Course Chats', icon: MessageSquare },
          { key: 'messages', label: 'Direct Messages', icon: Users },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCommTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
              activeCommTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
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

      {/* Announcements Tab - Empty State */}
      {activeCommTab === 'announcements' && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <Megaphone size={48} className={textSecondary} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>No announcements yet</h3>
          <p className={`mb-6 ${textSecondary}`}>Create your first announcement</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} /> New Announcement
          </button>
        </div>
      )}

      {/* Announcements Tab - Content */}
      {activeCommTab === 'announcements' && announcements.length > 0 && (
      <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${textPrimary}`}>
            <Megaphone size={28} className="text-indigo-600" />
            {t('announcements') !== 'announcements' ? t('announcements') : 'Announcements'}
          </h1>
          <p className={`mt-1 ${textSecondary}`}>Create and manage course announcements</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Announcements', value: counts.all, icon: Megaphone, color: 'indigo' },
          { label: 'Published', value: counts.published, icon: CheckCircle, color: 'green' },
          { label: 'Scheduled', value: counts.scheduled, icon: Clock, color: 'amber' },
          { label: 'Drafts', value: counts.draft, icon: FileEdit, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${textPrimary}`}>{stat.value}</p>
              </div>
              <div
                className={`p-2.5 rounded-lg ${
                  stat.color === 'indigo'
                    ? isDark
                      ? 'bg-indigo-500/20'
                      : 'bg-indigo-50'
                    : stat.color === 'green'
                      ? isDark
                        ? 'bg-green-500/20'
                        : 'bg-green-50'
                      : stat.color === 'amber'
                        ? isDark
                          ? 'bg-amber-500/20'
                          : 'bg-amber-50'
                        : isDark
                          ? 'bg-white/10'
                          : 'bg-gray-100'
                }`}
              >
                <stat.icon
                  size={22}
                  className={
                    stat.color === 'indigo'
                      ? 'text-indigo-500'
                      : stat.color === 'green'
                        ? 'text-green-500'
                        : stat.color === 'amber'
                          ? 'text-amber-500'
                          : textSecondary
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'published', label: 'Published' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'draft', label: 'Drafts' },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : isDark
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* Search */}
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

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Megaphone size={40} className={`mx-auto mb-3 ${textSecondary}`} />
            <p className={textPrimary}>No announcements found</p>
            <p className={`text-sm ${textSecondary}`}>Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className={`${cardClass} relative`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 mb-2">
                    {statusBadge(a.status)}
                    {a.attachments.length > 0 && (
                      <span className={`inline-flex items-center gap-1 text-xs ${textSecondary}`}>
                        <Paperclip size={12} /> {a.attachments.length}
                      </span>
                    )}
                    <span
                      className={`ml-auto text-xs ${textSecondary}`}
                    >
                      {a.daysAgo !== undefined ? `${a.daysAgo} days ago` : ''}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}>
                    {a.priority === 'high' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                    {a.title}
                  </h3>

                  {/* Content Preview */}
                  <p className={`mt-1 text-sm line-clamp-2 ${textSecondary}`}>{a.content}</p>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {a.course}
                    </span>
                    <span className={textSecondary}>
                      {a.audience} · {a.totalRecipients} total
                    </span>

                    {a.status === 'published' && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-24 h-1.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                        >
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${Math.round((a.reads / a.totalRecipients) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className={`text-xs ${textSecondary}`}>
                          {a.reads}/{a.totalRecipients} read (
                          {Math.round((a.reads / a.totalRecipients) * 100)}%)
                        </span>
                      </div>
                    )}

                    {a.status === 'scheduled' && a.scheduledFor && (
                      <span className="text-xs text-amber-500 font-medium">
                        Scheduled: {a.scheduledFor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
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
                      className={`absolute right-0 top-10 z-20 w-44 rounded-lg border shadow-lg py-1 ${
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
                      {a.status === 'draft' && (
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
                      {a.status === 'published' && (
                        <button
                          onClick={() => openAnalytics(a)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                            isDark
                              ? 'hover:bg-white/5 text-gray-300'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Eye size={14} /> View Analytics
                        </button>
                      )}
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

      {/* Course Chats Tab */}
      {activeCommTab === 'chats' && (
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={22} className="text-indigo-500" />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Course Chats</h2>
          </div>
          <MessagingChat
            height="600px"
            showVideoCall={true}
            showVoiceCall={true}
          />
        </div>
      )}

      {/* Direct Messages Tab */}
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
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${modalBg}`}>
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
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title"
                  className={inputClass}
                />
              </div>

              {/* Content */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your announcement..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Course & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Course</label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="CS101">CS101</option>
                    <option value="CS201">CS201</option>
                    <option value="CS301">CS301</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="All Students">All Students</option>
                    <option value="Course Students Only">Course Students Only</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value as 'normal' | 'high' }))
                  }
                  className={inputClass}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Attachments */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Attachments</label>
                {form.attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {form.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          isDark ? 'bg-white/5' : 'bg-gray-50'
                        }`}
                      >
                        <span className={`flex items-center gap-2 ${textSecondary}`}>
                          <Paperclip size={14} /> {file}
                        </span>
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={addAttachment}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Upload size={14} /> Add Attachment
                </button>
              </div>

              {/* Publish Toggle */}
              <div>
                <label className={`flex items-center gap-3 cursor-pointer ${textPrimary}`}>
                  <div
                    onClick={() =>
                      setForm((f) => ({ ...f, publishImmediately: !f.publishImmediately }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.publishImmediately ? 'bg-indigo-600' : isDark ? 'bg-white/20' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.publishImmediately ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {form.publishImmediately ? 'Publish Immediately' : 'Schedule for Later'}
                  </span>
                </label>
              </div>

              {/* Schedule pickers */}
              {!form.publishImmediately && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Date</label>
                    <input
                      type="date"
                      value={form.scheduledDate}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Time</label>
                    <input
                      type="time"
                      value={form.scheduledTime}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={!form.title.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Save Draft
              </button>
              {form.publishImmediately ? (
                <button
                  onClick={() => handleSave('publish')}
                  disabled={!form.title.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => handleSave('schedule')}
                  disabled={!form.title.trim() || !form.scheduledDate}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && analyticsAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-lg ${modalBg}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}>
                <BarChart3 size={20} className="text-indigo-500" /> Analytics
              </h2>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <h3 className={`font-semibold ${textPrimary}`}>{analyticsAnnouncement.title}</h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cardClass}>
                  <p className={`text-sm ${textSecondary}`}>Total Views</p>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{analyticsAnnouncement.reads}</p>
                </div>
                <div className={cardClass}>
                  <p className={`text-sm ${textSecondary}`}>Read Rate</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {Math.round(
                        (analyticsAnnouncement.reads / analyticsAnnouncement.totalRecipients) * 100
                      )}
                      %
                    </p>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                        strokeWidth="4"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="4"
                        strokeDasharray={`${(analyticsAnnouncement.reads / analyticsAnnouncement.totalRecipients) * 100.5} 100.5`}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div>
                <p className={`text-sm font-medium mb-3 ${textPrimary}`}>Views over 7 days</p>
                <div className="flex items-end gap-2 h-24">
                  {[12, 18, 25, 15, 10, 8, 6].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-indigo-500"
                        style={{ height: `${(v / 25) * 100}%` }}
                      />
                      <span className={`text-[10px] ${textSecondary}`}>D{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${
                  isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
                }`}
              >
                <Sparkles size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium mb-1 ${textPrimary}`}>AI Insight</p>
                  <p className={`text-sm ${textSecondary}`}>
                    Students are most active between 6-8 PM. Consider publishing during these hours
                    for maximum engagement.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-sm ${modalBg}`}>
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                Delete this announcement?
              </h3>
              <p className={`text-sm mb-1 ${textSecondary}`}>
                This action cannot be undone.
              </p>
              <p className={`text-sm font-medium ${textPrimary}`}>{deletingAnnouncement.title}</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAnnouncement(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
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
