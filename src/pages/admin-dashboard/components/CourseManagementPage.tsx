import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, BookOpen, Users, Clock, Download, Calendar, ClipboardList, UserCheck } from 'lucide-react';
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
  instructorId: number;
  taIds: number[];
  prerequisites: string[];
}

interface CourseManagementPageProps {
  courses: Course[];
  users: { id: number; name: string; role: string; department: string }[];
  adminDepartment: string;
  onAddCourse: (course: any) => void;
  onEditCourse: (id: number, course: any) => void;
  onDeleteCourse: (id: number) => void;
}

export function CourseManagementPage({ courses, users, adminDepartment, onAddCourse, onEditCourse, onDeleteCourse }: CourseManagementPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'staff' | 'schedule' | 'exams'>('courses');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({ courseId: 0, instructorId: 0, taIds: [] as number[] });

  // Form state for controlled form
  const [formData, setFormData] = useState({
    code: '', name: '', department: adminDepartment, semester: 'Fall 2025',
    credits: 3, capacity: 100, instructorId: 0, instructor: '', taIds: [] as number[],
  });

  const deptCourses = courses.filter(c => c.department === adminDepartment);
  const deptInstructors = users.filter(u => u.role === 'instructor' && u.department === adminDepartment);
  const deptTAs = users.filter(u => u.role === 'ta' && u.department === adminDepartment);

  const filteredCourses = deptCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(deptCourses.map(c => c.department))];

  const openAddModal = () => {
    setFormData({ code: '', name: '', department: adminDepartment, semester: 'Fall 2025', credits: 3, capacity: 100, instructorId: 0, instructor: '', taIds: [] });
    setShowAddModal(true);
  };

  const openEditModal = (course: Course) => {
    setFormData({ code: course.code, name: course.name, department: course.department, semester: course.semester, credits: course.credits, capacity: course.capacity, instructorId: course.instructorId || 0, instructor: course.instructor, taIds: course.taIds || [] });
    setEditingCourse(course);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, prerequisites: editingCourse?.prerequisites || [] };
    if (editingCourse) {
      onEditCourse(editingCourse.id, payload);
      setEditingCourse(null);
    } else {
      onAddCourse(payload);
      setShowAddModal(false);
    }
  };

  const toggleTA = (taId: number) => {
    setFormData(prev => ({
      ...prev,
      taIds: prev.taIds.includes(taId) ? prev.taIds.filter(id => id !== taId) : [...prev.taIds, taId],
    }));
  };

  const getTANames = (taIds: number[]) => {
    return taIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  const mockScheduleData = [
    { id: 1, courseCode: deptCourses[0]?.code || 'CS101', courseName: deptCourses[0]?.name || 'Intro to CS', day: 'Monday', time: '09:00 - 10:30', room: 'Hall A-201', instructor: deptCourses[0]?.instructor || 'TBA' },
    { id: 2, courseCode: deptCourses[1]?.code || 'CS201', courseName: deptCourses[1]?.name || 'Data Structures', day: 'Tuesday', time: '11:00 - 12:30', room: 'Hall B-105', instructor: deptCourses[1]?.instructor || 'TBA' },
    { id: 3, courseCode: deptCourses[0]?.code || 'CS101', courseName: deptCourses[0]?.name || 'Intro to CS', day: 'Wednesday', time: '09:00 - 10:30', room: 'Hall A-201', instructor: deptCourses[0]?.instructor || 'TBA' },
    { id: 4, courseCode: deptCourses[2]?.code || 'CS301', courseName: deptCourses[2]?.name || 'Algorithms', day: 'Thursday', time: '14:00 - 15:30', room: 'Lab C-302', instructor: deptCourses[2]?.instructor || 'TBA' },
  ];

  const mockExamData = [
    { id: 1, courseCode: deptCourses[0]?.code || 'CS101', courseName: deptCourses[0]?.name || 'Intro to CS', date: '2025-03-15', time: '09:00 - 11:00', room: 'Exam Hall 1', type: 'Midterm' as const },
    { id: 2, courseCode: deptCourses[1]?.code || 'CS201', courseName: deptCourses[1]?.name || 'Data Structures', date: '2025-03-16', time: '13:00 - 15:00', room: 'Exam Hall 2', type: 'Midterm' as const },
    { id: 3, courseCode: deptCourses[0]?.code || 'CS101', courseName: deptCourses[0]?.name || 'Intro to CS', date: '2025-06-10', time: '09:00 - 12:00', room: 'Exam Hall 1', type: 'Final' as const },
    { id: 4, courseCode: deptCourses[2]?.code || 'CS301', courseName: deptCourses[2]?.name || 'Algorithms', date: '2025-06-12', time: '14:00 - 17:00', room: 'Exam Hall 3', type: 'Final' as const },
  ];

  const toggleStaffTA = (taId: number) => {
    setStaffFormData(prev => ({
      ...prev,
      taIds: prev.taIds.includes(taId) ? prev.taIds.filter(id => id !== taId) : [...prev.taIds, taId],
    }));
  };

  const handleStaffAssign = () => {
    const course = deptCourses.find(c => c.id === staffFormData.courseId);
    if (course) {
      const inst = deptInstructors.find(i => i.id === staffFormData.instructorId);
      onEditCourse(course.id, { ...course, instructorId: staffFormData.instructorId, instructor: inst?.name || course.instructor, taIds: staffFormData.taIds });
    }
    setShowStaffModal(false);
  };

  const thClass = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const tdClass = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('courseManagement')}</h1>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{adminDepartment}</span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageCoursesSub')}</p>
        </div>
        {activeSubTab === 'courses' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            {t('addCourse')}
          </button>
        )}
      </div>

      {/* Sub-Tab Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {([
          { key: 'courses' as const, label: 'Courses', icon: BookOpen },
          { key: 'staff' as const, label: 'Staff Assignment', icon: UserCheck },
          { key: 'schedule' as const, label: 'Schedule', icon: Calendar },
          { key: 'exams' as const, label: 'Exam Schedule', icon: ClipboardList },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.key
                ? ''
                : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ COURSES TAB ============ */}
      {activeSubTab === 'courses' && (
        <>
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
                    {course.taIds && course.taIds.length > 0 && (
                      <p>{t('assignedTAs')}: {getTANames(course.taIds)}</p>
                    )}
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
                      onClick={() => openEditModal(course)}
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
        </>
      )}

      {/* ============ STAFF ASSIGNMENT TAB ============ */}
      {activeSubTab === 'staff' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Staff Assignment</h2>
            <button
              onClick={() => { setStaffFormData({ courseId: deptCourses[0]?.id || 0, instructorId: 0, taIds: [] }); setShowStaffModal(true); }}
              className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserCheck size={18} />
              Assign Staff
            </button>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>Course</th>
                    <th className={thClass}>Code</th>
                    <th className={thClass}>Instructor</th>
                    <th className={thClass}>Teaching Assistants</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {deptCourses.map(course => (
                    <tr key={course.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                      <td className={tdClass + ' font-medium'}>{course.name}</td>
                      <td className={tdClass}>{course.code}</td>
                      <td className={tdClass}>{course.instructor || <span className="text-gray-400 italic">Unassigned</span>}</td>
                      <td className={tdClass}>{course.taIds?.length ? getTANames(course.taIds) : <span className="text-gray-400 italic">None</span>}</td>
                      <td className={tdClass}>
                        <button
                          onClick={() => { setStaffFormData({ courseId: course.id, instructorId: course.instructorId || 0, taIds: course.taIds || [] }); setShowStaffModal(true); }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Assignment Modal */}
          {showStaffModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Assign Staff</h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Course</label>
                    <select
                      value={staffFormData.courseId}
                      onChange={(e) => setStaffFormData({ ...staffFormData, courseId: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    >
                      {deptCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Instructor</label>
                    <select
                      value={staffFormData.instructorId}
                      onChange={(e) => setStaffFormData({ ...staffFormData, instructorId: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    >
                      <option value={0}>Select Instructor</option>
                      {deptInstructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Teaching Assistants</label>
                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      {deptTAs.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No TAs available</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {deptTAs.map(ta => (
                            <button
                              key={ta.id}
                              type="button"
                              onClick={() => toggleStaffTA(ta.id)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                staffFormData.taIds.includes(ta.id)
                                  ? ''
                                  : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {ta.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowStaffModal(false)}
                      className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Cancel
                    </button>
                    <button onClick={handleStaffAssign} className="px-4 py-2  text-white rounded-lg hover:bg-blue-700">
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ SCHEDULE TAB ============ */}
      {activeSubTab === 'schedule' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Class Schedule</h2>
            <button className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={18} />
              Add Schedule
            </button>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>Course</th>
                    <th className={thClass}>Day</th>
                    <th className={thClass}>Time</th>
                    <th className={thClass}>Room</th>
                    <th className={thClass}>Instructor</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {mockScheduleData.map(row => (
                    <tr key={row.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                      <td className={tdClass + ' font-medium'}>{row.courseCode} - {row.courseName}</td>
                      <td className={tdClass}>{row.day}</td>
                      <td className={tdClass}>{row.time}</td>
                      <td className={tdClass}>{row.room}</td>
                      <td className={tdClass}>{row.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============ EXAM SCHEDULE TAB ============ */}
      {activeSubTab === 'exams' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Exam Schedule</h2>
            <button className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={18} />
              Add Exam
            </button>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>Course</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Time</th>
                    <th className={thClass}>Room</th>
                    <th className={thClass}>Type</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {mockExamData.map(row => (
                    <tr key={row.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                      <td className={tdClass + ' font-medium'}>{row.courseCode} - {row.courseName}</td>
                      <td className={tdClass}>{row.date}</td>
                      <td className={tdClass}>{row.time}</td>
                      <td className={tdClass}>{row.room}</td>
                      <td className={tdClass}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.type === 'Midterm'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Course Modal (visible from Courses tab) */}
      {(showAddModal || editingCourse) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingCourse ? t('editCourse') : t('addCourse')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('courseCode')}</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('credits')}</label>
                  <input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('courseName')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('semester')}</label>
                <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                </select>
              </div>
              {/* Instructor Dropdown */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('assignInstructor')}</label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => {
                    const inst = deptInstructors.find(i => i.id === Number(e.target.value));
                    setFormData({ ...formData, instructorId: Number(e.target.value), instructor: inst?.name || '' });
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                >
                  <option value={0}>{t('selectInstructor')}</option>
                  {deptInstructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              {/* TA Multi-Select */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('assignTA')}</label>
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  {deptTAs.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No TAs available in this department</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {deptTAs.map(ta => (
                        <button
                          key={ta.id}
                          type="button"
                          onClick={() => toggleTA(ta.id)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.taIds.includes(ta.id)
                              ? 'bg-red-600 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {ta.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('capacity')}</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
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
