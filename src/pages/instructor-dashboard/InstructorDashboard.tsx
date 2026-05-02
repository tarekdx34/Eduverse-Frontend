import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Upload,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  User,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  MessagesSquare,
  Menu,
  Megaphone,
  Bell,
  Beaker,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { EnrollmentService } from '../../services/api/enrollmentService';
import { AttendanceService } from '../../services/api/attendanceService';
import {
  AssignmentService,
  type AssignmentStatus as ApiAssignmentStatus,
  type AssignmentSubmission,
} from '../../services/api/assignmentService';
import { GradesService } from '../../services/api/gradesService';
import { ScheduleService } from '../../services/api/scheduleService';
import { NotificationService } from '../../services/api/notificationService';
import type { Notification as ApiNotification } from '../../services/api/notificationService';
import { AnalyticsService } from '../../services/api/analyticsService';
import { toast } from 'sonner';
import { useNotificationRealtime } from '../../hooks/useNotificationRealtime';
import { toHeaderNotification } from '../../utils/notificationUi';
import {
  StatsCard,
  GradesTable,
  RosterTable,
  AttendanceTable,
  AttendanceModal,
  GradeModal,
  StudentEditModal,
  MessageModal,
  ConfirmDialog,
  ProfilePage,
  ModernDashboard,
  CoursesPage,
  QuizzesPage,
  ExamsPage,
  SchedulePage,
  DiscussionPage,
  NotificationsPage,
  AnnouncementsManager,
  SelectedSectionSummary,
  AIAttendanceModal,
  UploadMaterialsPage,
  LabsPage,
  LectureAttendanceFlow,
  DashboardWalkthrough,
} from './components';
import {
  AssignmentListPage,
  AssignmentCreateEdit,
  SubmissionListView,
  GradingPanel,
  type AssignmentFormData,
} from './components/instructor-assignments';
import {
  MessagingChat,
  DashboardHeader,
  DashboardSidebar,
  CustomDropdown,
} from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  INSTRUCTOR_INFO,
  SECTIONS,
  COURSES,
  ROSTERS,
  DASHBOARD_STATS,
  GRADES,
  ASSIGNMENTS,
  ATTENDANCE,
  ANALYTICS,
  INSTRUCTOR_PROFILE,
  UPCOMING_CLASSES,
  PENDING_TASKS,
  RECENT_ACTIVITY,
} from './constants';
import type { GradeEntry } from './components/GradesTable';
import type { AttendanceSession } from './components/AttendanceTable';
import type { GradeFormData } from './components/GradeModal';
import type { AttendanceFormData } from './components/AttendanceModal';
import type { MessageFormData } from './components/MessageModal';
import type { Assignment } from '../../services/api/assignmentService';

type TabKey =
  | 'dashboard'
  | 'courses'
  | 'roster'
  | 'grades'
  | 'assignments'
  | 'labs'
  | 'quizzes'
  | 'exams'
  | 'schedule'
  | 'materials'
  | 'attendance'
  | 'discussion'
  | 'chat'
  | 'profile'
  | 'notifications'
  | 'announcements';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  { key: 'courses', label: 'Courses', labelAr: 'المقررات', icon: BookOpen, group: 'Teaching' },
  {
    key: 'quizzes',
    label: 'Quizzes Management',
    labelAr: 'إدارة الاختبارات',
    icon: ClipboardList,
    group: 'Teaching',
  },
  {
    key: 'exams',
    label: 'Exams',
    labelAr: 'الامتحانات',
    icon: FileText,
    group: 'Teaching',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    labelAr: 'الواجبات',
    icon: CheckSquare,
    group: 'Teaching',
  },
  {
    key: 'labs',
    label: 'Labs',
    labelAr: 'المعامل',
    icon: Beaker,
    group: 'Teaching',
  },
  {
    key: 'materials',
    label: 'Materials',
    labelAr: 'المواد',
    icon: Upload,
    group: 'Teaching',
  },
  { key: 'schedule', label: 'Schedule', labelAr: 'الجدول', icon: CalendarDays, group: 'Teaching' },
  { key: 'roster', label: 'Roster', labelAr: 'قائمة الطلاب', icon: Users, group: 'Students' },
  { key: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: Calendar, group: 'Students' },
  {
    key: 'announcements',
    label: 'Announcements',
    labelAr: 'الإعلانات',
    icon: Megaphone,
    group: 'Communication',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: Bell,
    group: 'Communication',
  },
  {
    key: 'discussion',
    label: 'Discussion',
    labelAr: 'المناقشات',
    icon: MessagesSquare,
    group: 'Communication',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageSquare, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Tools' },
];

function InstructorDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [rosterSubTab, setRosterSubTab] = useState<'overview' | 'grades'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAIAttendanceModalOpen, setIsAIAttendanceModalOpen] = useState(false);
  const [headerUnreadCount, setHeaderUnreadCount] = useState(0);
  const [headerNotifications, setHeaderNotifications] = useState<ApiNotification[]>([]);
  const [notificationsRefreshSignal, setNotificationsRefreshSignal] = useState(0);
  /** Attendance tab: main lecture/roster flow vs. legacy session summary table. */
  const [attendanceUiMode, setAttendanceUiMode] = useState<'lecture' | 'sessions'>('lecture');
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [runWalkthrough, setRunWalkthrough] = useState(false);

  useEffect(() => {
    // Specifically for instructor.tarek@example.com
    if (user?.email === 'instructor.tarek@example.com') {
      const hasSeenWalkthrough = localStorage.getItem('hasSeenInstructorWalkthrough');
      if (!hasSeenWalkthrough) {
        const timer = setTimeout(() => {
          setRunWalkthrough(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleFinishWalkthrough = () => {
    setRunWalkthrough(false);
    localStorage.setItem('hasSeenInstructorWalkthrough', 'true');
  };

  const isMockMode = !isAuthenticated || location.state?.isMock;

  // Live Data Queries
  const { data: teachingCoursesLive } = useQuery({
    queryKey: ['teaching-courses'],
    queryFn: () => EnrollmentService.getTeachingCourses(),
    enabled: !isAuthenticated && !isMockMode ? false : !isMockMode, // Ensure auth before query
  });

  const { data: upcomingClassesLive } = useQuery({
    queryKey: ['upcoming-classes-weekly'],
    queryFn: () => ScheduleService.getWeeklyUnified(), // Get the full week
    enabled: !isMockMode,
  });

  const { data: notificationsLive } = useQuery({
    queryKey: ['notifications-live'],
    queryFn: () => NotificationService.getAll({ limit: 5 }),
    enabled: !isMockMode,
  });

  useEffect(() => {
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
  }, []);

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
      setNotificationsRefreshSignal((prev) => prev + 1);
      void queryClient.invalidateQueries({ queryKey: ['notifications-live'] });
    },
    onUnreadCountUpdate: (count) => setHeaderUnreadCount(count),
  });

  const { data: allAssignmentsLive } = useQuery({
    queryKey: ['all-assignments-live'],
    queryFn: () => AssignmentService.getAll({ status: 'published', limit: 100 }), // Get a wide range to find pending ones
    enabled: !isMockMode,
  });

  const { data: analyticsLive } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => AnalyticsService.getDashboard(),
    enabled: !isMockMode,
  });

  const { data: attendanceSessionsLive, isLoading: isLoadingAttendanceSessions } = useQuery({
    queryKey: ['attendance-sessions', activeSectionId],
    queryFn: () => AttendanceService.getSessions({ sectionId: Number(activeSectionId) }),
    enabled: !isMockMode && !!activeSectionId && activeTab === 'attendance',
  });

  const liveStats = useMemo(() => {
    if (isMockMode) return DASHBOARD_STATS;
    if (!teachingCoursesLive)
      return [
        {
          label: t('totalStudents'),
          value: '0',
          change: '--',
          trend: 'neutral',
          icon: Users,
          color: primaryColor,
        },
        {
          label: t('activeCourses'),
          value: '0',
          change: '--',
          trend: 'neutral',
          icon: BookOpen,
          color: primaryColor,
        },
        {
          label: t('avgAttendance'),
          value: '0%',
          change: '--',
          trend: 'neutral',
          icon: CheckSquare,
          color: primaryColor,
        },
        {
          label: t('pendingGrades'),
          value: '0',
          change: '--',
          trend: 'neutral',
          icon: FileText,
          color: primaryColor,
        },
      ];

    const totalStudents = teachingCoursesLive.reduce(
      (acc: number, s: any) => acc + (s.enrolledCount || s.section?.currentEnrollment || 0),
      0
    );
    const activeSections = teachingCoursesLive.length;
    
    // Calculate pending grades count
    const assignmentsArray = Array.isArray(allAssignmentsLive)
      ? allAssignmentsLive
      : (allAssignmentsLive as any)?.data || [];
    
    const pendingCount = assignmentsArray.filter((a: any) => {
      // Logic for "pending": published assignments with submissions that aren't graded yet
      // This is a heuristic since we don't have a direct "pendingGradingCount" in the list API
      return a.status === 'published';
    }).length;

    return [
      {
        label: t('totalStudents'),
        value: String(totalStudents),
        change: t('currentlyEnrolled'),
        trend: 'up',
        icon: Users,
        color: primaryColor,
      },
      {
        label: t('activeCourses'),
        value: String(activeSections),
        change: t('thisSemester'),
        trend: 'up',
        icon: BookOpen,
        color: primaryColor,
      },
      {
        label: t('avgAttendance'),
        value: analyticsLive?.averageAttendance ? `${Math.round(Number(analyticsLive.averageAttendance))}%` : '0%',
        change: '--',
        trend: 'neutral',
        icon: CheckSquare,
        color: primaryColor,
      },
      {
        label: t('pendingGrades'),
        value: String(analyticsLive?.pendingGrades || pendingCount),
        change: t('awaitingReview'),
        trend: 'down',
        icon: FileText,
        color: primaryColor,
      },
    ];
  }, [isMockMode, teachingCoursesLive, allAssignmentsLive, analyticsLive, primaryColor, t]);

  const liveUpcomingClasses = useMemo(() => {
    if (isMockMode || !upcomingClassesLive) return UPCOMING_CLASSES;

    // Flatten weekly schedule into a single list of upcoming items
    const allItems: any[] = [];
    
    if (upcomingClassesLive && upcomingClassesLive.days) {
      upcomingClassesLive.days.forEach((day: any) => {
        if (day.schedules) {
          day.schedules.forEach((item: any) => {
            // Precise mapping based on backend JSON structure
            const course = item.section?.course || item.course || {};
            
            // Try specific backend fields found in logs
            const code = course.code || item.courseCode || item.code || 'CODE';
            const name = course.name || item.courseName || item.name || 'UNNAMED';
            
            allItems.push({
              id: item.id || item.scheduleId || Math.random().toString(36).substr(2, 9),
              title: `${code} - ${name}`,
              time: `${item.startTime || '??:??'} - ${item.endTime || '??:??'}`,
              location: [item.building, item.room].filter(Boolean).join(', ') || item.location || item.room || 'TBD',
              type: String(item.scheduleType || item.type || '').toUpperCase() === 'LECTURE' ? 'Lecture' : 'Lab',
              date: day.date,
              dayOfWeek: day.dayOfWeek
            });
          });
        }
      });
    }

    return allItems.slice(0, 10);
  }, [isMockMode, upcomingClassesLive]);

  const liveRecentActivity = useMemo(() => {
    if (isMockMode || !notificationsLive) return RECENT_ACTIVITY;

    return notificationsLive.map((item, index) => {
      // Create a relative time string
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      let timeString = '';
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        timeString = `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        timeString = `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        timeString = `${diffInDays}d ago`;
      }

      return {
        id: item.notificationId ? String(item.notificationId) : `activity-${index}`,
        title: item.title,
        description: item.message,
        time: timeString,
        icon: item.type === 'assignment' ? FileText : item.type === 'material' ? Upload : item.type === 'system' ? Bell : Users,
        color:
          item.type === 'system'
            ? 'text-amber-500'
            : item.type === 'assignment'
              ? 'text-blue-500'
              : item.type === 'material'
                ? 'text-emerald-500'
                : 'text-indigo-500',
        bgColor:
          item.type === 'system'
            ? 'bg-amber-100 dark:bg-amber-500/20'
            : item.type === 'assignment'
              ? 'bg-blue-100 dark:bg-blue-500/20'
              : 'bg-emerald-100 dark:bg-emerald-500/20',
      };
    });
  }, [isMockMode, notificationsLive]);

  const livePendingTasks = useMemo(() => {
    if (isMockMode || !allAssignmentsLive) return PENDING_TASKS;

    // Safety check if data is an array or object with data property
    const assignmentsArray = Array.isArray(allAssignmentsLive)
      ? allAssignmentsLive
      : (allAssignmentsLive as any)?.data || [];

    // Map backend assignments to "pending tasks" expected by frontend
    const mappedTasks = assignmentsArray
      .map((assignment: any, index: number) => {
        // Create a task object based on the assignment data
        // We simulate pending grading or review needed based on assignment details
        const isPastDue = new Date(assignment.dueDate) < new Date();

        return {
          id: assignment.id || `task-${index}`,
          title: `Grade ${assignment.title}`,
          course: assignment.course?.code || 'Course',
          deadline: new Date(assignment.dueDate || Date.now()).toLocaleDateString(),
          priority: isPastDue ? 'High' : assignment.weight > 15 ? 'Medium' : 'Low',
          type: 'grading',
          icon: FileText,
        };
      })
      .slice(0, 4); // Limit to top 4 tasks for the dashboard view

    // If we have less than 4 tasks, we could append some default ones or just show what we have
    return mappedTasks.length > 0 ? mappedTasks : PENDING_TASKS.slice(0, 1);
  }, [isMockMode, allAssignmentsLive]);

  const { performanceData, engagementData } = useMemo(() => {
    if (isMockMode || !analyticsLive)
      return { performanceData: undefined, engagementData: undefined };

    // Safety check just in case the backend returns empty arrays
    if (!analyticsLive.courseBreakdown || analyticsLive.courseBreakdown.length === 0) {
      return { performanceData: undefined, engagementData: undefined };
    }

    // Determine performanceData from the courseBreakdown
    const calculatedPerformance = analyticsLive.courseBreakdown.slice(0, 5).map((course) => ({
      course: course.courseCode || (course.courseId ? `Course ${course.courseId}` : 'Unknown'),
      value: course.averageGrade ? Math.round(Number(course.averageGrade)) : 0,
      id: course.courseId
    }));

    // If teachingCoursesLive is available, let's map the names perfectly
    if (teachingCoursesLive && Array.isArray(teachingCoursesLive)) {
      calculatedPerformance.forEach((perf) => {
        const matchingCourse = teachingCoursesLive.find(
          (c: any) =>
            String(c.courseId) === String(perf.id) || 
            String(c.course?.id) === String(perf.id) ||
            String(c.section?.courseId) === String(perf.id)
        );
        if (matchingCourse) {
          const courseInfo = matchingCourse.course || matchingCourse.section?.course || matchingCourse;
          perf.course = courseInfo.name || courseInfo.courseName || courseInfo.code || perf.course;
        }
      });
    }

    // Engagement score doesn't come nicely in a timeline yet from the backend dashboard,
    // so let's simulate the trailing trend up to their current absolute engagement value
    const finalEngagement = Number(analyticsLive.averageEngagement) || 75;
    const calculatedEngagement = [
      { week: 'Week 1', value: Math.max(0, finalEngagement - 12) },
      { week: 'Week 2', value: Math.max(0, finalEngagement - 5) },
      { week: 'Week 3', value: Math.max(0, finalEngagement - 8) },
      { week: 'Week 4', value: finalEngagement },
    ];

    return {
      performanceData: calculatedPerformance.length > 0 ? calculatedPerformance : undefined,
      engagementData: calculatedEngagement,
    };
  }, [isMockMode, analyticsLive, teachingCoursesLive]);

  const { data: assignmentsLive, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['course-assignments', activeSectionId],
    queryFn: () => {
      const section = (teachingCoursesLive || []).find(
        (s: any) => String(s.sectionId ?? s.id) === activeSectionId
      );
      const resolvedCourseId = section?.courseId ?? section?.id ?? activeSectionId;
      return AssignmentService.getAll({ courseId: String(resolvedCourseId) });
    },
    enabled: !isMockMode && !!activeSectionId && activeTab === 'assignments',
  });

  const selectedLiveSection = useMemo(
    () =>
      activeSectionId
        ? (teachingCoursesLive || []).find(
            (s: any) => String(s.sectionId ?? s.id) === activeSectionId
          )
        : null,
    [activeSectionId, teachingCoursesLive]
  );

  const selectedCourseId = useMemo(() => {
    if (selectedLiveSection?.courseId) return Number(selectedLiveSection.courseId);
    if (selectedLiveSection?.id) return Number(selectedLiveSection.id);
    return activeSectionId ? Number(activeSectionId) : null;
  }, [selectedLiveSection, activeSectionId]);

  const { data: sectionGradesLive } = useQuery({
    queryKey: ['section-grades', activeSectionId],
    queryFn: () => GradesService.getCourseGrades(Number(selectedCourseId)),
    enabled: !isMockMode && !!activeSectionId && !!selectedCourseId && activeTab === 'roster',
  });

  const { data: sectionStudentsLive } = useQuery({
    queryKey: ['section-students', activeSectionId],
    queryFn: () => EnrollmentService.getSectionStudents(Number(activeSectionId)),
    enabled: !isMockMode && !!activeSectionId && activeTab === 'roster',
  });

  // State for roster management
  const [rosterOverrides, setRosterOverrides] = useState<
    Record<
      string,
      Array<{ id: number; name: string; email: string; status: string; grade?: string }>
    >
  >({});
  const [editingStudent, setEditingStudent] = useState<{
    id: number;
    name: string;
    email: string;
    status: string;
    grade?: string;
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State for assignments
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] =
    useState<Assignment | null>(null);
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] =
    useState<AssignmentSubmission | null>(null);
  const [draftSubmissionScores, setDraftSubmissionScores] = useState<Record<string, number>>({});

  // State for grades
  const [gradesData, setGradesData] = useState<Record<string, GradeEntry[]>>(GRADES);
  const [editingGrade, setEditingGrade] = useState<GradeFormData | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<number | null>(null);

  // State for attendance
  const [attendanceData, setAttendanceData] =
    useState<Record<string, AttendanceSession[]>>(ATTENDANCE);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceFormData | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<number | null>(null);
  // State for messages (dummy state since replaced by Announcements/Chat)
  const [editingMessage, setEditingMessage] = useState<MessageFormData | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [messageMode, setMessageMode] = useState<'create' | 'edit' | 'reply'>('create');

  // State for courses
  const [coursesData, setCoursesData] = useState(COURSES);
  const selectedCourseIdFromRoute =
    params.tab === 'courses' && params.id ? Number(params.id) : null;

  const materialsCourseId = useMemo(() => {
    // If navigating from courses tab with specific course ID
    if (params.tab === 'materials' && params.id) return String(params.id);
    if (selectedLiveSection?.courseId) return String(selectedLiveSection.courseId);
    if (!isMockMode && Array.isArray(teachingCoursesLive) && teachingCoursesLive.length > 0) {
      const first = teachingCoursesLive[0];
      return String(first.courseId ?? first.id ?? '');
    }
    return activeSectionId || '';
  }, [selectedLiveSection, isMockMode, teachingCoursesLive, activeSectionId, params.tab, params.id]);

  const { data: assignmentSubmissions = [], isLoading: isLoadingAssignmentSubmissions } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignmentForSubmissions?.id],
    queryFn: () => AssignmentService.getSubmissions(String(selectedAssignmentForSubmissions!.id)),
    enabled: !isMockMode && !!selectedAssignmentForSubmissions?.id && activeTab === 'assignments',
  });

  const gradeAssignmentSubmissionMutation = useMutation({
    mutationFn: ({
      assignmentId,
      submissionId,
      score,
    }: {
      assignmentId: string;
      submissionId: string;
      score: number;
    }) => AssignmentService.gradeSubmission(assignmentId, submissionId, score, ''),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assignment-submissions', variables.assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: ['course-assignments', activeSectionId] });
      toast.success('Submission graded successfully');
    },
    onError: () => {
      toast.error('Failed to grade submission');
    },
  });

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (tabParam === 'grades') {
      setActiveTab('roster');
      setRosterSubTab('grades');
      navigate('/instructordashboard/roster', { replace: true });
      return;
    }
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Set default section on mount and when entering section-dependent tabs
  useEffect(() => {
    if (activeSectionId || !['roster', 'assignments', 'attendance'].includes(activeTab)) return;
    const firstLive =
      !isMockMode && teachingCoursesLive?.length
        ? String(teachingCoursesLive[0].sectionId ?? teachingCoursesLive[0].id)
        : null;
    const firstMock = SECTIONS.length ? String(SECTIONS[0].sectionId) : null;
    setActiveSectionId(firstLive || firstMock);
  }, [activeTab, activeSectionId, isMockMode, teachingCoursesLive]);

  // Disable browser's native scroll restoration so it doesn't fight our scroll calls
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  // Scroll to top — targets every possible scroll container
  const scrollToTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  };

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    if (!['roster', 'attendance'].includes(key)) {
      setActiveSectionId(null);
    }
    navigate(`/instructordashboard/${key}`);
    // Scroll after a tick so the new content has rendered
    requestAnimationFrame(() => scrollToTop());
  };

  // Sync live data with local states
  useEffect(() => {
    if (teachingCoursesLive && !isMockMode) {
      const mappedCourses = teachingCoursesLive.map((s: any) => ({
        id: s.sectionId || s.section?.id,
        courseId: s.courseId || s.course?.id,
        courseName: s.course?.name || s.courseName || 'Unknown Course',
        courseCode: s.course?.code || s.courseCode || 'UNK',
        enrolled: s.section?.currentEnrollment || s.enrolledCount || 0,
        status: (s.status?.toLowerCase() || s.section?.status?.toLowerCase() || 'active') as
          | 'active'
          | 'archived',
        averageGrade: s.averageGrade || 0,
        attendanceRate: s.attendanceRate || 0,
        semester: s.semester?.name || s.semesterName || 'N/A',
        credits: s.course?.credits || s.credits || 3,
        capacity: s.section?.maxCapacity || s.capacity || 0,
        schedule: s.schedule || 'TBD',
        room: s.section?.location || s.location || 'TBD',
        prerequisites: [],
        description: s.course?.description || s.courseDescription || '',
      }));
      setCoursesData(mappedCourses);
    }
  }, [teachingCoursesLive, isMockMode]);

  useEffect(() => {
    if (attendanceSessionsLive && !isMockMode && activeSectionId) {
      setAttendanceData((prev) => ({
        ...prev,
        [activeSectionId]: ((attendanceSessionsLive as any)?.data || attendanceSessionsLive || []).map(
          (s: any) => ({
            id: Number(s.id),
            date: s.sessionDate,
            present: Number(s.presentCount || 0),
            absent: Number(s.absentCount || 0),
            type: s.sessionType,
            status: s.status,
          })
        ),
      }));
    }
  }, [attendanceSessionsLive, isMockMode, activeSectionId]);

  useEffect(() => {
    setSelectedAssignmentForSubmissions(null);
    setDraftSubmissionScores({});
  }, [activeSectionId]);

  useEffect(() => {
    if (sectionStudentsLive && !isMockMode && activeSectionId) {
      setRosterOverrides((prev) => ({
        ...prev,
        [activeSectionId]: sectionStudentsLive.map((s: any) => ({
          id: s.userId,
          name: s.fullName,
          email: s.email,
          status: s.status,
        })),
      }));
    }
  }, [sectionStudentsLive, isMockMode, activeSectionId]);

  useEffect(() => {
    if (!sectionGradesLive || isMockMode || !activeSectionId) return;
    const list = Array.isArray(sectionGradesLive)
      ? sectionGradesLive
      : Array.isArray((sectionGradesLive as any)?.data)
        ? (sectionGradesLive as any)?.data
        : [];

    setGradesData((prev) => ({
      ...prev,
      [activeSectionId]: list.map((g: any, index: number) => ({
        id: Number(g.gradeId ?? g.id ?? index + 1),
        studentId: Number(g.studentId ?? g.userId ?? 0),
        name: g.studentName ?? g.fullName ?? `Student ${g.studentId ?? g.userId ?? index + 1}`,
        assignment: g.assessmentName ?? g.componentName ?? 'Course Grade',
        score: Number(g.percentage ?? g.score ?? 0),
        maxScore: Number(g.maxScore ?? 100),
        date: g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : '-',
      })),
    }));
  }, [sectionGradesLive, isMockMode, activeSectionId]);

  const sectionOptions = useMemo(() => {
    if (isMockMode) {
      return SECTIONS.map((s) => ({
        value: String(s.sectionId),
        label: `${s.courseCode} - ${s.sectionLabel}`,
      }));
    }
    return (teachingCoursesLive || []).map((s: any) => ({
      value: String(s.section?.id || s.sectionId || s.id),
      label: `${s.course?.name || s.course?.code || s.courseName || s.courseCode || 'Course'} - Sec ${s.section?.sectionNumber || s.sectionNumber || s.sectionLabel || s.section?.id || s.sectionId || s.id}`,
    }));
  }, [isMockMode, teachingCoursesLive]);

  const assignmentCourseOptions = useMemo(() => {
    if (isMockMode) {
      return SECTIONS.map((s) => ({
        value: String(s.sectionId),
        label: `${s.courseCode} - ${s.courseName}`,
      }));
    }

    const unique = new Map<string, string>();
    (teachingCoursesLive || []).forEach((s: any) => {
      const value = String(s.courseId ?? s.course?.id ?? s.id ?? '');
      if (!value || unique.has(value)) return;
      const code = s.course?.code || s.courseCode || 'COURSE';
      const name = s.course?.name || s.courseName || 'Untitled Course';
      unique.set(value, `${code} - ${name}`);
    });

    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [isMockMode, teachingCoursesLive]);

  const currentRosterBase = activeSectionId ? ROSTERS[activeSectionId] || [] : [];
  const currentRoster =
    activeSectionId && rosterOverrides[activeSectionId]
      ? rosterOverrides[activeSectionId]!
      : currentRosterBase;

  const selectedSection = useMemo(() => {
    if (!activeSectionId) return null;
    if (isMockMode) {
      return SECTIONS.find((s) => String(s.sectionId) === activeSectionId) || null;
    }
    const liveSection =
      (teachingCoursesLive || []).find(
        (s: any) => String(s.section?.id || s.sectionId || s.id) === activeSectionId
      ) || null;
    if (!liveSection) return null;

    const sectionNumber =
      liveSection.section?.sectionNumber ||
      liveSection.sectionNumber ||
      liveSection.sectionLabel ||
      liveSection.section?.id ||
      activeSectionId;

    return {
      courseCode: liveSection.course?.code || liveSection.courseCode || 'N/A',
      courseName: liveSection.course?.name || liveSection.courseName || 'Unknown Course',
      sectionLabel: `Sec ${sectionNumber}`,
      schedule: liveSection.schedule || liveSection.section?.schedule || 'TBD',
      capacity: Number(liveSection.section?.maxCapacity ?? liveSection.capacity ?? 0),
      enrolled: Number(liveSection.section?.currentEnrollment ?? liveSection.enrolledCount ?? 0),
    };
  }, [isMockMode, activeSectionId, teachingCoursesLive]);

  // Assignment handlers
  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleViewAssignmentSubmissions = (assignment: Assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async (data: AssignmentFormData) => {
    if (!activeSectionId) return;

    const resolvedCourseId = Number(selectedCourseId ?? activeSectionId);

    const payload = {
      title: data.title,
      description: data.description || '',
      instructions: data.instructions || '',
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      courseId: resolvedCourseId,
      status: data.status,
      submissionType: data.submissionType,
      maxScore: data.maxScore,
      weight: data.weight,
    };

    try {
      if (data.id) {
        await AssignmentService.update(data.id, payload as any);
        toast.success('Assignment updated successfully');
      } else {
        await AssignmentService.create(payload as any);
        toast.success('Assignment created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['course-assignments', activeSectionId] });
      setIsAssignmentModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save assignment');
    }
  };

  const handleUploadInstructions = async (assignmentId: string, file: File) => {
    try {
      await AssignmentService.uploadInstructions(assignmentId, file);
      toast.success('Instructions uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload instructions');
      throw err;
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignmentToDelete(id);
  };

  const confirmDeleteAssignment = async () => {
    if (!activeSectionId || !assignmentToDelete) return;

    try {
      await AssignmentService.delete(assignmentToDelete);
      toast.success('Assignment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['course-assignments', activeSectionId] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete assignment');
    }
    setAssignmentToDelete(null);
  };

  const handleAssignmentStatusChange = async (id: string, newStatus: Assignment['status']) => {
    if (!activeSectionId) return;

    try {
      await AssignmentService.changeStatus(id, newStatus);
      toast.success(`Assignment ${newStatus} successfully`);
      queryClient.invalidateQueries({ queryKey: ['course-assignments', activeSectionId] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update assignment status');
    }
  };

  const handleGradeSubmission = (submission: AssignmentSubmission) => {
    setSelectedSubmissionForGrading(submission);
  };

  const handleSaveAssignmentGrade = async (
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    if (!selectedAssignmentForSubmissions?.id) return;

    try {
      await AssignmentService.gradeSubmission(
        selectedAssignmentForSubmissions.id,
        submissionId,
        score,
        feedback
      );
      toast.success('Grade saved successfully');
      queryClient.invalidateQueries({
        queryKey: ['assignment-submissions', selectedAssignmentForSubmissions.id],
      });
      setSelectedSubmissionForGrading(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save grade');
      throw err;
    }
  };

  const handleViewSubmission = (submission: AssignmentSubmission) => {
    // For now, just open grading panel. Could add a dedicated view modal later
    setSelectedSubmissionForGrading(submission);
  };

  // Grade handlers
  const handleEditGrade = (grade: GradeEntry) => {
    setEditingGrade(grade);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (data: GradeFormData) => {
    if (!activeSectionId) return;

    if (!isMockMode) {
      try {
        await GradesService.updateStudentGrade(data.id!, {
          percentage: data.percentage,
          notes: data.notes,
        });
        toast.success('Grade updated successfully');
        queryClient.invalidateQueries({ queryKey: ['section-grades', activeSectionId] });
      } catch (err) {
        toast.error('Failed to update grade');
        return;
      }
    } else {
      const sectionGrades = gradesData[activeSectionId] || [];
      const updated = sectionGrades.map((g) => (g.id === data.id ? { ...data, id: data.id! } : g));
      setGradesData({ ...gradesData, [activeSectionId]: updated });
    }
    setIsGradeModalOpen(false);
  };

  const handleDeleteGrade = (id: number) => {
    setGradeToDelete(id);
  };

  const confirmDeleteGrade = () => {
    if (!activeSectionId || !gradeToDelete) return;

    const sectionGrades = gradesData[activeSectionId] || [];
    const updated = sectionGrades.filter((g) => g.id !== gradeToDelete);
    setGradesData({ ...gradesData, [activeSectionId]: updated });
    setGradeToDelete(null);
  };

  // Attendance handlers
  const handleCreateAttendance = () => {
    setEditingAttendance(null);
    setIsAttendanceModalOpen(true);
  };

  const handleEditAttendance = (session: AttendanceSession) => {
    setEditingAttendance(session);
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async (data: AttendanceFormData) => {
    if (!activeSectionId) return;

    if (!isMockMode) {
      try {
        if (data.id) {
          await AttendanceService.updateSession(data.id, {
            sessionDate: data.date,
            sessionType: data.type,
          });
          toast.success('Attendance session updated');
        } else {
          await AttendanceService.createSession({
            sectionId: Number(activeSectionId),
            sessionDate: data.date,
            sessionType: data.type as any,
          });
          toast.success('Attendance session created');
        }
        queryClient.invalidateQueries({ queryKey: ['attendance-sessions', activeSectionId] });
      } catch (err) {
        toast.error('Failed to save attendance session');
        return;
      }
    } else {
      const sectionAttendance = attendanceData[activeSectionId] || [];

      if (data.id) {
        // Edit existing
        const updated = sectionAttendance.map((a) =>
          a.id === data.id ? { ...data, id: data.id } : a
        );
        setAttendanceData({ ...attendanceData, [activeSectionId]: updated });
      } else {
        // Create new
        const newId = Math.max(...sectionAttendance.map((a) => a.id), 0) + 1;
        const newSession: AttendanceSession = { ...data, id: newId };
        setAttendanceData({
          ...attendanceData,
          [activeSectionId]: [...sectionAttendance, newSession],
        });
      }
    }

    setIsAttendanceModalOpen(false);
  };

  const handleDeleteAttendance = (id: number) => {
    setAttendanceToDelete(id);
  };

  const confirmDeleteAttendance = async () => {
    if (!activeSectionId || !attendanceToDelete) return;

    if (!isMockMode) {
      try {
        await AttendanceService.deleteSession(attendanceToDelete);
        toast.success('Attendance session deleted');
        queryClient.invalidateQueries({ queryKey: ['attendance-sessions', activeSectionId] });
      } catch (err) {
        toast.error('Failed to delete attendance session');
      }
    } else {
      const sectionAttendance = attendanceData[activeSectionId] || [];
      const updated = sectionAttendance.filter((a) => a.id !== attendanceToDelete);
      setAttendanceData({ ...attendanceData, [activeSectionId]: updated });
    }
    setAttendanceToDelete(null);
  };

  // Message handlers (dummy handlers to fix undefined references)
  const handleSaveMessage = (data: MessageFormData) => {
    setIsMessageModalOpen(false);
  };

  const confirmDeleteMessage = () => {
    setMessageToDelete(null);
  };

  // Course handlers
  const handleCreateCourse = (data: any) => {
    const newCourse = {
      id: Math.max(...coursesData.map((c) => c.id)) + 1,
      ...data,
      prerequisites: data.prerequisites
        ? data.prerequisites.split(',').map((p: string) => p.trim())
        : [],
      enrolled: 0,
      status: 'active' as const,
      averageGrade: 0,
      attendanceRate: 0,
    };
    setCoursesData([...coursesData, newCourse]);
  };

  const handleEditCourse = (id: number, data: any) => {
    setCoursesData(
      coursesData.map((course) =>
        String(course.id) === String(id)
          ? {
              ...course,
              ...data,
              prerequisites: data.prerequisites
                ? data.prerequisites.split(',').map((p: string) => p.trim())
                : [],
            }
          : course
      )
    );
  };

  const handleDeleteCourse = (id: number) => {
    setCoursesData(coursesData.filter((course) => String(course.id) !== String(id)));
  };

  const handleDuplicateCourse = (id: number) => {
    const courseToDuplicate = coursesData.find((c) => String(c.id) === String(id));
    if (!courseToDuplicate) return;

    const newCourse = {
      ...courseToDuplicate,
      id: Math.max(...coursesData.map((c) => c.id)) + 1,
      courseName: `${courseToDuplicate.courseName} (Copy)`,
      enrolled: 0,
    };
    setCoursesData([...coursesData, newCourse]);
  };

  const handleViewCourse = (id: number) => {
    navigate(`/instructordashboard/courses/${id}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <DashboardWalkthrough 
        run={runWalkthrough} 
        onFinish={handleFinishWalkthrough} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
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
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#4F46E5'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Teaching', 'Students', 'Communication', 'Tools']}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'} overflow-y-auto`}
      >
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName={user?.fullName || 'Instructor'}
            userRole={user?.role || 'Instructor'}
            isDark={isDark}
            isRTL={isRTL}
            accentColor={primaryHex || '#4F46E5'}
            avatarGradient="from-[#3b82f6] to-[#06b6d4]"
            language={language}
            onToggleTheme={toggleTheme}
            onSetLanguage={setLanguage}
            searchRole="instructor"
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
        <div
          key={activeTab}
          className={activeTab === 'chat' ? 'h-screen overflow-hidden p-0' : 'flex-1'}
          style={{ animation: 'tabFadeIn 0.18s ease-out' }}
        >
          <style>{`@keyframes tabFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <ModernDashboard
              stats={liveStats}
              sections={coursesData}
              upcomingClasses={liveUpcomingClasses}
              recentActivity={liveRecentActivity}
              pendingTasks={livePendingTasks}
              performanceData={performanceData}
              engagementData={engagementData}
              onNavigate={(tab) => handleTabChange(tab as TabKey)}
            />
          )}

          {/* Courses */}
          {activeTab === 'courses' && (
            <CoursesPage
              courses={coursesData}
              onCreateCourse={handleCreateCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onDuplicateCourse={handleDuplicateCourse}
              onViewCourse={(id) => {
                navigate(`/instructordashboard/materials/${id}`);
              }}
              selectedCourseId={selectedCourseIdFromRoute}
              isMockMode={isMockMode}
            />
          )}

          {/* Quizzes */}
          {activeTab === 'quizzes' && <QuizzesPage courses={coursesData} />}

          {/* Exams */}
          {activeTab === 'exams' && <ExamsPage courses={coursesData} />}

          {/* Labs */}
          {activeTab === 'labs' && <LabsPage courses={coursesData} />}

          {/* Schedule */}
          {activeTab === 'schedule' && <SchedulePage />}

          {/* Materials */}
          {activeTab === 'materials' && <UploadMaterialsPage courseId={materialsCourseId} />}

          {/* Roster */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Student Roster
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Manage enrolled students, view grades, and track academic performance
                  </p>
                </div>
              </div>
              <div className="max-w-xs">
                <CustomDropdown
                  label="Select Section"
                  options={sectionOptions}
                  value={activeSectionId || sectionOptions[0]?.value || ''}
                  onChange={setActiveSectionId}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>
              <SelectedSectionSummary section={selectedSection as any} />

              <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 mb-6">
                <button
                  onClick={() => setRosterSubTab('overview')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                    rosterSubTab === 'overview'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t('overview') || 'Overview'}
                  {rosterSubTab === 'overview' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      style={{ backgroundColor: primaryHex }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setRosterSubTab('grades')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                    rosterSubTab === 'grades'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t('detailedGrades') || 'Detailed Grades'}
                  {rosterSubTab === 'grades' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      style={{ backgroundColor: primaryHex }}
                    />
                  )}
                </button>
              </div>

              {rosterSubTab === 'overview' ? (
                <RosterTable
                  sectionId={activeSectionId || undefined}
                  data={currentRoster}
                  grades={activeSectionId ? gradesData[activeSectionId] || [] : []}
                  onEdit={(student) => {
                    setEditingStudent(student);
                    setIsEditOpen(true);
                  }}
                />
              ) : (
                <GradesTable
                  data={activeSectionId ? gradesData[activeSectionId] || [] : []}
                  onEdit={handleEditGrade}
                  onDelete={handleDeleteGrade}
                />
              )}
            </div>
          )}

          {/* Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Assignments
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Create and manage assignments across your course sections
                  </p>
                </div>
              </div>

              <div className="max-w-xs">
                <CustomDropdown
                  label="Select Section"
                  options={sectionOptions}
                  value={activeSectionId || sectionOptions[0]?.value || ''}
                  onChange={setActiveSectionId}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>

              <SelectedSectionSummary section={selectedSection as any} />

              {/* Assignment List */}
              <AssignmentListPage
                assignments={assignmentsLive?.data || []}
                onEdit={handleEditAssignment}
                onDelete={handleDeleteAssignment}
                onCreate={handleCreateAssignment}
                onStatusChange={handleAssignmentStatusChange}
                onViewSubmissions={handleViewAssignmentSubmissions}
                loading={isLoadingAssignments}
              />

              {/* Submissions View */}
              {selectedAssignmentForSubmissions && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Submissions: {selectedAssignmentForSubmissions.title}
                    </h3>
                    <button
                      onClick={() => setSelectedAssignmentForSubmissions(null)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-white/10 text-slate-300 hover:bg-white/10'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Hide Submissions
                    </button>
                  </div>

                  <SubmissionListView
                    submissions={assignmentSubmissions}
                    maxScore={Number(selectedAssignmentForSubmissions.maxScore) || 100}
                    onGrade={handleGradeSubmission}
                    onViewSubmission={handleViewSubmission}
                    loading={isLoadingAssignmentSubmissions}
                  />
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Attendance
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {attendanceUiMode === 'lecture'
                      ? 'Pick a section, open or create a session, then take roll or run AI from a class photo.'
                      : 'Track and manage attendance records for your class sessions (previous layout).'}
                  </p>
                </div>
                <div
                  className={`inline-flex shrink-0 rounded-lg border p-1 ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                  role="group"
                  aria-label="Attendance view"
                >
                  <button
                    type="button"
                    onClick={() => setAttendanceUiMode('lecture')}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      attendanceUiMode === 'lecture'
                        ? 'text-white shadow-sm'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/10'
                          : 'text-gray-700 hover:bg-white'
                    }`}
                    style={
                      attendanceUiMode === 'lecture' ? { backgroundColor: primaryHex } : undefined
                    }
                  >
                    Lecture attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceUiMode('sessions')}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      attendanceUiMode === 'sessions'
                        ? 'text-white shadow-sm'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/10'
                          : 'text-gray-700 hover:bg-white'
                    }`}
                    style={
                      attendanceUiMode === 'sessions' ? { backgroundColor: primaryHex } : undefined
                    }
                  >
                    Session table
                  </button>
                </div>
              </div>

              {attendanceUiMode === 'lecture' ? (
                <LectureAttendanceFlow embedded />
              ) : (
                <>
                  <div className="max-w-xs">
                    <CustomDropdown
                      label="Select Section"
                      options={sectionOptions}
                      value={activeSectionId || sectionOptions[0]?.value || ''}
                      onChange={setActiveSectionId}
                      isDark={isDark}
                      accentColor={primaryHex}
                    />
                  </div>
                  <SelectedSectionSummary section={selectedSection as any} />

                  <div
                    className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {t('attendanceRecords') || 'Attendance Records'}
                    </h3>
                    <AttendanceTable
                      loading={isLoadingAttendanceSessions}
                      sessions={activeSectionId ? attendanceData[activeSectionId] || [] : []}
                      onCreate={handleCreateAttendance}
                      onEdit={handleEditAttendance}
                      onDelete={handleDeleteAttendance}
                      onSwitchToAI={() => setIsAIAttendanceModalOpen(true)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Announcements */}
          {activeTab === 'announcements' && <AnnouncementsManager />}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <NotificationsPage refreshSignal={notificationsRefreshSignal} />
          )}

          {/* Discussion */}
          {activeTab === 'discussion' && (
            <DiscussionPage userRole="instructor" userName="Prof. Sarah Martinez" />
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <MessagingChat
              height="100vh"
              currentUserName={user?.fullName || 'Prof. Sarah Martinez'}
              onOpenSidebar={() => setSidebarOpen(true)}
              showVideoCall={true}
              showVoiceCall={true}
              isDark={isDark}
              accentColor={primaryHex || '#4f46e5'}
              className="rounded-none border-0"
            />
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor={primaryHex || '#4F46E5'}
              bannerGradient="from-[#3b82f6] to-[#06b6d4]"
              profileData={{
                fullName: user?.fullName || 'Instructor',
                role: user?.role || 'Instructor',
                department: (user as any)?.department || 'Academic Department',
                email: user?.email || '',
                phone: (user as any)?.phoneNumber || '+20 100 000 0000',
                address: 'University Campus',
                dateOfBirth: '1985-01-01',
                bio: 'Academic staff member at EduVerse platform.',
                interests: ['Higher Education', 'Research'],
                skills: ['Teaching'],
              }}
            />
          )}
        </div>
        {/* end key={activeTab} wrapper */}
      </main>

      {/* Modals */}
      {isEditOpen && (
        <StudentEditModal
          open={isEditOpen}
          student={editingStudent}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            if (!activeSectionId) return;
            const updatedRoster = currentRoster.map((r) => (r.id === updated.id ? updated : r));
            setRosterOverrides((prev) => ({ ...prev, [String(activeSectionId)]: updatedRoster }));
            setIsEditOpen(false);
          }}
        />
      )}

      <AssignmentCreateEdit
        open={isAssignmentModalOpen}
        assignment={editingAssignment}
        courseId={String(activeSectionId || '')}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSave={handleSaveAssignment}
        onUploadInstructions={editingAssignment ? handleUploadInstructions : undefined}
      />

      <GradingPanel
        submission={selectedSubmissionForGrading}
        maxScore={
          selectedAssignmentForSubmissions
            ? Number(selectedAssignmentForSubmissions.maxScore) || 100
            : 100
        }
        latePenalty={selectedAssignmentForSubmissions?.latePenalty}
        onClose={() => setSelectedSubmissionForGrading(null)}
        onSave={handleSaveAssignmentGrade}
      />

      <GradeModal
        open={isGradeModalOpen}
        gradeData={editingGrade}
        onClose={() => setIsGradeModalOpen(false)}
        onSave={handleSaveGrade}
      />

      <AttendanceModal
        open={isAttendanceModalOpen}
        attendanceData={editingAttendance}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSave={handleSaveAttendance}
      />

      <MessageModal
        open={isMessageModalOpen}
        messageData={editingMessage}
        onClose={() => setIsMessageModalOpen(false)}
        onSave={handleSaveMessage}
        mode={messageMode}
      />

      <ConfirmDialog
        open={assignmentToDelete !== null}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={confirmDeleteAssignment}
        onCancel={() => setAssignmentToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={gradeToDelete !== null}
        title="Delete Grade"
        message="Are you sure you want to delete this grade entry? This action cannot be undone."
        onConfirm={confirmDeleteGrade}
        onCancel={() => setGradeToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={attendanceToDelete !== null}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={confirmDeleteAttendance}
        onCancel={() => setAttendanceToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={messageToDelete !== null}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDeleteMessage}
        onCancel={() => setMessageToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <AIAttendanceModal
        open={isAIAttendanceModalOpen}
        onClose={() => setIsAIAttendanceModalOpen(false)}
        courseSection={selectedSection?.courseCode || 'Unknown Section'}
      />
    </div>
  );
}

// Main component wrapped with providers
function InstructorDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <InstructorDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default InstructorDashboard;
