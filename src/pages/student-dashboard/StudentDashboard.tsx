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
} from './components';
import CourseViewPage from './pages/CourseView';
import { GPA_DATA, SCHEDULE_DATA } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';


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
      className={`flex min-h-screen gradient-bg ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
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

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : ''} p-6 lg:p-10`}
      >
        {/* Mobile sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-6 left-6 z-40 glass p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-700 transition-all lg:hidden"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Header is now inline */}
        <Header userName="Tarek Mohamed" />

        {/* Content Area */}
        <div className="flex-1">
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

                  {/* Charts, AI Card & Schedule — 12-col grid */}
                  <div className="grid grid-cols-12 gap-8">
                    {/* Left column: GPA + AI Insight */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      <GpaChart data={GPA_DATA} />

                      {/* AI Academic Insight Card */}
                      <div className="bg-gradient-to-br from-[#7C3AED] to-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-rounded">auto_awesome</span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">AI Academic Insight</span>
                          </div>
                          <h4 className="text-xl font-bold mb-2 text-white">Boost your grade in Advanced Networking</h4>
                          <p className="text-white/80 text-sm max-w-md mb-0">Based on your recent quiz results, we suggest focusing on 'Protocol Architecture'. Students who reviewed this topic improved their final grade by 12%.</p>
                          <button className="mt-6 bg-white text-[#7C3AED] px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                            Explore Study Guide
                          </button>
                        </div>
                        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                          <span className="material-symbols-rounded text-8xl">psychology</span>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Schedule */}
                    <div className="col-span-12 lg:col-span-4">
                      <DailySchedule schedules={SCHEDULE_DATA} />
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
      </main>
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
