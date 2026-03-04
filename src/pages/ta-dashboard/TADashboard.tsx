import { useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { courseService } from '../../services/api/courseService';
import { labService } from '../../services/api/labService';
import {
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  UPCOMING_LABS,
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

  const { user } = useAuth();
  const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : 'Teaching Assistant';

  // Fetch courses
  const { data: coursesRaw } = useApi(() => courseService.listCourses(), []);
  const assignedCourses = useMemo(() =>
    (coursesRaw || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      code: c.code,
      instructor: '',
      students: 0,
      labs: 0,
      nextClass: '',
    })),
    [coursesRaw]
  );

  // Fetch labs
  const { data: labsRaw } = useApi(() => labService.listLabs(), []);
  const labs = useMemo(() =>
    (labsRaw || []).map((l: any) => ({
      id: String(l.id),
      courseId: String(l.courseId),
      title: l.title,
      description: l.description || '',
      dueDate: l.dueDate?.split('T')[0] || '',
      status: l.status || 'upcoming',
      totalPoints: l.totalPoints || 100,
      materials: [],
      submissions: 0,
    })),
    [labsRaw]
  );

  // Derive submissions from labs (empty for now - no global submissions endpoint)
  const allSubmissions: any[] = [];

  // Derive student performance (keep empty, no endpoint)
  const studentPerformance: any[] = [];

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
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}>
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName={userName}
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <ModernDashboard
            stats={DASHBOARD_STATS}
            courses={assignedCourses}
            upcomingLabs={UPCOMING_LABS}
            recentActivity={RECENT_ACTIVITY}
            onNavigate={handleTabChange}
          />
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <CoursesPage courses={assignedCourses} onViewCourse={handleViewCourse} />
        )}

        {/* Labs Tab */}
        {activeTab === 'labs' && (
          <LabsPage
            labs={selectedCourseId ? labs.filter((l) => l.courseId === selectedCourseId) : labs}
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
            students={studentPerformance}
            readOnly
            assignedCourseNames={assignedCourses.map((c) => c.name)}
          />
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && <SchedulePage />}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && <AnnouncementsPage />}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && <DiscussionPage userRole="ta" userName={userName} />}

        {/* Communication Tab — Removed (merged into Announcements) */}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="100vh"
            currentUserName={userName}
            showVideoCall={true}
            showVoiceCall={true}
            isDark={isDark}
            accentColor={primaryHex || '#4f46e5'}
            className="rounded-none border-0"
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor="#2563EB"
            bannerGradient="from-blue-500 to-blue-500"
            profileData={{
              fullName: userName,
              role: 'Teaching Assistant',
              department: user?.department || 'Computer Science',
              email: user?.email || '',
              phone: user?.phone || '',
              address: '',
              dateOfBirth: '',
              bio: '',
              interests: [],
              skills: [],
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
