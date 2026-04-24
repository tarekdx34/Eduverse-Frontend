import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../../../services/adminService';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Minus,
  Wrench,
  X,
  Trash2,
  BookOpen,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveApiSession } from '../../../hooks/useLiveApiSession';
import { CleanSelect } from '../../../components/shared';
import { ADMIN_DEPARTMENT } from '../constants';

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  year: string;
  status: 'active' | 'on-hold' | 'graduated';
}

const mockStudents: Student[] = [];
const mockExamData: any[] = [];
const availableCourses: string[] = [];
const enrollmentConflicts: Record<
  string,
  { course: string; conflict: string; resolution: string }[]
> = {};

type ModalType =
  | 'add-course'
  | 'remove-course'
  | 'fix-enrollment'
  | 'edit-student'
  | 'delete-student'
  | null;

export function StudentManagementPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { language, setLanguage, isRTL, t } = useLanguage();
  const useLiveApi = useLiveApiSession();
  const isMockMode = !useLiveApi;

  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['admin-students', searchTerm, statusFilter],
    queryFn: () => adminService.getAllStudents(searchTerm),
    enabled: !isMockMode,
  });

  const enrollmentModalOpen =
    !!selectedStudent &&
    (activeModal === 'edit-student' ||
      activeModal === 'remove-course' ||
      activeModal === 'add-course');

  const { data: selectionEnrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['admin-student-enrollments', selectedStudent?.id],
    queryFn: () => adminService.getStudentEnrollments(selectedStudent!.id),
    enabled: !isMockMode && enrollmentModalOpen && !!selectedStudent?.id,
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Student updated', {
        description: 'Profile information has been saved successfully.',
      });
      closeModal();
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error?.response?.data?.message || 'Failed to update student profile',
      });
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: any) => adminService.createStudent(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setShowAddStudentModal(false);
      setNewStudent({ firstName: '', lastName: '', email: '', password: '', phone: '' });
      setFormError(null);
      toast.success('Student account created successfully!', {
        description: `${data.user.firstName} ${data.user.lastName} has been registered.`,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to create student';
      setFormError(message);
      toast.error('Registration failed', {
        description: message,
      });
    },
  });

  const dropEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: number) => adminService.dropStudentEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-student-enrollments'] });
      toast.success('Course removed', { description: 'Enrollment has been dropped.' });
      closeModal();
    },
    onError: (error: any) => {
      toast.error('Drop failed', {
        description: error?.message || 'Could not remove this enrollment.',
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Student deleted', {
        description: 'The student record has been permanently removed.',
      });
      closeModal();
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['admin-students'] });
        toast.info('Account already removed', {
          description: 'The student record had already been deleted.',
        });
        closeModal();
      } else {
        toast.error('Delete failed', {
          description: error?.response?.data?.message || 'Failed to delete student',
        });
      }
    },
  });

  const students = useMemo(() => {
    if (isMockMode) return mockStudents;
    if (!studentsData) return [];
    const list = studentsData.data || (Array.isArray(studentsData) ? studentsData : []);
    return list.map((user: any) => {
      const id = user.userId;
      return {
        id,
        studentId: user.studentId || `STU-2026-${id.toString().padStart(3, '0')}`,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        year: user.year || '4th',
        status:
          user.status === 'active'
            ? 'active'
            : user.status === 'graduated'
              ? 'graduated'
              : 'on-hold',
      };
    });
  }, [studentsData, isMockMode]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesYear = yearFilter === 'all' || s.year === yearFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesYear && matchesStatus;
    });
  }, [students, yearFilter, statusFilter]);

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
    toast.success('Course added', {
      description: `${selectedCourse} has been added to ${selectedStudent.name}'s schedule.`,
    });
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
    const labels: Record<string, string> = {
      active: 'Active',
      'on-hold': 'On Hold',
      graduated: 'Graduated',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const cardClass = `${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl`;
  const headingClass = `${isDark ? 'text-white' : 'text-slate-900'}`;
  const labelClass = `${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200`;

  // Custom focus ring style using the accent color
  const getFocusStyle = (isFocused: boolean) => ({
    borderColor: isFocused ? accentColor : undefined,
    boxShadow: isFocused ? `0 0 0 2px ${accentColor}33` : undefined,
  });

  const rowHoverClass = `${isDark ? 'hover:bg-blue-500/5' : 'hover:bg-slate-50'}`;
  const thClass = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400 border-b border-white/5' : 'text-slate-500 border-b border-slate-100'}`;

  const enrolledCourseCodes = new Set(
    (selectionEnrollments || []).map((e: any) => e.course?.code).filter(Boolean),
  );
  const coursesNotEnrolled = selectedStudent
    ? availableCourses.filter((c) => !enrolledCourseCodes.has(c))
    : [];

  const conflicts = selectedStudent ? enrollmentConflicts[selectedStudent.studentId] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold leading-none m-0 ${headingClass}`}>
              {t('students') || 'Students'}
            </h1>
            <span
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}10`,
                color: accentColor,
                borderColor: `${accentColor}20`,
              }}
            >
              {ADMIN_DEPARTMENT}
            </span>
          </div>
          <p className={`text-sm mt-2.5 ${labelClass}`}>
            Manage department student enrollments and records
          </p>
        </div>
        <button
          onClick={() => setShowAddStudentModal(true)}
          style={{ backgroundColor: accentColor }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters - Minimal & Clean */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-9 w-full`}
              onFocus={(e) => {
                e.target.style.borderColor = accentColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
              }}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <CleanSelect
              value={yearFilter}
              onChange={(e: any) => setYearFilter(e.target.value)}
              className={`${inputClass} cursor-pointer min-w-[120px]`}
            >
              <option value="all">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </CleanSelect>

            <CleanSelect
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className={`${inputClass} cursor-pointer min-w-[120px]`}
            >
              <option value="all">{t('allStatus') || 'All Status'}</option>
              <option value="active">{t('active') || 'Active'}</option>
              <option value="on-hold">On Hold</option>
              <option value="graduated">Graduated</option>
            </CleanSelect>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${isDark ? 'bg-slate-800/30' : 'bg-slate-50/50'}`}>
                <th className={thClass}>Name</th>
                <th className={thClass}>Student ID</th>
                <th className={thClass}>{t('email') || 'Email'}</th>
                <th className={thClass}>Year</th>
                <th className={thClass}>{t('status') || 'Status'}</th>
                <th className={thClass}>{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'divide-white/5' : 'divide-slate-100'} divide-y`}>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className={`${rowHoverClass} transition-colors`}>
                    <td className={`px-4 py-3 font-medium ${headingClass}`}>{student.name}</td>
                    <td className={`px-4 py-3 ${labelClass} font-mono text-xs`}>
                      {student.studentId}
                    </td>
                    <td className={`px-4 py-3 ${labelClass}`}>{student.email}</td>
                    <td className={`px-4 py-3 ${labelClass}`}>{student.year}</td>
                    <td className="px-4 py-3">{statusBadge(student.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        {/* Info & Settings */}
                        <div className="flex items-center gap-1.5">
                          <Tooltip text="Edit Student" accentColor={accentColor}>
                            <button
                              onClick={() => openModal('edit-student', student)}
                              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                                isDark
                                  ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip text="Fix Enrollment" accentColor={accentColor}>
                            <button
                              onClick={() => openModal('fix-enrollment', student)}
                              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                                isDark
                                  ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500'
                                  : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                              }`}
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>

                        {/* Course Operations */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-500/5">
                          <Tooltip text="Add Course" accentColor={accentColor}>
                            <button
                              onClick={() => openModal('add-course', student)}
                              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                              className="p-1.5 rounded-lg hover:bg-opacity-25 transition-all duration-200 active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip text="Remove Course" accentColor={accentColor}>
                            <button
                              onClick={() => openModal('remove-course', student)}
                              style={{
                                backgroundColor: isDark
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                              }}
                              className="p-1.5 rounded-lg hover:bg-opacity-25 transition-all duration-200 active:scale-95"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>

                        {/* Danger Zone */}
                        <Tooltip text="Delete Student" accentColor={accentColor}>
                          <button
                            onClick={() => openModal('delete-student', student)}
                            className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                              isDark
                                ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                                : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={`px-4 py-12 text-center ${labelClass}`}>
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
          <div
            className={`${cardClass} w-full p-6 relative ${
              activeModal === 'edit-student' ? 'max-w-lg' : 'max-w-md'
            }`}
          >
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
                <h2
                  className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
                >
                  <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
                  Add Course — {selectedStudent.name}
                </h2>
                {coursesNotEnrolled.length > 0 ? (
                  <>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                      Select a course to enroll
                    </label>
                    <CleanSelect
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className={`${inputClass} w-full mb-4`}
                    >
                      <option value="">Choose course...</option>
                      {coursesNotEnrolled.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </CleanSelect>
                    <button
                      onClick={handleAddCourse}
                      disabled={!selectedCourse}
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 10px 15px -3px ${accentColor}33, 0 4px 6px -4px ${accentColor}33`,
                      }}
                      className="w-full py-2.5 rounded-xl hover:opacity-90 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                    >
                      Enroll Student
                    </button>
                  </>
                ) : (
                  <p className={`text-sm ${labelClass}`}>
                    Student is already enrolled in all available courses.
                  </p>
                )}
              </>
            )}

            {/* Remove Course Modal */}
            {activeModal === 'remove-course' && (
              <>
                <h2
                  className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
                >
                  <Minus className="w-5 h-5" style={{ color: accentColor }} />
                  Remove Course — {selectedStudent.name}
                </h2>
                {enrollmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : selectionEnrollments && selectionEnrollments.length > 0 ? (
                  <div className="space-y-2">
                    <p className={`text-sm mb-3 ${labelClass}`}>
                      Drops the enrollment (admin). Only active enrollments can be removed.
                    </p>
                    {selectionEnrollments.map((e: any) => {
                      const label = e.course
                        ? `${e.course.code} — ${e.course.name}`
                        : `Enrollment #${e.id}`;
                      const canDrop = e.status === 'enrolled';
                      return (
                        <button
                          key={e.id}
                          type="button"
                          disabled={!canDrop || dropEnrollmentMutation.isPending}
                          onClick={() => dropEnrollmentMutation.mutate(e.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            canDrop
                              ? isDark
                                ? 'bg-slate-800/50 hover:bg-red-500/10 text-white hover:text-red-400 border border-white/5'
                                : 'bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200'
                              : isDark
                                ? 'bg-slate-800/30 text-slate-500 border border-white/5 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-left">
                            {label}
                            {e.semester?.name ? (
                              <span className={`block text-xs font-normal mt-0.5 ${labelClass}`}>
                                {e.semester.name} · Section {e.section?.sectionNumber ?? '—'}
                              </span>
                            ) : null}
                          </span>
                          <X className="w-4 h-4 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-sm ${labelClass}`}>Student has no enrolled courses.</p>
                )}
              </>
            )}

            {/* Fix Enrollment Modal */}
            {activeModal === 'fix-enrollment' && (
              <>
                <h2
                  className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}
                >
                  <Wrench className="w-5 h-5" style={{ color: accentColor }} />
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
                        <p
                          className={`text-xs mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}
                        >
                          {item.conflict}
                        </p>
                        <button
                          onClick={() => handleFixConflict(item.resolution)}
                          style={{ backgroundColor: accentColor }}
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

            {/* Delete Confirmation Modal */}
            {activeModal === 'delete-student' && (
              <div className="py-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${headingClass}`}>Confirm Deletion</h2>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>

                <p className={`text-sm mb-6 ${labelClass} leading-relaxed`}>
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-red-500">{selectedStudent.name}</span>? All their
                  academic records and enrollment history will be permanently removed from the
                  system.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isDark
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteStudentMutation.mutate(selectedStudent.id)}
                    disabled={deleteStudentMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    {deleteStudentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Delete Student'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Student Modal */}
            {activeModal === 'edit-student' && (
              <EditStudentContent
                student={selectedStudent}
                enrollments={selectionEnrollments}
                enrollmentsLoading={enrollmentsLoading}
                onSave={(data: any) => {
                  const { email, ...updateData } = data;
                  updateStudentMutation.mutate({ id: selectedStudent.id, data: updateData });
                }}
                isSubmitting={updateStudentMutation.isPending}
                accentColor={accentColor}
                isDark={isDark}
                labelClass={labelClass}
                inputClass={inputClass}
                headingClass={headingClass}
              />
            )}
          </div>
        </div>
      )}
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div
            className={`${cardClass} w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg bg-[accentColor]/10"
                  style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${headingClass}`}>Register New Student</h2>
                  <p className="text-xs text-slate-500">
                    Create a new student account in the system
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setFormError(null);
                }}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormError(null);

                // Fix: Skip phone if empty to avoid validation errors
                const submitData = { ...newStudent };
                if (!submitData.phone || !submitData.phone.trim()) {
                  delete submitData.phone;
                }

                createStudentMutation.mutate(submitData);
              }}
              className="p-6 space-y-4"
            >
              {formError && (
                <div
                  className={`p-3 rounded-lg flex gap-3 text-sm animate-in slide-in-from-top-2 duration-300 ${
                    isDark
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sara"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className={inputClass}
                    onFocus={(e) => {
                      e.target.style.borderColor = accentColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mohamed"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className={inputClass}
                    onFocus={(e) => {
                      e.target.style.borderColor = accentColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
                  Email Address
                </label>
                <div className="relative group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[accentColor]"
                    style={{ color: undefined }}
                  />
                  <input
                    required
                    type="email"
                    placeholder="student@university.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className={`${inputClass} w-full pl-9`}
                    onFocus={(e) => {
                      e.target.style.borderColor = accentColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 chars"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      className={`${inputClass} w-full pr-10`}
                      onFocus={(e) => {
                        e.target.style.borderColor = accentColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Must include Upper, Lower, Number & Special
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+201234567890"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className={inputClass}
                    onFocus={(e) => {
                      e.target.style.borderColor = accentColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                    }}
                  />
                </div>
              </div>

              <div
                className={`p-3 rounded-lg flex gap-3 text-xs border`}
                style={{
                  backgroundColor: `${accentColor}08`,
                  borderColor: `${accentColor}15`,
                  color: isDark ? '#cbd5e1' : '#475569',
                }}
              >
                <div
                  className="p-1 rounded text-white h-fit"
                  style={{ backgroundColor: accentColor }}
                >
                  <BookOpen className="w-3 h-3" />
                </div>
                <p>
                  New students are automatically assigned to the <strong>{ADMIN_DEPARTMENT}</strong>{' '}
                  department and given the default student role.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setFormError(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                    isDark
                      ? 'border-white/10 text-slate-300 hover:bg-white/5'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}33, 0 4px 6px -4px ${accentColor}33`,
                  }}
                  className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Tooltip({
  children,
  text,
  accentColor,
}: {
  children: React.ReactNode;
  text: string;
  accentColor: string;
}) {
  const { isDark } = useTheme() as any;
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<any>(null);

  const onEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 150);
  };

  const onLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 z-[60] pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border shadow-xl ${
              isDark
                ? 'bg-slate-800 text-slate-200 border-white/10 shadow-black/20'
                : 'bg-white text-slate-600 border-slate-100 shadow-slate-200/50'
            }`}
          >
            {/* Minimal accent line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {text}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function EditStudentContent({
  student,
  enrollments,
  enrollmentsLoading,
  onSave,
  isSubmitting,
  accentColor,
  isDark,
  labelClass,
  inputClass,
  headingClass,
}: any) {
  const [formData, setFormData] = useState({
    firstName: student.name.split(' ')[0] || '',
    lastName: student.name.split(' ').slice(1).join(' ') || '',
    email: student.email,
    phone: student.studentId ? '' : '', // phone isn't in mock, but we'll allow editing
  });

  useEffect(() => {
    setFormData({
      firstName: student.name.split(' ')[0] || '',
      lastName: student.name.split(' ').slice(1).join(' ') || '',
      email: student.email,
      phone: '',
    });
  }, [student.id, student.name, student.email, student.studentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const enrollmentRows = Array.isArray(enrollments) ? enrollments : [];

  return (
    <>
      <h2 className={`text-lg font-semibold ${headingClass} flex items-center gap-2 mb-4`}>
        <Pencil className="w-5 h-5" style={{ color: accentColor }} />
        Edit Profile — {student.name}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}
            >
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`${inputClass} w-full`}
              onFocus={(e) => {
                e.target.style.borderColor = accentColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
              }}
            />
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}
            >
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`${inputClass} w-full`}
              onFocus={(e) => {
                e.target.style.borderColor = accentColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
              }}
            />
          </div>
        </div>
        <div>
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelClass}`}
          >
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={formData.email}
              className={`${inputClass} w-full opacity-60 cursor-not-allowed pr-10`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Tooltip text="Email cannot be changed" accentColor={accentColor}>
                <AlertCircle className="w-4 h-4 text-slate-400" />
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isDark ? 'border-white/10 bg-slate-800/40' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
            <span className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>
              Enrolled courses
            </span>
          </div>
          {enrollmentsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: accentColor }} />
            </div>
          ) : enrollmentRows.length === 0 ? (
            <p className={`text-sm ${labelClass}`}>No active or completed enrollments found.</p>
          ) : (
            <ul className={`max-h-52 overflow-y-auto space-y-2 text-sm ${labelClass}`}>
              {enrollmentRows.map((e: any) => (
                <li
                  key={e.id}
                  className={`rounded-lg px-3 py-2 ${
                    isDark ? 'bg-slate-900/50' : 'bg-white border border-slate-100'
                  }`}
                >
                  <div className={`font-semibold ${headingClass}`}>
                    {e.course ? `${e.course.code} — ${e.course.name}` : `Enrollment #${e.id}`}
                  </div>
                  <div className="text-xs mt-1 opacity-90">
                    {e.semester?.name ? `${e.semester.name} · ` : ''}
                    Section {e.section?.sectionNumber ?? '—'}
                    {e.status ? ` · ${e.status}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 15px -3px ${accentColor}33`,
          }}
          className="w-full py-2.5 rounded-xl hover:opacity-90 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </>
  );
}
