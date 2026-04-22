import { ReactNode, useMemo, useState, useEffect, type ComponentType } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Download,
  Edit2,
  Edit3,
  Eye,
  FileText,
  FileEdit,
  Lightbulb,
  Link,
  Loader2,
  Megaphone,
  MoreVertical,
  Pin,
  Plus,
  Search,
  Sparkles,
  Send,
  Trash2,
  User,
  Users,
  X,
  CheckCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Announcement } from '../../../services/api/announcementService';
import type {
  AnalyticsDashboardData,
  AttendanceTrendPoint,
  AtRiskStudentsData,
  GradeDistributionData,
} from '../../../services/api/analyticsService';
import type { CourseMaterial, SectionSchedule } from '../../../services/api/courseService';
import type { TeachingCourse } from '../../../services/api/enrollmentService';
import type { Lab, LabSubmission, LabWithInstructions } from '../../../services/api/labService';
import type { Notification } from '../../../services/api/notificationService';
import type { Quiz, QuizAttempt, QuizQuestion } from '../../../services/api/quizService';
import type { AcademicEvent, ScheduleItem } from '../../../services/api/scheduleService';
import { CleanSelect } from '../../../components/shared';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

/** API may return `monday`, `MONDAY`, or enum-style values — normalize for display */
function formatDayOfWeekLabel(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === '') return '—';
  const normalized = String(raw).trim().toLowerCase().replace(/_/g, '');
  const map: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  if (map[normalized]) return map[normalized];
  return String(raw)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatScheduleTypeLabel(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === '') return '—';
  const s = String(raw).trim().toLowerCase();
  const map: Record<string, string> = {
    lecture: 'Lecture',
    lab: 'Lab',
    tutorial: 'Tutorial',
    exam: 'Exam',
    other: 'Other',
    seminar: 'Seminar',
  };
  if (map[s]) return map[s];
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatLabStatusLabel(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === '') return '—';
  const s = String(raw).trim().toLowerCase();
  const map: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    closed: 'Closed',
  };
  if (map[s]) return map[s];
  return formatScheduleTypeLabel(raw);
}

