import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  MessageSquare,
  MessageCircle,
  User,
  Menu,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import {
  DashboardOverview,
  CourseManagementPage,
  AcademicCalendarPage,
  CommunicationPage,
  EnrollmentPeriodPage,
  PrerequisitesManagementPage,
} from './components';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  DASHBOARD_STATS,
  USERS,
  COURSES,
  CALENDAR_EVENTS,
  ANALYTICS,
  NOTIFICATION_TEMPLATES,
  RECENT_ACTIVITY,
  ADMIN_DEPARTMENT,
  ENROLLMENT_PERIODS,
} from './constants';
import { StudentManagementPage } from './components/StudentManagementPage';

type TabKey =
  | 'dashboard'
  | 'students'
  | 'courses'
  | 'periods'
  | 'calendar'
  | 'communication'
  | 'chat'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutGrid },
  { key: 'students', label: 'Student Management', labelAr: 'إدارة الطلاب', icon: GraduationCap },
  { key: 'courses', label: 'Course Management', labelAr: 'إدارة المقررات', icon: BookOpen },
  { key: 'periods', label: 'Periods & Scheduling', labelAr: 'الفترات والجدولة', icon: ClipboardList },
  { key: 'calendar', label: 'Academic Calendar', labelAr: 'التقويم الأكاديمي', icon: Calendar },
  { key: 'communication', label: 'Communication', labelAr: 'التواصل', icon: MessageSquare },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User },
];

function AdminDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL, t } = useLanguage();

  // State for data management
  const [coursesData, setCoursesData] = useState(COURSES);
  const [calendarEvents, setCalendarEvents] = useState(CALENDAR_EVENTS);
  const [templates, setTemplates] = useState(NOTIFICATION_TEMPLATES);
  const [enrollmentPeriodsData, setEnrollmentPeriodsData] = useState(ENROLLMENT_PERIODS);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    navigate(`/admindashboard/${key}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map(tab => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label
  }));

  // Course management handlers
  const handleAddCourse = (course: any) => {
    const newCourse = {
      id: Math.max(...coursesData.map(c => c.id)) + 1,
      ...course,
      enrolled: 0,
      status: 'active',
    };
    setCoursesData([...coursesData, newCourse]);
  };

  const handleEditCourse = (id: number, course: any) => {
    setCoursesData(coursesData.map(c => c.id === id ? { ...c, ...course } : c));
  };

  const handleDeleteCourse = (id: number) => {
    setCoursesData(coursesData.filter(c => c.id !== id));
  };

  // Calendar event handlers
  const handleAddEvent = (event: any) => {
    const newEvent = {
      id: Math.max(...calendarEvents.map(e => e.id)) + 1,
      ...event,
      color: getEventColor(event.type),
    };
    setCalendarEvents([...calendarEvents, newEvent]);
  };

  const handleEditEvent = (id: number, event: any) => {
    setCalendarEvents(calendarEvents.map(e => e.id === id ? { ...e, ...event } : e));
  };

  const handleDeleteEvent = (id: number) => {
    setCalendarEvents(calendarEvents.filter(e => e.id !== id));
  };

  // Enrollment period handlers
  const handleAddEnrollmentPeriod = (period: any) => {
    const newPeriod = {
      id: Math.max(0, ...enrollmentPeriodsData.map(p => p.id)) + 1,
      ...period,
    };
    setEnrollmentPeriodsData([...enrollmentPeriodsData, newPeriod]);
  };

  const handleEditEnrollmentPeriod = (id: number, period: any) => {
    setEnrollmentPeriodsData(enrollmentPeriodsData.map(p => p.id === id ? { ...p, ...period } : p));
  };

  const handleDeleteEnrollmentPeriod = (id: number) => {
    setEnrollmentPeriodsData(enrollmentPeriodsData.filter(p => p.id !== id));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'semesterStart': return '#10b981';
      case 'semesterEnd': return '#6366f1';
      case 'registration': return '#3b82f6';
      case 'holiday': return '#ef4444';
      case 'examPeriod': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Template handlers
  const handleCreateTemplate = (template: any) => {
    const newTemplate = {
      id: Math.max(...templates.map(t => t.id)) + 1,
      ...template,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (id: number, template: any) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...template } : t));
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSendBroadcast = (message: any) => {
    console.log('Sending broadcast:', message);
    alert('Broadcast sent successfully!');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <DashboardSidebar
        tabs={translatedTabs.map(tab => ({ id: tab.key, label: tab.label, icon: tab.icon }))}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={handleLogout}
        isDark={isDark}
        isRTL={isRTL}
        accentColor="#E11D48"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
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
          userName="Department Head"
          userRole="Admin"
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#E11D48"
          avatarGradient="from-rose-500 to-orange-500"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          searchRole="admin"
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
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={DASHBOARD_STATS}
              analytics={ANALYTICS}
              recentActivity={RECENT_ACTIVITY}
              onNavigate={(tab) => handleTabChange(tab as TabKey)}
            />
          )}

          {/* Student Management */}
          {activeTab === 'students' && <StudentManagementPage />}

          {/* Course Management */}
          {activeTab === 'courses' && (
            <CourseManagementPage
              courses={coursesData}
              users={USERS}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddCourse={handleAddCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}

          {/* Periods & Scheduling */}
          {activeTab === 'periods' && (
            <EnrollmentPeriodPage
              enrollmentPeriods={enrollmentPeriodsData}
              courses={coursesData}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddPeriod={handleAddEnrollmentPeriod}
              onEditPeriod={handleEditEnrollmentPeriod}
              onDeletePeriod={handleDeleteEnrollmentPeriod}
            />
          )}

          {/* Academic Calendar */}
          {activeTab === 'calendar' && (
            <AcademicCalendarPage
              events={calendarEvents}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {/* Communication */}
          {activeTab === 'communication' && (
            <CommunicationPage
              templates={templates}
              onCreateTemplate={handleCreateTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onSendBroadcast={handleSendBroadcast}
            />
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <MessagingChat
              height="calc(100vh - 160px)"
              currentUserName="Administrator"
              showVideoCall={true}
              showVoiceCall={true}
              isDark={isDark}
            />
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor="#E11D48"
              bannerGradient="from-rose-500 to-orange-500"
              profileData={{
                fullName: 'Dr. Ahmad Khalil',
                role: 'Department Head',
                department: ADMIN_DEPARTMENT,
                email: 'a.khalil@university.edu',
                phone: '+1 (555) 100-0001',
                address: 'Faculty Building, Office 312',
                dateOfBirth: '1975-03-20',
                bio: 'Department Head for Computer Science and Engineering. Responsible for managing department courses, faculty assignments, student enrollment, and academic scheduling.',
                specialization: ['Academic Administration', 'Course Management', 'Student Affairs', 'Faculty Coordination', 'Enrollment Management'],
              }}
            />
          )}
      </main>
    </div>
  );
}

// Main component wrapped with providers
function AdminDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default AdminDashboard;
