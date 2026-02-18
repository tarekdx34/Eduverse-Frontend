import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, BookOpen, Users, Clock, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  enrolled: number;
  capacity: number;
  status: string;
  instructor: string;
}

interface CourseManagementPageProps {
  courses: Course[];
  onAddCourse: (course: any) => void;
  onEditCourse: (id: number, course: any) => void;
  onDeleteCourse: (id: number) => void;
}

export function CourseManagementPage({ courses, onAddCourse, onEditCourse, onDeleteCourse }: CourseManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(courses.map(c => c.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('courseManagement')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageCoursesSub')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          {t('addCourse')}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
              <input
                type="text"
                placeholder={t('searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">{t('allDepartments')}</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="active">{t('active')}</option>
            <option value="archived">{t('archived')}</option>
          </select>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Download size={18} />
            {t('export')}
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-24 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <BookOpen className="text-white opacity-50" size={48} />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {course.code}
                  </span>
                  <h3 className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{course.enrolled}/{course.capacity} {t('enrolled')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{course.credits} {t('credits')}</span>
                </div>
              </div>

              <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>{t('courseInstructor')}: {course.instructor}</p>
                <p>{t('department')}: {course.department}</p>
              </div>

              {/* Enrollment Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('enrollment')}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{Math.round((course.enrolled / course.capacity) * 100)}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCourse(course)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Edit2 size={14} />
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCourse) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingCourse ? t('editCourse') : t('addCourse')}
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('courseCode')}</label>
                  <input type="text" defaultValue={editingCourse?.code} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('credits')}</label>
                  <input type="number" defaultValue={editingCourse?.credits} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('courseName')}</label>
                <input type="text" defaultValue={editingCourse?.name} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('department')}</label>
                  <select defaultValue={editingCourse?.department} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('semester')}</label>
                  <select defaultValue={editingCourse?.semester} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="Fall 2025">Fall 2025</option>
                    <option value="Spring 2026">Spring 2026</option>
                    <option value="Summer 2026">Summer 2026</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('capacity')}</label>
                <input type="number" defaultValue={editingCourse?.capacity} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingCourse(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingCourse ? t('save') : t('addCourse')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagementPage;