/** Prefer readable times when API sends HH:MM:SS */
function formatScheduleTime(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === '') return '';
  const t = String(raw).trim();
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return t;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return t;
  const d = new Date();
  d.setHours(h, min, m[3] ? parseInt(m[3], 10) : 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function SectionPanelEmpty({
  icon: Icon,
  title,
  description,
  isDark,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center ${
        isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/80'
      }`}
    >
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
          isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
      {description ? (
        <p className={`mt-1 max-w-sm text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Icon + title row: `leading-none` on the heading aligns optically with Lucide icons */
function CourseSectionHeading({
  icon: Icon,
  isDark,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <Icon className="size-5 shrink-0 text-blue-500" aria-hidden />
      <h3 className={`m-0 text-lg font-semibold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </h3>
    </div>
  );
}

export function FeatureOverlay({
  title,
  description,
  type = 'backend',
  children,
}: {
  title: string;
  description: string;
  type?: 'ai' | 'backend';
  children: ReactNode;
}) {
  const { isDark } = useTheme();

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-20 transition-opacity duration-300">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6 backdrop-blur-[2px]">
        <div
          className={`max-w-xl rounded-2xl border px-8 py-7 text-center shadow-2xl transition-all ${
            isDark
              ? 'border-white/10 bg-slate-900/90 text-white'
              : 'border-gray-200 bg-white/95 text-gray-900 shadow-gray-200/50'
          }`}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-inherit shadow-inner">
            {type === 'ai' ? (
              <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
            ) : (
              <Link className="h-8 w-8 text-blue-500" />
            )}
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight italic">{title}</h3>
          <p className={`mt-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BackendStatusBanner({ message }: { message: string }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        isDark
          ? 'border-blue-500/20 bg-blue-500/5 text-blue-400'
          : 'border-blue-200 bg-blue-50 text-blue-700'
      }`}
    >
      <Link className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function AIStatusBanner({ message }: { message: string }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        isDark
          ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}
    >
      <Sparkles className="h-5 w-5 shrink-0 animate-pulse" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

type AnnouncementFormValue = {
  title: string;
  content: string;
  courseId: string;
};

type LiveAnnouncementsPageProps = {
  announcements: Announcement[];
  loading?: boolean;
  courseOptions: { value: string; label: string }[];
  onCreate: (value: AnnouncementFormValue) => Promise<unknown> | void;
  onUpdate: (id: string, data: any) => Promise<unknown> | void;
  onDelete: (id: string) => Promise<unknown> | void;
  onPublish: (id: string) => Promise<unknown> | void;
  onPin: (id: string, isPinned: boolean) => Promise<unknown> | void;
  pinDisabledReason: string | null;
};

export function LiveAnnouncementsPage({
  announcements,
  loading = false,
  courseOptions,
  onCreate,
  onUpdate,
  onDelete,
  onPublish,
  onPin,
  pinDisabledReason,
}: LiveAnnouncementsPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const [formValue, setFormValue] = useState<AnnouncementFormValue>({
    title: '',
    content: '',
    courseId: courseOptions[0]?.value || '',
  });

  const counts = useMemo(
    () => ({
      all: announcements.length,
      published: announcements.filter((a) => a.isPublished === 1).length,
      draft: announcements.filter((a) => a.isPublished !== 1).length,
    }),
    [announcements]
  );

  const visibleAnnouncements = useMemo(
    () =>
      announcements.filter((a) => {
        const matchesCourse = filterCourse === 'all' || String(a.courseId) === filterCourse;
        const status = a.isPublished === 1 ? 'published' : 'draft';
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        const target = `${a.title} ${a.content}`.toLowerCase();
        const matchesSearch = !searchTerm || target.includes(searchTerm.toLowerCase());
        return matchesCourse && matchesStatus && matchesSearch;
      }),
    [announcements, filterCourse, filterStatus, searchTerm]
  );

  const openCreate = () => {
    setEditingAnnouncement(null);
    setFormValue({
      title: '',
      content: '',
      courseId: courseOptions[0]?.value || '',
    });
    setShowForm(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormValue({
      title: announcement.title,
      content: announcement.content,
      courseId: String(announcement.courseId || courseOptions[0]?.value || ''),
    });
    setShowForm(true);
    setOpenMenuId(null);
  };

  const submit = async () => {
    if (!formValue.title.trim() || !formValue.content.trim() || !formValue.courseId) return;
    setIsSubmitting(true);
    try {
      if (editingAnnouncement) {
        await onUpdate(editingAnnouncement.id, {
          title: formValue.title.trim(),
          content: formValue.content.trim(),
        });
      } else {
        await onCreate(formValue);
      }
      setShowForm(false);
      setEditingAnnouncement(null);
      setFormValue({
        title: '',
        content: '',
        courseId: courseOptions[0]?.value || '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;
    try {
      await onDelete(deletingAnnouncement.id);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingAnnouncement(null);
    }
  };

  const badge = (isPublished: boolean) =>
    isPublished ? (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          isDark
            ? 'bg-emerald-500/15 border border-emerald-400/25 text-emerald-300'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}
      >
        <CheckCircle size={12} /> Published
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-400">
        <FileEdit size={12} /> Draft
      </span>
    );

  const cardClass = `rounded-xl p-5 border ${
    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
  }`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {t('announcements')}
          </h2>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Manage and post announcements for your assigned courses.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Announcement
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
          />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All Status' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === f.key
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${cardClass} overflow-x-auto`}
      >
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setFilterCourse('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterCourse === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : isDark
                  ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Courses
          </button>
          {courseOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterCourse(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterCourse === option.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {pinDisabledReason && <BackendStatusBanner message={pinDisabledReason} />}

      {loading ? (
        <div className={`${cardClass} flex items-center justify-center py-20`}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className={textSecondary}>Loading announcements...</p>
          </div>
        </div>
      ) : visibleAnnouncements.length === 0 ? (
        <div className={`${cardClass} py-20 text-center`}>
          <Megaphone size={48} className={`mx-auto mb-4 ${textSecondary} opacity-20`} />
          <h3 className={`text-lg font-semibold ${textPrimary}`}>No announcements found</h3>
          <p className={`mt-1 ${textSecondary}`}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAnnouncements.map((a) => {
            const isPublished = a.isPublished === 1;
            const isPinned = a.isPinned === 1;
            const courseLabel = a.course?.code
              ? `${a.course.code} - ${a.course?.name || ''}`
              : 'General';

            return (
              <div
                key={a.id}
                className={`${cardClass} relative group transition-all hover:border-blue-500/50 ${
                  isPinned ? (isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50/30') : ''
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {badge(isPublished)}
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          <Pin size={12} className="fill-current" /> Pinned
                        </span>
                      )}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          a.priority === 'urgent'
                            ? 'bg-red-500 text-white'
                            : a.priority === 'high'
                              ? 'bg-orange-500 text-white'
                              : a.priority === 'medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-400 text-white'
                        }`}
                      >
                        {a.priority || 'low'}
                      </span>
                    </div>

                    <h3 className={`text-lg font-bold leading-tight ${textPrimary}`}>
                      {a.title}
                    </h3>
                    
                    <div
                      className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${textSecondary}`}
                    >
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{courseLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(a.publishedAt || a.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{a.viewCount ?? 0} views</span>
                      </div>
                    </div>

                    <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {a.content}
                    </p>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MoreVertical size={20} className={textSecondary} />
                    </button>
                    {openMenuId === a.id && (
                      <div
                        className={`absolute right-0 top-10 z-20 w-48 rounded-xl border shadow-xl py-2 ${
                          isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => openEdit(a)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                            isDark
                              ? 'hover:bg-white/5 text-slate-300'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        {!isPublished && (
                          <button
                            onClick={() => void onPublish(a.id)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                              isDark
                                ? 'hover:bg-white/5 text-slate-300'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Send size={16} /> Publish
                          </button>
                        )}
                        <button
                          onClick={() => void onPin(a.id, !isPinned)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                            isDark
                              ? 'hover:bg-white/5 text-slate-300'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Pin size={16} /> {isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <div className="my-1 border-t border-inherit" />
                        <button
                          onClick={() => confirmDelete(a)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => {
          if (isSubmitting) return;
          setShowForm(false);
          setEditingAnnouncement(null);
        }}>
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in duration-200 ${
              isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-900'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-inherit px-6 py-4 bg-slate-50/50 dark:bg-white/2">
              <div>
                <h3 className="text-xl font-bold">
                  {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                </h3>
                <p className={`mt-1 text-sm ${textSecondary}`}>
                  {editingAnnouncement 
                    ? 'Update the announcement details for your students.' 
                    : 'Create a draft announcement for one of your assigned courses.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (isSubmitting) return;
                  setShowForm(false);
                  setEditingAnnouncement(null);
                }}
                disabled={isSubmitting}
                className={`rounded-full p-2 transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6">
              <div>
                <label
                  htmlFor="ta-announcement-title"
                  className={`mb-2 block text-sm font-bold ${textPrimary}`}
                >
                  Title
                </label>
                <input
                  id="ta-announcement-title"
                  type="text"
                  value={formValue.title}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="e.g., Important: Lab 3 Rescheduled"
                  className={inputClass}
                />
              </div>

              {!editingAnnouncement && (
                <div>
                  <label
                    htmlFor="ta-announcement-course"
                    className={`mb-2 block text-sm font-bold ${textPrimary}`}
                  >
                    Course
                  </label>
                  <CleanSelect
                    value={formValue.courseId}
                    onChange={(event) =>
                      setFormValue((current) => ({ ...current, courseId: event.target.value }))
                    }
                    id="ta-announcement-course"
                    className={inputClass}
                  >
                    {courseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CleanSelect>
                </div>
              )}

              <div>
                <label
                  htmlFor="ta-announcement-content"
                  className={`mb-2 block text-sm font-bold ${textPrimary}`}
                >
                  Message
                </label>
                <textarea
                  id="ta-announcement-content"
                  rows={8}
                  value={formValue.content}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder="Provide clear details for your students..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-inherit bg-slate-50/50 dark:bg-white/2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAnnouncement(null);
                }}
                disabled={isSubmitting}
                className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Cancel
              </button>
              <button
                onClick={() => void submit()}
                disabled={isSubmitting || !formValue.title.trim() || !formValue.content.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingAnnouncement ? (
                  <Edit2 className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? 'Processing...' : editingAnnouncement ? 'Update Announcement' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingAnnouncement && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 animate-in fade-in zoom-in duration-200 ${
              isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-900'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Announcement?</h3>
            <p className={`text-sm text-center mb-6 ${textSecondary}`}>
              Are you sure you want to delete <span className="font-bold text-red-500">"{deletingAnnouncement.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete()}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 shadow-lg shadow-red-500/20 active:scale-95"
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

type LiveNotificationsPageProps = {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead: (id: string) => Promise<unknown> | void;
  onMarkAllAsRead: () => Promise<unknown> | void;
  onClearAll: () => Promise<unknown> | void;
};

export function LiveNotificationsPage({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: LiveNotificationsPageProps) {
  const { isDark } = useTheme();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void onMarkAllAsRead()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </button>
          <button
            onClick={() => void onClearAll()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <Bell className="mx-auto mb-3 h-10 w-10 text-blue-500" />
          No live notifications found.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-5 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              } ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {notification.body}
                  </p>
                  <div className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => void onMarkAsRead(notification.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4" />
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type LiveSchedulePageProps = {
  dailySchedule: ScheduleItem[];
  academicEvents: AcademicEvent[];
  loading?: boolean;
};

export function LiveSchedulePage({
  dailySchedule,
  academicEvents,
  loading = false,
}: LiveSchedulePageProps) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Schedule
        </h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          Live schedule data from the backend.
        </p>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Loading schedule...
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border p-5 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Today
              </h3>
            </div>
            {dailySchedule.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                No scheduled items for today.
              </p>
            ) : (
              <div className="space-y-3">
                {dailySchedule.map((item, index) => (
                  <div
                    key={item.scheduleId ?? `${item.sectionId}-${index}`}
                    className={`rounded-lg border p-4 ${
                      isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.courseCode} - {item.courseName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          Section {item.sectionId} • {item.startTime} - {item.endTime}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.type || item.day}
                      </span>
                    </div>
                    <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Room: {item.room}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`rounded-xl border p-5 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Academic Calendar
              </h3>
            </div>
            {academicEvents.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                No academic calendar events available.
              </p>
            ) : (
              <div className="space-y-3">
                {academicEvents.slice(0, 8).map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-lg border p-4 ${
                      isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {event.title}
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {event.description || 'No description'}
                    </p>
                    <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(event.startDate).toLocaleDateString()} -{' '}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type LiveStudentRow = {
  id: string;
  userId: number;
  studentName?: string;
  studentEmail?: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  status: string;
  grade: string | null;
  finalScore: number | null;
  enrollmentDate: string;
};

type LiveStudentsPageProps = {
  students: LiveStudentRow[];
  loading?: boolean;
};

export function LiveStudentsPage({ students, loading = false }: LiveStudentsPageProps) {
  const { isDark } = useTheme();
  const [filterCourse, setFilterCourse] = useState('all');

  const courseOptions = useMemo(
    () =>
      Array.from(
        new Map(
          students.map((student) => [student.courseCode, `${student.courseCode} - ${student.courseName}`])
        ).entries()
      ),
    [students]
  );

  const visibleStudents = students.filter((student) =>
    filterCourse === 'all' ? true : student.courseCode === filterCourse
  );

  const averageScore =
    visibleStudents.filter((student) => student.finalScore !== null).length > 0
      ? Math.round(
          visibleStudents.reduce((sum, student) => sum + (student.finalScore || 0), 0) /
            visibleStudents.filter((student) => student.finalScore !== null).length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Students
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Basic live roster data from assigned sections.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`rounded-lg border px-4 py-3 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}
          >
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Rows</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {students.length}
            </p>
          </div>
          <div
            className={`rounded-lg border px-4 py-3 ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}
          >
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Avg Score</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {averageScore}%
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCourse('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterCourse === 'all'
                ? 'bg-blue-600 text-white'
                : isDark
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Courses
          </button>
          {courseOptions.map(([courseCode, label]) => (
            <button
              key={courseCode}
              onClick={() => setFilterCourse(courseCode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filterCourse === courseCode
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Loading roster...
        </div>
      ) : visibleStudents.length === 0 ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <Users className="mx-auto mb-3 h-10 w-10 text-blue-500" />
          No student rows available.
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-xl border ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Course
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Section
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Score
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={isDark ? 'border-t border-white/10' : 'border-t border-gray-100'}
                  >
                    <td className={`px-5 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        {student.studentName || `Student #${student.userId}`}
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.studentEmail || '—'}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.courseCode} - {student.courseName}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      Section {student.sectionNumber}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.status}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.finalScore ?? student.grade ?? 'N/A'}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type LiveAnalyticsPageProps = {
  summary?: AnalyticsDashboardData | null;
  attendanceTrends?: AttendanceTrendPoint[];
  gradeDistribution?: GradeDistributionData | null;
  atRiskData?: AtRiskStudentsData | null;
  courseOptions: { value: string; label: string }[];
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  loading?: boolean;
};

const GRADE_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

export function LiveAnalyticsPage({
  summary,
  attendanceTrends = [],
  gradeDistribution,
  atRiskData,
  courseOptions,
  selectedCourseId,
  onCourseChange,
  loading = false,
}: LiveAnalyticsPageProps) {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const summaryCards = [
    {
      label: 'Courses',
      value: Number(summary?.totalCourses || 0),
      helper: 'Assigned courses',
      icon: BarChart3,
      tone: 'blue',
    },
    {
      label: 'Students',
      value: Number(summary?.totalStudents || 0),
      helper: 'Across assigned courses',
      icon: Users,
      tone: 'emerald',
    },
    {
      label: 'Avg Grade',
      value: `${Math.round(Number(summary?.averageGrade || 0))}%`,
      helper: 'Latest analytics average',
      icon: Check,
      tone: 'amber',
    },
    {
      label: 'Attendance',
      value: `${Math.round(Number(summary?.averageAttendance || 0))}%`,
      helper: 'Latest attendance average',
      icon: Calendar,
      tone: 'violet',
    },
  ] as const;

  const toneClasses = {
    blue: isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700',
    emerald: isDark
      ? 'bg-emerald-500/15 text-emerald-300'
      : 'bg-emerald-50 text-emerald-700',
    amber: isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700',
    violet: isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-700',
  };

  const scoreBars =
    gradeDistribution?.distribution?.map((row) => ({
      range: row.grade,
      value: Number(row.count || 0),
    })) || [];

  const riskRows = atRiskData?.atRiskStudents || [];

  if (loading) {
    return (
      <div
        className={`rounded-xl border p-10 text-center ${
          isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
        }`}
      >
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Analytics
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Basic live analytics from the backend for your assigned TA courses.
          </p>
        </div>
        <div className="w-full lg:w-80">
          <CleanSelect
            value={selectedCourseId}
            onChange={(event) => onCourseChange(event.target.value)}
            className={`w-full rounded-lg border px-4 py-3 text-sm ${
              isDark
                ? 'border-white/10 bg-white/5 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            {courseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </CleanSelect>
        </div>
      </div>

      {courseOptions.length === 0 ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          No assigned courses were found for live analytics.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`rounded-2xl border p-5 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {card.label}
                      </p>
                      <p className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {card.value}
                      </p>
                    </div>
                    <div className={`rounded-2xl p-3 ${toneClasses[card.tone]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className={`mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {card.helper}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Attendance Trends
                </h3>
              </div>
              {attendanceTrends.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  No attendance trend data is available for the selected course.
                </p>
              ) : (
                <div className="h-72">
                  {mounted ? (
                    <ResponsiveContainer width="99.9%" height={280} minWidth={0} minHeight={0}>
                      <BarChart
                        data={attendanceTrends.map((row) => ({
                          date: new Date(row.date).toLocaleDateString(),
                          value: Math.round(Number(row.averageAttendance || 0)),
                        }))}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: isDark ? '#fff' : '#111827',
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-pulse w-full h-full bg-gray-200/50 dark:bg-gray-700/50 rounded-lg"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Grade Distribution
                </h3>
              </div>
              {scoreBars.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  No grade distribution data is available for the selected course.
                </p>
              ) : (
                <div className="h-72">
                  {mounted ? (
                    <ResponsiveContainer width="99.9%" height={280} minWidth={0} minHeight={0}>
                      <BarChart data={scoreBars}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
                        />
                        <XAxis
                          dataKey="range"
                          tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: isDark ? '#fff' : '#111827',
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {scoreBars.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-pulse w-full h-full bg-gray-200/50 dark:bg-gray-700/50 rounded-lg"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  At-Risk Students
                </h3>
              </div>
              {riskRows.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  No at-risk students were reported for the selected scope.
                </p>
              ) : (
                <div className="space-y-3">
                  {riskRows.slice(0, 8).map((student) => (
                    <div
                      key={`${student.courseId}-${student.userId}`}
                      className={`rounded-xl border p-4 ${
                        isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {student.userName || `Student #${student.userId}`}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            Average score: {Math.round(Number(student.averageScore || 0))}% • Completion:{' '}
                            {Math.round(Number(student.completionPercentage || 0))}%
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          Needs attention
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Insights
                </h3>
              </div>
              <div
                className={`rounded-xl border border-dashed p-6 ${
                  isDark ? 'border-white/10 bg-slate-900/30' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI insights are not connected yet.
                </p>
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  This live page currently supports backend summary metrics, attendance trends, grade
                  distribution, and at-risk students only.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type LiveQuizQuestionDraft = {
  id: number;
  existingQuestionId?: number;
  text: string;
  options: string[];
  correctOption: number;
};

type LiveQuizzesPageProps = {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  loading?: boolean;
  courseOptions: { value: string; label: string }[];
  aiDisabledReason: string;
  analyticsDisabledReason: string;
  onCreateQuiz: (value: {
    courseId: string;
    title: string;
    description: string;
    timeLimitMinutes: string;
    maxAttempts: string;
    passingScore: string;
    weight: string;
    availableFrom: string;
    availableUntil: string;
    questions: LiveQuizQuestionDraft[];
  }) => Promise<unknown> | void;
  onLoadQuizDetails: (quizId: string) => Promise<Quiz & { questions?: QuizQuestion[] }>;
  onUpdateQuiz: (
    quizId: string,
    value: {
      courseId: string;
      title: string;
      description: string;
      timeLimitMinutes: string;
      maxAttempts: string;
      passingScore: string;
      weight: string;
      availableFrom: string;
      availableUntil: string;
      questions: LiveQuizQuestionDraft[];
    }
  ) => Promise<unknown> | void;
  onDeleteQuiz: (quizId: string) => Promise<unknown> | void;
};

const emptyQuizDraftQuestion = (id: number): LiveQuizQuestionDraft => ({
  id,
  text: '',
  options: ['', '', '', ''],
  correctOption: 0,
});

const getLiveQuizStatus = (quiz: Quiz) => {
  const now = new Date();
  const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
  const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

  if (availableUntil && availableUntil < now) {
    return { label: 'Closed', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' };
  }

  if (availableFrom && availableFrom > now) {
    return { label: 'Upcoming', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' };
  }

  return { label: 'Available', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' };
};

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export function LiveQuizzesPage({
  quizzes,
  attempts,
  loading = false,
  courseOptions,
  aiDisabledReason,
  analyticsDisabledReason,
  onCreateQuiz,
  onLoadQuizDetails,
  onUpdateQuiz,
  onDeleteQuiz,
}: LiveQuizzesPageProps) {
  const { isDark } = useTheme();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [attemptsQuizId, setAttemptsQuizId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [formValue, setFormValue] = useState({
    courseId: courseOptions[0]?.value || '',
    title: '',
    description: '',
    timeLimitMinutes: '',
    maxAttempts: '1',
    passingScore: '',
    weight: '',
    availableFrom: '',
    availableUntil: '',
    questions: [emptyQuizDraftQuestion(1)],
  });

  const visibleQuizzes = useMemo(
    () =>
      selectedCourseId
        ? quizzes.filter((quiz) => String(quiz.courseId) === selectedCourseId)
        : quizzes,
    [quizzes, selectedCourseId]
  );

  const attemptsByQuizId = useMemo(() => {
    const map = new Map<string, QuizAttempt[]>();
    attempts.forEach((attempt) => {
      const quizId = String(attempt.quizId);
      const current = map.get(quizId) || [];
      current.push(attempt);
      map.set(quizId, current);
    });
    return map;
  }, [attempts]);

  const selectedQuizAttempts = attemptsQuizId ? attemptsByQuizId.get(attemptsQuizId) || [] : [];
  const selectedQuiz = attemptsQuizId
    ? quizzes.find((quiz) => String(quiz.id) === attemptsQuizId) || null
    : null;

  const resetForm = () => {
    setEditingQuizId(null);
    setFormValue({
      courseId: selectedCourseId || courseOptions[0]?.value || '',
      title: '',
      description: '',
      timeLimitMinutes: '',
      maxAttempts: '1',
      passingScore: '',
      weight: '',
      availableFrom: '',
      availableUntil: '',
      questions: [emptyQuizDraftQuestion(1)],
    });
  };

  const submitCreate = async () => {
    if (!formValue.title.trim() || !formValue.courseId) return;
    if (editingQuizId) {
      await onUpdateQuiz(editingQuizId, formValue);
    } else {
      await onCreateQuiz(formValue);
    }
    setShowCreateModal(false);
    resetForm();
  };

  const openEditModal = async (quizId: string) => {
    const details = await onLoadQuizDetails(quizId);
    setEditingQuizId(quizId);
    setFormValue({
      courseId: String(details.courseId),
      title: details.title || '',
      description: details.description || '',
      timeLimitMinutes: details.timeLimitMinutes ? String(details.timeLimitMinutes) : '',
      maxAttempts: details.maxAttempts ? String(details.maxAttempts) : '1',
      passingScore: details.passingScore ? String(details.passingScore) : '',
      weight: details.weight ? String(details.weight) : '',
      availableFrom: toDateTimeLocalValue(details.availableFrom),
      availableUntil: toDateTimeLocalValue(details.availableUntil),
      questions:
        details.questions && details.questions.length > 0
          ? details.questions.map((question, index) => ({
              id: index + 1,
              existingQuestionId: question.id,
              text: question.questionText || '',
              options:
                question.options && question.options.length > 0
                  ? [...question.options, '', '', '', ''].slice(0, 4)
                  : ['', '', '', ''],
              correctOption: question.correctAnswer ? Number(question.correctAnswer) || 0 : 0,
            }))
          : [emptyQuizDraftQuestion(1)],
    });
    setShowCreateModal(true);
  };

  const addQuestion = () => {
    setFormValue((current) => ({
      ...current,
      questions: [...current.questions, emptyQuizDraftQuestion(current.questions.length + 1)],
    }));
  };

  const removeQuestion = (questionId: number) => {
    setFormValue((current) => ({
      ...current,
      questions:
        current.questions.length > 1
          ? current.questions.filter((question) => question.id !== questionId)
          : current.questions,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quiz Management
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Live quizzes connected to the backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create New Quiz
          </button>
          <button
            disabled
            title={aiDisabledReason}
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-300"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
        </div>
      </div>

      {aiDisabledReason && <AIStatusBanner message={aiDisabledReason} />}

      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCourseId('')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              selectedCourseId === ''
                ? 'bg-blue-600 text-white'
                : isDark
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Courses
          </button>
          {courseOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCourseId(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedCourseId === option.value
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Loading quizzes...
        </div>
      ) : visibleQuizzes.length === 0 ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          No quizzes found for the selected course.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleQuizzes.map((quiz) => {
            const status = getLiveQuizStatus(quiz);
            const quizAttempts = attemptsByQuizId.get(String(quiz.id)) || [];
            const gradedAttempts = quizAttempts.filter((attempt) => attempt.score !== null);
            const averageScore = gradedAttempts.length
              ? Math.round(
                  gradedAttempts.reduce(
                    (sum, attempt) => sum + Number(attempt.score || 0),
                    0
                  ) / gradedAttempts.length
                )
              : null;

            return (
              <div
                key={quiz.id}
                className={`rounded-xl border p-5 shadow-sm ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`truncate font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {quiz.title}
                    </h3>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {quiz.course?.name || courseOptions.find((option) => option.value === String(quiz.courseId))?.label || 'Course'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className={`mb-4 flex flex-wrap gap-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'No limit'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {quizAttempts.length} attempts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" />
                    {averageScore !== null ? `${averageScore} avg score` : 'No scores yet'}
                  </span>
                </div>

                <div className={`mb-4 space-y-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <p>Available From: {quiz.availableFrom ? new Date(quiz.availableFrom).toLocaleString() : 'Immediately'}</p>
                  <p>Available Until: {quiz.availableUntil ? new Date(quiz.availableUntil).toLocaleString() : 'No closing date'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAttemptsQuizId(String(quiz.id))}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Attempts
                  </button>
                  <button
                    onClick={() => void openEditModal(String(quiz.id))}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Quiz
                  </button>
                  <button
                    disabled
                    title={aiDisabledReason}
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate with AI
                  </button>
                  <button
                    disabled
                    title={analyticsDisabledReason}
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg bg-slate-500/20 px-3 py-1.5 text-xs font-medium text-slate-400"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Analyze Results
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this quiz? This cannot be undone.')) {
                        void onDeleteQuiz(String(quiz.id));
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className={`my-8 w-full max-w-4xl rounded-3xl border p-6 shadow-2xl ${
            isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-gray-200 bg-white text-gray-900'
          }`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}
                </h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {editingQuizId
                    ? 'Update the quiz settings and questions.'
                    : 'Create the quiz and its questions in one step.'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`rounded-lg p-2 transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Course</span>
                <CleanSelect
                  value={formValue.courseId}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, courseId: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {courseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CleanSelect>
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Quiz Title</span>
                <input
                  type="text"
                  value={formValue.title}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Example: Lab 4 Quiz"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</span>
                <textarea
                  rows={3}
                  value={formValue.description}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Describe what this quiz covers."
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Duration in Minutes</span>
                <input
                  type="number"
                  min="1"
                  value={formValue.timeLimitMinutes}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, timeLimitMinutes: event.target.value }))
                  }
                  placeholder="Example: 20"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Maximum Attempts</span>
                <input
                  type="number"
                  min="1"
                  value={formValue.maxAttempts}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, maxAttempts: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Passing Score %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formValue.passingScore}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, passingScore: event.target.value }))
                  }
                  placeholder="Example: 60"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Weight in Final Grade</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formValue.weight}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, weight: event.target.value }))
                  }
                  placeholder="Example: 10"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Available From</span>
                <input
                  type="datetime-local"
                  value={formValue.availableFrom}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, availableFrom: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Available Until</span>
                <input
                  type="datetime-local"
                  value={formValue.availableUntil}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, availableUntil: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </label>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Questions
                </h4>
                <button
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {formValue.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className={`rounded-2xl border p-4 ${
                      isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Question {questionIndex + 1}
                      </h5>
                      {formValue.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(question.id)}
                          className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      value={question.text}
                      onChange={(event) =>
                        setFormValue((current) => ({
                          ...current,
                          questions: current.questions.map((item) =>
                            item.id === question.id ? { ...item, text: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Enter the question text."
                      className={`mb-3 w-full rounded-lg border px-4 py-3 text-sm ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`quiz-correct-${question.id}`}
                            checked={question.correctOption === optionIndex}
                            onChange={() =>
                              setFormValue((current) => ({
                                ...current,
                                questions: current.questions.map((item) =>
                                  item.id === question.id
                                    ? { ...item, correctOption: optionIndex }
                                    : item
                                ),
                              }))
                            }
                            className="accent-indigo-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              setFormValue((current) => ({
                                ...current,
                                questions: current.questions.map((item) =>
                                  item.id === question.id
                                    ? {
                                        ...item,
                                        options: item.options.map((value, index) =>
                                          index === optionIndex ? event.target.value : value
                                        ),
                                      }
                                    : item
                                ),
                              }))
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            className={`flex-1 rounded-lg border px-4 py-3 text-sm ${
                              isDark
                                ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                            }`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isDark ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => void submitCreate()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                {editingQuizId ? 'Save Changes' : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {attemptsQuizId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAttemptsQuizId(null)}
          />
          <div className={`relative z-10 w-full max-w-3xl rounded-3xl border p-6 shadow-2xl ${
            isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-gray-200 bg-white text-gray-900'
          }`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedQuiz?.title || 'Quiz Attempts'}</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Live attempts from the backend.
                </p>
              </div>
              <button
                onClick={() => setAttemptsQuizId(null)}
                className={`rounded-lg p-2 transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedQuizAttempts.length === 0 ? (
              <div className={`rounded-xl border p-8 text-center ${
                isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
                No attempts found for this quiz yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                      <th className="py-2 pr-4 text-left">Student</th>
                      <th className="py-2 pr-4 text-left">Status</th>
                      <th className="py-2 pr-4 text-left">Started</th>
                      <th className="py-2 pr-4 text-left">Submitted</th>
                      <th className="py-2 text-left">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuizAttempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attempt.user
                            ? `${attempt.user.firstName} ${attempt.user.lastName}`
                            : `Student #${attempt.userId}`}
                        </td>
                        <td className={`py-3 pr-4 capitalize ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {attempt.status.replace('_', ' ')}
                        </td>
                        <td className={`py-3 pr-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {new Date(attempt.startedAt).toLocaleString()}
                        </td>
                        <td className={`py-3 pr-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Not submitted'}
                        </td>
                        <td className={`py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {attempt.score !== null ? Number(attempt.score) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type LiveCourseDetailsPageProps = {
  course: TeachingCourse;
  instructorName: string;
  materials: CourseMaterial[];
  schedules: SectionSchedule[];
  labs: Lab[];
  announcements: Announcement[];
  students: LiveStudentRow[];
  onBack: () => void;
  materialsDisabledReason: string;
  /** When set, shows a banner so Mock vs Live side-by-side is obvious */
  mockDataBanner?: string;
  /** When set (typically Live mode only), shows that this view is backed by API data */
  liveDataBanner?: string;
};

export function LiveCourseDetailsPage({
  course,
  instructorName,
  materials,
  schedules,
  labs,
  announcements,
  students,
  onBack,
  materialsDisabledReason,
  mockDataBanner,
  liveDataBanner,
}: LiveCourseDetailsPageProps) {
  const { isDark } = useTheme();

  const statCards = [
    { label: 'Students', value: students.length, icon: Users },
    { label: 'Labs', value: labs.length, icon: FileText },
    { label: 'Announcements', value: announcements.length, icon: Bell },
    { label: 'Materials', value: materials.length, icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {mockDataBanner ? <BackendStatusBanner message={mockDataBanner} /> : null}
      {liveDataBanner ? (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            isDark
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">{liveDataBanner}</span>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`shrink-0 rounded-lg p-2 transition-colors ${
            isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className={`m-0 text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {course.course.name}
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {course.course.code} • Section {course.section.sectionNumber} • {course.semester.name} •{' '}
            {instructorName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {card.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`rounded-2xl p-3 ${
                    isDark ? 'bg-white/5 text-blue-300' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <CourseSectionHeading icon={Calendar} isDark={isDark}>
            Section Schedule
          </CourseSectionHeading>
          {schedules.length === 0 ? (
            <SectionPanelEmpty
              icon={Calendar}
              title="No schedule entries yet"
              description="When your section has meeting times in the system, they will show here."
              isDark={isDark}
            />
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`rounded-xl border p-4 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-blue-50'
                      }`}
                      aria-hidden
                    >
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatDayOfWeekLabel(schedule.dayOfWeek)}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {formatScheduleTime(schedule.startTime)} – {formatScheduleTime(schedule.endTime)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {formatScheduleTypeLabel(schedule.scheduleType)}
                        </span>
                      </div>
                      <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {schedule.building ? `${schedule.building} • ` : ''}
                        {schedule.room}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <CourseSectionHeading icon={FileText} isDark={isDark}>
            Labs
          </CourseSectionHeading>
          {labs.length === 0 ? (
            <SectionPanelEmpty
              icon={FileText}
              title="No labs for this course"
              description="Published labs for this course will appear here."
              isDark={isDark}
            />
          ) : (
            <div className="space-y-3">
              {labs.slice(0, 8).map((lab) => (
                <div
                  key={lab.id}
                  className={`rounded-xl border p-4 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-emerald-50'
                      }`}
                      aria-hidden
                    >
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {lab.title}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            Lab {lab.labNumber ?? 'N/A'} • {formatLabStatusLabel(lab.status)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {lab.dueDate ? new Date(lab.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <CourseSectionHeading icon={BookOpen} isDark={isDark}>
            Materials
          </CourseSectionHeading>
          {materials.length === 0 ? (
            <SectionPanelEmpty
              icon={BookOpen}
              title="No materials available"
              description={materialsDisabledReason}
              isDark={isDark}
            />
          ) : (
            <div className="space-y-3">
              {materials.slice(0, 8).map((material) => (
                <div
                  key={material.materialId}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {material.title}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {material.materialType} • Week {material.weekNumber ?? 'N/A'}
                    </p>
                  </div>
                  <button
                    disabled
                    title={materialsDisabledReason}
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-500/20 px-3 py-2 text-sm font-medium text-slate-400"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <CourseSectionHeading icon={Bell} isDark={isDark}>
            Announcements
          </CourseSectionHeading>
          {announcements.length === 0 ? (
            <SectionPanelEmpty
              icon={Bell}
              title="No announcements yet"
              description="Course announcements will show here when they are published."
              isDark={isDark}
            />
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 6).map((announcement) => (
                <div
                  key={announcement.id}
                  className={`rounded-xl border p-4 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {announcement.title}
                  </p>
                  <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {announcement.content}
                  </p>
                  <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {new Date(announcement.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-2xl border p-6 ${
          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
        }`}
      >
        <CourseSectionHeading icon={Users} isDark={isDark}>
          Students
        </CourseSectionHeading>
        {students.length === 0 ? (
          <SectionPanelEmpty
            icon={Users}
            title="No students in this section"
            description="Enrolled students for this section will appear here."
            isDark={isDark}
          />
        ) : (
        <div
          className={`overflow-hidden rounded-xl border ${
            isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Score
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 20).map((student) => (
                  <tr
                    key={student.id}
                    className={isDark ? 'border-t border-white/10' : 'border-t border-gray-100'}
                  >
                    <td className={`px-5 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        {student.studentName || `Student #${student.userId}`}
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.studentEmail || '—'}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.status}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {student.finalScore !== null ? `${Math.round(student.finalScore)}%` : student.grade || 'N/A'}
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

type LiveLabsPageProps = {
  labs: {
    id: string;
    courseId: string;
    courseName: string;
    labNumber: number;
    title: string;
    date: string;
    time: string;
    location: string;
    status: 'upcoming' | 'active' | 'completed';
    submissionCount: number;
    gradedCount: number;
    attendanceCount: number;
  }[];
  courseOptions: { value: string; label: string }[];
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  selectedLabId: string | null;
  onViewLab: (labId: string | null) => void;
  labDetails?: LabWithInstructions | null;
  labSubmissions?: LabSubmission[];
  loading?: boolean;
  detailsLoading?: boolean;
  onCreateLab: (value: {
    courseId: number;
    title: string;
    description?: string;
    labNumber?: number;
    dueDate?: string;
    availableFrom?: string;
    maxScore?: number;
    weight?: number;
    status?: 'draft' | 'published' | 'closed';
  }) => Promise<unknown> | void;
};

export function LiveLabsPage({
  labs,
  courseOptions,
  selectedCourseId,
  onCourseChange,
  selectedLabId,
  onViewLab,
  labDetails,
  labSubmissions = [],
  loading = false,
  detailsLoading = false,
  onCreateLab,
}: LiveLabsPageProps) {
  const { isDark } = useTheme();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formValue, setFormValue] = useState({
    courseId: selectedCourseId || courseOptions[0]?.value || '',
    title: '',
    description: '',
    labNumber: '',
    availableFrom: '',
    dueDate: '',
    maxScore: '',
    weight: '',
    status: 'draft' as 'draft' | 'published' | 'closed',
  });

  const visibleLabs = selectedCourseId
    ? labs.filter((lab) => String(lab.courseId) === String(selectedCourseId))
    : labs;

  const submitCreate = async () => {
    if (!formValue.courseId || !formValue.title.trim()) return;
    const nextFormState = {
      courseId: selectedCourseId || courseOptions[0]?.value || '',
      title: '',
      description: '',
      labNumber: '',
      availableFrom: '',
      dueDate: '',
      maxScore: '',
      weight: '',
      status: 'draft' as const,
    };

    setShowCreateForm(false);
    setFormValue(nextFormState);

    await onCreateLab({
      courseId: Number(formValue.courseId),
      title: formValue.title.trim(),
      description: formValue.description.trim() || undefined,
      labNumber: formValue.labNumber ? Number(formValue.labNumber) : undefined,
      availableFrom: formValue.availableFrom
        ? new Date(formValue.availableFrom).toISOString()
        : undefined,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString() : undefined,
      maxScore: formValue.maxScore ? Number(formValue.maxScore) : undefined,
      weight: formValue.weight ? Number(formValue.weight) : undefined,
      status: formValue.status,
    });
  };

  if (selectedLabId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewLab(null)}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {labDetails?.title || 'Lab Details'}
            </h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Live lab details from the backend.
            </p>
          </div>
        </div>

        {detailsLoading || !labDetails ? (
          <div
            className={`rounded-xl border p-10 text-center ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            Loading lab details...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Course', value: labDetails.course?.code || `#${labDetails.courseId}` },
                { label: 'Status', value: labDetails.status },
                { label: 'Max Score', value: Number(labDetails.maxScore || 0) },
                { label: 'Submissions', value: labSubmissions.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-5 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {item.label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div
                className={`rounded-2xl border p-6 ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Overview
                </h3>
                <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {labDetails.description || 'No description provided.'}
                </p>
                <div className={`mt-4 space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  <p>
                    Available From:{' '}
                    {labDetails.availableFrom
                      ? new Date(labDetails.availableFrom).toLocaleString()
                      : 'Not set'}
                  </p>
                  <p>
                    Due Date:{' '}
                    {labDetails.dueDate ? new Date(labDetails.dueDate).toLocaleString() : 'Not set'}
                  </p>
                  <p>Weight: {Number(labDetails.weight || 0)}%</p>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-6 ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Instructions
                </h3>
                {labDetails.instructions.length === 0 ? (
                  <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    No instructions were found for this lab.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {labDetails.instructions.map((instruction) => (
                      <div
                        key={instruction.id}
                        className={`rounded-xl border p-4 ${
                          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Step {instruction.orderIndex + 1}
                        </p>
                        <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {instruction.instructionText || 'Instruction file attachment'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Submissions
              </h3>
              {labSubmissions.length === 0 ? (
                <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  No submissions were found for this lab.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                        <th className="py-2 pr-4 text-left">Student</th>
                        <th className="py-2 pr-4 text-left">Status</th>
                        <th className="py-2 pr-4 text-left">Submitted At</th>
                        <th className="py-2 text-left">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labSubmissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                        >
                          <td className={`py-3 pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {submission.user
                              ? `${submission.user.firstName} ${submission.user.lastName}`
                              : `Student #${submission.userId}`}
                          </td>
                          <td className={`py-3 pr-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {submission.submissionStatus}
                          </td>
                          <td className={`py-3 pr-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </td>
                          <td className={`py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {submission.score ? Number(submission.score) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Labs
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Live labs connected to the backend.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((value) => !value)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Create New Lab
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateForm(false)}
          />
          <div
            className={`relative z-10 w-full max-w-4xl rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Create New Lab</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Fill in the basic information below.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className={`rounded-lg p-2 transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Course
                </span>
                <CleanSelect
                  value={formValue.courseId}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, courseId: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {courseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CleanSelect>
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Lab Title
                </span>
                <input
                  type="text"
                  value={formValue.title}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Example: Lab 3 - Sorting Algorithms"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Description
                </span>
                <textarea
                  rows={4}
                  value={formValue.description}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Describe what students need to do in this lab."
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Lab Number
                </span>
                <input
                  type="number"
                  min="1"
                  value={formValue.labNumber}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, labNumber: event.target.value }))
                  }
                  placeholder="Example: 3"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Maximum Score
                </span>
                <input
                  type="number"
                  min="0"
                  value={formValue.maxScore}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, maxScore: event.target.value }))
                  }
                  placeholder="Example: 100"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Weight in Final Grade
                </span>
                <input
                  type="number"
                  min="0"
                  value={formValue.weight}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, weight: event.target.value }))
                  }
                  placeholder="Example: 10"
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Available From
                </span>
                <input
                  type="datetime-local"
                  value={formValue.availableFrom}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, availableFrom: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </label>

              <label className="space-y-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Due Date
                </span>
                <input
                  type="datetime-local"
                  value={formValue.dueDate}
                  onChange={(event) =>
                    setFormValue((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Initial Status
                </span>
                <CleanSelect
                  value={formValue.status}
                  onChange={(event) =>
                    setFormValue((current) => ({
                      ...current,
                      status: event.target.value as 'draft' | 'published' | 'closed',
                    }))
                  }
                  className={`w-full rounded-lg border px-4 py-3 text-sm ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </CleanSelect>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isDark ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => void submitCreate()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Save Lab
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-xl border p-4 ${
          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCourseChange('')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              selectedCourseId === ''
                ? 'bg-blue-600 text-white'
                : isDark
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Courses
          </button>
          {courseOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onCourseChange(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedCourseId === option.value
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark
              ? 'border-white/10 bg-white/5 text-slate-300'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          Loading labs...
        </div>
      ) : visibleLabs.length === 0 ? (
        <div
          className={`rounded-xl border p-10 text-center ${
            isDark
              ? 'border-white/10 bg-white/5 text-slate-300'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          No labs found for the selected course.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleLabs.map((lab) => (
            <div
              key={lab.id}
              className={`rounded-2xl border p-5 ${
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {lab.title}
                  </h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {lab.courseName} • Lab #{lab.labNumber}
                  </p>
                  <div className={`mt-2 flex flex-wrap items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <span>{lab.date}</span>
                    <span>{lab.time}</span>
                    <span>{lab.location}</span>
                    <span>{lab.submissionCount} submissions</span>
                  </div>
                </div>
                <button
                  onClick={() => onViewLab(lab.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
