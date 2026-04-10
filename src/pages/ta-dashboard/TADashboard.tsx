import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Beaker,
  FileText,
  Users,
  Calendar,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  User,
  BarChart3,
  Bell,
  Brain,
  FolderOpen,
  HelpCircle,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ModernDashboard,
  CoursesPage,
  LabsPage,
  GradingPage,
  StudentPerformancePage,
  SchedulePage,
  AnnouncementsPage,
  DiscussionPage,
  AnalyticsPage,
  NotificationsPage,
  AIAssistantPage,
  LabResourcesPage,
  AssignmentGradingPage,
} from './components';
import { QuizzesPage } from './components/QuizzesPage';
import { UploadMaterialsPage as LiveUploadMaterialsPage } from '../instructor-dashboard/components/UploadMaterialsPage';
import {
  ThemeProvider as InstructorThemeProvider,
} from '../instructor-dashboard/contexts/ThemeContext';
import {
  LanguageProvider as InstructorLanguageProvider,
} from '../instructor-dashboard/contexts/LanguageContext';
import {
  FeatureOverlay,
  LiveAnalyticsPage,
  LiveAnnouncementsPage,
  LiveCourseDetailsPage,
  LiveLabsPage,
  LiveNotificationsPage,
  LiveQuizzesPage,
  LiveSchedulePage,
  LiveStudentsPage,
} from './components/LiveModeViews';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  ASSIGNED_COURSES,
  LABS,
  SUBMISSIONS,
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  UPCOMING_LABS,
  STUDENT_PERFORMANCE,
} from './constants';
import { getMockLiveCourseDetail } from './mockLiveCourseDetails';
import { useAuth } from '../../context/AuthContext';
import {
  AuthService,
  type User as AuthUser,
} from '../../services/api/authService';
import {
  EnrollmentService,
  type SectionInstructor,
  type TeachingCourse,
} from '../../services/api/enrollmentService';
import { LabService, type Lab, type LabSubmission, type LabWithInstructions } from '../../services/api/labService';
import { CourseService, type CourseMaterial, type SectionSchedule } from '../../services/api/courseService';
import {
  announcementService,
  type Announcement,
} from '../../services/api/announcementService';
import {
  NotificationService,
  type Notification,
} from '../../services/api/notificationService';
import {
  AnalyticsService,
  type AnalyticsDashboardData,
  type AttendanceTrendPoint,
  type AtRiskStudentsData,
  type GradeDistributionData,
} from '../../services/api/analyticsService';
import {
  QuizService,
  type Quiz,
  type QuizAttempt,
  type QuizQuestion,
} from '../../services/api/quizService';
import {
  ScheduleService,
  type AcademicEvent,
  type ScheduleItem,
} from '../../services/api/scheduleService';

type TabKey =
  | 'dashboard'
  | 'courses'
  | 'labs'
  | 'quizzes'
  | 'assignments'
  | 'grading'
  | 'students'
  | 'schedule'
  | 'announcements'
  | 'discussion'
  | 'chat'
  | 'profile'
  | 'analytics'
  | 'notifications'
  | 'ai-assistant'
  | 'lab-resources';

type DashboardCourseCard = {
  id: string;
  name: string;
  code: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  semester: string;
  labCount: number;
  studentCount: number;
  pendingSubmissions: number;
  averageGrade: number;
  attendanceRate: number;
};

type DashboardLabCard = {
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
};

type DashboardSubmission = {
  id: string;
  labId: string;
  studentName: string;
  submittedAt: string;
  submissionText?: string;
  files: { name: string; size: string; fileId?: number | null }[];
  status: 'submitted' | 'graded' | 'returned' | 'resubmit' | 'late';
};

type LiveStudentRow = {
  id: string;
  userId: number;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  status: string;
  grade: string | null;
  finalScore: number | null;
  enrollmentDate: string;
};

const TABS: { key: TabKey; label: string; icon: any; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'Overview' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Overview' },
  { key: 'courses', label: 'Courses', icon: BookOpen, group: 'Teaching' },
  { key: 'labs', label: 'Labs', icon: Beaker, group: 'Teaching' },
  { key: 'quizzes', label: 'Quizzes', icon: HelpCircle, group: 'Teaching' },
  { key: 'assignments', label: 'Assignments', icon: FileText, group: 'Teaching' },
  { key: 'lab-resources', label: 'Lab Resources', icon: FolderOpen, group: 'Teaching' },
  { key: 'grading', label: 'Grading', icon: FileText, group: 'Teaching' },
  { key: 'students', label: 'Students', icon: Users, group: 'Students' },
  { key: 'schedule', label: 'Schedule', icon: Calendar, group: 'Schedule' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, group: 'Schedule' },
  { key: 'notifications', label: 'Notifications', icon: Bell, group: 'Communication' },
  { key: 'discussion', label: 'Discussion', icon: MessagesSquare, group: 'Communication' },
  { key: 'chat', label: 'Chat', icon: MessageSquare, group: 'Communication' },
  { key: 'ai-assistant', label: 'AI Assistant', icon: Brain, group: 'Tools' },
  { key: 'profile', label: 'Profile', icon: User, group: 'Account' },
];

const OVERLAY_COPY: Record<
  'ai-assistant' | 'backend-not-implemented' | 'assignments-pending' | 'resources-pending' | 'profile-updates-pending',
  { title: string; description: string; type: 'ai' | 'backend' }
