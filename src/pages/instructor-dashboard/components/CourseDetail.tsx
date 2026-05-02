import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CourseService, getCourseMaterialPreviewUrl } from '../../../services/api/courseService';
import {
  AssignmentService,
  Assignment,
  type AssignmentStatus as ApiAssignmentStatus,
} from '../../../services/api/assignmentService';
import { EnrollmentService } from '../../../services/api/enrollmentService';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  BookOpen,
  MessageSquare,
  Sparkles,
  Video,
  Download,
  CheckCircle,
  Bell,
  Plus,
  Loader2,
  Settings,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FileUploadDropzone, AutoGradingSystem, Submission } from '../../../components/shared';
import { RosterTable } from './RosterTable';
import { AssignmentModal, AssignmentFormData } from './AssignmentModal';
import { CleanSelect } from '../../../components/shared';
import { useApi } from '../../../hooks/useApi';
import { courseService } from '../../../services/api/courseService';
import { toast } from 'sonner';

type Course = {
  id: number;
  courseId?: number;
  courseCode: string;
  courseName: string;
  semester: string;
  credits: number;
  prerequisites: string[];
  description: string;
  enrolled: number;
  capacity: number;
  schedule: string;
  room: string;
  status: 'active' | 'archived';
  averageGrade: number;
  attendanceRate: number;
};

type CourseDetailProps = {
  courseId: number;
  onBack: () => void;
  courses: Course[];
  isMockMode?: boolean;
  coursesLoading?: boolean;
};

