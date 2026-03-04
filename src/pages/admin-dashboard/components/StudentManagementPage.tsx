import { useState, useEffect } from 'react';
import { GraduationCap, Search, Filter, Plus, Minus, Wrench, X, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { userService } from '../../../services/api/userService';
import { LoadingSkeleton, ErrorMessage } from '../../../components/shared';
import { toast } from 'sonner';

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  year: string;
  enrolledCourses: string[];
  status: 'active' | 'on-hold' | 'graduated';
}

const availableCourses = [
  'CS101', 'CS103', 'CS201', 'CS203', 'CS301', 'CS303',
  'CS305', 'CS307', 'CS401', 'CS403', 'MATH101', 'MATH201', 'PHY101',
];

const enrollmentConflicts: Record<string, { course: string; conflict: string; resolution: string }[]> = {
  'STU-2024-001': [
    { course: 'CS203', conflict: 'Schedule overlaps with MATH201 (Mon 10-12)', resolution: 'Move to section B (Mon 14-16)' },
  ],
  'STU-2024-003': [
    { course: 'PHY101', conflict: 'Exceeds max credit hours (20/18)', resolution: 'Drop PHY101 or request overload approval' },
  ],
};

type ModalType = 'add-course' | 'remove-course' | 'fix-enrollment' | null;

