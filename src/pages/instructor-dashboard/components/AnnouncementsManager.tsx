import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CleanSelect, CustomDropdown } from '../../../components/shared';
import { announcementService, type Announcement } from '../../../services/api/announcementService';
import { EnrollmentService } from '../../../services/api/enrollmentService';
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
  Pin,
  Building2,
  BookOpen,
  CircleDot,
  Check,
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';

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

const normalizeAnnouncements = (
  payload: Announcement[] | { data?: Announcement[] } | undefined
) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
};

type TeachingCourseLike = {
  courseId?: string | number;
  courseName?: string;
  courseCode?: string;
  course?: {
    id?: string | number;
    name?: string;
    code?: string;
  };
};

interface AnnouncementsManagerProps {
  isMockMode?: boolean;
  mockAnnouncements?: Announcement[];
  mockCourses?: TeachingCourseLike[];
}

const normalizeTeachingCourses = (payload: unknown): TeachingCourseLike[] => {
  if (Array.isArray(payload)) return payload as TeachingCourseLike[];
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: TeachingCourseLike[] }).data;
  }
  return [];
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

const getPublishedBadgeClass = (isDark: boolean) =>
  isDark
    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

const formatDisplayDate = (value?: string) =>
  new Date(value ?? Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getPriorityAppearance = (priority: string, isDark: boolean) => {
  const normalized = String(priority || 'low').toLowerCase();
  if (normalized === 'urgent') {
    return {
      label: 'Urgent',
      bg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 1)',
      color: isDark ? '#fca5a5' : '#b91c1c',
    };
  }
  if (normalized === 'high') {
    return {
      label: 'High',
      bg: isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 237, 213, 1)',
      color: isDark ? '#fdba74' : '#c2410c',
    };
  }
  if (normalized === 'medium') {
    return {
      label: 'Medium',
      bg: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(254, 243, 199, 1)',
      color: isDark ? '#fcd34d' : '#b45309',
    };
  }
  return {
    label: 'Low',
    bg: isDark ? 'rgba(100, 116, 139, 0.2)' : 'rgba(241, 245, 249, 1)',
    color: isDark ? '#cbd5e1' : '#475569',
  };
};

const DEFAULT_MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'mock-ann-1',
    courseId: '101',
    createdBy: 1,
    title: 'Midterm Review Session',
    content: 'Review session moved to Wednesday 2:00 PM in Hall B.',
    announcementType: 'course',
    priority: 'high',
    isPublished: 1,
    isPinned: 1,
    viewCount: 27,
    publishedAt: '2026-04-18T10:00:00.000Z',
    createdAt: '2026-04-18T09:30:00.000Z',
    author: { firstName: 'Sarah', lastName: 'Martinez', email: 's.martinez@eduverse.edu' },
    course: { id: '101', code: 'CS301', name: 'Software Engineering' },
  },
  {
    id: 'mock-ann-2',
    courseId: '102',
    createdBy: 1,
    title: 'Lab Submission Window Extended',
    content: 'Lab 3 submissions are now accepted until Friday 11:59 PM.',
    announcementType: 'course',
    priority: 'medium',
    isPublished: 1,
    isPinned: 0,
    viewCount: 19,
    publishedAt: '2026-04-16T12:00:00.000Z',
    createdAt: '2026-04-16T11:20:00.000Z',
    author: { firstName: 'Sarah', lastName: 'Martinez', email: 's.martinez@eduverse.edu' },
    course: { id: '102', code: 'CS341', name: 'Database Systems' },
  },
  {
    id: 'mock-ann-3',
    courseId: null,
    createdBy: 1,
    title: 'Office Hours Update',
    content: 'Office hours this week are online only due to department meetings.',
    announcementType: 'campus',
    priority: 'low',
    isPublished: 0,
    isPinned: 0,
    viewCount: 0,
    createdAt: '2026-04-20T08:30:00.000Z',
    author: { firstName: 'Sarah', lastName: 'Martinez', email: 's.martinez@eduverse.edu' },
    course: null,
  },
];

