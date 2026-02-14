import React, { useState } from 'react';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCls = isDark ? 'border-gray-700' : 'border-gray-200';
  const selectedCls = isDark ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50';
  const unselectedCls = isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50';

  const student = selectedStudent ? students.find((s) => s.studentId === selectedStudent) : null;

  const chartData = student
    ? student.courses.map((course) => ({
        course: course.courseName,
        grade: course.averageGrade,
        attendance: course.attendanceRate,
      }))
    : [];

  const getPerformanceStatus = (average: number) => {
    if (average >= 90) return { label: t('excellent'), color: isDark ? 'text-green-400' : 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50' };
    if (average >= 80) return { label: t('good'), color: isDark ? 'text-indigo-400' : 'text-indigo-600', bg: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50' };
    if (average >= 70) return { label: t('fair'), color: isDark ? 'text-yellow-400' : 'text-yellow-600', bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50' };
    return { label: t('needsImprovement'), color: isDark ? 'text-red-400' : 'text-red-600', bg: isDark ? 'bg-red-900/30' : 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${textCls}`}>{t('studentPerformance')}</h2>
        <p className={`${mutedCls} mt-1`}>{t('monitorPerformance')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 ${cardCls} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('students')}</h3>
          <div className="space-y-2">
            {students.map((s) => {
              const status = getPerformanceStatus(s.overallAverage);
              return (
                <button
                  key={s.studentId}
                  onClick={() => setSelectedStudent(s.studentId)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStudent === s.studentId ? selectedCls : unselectedCls
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${textCls}`}>{s.studentName}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${mutedCls}`}>
                    <span>{t('overallAverage')}: {s.overallAverage}%</span>
                    <span>{t('overallAttendance')}: {s.overallAttendance}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {student ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${cardCls} border rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className={isDark ? 'w-5 h-5 text-indigo-400' : 'w-5 h-5 text-indigo-600'} />
                    <span className={`text-sm ${mutedCls}`}>{t('overallAverage')}</span>
                  </div>
                  <p className={`text-2xl font-bold ${textCls}`}>{student.overallAverage}%</p>
                </div>
                <div className={`${cardCls} border rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className={isDark ? 'w-5 h-5 text-green-400' : 'w-5 h-5 text-green-600'} />
                    <span className={`text-sm ${mutedCls}`}>{t('overallAttendance')}</span>
                  </div>
                  <p className={`text-2xl font-bold ${textCls}`}>{student.overallAttendance}%</p>
                </div>
              </div>

              <div className={`${cardCls} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('coursePerformance')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="course" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={isDark ? { backgroundColor: '#1f2937', border: '1px solid #374151' } : undefined} />
                    <Bar dataKey="grade" fill={isDark ? '#818cf8' : '#4f46e5'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={`${cardCls} border rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('courseDetails')}</h3>
                <div className="space-y-4">
                  {student.courses.map((course) => (
                    <div key={course.courseId} className={`border ${borderCls} rounded-lg p-4`}>
                      <h4 className={`font-semibold ${textCls} mb-3`}>{course.courseName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className={`text-xs ${mutedCls}`}>{t('averageGrade')}</span>
                          <p className={`text-lg font-semibold ${textCls}`}>{course.averageGrade}%</p>
                        </div>
                        <div>
                          <span className={`text-xs ${mutedCls}`}>{t('attendance')}</span>
                          <p className={`text-lg font-semibold ${textCls}`}>{course.attendanceRate}%</p>
                        </div>
                        <div>
                          <span className={`text-xs ${mutedCls}`}>{t('submissionCount')}</span>
                          <p className={`text-lg font-semibold ${textCls}`}>{course.submissionCount}</p>
                        </div>
                        <div>
                          <span className={`text-xs ${mutedCls}`}>{t('lateSubmissions')}</span>
                          <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{course.lateSubmissions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={`${cardCls} border rounded-lg p-12 text-center`}>
              <Users className={`w-12 h-12 ${mutedCls} mx-auto mb-4`} />
              <p className={mutedCls}>{t('selectStudent')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPerformancePage;
