import React, { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Course = {
  id: string;
  name: string;
  code: string;
  instructor: {
    name: string;
    email: string;
  };
  semester: string;
  labCount: number;
  studentCount: number;
  pendingSubmissions: number;
  averageGrade: number;
  attendanceRate: number;
};

type CoursesPageProps = {
  courses: Course[];
  onViewCourse: (courseId: string) => void;
};

export function CoursesPage({ courses, onViewCourse }: CoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
    : 'border-gray-300 text-gray-900';
  const btnCls = isDark
    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textCls}`}>{t('assignedCoursesTitle')}</h2>
          <p className={`${mutedCls} mt-1`}>{t('manageAssignedCourses')}</p>
        </div>
      </div>

      <div className={`${cardCls} border rounded-lg p-4`}>
        <input
          type="text"
          placeholder={t('searchCourses')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputCls}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`${cardCls} border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`}
            onClick={() => onViewCourse(course.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h3 className={`text-lg font-semibold ${textCls}`}>{course.name}</h3>
                </div>
                <p className={`text-sm ${mutedCls} mb-1`}>{course.code}</p>
                <p className={`text-xs ${mutedCls}`}>{course.instructor.name}</p>
                <p className={`text-xs ${mutedCls}`}>{course.semester}</p>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 mb-4 ${isDark ? 'text-gray-300' : ''}`}>
              <div className={isDark ? 'bg-gray-700 rounded-lg p-3' : 'bg-gray-50 rounded-lg p-3'}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${mutedCls}`} />
                  <span className={`text-xs ${mutedCls}`}>{t('labsCount')}</span>
                </div>
                <p className={`text-lg font-semibold ${textCls}`}>{course.labCount}</p>
              </div>
              <div className={isDark ? 'bg-gray-700 rounded-lg p-3' : 'bg-gray-50 rounded-lg p-3'}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs ${mutedCls}`}>{t('studentsCount')}</span>
                </div>
                <p className={`text-lg font-semibold ${textCls}`}>{course.studentCount}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className={mutedCls}>{t('avgGrade')}</span>
                <span className={`font-semibold ${textCls}`}>{course.averageGrade}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={mutedCls}>{t('attendance')}</span>
                <span className={`font-semibold ${textCls}`}>{course.attendanceRate}%</span>
              </div>
            </div>

            {course.pendingSubmissions > 0 && (
              <div className={`${isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg p-3 mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                    {course.pendingSubmissions} {t('pendingSubmissionsCount')}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewCourse(course.id);
              }}
              className={`w-full ${btnCls} py-2 rounded-lg transition-colors text-sm font-medium`}
            >
              {t('viewDetails')}
            </button>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className={`text-center py-12 ${cardCls} border rounded-lg`}>
          <BookOpen className={`w-12 h-12 ${mutedCls} mx-auto mb-4`} />
          <p className={mutedCls}>{t('noCoursesFound')}</p>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