> = {
  'ai-assistant': {
    title: 'AI Assistant Is Not Connected Yet',
    description:
      'The EduVerse AI core is currently undergoing live synchronization. Mock responses are shown for layout verification.',
    type: 'ai',
  },
  'backend-not-implemented': {
    title: 'Backend Module Not Connected Yet',
    description:
      'This feature is currently in the mock phase. The backend integration for this page is being finalized.',
    type: 'backend',
  },
  'assignments-pending': {
    title: 'Assignment Distribution Pending',
    description:
      'Live assignment tracking and automated distribution logic is currently being refined for the TA workflow.',
    type: 'backend',
  },
  'resources-pending': {
    title: 'Lab Material Sync Pending',
    description:
      'Automated synchronization between course files and lab infrastructure is coming in a future update.',
    type: 'backend',
  },
  'profile-updates-pending': {
    title: 'Account Settings Read-Only',
    description:
      'Your profile data is live, but updating personal information and security settings is currently restricted.',
    type: 'backend',
  },
};

const GRADING_AI_DISABLED_REASON =
  'AI grading is not implemented yet.';
const DISCUSSION_DELETE_DISABLED_REASON =
  'Deleting discussions is not available for TA live mode.';
const ANNOUNCEMENT_PIN_DISABLED_REASON =
  'Pinning announcements is not connected to the backend yet.';
const MATERIAL_DOWNLOAD_DISABLED_REASON =
  'Material downloads are not connected to the backend yet.';
const QUIZ_AI_DISABLED_REASON = 'AI quiz generation is not connected to the backend yet.';
const QUIZ_ANALYTICS_DISABLED_REASON =
  'Detailed quiz analytics are not connected in the TA live flow yet.';