export function CourseDetail({
  courseId,
  onBack,
  courses,
  isMockMode = false,
  coursesLoading = false,
}: CourseDetailProps) {
  const navigate = useNavigate();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData | null>(null);
  const [editingAssignmentIndex, setEditingAssignmentIndex] = useState<number | null>(null);
  const [gradingSubTab, setGradingSubTab] = useState<'manual' | 'auto'>('manual');
  const [uploadingInstructionId, setUploadingInstructionId] = useState<number | null>(null);

  const { data: sectionSchedules, loading: schedulesLoading } = useApi(async () => {
    try {
      return await courseService.getSectionSchedules(String(courseId));
    } catch (error) {
      console.error('Failed to fetch section schedules', error);
      throw error;
    }
  }, [courseId]);

  // Get actual course data (URL may be section id or catalog course id)
  const course = courses.find(
    (c) => String(c.id) === String(courseId) || String(c.courseId ?? '') === String(courseId),
  );
  const resolvedCourseId = Number(course?.courseId ?? course?.id ?? courseId);

  const queryClient = useQueryClient();
  const { data: apiCourseMaterials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['course-materials', resolvedCourseId],
    queryFn: () => CourseService.getMaterials(resolvedCourseId),
    enabled: !!course?.id && !isMockMode,
  });

  const { data: assignmentsResponse, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['course-assignments', resolvedCourseId],
    queryFn: () => AssignmentService.getAll({ courseId: String(resolvedCourseId) }),
    enabled: !!course?.id && !isMockMode,
  });
  const apiCourseAssignments = Array.isArray(assignmentsResponse?.data)
    ? assignmentsResponse.data
    : Array.isArray(assignmentsResponse)
      ? assignmentsResponse
      : [];

  const [mockCourseMaterials, setMockCourseMaterials] = useState<any[]>([
    {
      id: `mock-mat-${courseId}-1`,
      title: `${course?.courseCode || 'Course'} Intro Slides`,
      weekNumber: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: `mock-mat-${courseId}-2`,
      title: `${course?.courseCode || 'Course'} Week 2 Notes`,
      weekNumber: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [mockAssignments, setMockAssignments] = useState<any[]>([
    {
      id: `mock-assignment-${courseId}-1`,
      title: 'Assignment 1 - Fundamentals',
      description: 'Solve the core problems from weeks 1-2.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
    },
    {
      id: `mock-assignment-${courseId}-2`,
      title: 'Assignment 2 - Practice Set',
      description: 'Apply lecture concepts to a practical case.',
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
    },
  ]);

  const courseMaterials = isMockMode ? mockCourseMaterials : apiCourseMaterials;
  const courseAssignments = isMockMode ? mockAssignments : apiCourseAssignments;

  const upcomingDeadlines = courseAssignments
    .filter((a: any) => a.dueDate && new Date(a.dueDate) > new Date())
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const createAssignmentMutation = useMutation({
    mutationFn: (newAssignment: any) => AssignmentService.create(newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', resolvedCourseId] });
      setShowAssignmentForm(false);
      setAssignmentForm(null);
      setEditingAssignmentIndex(null);
      toast.success('Assignment created successfully');
    },
    onError: () => toast.error('Failed to create assignment'),
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => AssignmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', resolvedCourseId] });
      setShowAssignmentForm(false);
      setAssignmentForm(null);
      setEditingAssignmentIndex(null);
      toast.success('Assignment updated successfully');
    },
    onError: () => toast.error('Failed to update assignment'),
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => AssignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', resolvedCourseId] });
      toast.success('Assignment deleted successfully');
    },
    onError: () => toast.error('Failed to delete assignment'),
  });

  const uploadInstructionMutation = useMutation({
    mutationFn: ({
      assignmentId,
      file,
      title,
    }: {
      assignmentId: string;
      file: File;
      title: string;
    }) => AssignmentService.uploadInstructions(assignmentId, file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', resolvedCourseId] });
      toast.success('Instructions uploaded successfully');
    },
    onError: () => toast.error('Failed to upload instructions'),
  });

  const { data: sectionStudents = [] } = useQuery({
    queryKey: ['section-students', course?.id],
    queryFn: () => EnrollmentService.getSectionStudents(course!.id),
    enabled: !!course?.id && !isMockMode,
  });

  const { data: recentActivity = [], isLoading: isLoadingRecentActivity } = useQuery({
    queryKey: ['course-recent-activity', resolvedCourseId],
    queryFn: () => CourseService.getRecentActivity(resolvedCourseId, 6),
    enabled: !!course?.id && !isMockMode,
  });

  const getPrimaryBadgeStyle = (colorClass: string): React.CSSProperties | undefined => {
    if (colorClass) return undefined;
    return {
      backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
      color: primaryHex,
    };
  };

  // Derive lecture weeks from actual uploaded materials only
  const dynamicWeeks = Array.from(new Set(courseMaterials.map((m: any) => m.weekNumber || 1))).sort(
    (a: any, b: any) => a - b
  );

  const tabs = [
    { id: 'overview', label: t('dashboard'), icon: BookOpen },
    { id: 'lectures', label: t('lectures'), icon: Video },
    { id: 'assignments', label: t('assignments'), icon: FileText },
    { id: 'grading', label: t('grading'), icon: CheckCircle },
    { id: 'students', label: t('students'), icon: Users },
  ];

  const [selectedAssignmentIdForGrading, setSelectedAssignmentIdForGrading] = useState<
    string | null
  >(null);
  const [draftGrades, setDraftGrades] = useState<Record<number, string>>({});

  const { data: assignmentSubmissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignmentIdForGrading],
    queryFn: () => AssignmentService.getSubmissions(selectedAssignmentIdForGrading!),
    enabled: !!selectedAssignmentIdForGrading && !isMockMode,
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({
      assignmentId,
      submissionId,
      grade,
    }: {
      assignmentId: string;
      submissionId: number;
      grade: number;
    }) => AssignmentService.gradeSubmission(assignmentId, submissionId, { score: grade }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignment-submissions', selectedAssignmentIdForGrading],
      });
      setDraftGrades({});
      toast.success('Submission graded successfully');
    },
    onError: () => toast.error('Failed to save grade'),
  });

  if (!course && coursesLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="animate-spin" size={36} style={{ color: primaryHex }} aria-hidden />
        <div className="w-full max-w-md space-y-3">
          <div className={`h-6 w-2/3 max-w-[280px] rounded animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-full rounded animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-2/3 rounded animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            {t('courseNotFound')}
          </h2>
          <button onClick={onBack} className="font-medium" style={{ color: primaryHex }}>
            {t('backToCourses')}
          </button>
        </div>
      </div>
    );
  }

  const handleInlineGrade = (submissionId: number, newGrade: string) => {
    setDraftGrades((prev) => ({ ...prev, [submissionId]: newGrade }));
  };

  const saveInlineGrade = (submissionId: number) => {
    const grade = parseFloat(draftGrades[submissionId]);
    if (!isNaN(grade) && selectedAssignmentIdForGrading) {
      gradeSubmissionMutation.mutate({
        assignmentId: selectedAssignmentIdForGrading,
        submissionId,
        grade,
      });
    }
  };

  const studentsForRoster = isMockMode
    ? Array.from({ length: Math.max(course.enrolled || 0, 0) }, (_, index) => ({
        id: index + 1,
        firstName: `Student`,
        lastName: `${index + 1}`,
        email: `student${index + 1}@eduverse.local`,
        userId: index + 1,
      }))
    : sectionStudents;

  const handleSaveAssignment = (data: AssignmentFormData) => {
    if (isMockMode) {
      const normalizedStatus = data.status === 'open' ? 'published' : data.status;
      if (editingAssignmentIndex !== null) {
        setMockAssignments((prev) =>
          prev.map((item, idx) =>
            idx === editingAssignmentIndex
              ? {
                  ...item,
                  title: data.title,
                  description: data.description || '',
                  dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : item.dueDate,
                  status: normalizedStatus,
                }
              : item
          )
        );
        toast.success('Mock assignment updated');
      } else {
        setMockAssignments((prev) => [
          {
            id: `mock-assignment-${courseId}-${Date.now()}`,
            title: data.title,
            description: data.description || '',
            dueDate: data.dueDate
              ? new Date(data.dueDate).toISOString()
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: normalizedStatus,
          },
          ...prev,
        ]);
        toast.success('Mock assignment created');
      }
      setShowAssignmentForm(false);
      setAssignmentForm(null);
      setEditingAssignmentIndex(null);
      return;
    }

    const formattedDueDate = data.dueDate
      ? new Date(data.dueDate).toISOString()
      : new Date().toISOString();
    const toApiStatus = (uiStatus: AssignmentFormData['status']): ApiAssignmentStatus => {
      if (uiStatus === 'open') return 'published';
      if (uiStatus === 'closed') return 'closed';
      return 'draft';
    };

    const payload = {
      title: data.title,
      description: data.description || '',
      instructions: data.description || '',
      dueDate: formattedDueDate,
      status: toApiStatus(data.status),
      courseId: resolvedCourseId,
      maxScore: 100,
      submissionType: 'file',
    };

    if (editingAssignmentIndex !== null) {
      const assignmentToEdit = courseAssignments[editingAssignmentIndex];
      updateAssignmentMutation.mutate({ id: String(assignmentToEdit.id), data: payload });
    } else {
      createAssignmentMutation.mutate(payload);
    }
  };

  const handleEditAssignment = (index: number) => {
    const assignment = courseAssignments[index];
    const normalizedStatus = String(assignment.status || 'draft').toLowerCase();
    const uiStatus: AssignmentFormData['status'] =
      normalizedStatus === 'published'
        ? 'open'
        : normalizedStatus === 'closed' || normalizedStatus === 'archived'
          ? 'closed'
          : 'draft';
    let dueDateValue = '';
    try {
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        if (!isNaN(date.getTime())) {
          dueDateValue = date.toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }

    setAssignmentForm({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: dueDateValue,
      status: uiStatus,
      submissions: 0,
      assignmentType: 'assignment',
    });
    setEditingAssignmentIndex(index);
    setShowAssignmentForm(true);
  };

  const handlePublishAssignment = (index: number) => {
    if (isMockMode) {
      setMockAssignments((prev) =>
        prev.map((assignment, idx) =>
          idx === index ? { ...assignment, status: 'published' } : assignment
        )
      );
      toast.success('Mock assignment published');
      return;
    }

    const assignment = courseAssignments[index];
    AssignmentService.updateStatus(String(assignment.id), 'published')
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['course-assignments', resolvedCourseId] });
        toast.success('Assignment published successfully');
      })
      .catch((error) => {
        console.error('Failed to publish assignment', error);
        toast.error('Failed to publish assignment');
      });
  };

  const handleDeleteAssignment = (id: number | string) => {
    if (!window.confirm('Delete this assignment? This action cannot be undone.')) return;
    if (isMockMode) {
      setMockAssignments((prev) =>
        prev.filter((assignment) => String(assignment.id) !== String(id))
      );
      toast.success('Mock assignment deleted');
      return;
    }
    deleteAssignmentMutation.mutate(String(id));
  };

  const handleUploadInstruction = (assignmentId: number, file: File | null) => {
    if (!file) return;
    if (isMockMode) {
      toast.success('Mock instruction file attached');
      return;
    }
    setUploadingInstructionId(assignmentId);
    uploadInstructionMutation.mutate(
      { assignmentId: String(assignmentId), file, title: file.name },
      {
        onSettled: () => {
          setUploadingInstructionId(null);
        },
      }
    );
  };

  return (
    <div>
      <div className="w-full pb-4">
        <div
          className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          {/* Course Title */}
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={onBack}
                className={`p-2 self-start ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
              </button>
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}
                >
                  {course.courseName}
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Manage lectures, assignments, materials, students, and announcements.
                </p>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className={`px-2 sm:px-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div
              className="flex items-center gap-2 sm:gap-4 -mb-px overflow-x-auto pb-px"
              style={{ width: '100%' }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? ''
                        : `border-transparent ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                    }`}
                    style={isActive ? { color: primaryHex, borderColor: primaryHex } : undefined}
                  >
                    <tab.icon size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Summary */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('courseDetails')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-1`}>
                      Students
                    </div>
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {course.enrolled}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-1`}>
                      Average Grade
                    </div>
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {course.averageGrade}%
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-1`}>
                      Engagement
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {course.attendanceRate}%
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2`}>
                      Section Schedule
                    </div>
                    {schedulesLoading ? (
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Loading schedule...
                      </div>
                    ) : sectionSchedules && sectionSchedules.length > 0 ? (
                      <div className="space-y-2">
                        {sectionSchedules.slice(0, 3).map((schedule) => {
                          const dayLabel =
                            schedule.dayOfWeek.charAt(0).toUpperCase() +
                            schedule.dayOfWeek.slice(1);
                          const formatTime = (value: string) => {
                            const [hourRaw, minute] = value.split(':');
                            const hourNumber = Number(hourRaw);
                            const period = hourNumber >= 12 ? 'PM' : 'AM';
                            const hour = hourNumber % 12 || 12;
                            return `${hour}:${minute} ${period}`;
                          };
                          const location = schedule.building
                            ? `${schedule.room}, ${schedule.building}`
                            : schedule.room;

                          return (
                            <div key={schedule.id} className="text-sm">
                              <div className={isDark ? 'text-white' : 'text-gray-900'}>
                                {dayLabel} • {formatTime(schedule.startTime)} -{' '}
                                {formatTime(schedule.endTime)}
                              </div>
                              <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                {location} •
                                <span
                                  className="ml-1 px-2 py-0.5 rounded-full text-xs capitalize"
                                  style={getPrimaryBadgeStyle('')}
                                >
                                  {schedule.scheduleType}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        No schedule available.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryHex}1A` }}>
                    <Calendar style={{ color: primaryHex }} size={20} />
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('upcomingDeadlines')}
                  </h3>
                </div>

                <div className="space-y-3">
                  {isLoadingAssignments ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={`upcoming-skeleton-${idx}`}
                        className={`p-3 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div
                          className={`h-3.5 w-2/3 rounded animate-pulse ${
                            isDark ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                        />
                        <div
                          className={`h-3 w-1/3 rounded mt-2 animate-pulse ${
                            isDark ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    ))
                  ) : upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className={`flex items-center justify-between p-3 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                      >
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.title}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      No upcoming deadlines
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('aiInsights')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                    Students struggled with {course.courseName.split(' ')[0]} concepts last week.
                  </div>
                  <div
                    className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}
                  >
                    Engagement improved by 5%
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    <Sparkles size={16} />
                    Generate Teaching Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm mt-6`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                {t('recentActivity')}
              </h3>
              <div className="space-y-3">
                {isLoadingRecentActivity ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`activity-skeleton-${idx}`}
                      className={`p-3 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div
                        className={`h-3.5 w-1/2 rounded animate-pulse ${
                          isDark ? 'bg-white/10' : 'bg-gray-200'
                        }`}
                      />
                      <div
                        className={`h-3 w-5/6 rounded mt-2 animate-pulse ${
                          isDark ? 'bg-white/10' : 'bg-gray-200'
                        }`}
                      />
                      <div
                        className={`h-3 w-1/4 rounded mt-2 animate-pulse ${
                          isDark ? 'bg-white/10' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((item: any, idx: number) => (
                    <div
                      key={`${item.type}-${item.occurredAt}-${idx}`}
                      className={`flex items-start justify-between gap-3 p-3 rounded-lg ${
                        isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.title}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                      </div>
                      <span className={`text-xs shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        {new Date(item.occurredAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    No recent activity found.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Lecture Materials
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/instructordashboard/materials/${resolvedCourseId}`)}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                  style={{ backgroundColor: primaryHex }}
                >
                  <Settings size={16} />
                  Manage Materials
                </button>
              </div>
            </div>

            {courseMaterials.length === 0 ? (
              <div
                className={`rounded-xl border p-10 text-center flex flex-col items-center justify-center min-h-[min(50vh,24rem)] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <Video
                  size={48}
                  className={`mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  aria-hidden
                />
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  No lecture materials yet
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-md`}>
                  Manage and upload materials from the Materials page for this course.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dynamicWeeks.map((week) => {
                  const weekMaterials = courseMaterials.filter(
                    (m: any) => m.weekNumber === week || (!m.weekNumber && week === 1)
                  );

                  return (
                    <div
                      key={week}
                      className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
                    >
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Week {week}
                      </h3>
                      <div className="space-y-2">
                        {weekMaterials.map((material: any) => (
                          <div
                            key={material.materialId || material.id}
                            className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border-transparent' : 'bg-white border text-gray-700'} text-sm`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} style={{ color: primaryHex }} />
                                <span className={`truncate ${isDark ? 'text-slate-200' : ''}`}>
                                  {material.title}
                                </span>
                              </div>
                              <span className={`text-xs shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {material.createdAt
                                  ? new Date(material.createdAt).toLocaleDateString()
                                  : 'Just now'}
                              </span>
                            </div>

                            {(() => {
                              const previewUrl =
                                material.youtubeVideoId
                                  ? `https://www.youtube.com/embed/${material.youtubeVideoId}`
                                  : getCourseMaterialPreviewUrl(material);
                              const isVideoMaterial =
                                material.materialType === 'video' ||
                                Boolean(material.youtubeVideoId) ||
                                Boolean(previewUrl && previewUrl.includes('youtube.com/embed'));
                              if (!isVideoMaterial || !previewUrl) return null;

                              return (
                                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 aspect-video">
                                  <iframe
                                    src={previewUrl}
                                    className="h-full w-full"
                                    allowFullScreen
                                    title={`lecture-preview-${material.materialId || material.id}`}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('assignments')}
              </h2>
              <button
                onClick={() => {
                  setAssignmentForm(null);
                  setEditingAssignmentIndex(null);
                  setShowAssignmentForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                style={{ backgroundColor: primaryHex }}
              >
                <FileText size={16} />
                Create New Assignment
              </button>
            </div>

            {/* Assignment Creation Form */}
            <AssignmentModal
              open={showAssignmentForm}
              assignment={assignmentForm}
              courseOptions={[
                { value: String(course.id), label: `${course.courseCode} - ${course.courseName}` },
              ]}
              onClose={() => setShowAssignmentForm(false)}
              onSave={handleSaveAssignment}
            />

            {/* Assignment Cards */}
            <div className="space-y-4">
              {isLoadingAssignments ? (
                <div
                  className={`rounded-xl border p-10 text-center ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Loading assignments...
                </div>
              ) : courseAssignments.length === 0 ? (
                <div
                  className={`rounded-xl border p-10 text-center flex flex-col items-center justify-center min-h-[min(50vh,24rem)] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                >
                  <FileText
                    size={48}
                    className={`mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    aria-hidden
                  />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    No assignments yet
                  </h3>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-md mb-6`}>
                    Create your first assignment for this course to get started.
                  </p>
                  <button
                    onClick={() => {
                      setAssignmentForm(null);
                      setEditingAssignmentIndex(null);
                      setShowAssignmentForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                    style={{ backgroundColor: primaryHex }}
                  >
                    <Plus size={16} />
                    Create New Assignment
                  </button>
                </div>
              ) : (
                courseAssignments.map((assignment, index) => {
                  const normalizedStatus = String(assignment.status || 'draft').toLowerCase();
                  return (
                    <div
                      key={assignment.id}
                      className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
                    >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {assignment.title}
                          </h3>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={getPrimaryBadgeStyle('')}
                          >
                            {course.courseName}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-3`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {assignment.dueDate
                                ? new Date(assignment.dueDate).toLocaleDateString()
                                : 'No due date'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>0/{course.enrolled} Submitted</span>
                          </div>
                        </div>
                        <p
                          className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-4`}
                        >
                          {assignment.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${normalizedStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {normalizedStatus.toUpperCase()}
                      </span>
                    </div>
                    <div
                      className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <button
                        onClick={() => {
                          setActiveTab('grading');
                          setGradingSubTab('manual');
                          setSelectedAssignmentIdForGrading(String(assignment.id));
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                      >
                        View Submissions
                      </button>
                      <button
                        onClick={() => handleEditAssignment(index)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'} rounded-lg transition-colors`}
                      >
                        Delete
                      </button>
                      <label
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors cursor-pointer`}
                      >
                        {uploadingInstructionId === Number(assignment.id)
                          ? 'Uploading...'
                          : 'Upload Instructions'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            handleUploadInstruction(
                              Number(assignment.id),
                              e.target.files?.[0] || null
                            );
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          setActiveTab('grading');
                          setGradingSubTab('manual');
                          setSelectedAssignmentIdForGrading(String(assignment.id));
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                      >
                        Grade Manually
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('grading');
                          setGradingSubTab('auto');
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                        style={{ color: primaryHex }}
                      >
                        <Sparkles size={16} />
                        AI Auto-Grading
                      </button>
                      {normalizedStatus === 'draft' && (
                        <button
                          onClick={() => handlePublishAssignment(index)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-auto"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <div className="space-y-6">
            {/* Sub-tabs */}
            <div
              className={`flex gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} pb-2`}
            >
              <button
                onClick={() => setGradingSubTab('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  gradingSubTab === 'manual'
                    ? 'text-white'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={gradingSubTab === 'manual' ? { backgroundColor: primaryHex } : undefined}
              >
                Manual Grading
              </button>
              <button
                onClick={() => setGradingSubTab('auto')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  gradingSubTab === 'auto'
                    ? 'text-white'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={gradingSubTab === 'auto' ? { backgroundColor: primaryHex } : undefined}
              >
                Auto-Graded Results
              </button>
            </div>

            {gradingSubTab === 'manual' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Written and uploaded assignments that require manual review and grading.
                  </p>
                  <div className="w-full sm:w-64">
                    <select
                      value={selectedAssignmentIdForGrading || ''}
                      onChange={(e) => setSelectedAssignmentIdForGrading(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white [&>option]:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none`}
                      style={{ '--tw-ring-color': primaryHex } as React.CSSProperties}
                    >
                      <option value="">Select an Assignment</option>
                      {courseAssignments.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!selectedAssignmentIdForGrading ? (
                  <div
                    className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                      Please select an assignment above to view submissions.
                    </p>
                  </div>
                ) : assignmentSubmissions.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                      No submissions yet for this assignment.
                    </p>
                  </div>
                ) : (
                  assignmentSubmissions.map((sub: any) => (
                    <div
                      key={sub.id}
                      className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 sm:p-6 border shadow-sm`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <h4
                            className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {sub.user?.firstName || sub.user?.lastName
                              ? `${sub.user?.firstName || ''} ${sub.user?.lastName || ''}`.trim()
                              : `Student ID: ${sub.userId}`}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            String(sub.submissionStatus).toLowerCase() === 'graded'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {String(sub.submissionStatus).toLowerCase() === 'graded'
                            ? 'Graded'
                            : 'Pending Review'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex gap-2">
                          {(sub.submissionLink || sub.fileUrl) && (
                            <button
                              onClick={() =>
                                window.open(sub.submissionLink || sub.fileUrl, '_blank')
                              }
                              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              <Download size={14} /> Download Submission
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            Score:
                          </label>
                          <input
                            type="number"
                            value={draftGrades[sub.id] !== undefined ? draftGrades[sub.id] : ''}
                            onChange={(e) => handleInlineGrade(sub.id, e.target.value)}
                            placeholder="e.g. 85"
                            className={`w-20 px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            style={{ '--tw-ring-color': primaryHex } as React.CSSProperties}
                          />
                          <span
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} mr-2`}
                          >
                            / 100
                          </span>
                          <button
                            onClick={() => saveInlineGrade(sub.id)}
                            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-colors"
                            style={{ backgroundColor: primaryHex }}
                          >
                            Save Grade
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {gradingSubTab === 'auto' && (
              <div className="space-y-4">
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Auto-graded summary is based on real graded submissions from the selected
                  assignment.
                </p>
                {assignmentSubmissions.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                      No graded submission data available for the selected assignment yet.
                    </p>
                  </div>
                ) : (
                  <div
                    className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-4`}
                  >
                    <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} text-sm`}>
                      Total submissions:{' '}
                      <span className="font-semibold">{assignmentSubmissions.length}</span>
                    </p>
                    <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} text-sm mt-2`}>
                      Graded submissions:{' '}
                      <span className="font-semibold">
                        {
                          assignmentSubmissions.filter(
                            (s: any) => String(s.submissionStatus).toLowerCase() === 'graded'
                          ).length
                        }
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <RosterTable
            data={studentsForRoster.map((student: any, index: number) => ({
              id: student.id || student.userId || index + 1,
              name:
                `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                `Student ${index + 1}`,
              email: student.email || `student${index + 1}@edu.com`,
              status: 'Enrolled',
              grades: {
                assignments: '-',
                quizzes: '-',
                midterm: '-',
                final: '-',
                total: '-',
              },
            }))}
          />
        )}
      </div>

    </div>
  );
}

export default CourseDetail;