export function StudentManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const { data: usersRaw, loading, error, refetch } = useApi(() => userService.listUsers(), []);
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => { if (error) toast.error('Failed to load students'); }, [error]);

  useEffect(() => {
    if (usersRaw) {
      const users = Array.isArray(usersRaw) ? usersRaw : usersRaw.data || [];
      setStudents(users
        .filter((u: any) => (u.roles && u.roles.includes('student')) || !u.roles)
        .map((u: any, i: number) => ({
          id: u.userId || u.id || i + 1,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || `Student ${i + 1}`,
          email: u.email || '',
          studentId: u.studentId || `STU${String(i + 1).padStart(4, '0')}`,
          year: u.year || 'Junior',
          enrolledCourses: u.enrolledCourses || [],
          status: u.status === 'active' ? 'active' : u.status === 'graduated' ? 'graduated' : 'on-hold',
        })));
    }
  }, [usersRaw]);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'all' || s.year === yearFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesYear && matchesStatus;
  });

  const openModal = (type: ModalType, student: Student) => {
    setSelectedStudent(student);
    setActiveModal(type);
    setSelectedCourse('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedStudent(null);
    setSelectedCourse('');
  };

  const handleAddCourse = () => {
    if (!selectedStudent || !selectedCourse) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? { ...s, enrolledCourses: [...s.enrolledCourses, selectedCourse] }
          : s
      )
    );
    closeModal();
  };

  const handleRemoveCourse = (course: string) => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? { ...s, enrolledCourses: s.enrolledCourses.filter((c) => c !== course) }
          : s
      )
    );
    closeModal();
  };

  const handleFixConflict = (resolution: string) => {
    // In production this would apply the resolution
    alert(`Applied resolution: ${resolution}`);
    closeModal();
  };

  const statusBadge = (status: Student['status']) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      'on-hold': 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      graduated: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    };
    const labels: Record<string, string> = { active: 'Active', 'on-hold': 'On Hold', graduated: 'Graduated' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const cardClass = `${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl`;
  const headingClass = `${isDark ? 'text-white' : 'text-slate-900'}`;
  const labelClass = `${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40`;
  const rowHoverClass = `${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`;

  const coursesNotEnrolled = selectedStudent
    ? availableCourses.filter((c) => !selectedStudent.enrolledCourses.includes(c))
    : [];

  const conflicts = selectedStudent ? enrollmentConflicts[selectedStudent.studentId] || [] : [];

  if (loading) return <LoadingSkeleton variant="table" count={5} />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${headingClass} flex items-center gap-2`}>
            <GraduationCap className="w-7 h-7 text-blue-500" />
            {t('students') || 'Student Management'}
          </h1>
          <p className={`text-sm mt-1 ${labelClass}`}>Manage department student enrollments and records</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-9 w-full`}
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={`${inputClass} pl-9 pr-8 appearance-none cursor-pointer`}
              >
                <option value="all">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} pr-8 appearance-none cursor-pointer`}
            >
              <option value="all">{t('allStatus') || 'All Status'}</option>
              <option value="active">{t('active') || 'Active'}</option>
              <option value="on-hold">On Hold</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-left`}>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">{t('email') || 'Email'}</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Enrolled Courses</th>
                <th className="px-4 py-3 font-medium">{t('status') || 'Status'}</th>
                <th className="px-4 py-3 font-medium">{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'divide-white/5' : 'divide-slate-100'} divide-y`}>
              {filteredStudents.map((student) => (
                <tr key={student.id} className={`${rowHoverClass} transition-colors`}>
                  <td className={`px-4 py-3 font-medium ${headingClass}`}>{student.name}</td>
                  <td className={`px-4 py-3 ${labelClass} font-mono text-xs`}>{student.studentId}</td>
                  <td className={`px-4 py-3 ${labelClass}`}>{student.email}</td>
                  <td className={`px-4 py-3 ${labelClass}`}>{student.year}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {student.enrolledCourses.length > 0 ? (
                        student.enrolledCourses.map((c) => (
                          <span
                            key={c}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(student.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('add-course', student)}
                        title="Add Course"
                        className="p-1.5 rounded-lg hover:opacity-90 text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openModal('remove-course', student)}
                        title="Remove Course"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openModal('fix-enrollment', student)}
                        title="Fix Enrollment"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center ${labelClass}`}>
                    {t('noData') || 'No students found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-md p-6 relative`}>
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Add Course Modal */}
            {activeModal === 'add-course' && (
              <>
                <h2 className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Add Course — {selectedStudent.name}
                </h2>
                {coursesNotEnrolled.length > 0 ? (
                  <>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Select a course to enroll</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className={`${inputClass} w-full mb-4`}
                    >
                      <option value="">Choose course...</option>
                      {coursesNotEnrolled.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddCourse}
                      disabled={!selectedCourse}
                      className="w-full py-2 rounded-lg hover:opacity-90 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enroll Student
                    </button>
                  </>
                ) : (
                  <p className={`text-sm ${labelClass}`}>Student is already enrolled in all available courses.</p>
                )}
              </>
            )}

            {/* Remove Course Modal */}
            {activeModal === 'remove-course' && (
              <>
                <h2 className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}>
                  <Minus className="w-5 h-5 text-blue-500" />
                  Remove Course — {selectedStudent.name}
                </h2>
                {selectedStudent.enrolledCourses.length > 0 ? (
                  <div className="space-y-2">
                    <p className={`text-sm mb-3 ${labelClass}`}>Click a course to remove it</p>
                    {selectedStudent.enrolledCourses.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleRemoveCourse(c)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isDark
                            ? 'bg-slate-800/50 hover:bg-red-500/10 text-white hover:text-red-400 border border-white/5'
                            : 'bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200'
                        }`}
                      >
                        <span>{c}</span>
                        <X className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${labelClass}`}>Student has no enrolled courses.</p>
                )}
              </>
            )}

            {/* Fix Enrollment Modal */}
            {activeModal === 'fix-enrollment' && (
              <>
                <h2 className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}>
                  <Wrench className="w-5 h-5 text-blue-500" />
                  Fix Enrollment — {selectedStudent.name}
                </h2>
                {conflicts.length > 0 ? (
                  <div className="space-y-3">
                    {conflicts.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}
                      >
                        <p className={`text-sm font-medium ${headingClass}`}>{item.course}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{item.conflict}</p>
                        <button
                          onClick={() => handleFixConflict(item.resolution)}
                          className="mt-2 px-3 py-1.5 rounded-lg hover:opacity-90 text-white text-xs font-medium transition-colors"
                        >
                          {item.resolution}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 ${labelClass}`}>
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No enrollment conflicts found for this student.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
