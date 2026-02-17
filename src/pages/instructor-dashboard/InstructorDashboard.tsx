import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  Users,
  UserCheck,
  FileText,
  CheckSquare,
  BarChart3,
  Calendar,
  MessageCircle,
  User,
  Brain,
  Beaker,
  ClipboardList,
  CalendarDays,
  Settings,
  MessageSquare,
  MessagesSquare,
} from 'lucide-react';
import {
  StatsCard,
  GradesTable,
  RosterTable,
  WaitlistTable,
  AssignmentsList,
  AttendanceTable,
  ReportsAnalytics,
  MessagesPanel,
  SelectedSectionSummary,
  StudentEditModal,
  AssignmentModal,
  GradeModal,
  AttendanceModal,
  MessageModal,
  ConfirmDialog,
  ProfilePage,
  ModernDashboard,
  CoursesPage,
  LabsPage,
  QuizzesPage,
  SchedulePage,
  AnalyticsPage,
  AIToolsPage,
  CommunicationPage,
  DiscussionPage,
  SettingsPage,
} from './components';
import { AIAttendanceContainer } from './components/ai-features/attendance';
import { MessagingChat, DashboardHeader, DashboardSidebar } from '../../components/shared';
import { DashboardProfileTab } from '../../components/shared/DashboardProfileTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  INSTRUCTOR_INFO,
  SECTIONS,
  COURSES,
  ROSTERS,
  WAITLISTS,
  DASHBOARD_STATS,
  GRADES,
  ASSIGNMENTS,
  ATTENDANCE,
  MESSAGES,
  ANALYTICS,
  INSTRUCTOR_PROFILE,
  UPCOMING_CLASSES,
  PENDING_TASKS,
  RECENT_ACTIVITY,
} from './constants';
import type { AssignmentItem } from './components/AssignmentsList';
import type { GradeEntry } from './components/GradesTable';
import type { AttendanceSession } from './components/AttendanceTable';
import type { Message } from './components/MessagesPanel';
import type { AssignmentFormData } from './components/AssignmentModal';
import type { GradeFormData } from './components/GradeModal';
import type { AttendanceFormData } from './components/AttendanceModal';
import type { MessageFormData } from './components/MessageModal';

type TabKey =
  | 'dashboard'
  | 'courses'
  | 'roster'
  | 'waitlist'
  | 'grades'
  | 'assignments'
  | 'labs'
  | 'quizzes'
  | 'schedule'
  | 'analytics'
  | 'ai-tools'
  | 'attendance'
  | 'communication'
  | 'discussion'
  | 'chat'
  | 'settings'
  | 'profile';

const TABS: { key: TabKey; label: string; labelAr: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutGrid },
  { key: 'courses', label: 'Courses', labelAr: 'المقررات', icon: BookOpen },
  { key: 'roster', label: 'Roster', labelAr: 'قائمة الطلاب', icon: Users },
  { key: 'waitlist', label: 'Waitlist', labelAr: 'قائمة الانتظار', icon: UserCheck },
  { key: 'grades', label: 'Grades', labelAr: 'الدرجات', icon: FileText },
  { key: 'assignments', label: 'Assignments', labelAr: 'الواجبات', icon: CheckSquare },
  { key: 'labs', label: 'Labs', labelAr: 'المعامل', icon: Beaker },
  { key: 'quizzes', label: 'Quizzes', labelAr: 'الاختبارات', icon: ClipboardList },
  { key: 'schedule', label: 'Schedule', labelAr: 'الجدول', icon: CalendarDays },
  { key: 'analytics', label: 'Analytics', labelAr: 'التحليلات', icon: BarChart3 },
  { key: 'ai-tools', label: 'AI Tools', labelAr: 'أدوات الذكاء', icon: Brain },
  { key: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: Calendar },
  { key: 'communication', label: 'Communication', labelAr: 'التواصل', icon: MessageCircle },
  { key: 'discussion', label: 'Discussion', labelAr: 'المناقشات', icon: MessagesSquare },
  { key: 'chat', label: 'Chat', labelAr: 'الدردشة', icon: MessageSquare },
  { key: 'settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User },
];

function InstructorDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<'manual' | 'ai'>('manual');
  const { isDark, toggleTheme } = useTheme();
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

  // State for messages
  const [messagesData, setMessagesData] = useState<Message[]>(MESSAGES);
  const [editingMessage, setEditingMessage] = useState<MessageFormData | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageMode, setMessageMode] = useState<'compose' | 'reply' | 'view'>('compose');
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

  // State for courses
  const [coursesData, setCoursesData] = useState(COURSES);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = (params.tab as TabKey) || 'dashboard';
    if (TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('dashboard');
    }
  }, [params.tab]);

  // Set default section on mount and when entering section-dependent tabs
  useEffect(() => {
    if (
      !activeSectionId &&
      ['roster', 'waitlist', 'grades', 'assignments', 'attendance'].includes(activeTab)
    ) {
      setActiveSectionId(String(SECTIONS[0].sectionId));
    }
  }, [activeTab, activeSectionId]);

  // Navigate on tab change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    // reset section on non section-related tabs
    if (!['roster', 'waitlist', 'grades', 'attendance'].includes(key)) {
      setActiveSectionId(null);
    }
    navigate(`/instructordashboard/${key}`);
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
  const currentWaitlist = activeSectionId ? WAITLISTS[activeSectionId] || [] : [];
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

  // Message handlers
  const handleComposeMessage = () => {
    setEditingMessage(null);
    setMessageMode('compose');
    setIsMessageModalOpen(true);
  };

  const handleReplyMessage = (message: Message) => {
    setEditingMessage(message);
    setMessageMode('reply');
    setIsMessageModalOpen(true);
  };

  const handleViewMessage = (message: Message) => {
    setEditingMessage(message);
    setMessageMode('view');
    setIsMessageModalOpen(true);
  };

  const handleSaveMessage = (data: MessageFormData) => {
    if (data.id) {
      // Edit existing (not used in current implementation)
      const updated = messagesData.map((m) => (m.id === data.id ? { ...data, id: data.id } : m));
      setMessagesData(updated);
    } else {
      // Create new
      const newId = Math.max(...messagesData.map((m) => m.id), 0) + 1;
      const newMessage: Message = { ...data, id: newId };
      setMessagesData([newMessage, ...messagesData]);
    }

    setIsMessageModalOpen(false);
  };

  const handleDeleteMessage = (id: number) => {
    setMessageToDelete(id);
  };

  const confirmDeleteMessage = () => {
    if (!messageToDelete) return;

    const updated = messagesData.filter((m) => m.id !== messageToDelete);
    setMessagesData(updated);
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
    // Navigate to course details or open settings modal
    console.log('View course:', id);
  };

  // Translate tabs based on language
  const translatedTabs = TABS.map(tab => ({
    ...tab,
    label: language === 'ar' ? tab.labelAr : tab.label
  }));

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'bg-background-dark' : 'bg-background-light'} text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Fixed Sidebar */}
      <div className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen`}>
        <DashboardSidebar
          tabs={translatedTabs.map(tab => ({ id: tab.key, label: tab.label, icon: tab.icon }))}
          activeTab={activeTab}
          onTabChange={(key) => handleTabChange(key as TabKey)}
          onLogout={() => navigate('/login')}
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#4F46E5"
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 ${isRTL ? 'mr-64' : 'ml-64'} p-6 lg:p-10`}>
        <DashboardHeader
          userName="Prof. Sarah Martinez"
          userRole="Instructor"
          isDark={isDark}
          isRTL={isRTL}
          accentColor="#4F46E5"
          avatarGradient="from-indigo-500 to-purple-500"
          language={language}
          onToggleTheme={toggleTheme}
          onSetLanguage={setLanguage}
          searchRole="instructor"
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
            />
          )}

          {/* Labs */}
          {activeTab === 'labs' && <LabsPage />}

          {/* Quizzes */}
          {activeTab === 'quizzes' && <QuizzesPage />}

          {/* Schedule */}
          {activeTab === 'schedule' && <SchedulePage />}

          {/* Roster */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Section</label>
                <select
                  className={`border rounded-md px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a section
                  </option>
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <SelectedSectionSummary section={selectedSection as any} />
              <RosterTable
                data={currentRoster}
                onEdit={(student) => {
                  setEditingStudent(student);
                  setIsEditOpen(true);
                }}
                onToggleStatus={(id) => {
                  const updated = currentRoster.map((r) =>
                    r.id === id
                      ? {
                          ...r,
                          status: r.status === 'enrolled' ? 'auditing' : 'enrolled',
                        }
                      : r
                  );
                  setRosterOverrides((prev) => ({
                    ...prev,
                    [String(activeSectionId)]: updated,
                  }));
                }}
              />
            </div>
          )}

          {/* Waitlist */}
          {activeTab === 'waitlist' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Section</label>
                <select
                  className={`border rounded-md px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a section
                  </option>
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <SelectedSectionSummary section={selectedSection as any} />
              <WaitlistTable
                data={currentWaitlist}
                onApprove={(id) => {
                  console.log('Approve student:', id);
                  // Add logic to approve and move to roster
                }}
                onReject={(id) => {
                  console.log('Reject student:', id);
                  // Add logic to reject waitlist request
                }}
              />
            </div>
          )}

          {/* Grades */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Section</label>
                <select
                  className={`border rounded-md px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a section
                  </option>
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <SelectedSectionSummary section={selectedSection as any} />
              <GradesTable
                data={activeSectionId ? gradesData[activeSectionId] || [] : []}
                onEdit={handleEditGrade}
                onDelete={handleDeleteGrade}
              />
            </div>
          )}

          {/* Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Section</label>
                <select
                  className={`border rounded-md px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a section
                  </option>
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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

          {/* Analytics */}
          {activeTab === 'analytics' && <AnalyticsPage />}

          {/* AI Tools */}
          {activeTab === 'ai-tools' && <AIToolsPage />}

          {/* Attendance */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Section</label>
                <select
                  className={`border rounded-md px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={activeSectionId || String(SECTIONS[0].sectionId)}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a section
                  </option>
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <SelectedSectionSummary section={selectedSection as any} />

              {/* AI Attendance Hero Section */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">AI-Powered Attendance</h3>
                        <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                          NEW
                        </span>
                      </div>
                      <p className="text-indigo-100 text-sm mt-0.5">
                        Upload a class photo to automatically detect and mark attendance
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttendanceMode('ai')}
                    className="px-5 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm"
                  >
                    Try AI Attendance →
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {attendanceMode === 'ai' ? (
                <div className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Attendance</h3>
                    <button
                      onClick={() => setAttendanceMode('manual')}
                      className={`text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ← Back to Manual Attendance
                    </button>
                  </div>
                  <AIAttendanceContainer
                    courseSection={selectedSection?.courseCode || 'Unknown Section'}
                  />
                </div>
              ) : (
                <div className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manual Attendance</h3>
                  <AttendanceTable
                    sessions={activeSectionId ? attendanceData[activeSectionId] || [] : []}
                    onCreate={handleCreateAttendance}
                    onEdit={handleEditAttendance}
                    onDelete={handleDeleteAttendance}
                  />
                </div>
              )}
            </div>
          )}

          {/* Communication */}
          {activeTab === 'communication' && <CommunicationPage />}

          {/* Discussion */}
          {activeTab === 'discussion' && <DiscussionPage />}

          {/* Chat */}
          {activeTab === 'chat' && (
            <MessagingChat
              height="calc(100vh - 160px)"
              currentUserName="Dr. Jane Smith"
              showVideoCall={true}
              showVoiceCall={true}
            />
          )}

          {/* Settings */}
          {activeTab === 'settings' && <SettingsPage />}

          {/* Profile */}
          {activeTab === 'profile' && (
            <DashboardProfileTab
              isDark={isDark}
              accentColor="#4F46E5"
              bannerGradient="from-indigo-500 to-purple-500"
              profileData={{
                fullName: 'Prof. Sarah Martinez',
                role: 'Instructor',
                department: 'Computer Science',
                email: 'sarah.martinez@university.edu',
                phone: '+1 (555) 234-5678',
                address: 'Building A, Room 302',
                dateOfBirth: '1985-03-22',
                bio: 'Associate Professor of Computer Science with 12+ years of experience in teaching and research. Specializing in artificial intelligence, machine learning, and software engineering.',
                office: 'Room A-302',
                officeHours: 'Mon & Wed 2:00 PM - 4:00 PM',
                specialization: ['Artificial Intelligence', 'Machine Learning', 'Software Engineering', 'Data Mining', 'Neural Networks'],
                skills: ['Python', 'TensorFlow', 'PyTorch', 'R', 'MATLAB', 'Java'],
                badges: [
                  { name: 'Top Educator', description: '4.8+ rating', icon: 'school', color: '#4F46E5', unlocked: true },
                  { name: 'Researcher', description: '20+ papers', icon: 'science', color: '#3B82F6', unlocked: true },
                  { name: 'Mentor', description: '50+ students', icon: 'volunteer_activism', color: '#10B981', unlocked: true },
                  { name: 'Innovator', description: '5 patents', icon: 'lightbulb', color: '#F59E0B', unlocked: true },
                  { name: 'Speaker', description: '10+ talks', icon: 'campaign', color: '#EC4899', unlocked: true },
                  { name: 'Author', description: 'Published book', icon: 'menu_book', color: '#6366F1', unlocked: false },
                ],
                achievements: [
                  { title: 'Excellence in Teaching Award', description: 'Academic Year 2023', emoji: '🏆' },
                  { title: 'Best Research Paper', description: 'IEEE Conference 2023', emoji: '📄' },
                  { title: 'Faculty Innovation Grant', description: 'Spring 2024', emoji: '💡' },
                ],
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
