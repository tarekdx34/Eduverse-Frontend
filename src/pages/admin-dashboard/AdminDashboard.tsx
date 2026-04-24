import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type CreateSemesterPayload } from '../../services/adminService';
import { ApiClient as api } from '../../services/api/client';
import { toast } from 'sonner';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  Bell,
  MessageSquare,
  MessageCircle,
  User,
  Menu,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import {
  DashboardOverview,
  CourseManagementPage,
  AcademicCalendarPage,
  CommunicationPage,
  EnrollmentPeriodPage,
  PrerequisitesManagementPage,
  AdminNotificationsPage,
} from './components';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLiveApiSession } from '../../hooks/useLiveApiSession';
import {
  DASHBOARD_STATS,
  USERS,
  COURSES,
  CALENDAR_EVENTS,
  NOTIFICATION_TEMPLATES,
  ADMIN_DEPARTMENT,
  ENROLLMENT_PERIODS,
} from './constants';
import { StudentManagementPage } from './components/StudentManagementPage';
import {
  NotificationService,
  type Notification,
} from '../../services/api/notificationService';
import { useNotificationRealtime } from '../../hooks/useNotificationRealtime';
import { toHeaderNotification } from '../../utils/notificationUi';

type TabKey =
  | 'dashboard'
  | 'students'
  | 'courses'
  | 'periods'
  | 'calendar'
  | 'communication'
  | 'notifications'
  | 'chat'
  | 'profile';

function addDaysToYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function semesterLabelToCode(label: string): string {
  const cleaned = String(label || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  if (cleaned.length >= 2 && cleaned.length <= 20) return cleaned;
  return `SEM${Date.now()}`.replace(/\D/g, '').slice(0, 18);
}

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  {
    key: 'students',
    label: 'Student Management',
    labelAr: 'إدارة الطلاب',
    icon: GraduationCap,
    group: 'Management',
  },
  {
    key: 'courses',
    label: 'Course Management',
    labelAr: 'إدارة المقررات',
    icon: BookOpen,
    group: 'Management',
  },
  {
    key: 'periods',
    label: 'Periods & Scheduling',
    labelAr: 'الفترات والجدولة',
    icon: ClipboardList,
    group: 'Management',
  },
  {
    key: 'calendar',
    label: 'Academic Calendar',
    labelAr: 'التقويم الأكاديمي',
    icon: Calendar,
    group: 'Schedule',
  },
  {
    key: 'communication',
    label: 'Communication',
    labelAr: 'التواصل',
    icon: MessageSquare,
    group: 'Communication',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: Bell,
    group: 'Communication',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Account' },
];

function AdminDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const useLiveApi = useLiveApiSession();
  const isMockMode = !useLiveApi;
  const [headerUnreadCount, setHeaderUnreadCount] = useState(0);
  const [headerNotifications, setHeaderNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isMockMode) {
      setHeaderNotifications([]);
      setHeaderUnreadCount(0);
      return;
    }

    let mounted = true;
    const refreshHeaderNotifications = async () => {
      try {
        const [list, unread] = await Promise.all([
          NotificationService.getAll({ limit: 8 }),
          NotificationService.getUnreadCount(),
        ]);
        if (!mounted) return;
        setHeaderNotifications(list);
        setHeaderUnreadCount(Number(unread?.count ?? 0));
      } catch {
        if (!mounted) return;
        setHeaderNotifications([]);
        setHeaderUnreadCount(0);
      }
    };

    void refreshHeaderNotifications();
    const intervalId = window.setInterval(() => void refreshHeaderNotifications(), 30000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [isMockMode]);

  useNotificationRealtime({
    enabled: !isMockMode,
    onNewNotification: (notification) => {
      setHeaderNotifications((prev) => {
        const next = [notification, ...prev.filter((item) => item.id !== notification.id)];
        return next.slice(0, 8);
      });
      if (notification.isRead !== 1 && !notification.read) {
        setHeaderUnreadCount((prev) => prev + 1);
      }
    },
    onUnreadCountUpdate: (count) => setHeaderUnreadCount(count),
  });

  // Fetch live stats
  const { data: liveStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: !isMockMode,
  });

  const { data: dashboardInsights } = useQuery({
    queryKey: ['admin-dashboard-insights'],
    queryFn: () => adminService.getAdminDashboardInsights(),
    enabled: !isMockMode && activeTab === 'dashboard',
  });

  // Fetch live users for staff assignment
  const { data: usersDataLive } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => adminService.getUsers(),
    enabled: !isMockMode && activeTab === 'courses',
  });

  // State for data management
  const [coursesData, setCoursesData] = useState(COURSES);
  const [usersList, setUsersList] = useState(USERS);

  const refreshCourses = async () => {
    if (!useLiveApi) {
      setCoursesData([]);
      return;
    }

    try {
      const coursesRes = await api.get<any>('/courses');
      const apiCourses = Array.isArray(coursesRes?.data)
        ? coursesRes.data
        : Array.isArray(coursesRes?.data?.data)
          ? coursesRes.data.data
          : Array.isArray(coursesRes)
            ? coursesRes
            : [];



      const enrichedCourses = await Promise.all(
        apiCourses.map(async (c: any) => {
          const courseId = c.id;
          const base = {
            id: Number(courseId),
            code: c.code,
            name: c.name,
            department: c.department?.name || 'Unknown',
            departmentId: Number(c.department?.id ?? c.departmentId ?? 0) || 0,
            semester: 'Fall 2025',
            credits: c.credits || 3,
            enrolled: 0,
            capacity: 100,
            status: (c.status || 'ACTIVE').toUpperCase(),
            instructor: '',
            instructorId: 0,
            taIds: [] as number[],
            taNames: [] as string[],
            level: (c.level || 'FRESHMAN').toUpperCase(),
            prerequisites: [],
            sectionId: null as number | null,
            skills: c.skills || [],
            offeringSemesterIds: [] as number[],
          };

          try {
            const sectionsRes = await api.get<any>(`/sections/course/${courseId}`);
            const sections = Array.isArray(sectionsRes?.data)
              ? sectionsRes.data
              : Array.isArray(sectionsRes)
                ? sectionsRes
                : [];

            if (sections.length === 0) {
              return base;
            }

            const semIds = [
              ...new Set(
                sections
                  .map((sec: any) => Number(sec.semesterId ?? sec.semester?.id))
                  .filter((n: number) => Number.isFinite(n) && n > 0),
              ),
            ];
            base.offeringSemesterIds = semIds;

            const section = sections[0];
            const sectionId = Number(section.id || section.sectionId);
            base.sectionId = sectionId;
            base.enrolled = section.currentEnrollment || 0;
            base.capacity = section.maxCapacity || 100;
            const semName = section.semester?.name;
            if (typeof semName === 'string' && semName.trim()) {
              base.semester = semName;
            }

            try {
              const instRes = await api.get<any>(`/enrollments/section/${sectionId}/instructor`);
              const instructorPayload = instRes?.data ?? instRes;
              if (instructorPayload?.instructor?.fullName) {
                base.instructor = instructorPayload.instructor.fullName;
                base.instructorId = Number(instructorPayload.instructorId) || 0;
              }
            } catch {
              // No instructor assigned.
            }

            try {
              const tasRes = await api.get<any>(`/enrollments/section/${sectionId}/tas`);
              const tas = Array.isArray(tasRes?.data)
                ? tasRes.data
                : Array.isArray(tasRes)
                  ? tasRes
                  : [];
              base.taIds = tas.map((t: any) => Number(t.userId));
              base.taNames = tas.map((t: any) => t.fullName);
            } catch {
              // No TAs assigned.
            }
          } catch (err) {
            console.warn(`[WARN] Failed to enrich course ${courseId}:`, err);
          }

          return base;
        })
      );

      setCoursesData(enrichedCourses);
      queryClient.setQueryData(['admin-courses'], { data: apiCourses });
    } catch (error: any) {
      console.error('[ERROR] refreshCourses failed:', error);
      toast.error('Failed to refresh courses: ' + (error.message || 'Unknown error'));
    }
  };

  // Sync users list
  useEffect(() => {
    if (usersDataLive?.data) {
      const apiUsers = usersDataLive.data;
      const mappedUsers = apiUsers.map((u: any) => ({
        id: Number(u.userId),
        name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        role: u.roles?.[0]?.roleName?.toLowerCase() || '',
        department: '',
      }));
      setUsersList(mappedUsers);
    } else if (isMockMode) {
      setUsersList(USERS);
    }
  }, [usersDataLive, isMockMode]);

  useEffect(() => {
    refreshCourses();
  }, [useLiveApi]);

  // Fetch calendar events
  const calendarQuery = useQuery({
    queryKey: ['admin-calendar'],
    queryFn: () => adminService.getCalendarEvents(),
    enabled: !isMockMode && activeTab === 'calendar',
  });

  const calendarDataLive = calendarQuery.data;

  const [calendarEvents, setCalendarEvents] = useState(CALENDAR_EVENTS);

  // Sync calendar — expand each semester into discrete dated events + add custom events
  useEffect(() => {
    if (!calendarDataLive) return;
    
    const semesters = Array.isArray(calendarDataLive.semesters) ? calendarDataLive.semesters : [];
    const customEventsRaw = Array.isArray(calendarDataLive.customEvents) ? calendarDataLive.customEvents : [];

    const toYmd = (v: unknown): string | null => {
      if (v == null || v === '') return null;
      try {
        const s = typeof v === 'string' ? v : new Date(v as Date).toISOString();
        const ymd = s.split('T')[0];
        return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
      } catch {
        return null;
      }
    };

    const mapped: any[] = [];

    // 1. Map Semesters to periods
    for (const s of semesters) {
      const name = String(s.name ?? s.semesterName ?? 'Semester').trim();
      const idBase = Number(s.id ?? s.semesterId);
      const baseId = Number.isFinite(idBase) && idBase > 0 ? idBase : Date.now();

      const semesterStart = toYmd(s.startDate ?? s.semesterStart);
      if (semesterStart) {
        mapped.push({
          id: baseId * 10 + 1,
          title: `${name} — Semester start`,
          date: semesterStart,
          endDate: null,
          type: 'semesterStart',
          color: getEventColor('semesterStart'),
          isSystem: true,
        });
      }

      const semesterEnd = toYmd(s.endDate ?? s.semesterEnd);
      if (semesterEnd) {
        mapped.push({
          id: baseId * 10 + 2,
          title: `${name} — Semester end`,
          date: semesterEnd,
          endDate: null,
          type: 'semesterEnd',
          color: getEventColor('semesterEnd'),
          isSystem: true,
        });
      }

      const regStart = toYmd(s.registrationStart);
      const regEnd = toYmd(s.registrationEnd);
      if (regStart && regEnd && regEnd >= regStart) {
        mapped.push({
          id: baseId * 10 + 3,
          title: `${name} — Registration`,
          date: regStart,
          endDate: regEnd,
          type: 'registration',
          color: getEventColor('registration'),
          isSystem: true,
        });
      } else if (regStart) {
        mapped.push({
          id: baseId * 10 + 3,
          title: `${name} — Registration`,
          date: regStart,
          endDate: null,
          type: 'registration',
          color: getEventColor('registration'),
          isSystem: true,
        });
      }
    }

    // 2. Map Custom Events
    for (const e of customEventsRaw) {
      mapped.push({
        id: Number(e.eventId),
        title: e.title,
        date: toYmd(e.startTime),
        endDate: toYmd(e.endTime),
        type: e.eventType,
        color: e.color || getEventColor(e.eventType),
        isSystem: false,
      });
    }

    setCalendarEvents(mapped);
  }, [calendarDataLive]);

  const [templates, setTemplates] = useState(NOTIFICATION_TEMPLATES);

  const departmentIdForPeriods = useMemo(() => {
    const c = coursesData.find((x: any) => Number(x.departmentId) > 0);
    return c ? Number(c.departmentId) : undefined;
  }, [coursesData]);

  // Fetch enrollment periods (counts scoped to dept when we know departmentId from courses)
  const { data: periodsDataLive } = useQuery({
    queryKey: ['admin-periods', departmentIdForPeriods],
    queryFn: () => adminService.getEnrollmentPeriods(departmentIdForPeriods),
    enabled: !isMockMode && activeTab === 'periods',
  });

  const [enrollmentPeriodsData, setEnrollmentPeriodsData] = useState(ENROLLMENT_PERIODS);

  // Sync with live data
  useEffect(() => {
    if (periodsDataLive) {
      setEnrollmentPeriodsData(
        periodsDataLive.data ||
          (Array.isArray(periodsDataLive) ? periodsDataLive : ENROLLMENT_PERIODS)
      );
    } else if (isMockMode) {
      setEnrollmentPeriodsData(ENROLLMENT_PERIODS);
    }
  }, [periodsDataLive, isMockMode]);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    navigate(`/admindashboard/${key}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

  // Course Mutations
  const addCourseMutation = useMutation({
    mutationFn: (newCourse: any) => adminService.createCourse(newCourse),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseAdded') || 'Course created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create course: ' + (error.message || 'Unknown error'));
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateCourse(id, data),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseUpdated') || 'Course updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update course: ' + (error.message || 'Unknown error'));
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: async () => {
      await refreshCourses();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success(t('courseDeleted') || 'Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete course: ' + (error.message || 'Unknown error'));
    },
  });

  const createSemesterMutation = useMutation({
    mutationFn: (payload: Parameters<typeof adminService.createSemester>[0]) =>
      adminService.createSemester(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-insights'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(t('periodSaved') || 'Semester / enrollment period created');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create semester');
    },
  });

  const updateSemesterMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<import('../../services/adminService').CreateSemesterPayload> }) =>
      adminService.updateSemester(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-insights'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(t('periodUpdated') || 'Semester updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update semester');
    },
  });

  const deleteSemesterMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteSemester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-insights'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(t('periodDeleted') || 'Semester removed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete semester');
    },
  });

  // Course management handlers
  const handleAddCourse = (course: any) => {
    if (isMockMode) {
      const newCourse = {
        id: Math.max(0, ...coursesData.map((c: any) => c.id)) + 1,
        ...course,
        enrolled: 0,
        status: 'active',
      };
      setCoursesData([...coursesData, newCourse]);
      toast.info('Mock mode: added locally');
      return;
    }

    // Map UI data to backend DTO
    const dto = {
      departmentId: 1, // Defaulting to CSE (id: 1) for this admin
      name: course.name,
      code: course.code,
      description: course.description || `Course for ${course.semester}`,
      credits: Number(course.credits),
      level: (course.level || 'FRESHMAN').toUpperCase(),
      skills: course.skills,
    };
    addCourseMutation.mutate(dto);
  };

  const handleEditCourse = (id: number, course: any) => {
    if (isMockMode) {
      setCoursesData(coursesData.map((c: any) => (c.id === id ? { ...c, ...course } : c)));
      toast.info('Mock mode: updated locally');
      return;
    }

    const dto = {
      name: course.name,
      credits: Number(course.credits),
      description: course.description,
      status: (course.status || 'ACTIVE').toUpperCase(),
      level: (course.level || 'FRESHMAN').toUpperCase(),
      instructorId: course.instructorId,
      taIds: course.taIds,
      skills: course.skills,
    };
    updateCourseMutation.mutate({ id, data: dto });
  };

  const handleDeleteCourse = (id: number) => {
    if (isMockMode) {
      setCoursesData(coursesData.filter((c: any) => c.id !== id));
      toast.info('Mock mode: deleted locally');
      return;
    }
    deleteCourseMutation.mutate(id);
  };

  // Calendar event mutations
  const addEventMutation = useMutation({
    mutationFn: (event: any) =>
      adminService.createCalendarEvent({
        title: event.title,
        startTime: new Date(event.date).toISOString(),
        endTime: new Date(event.endDate || event.date).toISOString(),
        eventType: event.type,
        color: getEventColor(event.type),
      }),
    onSuccess: () => {
      calendarQuery.refetch();
      toast.success('Event added successfully');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const editEventMutation = useMutation({
    mutationFn: ({ id, event }: { id: number; event: any }) =>
      adminService.updateCalendarEvent(id, {
        title: event.title,
        startTime: new Date(event.date).toISOString(),
        endTime: new Date(event.endDate || event.date).toISOString(),
        eventType: event.type,
      }),
    onSuccess: () => {
      calendarQuery.refetch();
      toast.success('Event updated successfully');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCalendarEvent(id),
    onSuccess: () => {
      calendarQuery.refetch();
      toast.success('Event deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Calendar event handlers
  const handleAddEvent = (event: any) => {
    if (isMockMode) {
      const newEvent = {
        id: Math.max(0, ...calendarEvents.map((e: any) => e.id)) + 1,
        ...event,
        color: getEventColor(event.type),
      };
      setCalendarEvents([...calendarEvents, newEvent]);
      return;
    }
    addEventMutation.mutate(event);
  };

  const handleEditEvent = (id: number, event: any) => {
    if (isMockMode) {
      setCalendarEvents(calendarEvents.map((e: any) => (e.id === id ? { ...e, ...event } : e)));
      return;
    }
    editEventMutation.mutate({ id, event });
  };

  const handleDeleteEvent = (id: number) => {
    if (isMockMode) {
      setCalendarEvents(calendarEvents.filter((e: any) => e.id !== id));
      return;
    }
    deleteEventMutation.mutate(id);
  };

  // Enrollment period handlers (persisted as semesters + registration dates)
  const handleAddEnrollmentPeriod = (period: any) => {
    if (isMockMode) {
      const newPeriod = {
        id: Math.max(0, ...enrollmentPeriodsData.map((p: any) => p.id)) + 1,
        ...period,
      };
      setEnrollmentPeriodsData([...enrollmentPeriodsData, newPeriod]);
      toast.info('Mock mode: period not saved to the server');
      return;
    }
    const name = String(period.semester || '').trim();
    const regStart = String(period.startDate || '').trim();
    const regEnd = String(period.endDate || '').trim();
    if (!name || !regStart || !regEnd) {
      toast.error('Semester name and registration dates are required');
      return;
    }
    const semStart =
      String(period.semesterStartDate || '').trim() || addDaysToYmd(regEnd, 1);
    const semEnd =
      String(period.semesterEndDate || '').trim() || addDaysToYmd(semStart, 119);
    const rawCode = String(period.semesterCode || semesterLabelToCode(name)).toUpperCase();
    const code = rawCode.replace(/[^A-Z0-9]/g, '').slice(0, 20) || semesterLabelToCode(name);
    createSemesterMutation.mutate({
      name,
      code,
      startDate: semStart,
      endDate: semEnd,
      registrationStart: regStart,
      registrationEnd: regEnd,
    });
  };

  const handleEditEnrollmentPeriod = (id: number, period: any) => {
    if (isMockMode) {
      setEnrollmentPeriodsData(
        enrollmentPeriodsData.map((p: any) => (p.id === id ? { ...p, ...period } : p)),
      );
      toast.info('Mock mode: updated locally');
      return;
    }
    const name = String(period.semester || '').trim();
    const regStart = String(period.startDate || '').trim();
    const regEnd = String(period.endDate || '').trim();
    const semStart = String(period.semesterStartDate || '').trim();
    const semEnd = String(period.semesterEndDate || '').trim();
    const payload: Partial<CreateSemesterPayload> = {};
    if (name) payload.name = name;
    if (regStart) payload.registrationStart = regStart;
    if (regEnd) payload.registrationEnd = regEnd;
    if (semStart) payload.startDate = semStart;
    if (semEnd) payload.endDate = semEnd;
    if (period.semesterCode) {
      const c = String(period.semesterCode).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
      if (c.length >= 2) payload.code = c;
    }
    updateSemesterMutation.mutate({ id, payload });
  };

  const handleDeleteEnrollmentPeriod = (id: number) => {
    if (isMockMode) {
      setEnrollmentPeriodsData(enrollmentPeriodsData.filter((p: any) => p.id !== id));
      toast.info('Mock mode: deleted locally');
      return;
    }
    deleteSemesterMutation.mutate(id);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'semesterStart':
        return '#10b981';
      case 'semesterEnd':
        return '#6366f1';
      case 'registration':
        return primaryHex || '#3b82f6';
      case 'holiday':
        return '#ef4444';
      case 'examPeriod':
        return '#f59e0b';
      default:
        return primaryHex || '#6b7280';
    }
  };

  // Template handlers
  const handleCreateTemplate = (template: any) => {
    const newTemplate = {
      id: Math.max(...templates.map((t) => t.id)) + 1,
      ...template,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (id: number, template: any) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, ...template } : t)));
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleSendBroadcast = (message: any) => {
    console.log('Sending broadcast:', message);
    alert('Broadcast sent successfully!');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={translatedTabs.map((tab) => ({
          id: tab.key,
          label: tab.label,
          icon: tab.icon,
          group: tab.group,
        }))}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={handleLogout}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Management', 'Schedule', 'Communication', 'Account']}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-0 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'} ${activeTab === 'chat' ? 'flex flex-col p-0' : 'p-4 lg:p-10'}`}
      >
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName="Department Head"
            userRole="Admin"
            isDark={isDark}
            isRTL={isRTL}
            accentColor={primaryHex || '#3b82f6'}
            avatarGradient="from-[#3b82f6] to-[#06b6d4]"
            language={language}
            onToggleTheme={toggleTheme}
            onSetLanguage={setLanguage}
            searchRole="admin"
            onProfileClick={() => handleTabChange('profile')}
            onMenuClick={() => setSidebarOpen(true)}
            primaryColor={primaryColor}
            onSetPrimaryColor={setPrimaryColor}
            availableColors={[
              { id: 'blue', colorClass: 'bg-blue-500', hex: '#3b82f6' },
              { id: 'emerald', colorClass: 'bg-emerald-500', hex: '#10b981' },
              { id: 'rose', colorClass: 'bg-rose-500', hex: '#f43f5e' },
              { id: 'amber', colorClass: 'bg-amber-500', hex: '#f59e0b' },
            ]}
            translations={{
              search: t('search') || 'Search...',
              language: t('language'),
              english: t('english'),
              arabic: t('arabic'),
              darkMode: t('darkMode'),
              lightMode: t('lightMode'),
              viewProfile: t('viewProfile'),
              logout: t('logout'),
            }}
            notifications={headerNotifications.map(toHeaderNotification)}
            notificationCount={headerUnreadCount}
          />
        )}
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={liveStats || DASHBOARD_STATS}
            analytics={
              dashboardInsights?.analytics ?? {
                userGrowth: [],
                courseEngagement: [],
                aiUsage: [],
                systemMetrics: null,
              }
            }
            recentActivity={dashboardInsights?.recentActivity ?? []}
            onNavigate={(tab) => handleTabChange(tab as TabKey)}
          />
        )}

        {/* Student Management */}
        {activeTab === 'students' && <StudentManagementPage />}

        {/* Course Management */}
        {activeTab === 'courses' && (
          <CourseManagementPage
            courses={coursesData}
            users={usersList}
            adminDepartment={ADMIN_DEPARTMENT}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onRefreshCourses={refreshCourses}
          />
        )}

        {/* Periods & Scheduling */}
        {activeTab === 'periods' && (
          <EnrollmentPeriodPage
            enrollmentPeriods={enrollmentPeriodsData}
            courses={coursesData}
            adminDepartment={ADMIN_DEPARTMENT}
            useLiveApi={useLiveApi}
            onAddPeriod={handleAddEnrollmentPeriod}
            onEditPeriod={handleEditEnrollmentPeriod}
            onDeletePeriod={handleDeleteEnrollmentPeriod}
          />
        )}

        {/* Academic Calendar */}
        {activeTab === 'calendar' && (
          <AcademicCalendarPage
            events={calendarEvents}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {/* Communication */}
        {activeTab === 'communication' && (
          <CommunicationPage
            templates={templates}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSendBroadcast={handleSendBroadcast}
          />
        )}

        {activeTab === 'notifications' && <AdminNotificationsPage />}

        {/* Chat — fills main column; pass real user id for API + message mapping */}
        {activeTab === 'chat' && (
          <div className="flex h-[calc(100dvh-4.5rem)] min-h-[420px] w-full flex-1 flex-col overflow-hidden lg:h-[calc(100dvh-3.5rem)]">
            <MessagingChat
              height="100%"
              currentUserId={user?.userId != null ? String(user.userId) : undefined}
              currentUserName={user?.fullName || 'Administrator'}
              showVideoCall={true}
              showVoiceCall={true}
              isDark={isDark}
              accentColor={primaryHex || '#4f46e5'}
              className="min-h-0 flex-1 rounded-none border-0"
            />
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor={primaryHex || '#3b82f6'}
            bannerGradient="from-[#3b82f6] to-[#06b6d4]"
            profileData={{
              fullName: 'Admin Name',
              role: 'Administrator',
              department: 'Department',
              email: 'admin@eduverse.edu',
              phone: '',
              address: '',
              dateOfBirth: '',
              bio: '',
              specialization: [],
            }}
          />
        )}
      </main>
    </div>
  );
}

// Main component wrapped with providers
function AdminDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default AdminDashboard;
