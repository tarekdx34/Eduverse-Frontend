import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  CheckSquare,
  Sparkles,
  MessageCircle,
  BarChart3,
  ListChecks,
  GraduationCap,
  Trophy,
  Bell,
  Users,
  Beaker,
  Megaphone,
  Settings,
  User,
  ClipboardCheck,
  Camera,
  X,
} from 'lucide-react';
import {
  StatsCard,
  GpaChart,
  PaymentHistory,
  ClassTab,
  ClassSchedule,
  GradesTranscript,
  Assignments,
  AcademicCalendar,
  AIFeatures,
  AttendanceOverview,
  SmartTodoReminder,
  CourseRegistration,
  Gamification,
  NotificationCenter,
  CourseCommunity,
  LabInstructions,
  SettingsPreferences,
  QuizzesTab,
  Announcements,
} from './components';
import TodayClassesWidget from './components/TodayClassesWidget';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import CourseViewPage from './pages/CourseView';
import { GPA_DATA } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { useNotificationRealtime } from '../../hooks/useNotificationRealtime';
import { useAuth } from '../../context/AuthContext';
import { EnrollmentService } from '../../services/api/enrollmentService';
import { GradesService } from '../../services/api/gradesService';
import {
  NotificationService,
  type Notification,
} from '../../services/api/notificationService';
import { AttendanceService } from '../../services/api/attendanceService';
import { toHeaderNotification } from '../../utils/notificationUi';
import PublicProfileView from './pages/PublicProfileView';

const tabTranslationKeys: Record<string, string> = {
  dashboard: 'dashboard',
  myclass: 'myClass',
  registration: 'registration',
  community: 'community',
  schedule: 'schedule',
  assignments: 'assignments',
  labs: 'labSessions',
  grades: 'grades',
  attendance: 'attendance',
  todo: 'todoList',
  ai: 'aiFeatures',
  quizzes: 'quizzes',
  gamification: 'achievements',
  notifications: 'notifications',
  payments: 'payments',
  chat: 'chat',
  announcements: 'announcements',
  settings: 'settings',
  profile: 'profile',
};

function StudentDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [headerUnreadCount, setHeaderUnreadCount] = useState(0);
  const [headerNotifications, setHeaderNotifications] = useState<Notification[]>([]);
  const [notificationRefreshSignal, setNotificationRefreshSignal] = useState(0);
  const [showFacePhotoReminder, setShowFacePhotoReminder] = useState(false);

  const { isRTL, language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6'; // Defined here as per instruction

  const { user } = useAuth();
  const { data: enrollments } = useApi(() => EnrollmentService.getMyCourses(), []);
  const { data: gpaSummary } = useApi(
    () =>
      user
        ? GradesService.getGpa(user.userId)
        : Promise.resolve({ semesterGpa: 0, cumulativeGpa: 0 }),
    [user?.userId]
  );

  const totalCredits = enrollments?.reduce((sum, e) => sum + (e.course?.credits ?? 0), 0) ?? 0;
  const activeClasses = enrollments?.filter((e) => e.status === 'enrolled').length ?? 0;
  const gpaValue = gpaSummary?.cumulativeGpa ?? 0;

  const dismissFacePhotoReminder = useCallback(() => {
    setShowFacePhotoReminder(false);
  }, []);

  useEffect(() => {
    if (!user?.userId) return;

    let cancelled = false;
    void (async () => {
      try {
        const list = await AttendanceService.listMyFaceReferences();
        if (cancelled) return;
        if (Array.isArray(list) && list.length === 0) {
          setShowFacePhotoReminder(true);
        } else {
          setShowFacePhotoReminder(false);
        }
      } catch {
        /* ignore — avoid nagging when API is unavailable */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  useEffect(() => {
    if (!showFacePhotoReminder) return;
    const id = window.setTimeout(() => {
      dismissFacePhotoReminder();
    }, 14000);
    return () => window.clearTimeout(id);
  }, [showFacePhotoReminder, dismissFacePhotoReminder]);

  useEffect(() => {
    let mounted = true;

    const refreshUnreadCount = async () => {
      try {
        const [list, result] = await Promise.all([
          NotificationService.getAll({ limit: 8 }),
          NotificationService.getUnreadCount(),
        ]);
        if (mounted) {
          setHeaderNotifications(list);
          setHeaderUnreadCount(Number(result?.count ?? 0));
        }
      } catch {
        if (mounted) {
          setHeaderNotifications([]);
          setHeaderUnreadCount(0);
        }
      }
    };

    void refreshUnreadCount();
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useNotificationRealtime({
    onNewNotification: (notification) => {
      setHeaderNotifications((prev) => {
        const next = [notification, ...prev.filter((item) => item.id !== notification.id)];
        return next.slice(0, 8);
      });
      if (notification.isRead !== 1 && !notification.read) {
        setHeaderUnreadCount((prev) => prev + 1);
      }
      setNotificationRefreshSignal((prev) => prev + 1);
    },
    onUnreadCountUpdate: (count) => setHeaderUnreadCount(count),
  });

  // Determine active tab and course ID from location
  const pathSegments = location.pathname.split('/').filter(Boolean);
  // pathSegments will be like: ['studentdashboard', 'attendance'] or ['studentdashboard', 'myclass', '123']
  const activeTab = pathSegments[1] || 'dashboard';
  const routeParamId = pathSegments[2] || null;
  const isCourseRoute = activeTab === 'myclass' && Boolean(routeParamId);
  const isCourseFullscreen = activeTab === 'myclass' && Boolean(viewingCourseId);
  const isPublicProfileView = activeTab === 'profile' && Boolean(routeParamId);

  // Sync viewingCourseId with URL
  useEffect(() => {
    if (isCourseRoute && routeParamId) {
      setViewingCourseId(routeParamId);
      setDesktopSidebarExpanded(false);
    } else {
      setViewingCourseId(null);
      setDesktopSidebarExpanded(false);
    }
  }, [isCourseRoute, routeParamId]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'groupOverview' },
    { id: 'myclass', label: 'My Class', icon: BookOpen, group: 'groupCourses' },
    { id: 'registration', label: 'Registration', icon: GraduationCap, group: 'groupCourses' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, group: 'groupCourses' },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, group: 'groupAcademic' },
    { id: 'labs', label: 'Lab Sessions', icon: Beaker, group: 'groupAcademic' },
    { id: 'grades', label: 'Grades', icon: FileText, group: 'groupAcademic' },
    { id: 'attendance', label: 'Attendance', icon: BarChart3, group: 'groupAcademic' },
    { id: 'quizzes', label: 'Quiz Center', icon: ClipboardCheck, group: 'groupAcademic' },
    { id: 'todo', label: 'Todo List', icon: ListChecks, group: 'groupTools' },
    { id: 'ai', label: 'AI Features', icon: Sparkles, group: 'groupTools' },
    { id: 'gamification', label: 'Achievements', icon: Trophy, group: 'groupTools' },
    { id: 'community', label: 'Community', icon: Users, group: 'groupCommunication' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, group: 'groupCommunication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, group: 'groupCommunication' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, group: 'groupCommunication' },
    { id: 'payments', label: 'Payments', icon: CreditCard, group: 'groupAccount' },
    { id: 'settings', label: 'Settings', icon: Settings, group: 'groupAccount' },
    { id: 'profile', label: 'Profile', icon: User, group: 'groupAccount' },
  ];

  const localizedTabs = tabs.map((tab) => ({
    ...tab,
    label: t(tabTranslationKeys[tab.id] || tab.id) || tab.label,
    group: t(tab.group) || tab.group,
  }));

  const localizedGroupOrder = [
    'groupOverview',
    'groupCourses',
    'groupAcademic',
    'groupTools',
    'groupCommunication',
    'groupAccount',
  ].map((groupKey) => t(groupKey) || groupKey);

  // Disable browser's native scroll restoration
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  // Scroll to top — targets every possible scroll container
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    const root = document.getElementById('root');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });

    // Also target the main content area which might have its own scroll
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll on tab change
  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  // Handle tab navigation - clear course view when navigating to other tabs
  const handleTabChange = (tabId: string) => {
    setViewingCourseId(null); // Clear course view
    setDesktopSidebarExpanded(false);
    navigate(`/studentdashboard/${tabId}`);
    // Scroll after a tick so the new content has rendered
    requestAnimationFrame(() => scrollToTop());
  };

  // Handle course view
  const handleViewCourse = (courseId: string) => {
    navigate(`/studentdashboard/myclass/${courseId}`);
    setViewingCourseId(courseId);
  };

  // Handle back from course view
  const handleBackFromCourse = () => {
    navigate(`/studentdashboard/myclass`);
    setViewingCourseId(null);
    setDesktopSidebarExpanded(false);
  };

  const headerTranslations = {
    search: t('search') || 'Search...',
    language: t('language'),
    english: t('english'),
    arabic: t('arabic'),
    darkMode: t('darkMode'),
    lightMode: t('lightMode'),
    viewProfile: t('viewProfile'),
    logout: t('logout'),
  };

  // Dummy course data for ClassTab, including instructor images
  const courses: any[] = [];

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={
        {
          fontFamily: "'Montserrat', sans-serif",
          '--accent-color': primaryHex || '#3b82f6',
        } as React.CSSProperties
      }
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={localizedTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={localizedGroupOrder}
        compactMode={isCourseFullscreen}
        desktopExpanded={desktopSidebarExpanded}
        onToggleDesktopExpanded={() => setDesktopSidebarExpanded((prev) => !prev)}
      />

      {/* Main Content */}
      <main
        className={`flex-1 w-full transition-all duration-300 overflow-x-hidden ${
          isCourseFullscreen ? (isRTL ? 'lg:mr-20' : 'lg:ml-20') : isRTL ? 'lg:mr-72' : 'lg:ml-72'
        } ${activeTab === 'chat' ? 'p-0' : isCourseFullscreen ? 'p-0' : 'p-4 lg:p-10'}`}
      >
        {/* Header - hide on chat for full-screen experience */}
        {activeTab !== 'chat' && !isCourseFullscreen && (
          <>
            <DashboardHeader
              userName={user?.fullName || 'No Name'}
              userRole={user?.roles?.[0] || 'No Role'}
              isDark={isDark}
              isRTL={isRTL}
              accentColor={primaryHex || '#3b82f6'}
              avatarGradient="from-[#3b82f6] to-[#06b6d4]"
              language={language}
              onToggleTheme={toggleTheme}
              onSetLanguage={setLanguage}
              onProfileClick={() => handleTabChange('profile')}
              translations={headerTranslations}
              onMenuClick={() => setSidebarOpen(true)}
              searchRole="student"
              primaryColor={primaryColor}
              onSetPrimaryColor={setPrimaryColor}
              availableColors={[
                { id: 'blue', colorClass: 'bg-blue-500', hex: '#3b82f6' },
                { id: 'emerald', colorClass: 'bg-emerald-500', hex: '#10b981' },
                { id: 'rose', colorClass: 'bg-blue-500', hex: '#f43f5e' },
                { id: 'amber', colorClass: 'bg-amber-500', hex: '#f59e0b' },
              ]}
              notifications={headerNotifications.map(toHeaderNotification)}
              notificationCount={headerUnreadCount}
            />
          </>
        )}

        {/* Content Area */}
        <div
          key={activeTab}
          className={activeTab === 'chat' ? 'h-screen overflow-hidden p-0' : 'flex-1'}
          style={{ animation: 'tabFadeIn 0.18s ease-out' }}
        >
          <style>{`@keyframes tabFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {viewingCourseId ? (
            <CourseViewPage courseId={viewingCourseId} onBack={handleBackFromCourse} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <StatsCard
                      label="Credits Completed"
                      value={String(totalCredits)}
                      maxValue="144"
                      comparison={`${totalCredits} Credits Enrolled`}
                      isPositive={true}
                      icon={<BookOpen size={24} />}
                    />
                    <StatsCard
                      label="Grade Point Average"
                      value={gpaValue.toFixed(2)}
                      maxValue="4.00"
                      comparison={`Semester: ${(gpaSummary?.semesterGpa ?? 0).toFixed(2)}`}
                      isPositive={gpaValue >= 3.0}
                      icon={<Trophy size={24} />}
                    />
                    <StatsCard
                      label="Active Class"
                      value={String(activeClasses)}
                      maxValue="18"
                      comparison="Active Course This Semester"
                      isPositive={true}
                      icon={<GraduationCap size={24} />}
                    />
                  </div>

                  {/* Charts, AI Card & Schedule — 12-col grid */}
                  <div className="grid grid-cols-12 gap-8">
                    {/* Left column: GPA + AI Insight */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      <GpaChart data={GPA_DATA} />
                    </div>

                    {/* Right column: Schedule */}
                    <div className="col-span-12 lg:col-span-4">
                      <TodayClassesWidget />
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="mt-10">
                    <PaymentHistory />
                  </div>
                </>
              )}

              {activeTab === 'myclass' && <ClassTab onViewCourse={handleViewCourse} />}
              {activeTab === 'registration' && <CourseRegistration />}
              {activeTab === 'community' && <CourseCommunity />}
              {activeTab === 'schedule' && <ClassSchedule />}
              {activeTab === 'assignments' && <Assignments />}
              {activeTab === 'labs' && <LabInstructions />}
              {activeTab === 'calendar' && <AcademicCalendar />}
              {activeTab === 'ai' && <AIFeatures />}
              {activeTab === 'quizzes' && <QuizzesTab />}
              {activeTab === 'grades' && <GradesTranscript />}
              {activeTab === 'attendance' && <AttendanceOverview />}
              {activeTab === 'todo' && <SmartTodoReminder />}
              { activeTab === 'gamification' && <Gamification /> }
              { activeTab === 'announcements' && <Announcements /> }
              { activeTab === 'notifications' && (
                <NotificationCenter
                  refreshSignal={notificationRefreshSignal}
                  externalUnreadCount={headerUnreadCount}
                />
              )}
              {activeTab === 'payments' && <PaymentHistory />}
              {activeTab === 'chat' && (
                <MessagingChat
                  height="100vh"
                  currentUserId={user?.userId ? String(user.userId) : undefined}
                  currentUserName={user?.fullName || 'Student'}
                  onOpenSidebar={() => setSidebarOpen(true)}
                  isDark={isDark}
                  className="rounded-none border-0"
                  accentColor={primaryHex || '#3b82f6'}
                />
              )}
              {activeTab === 'settings' && <SettingsPreferences />}
              {isPublicProfileView && <PublicProfileView />}
              {activeTab === 'profile' && !isPublicProfileView && (
                <DashboardProfileTab
                  isDark={isDark}
                  accentColor={primaryHex || '#3b82f6'}
                  bannerGradient="from-[#3b82f6] to-[#06b6d4]"
                  profileData={{
                    fullName: user?.fullName || 'No Name',
                    role: user?.roles?.[0] || 'No Role',
                    department: '',
                    email: user?.email || '',
                    phone: '',
                    address: '',
                    dateOfBirth: '',
                    bio: '',
                    gpa: '0.00',
                    totalCredits: '0',
                    maxCredits: '144',
                    rank: '-',
                    rankTotal: '-',
                    enrollmentDate: '',
                    expectedGraduation: '',
                    studentId: '',
                    interests: [],
                    skills: [],
                    badges: [],
                    achievements: [],
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {showFacePhotoReminder && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 z-[100] w-[min(calc(100vw-2rem),28rem)] border shadow-2xl backdrop-blur-md rounded-2xl p-4 flex gap-3 ${
            isDark
              ? 'bg-slate-900/95 border-slate-600/90 text-slate-100'
              : 'bg-white/95 border-slate-200/90 text-slate-800'
          } ${isRTL ? 'right-4' : 'left-4'}`}
        >
          <div
            className="rounded-xl p-2.5 h-fit shrink-0"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Camera className="size-6" style={{ color: accentColor }} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-semibold text-sm leading-snug">{t('facePhotoReminderTitle')}</p>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('facePhotoReminderBody')}
            </p>
            <div className={`mt-3 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                className="text-xs font-semibold rounded-lg px-3 py-2 text-white hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                  dismissFacePhotoReminder();
                  handleTabChange('attendance');
                }}
              >
                {t('facePhotoReminderGoToAttendance')}
              </button>
              <button
                type="button"
                className={`text-xs font-medium rounded-lg px-3 py-2 border ${
                  isDark
                    ? 'border-slate-500 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={dismissFacePhotoReminder}
              >
                {t('facePhotoReminderDismiss')}
              </button>
            </div>
          </div>
          <button
            type="button"
            className={`shrink-0 rounded-lg p-1.5 h-fit -m-1 ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label={t('facePhotoReminderDismiss')}
            onClick={dismissFacePhotoReminder}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Wrap with LanguageProvider and ThemeProvider
export default function StudentDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StudentDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
