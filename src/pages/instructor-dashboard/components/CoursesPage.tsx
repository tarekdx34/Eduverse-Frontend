import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  BarChart3,
  GraduationCap,
  Cpu,
  Atom,
  CircuitBoard,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { CourseDetail } from './CourseDetail';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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

type CourseFormData = {
  courseCode: string;
  courseName: string;
  semester: string;
  credits: number;
  prerequisites: string;
  description: string;
  capacity: number;
  schedule: string;
  room: string;
};

type CoursesPageProps = {
  courses: Course[];
  onCreateCourse: (data: CourseFormData) => void;
  onEditCourse: (id: number, data: CourseFormData) => void;
  onDeleteCourse: (id: number) => void;
  onDuplicateCourse: (id: number) => void;
  onViewCourse: (id: number) => void;
  selectedCourseId?: number | null;
};

// Course Lucide icons (replacing emojis)
const courseIcons = [GraduationCap, Atom, Cpu, CircuitBoard];

export function CoursesPage({
  courses,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onViewCourse,
  selectedCourseId,
}: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('courseName');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  // If viewing course detail, show that instead
  if (selectedCourseId !== null) {
    return (
      <CourseDetail
        courseId={selectedCourseId}
        onBack={() => navigate('/instructordashboard/courses')}
        courses={courses}
      />
    );
  }

  // Get unique semesters
  const semesters = Array.from(new Set(courses.map((c) => c.semester)));

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter;

    return matchesSearch && matchesStatus && matchesSemester;
  });

  const handleCreateClick = () => {
    setEditingCourse(null);
    setShowCreateModal(true);
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setShowCreateModal(true);
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('myCourses')}
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('courseManagement')}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Semester Filter */}
          <CustomDropdown
            label={t('semesterLabel')}
            value={semesterFilter}
            options={[
              { value: 'all', label: 'All Semesters' },
              ...semesters.map((sem) => ({ value: sem, label: sem })),
            ]}
            onChange={setSemesterFilter}
            stackLabel
            fullWidth
          />

          {/* Status Filter */}
          <CustomDropdown
            label={t('statusLabel')}
            value={statusFilter}
            options={[
              { value: 'all', label: t('all') },
              { value: 'active', label: t('active') },
              { value: 'archived', label: t('archived') },
            ]}
            onChange={(val) => setStatusFilter(val as any)}
            stackLabel
            fullWidth
          />

          {/* Sort By */}
          <CustomDropdown
            label={t('sortByLabel')}
            value={sortBy}
            options={[
              { value: 'courseName', label: t('courseName') },
              { value: 'courseCode', label: t('courseCode') },
              { value: 'enrolled', label: t('students') },
            ]}
            onChange={setSortBy}
            stackLabel
            fullWidth
          />

          {/* Search */}
          <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <span
              className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {t('search')}
            </span>
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={t('searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className={`rounded-xl border overflow-hidden hover:shadow-sm transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              {/* Course Icon Header */}
              <div
                className={`h-32 flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                {React.createElement(courseIcons[index % courseIcons.length], {
                  size: 48,
                  className: isDark ? 'text-slate-500' : 'text-slate-300',
                })}
              </div>

              {/* Course Info */}
              <div className="p-5">
                <h3
                  className={`font-semibold mb-3 text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {course.courseName}
                </h3>

                {/* Course Type */}
                <div className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {t('lectureAndLab')}
                </div>

                {/* Stats */}
                <div
                  className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                >
                  <Users size={14} />
                  <span>
                    {course.enrolled} {t('students')}
                  </span>
                </div>

                {/* Next Lecture */}
                <div
                  className={`flex items-center gap-2 text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                >
                  <Clock size={14} />
                  <span>
                    {t('nextLecture')} — {course.schedule.split(' ')[0]}, 9:00 AM
                  </span>
                </div>

                {/* Open Course Button */}
                <button
                  onClick={() => onViewCourse(course.id)}
                  className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                  style={{ color: primaryHex }}
                >
                  {t('openCourse')}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('noCoursesFound')}
            </h3>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter !== 'all' || semesterFilter !== 'all'
                ? t('tryAdjustingFilters')
                : t('createFirstCourse')}
            </p>
          </div>
        )}
      </div>

      {/* AI Tools Sidebar */}
      <div className="w-full lg:w-80 space-y-4">
        <div
          className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('aiToolsForTeaching')}
            </h3>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('aiToolsDescription')}
          </p>

          <div className="space-y-3">
            <button
              className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'bg-indigo-50 hover:bg-indigo-100'}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                <FileText className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('createQuiz')}
                </div>
              </div>
            </button>

            <button
              className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'bg-indigo-50 hover:bg-indigo-100'}`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                <BarChart3 className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('analyzeCourse')}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCourse(null);
          }}
          onSave={(data) => {
            if (editingCourse) {
              onEditCourse(editingCourse.id, data);
            } else {
              onCreateCourse(data);
            }
            setShowCreateModal(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}

// Course Modal Component
function CourseModal({
  course,
  onClose,
  onSave,
}: {
  course: Course | null;
  onClose: () => void;
  onSave: (data: CourseFormData) => void;
}) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900'}`;

  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: course?.courseCode || '',
    courseName: course?.courseName || '',
    semester: course?.semester || 'Fall 2024',
    credits: course?.credits || 3,
    prerequisites: course?.prerequisites.join(', ') || '',
    description: course?.description || '',
    capacity: course?.capacity || 30,
    schedule: course?.schedule || '',
    room: course?.room || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1e293b] border border-white/10' : 'bg-white'}`}
      >
        <div
          className={`sticky top-0 border-b p-6 ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}
        >
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {course ? t('editCourse') : t('createNewCourse')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('courseCode')} *</label>
              <input
                type="text"
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className={inputClass}
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className={labelClass}>{t('credits')} *</label>
              <input
                type="number"
                required
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('courseName')} *</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className={inputClass}
              placeholder="e.g., Introduction to Programming"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('semester')} *</label>
              <input
                type="text"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className={inputClass}
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div>
              <label className={labelClass}>{t('capacity')} *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('schedule')} *</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className={inputClass}
                placeholder="e.g., Mon/Wed 10:00-11:30"
              />
            </div>

            <div>
              <label className={labelClass}>{t('room')} *</label>
              <input
                type="text"
                required
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className={inputClass}
                placeholder="e.g., Room 201"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('prerequisites')}</label>
            <input
              type="text"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              className={inputClass}
              placeholder="e.g., CS100, MATH101 (comma-separated)"
            />
          </div>

          <div>
            <label className={labelClass}>{t('description')}</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              placeholder="Course description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {course ? t('saveChanges') : t('createCourse')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoursesPage;
