import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  User,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  MessagesSquare,
  Menu,
  Megaphone,
  Bell,
} from 'lucide-react';
import {
  StatsCard,
  GradesTable,
  RosterTable,
  AssignmentsList,
  AttendanceTable,
  AttendanceModal,
  AssignmentModal,
  GradeModal,
  StudentEditModal,
  MessageModal,
  ConfirmDialog,
  ProfilePage,
  ModernDashboard,
  CoursesPage,
  QuizzesPage,
  SchedulePage,
  DiscussionPage,
  NotificationsPage,
  AnnouncementsManager,
  SelectedSectionSummary,
  AIAttendanceModal,
} from './components';
import {
  MessagingChat,
  DashboardHeader,
  DashboardSidebar,
  CustomDropdown,
} from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  INSTRUCTOR_INFO,
  SECTIONS,
  COURSES,
  ROSTERS,
  DASHBOARD_STATS,
  GRADES,
  ASSIGNMENTS,
  ATTENDANCE,
  ANALYTICS,
  INSTRUCTOR_PROFILE,
  UPCOMING_CLASSES,
  PENDING_TASKS,
  RECENT_ACTIVITY,
} from './constants';
import type { AssignmentItem } from './components/AssignmentsList';
import type { GradeEntry } from './components/GradesTable';
import type { AttendanceSession } from './components/AttendanceTable';
import type { AssignmentFormData } from './components/AssignmentModal';
import type { GradeFormData } from './components/GradeModal';
import type { AttendanceFormData } from './components/AttendanceModal';
import type { MessageFormData } from './components/MessageModal';

type TabKey =
  | 'dashboard'
  | 'courses'
  | 'roster'
  | 'grades'
  | 'assignments'
  | 'quizzes'
  | 'schedule'
  | 'attendance'
  | 'discussion'
  | 'chat'
  | 'profile'
  | 'notifications'
  | 'announcements';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any; group: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: LayoutGrid,
    group: 'Overview',
  },
  { key: 'courses', label: 'Courses', labelAr: 'المقررات', icon: BookOpen, group: 'Teaching' },
  {
    key: 'quizzes',
    label: 'Quizzes',
    labelAr: 'الاختبارات',
    icon: ClipboardList,
    group: 'Teaching',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    labelAr: 'الواجبات',
    icon: CheckSquare,
    group: 'Teaching',
  },
  { key: 'schedule', label: 'Schedule', labelAr: 'الجدول', icon: CalendarDays, group: 'Teaching' },
  { key: 'roster', label: 'Roster', labelAr: 'قائمة الطلاب', icon: Users, group: 'Students' },
  { key: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: Calendar, group: 'Students' },
  {
    key: 'announcements',
    label: 'Announcements',
    labelAr: 'الإعلانات',
    icon: Megaphone,
    group: 'Communication',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات',
    icon: Bell,
    group: 'Communication',
  },
  {
    key: 'discussion',
    label: 'Discussion',
    labelAr: 'المناقشات',
    icon: MessagesSquare,
    group: 'Communication',
  },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageSquare, group: 'Communication' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User, group: 'Tools' },
];

function InstructorDashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [rosterSubTab, setRosterSubTab] = useState<'overview' | 'grades'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAIAttendanceModalOpen, setIsAIAttendanceModalOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();

  // State for roster management
  const [rosterOverrides, setRosterOverrides] = useState<
    Record<
      string,
      Array<{ id: number; name: string; email: string; status: string; grade?: string }>
    >
  >({});
  const [editingStudent, setEditingStudent] = useState<{
    id: number;
    name: string;
    email: string;
    status: string;
    grade?: string;
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State for assignments
  const [assignmentsData, setAssignmentsData] =
    useState<Record<string, AssignmentItem[]>>(ASSIGNMENTS);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentFormData | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);

  // State for grades
  const [gradesData, setGradesData] = useState<Record<string, GradeEntry[]>>(GRADES);
  const [editingGrade, setEditingGrade] = useState<GradeFormData | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<number | null>(null);

  // State for attendance
  const [attendanceData, setAttendanceData] =
    useState<Record<string, AttendanceSession[]>>(ATTENDANCE);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceFormData | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<number | null>(null);
  // State for messages (dummy state since replaced by Announcements/Chat)
  const [editingMessage, setEditingMessage] = useState<MessageFormData | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [messageMode, setMessageMode] = useState<'create' | 'edit' | 'reply'>('create');

  // State for courses
  const [coursesData, setCoursesData] = useState(COURSES);
  const selectedCourseIdFromRoute =
    params.tab === 'courses' && params.id ? Number(params.id) : null;

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (tabParam === 'grades') {
      setActiveTab('roster');
      setRosterSubTab('grades');
      navigate('/instructordashboard/roster', { replace: true });
      return;
    }
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Set default section on mount and when entering section-dependent tabs
  useEffect(() => {
    if (!activeSectionId && ['roster', 'assignments', 'attendance'].includes(activeTab)) {
      setActiveSectionId(String(SECTIONS[0].sectionId));
    }
  }, [activeTab, activeSectionId]);

  // Disable browser's native scroll restoration so it doesn't fight our scroll calls
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  // Scroll to top — targets every possible scroll container
  const scrollToTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  };

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    if (!['roster', 'attendance'].includes(key)) {
      setActiveSectionId(null);
    }
    navigate(`/instructordashboard/${key}`);
    // Scroll after a tick so the new content has rendered
    requestAnimationFrame(() => scrollToTop());
  };

  const sectionOptions = useMemo(
    () =>
      SECTIONS.map((s) => ({
        value: String(s.sectionId),
        label: `${s.courseCode} - ${s.sectionLabel}`,
      })),
    []
  );

  const currentRosterBase = activeSectionId ? ROSTERS[activeSectionId] || [] : [];
  const currentRoster =
    activeSectionId && rosterOverrides[activeSectionId]
      ? rosterOverrides[activeSectionId]!
      : currentRosterBase;
  const selectedSection = activeSectionId
    ? SECTIONS.find((s) => String(s.sectionId) === activeSectionId) || null
    : null;

  // Assignment handlers
  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = (assignment: AssignmentItem) => {
    setEditingAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (data: AssignmentFormData) => {
    if (!activeSectionId) return;

    const sectionAssignments = assignmentsData[activeSectionId] || [];

    if (data.id) {
      // Edit existing
      const updated = sectionAssignments.map((a) =>
        a.id === data.id ? { ...data, id: data.id } : a
      );
      setAssignmentsData({ ...assignmentsData, [activeSectionId]: updated });
    } else {
      // Create new
      const newId = Math.max(...sectionAssignments.map((a) => a.id), 0) + 1;
      const newAssignment: AssignmentItem = { ...data, id: newId };
      setAssignmentsData({
        ...assignmentsData,
        [activeSectionId]: [...sectionAssignments, newAssignment],
      });
    }

    setIsAssignmentModalOpen(false);
  };

  const handleDeleteAssignment = (id: number) => {
    setAssignmentToDelete(id);
  };

  const confirmDeleteAssignment = () => {
    if (!activeSectionId || !assignmentToDelete) return;

    const sectionAssignments = assignmentsData[activeSectionId] || [];
    const updated = sectionAssignments.filter((a) => a.id !== assignmentToDelete);
    setAssignmentsData({ ...assignmentsData, [activeSectionId]: updated });
    setAssignmentToDelete(null);
  };

  const handleAssignmentStatusChange = (id: number, newStatus: 'draft' | 'open' | 'closed') => {
    if (!activeSectionId) return;

    const sectionAssignments = assignmentsData[activeSectionId] || [];
    const updated = sectionAssignments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setAssignmentsData({ ...assignmentsData, [activeSectionId]: updated });
  };

  // Grade handlers
  const handleEditGrade = (grade: GradeEntry) => {
    setEditingGrade(grade);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = (data: GradeFormData) => {
    if (!activeSectionId) return;

    const sectionGrades = gradesData[activeSectionId] || [];
    const updated = sectionGrades.map((g) => (g.id === data.id ? { ...data, id: data.id! } : g));
    setGradesData({ ...gradesData, [activeSectionId]: updated });
    setIsGradeModalOpen(false);
  };

  const handleDeleteGrade = (id: number) => {
    setGradeToDelete(id);
  };

  const confirmDeleteGrade = () => {
    if (!activeSectionId || !gradeToDelete) return;

    const sectionGrades = gradesData[activeSectionId] || [];
    const updated = sectionGrades.filter((g) => g.id !== gradeToDelete);
    setGradesData({ ...gradesData, [activeSectionId]: updated });
    setGradeToDelete(null);
  };

  // Attendance handlers
  const handleCreateAttendance = () => {
    setEditingAttendance(null);
    setIsAttendanceModalOpen(true);
  };

  const handleEditAttendance = (session: AttendanceSession) => {
    setEditingAttendance(session);
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = (data: AttendanceFormData) => {
    if (!activeSectionId) return;

    const sectionAttendance = attendanceData[activeSectionId] || [];

    if (data.id) {
      // Edit existing
      const updated = sectionAttendance.map((a) =>
        a.id === data.id ? { ...data, id: data.id } : a
      );
      setAttendanceData({ ...attendanceData, [activeSectionId]: updated });
    } else {
      // Create new
      const newId = Math.max(...sectionAttendance.map((a) => a.id), 0) + 1;
      const newSession: AttendanceSession = { ...data, id: newId };
      setAttendanceData({
        ...attendanceData,
        [activeSectionId]: [...sectionAttendance, newSession],
      });
    }

    setIsAttendanceModalOpen(false);
  };

  const handleDeleteAttendance = (id: number) => {
    setAttendanceToDelete(id);
  };

  const confirmDeleteAttendance = () => {
    if (!activeSectionId || !attendanceToDelete) return;

    const sectionAttendance = attendanceData[activeSectionId] || [];
    const updated = sectionAttendance.filter((a) => a.id !== attendanceToDelete);
    setAttendanceData({ ...attendanceData, [activeSectionId]: updated });
    setAttendanceToDelete(null);
  };

  // Message handlers (dummy handlers to fix undefined references)
  const handleSaveMessage = (data: MessageFormData) => {
    setIsMessageModalOpen(false);
  };

  const confirmDeleteMessage = () => {
    setMessageToDelete(null);
  };

  // Course handlers
  const handleCreateCourse = (data: any) => {
    const newCourse = {
      id: Math.max(...coursesData.map((c) => c.id)) + 1,
      ...data,
      prerequisites: data.prerequisites
        ? data.prerequisites.split(',').map((p: string) => p.trim())
        : [],
      enrolled: 0,
      status: 'active' as const,
      averageGrade: 0,
      attendanceRate: 0,
    };
    setCoursesData([...coursesData, newCourse]);
  };

  const handleEditCourse = (id: number, data: any) => {
    setCoursesData(
      coursesData.map((course) =>
        course.id === id
          ? {
              ...course,
              ...data,
              prerequisites: data.prerequisites
                ? data.prerequisites.split(',').map((p: string) => p.trim())
                : [],
            }
          : course
      )
    );
  };

  const handleDeleteCourse = (id: number) => {
    setCoursesData(coursesData.filter((course) => course.id !== id));
  };

  const handleDuplicateCourse = (id: number) => {
    const courseToDuplicate = coursesData.find((c) => c.id === id);
    if (!courseToDuplicate) return;

    const newCourse = {
      ...courseToDuplicate,
      id: Math.max(...coursesData.map((c) => c.id)) + 1,
      courseName: `${courseToDuplicate.courseName} (Copy)`,
      enrolled: 0,
    };
    setCoursesData([...coursesData, newCourse]);
  };

  const handleViewCourse = (id: number) => {
    navigate(`/instructordashboard/courses/${id}`);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map((tab) => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label,
  }));

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
        onLogout={() => navigate('/login')}
        isDark={isDark}
        isRTL={isRTL}
        accentColor={primaryHex || '#4F46E5'}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        groupOrder={['Overview', 'Teaching', 'Students', 'Communication', 'Tools']}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'} overflow-y-auto`}
      >
        {activeTab !== 'chat' && (
          <DashboardHeader
            userName="Prof. Sarah Martinez"
            userRole="Instructor"
            isDark={isDark}
            isRTL={isRTL}
            accentColor={primaryHex || '#4F46E5'}
            avatarGradient="from-[#3b82f6] to-[#06b6d4]"
            language={language}
            onToggleTheme={toggleTheme}
            onSetLanguage={setLanguage}
            searchRole="instructor"
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
        <div
          key={activeTab}
          className={activeTab === 'chat' ? 'h-screen overflow-hidden p-0' : 'flex-1'}
          style={{ animation: 'tabFadeIn 0.18s ease-out' }}
        >
          <style>{`@keyframes tabFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <ModernDashboard
              stats={DASHBOARD_STATS}
              sections={SECTIONS}
              upcomingClasses={UPCOMING_CLASSES}
              recentActivity={RECENT_ACTIVITY}
              pendingTasks={PENDING_TASKS}
              onNavigate={(tab) => handleTabChange(tab as TabKey)}
            />
          )}

          {/* Courses */}
          {activeTab === 'courses' && (
            <CoursesPage
              courses={coursesData}
              onCreateCourse={handleCreateCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onDuplicateCourse={handleDuplicateCourse}
              onViewCourse={handleViewCourse}
              selectedCourseId={selectedCourseIdFromRoute}
            />
          )}

          {/* Quizzes */}
          {activeTab === 'quizzes' && <QuizzesPage />}

          {/* Schedule */}
          {activeTab === 'schedule' && <SchedulePage />}

          {/* Roster */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Student Roster
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Manage enrolled students, view grades, and track academic performance
                  </p>
                </div>
              </div>
              <div className="max-w-xs">
                <CustomDropdown
                  label="Select Section"
                  options={sectionOptions}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={setActiveSectionId}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>
              <SelectedSectionSummary section={selectedSection as any} />

              <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 mb-6">
                <button
                  onClick={() => setRosterSubTab('overview')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                    rosterSubTab === 'overview'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t('overview') || 'Overview'}
                  {rosterSubTab === 'overview' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      style={{ backgroundColor: primaryHex }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setRosterSubTab('grades')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                    rosterSubTab === 'grades'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t('detailedGrades') || 'Detailed Grades'}
                  {rosterSubTab === 'grades' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      style={{ backgroundColor: primaryHex }}
                    />
                  )}
                </button>
              </div>

              {rosterSubTab === 'overview' ? (
                <RosterTable
                  data={currentRoster}
                  grades={activeSectionId ? gradesData[activeSectionId] || [] : []}
                  onEdit={(student) => {
                    setEditingStudent(student);
                    setIsEditOpen(true);
                  }}
                />
              ) : (
                <GradesTable
                  data={activeSectionId ? gradesData[activeSectionId] || [] : []}
                  onEdit={handleEditGrade}
                  onDelete={handleDeleteGrade}
                />
              )}
            </div>
          )}

          {/* Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Assignments
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Create and manage assignments across your course sections
                  </p>
                </div>
              </div>
              <div className="max-w-xs">
                <CustomDropdown
                  label="Select Section"
                  options={sectionOptions}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={setActiveSectionId}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>
              <SelectedSectionSummary section={selectedSection as any} />
              <AssignmentsList
                data={activeSectionId ? assignmentsData[activeSectionId] || [] : []}
                onEdit={handleEditAssignment}
                onDelete={handleDeleteAssignment}
                onCreate={handleCreateAssignment}
                onStatusChange={handleAssignmentStatusChange}
              />
            </div>
          )}

          {/* Attendance */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Attendance
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Track and manage attendance records for your class sessions
                  </p>
                </div>
              </div>
              <div className="max-w-xs">
                <CustomDropdown
                  label="Select Section"
                  options={sectionOptions}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={setActiveSectionId}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>
              <SelectedSectionSummary section={selectedSection as any} />

              <div
                className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('attendanceRecords') || 'Attendance Records'}
                </h3>
                <AttendanceTable
                  sessions={activeSectionId ? attendanceData[activeSectionId] || [] : []}
                  onCreate={handleCreateAttendance}
                  onEdit={handleEditAttendance}
                  onDelete={handleDeleteAttendance}
                  onSwitchToAI={() => setIsAIAttendanceModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Announcements */}
          {activeTab === 'announcements' && <AnnouncementsManager />}

          {/* Notifications */}
          {activeTab === 'notifications' && <NotificationsPage />}

          {/* Discussion */}
          {activeTab === 'discussion' && (
            <DiscussionPage userRole="instructor" userName="Prof. Sarah Martinez" />
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <MessagingChat
              height="100vh"
              currentUserName="Prof. Sarah Martinez"
              showVideoCall={true}
              showVoiceCall={true}
              isDark={isDark}
              accentColor={primaryHex || '#4F46E5'}
            />
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor={primaryHex || '#4F46E5'}
              bannerGradient="from-[#3b82f6] to-[#06b6d4]"
              profileData={{
                fullName: 'Prof. Sarah Martinez',
                role: 'Instructor',
                department: 'Computer Science',
                email: 'sarah.martinez@university.edu',
                phone: '+20 100 987 6543',
                address: 'Cairo, Egypt',
                dateOfBirth: '1985-03-22',
                bio: 'Associate Professor of Computer Science with 12+ years of teaching experience. Specializes in software engineering, algorithms, and distributed systems.',
                interests: [
                  'Software Engineering',
                  'Distributed Systems',
                  'Machine Learning',
                  'Higher Education',
                ],
                skills: ['Java', 'Python', 'C++', 'Research', 'Curriculum Design'],
              }}
            />
          )}
        </div>
        {/* end key={activeTab} wrapper */}
      </main>

      {/* Modals */}
      {isEditOpen && (
        <StudentEditModal
          open={isEditOpen}
          student={editingStudent}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            if (!activeSectionId) return;
            const updatedRoster = currentRoster.map((r) => (r.id === updated.id ? updated : r));
            setRosterOverrides((prev) => ({ ...prev, [String(activeSectionId)]: updatedRoster }));
            setIsEditOpen(false);
          }}
        />
      )}

      <AssignmentModal
        open={isAssignmentModalOpen}
        assignment={editingAssignment}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSave={handleSaveAssignment}
      />

      <GradeModal
        open={isGradeModalOpen}
        gradeData={editingGrade}
        onClose={() => setIsGradeModalOpen(false)}
        onSave={handleSaveGrade}
      />

      <AttendanceModal
        open={isAttendanceModalOpen}
        attendanceData={editingAttendance}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSave={handleSaveAttendance}
      />

      <MessageModal
        open={isMessageModalOpen}
        messageData={editingMessage}
        onClose={() => setIsMessageModalOpen(false)}
        onSave={handleSaveMessage}
        mode={messageMode}
      />

      <ConfirmDialog
        open={assignmentToDelete !== null}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={confirmDeleteAssignment}
        onCancel={() => setAssignmentToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={gradeToDelete !== null}
        title="Delete Grade"
        message="Are you sure you want to delete this grade entry? This action cannot be undone."
        onConfirm={confirmDeleteGrade}
        onCancel={() => setGradeToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={attendanceToDelete !== null}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={confirmDeleteAttendance}
        onCancel={() => setAttendanceToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={messageToDelete !== null}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDeleteMessage}
        onCancel={() => setMessageToDelete(null)}
        confirmText="Delete"
        variant="danger"
      />

      <AIAttendanceModal
        open={isAIAttendanceModalOpen}
        onClose={() => setIsAIAttendanceModalOpen(false)}
        courseSection={selectedSection?.courseCode || 'Unknown Section'}
      />
    </div>
  );
}

// Main component wrapped with providers
function InstructorDashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <InstructorDashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default InstructorDashboard;
