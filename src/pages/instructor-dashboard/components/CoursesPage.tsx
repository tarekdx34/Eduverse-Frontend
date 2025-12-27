import React, { useState } from 'react';
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
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { CourseDetail } from './CourseDetail';

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
};

// Course background images/gradients
const courseBackgrounds = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple - Calculus
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink - Physics
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue - CS
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green - Digital Logic
];

const courseEmojis = ['📐', '⚛️', '💻', '🔌'];

export function CoursesPage({
  courses,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onViewCourse,
}: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('courseName');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // If viewing course detail, show that instead
  if (selectedCourseId !== null) {
    return (
      <CourseDetail
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
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
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Courses</h2>
          <p className="text-sm text-gray-600">
            Manage and access all your active and archived teaching courses.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-4">
          {/* Semester Filter */}
          <CustomDropdown
            label="Semester:"
            value={semesterFilter}
            options={[
              { value: 'all', label: 'Spring 2025' },
              ...semesters.map((sem) => ({ value: sem, label: sem })),
            ]}
            onChange={setSemesterFilter}
          />

          {/* Status Filter */}
          <CustomDropdown
            label="Status:"
            value={statusFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' },
            ]}
            onChange={(val) => setStatusFilter(val as any)}
          />

          {/* Sort By */}
          <CustomDropdown
            label="Sort By:"
            value={sortBy}
            options={[
              { value: 'courseName', label: 'Course Name' },
              { value: 'courseCode', label: 'Course Code' },
              { value: 'enrolled', label: 'Students' },
            ]}
            onChange={setSortBy}
          />

          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Course Image/Background */}
              <div
                className="h-40 flex items-center justify-center text-7xl relative"
                style={{
                  background: courseBackgrounds[index % courseBackgrounds.length],
                  opacity: 0.85,
                }}
              >
                <span className="opacity-30">{courseEmojis[index % courseEmojis.length]}</span>
              </div>

              {/* Course Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">{course.courseName}</h3>

                {/* Course Type */}
                <div className="text-sm text-gray-600 mb-3">Lecture + Lab</div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users size={14} />
                  <span>{course.enrolled} Students</span>
                </div>

                {/* Next Lecture */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock size={14} />
                  <span>Next Lecture — {course.schedule.split(' ')[0]}, 9:00 AM</span>
                </div>

                {/* Open Course Button */}
                <button
                  onClick={() => setSelectedCourseId(course.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Open Course
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || semesterFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first course'}
            </p>
          </div>
        )}
      </div>

      {/* AI Tools Sidebar */}
      <div className="w-80 space-y-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900">AI Tools for Teaching</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Generate quizzes, summaries, and detect struggling students.
          </p>

          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Create Quiz</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Analyze Course</div>
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
              <input
                type="text"
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credits *</label>
              <input
                type="number"
                required
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Introduction to Programming"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
              <input
                type="text"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Mon/Wed 10:00-11:30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
              <input
                type="text"
                required
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Room 201"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
            <input
              type="text"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., CS100, MATH101 (comma-separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Course description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {course ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoursesPage;