export function AnnouncementsManager({
  isMockMode = false,
  mockAnnouncements,
  mockCourses,
}: AnnouncementsManagerProps = {}) {
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
  const [teachingCourses, setTeachingCourses] = useState<TeachingCourseLike[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AnnouncementFormState>(emptyForm);

  const loadAnnouncements = useCallback(async () => {
    if (isMockMode) {
      setAnnouncements(mockAnnouncements ?? DEFAULT_MOCK_ANNOUNCEMENTS);
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
  }, [isMockMode, mockAnnouncements]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useEffect(() => {
    if (isMockMode) {
      setTeachingCourses(mockCourses ?? []);
      return;
    }
    let mounted = true;
    const loadTeachingCourses = async () => {
      try {
        const payload = await EnrollmentService.getTeachingCourses();
        if (!mounted) return;
        setTeachingCourses(normalizeTeachingCourses(payload));
      } catch {
        if (!mounted) return;
        setTeachingCourses([]);
      }
    };
    void loadTeachingCourses();
    return () => {
      mounted = false;
    };
  }, [isMockMode, mockCourses]);

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

    teachingCourses.forEach((item) => {
      const id = String(item.courseId ?? item.course?.id ?? '');
      if (!id) return;
      const code = item.course?.code || item.courseCode || 'COURSE';
      const name = item.course?.name || item.courseName || 'Untitled Course';
      map.set(id, `${code} - ${name}`);
    });

    // Fallback to known courses from existing announcements
    announcements.forEach((item) => {
      const id = item.course?.id;
      if (id !== undefined) {
        map.set(String(id), getCourseLabel(item));
      }
    });

    return [
      { id: '0', label: 'Campus-wide' },
      ...Array.from(map, ([id, label]) => ({ id, label })),
    ];
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

    if (isMockMode) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingAnnouncement.id));
      setShowDeleteConfirm(false);
      setDeletingAnnouncement(null);
      toast.success('Announcement deleted');
      return;
    }

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
    if (isMockMode) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcement.id
            ? { ...item, isPublished: 1, publishedAt: new Date().toISOString() }
            : item
        )
      );
      setOpenMenuId(null);
      toast.success('Announcement published');
      return;
    }

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
    if (isMockMode) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcement.id ? { ...item, isPinned: item.isPinned === 1 ? 0 : 1 } : item
        )
      );
      setOpenMenuId(null);
      toast.success(announcement.isPinned === 1 ? 'Announcement unpinned' : 'Announcement pinned');
      return;
    }

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

    if (isMockMode) {
      if (editingAnnouncement) {
        setAnnouncements((prev) =>
          prev.map((item) =>
            item.id === editingAnnouncement.id
              ? {
                  ...item,
                  title: payload.title,
                  content: payload.content,
                  priority: payload.priority,
                  isPublished: form.publishNow ? 1 : item.isPublished,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        toast.success('Announcement updated');
      } else {
        const newAnnouncement: Announcement = {
          id: `mock-ann-${Date.now()}`,
          courseId: parsedCourseId > 0 ? String(parsedCourseId) : null,
          createdBy: 1,
          title: payload.title,
          content: payload.content,
          priority: payload.priority,
          announcementType: parsedCourseId > 0 ? 'course' : 'campus',
          isPublished: form.publishNow ? 1 : 0,
          isPinned: 0,
          viewCount: 0,
          publishedAt: form.publishNow ? new Date().toISOString() : undefined,
          createdAt: new Date().toISOString(),
          author: { firstName: 'Sarah', lastName: 'Martinez', email: 's.martinez@eduverse.edu' },
          course:
            parsedCourseId > 0
              ? {
                  id: String(parsedCourseId),
                  name:
                    courseOptions.find((option) => option.id === String(parsedCourseId))?.label ||
                    `Course ${parsedCourseId}`,
                }
              : null,
        };
        setAnnouncements((prev) => [newAnnouncement, ...prev]);
        toast.success('Announcement created');
      }

      setShowCreateModal(false);
      setEditingAnnouncement(null);
      setForm(emptyForm);
      return;
    }

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
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPublishedBadgeClass(
          isDark
        )}`}
      >
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
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ann-accent)] focus:border-[var(--ann-accent)] ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900'}`;
  const selectedPriorityAppearance = getPriorityAppearance(form.priority, isDark);

  const courseDropdownOptions = useMemo(
    () =>
      courseOptions.map((option) => ({
        value: option.id,
        label: option.label,
        icon: option.id === '0' ? <Building2 size={14} /> : <BookOpen size={14} />,
      })),
    [courseOptions]
  );

  const priorityDropdownOptions = useMemo(
    () =>
      ['low', 'medium', 'high', 'urgent'].map((value) => {
        const appearance = getPriorityAppearance(value, isDark);
        return {
          value,
          label: appearance.label,
          icon: <CircleDot size={12} style={{ color: appearance.color }} />,
        };
      }),
    [isDark]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Drafts' },
          ] as const
        ).map((f) => (
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

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={cardClass}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-5 w-28 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
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

                  <h3
                    className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}
                  >
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
                      className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1.5"
                      style={{ backgroundColor: `${primaryHex}20`, color: primaryHex }}
                    >
                      {a.course?.id ? <BookOpen size={12} /> : <Building2 size={12} />}
                      {getCourseLabel(a)}
                    </span>
                    <span className={textSecondary}>Author: {getAuthorLabel(a)}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 border"
                      style={{
                        backgroundColor: getPriorityAppearance(a.priority ?? 'low', isDark).bg,
                        color: getPriorityAppearance(a.priority ?? 'low', isDark).color,
                        borderColor: `${getPriorityAppearance(a.priority ?? 'low', isDark).color}55`,
                      }}
                    >
                      <CircleDot size={11} />
                      {getPriorityAppearance(a.priority ?? 'low', isDark).label}
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
                          isDark
                            ? 'hover:bg-white/5 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
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
                          isDark
                            ? 'hover:bg-white/5 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`rounded-xl shadow-xl w-full max-w-2xl ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
          >
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

            <div className="px-6 pt-4 pb-6 space-y-5" style={{ ['--ann-accent' as string]: primaryHex }}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Midterm review session moved to 2:00 PM"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>Content</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  placeholder="Write a clear update for students. Include date/time, location or link, and any action required."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    Course
                  </label>
                  <CustomDropdown
                    value={form.courseId}
                    onChange={(value) => setForm((f) => ({ ...f, courseId: value }))}
                    options={courseDropdownOptions}
                    isDark={isDark}
                    accentColor={primaryHex}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
                    Priority
                  </label>
                  <div
                    className="rounded-xl"
                    style={{
                      backgroundColor: selectedPriorityAppearance.bg,
                      border: `1px solid ${selectedPriorityAppearance.color}66`,
                    }}
                  >
                    <CustomDropdown
                      value={form.priority}
                      onChange={(value) => setForm((f) => ({ ...f, priority: value }))}
                      options={priorityDropdownOptions}
                      isDark={isDark}
                      accentColor={primaryHex}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className={`pt-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`flex items-center gap-2 text-sm ${textPrimary}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={form.publishNow}
                    onClick={() => setForm((f) => ({ ...f, publishNow: !f.publishNow }))}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      form.publishNow
                        ? 'text-white'
                        : isDark
                          ? 'border-white/25 bg-white/5'
                          : 'border-slate-300 bg-white'
                    }`}
                    style={form.publishNow ? { backgroundColor: primaryHex, borderColor: primaryHex } : undefined}
                  >
                    {form.publishNow && <Check size={13} strokeWidth={3} />}
                  </button>
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm ${
                  isDark
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-70"
                style={{ backgroundColor: primaryHex }}
              >
                {saving ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`rounded-xl shadow-xl w-full max-w-sm ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
          >
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
                Delete this announcement?
              </h3>
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
