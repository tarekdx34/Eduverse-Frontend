import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Search,
  AlertTriangle,
  Sparkles,
  Filter,
  Clock,
  StickyNote,
  X,
  Star,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';

type StudentPerformance = {
  studentId: string;
  studentName: string;
  courses: {
    courseId: string;
    courseName: string;
    averageGrade: number;
    attendanceRate: number;
    submissionCount: number;
    lateSubmissions: number;
  }[];
  overallAverage: number;
  overallAttendance: number;
};

type StudentPerformancePageProps = {
  students: StudentPerformance[];
  readOnly?: boolean;
  assignedCourseNames?: string[];
};

export function StudentPerformancePage({
  students,
  readOnly = false,
  assignedCourseNames = [],
}: StudentPerformancePageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const visibleStudents = assignedCourseNames.length
    ? students.filter((student) =>
        student.courses.some((course) => assignedCourseNames.includes(course.courseName))
      )
    : students;
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [noteModalStudentId, setNoteModalStudentId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const student = selectedStudent
    ? visibleStudents.find((s) => s.studentId === selectedStudent)
    : null;

  // Stats calculations
  const totalStudents = visibleStudents.length;
  const averageGrade =
    totalStudents > 0
      ? Math.round(visibleStudents.reduce((sum, s) => sum + s.overallAverage, 0) / totalStudents)
      : 0;
  const atRiskStudents = visibleStudents.filter((s) => s.overallAverage < 70).length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(visibleStudents.reduce((sum, s) => sum + s.overallAttendance, 0) / totalStudents)
      : 0;

  // Unique courses for filter
  const allCourses = Array.from(
    new Set(visibleStudents.flatMap((s) => s.courses.map((c) => c.courseName)))
  );

  // Filtered students
  const filteredStudents = visibleStudents.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !courseFilter || s.courses.some((c) => c.courseName === courseFilter);
    return matchesSearch && matchesCourse;
  });

  // Risk level helper
  const getRiskLevel = (average: number) => {
    if (average >= 80) return { border: 'border-l-green-500', label: '', color: '' };
    if (average >= 70)
      return {
        border: 'border-l-yellow-500',
        label: 'Warning',
        color: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
      };
    return {
      border: 'border-l-red-500',
      label: 'At Risk',
      color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    };
  };

  const getAIInsights = (s: StudentPerformance) => {
    const insights: {
      message: string;
      type: 'warning' | 'danger' | 'success' | 'info';
      icon: React.ReactNode;
    }[] = [];
    if (s.overallAttendance < 80) {
      insights.push({
        message: 'Attendance is below average. Consider reaching out.',
        type: 'warning',
        icon: <AlertTriangle size={14} />,
      });
    }
    s.courses.forEach((c) => {
      if (c.averageGrade < 70) {
        insights.push({
          message: `Struggling in ${c.courseName}. May need additional support.`,
          type: 'danger',
          icon: <TrendingDown size={14} />,
        });
      }
    });
    const totalLate = s.courses.reduce((sum, c) => sum + c.lateSubmissions, 0);
    if (totalLate > 2) {
      insights.push({
        message: 'Multiple late submissions detected. Time management support recommended.',
        type: 'warning',
        icon: <Clock size={14} />,
      });
    }
    if (s.overallAverage > 85) {
      insights.push({
        message: 'Strong performer! Consider for peer tutoring.',
        type: 'success',
        icon: <Star size={14} />,
      });
    }
    if (insights.length === 0) {
      insights.push({
        message: 'Student is performing within expected parameters.',
        type: 'info',
        icon: <CheckCircle size={14} />,
      });
    }
    return insights;
  };

  const insightStyles = {
    warning: isDark
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
      : 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: isDark
      ? 'bg-red-500/10 border-red-500/30 text-red-300'
      : 'bg-red-50 border-red-200 text-red-800',
    success: isDark
      ? 'bg-green-500/10 border-green-500/30 text-green-300'
      : 'bg-green-50 border-green-200 text-green-800',
    info: isDark
      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      : 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const openNoteModal = (studentId: string) => {
    setNoteModalStudentId(studentId);
    setNoteText(studentNotes[studentId] || '');
  };

  const saveNote = () => {
    if (noteModalStudentId) {
      setStudentNotes((prev) => ({ ...prev, [noteModalStudentId]: noteText }));
      setNoteModalStudentId(null);
      setNoteText('');
    }
  };

  const chartData = student
    ? student.courses.map((course) => ({
        course: course.courseName,
        grade: course.averageGrade,
        attendance: course.attendanceRate,
      }))
    : [];

  const getPerformanceStatus = (average: number) => {
    if (average >= 90)
      return {
        label: t('excellent'),
        color: isDark ? 'text-green-400' : 'text-green-600',
        bg: isDark ? 'bg-green-500/20' : 'bg-green-50',
      };
    if (average >= 80)
      return {
        label: t('good'),
        color: isDark ? 'text-blue-400' : 'text-blue-600',
        bg: isDark ? 'bg-blue-500/20' : 'bg-blue-50',
      };
    if (average >= 70)
      return {
        label: t('fair'),
        color: isDark ? 'text-yellow-400' : 'text-yellow-600',
        bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-50',
      };
    return {
      label: t('needsImprovement'),
      color: isDark ? 'text-red-400' : 'text-red-600',
      bg: isDark ? 'bg-red-500/20' : 'bg-red-50',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('studentPerformance')}
          </h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
            {t('monitorPerformance')}
          </p>
        </div>
        {readOnly && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}
          >
            Read-only assigned students
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Students
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totalStudents}
          </p>
        </div>
        <div
          className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Average Grade
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {averageGrade}%
          </p>
        </div>
        <div
          className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              At-Risk Students
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {atRiskStudents}
          </p>
        </div>
        <div
          className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Avg Attendance
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {avgAttendance}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div
          className={`lg:col-span-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('students')}
          </h3>
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {/* Course Filter */}
          <div className="relative mb-4">
            <Filter
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
            />
            <CleanSelect
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Courses</option>
              {allCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </CleanSelect>
          </div>
          <div className="space-y-2">
            {filteredStudents.map((student) => {
              const status = getPerformanceStatus(student.overallAverage);
              const risk = getRiskLevel(student.overallAverage);
              return (
                <button
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student.studentId)}
                  className={`w-full text-left p-3 rounded-lg border border-l-4 ${risk.border} transition-colors ${
                    selectedStudent === student.studentId
                      ? isDark
                        ? 'border-blue-500 border-l-blue-500 bg-blue-500/20'
                        : 'border-blue-500 border-l-blue-500 bg-blue-50'
                      : isDark
                        ? 'border-white/10 hover:bg-white/5'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {student.studentName}
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          title="Add Note"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNoteModal(student.studentId);
                          }}
                          className={`shrink-0 p-1 rounded hover:bg-opacity-20 ${isDark ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-100'}`}
                        >
                          <StickyNote className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {risk.label && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${risk.color}`}>
                          {risk.label}
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                  {!readOnly && studentNotes[student.studentId] && (
                    <p
                      className={`text-xs italic mb-2 truncate ${isDark ? 'text-yellow-400/80' : 'text-yellow-700'} flex items-center gap-1.5`}
                    >
                      <StickyNote className="w-3 h-3" /> {studentNotes[student.studentId]}
                    </p>
                  )}
                  <div
                    className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    <span>
                      {t('avg')}: {student.overallAverage}%
                    </span>
                    <span>
                      {t('attendance')}: {student.overallAttendance}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Performance Details */}
        <div className="lg:col-span-2 space-y-6">
          {student ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('overallAverage')}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {student.overallAverage}%
                  </p>
                </div>
                <div
                  className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('overallAttendance')}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {student.overallAttendance}%
                  </p>
                </div>
              </div>

              {/* Performance Chart */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}
              >
                <h3
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}
                >
                  {t('performanceByCourse')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="course" stroke={isDark ? '#94a3b8' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
                    <Tooltip
                      contentStyle={
                        isDark
                          ? {
                              backgroundColor: '#1e293b',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#f1f5f9',
                            }
                          : undefined
                      }
                    />
                    <Bar dataKey="grade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Course Details */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}
              >
                <h3
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}
                >
                  {t('courseDetails')}
                </h3>
                <div className="space-y-4">
                  {student.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className={`border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-lg p-4`}
                    >
                      <h4
                        className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}
                      >
                        {course.courseName}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                          >
                            {t('averageGrade')}
                          </span>
                          <p
                            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {course.averageGrade}%
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                          >
                            {t('attendance')}
                          </span>
                          <p
                            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {course.attendanceRate}%
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                          >
                            {t('submissions')}
                          </span>
                          <p
                            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {course.submissionCount}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                          >
                            {t('late')}
                          </span>
                          <p
                            className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}
                          >
                            {course.lateSubmissions}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Panel */}
              <div
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    AI Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  {getAIInsights(student).map((insight, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 text-sm ${insightStyles[insight.type]} flex items-start gap-3`}
                    >
                      <div className="mt-0.5">{insight.icon}</div>
                      {insight.message}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-12 text-center`}
            >
              <Users
                className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'} mx-auto mb-4`}
              />
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {t('selectStudentMessage')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {!readOnly && noteModalStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-md rounded-lg border p-6 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Note
              </h3>
              <button
                onClick={() => {
                  setNoteModalStudentId(null);
                  setNoteText('');
                }}
                className={`p-1 rounded ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder="Write a note about this student..."
              className={`w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setNoteModalStudentId(null);
                  setNoteText('');
                }}
                className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPerformancePage;
