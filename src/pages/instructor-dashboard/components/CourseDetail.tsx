import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '../../../services/api/courseService';
import { AssignmentService, Assignment } from '../../../services/api/assignmentService';
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
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FileUploadDropzone, AutoGradingSystem, Submission } from '../../../components/shared';
import { RosterTable } from './RosterTable';
import { AssignmentModal, AssignmentFormData } from './AssignmentModal';
import { CleanSelect } from '../../../components/shared';
import { useApi } from '../../../hooks/useApi';
import { courseService } from '../../../services/api/courseService';

type Course = {
  id: number;
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
};

export function CourseDetail({ courseId, onBack, courses }: CourseDetailProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLecture, setSelectedLecture] = useState('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData | null>(null);
  const [editingAssignmentIndex, setEditingAssignmentIndex] = useState<number | null>(null);
  const [gradingSubTab, setGradingSubTab] = useState<'manual' | 'auto'>('manual');

  const { data: sectionSchedules, loading: schedulesLoading } = useApi(async () => {
    try {
      return await courseService.getSectionSchedules(String(courseId));
    } catch (error) {
      console.error('Failed to fetch section schedules', error);
      throw error;
    }
  }, [courseId]);

  // Materials state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    lectureId: '',
  });

  // Get actual course data
  const course = courses.find((c) => c.id === courseId);

  const queryClient = useQueryClient();
  const { data: courseMaterials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['course-materials', course?.id],
    queryFn: () => CourseService.getMaterials(course!.id),
    enabled: !!course?.id,
  });

  const createMaterialMutation = useMutation({
    mutationFn: (newMaterial: any) => CourseService.createMaterial(course!.id, newMaterial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', course?.id] });
      setShowMaterialModal(false);
      setMaterialForm({ title: '', lectureId: '' });
    },
  });

  const { data: assignmentsResponse, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['course-assignments', course?.id],
    queryFn: () => AssignmentService.getAll({ courseId: String(course!.id) }),
    enabled: !!course?.id,
  });
  const courseAssignments = assignmentsResponse?.data || [];

  const createAssignmentMutation = useMutation({
    mutationFn: (newAssignment: any) => AssignmentService.create(newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', course?.id] });
      setShowAssignmentForm(false);
      setAssignmentForm(null);
      setEditingAssignmentIndex(null);
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => AssignmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-assignments', course?.id] });
      setShowAssignmentForm(false);
      setAssignmentForm(null);
      setEditingAssignmentIndex(null);
    },
  });

  const { data: sectionStudents = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['section-students', course?.id],
    queryFn: () => EnrollmentService.getSectionStudents(course!.id),
    enabled: !!course?.id,
  });



  const getPrimaryBadgeStyle = (colorClass: string): React.CSSProperties | undefined => {
    if (colorClass) return undefined;
    return {
      backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
      color: primaryHex,
    };
  };

  if (!course) {
    return (
      <div className={`flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            {t('courseNotFound')}
          </h2>
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-700 font-medium">
            {t('backToCourses')}
          </button>
        </div>
      </div>
    );
  }

  const lectures = [1, 2, 3, 4].map((week) => ({
    id: `${week}.1`,
    label: `Lecture ${week}.1 - Introduction`,
  }));

  const tabs = [
    { id: 'overview', label: t('dashboard'), icon: BookOpen },
    { id: 'lectures', label: t('lectures'), icon: Video },
    { id: 'assignments', label: t('assignments'), icon: FileText },
    { id: 'grading', label: t('grading'), icon: CheckCircle },
    { id: 'students', label: t('students'), icon: Users },
  ];

  const [sampleSubmissions, setSampleSubmissions] = useState([]);

  const [selectedAssignmentIdForGrading, setSelectedAssignmentIdForGrading] = useState<string | null>(null);
  const [draftGrades, setDraftGrades] = useState<Record<number, string>>({});

  const { data: assignmentSubmissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignmentIdForGrading],
    queryFn: () => AssignmentService.getSubmissions(selectedAssignmentIdForGrading!),
    enabled: !!selectedAssignmentIdForGrading,
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({ assignmentId, submissionId, grade }: { assignmentId: string; submissionId: number; grade: number }) =>
      AssignmentService.gradeSubmission(assignmentId, submissionId, { grade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions', selectedAssignmentIdForGrading] });
      setDraftGrades({});
    },
  });

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


  const handleSaveAssignment = (data: AssignmentFormData) => {
    const formattedDueDate = data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString();

    const payload = {
      title: data.title,
      description: data.description || '',
      dueDate: formattedDueDate,
      status: data.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
      courseId: String(course!.id),
      maxScore: String(100),
      submissionType: 'ONLINE',
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
      status: (assignment.status || 'draft').toLowerCase() as any,
      submissions: 0,
      assignmentType: 'assignment',
    });
    setEditingAssignmentIndex(index);
    setShowAssignmentForm(true);
  };

  const handlePublishAssignment = (index: number) => {
    const assignment = courseAssignments[index];
    updateAssignmentMutation.mutate({ id: String(assignment.id), data: { status: 'PUBLISHED' } });
  };

  const handleSaveMaterial = () => {
    if (!materialForm.title.trim() || !materialForm.lectureId || !course) return;

    createMaterialMutation.mutate({
      title: materialForm.title,
      materialType: 'document',
      weekNumber: parseInt(materialForm.lectureId.split('.')[0]) || 1,
      isPublished: true,
    });
  };

  return (
    <div>
      {/* Course Title */}
      <div
        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
      </div>

      {/* Tabs */}
      <div
        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="flex items-center gap-4 sm:gap-6 -mb-px overflow-x-auto pb-px"
            style={{ width: '100%' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : `border-transparent ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 capitalize">
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
                  <div
                    className={`flex items-center justify-between p-3 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                  >
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Lecture
                    </span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      May 12
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                  >
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Quiz
                    </span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      May 13
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                  >
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Office Hour
                    </span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      May 14
                    </span>
                  </div>
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
              <div className="space-y-4">
                <div
                  className={`flex items-center gap-4 p-4 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                >
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                  >
                    New assignment submitted
                  </div>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    John Smith
                  </span>
                  <span
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} ml-auto`}
                  >
                    2 hours ago
                  </span>
                </div>
                <div
                  className={`flex items-center gap-4 p-4 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                >
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium`}
                    style={{
                      backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
                      color: primaryHex,
                    }}
                  >
                    Quiz completed
                  </div>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    15 students
                  </span>
                  <span
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} ml-auto`}
                  >
                    4 hours ago
                  </span>
                </div>
                <div
                  className={`flex items-center gap-4 p-4 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                >
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}
                  >
                    Material uploaded
                  </div>
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Prof. Martinez
                  </span>
                  <span
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} ml-auto`}
                  >
                    Yesterday
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('lectures')}
              </h2>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Upload Material
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((week) => {
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
                    <div className="space-y-3">
                      <div
                        className={`flex items-center justify-between p-4 ${isDark ? 'bg-transparent hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <Video size={20} className="text-indigo-600" />
                          <div>
                            <div
                              className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              Lecture {week}.1 - Introduction
                            </div>
                            <div
                              className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                            >
                              {course.schedule}
                            </div>
                          </div>
                        </div>
                        <CheckCircle size={20} className="text-green-600" />
                      </div>

                      {weekMaterials.length > 0 && (
                        <div className="mt-4 space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/30 ml-4">
                          <h4
                            className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-500'} mb-2`}
                          >
                            Materials
                          </h4>
                          {weekMaterials.map((material) => (
                            <div
                              key={material.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white border text-gray-700'} text-sm`}
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-indigo-500" />
                                <span className={isDark ? 'text-slate-200' : ''}>
                                  {material.title}
                                </span>
                              </div>
                              <span
                                className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                              >
                                {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <FileText size={16} />
                Create New Assignment
              </button>
            </div>

            {/* Assignment Creation Form */}
            <AssignmentModal
              open={showAssignmentForm}
              assignment={assignmentForm}
              onClose={() => setShowAssignmentForm(false)}
              onSave={handleSaveAssignment}
            />

            {/* Assignment Cards */}
            <div className="space-y-4">
              {courseAssignments.map((assignment, index) => (
                <div
                  key={index}
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
                          className={`px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700`}
                          style={getPrimaryBadgeStyle('bg-indigo-100 text-indigo-700')}
                        >
                          {course.courseName}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-3`}
                      >
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>0/{course.enrolled} Submitted</span>
                        </div>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-4`}>
                        {assignment.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {assignment.status || 'DRAFT'}
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
                      className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Sparkles size={16} />
                      AI Auto-Grading
                    </button>
                    {assignment.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handlePublishAssignment(index)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-auto"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Manual Grading
              </button>
              <button
                onClick={() => setGradingSubTab('auto')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  gradingSubTab === 'auto'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
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
                      className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white [&>option]:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none`}
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
                  <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Please select an assignment above to view submissions.</p>
                  </div>
                ) : assignmentSubmissions.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No submissions yet for this assignment.</p>
                  </div>
                ) : (
                  assignmentSubmissions.map((sub: any) => (
                    <div
                      key={sub.submissionId}
                      className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 sm:p-6 border shadow-sm`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <h4
                            className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {sub.studentName || `Student ID: ${sub.studentId}`}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sub.status === 'GRADED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {sub.status === 'GRADED'
                            ? `Graded: ${sub.grade}/100`
                            : 'Pending Review'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex gap-2">
                          {sub.fileUrl && (
                            <button
                              onClick={() => window.open(sub.fileUrl, '_blank')}
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
                            value={draftGrades[sub.submissionId] !== undefined ? draftGrades[sub.submissionId] : (sub.grade || '')}
                            onChange={(e) => handleInlineGrade(sub.submissionId, e.target.value)}
                            placeholder="e.g. 85"
                            className={`w-20 px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'}`}
                          />
                          <span
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} mr-2`}
                          >
                            / 100
                          </span>
                          <button
                            onClick={() => saveInlineGrade(sub.submissionId)}
                            className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                  MCQ assignments are auto-graded. Results are displayed below (view only).
                </p>
                <div
                  className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-x-auto`}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={isDark ? 'border-b border-white/10' : 'border-b border-gray-200'}
                      >
                        <th
                          className={`text-left p-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                          Student
                        </th>
                        <th
                          className={`text-left p-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                          Quiz
                        </th>
                        <th
                          className={`text-left p-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                          Score
                        </th>
                        <th
                          className={`text-left p-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          student: 'Ahmed Hassan',
                          quiz: 'Midterm MCQ',
                          score: '92/100',
                          grade: 'A',
                        },
                        {
                          student: 'Sara Mohamed',
                          quiz: 'Midterm MCQ',
                          score: '85/100',
                          grade: 'B+',
                        },
                        { student: 'Omar Ali', quiz: 'Midterm MCQ', score: '78/100', grade: 'B' },
                        {
                          student: 'Layla Ibrahim',
                          quiz: 'Midterm MCQ',
                          score: '95/100',
                          grade: 'A+',
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className={
                            isDark ? 'border-b border-white/5' : 'border-b border-gray-100'
                          }
                        >
                          <td className={`p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {row.student}
                          </td>
                          <td className={`p-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {row.quiz}
                          </td>
                          <td
                            className={`p-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {row.score}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {row.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div
            className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
          >
            <RosterTable
              data={sectionStudents.map((student: any, index: number) => ({
                id: student.id || student.userId || index + 1,
                name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student ${index + 1}`,
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
          </div>
        )}

      </div>

      {/* Upload Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Upload Material
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  File / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter_1_Slides.pdf"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Target Lecture / Week
                </label>
                <CleanSelect
                  value={materialForm.lectureId}
                  onChange={(e) => setMaterialForm({ ...materialForm, lectureId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'}`}
                >
                  <option value="">Select a lecture...</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.label}
                    </option>
                  ))}
                </CleanSelect>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMaterialModal(false)}
                className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMaterial}
                disabled={!materialForm.title.trim() || !materialForm.lectureId}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