const MOCK_PROFILE_DATA = {
  fullName: 'Ahmed Hassan',
  role: 'Teaching Assistant',
  department: 'Computer Science',
  email: 'ahmed.hassan@university.edu',
  phone: '+20 100 234 5678',
  address: 'Cairo, Egypt',
  dateOfBirth: '1998-11-10',
  bio: 'Graduate teaching assistant pursuing M.Sc. in Computer Science. Assisting in programming and data structures courses while conducting research in distributed systems.',
  interests: [
    'Distributed Systems',
    'Cloud Computing',
    'Data Structures',
    'Algorithms',
    'Teaching Pedagogy',
  ],
  skills: ['Java', 'Python', 'C++', 'Docker', 'Kubernetes', 'Linux'],
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : 'N/A';

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : 'N/A';

const formatTimeWindow = (start?: string | null, end?: string | null) => {
  if (start && end) {
    return `${new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${new Date(end).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  if (start) {
    return `Opens ${new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  if (end) {
    return `Due ${new Date(end).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return 'No time window';
};

const getLiveLabStatus = (lab: Lab): DashboardLabCard['status'] => {
  const now = new Date();
  const availableFrom = lab.availableFrom ? new Date(lab.availableFrom) : null;
  const dueDate = lab.dueDate ? new Date(lab.dueDate) : null;

  if (lab.status === 'closed') return 'completed';
  if (lab.status === 'draft') return 'upcoming';
  if (availableFrom && availableFrom > now) return 'upcoming';
  if (dueDate && dueDate < now) return 'completed';
  return 'active';
};

const getNotificationActivityType = (notification: Notification) => {
  switch (notification.notificationType) {
    case 'assignment':
      return 'submission';
    case 'announcement':
      return 'question';
    case 'grade':
      return 'grade';
    default:
      return 'attendance';
  }
};

function TADashboardContent() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, isRTL, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabsCourseId, setSelectedLabsCourseId] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [selectedAnalyticsCourseId, setSelectedAnalyticsCourseId] = useState<string>('');

  const isMockMode = !isAuthenticated || location.state?.isMock;

  const translatedTabs = TABS.map((tab) => ({
    id: tab.key,
    label: t(tab.key),
    icon: tab.icon,
    group: t(tab.group.toLowerCase()),
  }));

  useEffect(() => {
    const tabFromUrl = params.tab as TabKey;
    if (tabFromUrl && TABS.some((tab) => tab.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [params.tab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate(`/tadashboard/${tab}`);
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleViewLab = (labId: string) => {
    setSelectedLabId(labId);
  };

  const mockAllSubmissions = Object.values(SUBMISSIONS).flat();

  const { data: liveProfile } = useQuery<AuthUser>({
    queryKey: ['ta-live-profile'],
    queryFn: () => AuthService.getMe(),
    enabled: !isMockMode,
  });

  const {
    data: teachingCoursesLive = [],
    isLoading: teachingCoursesLoading,
  } = useQuery<TeachingCourse[]>({
    queryKey: ['ta-teaching-courses'],
    queryFn: () => EnrollmentService.getTeachingCourses(),
    enabled: !isMockMode,
  });

  const {
    data: sectionInstructors = {},
  } = useQuery<Record<number, SectionInstructor | null>>({
    queryKey: ['ta-section-instructors', teachingCoursesLive.map((course) => course.sectionId)],
    queryFn: async () => {
      const entries = await Promise.all(
        teachingCoursesLive.map(async (course) => [
          course.sectionId,
          await EnrollmentService.getSectionInstructor(course.sectionId),
        ] as const)
      );
      return Object.fromEntries(entries);
    },
    enabled: !isMockMode && teachingCoursesLive.length > 0,
  });

  const liveCourseIds = useMemo(
    () => Array.from(new Set(teachingCoursesLive.map((course) => Number(course.courseId)))),
    [teachingCoursesLive]
  );

  const { data: rawLabsLive = [], isLoading: labsLoading } = useQuery<Lab[]>({
    queryKey: ['ta-labs', liveCourseIds],
    queryFn: async () => {
      const labs = await LabService.getAll();
      return labs.filter((lab) => liveCourseIds.includes(Number(lab.courseId)));
    },
    enabled: !isMockMode && liveCourseIds.length > 0,
  });

  const {
    data: labSubmissionsByLabId = {},
    isLoading: submissionsLoading,
  } = useQuery<Record<string, LabSubmission[]>>({
    queryKey: ['ta-lab-submissions', rawLabsLive.map((lab) => lab.id)],
    queryFn: async () => {
      const entries = await Promise.all(
        rawLabsLive.map(async (lab) => [lab.id, await LabService.getSubmissions(lab.id)] as const)
      );
      return Object.fromEntries(entries);
    },
    enabled: !isMockMode && rawLabsLive.length > 0,
  });

  const {
    data: selectedLiveLabDetails,
    isLoading: selectedLiveLabDetailsLoading,
  } = useQuery<LabWithInstructions>({
    queryKey: ['ta-lab-details', selectedLabId],
    queryFn: () => LabService.getById(String(selectedLabId)),
    enabled: !isMockMode && !!selectedLabId,
  });

  const createLabMutation = useMutation({
    mutationFn: (payload: {
      courseId: number;
      title: string;
      description?: string;
      labNumber?: number;
      dueDate?: string;
      availableFrom?: string;
      maxScore?: number;
      weight?: number;
      status?: 'draft' | 'published' | 'closed';
    }) => LabService.create(payload),
    onSuccess: async () => {
      toast.success('Lab created.');
      await queryClient.invalidateQueries({ queryKey: ['ta-labs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lab.');
    },
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({
      labId,
      submissionId,
      status,
    }: {
      labId: string;
      submissionId: string;
      status: 'submitted' | 'graded' | 'returned' | 'resubmit';
    }) => LabService.gradeSubmission(labId, submissionId, status),
    onSuccess: async () => {
      toast.success('Submission status updated.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ta-lab-submissions'] }),
        queryClient.invalidateQueries({ queryKey: ['ta-labs'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update submission status.');
    },
  });

  const {
    data: liveQuizzesResponse,
    isLoading: quizzesLoading,
  } = useQuery<{ data: Quiz[]; total: number }>({
    queryKey: ['ta-quizzes', liveCourseIds],
    queryFn: () => QuizService.getAll({ limit: 100 }),
    enabled: !isMockMode && activeTab === 'quizzes' && liveCourseIds.length > 0,
  });

  const liveQuizzes = useMemo(
    () =>
      (liveQuizzesResponse?.data || []).filter((quiz) =>
        liveCourseIds.includes(Number(quiz.courseId))
      ),
    [liveCourseIds, liveQuizzesResponse]
  );

  const {
    data: liveQuizAttempts = [],
    isLoading: quizAttemptsLoading,
  } = useQuery<QuizAttempt[]>({
    queryKey: ['ta-quiz-attempts'],
    queryFn: () => QuizService.getAllAttempts({ limit: 200 }),
    enabled: !isMockMode && activeTab === 'quizzes',
  });

  const createQuizMutation = useMutation({
    mutationFn: async (payload: {
      courseId: string;
      title: string;
      description: string;
      timeLimitMinutes: string;
      maxAttempts: string;
      passingScore: string;
      weight: string;
      availableFrom: string;
      availableUntil: string;
      questions: {
        id: number;
        text: string;
        options: string[];
        correctOption: number;
      }[];
    }) => {
      const createdQuiz = await QuizService.create({
        courseId: Number(payload.courseId),
        title: payload.title.trim(),
        description: payload.description.trim() || undefined,
        quizType: 'graded',
        timeLimitMinutes: payload.timeLimitMinutes ? Number(payload.timeLimitMinutes) : undefined,
        maxAttempts: payload.maxAttempts ? Number(payload.maxAttempts) : 1,
        passingScore: payload.passingScore ? Number(payload.passingScore) : undefined,
        availableFrom: payload.availableFrom || undefined,
        availableUntil: payload.availableUntil || undefined,
        weight: payload.weight ? Number(payload.weight) : undefined,
        randomizeQuestions: false,
        showCorrectAnswers: true,
      });

      const validQuestions = payload.questions.filter(
        (question) =>
          question.text.trim() &&
          question.options.every((option) => option.trim())
      );

      await Promise.all(
        validQuestions.map((question, index) =>
          QuizService.addQuestion(String(createdQuiz.id), {
            questionText: question.text.trim(),
            questionType: 'mcq',
            options: question.options.map((option) => option.trim()),
            correctAnswer: String(question.correctOption),
            points: 1,
            orderIndex: index,
          })
        )
      );

      return createdQuiz;
    },
    onSuccess: async () => {
      toast.success('Quiz created.');
      await queryClient.invalidateQueries({ queryKey: ['ta-quizzes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quiz.');
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({
      quizId,
      payload,
    }: {
      quizId: string;
      payload: {
        courseId: string;
        title: string;
        description: string;
        timeLimitMinutes: string;
        maxAttempts: string;
        passingScore: string;
        weight: string;
        availableFrom: string;
        availableUntil: string;
        questions: {
          id: number;
          existingQuestionId?: number;
          text: string;
          options: string[];
          correctOption: number;
        }[];
      };
    }) => {
      await QuizService.update(quizId, {
        courseId: Number(payload.courseId),
        title: payload.title.trim(),
        description: payload.description.trim() || undefined,
        quizType: 'graded',
        timeLimitMinutes: payload.timeLimitMinutes ? Number(payload.timeLimitMinutes) : undefined,
        maxAttempts: payload.maxAttempts ? Number(payload.maxAttempts) : 1,
        passingScore: payload.passingScore ? Number(payload.passingScore) : undefined,
        availableFrom: payload.availableFrom || undefined,
        availableUntil: payload.availableUntil || undefined,
        weight: payload.weight ? Number(payload.weight) : undefined,
        randomizeQuestions: false,
        showCorrectAnswers: true,
      });

      const existingQuiz = await QuizService.getById(quizId);
      const existingQuestions = existingQuiz.questions || [];
      const validQuestions = payload.questions.filter(
        (question) => question.text.trim() && question.options.every((option) => option.trim())
      );
      const retainedQuestionIds = new Set(
        validQuestions
          .map((question) => question.existingQuestionId)
          .filter((questionId): questionId is number => typeof questionId === 'number')
      );

      await Promise.all(
        existingQuestions
          .filter((question: QuizQuestion) => !retainedQuestionIds.has(question.id))
          .map((question: QuizQuestion) => QuizService.deleteQuestion(quizId, question.id))
      );

      await Promise.all(
        validQuestions.map((question, index) => {
          const questionPayload = {
            questionText: question.text.trim(),
            questionType: 'mcq' as const,
            options: question.options.map((option) => option.trim()),
            correctAnswer: String(question.correctOption),
            points: 1,
            orderIndex: index,
          };

          return question.existingQuestionId
            ? QuizService.updateQuestion(quizId, question.existingQuestionId, questionPayload)
            : QuizService.addQuestion(quizId, questionPayload);
        })
      );
    },
    onSuccess: async () => {
      toast.success('Quiz updated.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ta-quizzes'] }),
        queryClient.invalidateQueries({ queryKey: ['ta-quiz-attempts'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quiz.');
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => QuizService.delete(quizId),
    onSuccess: async () => {
      toast.success('Quiz deleted.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ta-quizzes'] }),
        queryClient.invalidateQueries({ queryKey: ['ta-quiz-attempts'] }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete quiz.');
    },
  });

  const {
    data: liveAnnouncements = [],
    isLoading: announcementsLoading,
  } = useQuery<Announcement[]>({
    queryKey: ['ta-announcements'],
    queryFn: () => announcementService.getAnnouncements({ limit: 100 }),
    enabled: !isMockMode,
  });

  const {
    data: liveNotifications = [],
    isLoading: notificationsLoading,
  } = useQuery<Notification[]>({
    queryKey: ['ta-notifications'],
    queryFn: () => NotificationService.getAll({ limit: 50 }),
    enabled: !isMockMode,
  });

  const {
    data: liveDailySchedule = [],
    isLoading: dailyScheduleLoading,
  } = useQuery<ScheduleItem[]>({
    queryKey: ['ta-daily-schedule'],
    queryFn: () => ScheduleService.getDaily(),
    enabled: !isMockMode,
  });

  const {
    data: liveAcademicEvents = [],
    isLoading: academicEventsLoading,
  } = useQuery<AcademicEvent[]>({
    queryKey: ['ta-academic-events'],
    queryFn: () => ScheduleService.getAcademicCalendar(),
    enabled: !isMockMode,
  });

  const {
    data: liveStudentRows = [],
    isLoading: studentsLoading,
  } = useQuery<LiveStudentRow[]>({
    queryKey: ['ta-students', teachingCoursesLive.map((course) => course.sectionId)],
    queryFn: async () => {
      const sections = await Promise.all(
        teachingCoursesLive.map(async (course) => {
          const rows = await EnrollmentService.getSectionStudents(course.sectionId);
          return rows.map((row) => ({
            id: `${course.sectionId}-${row.userId}`,
            userId: Number(row.userId),
            courseCode: course.course.code,
            courseName: course.course.name,
            sectionNumber: course.section.sectionNumber,
            status: row.status,
            grade: row.grade,
            finalScore: row.finalScore,
            enrollmentDate: row.enrollmentDate,
          }));
        })
      );
      return sections.flat();
    },
    enabled: !isMockMode && teachingCoursesLive.length > 0,
  });

  const selectedLiveTeachingCourse = useMemo(
    () =>
      selectedCourseId
        ? teachingCoursesLive.find((course) => String(course.sectionId) === selectedCourseId) || null
        : null,
    [selectedCourseId, teachingCoursesLive]
  );
  const defaultLiveTeachingCourse = useMemo(
    () => teachingCoursesLive[0] ?? null,
    [teachingCoursesLive]
  );
  const activeCourseForContent = selectedLiveTeachingCourse || defaultLiveTeachingCourse;

  const {
    data: liveSelectedCourseMaterials = [],
  } = useQuery<CourseMaterial[]>({
    queryKey: ['ta-course-materials', selectedLiveTeachingCourse?.courseId],
    queryFn: () => CourseService.getMaterials(Number(selectedLiveTeachingCourse?.courseId)),
    enabled: !isMockMode && !!selectedLiveTeachingCourse,
  });

  const {
    data: liveSelectedCourseSchedules = [],
  } = useQuery<SectionSchedule[]>({
    queryKey: ['ta-course-schedules', selectedLiveTeachingCourse?.sectionId],
    queryFn: () => CourseService.getSectionSchedules(String(selectedLiveTeachingCourse?.sectionId)),
    enabled: !isMockMode && !!selectedLiveTeachingCourse,
  });

  const {
    data: liveAnalyticsSummary,
    isLoading: analyticsSummaryLoading,
  } = useQuery<AnalyticsDashboardData>({
    queryKey: ['ta-analytics-dashboard'],
    queryFn: () => AnalyticsService.getDashboard(),
    enabled: !isMockMode && activeTab === 'analytics',
  });

  const {
    data: liveAttendanceTrends = [],
    isLoading: attendanceTrendsLoading,
  } = useQuery<AttendanceTrendPoint[]>({
    queryKey: ['ta-analytics-attendance', selectedAnalyticsCourseId],
    queryFn: () => AnalyticsService.getAttendanceTrends(Number(selectedAnalyticsCourseId)),
    enabled: !isMockMode && activeTab === 'analytics' && !!selectedAnalyticsCourseId,
  });

  const {
    data: liveGradeDistribution,
    isLoading: gradeDistributionLoading,
  } = useQuery<GradeDistributionData>({
    queryKey: ['ta-analytics-grade-distribution', selectedAnalyticsCourseId],
    queryFn: () => AnalyticsService.getGradeDistribution(Number(selectedAnalyticsCourseId)),
    enabled: !isMockMode && activeTab === 'analytics' && !!selectedAnalyticsCourseId,
  });

  const {
    data: liveAtRiskStudents,
    isLoading: atRiskStudentsLoading,
  } = useQuery<AtRiskStudentsData>({
    queryKey: ['ta-analytics-at-risk', selectedAnalyticsCourseId],
    queryFn: () => AnalyticsService.getAtRiskStudents(Number(selectedAnalyticsCourseId)),
    enabled: !isMockMode && activeTab === 'analytics' && !!selectedAnalyticsCourseId,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async ({
      title,
      content,
      courseId,
    }: {
      title: string;
      content: string;
      courseId: string;
    }) =>
      announcementService.createAnnouncement({
        title,
        content,
        courseId: Number(courseId),
        priority: 'medium',
        announcementType: 'course',
      }),
    onSuccess: async () => {
      toast.success('Announcement draft created.');
      await queryClient.invalidateQueries({ queryKey: ['ta-announcements'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create announcement.');
    },
  });

  const publishAnnouncementMutation = useMutation({
    mutationFn: (id: string) => announcementService.publishAnnouncement(id),
    onSuccess: async () => {
      toast.success('Announcement published.');
      await queryClient.invalidateQueries({ queryKey: ['ta-announcements'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish announcement.');
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: async () => {
      toast.success('Announcement deleted.');
      await queryClient.invalidateQueries({ queryKey: ['ta-announcements'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete announcement.');
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ta-notifications'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ta-notifications'] });
    },
  });

  const clearNotificationsMutation = useMutation({
    mutationFn: () => NotificationService.clearAll(),
    onSuccess: async () => {
      toast.success('Notifications cleared.');
      await queryClient.invalidateQueries({ queryKey: ['ta-notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear notifications.');
    },
  });

  const liveLabs = useMemo<DashboardLabCard[]>(() => {
    const courseNameById = new Map(
      teachingCoursesLive.map((course) => [Number(course.courseId), course.course.name])
    );

    return rawLabsLive.map((lab) => {
      const submissions = labSubmissionsByLabId[lab.id] || [];
      const gradedCount = submissions.filter((submission) => submission.status === 'graded').length;

      return {
        id: lab.id,
        courseId: String(lab.courseId),
        courseName: lab.course?.name || courseNameById.get(Number(lab.courseId)) || 'Course',
        labNumber: lab.labNumber || 0,
        title: lab.title,
        date: formatDate(lab.dueDate || lab.availableFrom),
        time: formatTimeWindow(lab.availableFrom, lab.dueDate),
        location: 'Online / LMS',
        status: getLiveLabStatus(lab),
        submissionCount: submissions.length,
        gradedCount,
        attendanceCount: 0,
      };
    });
  }, [labSubmissionsByLabId, rawLabsLive, teachingCoursesLive]);

  const liveSubmissions = useMemo<DashboardSubmission[]>(() => {
    return Object.entries(labSubmissionsByLabId).flatMap(([labId, submissions]) =>
      submissions.map((submission) => ({
        id: submission.id,
        labId,
        studentName: submission.user
          ? `${submission.user.firstName} ${submission.user.lastName}`
          : `Student #${submission.userId}`,
        submittedAt: submission.submittedAt,
        submissionText: submission.submissionText || undefined,
        files: submission.file || submission.fileId || submission.submissionText
          ? [
              {
                name:
                  submission.file?.originalFileName ||
                  submission.file?.fileName ||
                  (submission.fileId ? `Submission file #${submission.fileId}` : 'Text submission'),
                size:
                  typeof submission.file?.fileSize === 'number'
                    ? `${Math.max(1, Math.round(submission.file.fileSize / 1024))} KB`
                    : submission.submissionText
                      ? 'Text submission'
                      : 'Uploaded file',
                fileId: submission.fileId,
              },
            ]
          : [],
        status: submission.status,
      }))
    );
  }, [labSubmissionsByLabId]);

  const liveCourses = useMemo<DashboardCourseCard[]>(() => {
    return teachingCoursesLive.map((course) => {
      const instructorSummary = sectionInstructors[course.sectionId]?.instructor;
      const relatedLabs = liveLabs.filter((lab) => Number(lab.courseId) === Number(course.courseId));
      const relatedSubmissions = liveSubmissions.filter((submission) =>
        relatedLabs.some((lab) => lab.id === submission.labId)
      );
      const gradedSubmissions = relatedSubmissions.filter((submission) => submission.status === 'graded');
      const averageGrade = relatedSubmissions.length
        ? Math.round(
            (gradedSubmissions.length / relatedSubmissions.length) * 100
          )
        : 0;

      return {
        id: String(course.sectionId),
        name: course.course.name,
        code: `${course.course.code} • Sec ${course.section.sectionNumber}`,
        instructor: {
          id: String(instructorSummary?.userId || course.sectionId),
          name: instructorSummary?.fullName || 'Assigned instructor',
          email: instructorSummary?.email || '',
        },
        semester: course.semester.name,
        labCount: relatedLabs.length,
        studentCount: course.section.currentEnrollment,
        pendingSubmissions: relatedSubmissions.filter((submission) => submission.status === 'submitted')
          .length,
        averageGrade,
        attendanceRate: 0,
      };
    });
  }, [liveLabs, liveSubmissions, sectionInstructors, teachingCoursesLive]);

  const liveDashboardStats = useMemo(
    () => ({
      totalCourses: liveCourses.length,
      activeLabs: liveLabs.filter((lab) => lab.status === 'active').length,
      pendingSubmissions: liveSubmissions.filter((submission) => submission.status === 'submitted')
        .length,
      averagePerformance:
        liveCourses.length > 0
          ? Math.round(
              liveCourses.reduce((sum, course) => sum + course.averageGrade, 0) / liveCourses.length
            )
          : 0,
      unreadMessages: liveNotifications.filter((notification) => !notification.read).length,
      upcomingLabs: liveLabs.filter((lab) => lab.status === 'upcoming').length,
    }),
    [liveCourses, liveLabs, liveNotifications, liveSubmissions]
  );

  const liveRecentActivity = useMemo(
    () =>
      liveNotifications.slice(0, 6).map((notification) => ({
        id: notification.id,
        type: getNotificationActivityType(notification),
        message: notification.title,
        timestamp: notification.createdAt,
        course: notification.notificationType,
      })),
    [liveNotifications]
  );

  const liveUpcomingLabs = useMemo(
    () =>
      liveLabs
        .filter((lab) => lab.status !== 'completed')
        .slice(0, 5)
        .map((lab) => ({
          id: lab.id,
          title: lab.title,
          course: lab.courseName,
          date: lab.date,
          time: lab.time,
          location: lab.location,
        })),
    [liveLabs]
  );

  const announcementCourseOptions = useMemo(() => {
    const courseMap = new Map<string, string>();
    teachingCoursesLive.forEach((course) => {
      courseMap.set(String(course.courseId), `${course.course.code} - ${course.course.name}`);
    });
    return Array.from(courseMap.entries()).map(([value, label]) => ({ value, label }));
  }, [teachingCoursesLive]);

  const analyticsCourseOptions = useMemo(() => {
    const courseMap = new Map<string, string>();
    teachingCoursesLive.forEach((course) => {
      courseMap.set(String(course.courseId), `${course.course.code} - ${course.course.name}`);
    });
    return Array.from(courseMap.entries()).map(([value, label]) => ({ value, label }));
  }, [teachingCoursesLive]);

  useEffect(() => {
    if (!selectedAnalyticsCourseId && analyticsCourseOptions.length > 0) {
      setSelectedAnalyticsCourseId(analyticsCourseOptions[0].value);
    }
  }, [analyticsCourseOptions, selectedAnalyticsCourseId]);

  useEffect(() => {
    if (isMockMode) return;
    if (!selectedCourseId) return;
    const hasSelectedCourse = teachingCoursesLive.some(
      (course) => String(course.sectionId) === selectedCourseId
    );
    if (!hasSelectedCourse) {
      setSelectedCourseId(null);
    }
  }, [isMockMode, teachingCoursesLive, selectedCourseId]);

  const profileData = useMemo(() => {
    if (isMockMode) return MOCK_PROFILE_DATA;

    const source = liveProfile || user;
    return {
      fullName: source?.fullName || 'Teaching Assistant',
      role: 'Teaching Assistant',
      department: 'Teaching Staff',
      email: source?.email || '',
      phone: source?.phone || 'N/A',
      address: 'Not available',
      dateOfBirth: 'Not available',
      bio: isMockMode
        ? 'Graduate teaching assistant supporting labs, grading, and student communication.'
        : 'Live profile data is loaded from your authenticated account. Edit actions are not connected yet.',
      interests: ['Labs', 'Grading', 'Student Support'],
      skills: ['Teaching Assistance', 'Communication', 'Evaluation'],
    };
  }, [isMockMode, liveProfile, user]);

  const currentUserName = isMockMode
    ? 'Ahmed Hassan'
    : liveProfile?.fullName || user?.fullName || 'Teaching Assistant';

  const mockLiveCourseDetail = isMockMode ? getMockLiveCourseDetail(selectedCourseId) : null;

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${
        isDark ? 'bg-background-dark' : 'bg-background-light'
      } text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <DashboardSidebar
        tabs={translatedTabs}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={[
          'Overview',
          'Teaching',
          'Students',
          'Schedule',
          'Communication',
          'Tools',
          'Account',
        ]}
      />

      <main
        className={`flex-1 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'} ${
          activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'
        }`}
      >
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName={currentUserName}
            userRole="Teaching Assistant"
            isDark={isDark}
            isRTL={isRTL}
            accentColor={primaryHex || '#2563EB'}
            avatarGradient="from-blue-500 to-blue-500"
            language={language}
            onToggleTheme={toggleTheme}
            onSetLanguage={setLanguage}
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
          />
        )}

        {activeTab === 'dashboard' && (
          <ModernDashboard
            stats={isMockMode ? DASHBOARD_STATS : liveDashboardStats}
            courses={isMockMode ? ASSIGNED_COURSES : liveCourses}
            upcomingLabs={isMockMode ? UPCOMING_LABS : liveUpcomingLabs}
            recentActivity={isMockMode ? RECENT_ACTIVITY : liveRecentActivity}
            onNavigate={handleTabChange}
          />
        )}

        {activeTab === 'courses' &&
          (isMockMode ? (
            mockLiveCourseDetail ? (
              <LiveCourseDetailsPage
                course={mockLiveCourseDetail.course}
                instructorName={mockLiveCourseDetail.instructorName}
                materials={mockLiveCourseDetail.materials}
                schedules={mockLiveCourseDetail.schedules}
                labs={mockLiveCourseDetail.labs}
                announcements={mockLiveCourseDetail.announcements}
                students={mockLiveCourseDetail.students}
                onBack={() => setSelectedCourseId(null)}
                materialsDisabledReason={MATERIAL_DOWNLOAD_DISABLED_REASON}
                mockDataBanner="Mock data (offline) — not from the API. Log in without mock mode to compare Live backend data."
              />
            ) : (
              <CoursesPage
                courses={ASSIGNED_COURSES}
                onViewCourse={handleViewCourse}
                disableRouteNavigation
                listOnly
              />
            )
          ) : selectedLiveTeachingCourse ? (
            <LiveCourseDetailsPage
              course={selectedLiveTeachingCourse}
              instructorName={
                sectionInstructors[selectedLiveTeachingCourse.sectionId]?.instructor?.fullName ||
                'Assigned instructor'
              }
              materials={liveSelectedCourseMaterials}
              schedules={liveSelectedCourseSchedules}
              labs={liveLabs.filter(
                (lab) => Number(lab.courseId) === Number(selectedLiveTeachingCourse.courseId)
              )}
              announcements={liveAnnouncements.filter(
                (announcement) =>
                  Number(announcement.courseId) === Number(selectedLiveTeachingCourse.courseId)
              )}
              students={liveStudentRows.filter(
                (student) =>
                  student.courseCode === selectedLiveTeachingCourse.course.code &&
                  student.sectionNumber === selectedLiveTeachingCourse.section.sectionNumber
              )}
              onBack={() => setSelectedCourseId(null)}
              materialsDisabledReason={MATERIAL_DOWNLOAD_DISABLED_REASON}
              liveDataBanner="Live: data from the API (teaching sections, schedules, materials, labs, announcements, and students for this course)."
            />
          ) : (
            <CoursesPage
              courses={liveCourses}
              onViewCourse={handleViewCourse}
              disableRouteNavigation
            />
          ))}

        {activeTab === 'labs' &&
          (isMockMode ? (
            <LabsPage
              labs={selectedCourseId ? LABS.filter((lab) => lab.courseId === selectedCourseId) : LABS}
              onViewLab={handleViewLab}
            />
          ) : (
            <LiveLabsPage
              labs={liveLabs}
              courseOptions={analyticsCourseOptions}
              selectedCourseId={selectedLabsCourseId}
              onCourseChange={setSelectedLabsCourseId}
              selectedLabId={selectedLabId}
              onViewLab={setSelectedLabId}
              labDetails={selectedLiveLabDetails}
              labSubmissions={selectedLabId ? labSubmissionsByLabId[selectedLabId] || [] : []}
              loading={labsLoading}
              detailsLoading={selectedLiveLabDetailsLoading || submissionsLoading}
              onCreateLab={(payload) => createLabMutation.mutateAsync(payload)}
            />
          ))}

        {activeTab === 'quizzes' &&
          (isMockMode ? (
            <QuizzesPage />
          ) : (
            <LiveQuizzesPage
              quizzes={liveQuizzes}
              attempts={liveQuizAttempts.filter((attempt) =>
                liveQuizzes.some((quiz) => String(quiz.id) === String(attempt.quizId))
              )}
              loading={quizzesLoading || quizAttemptsLoading}
              courseOptions={analyticsCourseOptions}
              aiDisabledReason={QUIZ_AI_DISABLED_REASON}
              analyticsDisabledReason={QUIZ_ANALYTICS_DISABLED_REASON}
              onCreateQuiz={(payload) => createQuizMutation.mutateAsync(payload)}
              onLoadQuizDetails={(quizId) => QuizService.getById(quizId)}
              onUpdateQuiz={(quizId, payload) =>
                updateQuizMutation.mutateAsync({ quizId, payload })
              }
              onDeleteQuiz={(quizId) => deleteQuizMutation.mutateAsync(quizId)}
            />
          ))}

        {/* Assignments Tab (Merged from 001-wire-dashboard-modules) */}
        {activeTab === 'assignments' && (
          <AssignmentGradingPage
            courseId={
              activeCourseForContent?.courseId ? String(activeCourseForContent.courseId) : undefined
            }
          />
        )}

        {activeTab === 'grading' &&
          (isMockMode ? (
            <GradingPage submissions={Object.values(SUBMISSIONS).flat() as any} />
          ) : (
            <GradingPage
              submissions={liveSubmissions}
              onGradeStatusChange={async (submissionId, status) => {
                const submission = liveSubmissions.find((item) => item.id === submissionId);
                if (!submission) {
                  throw new Error('Submission not found.');
                }
                await gradeSubmissionMutation.mutateAsync({
                  labId: submission.labId,
                  submissionId,
                  status,
                });
              }}
              onDownloadFile={(fileId, fileName) => LabService.downloadFile(fileId, fileName)}
              gradingSubmissionId={
                gradeSubmissionMutation.isPending
                  ? gradeSubmissionMutation.variables?.submissionId || null
                  : null
              }
              disabledActions={{
                aiGrade: GRADING_AI_DISABLED_REASON,
              }}
            />
          ))}

        {activeTab === 'students' &&
          (isMockMode ? (
            <StudentPerformancePage
              students={STUDENT_PERFORMANCE}
              readOnly
              assignedCourseNames={ASSIGNED_COURSES.map((course) => course.name)}
            />
          ) : (
            <LiveStudentsPage students={liveStudentRows} loading={studentsLoading || teachingCoursesLoading} />
          ))}

        {activeTab === 'schedule' &&
          (isMockMode ? (
            <SchedulePage />
          ) : (
            <LiveSchedulePage
              dailySchedule={liveDailySchedule}
              academicEvents={liveAcademicEvents}
              loading={dailyScheduleLoading || academicEventsLoading}
            />
          ))}

        {activeTab === 'announcements' &&
          (isMockMode ? (
            <AnnouncementsPage />
          ) : (
            <LiveAnnouncementsPage
              announcements={liveAnnouncements}
              loading={announcementsLoading}
              courseOptions={announcementCourseOptions}
              onCreate={(value) => createAnnouncementMutation.mutateAsync(value)}
              onDelete={(id) => deleteAnnouncementMutation.mutateAsync(id)}
              onPublish={(id) => publishAnnouncementMutation.mutateAsync(id)}
              pinDisabledReason={ANNOUNCEMENT_PIN_DISABLED_REASON}
            />
          ))}

        {activeTab === 'discussion' && (
          <DiscussionPage
            userRole="ta"
            userName={currentUserName}
            disableDeleteReason={DISCUSSION_DELETE_DISABLED_REASON}
          />
        )}

        {activeTab === 'chat' && (
          <MessagingChat
            height="100vh"
            currentUserName={currentUserName}
            showVideoCall={isMockMode} // Hidden in live mode for now as per previous banners
            showVoiceCall={isMockMode}
            isDark={isDark}
            accentColor={primaryHex || '#4f46e5'}
            className="rounded-none border-0"
          />
        )}

        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor="#2563EB"
            bannerGradient="from-blue-500 to-blue-500"
            profileData={profileData}
          />
        )}

        {activeTab === 'analytics' &&
          (isMockMode ? (
            <AnalyticsPage />
          ) : (
            <LiveAnalyticsPage
              summary={liveAnalyticsSummary}
              attendanceTrends={liveAttendanceTrends}
              gradeDistribution={liveGradeDistribution}
              atRiskData={liveAtRiskStudents}
              courseOptions={analyticsCourseOptions}
              selectedCourseId={selectedAnalyticsCourseId}
              onCourseChange={setSelectedAnalyticsCourseId}
              loading={
                analyticsSummaryLoading ||
                attendanceTrendsLoading ||
                gradeDistributionLoading ||
                atRiskStudentsLoading
              }
            />
          ))}

        {activeTab === 'notifications' &&
          (isMockMode ? (
            <NotificationsPage />
          ) : (
            <LiveNotificationsPage
              notifications={liveNotifications}
              loading={notificationsLoading}
              onMarkAsRead={(id) => markNotificationReadMutation.mutateAsync(id)}
              onMarkAllAsRead={() => markAllNotificationsReadMutation.mutateAsync()}
              onClearAll={() => clearNotificationsMutation.mutateAsync()}
            />
          ))}

        {activeTab === 'ai-assistant' &&
          (!isMockMode ? (
            <FeatureOverlay
              title={OVERLAY_COPY['ai-assistant'].title}
              description={OVERLAY_COPY['ai-assistant'].description}
              type={OVERLAY_COPY['ai-assistant'].type}
            >
              <AIAssistantPage />
            </FeatureOverlay>
          ) : (
            <AIAssistantPage />
          ))}

        {activeTab === 'lab-resources' && (
          <InstructorThemeProvider>
            <InstructorLanguageProvider>
              <LiveUploadMaterialsPage
                courseId={
                  activeCourseForContent?.courseId
                    ? String(activeCourseForContent.courseId)
                    : undefined
                }
              />
            </InstructorLanguageProvider>
          </InstructorThemeProvider>
        )}
      </main>
    </div>
  );
}

function TADashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TADashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default TADashboard;

