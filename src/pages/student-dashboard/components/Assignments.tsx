import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Circle,
  Filter,
  TrendingUp,
  Award,
  Target,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Loader2,
  Check,
  X as XIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AssignmentDetails from './AssignmentDetails';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomDropdown } from '../../../components/shared';
import { useApi } from '../../../hooks/useApi';
import {
  AssignmentService,
  Assignment as ApiAssignment,
  AssignmentSubmission,
} from '../../../services/api/assignmentService';

const ASSIGNMENT_COLORS = [
  { color: 'bg-orange-500', colorLight: 'bg-orange-50', colorBorder: 'border-orange-500' },
  { color: 'bg-blue-500', colorLight: 'bg-blue-50', colorBorder: 'border-blue-500' },
  { color: 'bg-pink-500', colorLight: 'bg-pink-50', colorBorder: 'border-pink-500' },
  { color: 'bg-green-500', colorLight: 'bg-green-50', colorBorder: 'border-green-500' },
  { color: 'bg-purple-500', colorLight: 'bg-purple-50', colorBorder: 'border-purple-500' },
  { color: 'bg-amber-500', colorLight: 'bg-amber-50', colorBorder: 'border-amber-500' },
];

export const defaultAssignments = [
  {
    id: 1,
    title: 'Database Design Project',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    type: 'Project',
    dueDate: '2025-12-10',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Design and implement a relational database for a library management system',
    points: 100,
    submittedPoints: null,
    progress: 45,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50',
    colorBorder: 'border-orange-500',
  },
  {
    id: 2,
    title: 'Mobile App Prototype',
    course: 'Mobile Application Development',
    courseCode: 'CS350',
    type: 'Project',
    dueDate: '2025-12-08',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    description: 'Create a functional prototype of a mobile application using React Native',
    points: 150,
    submittedPoints: null,
    progress: 60,
    color: 'bg-[var(--accent-color)]/100',
    colorLight: 'bg-[var(--accent-color)]/10',
    colorBorder: 'border-[var(--accent-color)]',
  },
  {
    id: 3,
    title: 'Algorithm Analysis Report',
    course: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    type: 'Report',
    dueDate: '2025-12-06',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Analyze time and space complexity of sorting algorithms',
    points: 50,
    submittedPoints: null,
    progress: 75,
    color: 'bg-blue-500',
    colorLight: 'bg-blue-50',
    colorBorder: 'border-blue-500',
  },
  {
    id: 4,
    title: 'Software Requirements Document',
    course: 'Software Engineering Principles',
    courseCode: 'CS305',
    type: 'Documentation',
    dueDate: '2025-12-05',
    dueTime: '11:59 PM',
    status: 'in-progress',
    priority: 'medium',
    description: 'Write comprehensive software requirements specification',
    points: 75,
    submittedPoints: null,
    progress: 90,
    color: 'bg-pink-500',
    colorLight: 'bg-pink-50',
    colorBorder: 'border-pink-500',
  },
  {
    id: 5,
    title: 'Web Portfolio Project',
    course: 'Web Development Fundamentals',
    courseCode: 'CS150',
    type: 'Project',
    dueDate: '2025-11-30',
    dueTime: '11:59 PM',
    status: 'submitted',
    priority: 'low',
    description: 'Build a personal portfolio website using HTML, CSS, and JavaScript',
    points: 100,
    submittedPoints: 95,
    progress: 100,
    color: 'bg-green-500',
    colorLight: 'bg-green-50',
    colorBorder: 'border-green-500',
  },
  {
    id: 6,
    title: 'Unit Testing Assignment',
    course: 'Software Engineering Principles',
    courseCode: 'CS305',
    type: 'Assignment',
    dueDate: '2025-11-28',
    dueTime: '11:59 PM',
    status: 'graded',
    priority: 'low',
    description: 'Write comprehensive unit tests for the provided codebase',
    points: 50,
    submittedPoints: 48,
    progress: 100,
    color: 'bg-pink-500',
    colorLight: 'bg-pink-50',
    colorBorder: 'border-pink-500',
  },
  {
    id: 7,
    title: 'SQL Query Exercises',
    course: 'Database Management Systems',
    courseCode: 'CS220',
    type: 'Exercise',
    dueDate: '2025-11-25',
    dueTime: '11:59 PM',
    status: 'graded',
    priority: 'low',
    description: 'Complete advanced SQL query exercises covering joins and subqueries',
    points: 30,
    submittedPoints: 30,
    progress: 100,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50',
    colorBorder: 'border-orange-500',
  },
];

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date('2025-12-04');
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'in-progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'graded':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-background-light text-slate-700 border-slate-100';
  }
};

