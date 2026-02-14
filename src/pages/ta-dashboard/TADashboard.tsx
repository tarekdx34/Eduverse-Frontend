import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
  LayoutGrid,
  BookOpen,
  Beaker,
  FileText,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  Sidebar,
  Header,
  ModernDashboard,
  CoursesPage,
  LabsPage,
  GradingPage,
  StudentPerformancePage,
  CommunicationPage,
  CreateLabModal,
  LabDetailView,
} from './components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  TA_INFO,
  ASSIGNED_COURSES,
  LABS,
  SUBMISSIONS,
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  UPCOMING_LABS,
  STUDENT_PERFORMANCE,
} from './constants';

type TabKey = 'dashboard' | 'courses' | 'labs' | 'grading' | 'students' | 'communication';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'labs', label: 'Labs', icon: Beaker },
  { key: 'grading', label: 'Grading', icon: FileText },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'communication', label: 'Communication', icon: MessageCircle },
];

function TADashboardContent() {
  const navigate = useNavigate();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [createLabModalOpen, setCreateLabModalOpen] = useState(false);
  const [labs, setLabs] = useState(LABS);
  const [submissions, setSubmissions] = useState(() => Object.values(SUBMISSIONS).flat());
  const [messages, setMessages] = useState([
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
  ]);
  const [questions, setQuestions] = useState([
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
  ]);

  const { isRTL } = useLanguage();
  const { isDark } = useTheme();

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };
  const handleAnswerQuestion = (questionId: string, answer?: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, status: 'answered' as const, answer: answer ?? 'Answered' } : q
      )
    );
    toast.success('Question answered');
  };
  const handleFlagQuestion = (questionId: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, status: 'flagged' as const } : q)));
    toast.success('Question flagged for instructor');
  };
  const handleNewMessage = (subject: string, message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        from: TA_INFO.name,
        subject,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]);
    toast.success('Message sent');
  };

  const handleAddLab = (data: import('./components/CreateLabModal').NewLabData) => {
    const newLab = {
      id: `lab-${Date.now()}`,
      courseId: data.courseId,
      courseName: data.courseName,
      labNumber: data.labNumber,
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location,
      status: data.status,
      instructions: data.instructions,
      materials: [],
      submissionCount: 0,
      gradedCount: 0,
      attendanceCount: 0,
    };
    setLabs((prev) => [...prev, newLab]);
    setCreateLabModalOpen(false);
    toast.success('Lab created');
  };

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

  const handleUpdateSubmission = (submissionId: string, grade: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, grade, feedback, status: 'graded' as const } : s
      )
    );
    toast.success('Grade saved');
  };

  return (
    <div
      className={`flex min-h-screen ${isRTL ? 'flex-row-reverse' : ''} ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar - Collapsible */}
      <div
        className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <Sidebar
          tabs={TABS}
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          onLogout={() => navigate('/login')}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          sidebarOpen ? (isRTL ? 'mr-56' : 'ml-56') + ' flex-1' : (isRTL ? 'mr-0' : 'ml-0') + ' w-full'
        }`}
      >
        {/* Header bar */}
        <div
          className={`border-b flex items-center justify-between ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className={`p-4 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <svg
                className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1" />
          <Header ta={TA_INFO} />
        </div>

        {/* Content Area */}
        <main
          className={`flex-1 p-6 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
        >
          {activeTab === 'dashboard' && (
            <ModernDashboard
              stats={DASHBOARD_STATS}
              courses={ASSIGNED_COURSES}
              upcomingLabs={UPCOMING_LABS}
              recentActivity={RECENT_ACTIVITY}
              onNavigate={handleTabChange}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesPage courses={ASSIGNED_COURSES} onViewCourse={handleViewCourse} />
          )}

          {activeTab === 'labs' && (
            selectedLabId ? (() => {
              const lab = labs.find((l) => l.id === selectedLabId);
              const labSubmissions = submissions.filter((s: any) => s.labId === selectedLabId);
              return lab ? (
                <LabDetailView
                  lab={lab}
                  submissions={labSubmissions}
                  onBack={() => setSelectedLabId(null)}
                  onGrade={handleGrade}
                />
              ) : (
                <LabsPage
                  labs={selectedCourseId ? labs.filter((l) => l.courseId === selectedCourseId) : labs}
                  onViewLab={handleViewLab}
                  onOpenCreateLab={() => setCreateLabModalOpen(true)}
                />
              );
            })() : (
              <LabsPage
                labs={selectedCourseId ? labs.filter((l) => l.courseId === selectedCourseId) : labs}
                onViewLab={handleViewLab}
                onOpenCreateLab={() => setCreateLabModalOpen(true)}
              />
            )
          )}

          {activeTab === 'grading' && (
            <GradingPage
              submissions={submissions}
              onGrade={handleGrade}
              onUpdateSubmission={handleUpdateSubmission}
            />
          )}

          {activeTab === 'students' && (
            <StudentPerformancePage students={STUDENT_PERFORMANCE} />
          )}

          {activeTab === 'communication' && (
            <CommunicationPage
              messages={messages}
              questions={questions}
              onMarkAsRead={handleMarkAsRead}
              onAnswerQuestion={handleAnswerQuestion}
              onFlagQuestion={handleFlagQuestion}
              onNewMessage={handleNewMessage}
            />
          )}
        </main>
      </div>
      {createLabModalOpen && (
        <CreateLabModal
          onClose={() => setCreateLabModalOpen(false)}
          onCreate={handleAddLab}
          courseOptions={ASSIGNED_COURSES.map((c) => ({ id: c.id, name: c.name }))}
        />
      )}
      <Toaster position={isRTL ? 'top-left' : 'top-right'} richColors />
    </div>
  );
}

export default function TADashboard() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TADashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
