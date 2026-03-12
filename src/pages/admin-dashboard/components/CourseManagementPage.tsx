import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, BookOpen, Users, Clock, Download, Calendar, ClipboardList, UserCheck, Pencil, AlertCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect, Tooltip } from '../../../components/shared';


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
  level: string;
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

  type ModalType = 'add-course' | 'edit-course' | 'staff-assign' | 'delete-course';
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'staff' | 'schedule' | 'exams'>('courses');
  const [staffFormData, setStaffFormData] = useState({ courseId: 0, instructorId: 0, taIds: [] as number[] });

  const [formData, setFormData] = useState({
    code: '', name: '', department: adminDepartment, semester: 'Fall 2025',
    credits: 3, capacity: 100, level: 'FRESHMAN', status: 'ACTIVE', instructorId: 0, instructor: '', taIds: [] as number[],
  });

  const headingClass = `${isDark ? 'text-white' : 'text-slate-900'}`;
  const labelClass = `${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200`;

  const deptCourses = courses.filter(c => c.department === adminDepartment);
  const deptInstructors = users.filter(u => u.role === 'instructor' && u.department === adminDepartment);
  const deptTAs = users.filter(u => u.role === 'ta' && u.department === adminDepartment);

  const filteredCourses = deptCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || course.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(deptCourses.map(c => c.department))];

  const openModal = (type: ModalType, course?: Course) => {
    if (course) {
      setSelectedCourse(course);
      setFormData({
        code: course.code,
        name: course.name,
        department: course.department,
        semester: course.semester,
        credits: course.credits,
        capacity: course.capacity,
        level: (course as any).level || 'FRESHMAN',
        status: (course as any).status || 'ACTIVE',
        instructorId: course.instructorId || 0,
        instructor: course.instructor,
        taIds: course.taIds || []
      });
      if (type === 'staff-assign') {
        setStaffFormData({
          courseId: course.id,
          instructorId: course.instructorId || 0,
          taIds: course.taIds || []
        });
      }
    } else {
      setSelectedCourse(null);
      setFormData({
        code: '',
        name: '',
        department: adminDepartment,
        semester: 'Fall 2025',
        credits: 3,
        capacity: 100,
        level: 'FRESHMAN',
        instructorId: 0,
        instructor: '',
        taIds: []
      });
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, prerequisites: selectedCourse?.prerequisites || [] };
    if (activeModal === 'edit-course' && selectedCourse) {
      onEditCourse(selectedCourse.id, payload);
      closeModal();
    } else if (activeModal === 'add-course') {
      onAddCourse(payload);
      closeModal();
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
    const courseId = selectedCourse ? selectedCourse.id : staffFormData.courseId;
    if (!courseId) return;
    
    const targetCourse = deptCourses.find(c => c.id === courseId);
    if (!targetCourse && !selectedCourse) return;
    
    const inst = deptInstructors.find(i => i.id === staffFormData.instructorId);
    
    onEditCourse(courseId, {
      ...(targetCourse || selectedCourse),
      instructorId: staffFormData.instructorId,
      instructor: inst?.name || (targetCourse || selectedCourse).instructor,
      taIds: staffFormData.taIds
    });
    closeModal();
  };

  const thClass = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const tdClass = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  
  const getExamStyles = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case 'midterm': return { bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', text: isDark ? 'text-amber-500' : 'text-amber-700', border: isDark ? 'border-amber-500/20' : 'border-amber-200' };
      case 'final': return { bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50', text: isDark ? 'text-rose-500' : 'text-rose-700', border: isDark ? 'border-rose-500/20' : 'border-rose-200' };
      default: return { bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50', text: isDark ? 'text-slate-400' : 'text-slate-700', border: isDark ? 'border-slate-500/20' : 'border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold leading-none m-0 ${headingClass}`}>
              {t('courseManagement') || 'Course Management'}
            </h1>
            <span 
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0 flex items-center gap-1.5"
              style={{ 
                backgroundColor: `${accentColor}10`, 
                color: accentColor,
                borderColor: `${accentColor}20`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              {adminDepartment}
            </span>
          </div>
          <p className={`text-sm mt-2.5 ${labelClass}`}>
            {t('manageCoursesSub') || 'Manage and organize academic courses, staff assignments, and schedules.'}
          </p>
        </div>
        {activeSubTab === 'courses' && (
          <button
            onClick={() => openModal('add-course')}
            style={{ backgroundColor: accentColor }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            {t('addCourse') || 'Add Course'}
          </button>
        )}
        {activeSubTab === 'schedule' && (
          <button
            style={{ backgroundColor: accentColor }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            {t('addSchedule') || 'Add Schedule'}
          </button>
        )}
        {activeSubTab === 'exams' && (
          <button
            style={{ backgroundColor: accentColor }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            {t('addExam') || 'Add Exam'}
          </button>
        )}
      </div>

      {/* Sub-Tab Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {([
          { key: 'courses' as const, label: t('coursesTab'), icon: BookOpen },
          { key: 'staff' as const, label: t('staffAssignmentTab'), icon: UserCheck },
          { key: 'schedule' as const, label: t('scheduleTab'), icon: Calendar },
          { key: 'exams' as const, label: t('examsTab'), icon: ClipboardList },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.key
                ? 'text-white'
                : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={activeSubTab === tab.key ? { backgroundColor: accentColor } : {}}
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
          <div className="p-0 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                  <input
                    type="text"
                    placeholder={t('searchCourses')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} w-full pl-10 pr-4`}
                    style={{ borderColor: searchTerm ? accentColor : undefined }}
                    onFocus={(e) => (e.target.style.borderColor = accentColor)}
                    onBlur={(e) => (e.target.style.borderColor = searchTerm ? accentColor : (isDark ? '#334155' : '#e2e8f0'))}
                  />
                </div>
              </div>
              <CleanSelect
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={`${inputClass} cursor-pointer min-w-[120px]`}
                style={{ borderColor: departmentFilter !== 'all' ? accentColor : undefined }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = departmentFilter !== 'all' ? accentColor : (isDark ? '#334155' : '#e2e8f0'))}
              >
                <option value="all">{t('allDepartments')}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </CleanSelect>
              <CleanSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} cursor-pointer min-w-[120px]`}
                style={{ borderColor: statusFilter !== 'all' ? accentColor : undefined }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = statusFilter !== 'all' ? accentColor : (isDark ? '#334155' : '#e2e8f0'))}
              >
                <option value="all">{t('allStatus')}</option>
                <option value="ACTIVE">{t('active')}</option>
                <option value="ARCHIVED">{t('archived')}</option>
              </CleanSelect>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <Download size={18} />
                {t('export')}
              </button>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <div key={course.id} className={`rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-[#1e293b]/80 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div 
                  className="h-20 flex items-center justify-center relative rounded-t-2xl"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                >
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                    <BookOpen size={80} strokeWidth={1} />
                  </div>
                  <BookOpen className="text-white relative z-10" size={32} />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-700'}`}>
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
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1.5">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('enrollment')}</span>
                      <span style={{ color: accentColor }}>{Math.round((course.enrolled / course.capacity) * 100)}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(course.enrolled / course.capacity) * 100}%`,
                          backgroundColor: accentColor
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-500/10">
                    <Tooltip text="Edit Course" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('edit-course', course)}
                        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                          isDark ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Pencil size={18} />
                      </button>
                    </Tooltip>
                    
                    <Tooltip text="Delete Course" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('delete-course', course)}
                        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                          isDark ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </Tooltip>
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
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('staffAssignment') || 'Staff Assignment'}</h2>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>{t('course') || 'Course'}</th>
                    <th className={thClass}>{t('courseCode') || 'Code'}</th>
                    <th className={thClass}>{t('instructor') || 'Instructor'}</th>
                    <th className={thClass}>{t('assignedTAs') || 'Teaching Assistants'}</th>
                    <th className={thClass}>{t('actions') || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {deptCourses.map(course => (
                    <tr key={course.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                      <td className={tdClass + ' font-medium'}>{course.name}</td>
                      <td className={tdClass}>{course.code}</td>
                      <td className={tdClass}>{course.instructor || <span className="text-gray-400 italic">{t('unassigned')}</span>}</td>
                      <td className={tdClass}>{course.taIds?.length ? getTANames(course.taIds) : <span className="text-gray-400 italic">{t('none')}</span>}</td>
                      <td className={tdClass}>
                        <button
                          onClick={() => openModal('staff-assign', course)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-95 hover:opacity-90"
                          style={{ backgroundColor: accentColor }}
                        >
                          {t('assign')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      {/* ============ SCHEDULE TAB ============ */}
      {activeSubTab === 'schedule' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('classSchedule')}</h2>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>{t('course') || 'Course'}</th>
                    <th className={thClass}>{t('day') || 'Day'}</th>
                    <th className={thClass}>{t('time') || 'Time'}</th>
                    <th className={thClass}>{t('room') || 'Room'}</th>
                    <th className={thClass}>{t('instructor') || 'Instructor'}</th>
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
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('examScheduleTitle')}</h2>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={thClass}>{t('course') || 'Course'}</th>
                    <th className={thClass}>{t('date') || 'Date'}</th>
                    <th className={thClass}>{t('time') || 'Time'}</th>
                    <th className={thClass}>{t('room') || 'Room'}</th>
                    <th className={thClass}>{t('type') || 'Type'}</th>
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
                        {(() => {
                          const styles = getExamStyles(row.type);
                          return (
                            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
                              {row.type}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Unified Modal Rendering */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border w-full max-w-lg rounded-2xl shadow-2xl relative`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between rounded-t-2xl`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeModal === 'add-course' && t('addCourse')}
                {activeModal === 'edit-course' && t('editCourse')}
                {activeModal === 'staff-assign' && t('staffAssignment')}
                {activeModal === 'delete-course' && t('deleteCourse')}
              </h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Add/Edit Course Content */}
              {(activeModal === 'add-course' || activeModal === 'edit-course') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('courseCode')}</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('credits')}</label>
                      <input
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('courseName')}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      onFocus={(e) => (e.target.style.borderColor = accentColor)}
                      onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('semester')}</label>
                      <CleanSelect
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                      >
                        <option value="Fall 2025">Fall 2025</option>
                        <option value="Spring 2026">Spring 2026</option>
                        <option value="Summer 2026">Summer 2026</option>
                      </CleanSelect>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('capacity')}</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Course Level</label>
                    <CleanSelect
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className={`${inputClass} w-full cursor-pointer`}
                      onFocus={(e) => (e.target.style.borderColor = accentColor)}
                      onBlur={(e) => (e.target.style.borderColor = '')}
                    >
                      <option value="FRESHMAN">Freshman</option>
                      <option value="SOPHOMORE">Sophomore</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="SENIOR">Senior</option>
                      <option value="GRADUATE">Graduate</option>
                    </CleanSelect>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: accentColor }}
                      className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      {activeModal === 'edit-course' ? t('save') : t('addCourse')}
                    </button>
                  </div>
                </form>
              )}

              {/* Staff Assign Content */}
              {activeModal === 'staff-assign' && (
                <div className="space-y-4">
                  {selectedCourse ? (
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Assigning Staff For</p>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedCourse.code}: {selectedCourse.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Select Course</label>
                      <CleanSelect
                        value={staffFormData.courseId}
                        onChange={(e) => setStaffFormData({ ...staffFormData, courseId: Number(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                      >
                        <option value={0}>Choose a course...</option>
                        {deptCourses.map(c => (
                          <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                        ))}
                      </CleanSelect>
                    </div>
                  )}
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Instructor</label>
                    <CleanSelect
                      value={staffFormData.instructorId}
                      onChange={(e) => setStaffFormData({ ...staffFormData, instructorId: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      onFocus={(e) => (e.target.style.borderColor = accentColor)}
                      onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                    >
                      <option value={0}>Select Instructor</option>
                      {deptInstructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </CleanSelect>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Teaching Assistants</label>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      {deptTAs.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No TAs available</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {deptTAs.map(ta => (
                            <button
                              key={ta.id}
                              type="button"
                              onClick={() => toggleStaffTA(ta.id)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                staffFormData.taIds.includes(ta.id)
                                  ? 'text-white'
                                  : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                              style={staffFormData.taIds.includes(ta.id) ? { backgroundColor: accentColor } : {}}
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
                      onClick={closeModal}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStaffAssign}
                      style={{ backgroundColor: accentColor }}
                      className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      Assign Staff
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Course Content */}
              {activeModal === 'delete-course' && selectedCourse && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-500">Irreversible Action</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        All enrollments for this course will be permanently lost.
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`text-sm mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deleting Course</p>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedCourse.code}: {selectedCourse.name}
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      This course currently has {selectedCourse.enrolled} students enrolled.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Keep Course
                    </button>
                    <button
                      onClick={() => {
                        onDeleteCourse(selectedCourse.id);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
                    >
                      Delete Course
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagementPage;