const getStatusIcon = (status: string, submissionStatus?: string) => {
  // Use submission status if available for pending assignments
  const effectiveStatus = submissionStatus && status === 'pending' ? submissionStatus : status;

  switch (effectiveStatus) {
    case 'pending':
    case 'not-submitted':
      return <Circle className="w-3 h-3" />;
    case 'in-progress':
      return <AlertCircle className="w-3 h-3" />;
    case 'submitted':
    case 'graded':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};

export default function Assignments() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [assignmentsWithSubmissions, setAssignmentsWithSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const { data: apiAssignments, loading: apiLoading } = useApi(async () => {
    const assignments = await AssignmentService.getAll();

    // Transform to component format
    return assignments.map((a: ApiAssignment, i: number) => {
      const colors = ASSIGNMENT_COLORS[i % ASSIGNMENT_COLORS.length];
      return {
        id: Number(a.id),
        apiId: a.id,
        title: a.title,
        course: a.course?.name || 'Unknown Course',
        courseCode: a.course?.code || '',
        type: a.submissionType || 'Assignment',
        dueDate: a.dueDate?.split('T')[0] || '',
        dueTime: '11:59 PM',
        status: a.status === 'published' ? 'pending' : a.status,
        priority: 'medium' as const,
        description: a.description || '',
        points: parseFloat(a.maxScore) || 100,
        submittedPoints: null as number | null,
        progress: 0,
        submissionStatus: null as string | null, // Will be populated from API
        ...colors,
      };
    });
  }, []);

  // Fetch submission status for each assignment
  useEffect(() => {
    const loadSubmissionStatuses = async () => {
      if (!apiAssignments || apiAssignments.length === 0) return;

      setIsLoadingSubmissions(true);
      try {
        const assignmentsWithStatus = await Promise.all(
          apiAssignments.map(async (assignment) => {
            try {
              const submission = await AssignmentService.getMySubmission(assignment.apiId);
              return {
                ...assignment,
                submissionStatus: submission?.submissionStatus || 'not-submitted',
                submittedPoints: submission?.score ? parseFloat(submission.score) : null,
              };
            } catch (error) {
              console.error(`Failed to load submission for assignment ${assignment.apiId}:`, error);
              return {
                ...assignment,
                submissionStatus: 'not-submitted',
                submittedPoints: null,
              };
            }
          })
        );
        setAssignmentsWithSubmissions(assignmentsWithStatus);
      } catch (error) {
        console.error('Failed to load submission statuses:', error);
        toast.error('Failed to load submission statuses. Please try again.');
        // Fallback: use assignments without submission status
        setAssignmentsWithSubmissions(apiAssignments);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    loadSubmissionStatuses();
  }, [apiAssignments]);

  const assignments =
    assignmentsWithSubmissions.length > 0 ? assignmentsWithSubmissions : apiAssignments || [];

  const getUrgencyLabel = (daysUntil: number) => {
    if (daysUntil < 0)
      return {
        label: t('overdue'),
        color: 'text-red-600',
        bg: isDark ? 'bg-red-900/50' : 'bg-red-50',
        border: isDark ? 'border-red-700' : 'border-red-500',
      };
    if (daysUntil === 0)
      return {
        label: t('dueToday'),
        color: 'text-red-600',
        bg: isDark ? 'bg-red-900/50' : 'bg-red-50',
        border: isDark ? 'border-red-700' : 'border-red-500',
      };
    if (daysUntil === 1)
      return {
        label: t('dueTomorrow'),
        color: isDark ? 'text-orange-400' : 'text-orange-600',
        bg: isDark ? 'bg-orange-900/50' : 'bg-orange-50',
        border: isDark ? 'border-orange-700' : 'border-orange-500',
      };
    if (daysUntil <= 3)
      return {
        label: `${daysUntil} ${t('daysLeft')}`,
        color: isDark ? 'text-amber-400' : 'text-amber-600',
        bg: isDark ? 'bg-amber-900/50' : 'bg-amber-50',
        border: isDark ? 'border-amber-700' : 'border-amber-500',
      };
    return {
      label: `${daysUntil} ${t('daysLeft')}`,
      color: isDark ? 'text-slate-400' : 'text-slate-600',
      bg: isDark ? 'bg-white/5' : 'bg-background-light',
      border: isDark ? 'border-white/10' : 'border-slate-200',
    };
  };

  const pendingAssignments = assignments.filter(
    (a) => !a.submissionStatus || a.submissionStatus === 'not-submitted'
  );
  const completedAssignments = assignments.filter(
    (a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'graded'
  );
  const submittedAssignments = assignments.filter((a) => a.submissionStatus === 'submitted');
  const gradedAssignments = assignments.filter((a) => a.submissionStatus === 'graded');

  // Apply filter
  let filteredAssignments = assignments;
  if (filterStatus === 'pending') {
    filteredAssignments = pendingAssignments;
  } else if (filterStatus === 'submitted') {
    filteredAssignments = submittedAssignments;
  } else if (filterStatus === 'graded') {
    filteredAssignments = gradedAssignments;
  }

  if (apiLoading || isLoadingSubmissions) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`h-8 w-48 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className={`h-4 w-72 mt-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
          </div>
        </div>

        {/* Skeleton Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`${isDark ? 'bg-white/5' : 'bg-white'} rounded-[2.5rem] p-5 border ${isDark ? 'border-white/10' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                />
                <div className={`h-3 w-20 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              </div>
              <div className={`h-6 w-16 mt-2 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>

        {/* Skeleton Assignment Cards */}
        <div className="space-y-4">
          <div className={`h-6 w-40 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`${isDark ? 'bg-white/5' : 'bg-white'} rounded-[2.5rem] p-6 border ${isDark ? 'border-white/10' : 'border-slate-100'}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                />
                <div className="flex-1">
                  <div className={`h-5 w-3/4 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                  <div
                    className={`h-4 w-1/2 mt-2 rounded ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}
                  />
                  <div className="flex gap-3 mt-4">
                    <div
                      className={`h-8 w-24 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                    />
                    <div
                      className={`h-8 w-20 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedAssignmentId !== null) {
    return (
      <AssignmentDetails
        assignmentId={selectedAssignmentId}
        onBack={() => setSelectedAssignmentId(null)}
      />
    );
  }

  const avgScore = Math.round(
    completedAssignments
      .filter((a) => a.submittedPoints)
      .reduce((sum, a) => sum + (a.submittedPoints! / a.points) * 100, 0) /
      completedAssignments.filter((a) => a.submittedPoints).length
  );

  const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = completedAssignments
    .filter((a) => a.submittedPoints)
    .reduce((sum, a) => sum + a.submittedPoints!, 0);

  const filteredCompleted = completedAssignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeDark = (status: string, submissionStatus?: string) => {
    // Use submission status if available for pending assignments
    const effectiveStatus = submissionStatus && status === 'pending' ? submissionStatus : status;

    switch (effectiveStatus) {
      case 'pending':
      case 'not-submitted':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress':
        return isDark
          ? 'bg-amber-900/50 text-amber-400 border-amber-700'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'submitted':
        return isDark
          ? 'bg-blue-900/50 text-blue-400 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'graded':
        return isDark
          ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return isDark
          ? 'bg-white/5 text-slate-500 border-white/10'
          : 'bg-background-light text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('stayOnTop')}
          </h1>
          <p className={`text-slate-500 mt-1 font-medium`}>
            Track your progress, manage deadlines, and achieve your academic goals
          </p>
        </div>
      </div>

      {/* Active Assignments */}
      <div
        className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <div className={`p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('activeAssignments')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('trackManageWork')}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm transition-all ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              {showFilterDropdown && (
                <div
                  className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${isDark ? 'bg-card-dark border border-white/10' : 'bg-white border border-slate-200'}`}
                >
                  <div className="p-2">
                    {['all', 'pending', 'submitted', 'graded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                          filterStatus === status
                            ? isDark
                              ? 'bg-white/10 text-white'
                              : 'bg-blue-50 text-blue-700'
                            : isDark
                              ? 'text-slate-300 hover:bg-white/5'
                              : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {filterStatus === status && <Check className="w-4 h-4" />}
                        <span className="capitalize">
                          {status === 'all' ? 'All Assignments' : status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <CheckCircle
                  className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                />
              </div>
              <h3 className={`mb-2 font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {filterStatus === 'all' ? t('allCaughtUp') : `No ${filterStatus} assignments`}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {filterStatus === 'all'
                  ? t('noPendingAssignments')
                  : `You don't have any ${filterStatus} assignments right now.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAssignments.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                const urgency = getUrgencyLabel(daysUntil);

                return (
                  <div
                    key={assignment.id}
                    className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group ${
                      daysUntil <= 2
                        ? isDark
                          ? 'border-red-800 bg-red-900/20'
                          : 'border-red-200 bg-red-50/30'
                        : isDark
                          ? 'border-white/5 hover:border-[var(--accent-color)]'
                          : 'border-slate-100 hover:border-[var(--accent-color)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3
                            className={`group-hover:text-[var(--accent-color)] transition-colors text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs ${getStatusBadgeDark(assignment.status, assignment.submissionStatus)}`}
                          >
                            {getStatusIcon(assignment.status, assignment.submissionStatus)}
                            <span className="capitalize">
                              {assignment.submissionStatus === 'not-submitted'
                                ? t('notSubmitted')
                                : assignment.submissionStatus === 'submitted'
                                  ? t('submitted')
                                  : assignment.submissionStatus === 'graded'
                                    ? t('graded')
                                    : assignment.status === 'in-progress'
                                      ? t('inProgress')
                                      : t('pending')}
                            </span>
                          </span>
                        </div>
                        <p
                          className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          {assignment.description}
                        </p>
                        <div
                          className={`flex items-center gap-2 text-xs flex-wrap mb-3 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${assignment.color}`}></span>
                            <span
                              className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                              {assignment.courseCode}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-50 text-slate-700 border-slate-100'}`}
                          >
                            {assignment.type}
                          </span>
                          {assignment.priority === 'high' && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200'}`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${urgency.bg} ${urgency.color} ${urgency.border}`}
                          >
                            <Clock className="w-3 h-3" />
                            {urgency.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 rounded-xl p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('dueDate')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {assignment.dueTime}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('timeLeft')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${daysUntil <= 2 ? 'text-red-600' : isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {daysUntil > 0
                            ? `${daysUntil} ${t('days')}`
                            : daysUntil === 0
                              ? t('dueToday')
                              : t('overdue')}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('worth')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {assignment.points} {t('pts')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                        >
                          {t('progress')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${isDark ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'}`}
                        >
                          {assignment.progress}%
                        </span>
                      </div>
                      <div className="relative">
                        <div
                          className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                        >
                          <div
                            className={`${assignment.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className="flex-1 px-3 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                      >
                        <span>
                          {assignment.submissionStatus === 'not-submitted'
                            ? t('submitWork') || 'Submit Work'
                            : assignment.submissionStatus === 'submitted'
                              ? t('viewSubmission') || 'View Submission'
                              : assignment.submissionStatus === 'graded'
                                ? t('viewGrade') || 'View Grade'
                                : t('continueWork') || 'Continue Work'}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        title={t('viewDetails') || 'View Details'}
                        className={`px-3 py-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title={t('download') || 'Download'}
                        className={`px-3 py-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Completed Assignments */}
      <div
        className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <div className={`p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('completedAssignments')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('reviewSubmitted')}
              </p>
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm transition-all ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
              />
              <input
                type="text"
                placeholder={t('searchAssignments')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-slate-100 focus:ring-4 focus:ring-[var(--accent-color)]/10'}`}
              />
            </div>
            <div className="w-48">
              <CustomDropdown
                options={[
                  { value: 'all', label: t('allStatus') },
                  { value: 'submitted', label: t('submitted') },
                  { value: 'graded', label: t('graded') },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                isDark={isDark}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
              <tr>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('assignment')}
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('course')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('type')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('submitted')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('score')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompleted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText
                        className={`w-12 h-12 mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                      />
                      <p className={isDark ? 'text-slate-500' : 'text-slate-600'}>
                        No completed assignments found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompleted.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {assignment.title}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {assignment.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${assignment.color} shadow-sm`}
                        ></span>
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.courseCode}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {assignment.course}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${isDark ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]/50 text-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20 text-[var(--accent-color)]'}`}
                      >
                        {assignment.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                    >
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {assignment.submittedPoints !== null ? (
                        <div>
                          <p
                            className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.submittedPoints}/{assignment.points}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              (assignment.submittedPoints / assignment.points) * 100 >= 90
                                ? 'text-emerald-600'
                                : (assignment.submittedPoints / assignment.points) * 100 >= 80
                                  ? 'text-green-600'
                                  : (assignment.submittedPoints / assignment.points) * 100 >= 70
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                            }`}
                          >
                            {Math.round((assignment.submittedPoints / assignment.points) * 100)}%
                          </p>
                        </div>
                      ) : (
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium ${getStatusBadgeDark(assignment.status)}`}
                      >
                        {getStatusIcon(assignment.status)}
                        <span className="capitalize">{assignment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedAssignmentId(assignment.id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}
                          title="View Details"
                        >
                          <Eye
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                          />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          title="Download"
                        >
                          <Download
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
