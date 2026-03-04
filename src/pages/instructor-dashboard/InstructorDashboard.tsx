import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { courseService } from '../../services/api/courseService';
import { enrollmentService } from '../../services/api/enrollmentService';
import { assignmentService } from '../../services/api/assignmentService';
import { gradeService } from '../../services/api/gradeService';
import { attendanceService } from '../../services/api/attendanceService';
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
  DASHBOARD_STATS,
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [rosterSubTab, setRosterSubTab] = useState<'overview' | 'grades'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAIAttendanceModalOpen, setIsAIAttendanceModalOpen] = useState(false);
  const { isDark, toggleTheme, primaryHex, primaryColor, setPrimaryColor } = useTheme() as any;
  const { language, setLanguage, isRTL, t } = useLanguage();

  // --- API: Fetch instructor's courses ---
  const { data: coursesRaw, loading: coursesLoading, refetch: refetchCourses } = useApi(
    () => courseService.listCourses(),
    []
  );
  const [coursesData, setCoursesData] = useState<any[]>([]);
  useEffect(() => {
    if (coursesRaw) setCoursesData(coursesRaw.map((c: any, i: number) => ({
      id: c.id,
      courseCode: c.code,
      courseName: c.name,
      semester: 'Current',
      credits: c.credits,
      prerequisites: (c.prerequisites || []).map((p: any) => p.prerequisiteCourseId?.toString() || ''),
      description: c.description || '',
      enrolled: 0,
      capacity: 0,
      schedule: '',
      room: '',
      status: c.status === 'active' ? 'active' as const : 'archived' as const,
      averageGrade: 0,
      attendanceRate: 0,
    })));
  }, [coursesRaw]);

  // --- Derive sections from courses ---
  const sections = useMemo(() =>
    coursesData.map(c => ({
      sectionId: c.id,
      courseCode: c.courseCode,
      courseName: c.courseName,
      sectionLabel: 'Section A',
      schedule: c.schedule || '',
      capacity: c.capacity || 0,
      enrolled: c.enrolled || 0,
    })),
    [coursesData]
  );

  // --- API: Fetch roster for active section ---
  const { data: rosterRaw, refetch: refetchRoster } = useApi(
    () => activeSectionId ? enrollmentService.getSectionStudents(Number(activeSectionId)) : Promise.resolve([]),
    [activeSectionId]
  );
  const currentRoster = useMemo(() =>
    (rosterRaw || []).map((e: any, i: number) => ({
      id: e.id,
      name: `Student ${e.studentId}`,
      email: `student${e.studentId}@university.edu`,
      status: e.status || 'enrolled',
      grade: e.grade,
    })),
    [rosterRaw]
  );

  // --- API: Fetch assignments for active section ---
  const { data: assignmentsRaw, refetch: refetchAssignments } = useApi(
    () => activeSectionId ? assignmentService.listAssignments({ courseId: Number(activeSectionId) }) : Promise.resolve([]),
    [activeSectionId]
  );
  const currentAssignments = useMemo(() =>
    (assignmentsRaw || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate?.split('T')[0] || '',
      submissions: 0,
      status: (a.status === 'published' ? 'open' : a.status === 'closed' ? 'closed' : 'draft') as 'draft' | 'open' | 'closed',
    })),
    [assignmentsRaw]
  );

  // --- API: Fetch grades for active section ---
  const { data: gradesRaw, refetch: refetchGrades } = useApi(
    () => activeSectionId ? gradeService.listAllGrades({ courseId: Number(activeSectionId) }) : Promise.resolve([]),
    [activeSectionId]
  );
  const currentGrades = useMemo(() =>
    (gradesRaw || []).map((g: any) => ({
      id: g.id,
      student: `Student ${g.studentId}`,
      email: `student${g.studentId}@university.edu`,
      assignment: '',
      score: g.numericGrade || 0,
      grade: g.letterGrade || '',
    })),
    [gradesRaw]
  );

  // --- API: Fetch attendance for active section ---
  const { data: attendanceRaw, refetch: refetchAttendance } = useApi(
    () => activeSectionId ? attendanceService.listSessions({ sectionId: Number(activeSectionId) }) : Promise.resolve([]),
    [activeSectionId]
  );
  const currentAttendance = useMemo(() =>
    (attendanceRaw || []).map((s: any) => ({
      id: s.id,
      date: s.date?.split('T')[0] || '',
      present: (s.records || []).filter((r: any) => r.status === 'present').length,
      absent: (s.records || []).filter((r: any) => r.status === 'absent').length,
    })),
    [attendanceRaw]
  );

  // State for roster management
  const [editingStudent, setEditingStudent] = useState<{
    id: number;
    name: string;
    email: string;
    status: string;
    grade?: string;
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State for assignments
  const [editingAssignment, setEditingAssignment] = useState<AssignmentFormData | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);

  // State for grades
  const [editingGrade, setEditingGrade] = useState<GradeFormData | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<number | null>(null);

  // State for attendance
  const [editingAttendance, setEditingAttendance] = useState<AttendanceFormData | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<number | null>(null);
  // State for messages (dummy state since replaced by Announcements/Chat)
  const [editingMessage, setEditingMessage] = useState<MessageFormData | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [messageMode, setMessageMode] = useState<'create' | 'edit' | 'reply'>('create');

  // State for courses
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
    if (!activeSectionId && ['roster', 'assignments', 'attendance'].includes(activeTab) && sections.length > 0) {
      setActiveSectionId(String(sections[0].sectionId));
    }
  }, [activeTab, activeSectionId, sections]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    // reset section on non section-related tabs
    if (!['roster', 'attendance'].includes(key)) {
      setActiveSectionId(null);
    }
    navigate(`/instructordashboard/${key}`);
  };

  const sectionOptions = useMemo(
    () =>
      sections.map((s) => ({
        value: String(s.sectionId),
        label: `${s.courseCode} - ${s.sectionLabel}`,
      })),
    [sections]
  );

  const selectedSection = activeSectionId
    ? sections.find((s) => String(s.sectionId) === activeSectionId) || null
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

  const handleSaveAssignment = async (data: AssignmentFormData) => {
    if (!activeSectionId) return;
    try {
      if (data.id) {
        await assignmentService.updateAssignment(data.id, {
          title: data.title,
          dueDate: data.dueDate,
        });
      } else {
        await assignmentService.createAssignment({
          title: data.title,
          dueDate: data.dueDate,
          courseId: Number(activeSectionId),
        } as any);
      }
      await refetchAssignments();
    } catch (err) {
      console.error('Failed to save assignment:', err);
    }
    setIsAssignmentModalOpen(false);
  };

  const handleDeleteAssignment = (id: number) => {
    setAssignmentToDelete(id);
  };

  const confirmDeleteAssignment = async () => {
    if (!activeSectionId || !assignmentToDelete) return;
    try {
      await assignmentService.deleteAssignment(assignmentToDelete);
      await refetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
    setAssignmentToDelete(null);
  };

  const handleAssignmentStatusChange = async (id: number, newStatus: 'draft' | 'open' | 'closed') => {
    if (!activeSectionId) return;
    try {
      const apiStatus = newStatus === 'open' ? 'published' : newStatus;
      await assignmentService.changeStatus(id, apiStatus);
      await refetchAssignments();
    } catch (err) {
      console.error('Failed to change assignment status:', err);
    }
  };

  // Grade handlers
  const handleEditGrade = (grade: GradeEntry) => {
    setEditingGrade(grade);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (data: GradeFormData) => {
    if (!activeSectionId || !data.id) return;
    try {
      await gradeService.updateGrade(data.id, {
        numericGrade: data.score,
        letterGrade: data.grade,
      });
      await refetchGrades();
    } catch (err) {
      console.error('Failed to save grade:', err);
    }
    setIsGradeModalOpen(false);
  };

  const handleDeleteGrade = (id: number) => {
    setGradeToDelete(id);
  };

  const confirmDeleteGrade = () => {
    if (!activeSectionId || !gradeToDelete) return;
    // No delete grade API yet — keep as local state removal
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

  const handleSaveAttendance = async (data: AttendanceFormData) => {
    if (!activeSectionId) return;
    try {
      if (data.id) {
        await attendanceService.updateSession(data.id, data as any);
      } else {
        await attendanceService.createSession({
          sectionId: Number(activeSectionId),
          date: data.date,
          type: 'lecture',
        });
      }
      await refetchAttendance();
    } catch (err) {
      console.error('Failed to save attendance:', err);
    }
    setIsAttendanceModalOpen(false);
  };

  const handleDeleteAttendance = (id: number) => {
    setAttendanceToDelete(id);
  };

  const confirmDeleteAttendance = async () => {
    if (!activeSectionId || !attendanceToDelete) return;
    try {
      await attendanceService.deleteSession(attendanceToDelete);
      await refetchAttendance();
    } catch (err) {
      console.error('Failed to delete attendance:', err);
    }
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
  const handleCreateCourse = async (data: any) => {
    try {
      await courseService.createCourse({
        name: data.courseName,
        code: data.courseCode,
        credits: data.credits,
        description: data.description,
      } as any);
      await refetchCourses();
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const handleEditCourse = async (id: number, data: any) => {
    try {
      await courseService.updateCourse(id, {
        name: data.courseName,
        code: data.courseCode,
        credits: data.credits,
        description: data.description,
      } as any);
      await refetchCourses();
    } catch (err) {
      console.error('Failed to update course:', err);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseService.deleteCourse(id);
      await refetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  const handleDuplicateCourse = (id: number) => {
    // UI-only action — duplicate locally
    const courseToDuplicate = coursesData.find((c) => c.id === id);
    if (!courseToDuplicate) return;

    const newCourse = {
      ...courseToDuplicate,
      id: Math.max(...coursesData.map((c) => c.id), 0) + 1,
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
      <main className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'} ${activeTab === 'chat' ? 'p-0' : 'p-4 lg:p-10'}`}>
        {activeTab !== 'chat' && (
        <DashboardHeader
          userName={user?.firstName ? `Prof. ${user.firstName} ${user.lastName}` : 'Instructor'}
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
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <ModernDashboard
            stats={DASHBOARD_STATS}
            sections={sections}
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
            <div className="max-w-xs mb-6">
              <CustomDropdown
                label="Select Section"
                options={sectionOptions}
                value={activeSectionId || String(sections[0]?.sectionId || '')}
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
                grades={currentGrades}
                onEdit={(student) => {
                  setEditingStudent(student);
                  setIsEditOpen(true);
                }}
              />
            ) : (
              <GradesTable
                data={currentGrades}
                onEdit={handleEditGrade}
                onDelete={handleDeleteGrade}
              />
            )}
          </div>
        )}

        {/* Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="max-w-xs mb-6">
              <CustomDropdown
                label="Select Section"
                options={sectionOptions}
                value={activeSectionId || String(sections[0]?.sectionId || '')}
                onChange={setActiveSectionId}
                isDark={isDark}
                accentColor={primaryHex}
              />
            </div>
            <SelectedSectionSummary section={selectedSection as any} />
            <AssignmentsList
              data={currentAssignments}
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
            <div className="max-w-xs mb-6">
              <CustomDropdown
                label="Select Section"
                options={sectionOptions}
                value={activeSectionId || String(sections[0]?.sectionId || '')}
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
                sessions={currentAttendance}
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
          <DiscussionPage userRole="instructor" userName={user?.firstName ? `Prof. ${user.firstName} ${user.lastName}` : 'Instructor'} />
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <MessagingChat
            height="100vh"
            currentUserName={user?.firstName ? `Prof. ${user.firstName} ${user.lastName}` : 'Instructor'}
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
            accentColor={primaryHex || '#4F46E5'}
            bannerGradient="from-[#3b82f6] to-[#06b6d4]"
            profileData={{
              fullName: user?.firstName ? `Prof. ${user.firstName} ${user.lastName}` : 'Instructor',
              role: 'Instructor',
              department: (user as any)?.department || 'Computer Science',
              email: user?.email || '',
              phone: (user as any)?.phone || '',
              address: (user as any)?.address || '',
              dateOfBirth: (user as any)?.dateOfBirth || '',
              bio: (user as any)?.bio || '',
              interests: (user as any)?.interests || [],
              skills: (user as any)?.skills || [],
            }}
          />
        )}
      </main>

      {/* Modals */}
      {isEditOpen && (
        <StudentEditModal
          open={isEditOpen}
          student={editingStudent}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            if (!activeSectionId) return;
            // Refetch roster after edit
            refetchRoster();
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
