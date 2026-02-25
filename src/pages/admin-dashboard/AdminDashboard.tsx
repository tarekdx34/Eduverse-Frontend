import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  BookOpen,
  Building2,
  Calendar,
  BarChart3,
  MessageSquare,
  HeadphonesIcon,
  Settings,
  LogOut,
  MessageCircle,
  User,
  Menu,
  CalendarClock,
  FileText,
  ClipboardList,
  GitBranch,
  UserPlus,
  Shield,
  ClipboardCheck,
  Lock,
  Database,
  CreditCard,
  Bell,
  Brain,
  Search,
} from 'lucide-react';
import {
  DashboardOverview,
  UserManagementPage,
  CourseManagementPage,
  DepartmentManagementPage,
  AcademicCalendarPage,
  AnalyticsReportsPage,
  CommunicationPage,
  FeedbackSupportPage,
  SystemConfigPage,
  ScheduleManagementPage,
  ExamSchedulePage,
  EnrollmentPeriodPage,
  PrerequisitesManagementPage,
  StaffAssignmentPage,
  RoleManagementPage,
  AttendanceManagementPage,
  SecurityLogsPage,
  BackupCenterPage,
  PaymentManagementPage,
  AdminNotificationsPage,
  AIInsightsPage,
  GlobalSearchPage,
  SettingsHubPage,
} from './components';
import { DashboardHeader, DashboardSidebar, MessagingChat } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  DASHBOARD_STATS,
  USERS,
  COURSES,
  DEPARTMENTS,
  CALENDAR_EVENTS,
  ANALYTICS,
  NOTIFICATION_TEMPLATES,
  SUPPORT_TICKETS,
  AUDIT_LOGS,
  GAMIFICATION_SETTINGS,
  API_INTEGRATIONS,
  RECENT_ACTIVITY,
  ADMIN_DEPARTMENT,
  SCHEDULES,
  ENROLLMENT_PERIODS,
  EXAM_SCHEDULES,
} from './constants';

type TabKey =
  | 'dashboard'
  | 'users'
  | 'courses'
  | 'departments'
  | 'staff-assignment'
  | 'roles'
  | 'schedule'
  | 'exams'
  | 'enrollment'
  | 'prerequisites'
  | 'calendar'
  | 'attendance'
  | 'analytics'
  | 'communication'
  | 'chat'
  | 'feedback'
  | 'notifications'
  | 'security'
  | 'backup'
  | 'payments'
  | 'ai-insights'
  | 'search'
  | 'settings'
  | 'config'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutGrid },
  { key: 'users', label: 'User Management', labelAr: 'إدارة المستخدمين', icon: Users },
  { key: 'courses', label: 'Course Management', labelAr: 'إدارة المقررات', icon: BookOpen },
  { key: 'departments', label: 'Departments', labelAr: 'الأقسام', icon: Building2 },
  { key: 'staff-assignment', label: 'Staff Assignment', labelAr: 'تعيين الموظفين', icon: UserPlus },
  { key: 'roles', label: 'Role Management', labelAr: 'إدارة الأدوار', icon: Shield },
  { key: 'schedule', label: 'Schedule Management', labelAr: 'إدارة الجداول', icon: CalendarClock },
  { key: 'exams', label: 'Exam Schedule', labelAr: 'جدول الامتحانات', icon: FileText },
  { key: 'enrollment', label: 'Enrollment Periods', labelAr: 'فترات التسجيل', icon: ClipboardList },
  { key: 'prerequisites', label: 'Prerequisites', labelAr: 'المتطلبات السابقة', icon: GitBranch },
  { key: 'calendar', label: 'Academic Calendar', labelAr: 'التقويم الأكاديمي', icon: Calendar },
  { key: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: ClipboardCheck },
  { key: 'analytics', label: 'Analytics & Reports', labelAr: 'التحليلات والتقارير', icon: BarChart3 },
  { key: 'communication', label: 'Communication', labelAr: 'التواصل', icon: MessageSquare },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageCircle },
  { key: 'notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: Bell },
  { key: 'feedback', label: 'Feedback & Support', labelAr: 'الملاحظات والدعم', icon: HeadphonesIcon },
  { key: 'security', label: 'Security & Logs', labelAr: 'الأمان والسجلات', icon: Lock },
  { key: 'backup', label: 'Backup Center', labelAr: 'مركز النسخ الاحتياطي', icon: Database },
  { key: 'payments', label: 'Payment Management', labelAr: 'إدارة المدفوعات', icon: CreditCard },
  { key: 'ai-insights', label: 'AI Insights', labelAr: 'رؤى الذكاء الاصطناعي', icon: Brain },
  { key: 'search', label: 'Global Search', labelAr: 'البحث الشامل', icon: Search },
  { key: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  { key: 'config', label: 'System Config', labelAr: 'إعدادات النظام', icon: Settings },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User },
];

function AdminDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL, t } = useLanguage();

  // State for data management
  const [usersData, setUsersData] = useState(USERS);
  const [coursesData, setCoursesData] = useState(COURSES);
  const [departmentsData, setDepartmentsData] = useState(DEPARTMENTS);
  const [calendarEvents, setCalendarEvents] = useState(CALENDAR_EVENTS);
  const [templates, setTemplates] = useState(NOTIFICATION_TEMPLATES);
  const [tickets, setTickets] = useState(SUPPORT_TICKETS);
  const [gamification, setGamification] = useState(GAMIFICATION_SETTINGS);
  const [schedulesData, setSchedulesData] = useState(SCHEDULES);
  const [enrollmentPeriodsData, setEnrollmentPeriodsData] = useState(ENROLLMENT_PERIODS);
  const [examSchedulesData, setExamSchedulesData] = useState(EXAM_SCHEDULES);

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

  // User management handlers
  const handleAddUser = (user: any) => {
    const newUser = {
      id: Math.max(...usersData.map(u => u.id)) + 1,
      ...user,
      lastActive: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setUsersData([...usersData, newUser]);
  };

  const handleEditUser = (id: number, user: any) => {
    setUsersData(usersData.map(u => u.id === id ? { ...u, ...user } : u));
  };

  const handleDeleteUser = (id: number) => {
    setUsersData(usersData.filter(u => u.id !== id));
  };

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

  // Department management handlers
  const handleAddDepartment = (department: any) => {
    const newDept = {
      id: Math.max(...departmentsData.map(d => d.id)) + 1,
      ...department,
      courses: 0,
      students: 0,
      instructors: 0,
    };
    setDepartmentsData([...departmentsData, newDept]);
  };

  const handleEditDepartment = (id: number, department: any) => {
    setDepartmentsData(departmentsData.map(d => d.id === id ? { ...d, ...department } : d));
  };

  const handleDeleteDepartment = (id: number) => {
    setDepartmentsData(departmentsData.filter(d => d.id !== id));
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

  // Schedule management handlers
  const handleAddSchedule = (schedule: any) => {
    const newSchedule = {
      id: Math.max(0, ...schedulesData.map(s => s.id)) + 1,
      ...schedule,
    };
    setSchedulesData([...schedulesData, newSchedule]);
  };

  const handleEditSchedule = (id: number, schedule: any) => {
    setSchedulesData(schedulesData.map(s => s.id === id ? { ...s, ...schedule } : s));
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedulesData(schedulesData.filter(s => s.id !== id));
  };

  // Exam schedule handlers
  const handleAddExam = (exam: any) => {
    const newExam = {
      id: Math.max(0, ...examSchedulesData.map(e => e.id)) + 1,
      ...exam,
    };
    setExamSchedulesData([...examSchedulesData, newExam]);
  };

  const handleEditExam = (id: number, exam: any) => {
    setExamSchedulesData(examSchedulesData.map(e => e.id === id ? { ...e, ...exam } : e));
  };

  const handleDeleteExam = (id: number) => {
    setExamSchedulesData(examSchedulesData.filter(e => e.id !== id));
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

  // Prerequisites handler
  const handleUpdatePrerequisites = (courseId: number, prerequisites: string[]) => {
    setCoursesData(coursesData.map(c => c.id === courseId ? { ...c, prerequisites } : c));
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

  // Ticket handlers
  const handleUpdateTicket = (id: number, status: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleReplyTicket = (id: number, message: string) => {
    console.log('Replying to ticket:', id, message);
    alert('Reply sent successfully!');
  };

  // System config handlers
  const handleUpdateGamification = (settings: any) => {
    setGamification(settings);
    alert('Gamification settings updated!');
  };

  const handleToggleIntegration = (id: number, enabled: boolean) => {
    console.log('Toggle integration:', id, enabled);
  };

  const handleSyncIntegration = (id: number) => {
    console.log('Sync integration:', id);
    alert('Sync started!');
  };

  const handleExport = (format: string) => {
    console.log('Exporting as:', format);
    alert(`Exporting report as ${format.toUpperCase()}...`);
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
          userName="System Administrator"
          userRole="Super Admin"
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

          {/* User Management */}
          {activeTab === 'users' && (
            <UserManagementPage
              users={usersData}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* Course Management */}
          {activeTab === 'courses' && (
            <CourseManagementPage
              courses={coursesData}
              users={usersData}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddCourse={handleAddCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}

          {/* Department Management */}
          {activeTab === 'departments' && (
            <DepartmentManagementPage
              departments={departmentsData}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {/* Schedule Management */}
          {activeTab === 'schedule' && (
            <ScheduleManagementPage
              schedules={schedulesData}
              courses={coursesData}
              users={usersData}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddSchedule={handleAddSchedule}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {/* Exam Schedule */}
          {activeTab === 'exams' && (
            <ExamSchedulePage
              exams={examSchedulesData}
              courses={coursesData}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddExam={handleAddExam}
              onEditExam={handleEditExam}
              onDeleteExam={handleDeleteExam}
            />
          )}

          {/* Enrollment Periods */}
          {activeTab === 'enrollment' && (
            <EnrollmentPeriodPage
              enrollmentPeriods={enrollmentPeriodsData}
              courses={coursesData}
              adminDepartment={ADMIN_DEPARTMENT}
              onAddPeriod={handleAddEnrollmentPeriod}
              onEditPeriod={handleEditEnrollmentPeriod}
              onDeletePeriod={handleDeleteEnrollmentPeriod}
            />
          )}

          {/* Prerequisites Management */}
          {activeTab === 'prerequisites' && (
            <PrerequisitesManagementPage
              courses={coursesData}
              adminDepartment={ADMIN_DEPARTMENT}
              onUpdatePrerequisites={handleUpdatePrerequisites}
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

          {/* Analytics & Reports */}
          {activeTab === 'analytics' && (
            <AnalyticsReportsPage
              analytics={ANALYTICS}
              onExport={handleExport}
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
            />
          )}

          {/* Feedback & Support */}
          {activeTab === 'feedback' && (
            <FeedbackSupportPage
              tickets={tickets}
              onUpdateTicket={handleUpdateTicket}
              onReplyTicket={handleReplyTicket}
            />
          )}

          {/* System Configuration */}
          {activeTab === 'config' && (
            <SystemConfigPage
              auditLogs={AUDIT_LOGS}
              gamificationSettings={gamification}
              apiIntegrations={API_INTEGRATIONS}
              onUpdateGamification={handleUpdateGamification}
              onToggleIntegration={handleToggleIntegration}
              onSyncIntegration={handleSyncIntegration}
            />
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor="#E11D48"
              bannerGradient="from-rose-500 to-orange-500"
              profileData={{
                fullName: 'System Administrator',
                role: 'Super Admin',
                department: 'Administration',
                email: 'admin@university.edu',
                phone: '+1 (555) 100-0001',
                address: 'Admin Building, Suite 100',
                dateOfBirth: '1980-01-15',
                bio: 'University System Administrator responsible for managing all academic and administrative operations. Overseeing user management, course administration, and system configuration.',
                specialization: ['System Administration', 'User Management', 'Academic Operations', 'Data Analytics', 'Policy Management'],
              }}
            />
          )}

          {/* Staff Assignment */}
          {activeTab === 'staff-assignment' && <StaffAssignmentPage />}

          {/* Role Management */}
          {activeTab === 'roles' && <RoleManagementPage />}

          {/* Attendance Management */}
          {activeTab === 'attendance' && <AttendanceManagementPage />}

          {/* Security & Logs */}
          {activeTab === 'security' && <SecurityLogsPage />}

          {/* Backup Center */}
          {activeTab === 'backup' && <BackupCenterPage />}

          {/* Payment Management */}
          {activeTab === 'payments' && <PaymentManagementPage />}

          {/* Notifications */}
          {activeTab === 'notifications' && <AdminNotificationsPage />}

          {/* AI Insights */}
          {activeTab === 'ai-insights' && <AIInsightsPage />}

          {/* Global Search */}
          {activeTab === 'search' && <GlobalSearchPage />}

          {/* Settings Hub */}
          {activeTab === 'settings' && <SettingsHubPage />}
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
