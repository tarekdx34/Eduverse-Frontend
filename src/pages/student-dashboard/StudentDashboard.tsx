import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  PieChart,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  Header,
  StatsCard,
  GpaChart,
  DailySchedule,
  PaymentHistory,
  ClassTab,
  ClassSchedule,
  GradesTranscript,
  Assignments,
  AcademicCalendar,
  AIFeatures,
  MessagingChat,
  AttendanceOverview,
  SmartTodoReminder,
  CourseRegistration,
  Gamification,
  NotificationCenter,
  CourseCommunity,
  LabInstructions,
  ProgressAnalytics,
  GlobalSearch,
  SettingsPreferences,
  DashboardOverview,
} from './components';
import CourseViewPage from './pages/CourseView';
import { GPA_DATA, SCHEDULE_DATA } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Route component for each tab view
function DashboardContent({ activeTab, viewingCourseId, setViewingCourseId }: any) {
  console.log('DashboardContent rendered with activeTab:', activeTab); // Debug

  return (
    <>
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && !viewingCourseId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard
              label="Credits Completed"
              value="120"
              maxValue="144"
              comparison="+24 Credits"
              isPositive={true}
            />
            <StatsCard
              label="Grade Point Average"
              value="3.75"
              maxValue="4.00"
              comparison="-0.25 Points"
              isPositive={false}
            />
            <StatsCard
              label="Active Class"
              value="15"
              maxValue="18"
              comparison="Active Course This Semester"
              isPositive={true}
            />
          </div>

          {/* Charts and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GpaChart data={GPA_DATA} />
            <DailySchedule schedules={SCHEDULE_DATA} />
          </div>

          {/* Payment History */}
          <PaymentHistory />
        </>
      )}

      {/* My Class Tab or Course View */}
      {viewingCourseId ? (
        <CourseViewPage courseId={viewingCourseId} onBack={() => setViewingCourseId(null)} />
      ) : (
        <>
          {activeTab === 'myclass' && (
            <ClassTab onViewCourse={(courseId) => setViewingCourseId(courseId)} />
          )}
        </>
      )}

      {/* Schedule Tab */}
      {!viewingCourseId && activeTab === 'schedule' && <WeeklySchedule />}

      {/* Assignments Tab */}
      {!viewingCourseId && activeTab === 'assignments' && <Assignments />}

      {/* Calendar Tab */}
      {!viewingCourseId && activeTab === 'calendar' && <AcademicCalendar />}

      {/* AI Features Tab */}
      {!viewingCourseId && activeTab === 'ai' && <AIFeatures />}

      {/* Grades & Transcript Tab */}
      {!viewingCourseId && activeTab === 'grades' && <GradesTranscript />}

      {/* Payments Tab */}
      {!viewingCourseId && activeTab === 'payments' && <PaymentHistory />}

      {/* Chat Tab */}
      {!viewingCourseId && activeTab === 'chat' && <MessagingChat />}

      {/* Attendance Tab */}
      {!viewingCourseId && activeTab === 'attendance' && (
        <div>
          <AttendanceOverview />
        </div>
      )}

      {/* Todo Reminder Tab */}
      {!viewingCourseId && activeTab === 'todo' && (
        <div>
          <SmartTodoReminder />
        </div>
      )}
    </>
  );
}

function StudentDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);

  // Determine active tab and course ID from location
  const pathSegments = location.pathname.split('/').filter(Boolean);
  // pathSegments will be like: ['studentdashboard', 'attendance'] or ['studentdashboard', 'myclass', '123']
  const activeTab = pathSegments[1] || 'dashboard';
  const courseIdFromUrl = pathSegments[2] || null;

  // Sync viewingCourseId with URL
  useEffect(() => {
    if (courseIdFromUrl) {
      setViewingCourseId(courseIdFromUrl);
    } else {
      setViewingCourseId(null);
    }
  }, [courseIdFromUrl]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'myclass', label: 'My Class', icon: BookOpen },
    { id: 'registration', label: 'Registration', icon: GraduationCap },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare },
    { id: 'labs', label: 'Lab Sessions', icon: Beaker },
    { id: 'grades', label: 'Grades', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'todo', label: 'Todo List', icon: ListChecks },
    { id: 'ai', label: 'AI Features', icon: Sparkles },
    { id: 'gamification', label: 'Achievements', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Handle tab navigation - clear course view when navigating to other tabs
  const handleTabChange = (tabId: string) => {
    setViewingCourseId(null); // Clear course view
    navigate(`/studentdashboard/${tabId}`);
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
  };

  const { isRTL } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar - Collapsible Drawer */}
      <div
        className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}
      >
        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={() => navigate('/login')}
        />
      </div>

      {/* Main Content - Takes remaining space */}
      <div
        className={`flex flex-col transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-56' : 'ml-56') + ' flex-1' : (isRTL ? 'mr-0' : 'ml-0') + ' w-full'}`}
      >
        {/* Header */}
        <div className={`border-b flex items-center justify-between display-absolute ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-4 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg
                  className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1"></div>
          <Header userName="Tarek Mohamed" />
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto p-6 pt-18 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {viewingCourseId ? (
            <CourseViewPage courseId={viewingCourseId} onBack={handleBackFromCourse} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  onNavigate={handleTabChange}
                  onViewCourse={handleViewCourse}
                />
              )}

              {activeTab === 'myclass' && <ClassTab onViewCourse={handleViewCourse} />}
              {activeTab === 'registration' && <CourseRegistration />}
              {activeTab === 'community' && <CourseCommunity />}
              {activeTab === 'schedule' && <ClassSchedule />}
              {activeTab === 'assignments' && <Assignments />}
              {activeTab === 'labs' && <LabInstructions />}
              {activeTab === 'calendar' && <AcademicCalendar />}
              {activeTab === 'ai' && <AIFeatures />}
              {activeTab === 'grades' && <GradesTranscript />}
              {activeTab === 'attendance' && <AttendanceOverview />}
              {activeTab === 'analytics' && <ProgressAnalytics />}
              {activeTab === 'todo' && <SmartTodoReminder />}
              {activeTab === 'gamification' && <Gamification />}
              {activeTab === 'notifications' && <NotificationCenter />}
              {activeTab === 'payments' && <PaymentHistory />}
              {activeTab === 'chat' && <MessagingChat />}
              {activeTab === 'settings' && <SettingsPreferences />}
            </>
          )}
        </div>
      </div>
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
