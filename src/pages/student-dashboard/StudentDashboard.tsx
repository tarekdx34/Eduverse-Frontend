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

  const { isRTL, language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6'; // Defined here as per instruction

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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'Overview' },
    { id: 'myclass', label: 'My Class', icon: BookOpen, group: 'Courses' },
    { id: 'registration', label: 'Registration', icon: GraduationCap, group: 'Courses' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, group: 'Courses' },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, group: 'Academic' },
    { id: 'labs', label: 'Lab Sessions', icon: Beaker, group: 'Academic' },
    { id: 'grades', label: 'Grades', icon: FileText, group: 'Academic' },
    { id: 'attendance', label: 'Attendance', icon: BarChart3, group: 'Academic' },
    { id: 'quizzes', label: 'Quiz Center', icon: ClipboardCheck, group: 'Academic' },
    { id: 'todo', label: 'Todo List', icon: ListChecks, group: 'Tools' },
    { id: 'ai', label: 'AI Features', icon: Sparkles, group: 'Tools' },
    { id: 'gamification', label: 'Achievements', icon: Trophy, group: 'Tools' },
    { id: 'community', label: 'Community', icon: Users, group: 'Communication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Communication' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, group: 'Communication' },
    { id: 'payments', label: 'Payments', icon: CreditCard, group: 'Account' },
    { id: 'settings', label: 'Settings', icon: Settings, group: 'Account' },
    { id: 'profile', label: 'Profile', icon: User, group: 'Account' },
  ];

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
  const courses = [
    {
      id: '1',
      title: 'Introduction to Programming',
      code: 'CS101',
      instructor: 'Dr. Michael Smith',
      instructorImage: 'https://i.pravatar.cc/150?u=michael',
      progress: 75,
      grade: 'A-',
      status: 'In Progress',
      nextSession: 'Mon, Oct 26, 10:00 AM',
      description: 'Fundamentals of programming using Python.',
    },
    {
      id: '2',
      title: 'Data Structures and Algorithms',
      code: 'CS201',
      instructor: 'Prof. Lisa Jones',
      instructorImage: 'https://i.pravatar.cc/150?u=lisa',
      progress: 90,
      grade: 'A',
      status: 'Completed',
      nextSession: 'Tue, Oct 27, 1:00 PM',
      description: 'Advanced data structures and algorithm design.',
    },
    {
      id: '3',
      title: 'Database Management Systems',
      code: 'CS305',
      instructor: 'Dr. Robert Brown',
      instructorImage: 'https://i.pravatar.cc/150?u=robert',
      progress: 60,
      grade: 'B+',
      status: 'In Progress',
      nextSession: 'Wed, Oct 28, 11:00 AM',
      description: 'Design and implementation of relational databases.',
    },
    {
      id: '4',
      title: 'Web Development Fundamentals',
      code: 'CS301',
      instructor: 'Prof. Sarah Davis',
      instructorImage: 'https://i.pravatar.cc/150?u=sarah',
      progress: 80,
      grade: 'A-',
      status: 'In Progress',
      nextSession: 'Thu, Oct 29, 2:00 PM',
      description: 'Introduction to front-end and back-end web technologies.',
    },
    {
      id: '5',
      title: 'Artificial Intelligence',
      code: 'CS401',
      instructor: 'Dr. Emily White',
      instructorImage: 'https://i.pravatar.cc/150?u=emily',
      progress: 40,
      grade: 'B',
      status: 'In Progress',
      nextSession: 'Fri, Oct 30, 9:00 AM',
      description: 'Core concepts and applications of artificial intelligence.',
    },
  ];

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
        tabs={tabs.map((tab) => ({
          ...tab,
          label: t(tabTranslationKeys[tab.id] || tab.id) || tab.label,
        }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Courses', 'Academic', 'Tools', 'Communication', 'Account']}
      />

      {/* Main Content */}
      <main
        className={`flex-1 w-full transition-all duration-300 overflow-x-hidden ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}
      >
        {/* Header - hide on chat for full-screen experience */}
        {activeTab !== 'chat' && (
          <>
            <DashboardHeader
              userName="Tarek Mohamed"
              userRole="CS Junior"
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
                      value="120"
                      maxValue="144"
                      comparison="+24 Credits"
                      isPositive={true}
                      icon={<BookOpen size={24} />}
                    />
                    <StatsCard
                      label="Grade Point Average"
                      value="3.75"
                      maxValue="4.00"
                      comparison="-0.25 Points"
                      isPositive={false}
                      icon={<Trophy size={24} />}
                    />
                    <StatsCard
                      label="Active Class"
                      value="15"
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
              {activeTab === 'chat' && (
                <MessagingChat
                  height="100vh"
                  isDark={isDark}
                  className="rounded-none border-0"
                  accentColor={primaryHex || '#3b82f6'}
                />
              )}
              {activeTab === 'settings' && <SettingsPreferences />}
              {activeTab === 'profile' && (
                <DashboardProfileTab
                  isDark={isDark}
                  accentColor={primaryHex || '#3b82f6'}
                  bannerGradient="from-[#3b82f6] to-[#06b6d4]"
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
                        color: accentColor,
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
