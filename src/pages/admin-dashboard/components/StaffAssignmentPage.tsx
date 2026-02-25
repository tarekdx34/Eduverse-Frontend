import React, { useState } from 'react';
import { Users, BookOpen, UserPlus, Sparkles, AlertTriangle, CheckCircle, XCircle, Eye, Grid, List } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type FilterType = 'all' | 'needs-instructor' | 'needs-ta' | 'overloaded' | 'ai-suggestions';
type ViewMode = 'grid' | 'list';
type StaffStatus = 'Available' | 'At Capacity' | 'Overloaded';
type CourseStatus = 'Fully Staffed' | 'Needs TA' | 'Needs Instructor' | 'Overloaded';

interface CourseAssignment {
  id: number;
  code: string;
  name: string;
  instructor: string | null;
  taCount: number;
  studentCount: number;
  status: CourseStatus;
}

interface StaffMember {
  id: number;
  name: string;
  department: string;
  workload: number;
  status: StaffStatus;
  role: 'instructor' | 'ta';
}

interface AISuggestion {
  id: number;
  text: string;
}

const courses: CourseAssignment[] = [
  { id: 1, code: 'CS101', name: 'Intro to Programming', instructor: 'Dr. Smith', taCount: 2, studentCount: 120, status: 'Fully Staffed' },
  { id: 2, code: 'CS202', name: 'Data Structures', instructor: 'Dr. Johnson', taCount: 1, studentCount: 95, status: 'Needs TA' },
  { id: 3, code: 'CS303', name: 'Advanced Algorithms', instructor: null, taCount: 0, studentCount: 60, status: 'Needs Instructor' },
  { id: 4, code: 'CS404', name: 'Machine Learning', instructor: 'Dr. Williams', taCount: 3, studentCount: 150, status: 'Overloaded' },
];

const staffMembers: StaffMember[] = [
  { id: 1, name: 'Dr. Smith', department: 'CS Dept', workload: 75, status: 'Available', role: 'instructor' },
  { id: 2, name: 'Dr. Johnson', department: 'CS Dept', workload: 90, status: 'At Capacity', role: 'instructor' },
  { id: 3, name: 'Dr. Williams', department: 'CS Dept', workload: 100, status: 'Overloaded', role: 'instructor' },
  { id: 4, name: 'Dr. Brown', department: 'CS Dept', workload: 40, status: 'Available', role: 'instructor' },
  { id: 5, name: 'Ahmed Hassan', department: 'CS Dept', workload: 60, status: 'Available', role: 'ta' },
  { id: 6, name: 'Sara Ibrahim', department: 'CS Dept', workload: 85, status: 'At Capacity', role: 'ta' },
  { id: 7, name: 'Mohamed Ali', department: 'CS Dept', workload: 45, status: 'Available', role: 'ta' },
  { id: 8, name: 'Nour El-Din', department: 'CS Dept', workload: 95, status: 'At Capacity', role: 'ta' },
];

const aiSuggestions: AISuggestion[] = [
  { id: 1, text: 'Assign Dr. Brown to CS303 (40% workload, matches expertise)' },
  { id: 2, text: 'Add Mohamed Ali as TA for CS202 (45% workload)' },
  { id: 3, text: 'Redistribute CS404 TAs - consider moving 1 TA to CS202' },
];

function getStatusColor(status: CourseStatus) {
  switch (status) {
    case 'Fully Staffed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'Needs TA': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Needs Instructor': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'Overloaded': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  }
}

function getWorkloadBarColor(status: StaffStatus) {
  switch (status) {
    case 'Available': return 'bg-green-500';
    case 'At Capacity': return 'bg-yellow-500';
    case 'Overloaded': return 'bg-red-500';
  }
}

