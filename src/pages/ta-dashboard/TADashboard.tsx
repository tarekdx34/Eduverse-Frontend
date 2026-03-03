import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Menu,
  BarChart3,
  Bell,
  Brain,
  FolderOpen,
  HelpCircle,
} from 'lucide-react';
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
} from './components';
import { QuizzesPage } from './components/QuizzesPage';
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

type TabKey =
  | 'dashboard'
  | 'courses'
  | 'labs'
  | 'quizzes'
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

const TABS: { key: TabKey; label: string; icon: any; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'Overview' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Overview' },
  { key: 'courses', label: 'Courses', icon: BookOpen, group: 'Teaching' },
  { key: 'labs', label: 'Labs', icon: Beaker, group: 'Teaching' },
  { key: 'quizzes', label: 'Quizzes', icon: HelpCircle, group: 'Teaching' },
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

function TADashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, isRTL, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // Get all submissions from all labs
  const allSubmissions = Object.values(SUBMISSIONS).flat();

  // Map tabs for translation
  const translatedTabs = TABS.map((tab) => ({
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

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} p-4 lg:p-10`}>
        <DashboardHeader
          userName="Ahmed Hassan"
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

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && <QuizzesPage />}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <GradingPage submissions={allSubmissions} onGrade={handleGrade} />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentPerformancePage
            students={STUDENT_PERFORMANCE}
            readOnly
            assignedCourseNames={ASSIGNED_COURSES.map((course) => course.name)}
          />
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && <SchedulePage />}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && <AnnouncementsPage />}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && <DiscussionPage userRole="ta" userName="Ahmed Hassan" />}

        {/* Communication Tab — Removed (merged into Announcements) */}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="calc(100vh - 160px)"
            currentUserName="Ahmed Hassan"
            showVideoCall={true}
            showVoiceCall={true}
            isDark={isDark}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor="#2563EB"
            bannerGradient="from-blue-500 to-blue-500"
            profileData={{
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
            }}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsPage />}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && <NotificationsPage />}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && <AIAssistantPage />}

        {/* Lab Resources Tab */}
        {activeTab === 'lab-resources' && <LabResourcesPage />}
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
