import React, { useState } from 'react';
import { Users, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
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
import { useTheme } from '../contexts/ThemeContext';

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
};

export function StudentPerformancePage({ students }: StudentPerformancePageProps) {
  const { isDark } = useTheme();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const student = selectedStudent ? students.find((s) => s.studentId === selectedStudent) : null;

  const chartData = student
    ? student.courses.map((course) => ({
        course: course.courseName,
        grade: course.averageGrade,
        attendance: course.attendanceRate,
      }))
    : [];

  const getPerformanceStatus = (average: number) => {
    if (average >= 90) return { label: 'Excellent', color: isDark ? 'text-green-400' : 'text-green-600', bg: isDark ? 'bg-green-500/20' : 'bg-green-50' };
    if (average >= 80) return { label: 'Good', color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-500/20' : 'bg-blue-50' };
    if (average >= 70) return { label: 'Fair', color: isDark ? 'text-yellow-400' : 'text-yellow-600', bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-50' };
    return { label: 'Needs Improvement', color: isDark ? 'text-red-400' : 'text-red-600', bg: isDark ? 'bg-red-500/20' : 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Performance</h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mt-1`}>Monitor student performance in your labs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className={`lg:col-span-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Students</h3>
          <div className="space-y-2">
            {students.map((student) => {
              const status = getPerformanceStatus(student.overallAverage);
              return (
                <button
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student.studentId)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStudent === student.studentId
                      ? isDark ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50'
                      : isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    <span>Avg: {student.overallAverage}%</span>
                    <span>Attendance: {student.overallAttendance}%</span>
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
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Overall Average</span>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.overallAverage}%</p>
                </div>
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Overall Attendance</span>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.overallAttendance}%</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Performance by Course</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="course" stroke={isDark ? '#94a3b8' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
                    <Tooltip contentStyle={isDark ? { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' } : undefined} />
                    <Bar dataKey="grade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Course Details */}
              <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Course Details</h3>
                <div className="space-y-4">
                  {student.courses.map((course) => (
                    <div key={course.courseId} className={`border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-lg p-4`}>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>{course.courseName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Average Grade</span>
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.averageGrade}%</p>
                        </div>
                        <div>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Attendance</span>
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.attendanceRate}%</p>
                        </div>
                        <div>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Submissions</span>
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.submissionCount}</p>
                        </div>
                        <div>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Late</span>
                          <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{course.lateSubmissions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-12 text-center`}>
              <Users className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'} mx-auto mb-4`} />
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select a student to view performance details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPerformancePage;