export function StaffAssignmentPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
  const [modalData, setModalData] = useState({ courseId: 0, role: 'instructor' as 'instructor' | 'ta', staffId: 0 });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'needs-instructor', label: 'Needs Instructor' },
    { key: 'needs-ta', label: 'Needs TA' },
    { key: 'overloaded', label: 'Overloaded' },
    { key: 'ai-suggestions', label: 'AI Suggestions' },
  ];

  const filteredCourses = courses.filter(c => {
    if (activeFilter === 'all' || activeFilter === 'ai-suggestions') return true;
    if (activeFilter === 'needs-instructor') return c.status === 'Needs Instructor';
    if (activeFilter === 'needs-ta') return c.status === 'Needs TA';
    if (activeFilter === 'overloaded') return c.status === 'Overloaded';
    return true;
  });

  const instructors = staffMembers.filter(s => s.role === 'instructor');
  const tas = staffMembers.filter(s => s.role === 'ta');
  const visibleSuggestions = aiSuggestions.filter(s => !dismissedSuggestions.includes(s.id));
  const filteredStaffByRole = staffMembers.filter(s => s.role === modalData.role);

  const openAssignModal = (courseId?: number) => {
    setModalData({ courseId: courseId || 0, role: 'instructor', staffId: 0 });
    setShowAssignModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Staff Assignment</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage course staff assignments and workload distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${viewMode === 'grid' ? (isDark ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${viewMode === 'list' ? (isDark ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => openAssignModal()}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <UserPlus size={18} />
            Assign Staff
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? 'bg-rose-600 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Assignments Grid */}
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Assignments</h2>
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-rose-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.code}</span>
                  </div>
                  <h3 className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                  {course.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Users size={14} />
                  <span>Instructor: {course.instructor || <span className="text-red-500 font-medium">Unassigned</span>}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Users size={14} />
                  <span>{course.taCount} TA{course.taCount !== 1 ? 's' : ''}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Users size={14} />
                  <span>{course.studentCount} Students</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAssignModal(course.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors"
                >
                  <UserPlus size={14} />
                  Assign
                </button>
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Eye size={14} />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Availability Panel */}
      <div className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Staff Availability</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructors */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Instructors ({instructors.length})</h3>
            <div className="space-y-3">
              {instructors.map(staff => (
                <div key={staff.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{staff.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{staff.department}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      staff.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      staff.status === 'At Capacity' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {staff.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className={`h-2 rounded-full ${getWorkloadBarColor(staff.status)}`} style={{ width: `${staff.workload}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{staff.workload}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* TAs */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>TAs ({tas.length})</h3>
            <div className="space-y-3">
              {tas.map(staff => (
                <div key={staff.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{staff.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{staff.department}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      staff.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      staff.status === 'At Capacity' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {staff.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className={`h-2 rounded-full ${getWorkloadBarColor(staff.status)}`} style={{ width: `${staff.workload}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{staff.workload}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      <div className={`rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-rose-500" />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Suggestions</h2>
        </div>
        {visibleSuggestions.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No suggestions available.</p>
        ) : (
          <div className="space-y-3">
            {visibleSuggestions.map(suggestion => (
              <div key={suggestion.id} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{suggestion.text}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle size={14} />
                    Accept
                  </button>
                  <button
                    onClick={() => setDismissedSuggestions(prev => [...prev, suggestion.id])}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <XCircle size={14} />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assign Staff</h3>
              <button onClick={() => setShowAssignModal(false)} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAssignModal(false); }} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Course</label>
                <select
                  value={modalData.courseId}
                  onChange={(e) => setModalData(prev => ({ ...prev, courseId: Number(e.target.value) }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value={0}>Select a course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select
                  value={modalData.role}
                  onChange={(e) => setModalData(prev => ({ ...prev, role: e.target.value as 'instructor' | 'ta', staffId: 0 }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value="instructor">Instructor</option>
                  <option value="ta">TA</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Staff Member</label>
                <select
                  value={modalData.staffId}
                  onChange={(e) => setModalData(prev => ({ ...prev, staffId: Number(e.target.value) }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value={0}>Select staff member</option>
                  {filteredStaffByRole.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.workload}% workload)</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAssignmentPage;
