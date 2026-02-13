import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from './components';
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

function TADashboard() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
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
    // Filter labs by course in LabsPage
  };

  const handleViewLab = (labId: string) => {
    setSelectedLabId(labId);
    // Could navigate to lab detail view
  };

  const handleGrade = (submissionId: string) => {
    // Navigate to grading page or open grading modal
    handleTabChange('grading');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar tabs={TABS} activeTab={activeTab} onChangeTab={handleTabChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title="Teaching Assistant Dashboard" ta={TA_INFO} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <CommunicationPage messages={mockMessages} questions={mockQuestions} />
          )}
        </main>
      </div>
    </div>
  );
}

export default TADashboard;
