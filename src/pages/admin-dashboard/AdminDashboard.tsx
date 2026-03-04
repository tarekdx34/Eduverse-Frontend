import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
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
import { DashboardHeader, DashboardSidebar, MessagingChat, LoadingSkeleton, ErrorMessage } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  DASHBOARD_STATS,
  CALENDAR_EVENTS,
  ANALYTICS,
  NOTIFICATION_TEMPLATES,
  RECENT_ACTIVITY,
  ENROLLMENT_PERIODS,
} from './constants';
import { StudentManagementPage } from './components/StudentManagementPage';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { courseService } from '../../services/api/courseService';
import { userService } from '../../services/api/userService';

type TabKey =
  | 'dashboard'
  | 'students'
  | 'courses'
  | 'periods'
  | 'calendar'
  | 'communication'
  | 'chat'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  {
    key: 'students',
    label: 'Student Management',
    labelAr: 'إدارة الطلاب',
    icon: GraduationCap,
    group: 'Management',
  },
  {
    key: 'courses',
    label: 'Course Management',
    labelAr: 'إدارة المقررات',
    icon: BookOpen,
    group: 'Management',
  },
  {
    key: 'periods',
    label: 'Periods & Scheduling',
    labelAr: 'الفترات والجدولة',
    icon: ClipboardList,
    group: 'Management',
  },
  {
    key: 'calendar',
    label: 'Academic Calendar',
    labelAr: 'التقويم الأكاديمي',
    icon: Calendar,
    group: 'Schedule',
  },
  {
    key: 'communication',
    label: 'Communication',
    labelAr: 'التواصل',
    icon: MessageSquare,
    group: 'Communication',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Account' },
];

function AdminDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // Fetch courses from API
  const { data: coursesRaw, refetch: refetchCourses, error: coursesError, loading: coursesLoading } = useApi(() => courseService.listCourses(), []);
  const [coursesData, setCoursesData] = useState<any[]>([]);
  useEffect(() => {
    if (coursesRaw) setCoursesData(coursesRaw.map((c: any) => ({
      id: c.id,
      courseCode: c.code,
      courseName: c.name,
      credits: c.credits,
      description: c.description || '',
      department: '',
      instructor: '',
      enrolled: 0,
      capacity: 0,
      status: c.status || 'active',
    })));
  }, [coursesRaw]);

  // Fetch users from API
  const { data: usersRaw, error: usersError, loading: usersLoading } = useApi(() => userService.listUsers(), []);
  const users = useMemo(() => ((usersRaw as any)?.data || usersRaw || []).map((u: any) => ({
    id: u.userId || u.id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    email: u.email,
    role: Array.isArray(u.roles) ? u.roles[0] || 'student' : u.role || 'student',
    department: '',
    status: u.status === 'active' || u.isActive !== false ? 'active' : 'inactive',
  })), [usersRaw]);

  useEffect(() => { if (coursesError) toast.error('Failed to load courses'); }, [coursesError]);
  useEffect(() => { if (usersError) toast.error('Failed to load users'); }, [usersError]);

  // State for data management (mock data that has no API endpoints)
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
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

  // Course management handlers
  const handleAddCourse = async (course: any) => {
    try {
      await courseService.createCourse({
        name: course.courseName,
        code: course.courseCode,
        credits: course.credits,
        description: course.description,
      });
      await refetchCourses();
      toast.success('Course added successfully');
    } catch (error) {
      console.error('Failed to add course:', error);
      toast.error('Failed to add course');
    }
  };

  const handleEditCourse = async (id: number, course: any) => {
    try {
      await courseService.updateCourse(id, {
        name: course.courseName,
        code: course.courseCode,
        credits: course.credits,
        description: course.description,
      });
      await refetchCourses();
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Failed to edit course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseService.deleteCourse(id);
      await refetchCourses();
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Calendar event handlers
  const handleAddEvent = (event: any) => {
    const newEvent = {
      id: Math.max(...calendarEvents.map((e) => e.id)) + 1,
      ...event,
      color: getEventColor(event.type),
    };
    setCalendarEvents([...calendarEvents, newEvent]);
  };

  const handleEditEvent = (id: number, event: any) => {
    setCalendarEvents(calendarEvents.map((e) => (e.id === id ? { ...e, ...event } : e)));
  };

  const handleDeleteEvent = (id: number) => {
    setCalendarEvents(calendarEvents.filter((e) => e.id !== id));
  };

  // Enrollment period handlers
  const handleAddEnrollmentPeriod = (period: any) => {
    const newPeriod = {
      id: Math.max(0, ...enrollmentPeriodsData.map((p) => p.id)) + 1,
      ...period,
    };
    setEnrollmentPeriodsData([...enrollmentPeriodsData, newPeriod]);
  };

  const handleEditEnrollmentPeriod = (id: number, period: any) => {
    setEnrollmentPeriodsData(
      enrollmentPeriodsData.map((p) => (p.id === id ? { ...p, ...period } : p))
    );
  };

  const handleDeleteEnrollmentPeriod = (id: number) => {
    setEnrollmentPeriodsData(enrollmentPeriodsData.filter((p) => p.id !== id));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'semesterStart':
        return '#10b981';
      case 'semesterEnd':
        return '#6366f1';
      case 'registration':
        return '#3b82f6';
      case 'holiday':
        return '#ef4444';
      case 'examPeriod':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Template handlers
  const handleCreateTemplate = (template: any) => {
    const newTemplate = {
      id: Math.max(...templates.map((t) => t.id)) + 1,
      ...template,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (id: number, template: any) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, ...template } : t)));
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
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
        tabs={translatedTabs.map((tab) => ({
          id: tab.key,
          label: tab.label,
          icon: tab.icon,
          group: tab.group,
        }))}
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key as TabKey)}
        onLogout={handleLogout}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#3b82f6'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Management', 'Schedule', 'Communication', 'Account']}
      />

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}>
        {activeTab !== 'chat' && (
        <DashboardHeader
          userName={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
          userRole="Admin"
          isDark={isDark}
          isRTL={isRTL}
          accentColor={primaryHex || '#3b82f6'}
          avatarGradient="from-[#3b82f6] to-[#06b6d4]"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          searchRole="admin"
          onProfileClick={() => handleTabChange('profile')}
          onMenuClick={() => setSidebarOpen(true)}
          primaryColor={primaryColor}
          onSetPrimaryColor={setPrimaryColor}
          availableColors={[
            { id: 'blue', colorClass: 'bg-blue-500', hex: '#3b82f6' },
            { id: 'emerald', colorClass: 'bg-emerald-500', hex: '#10b981' },
            { id: 'rose', colorClass: 'bg-blue-500', hex: '#f43f5e' },
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
          coursesLoading ? <LoadingSkeleton variant="card" count={4} /> :
          coursesError ? <ErrorMessage error={coursesError} onRetry={refetchCourses} /> :
          <CourseManagementPage
            courses={coursesData}
            users={users}
            adminDepartment="Computer Science"
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
            adminDepartment="Computer Science"
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
            height="100vh"
            currentUserName={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
            showVideoCall={true}
            showVoiceCall={true}
            isDark={isDark}
            accentColor={primaryHex || '#4f46e5'}
            className="rounded-none border-0"
          />
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <DashboardProfileTab
            isDark={isDark}
            accentColor={primaryHex || '#3b82f6'}
            bannerGradient="from-[#3b82f6] to-[#06b6d4]"
            profileData={{
              fullName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
              role: 'Department Head',
              department: 'Computer Science',
              email: user?.email || 'admin@university.edu',
              phone: user?.phone || '',
              address: 'Faculty Building, Office 312',
              dateOfBirth: '',
              bio: 'Department Head for Computer Science and Engineering. Responsible for managing department courses, faculty assignments, student enrollment, and academic scheduling.',
              specialization: [
                'Academic Administration',
                'Course Management',
                'Student Affairs',
                'Faculty Coordination',
                'Enrollment Management',
              ],
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
