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
  Settings,
  User,
  ClipboardCheck,
} from 'lucide-react';
import {
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
  SettingsPreferences,
  QuizTaking,
} from './components';
import { DashboardHeader, DashboardSidebar } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import CourseViewPage from './pages/CourseView';
import { GPA_DATA, SCHEDULE_DATA } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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
  settings: 'settings',
};

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
    { id: 'todo', label: 'Todo List', icon: ListChecks },
    { id: 'ai', label: 'AI Features', icon: Sparkles },
    // Tarek Changes: Added Quiz Center
    { id: 'quizzes', label: 'Quiz Center', icon: ClipboardCheck },
    { id: 'gamification', label: 'Achievements', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
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

  const { isRTL, language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <div
      className={`flex min-h-screen gradient-bg ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={tabs.map((tab) => ({
          ...tab,
          label: t(tabTranslationKeys[tab.id] || tab.id) || tab.label,
        }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor="#7C3AED"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-4 lg:p-10`}
      >
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`lg:hidden mb-4 p-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'}`}
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Header is now inline */}
        <DashboardHeader
          userName="Tarek Mohamed"
          userRole="CS Junior"
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#7C3AED"
          avatarGradient="from-[#7C3AED] to-[#ec4899]"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          onProfileClick={() => handleTabChange('profile')}
          translations={headerTranslations}
        />

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
              {activeTab === 'quizzes' && <QuizTaking />}
              {activeTab === 'grades' && <GradesTranscript />}
              {activeTab === 'attendance' && <AttendanceOverview />}
              {activeTab === 'todo' && <SmartTodoReminder />}
              {activeTab === 'gamification' && <Gamification />}
              {activeTab === 'notifications' && <NotificationCenter />}
              {activeTab === 'payments' && <PaymentHistory />}
              {activeTab === 'chat' && <MessagingChat />}
              {activeTab === 'settings' && <SettingsPreferences />}
              {activeTab === 'profile' && (
                <DashboardProfileTab
                  isDark={isDark}
                  accentColor="#7C3AED"
                  bannerGradient="from-[#7C3AED] to-[#3B82F6]"
                  profileData={{
                    fullName: 'Tarek Mohamed',
                    role: 'CS Junior',
                    department: 'Computer Science',
                    email: 'tarek.mohamed@university.edu',
                    phone: '+20 123 456 7890',
                    address: 'Cairo, Egypt',
                    dateOfBirth: '2002-05-15',
                    bio: 'Passionate computer science student with a keen interest in AI, machine learning, and full-stack web development. Active member of the university coding club and open-source contributor.',
                    gpa: '3.72',
                    totalCredits: '96',
                    maxCredits: '144',
                    rank: '45',
                    rankTotal: '1,200',
                    enrollmentDate: '2021-09-01',
                    expectedGraduation: '2025-06-15',
                    studentId: 'STU-2021-0456',
                    interests: [
                      'Artificial Intelligence',
                      'Web Development',
                      'Data Science',
                      'Cloud Computing',
                      'Cybersecurity',
                    ],
                    skills: ['Python', 'TypeScript', 'React', 'Node.js', 'TensorFlow', 'SQL'],
                    badges: [
                      {
                        name: "Dean's List",
                        description: 'GPA above 3.5',
                        icon: 'school',
                        color: '#7C3AED',
                        unlocked: true,
                      },
                      {
                        name: 'Code Master',
                        description: '100+ commits',
                        icon: 'code',
                        color: '#3B82F6',
                        unlocked: true,
                      },
                      {
                        name: 'Team Player',
                        description: '10 group projects',
                        icon: 'groups',
                        color: '#10B981',
                        unlocked: true,
                      },
                      {
                        name: 'Early Bird',
                        description: '95% attendance',
                        icon: 'schedule',
                        color: '#F59E0B',
                        unlocked: true,
                      },
                      {
                        name: 'Researcher',
                        description: 'Published paper',
                        icon: 'science',
                        color: '#EC4899',
                        unlocked: false,
                      },
                      {
                        name: 'Mentor',
                        description: 'Helped 50 peers',
                        icon: 'volunteer_activism',
                        color: '#6366F1',
                        unlocked: false,
                      },
                    ],
                    achievements: [
                      {
                        title: "Dean's Honor Roll",
                        description: 'Fall 2023 Semester',
                        emoji: '🏆',
                      },
                      {
                        title: 'Hackathon Winner',
                        description: 'University Tech Fest 2023',
                        emoji: '🥇',
                      },
                      {
                        title: 'Best Project Award',
                        description: 'Software Engineering Course',
                        emoji: '⭐',
                      },
                    ],
                  }}
                />
              )}
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
