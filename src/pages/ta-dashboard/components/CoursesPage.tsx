import React, { useState } from 'react';
import { BookOpen, Users, FileText, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assigned Courses</h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Manage your assigned courses and labs</p>
        </div>
      </div>

      {/* Search */}
      <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <input
          type="text"
          placeholder="Search courses by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300'}`}
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            onClick={() => onViewCourse(course.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                </div>
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Code: {course.code}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Instructor: {course.instructor.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{course.semester}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Labs</span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.labCount}</p>
              </div>

              <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Students</span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.studentCount}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Avg Grade</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.averageGrade}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Attendance</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.attendanceRate}%</span>
              </div>
            </div>

            {course.pendingSubmissions > 0 && (
              <div className={`border rounded-lg p-3 mb-4 ${isDark ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                    {course.pendingSubmissions} Pending Submissions
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isDark ? 'text-orange-300' : 'text-orange-600'}`} />
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewCourse(course.id);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>No courses found matching your search.</p>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
