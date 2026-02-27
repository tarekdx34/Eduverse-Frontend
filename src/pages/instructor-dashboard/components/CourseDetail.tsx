import React, { useState } from 'react';
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
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FileUploadDropzone, AutoGradingSystem, Submission } from '../../../components/shared';

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
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLecture, setSelectedLecture] = useState('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'written',
  });
  const [gradingSubTab, setGradingSubTab] = useState<'manual' | 'auto'>('manual');

  // Get actual course data
  const course = courses.find((c) => c.id === courseId);

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
    { id: 'materials', label: t('materials'), icon: FileText },
    { id: 'assignments', label: t('assignments'), icon: FileText },
    { id: 'grading', label: t('grading'), icon: CheckCircle },
    { id: 'students', label: t('students'), icon: Users },
    { id: 'announcements', label: t('announcements'), icon: MessageSquare },
  ];

  const sampleSubmissions: Submission[] = [
    {
      id: '1',
      studentId: 'stu-1',
      studentName: 'John Smith',
      studentEmail: 'john.smith@edu.com',
      submittedAt: new Date('2025-05-10T14:30:00'),
      answers: [
        {
          questionId: 'q1',
          questionText: 'What is the derivative of x²?',
          answer: '2x',
          correctAnswer: '2x',
          autoScore: 2,
          maxScore: 2,
        },
        {
          questionId: 'q2',
          questionText: 'Explain the chain rule.',
          answer: 'The chain rule is used for composite functions...',
          maxScore: 5,
          needsReview: true,
        },
      ],
      totalScore: 2,
      maxTotalScore: 7,
      status: 'auto-graded',
    },
  ];

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
            className="flex items-center gap-4 sm:gap-6 -mb-px overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                </div>
              </div>

              {/* Upcoming Events */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="text-purple-600" size={20} />
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
                    className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}
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
          <div className="space-y-4">
            {[1, 2, 3, 4].map((week) => (
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
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Lecture {week}.1 - Introduction
                        </div>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {course.schedule}
                        </div>
                      </div>
                    </div>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                {t('uploadMaterials')}
              </h3>
              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Select Lecture
                </label>
                <select
                  value={selectedLecture}
                  onChange={(e) => setSelectedLecture(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">-- Select a lecture --</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.label}
                    </option>
                  ))}
                </select>
              </div>
              <FileUploadDropzone
                onFilesUploaded={(files) => console.log('Uploaded:', files)}
                acceptedTypes={[
                  'application/pdf',
                  'image/*',
                  'video/*',
                  '.doc',
                  '.docx',
                  '.ppt',
                  '.pptx',
                ]}
                maxFiles={10}
                maxSizeInMB={50}
                showPreview={true}
              />
            </div>

            <div
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                {t('courseMaterials')}
              </h3>
              <div className="space-y-3">
                {[
                  'Syllabus.pdf',
                  'Lecture Notes - Week 1.pdf',
                  'Assignment Guidelines.pdf',
                  'Lab Manual.pdf',
                  'Formula Sheet.pdf',
                ].map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${isDark ? 'bg-transparent hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {file}
                      </span>
                    </div>
                    <button
                      className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} rounded-lg transition-colors`}
                    >
                      <Download size={16} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                    </button>
                  </div>
                ))}
              </div>
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
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <FileText size={16} />
                {showAssignmentForm ? 'Cancel' : 'Create New Assignment'}
              </button>
            </div>

            {/* Assignment Creation Form */}
            {showAssignmentForm && (
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm space-y-4`}
              >
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  New Assignment
                </h3>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, title: e.target.value })
                    }
                    placeholder="Assignment title"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Description
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, description: e.target.value })
                    }
                    placeholder="Assignment description"
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) =>
                        setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                    >
                      Type
                    </label>
                    <select
                      value={assignmentForm.type}
                      onChange={(e) =>
                        setAssignmentForm({ ...assignmentForm, type: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="written">Written / Upload</option>
                      <option value="mcq">MCQ (Auto-Graded)</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert(`Assignment "${assignmentForm.title}" created successfully!`);
                    setAssignmentForm({ title: '', description: '', dueDate: '', type: 'written' });
                    setShowAssignmentForm(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Create Assignment
                </button>
              </div>
            )}

            {/* Assignment Cards */}
            <div className="space-y-4">
              {[
                {
                  title: 'Assignment 03 — Derivatives Practice',
                  subject: 'Calculus I',
                  subjectColor: 'bg-blue-100 text-blue-700',
                  dueDate: 'Due May 15, 2025',
                  submitted: 32,
                  total: 52,
                  description:
                    'Complete problems 1-20 on derivatives, including chain rule and implicit differentiation.',
                  files: ['Problem-Set.pdf', 'Formula-Sheet.pdf'],
                  status: 'Published',
                  statusColor: 'bg-green-100 text-green-700',
                },
                {
                  title: 'Lab Report 02 — Projectile Motion',
                  subject: 'Physics I',
                  subjectColor: 'bg-purple-100 text-purple-700',
                  dueDate: 'Due May 14, 2025',
                  submitted: 28,
                  total: 43,
                  description:
                    'Analyze projectile motion data collected during lab session and write a comprehensive report.',
                  files: ['Lab-Instructions.pdf'],
                  status: 'Published',
                  statusColor: 'bg-green-100 text-green-700',
                },
                {
                  title: 'Programming Assignment 04 — Sorting Algorithms',
                  subject: 'Intro to Computer Science',
                  subjectColor: 'bg-emerald-100 text-emerald-700',
                  dueDate: 'Due May 20, 2025',
                  submitted: 0,
                  total: 48,
                  description:
                    'Implement and compare quicksort, mergesort, and heapsort algorithms.',
                  files: ['Starter-Code.zip', 'Requirements.pdf'],
                  status: 'Draft',
                  statusColor: 'bg-yellow-100 text-yellow-700',
                },
              ].map((assignment, index) => (
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.subjectColor}`}
                        >
                          {assignment.subject}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-3`}
                      >
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>
                            {assignment.submitted}/{assignment.total} Submitted
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-4`}>
                        {assignment.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {assignment.files.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className={`flex items-center gap-2 px-3 py-1 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg text-sm ${isDark ? 'text-slate-400' : 'text-gray-700'}`}
                          >
                            <FileText size={14} />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.statusColor}`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <div
                    className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    <button
                      onClick={() => alert(`Viewing submissions for "${assignment.title}"`)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => alert(`Editing "${assignment.title}"`)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => alert(`Opening manual grading for "${assignment.title}"`)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                    >
                      Grade Manually
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Sparkles size={16} />
                      AI Auto-Grading
                    </button>
                    {assignment.status === 'Draft' && (
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-auto">
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
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Written and uploaded assignments that require manual review and grading.
                </p>
                {sampleSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 sm:p-6 border shadow-sm`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sub.studentName}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {sub.studentId} • {sub.assignmentTitle}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'graded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Pending Review'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => alert(`Viewing submission from ${sub.studentName}`)}
                        className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View & Grade
                      </button>
                      {sub.fileUrl && (
                        <button
                          onClick={() => alert(`Downloading ${sub.fileName}`)}
                          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Download size={14} /> {sub.fileName}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              Enrolled Students ({course.enrolled})
            </h3>
            <div className="space-y-2">
              {Array.from({ length: Math.min(10, course.enrolled) }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Student {index + 1}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        student{index + 1}@edu.com
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Grade: A-
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div
            className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('announcements')}
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <Bell size={16} />
                New Announcement
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Midterm Schedule', date: 'May 10', content: 'Midterm exam on June 1st' },
                { title: 'Office Hours Update', date: 'May 8', content: 'New office hours posted' },
              ].map((announcement, index) => (
                <div
                  key={index}
                  className={`p-4 ${isDark ? 'bg-transparent' : 'bg-gray-50'} rounded-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {announcement.title}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {announcement.date}
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {announcement.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
