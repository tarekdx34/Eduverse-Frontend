import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Beaker,
  FileText,
  Users,
  MessageCircle,
  ClipboardCheck,
  Calendar,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  User,
  Menu,
} from 'lucide-react';
import {
  ModernDashboard,
  CoursesPage,
  LabsPage,
  GradingPage,
  StudentPerformancePage,
  CommunicationPage,
  AttendancePage,
  SchedulePage,
  AnnouncementsPage,
  DiscussionPage,
} from './components';
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

type TabKey = 'dashboard' | 'courses' | 'labs' | 'grading' | 'students' | 'attendance' | 'schedule' | 'announcements' | 'discussion' | 'communication' | 'chat' | 'profile';

const TABS: { key: TabKey; label: string; icon: any; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'Overview' },
  { key: 'courses', label: 'Courses', icon: BookOpen, group: 'Teaching' },
  { key: 'labs', label: 'Labs', icon: Beaker, group: 'Teaching' },
  { key: 'grading', label: 'Grading', icon: FileText, group: 'Teaching' },
  { key: 'students', label: 'Students', icon: Users, group: 'Students' },
  { key: 'attendance', label: 'Attendance', icon: ClipboardCheck, group: 'Students' },
  { key: 'schedule', label: 'Schedule', icon: Calendar, group: 'Schedule' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, group: 'Schedule' },
  { key: 'discussion', label: 'Discussion', icon: MessagesSquare, group: 'Communication' },
  { key: 'communication', label: 'Communication', icon: MessageCircle, group: 'Communication' },
  { key: 'chat', label: 'Chat', icon: MessageSquare, group: 'Communication' },
  { key: 'profile', label: 'Profile', icon: User, group: 'Account' },
];

function TADashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const { isDark, toggleTheme } = useTheme();
  const { language, isRTL, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // Get all submissions from all labs
  const allSubmissions = Object.values(SUBMISSIONS).flat();

  // Mock messages and questions for communication
  const mockMessages = [
    {
      id: 'msg1',
      from: 'Dr. Jane Smith',
      subject: 'Lab 1 Grading Reminder',
      message: 'Please complete grading for Lab 1 by end of week.',
      timestamp: '2025-02-20T10:00:00',
      read: false,
    },
    {
      id: 'msg2',
      from: 'Mohamed Ali',
      subject: 'Question about Lab 2',
      message: 'I have a question about exercise 3 in Lab 2.',
      timestamp: '2025-02-21T14:30:00',
      read: false,
    },
  ];

  const mockQuestions = [
    {
      id: 'q1',
      studentName: 'Fatima Ahmed',
      course: 'CS101',
      lab: 'Lab 1',
      question: 'How do I submit multiple files for the lab assignment?',
      timestamp: '2025-02-20T10:30:00',
      status: 'new' as const,
    },
    {
      id: 'q2',
      studentName: 'Omar Hassan',
      course: 'CS202',
      lab: 'Lab 1',
      question: 'Can you explain the linked list implementation?',
      timestamp: '2025-02-19T15:20:00',
      status: 'answered' as const,
      answer: 'A linked list is a data structure where each element points to the next...',
    },
  ];

  // Map tabs for translation
  const translatedTabs = TABS.map(tab => ({
    id: tab.key,
    label: t(tab.key) || tab.label,
    icon: tab.icon,
    group: tab.group,
  }));

  // Sync active tab with URL
  useEffect(() => {
    const tabFromUrl = params.tab as TabKey;
    if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [params.tab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate(`/tadashboard/${tab}`);
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    handleTabChange('labs');
  };

  const handleViewLab = (labId: string) => {
    setSelectedLabId(labId);
  };

  const handleGrade = (submissionId: string) => {
    handleTabChange('grading');
  };

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={translatedTabs}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor="#2563EB"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Teaching', 'Students', 'Schedule', 'Communication', 'Account']}
      />

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-4 lg:p-10`}>
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`lg:hidden mb-4 p-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'}`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <DashboardHeader
          userName="Ahmed Hassan"
          userRole="Teaching Assistant"
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#2563EB"
          avatarGradient="from-blue-500 to-cyan-500"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          onProfileClick={() => handleTabChange('profile')}
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <ModernDashboard
            stats={DASHBOARD_STATS}
            courses={ASSIGNED_COURSES}
            upcomingLabs={UPCOMING_LABS}
            recentActivity={RECENT_ACTIVITY}
            onNavigate={handleTabChange}
          />
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <CoursesPage courses={ASSIGNED_COURSES} onViewCourse={handleViewCourse} />
        )}

        {/* Labs Tab */}
        {activeTab === 'labs' && (
          <LabsPage
            labs={selectedCourseId ? LABS.filter((l) => l.courseId === selectedCourseId) : LABS}
            onViewLab={handleViewLab}
          />
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <GradingPage submissions={allSubmissions} onGrade={handleGrade} />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentPerformancePage students={STUDENT_PERFORMANCE} />
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && <AttendancePage />}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && <SchedulePage />}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && <AnnouncementsPage />}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && <DiscussionPage userRole="ta" userName="Ahmed Hassan" />}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <CommunicationPage messages={mockMessages} questions={mockQuestions} />
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="calc(100vh - 160px)"
            currentUserName="Ahmed Hassan"
            showVideoCall={true}
            showVoiceCall={true}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor="#2563EB"
            bannerGradient="from-blue-500 to-cyan-500"
            profileData={{
              fullName: 'Ahmed Hassan',
              role: 'Teaching Assistant',
              department: 'Computer Science',
              email: 'ahmed.hassan@university.edu',
              phone: '+20 100 234 5678',
              address: 'Cairo, Egypt',
              dateOfBirth: '1998-11-10',
              bio: 'Graduate teaching assistant pursuing M.Sc. in Computer Science. Assisting in programming and data structures courses while conducting research in distributed systems.',
              interests: ['Distributed Systems', 'Cloud Computing', 'Data Structures', 'Algorithms', 'Teaching Pedagogy'],
              skills: ['Java', 'Python', 'C++', 'Docker', 'Kubernetes', 'Linux'],
            }}
          />
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
