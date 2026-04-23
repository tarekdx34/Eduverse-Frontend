import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  Clock,
  Download,
  Calendar,
  ClipboardList,
  UserCheck,
  Pencil,
  AlertCircle,
  X,
  Tag,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect, Tooltip } from '../../../components/shared';
import { ApiClient as api } from '../../../services/api/client';
import { toast } from 'sonner';

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
  taNames?: string[];
  level: string;
  prerequisites: string[];
  sectionId?: number | null;
  skills?: string[];
}

interface CourseManagementPageProps {
  courses: Course[];
  users: { id: number; name: string; role: string; department: string }[];
  adminDepartment: string;
  onAddCourse: (course: any) => void;
  onEditCourse: (id: number, course: any) => void;
  onDeleteCourse: (id: number) => void;
  onRefreshCourses: () => Promise<void> | void;
}

/** One course section + schedule + staff (supports multiple sections & instructors per course). */
type SectionRow = {
  key: string;
  sectionId: number | null;
  sectionNumber: string;
  maxCapacity: number;
  location: string;
  semesterId: number;
  scheduleDay: string;
  startTime: string;
  endTime: string;
  /** First = primary instructor, rest = co-instructors (API roles). */
  instructorIds: number[];
  taIds: number[];
};

function newRowKey() {
  return globalThis.crypto?.randomUUID?.() ?? `sec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSectionRow(semesterId: number): SectionRow {
  return {
    key: newRowKey(),
    sectionId: null,
    sectionNumber: '1',
    maxCapacity: 30,
    location: 'Room A-101',
    semesterId,
    scheduleDay: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    instructorIds: [],
    taIds: [],
  };
}

function parseSectionNumberForApi(sectionNumber: string): number | undefined {
  const n = parseInt(String(sectionNumber).trim(), 10);
  if (Number.isFinite(n) && n >= 1) return n;
  return undefined;
}

const WEEKDAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Placeholder / hint copy for course wizard inputs (steps 1–3) */
const WIZARD_PH = {
  courseCode: 'e.g. CS301',
  courseCredits: 'e.g. 3',
  courseName: 'e.g. Introduction to Machine Learning',
  sectionNumber: 'e.g. 1, 2, or A',
  maxCapacity: 'e.g. 40',
  location: 'e.g. Building A, Room 101',
  step3StaffHint:
    'Optional: tap names to assign staff. First instructor selected is primary; additional taps add co-instructors.',
  step3StaffLocked:
    'Use Next on step 2 to save sections first; then you can assign instructors and TAs here.',
} as const;

interface SemesterOption {
  id: number;
  name: string;
}

// ── Inline chip/tag input for course skills ──────────────────────
function SkillTagInput({
  tags,
  onChange,
  isDark,
  accentColor,
  inputClass,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  isDark: boolean;
  accentColor: string;
  inputClass: string;
}) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (val: string) => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInputValue('');
  };

  const removeTag = (idx: number) => onChange(tags.filter((_, i) => i !== idx));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 rounded-xl border cursor-text transition-all ${
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-300'
      } focus-within:outline-none`}
      style={{ ['--focus-ring' as any]: accentColor }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: accentColor + 'cc' }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
        placeholder={tags.length === 0 ? 'e.g. Python, Neural Networks… (press Enter to add)' : ''}
        className={`flex-1 min-w-[160px] outline-none bg-transparent text-sm ${
          isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
        }`}
      />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────

export function CourseManagementPage({
  courses,
  users,
  adminDepartment,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onRefreshCourses,
}: CourseManagementPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  type ModalType = 'add-course' | 'edit-course' | 'staff-assign' | 'delete-course';
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'staff' | 'schedule' | 'exams'>(
    'courses'
  );
  const [staffFormData, setStaffFormData] = useState({
    courseId: 0,
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: adminDepartment,
    semester: 'Fall 2025',
    credits: 3,
    capacity: 100,
    level: 'FRESHMAN',
    status: 'ACTIVE',
    instructorId: 0,
    instructor: '',
    taIds: [] as number[],
    skills: [] as string[],
  });
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [addCourseId, setAddCourseId] = useState<number | null>(null);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [sectionRows, setSectionRows] = useState<SectionRow[]>(() => [createSectionRow(4)]);
  const [editStep, setEditStep] = useState<1 | 2 | 3>(1);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  const headingClass = `${isDark ? 'text-white' : 'text-slate-900'}`;
  const labelClass = `${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200`;

  const getApiErrorMessage = (error: any) => {
    const message = error?.response?.data?.message || error?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message || 'Request failed';
  };

  const deptCourses = courses;
  const deptInstructors = users.filter((u) => u.role === 'instructor');
  const deptTAs = users.filter((u) => u.role === 'teaching_assistant');

  const filteredCourses = deptCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus =
      statusFilter === 'all' || course.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(deptCourses.map((c) => c.department))];

  useEffect(() => {
    const fetchSemesters = async () => {
      if (
        activeModal !== 'add-course' &&
        activeModal !== 'edit-course' &&
        activeModal !== 'staff-assign'
      ) {
        return;
      }
      try {
        const semestersRes = await api.get<any>('/semesters');
        const list = Array.isArray(semestersRes)
          ? semestersRes
          : Array.isArray(semestersRes?.data)
            ? semestersRes.data
            : [];
        const mappedSemesters = list.map((s: any) => ({
          id: Number(s.id || s.semesterId),
          name: s.name || `Semester ${s.id || s.semesterId}`,
        }));
        setSemesters(mappedSemesters);

        const defaultSemId = mappedSemesters[0]?.id ?? 4;
        setSectionRows((prev) =>
          prev.map((r) => ({
            ...r,
            semesterId:
              mappedSemesters.some((s: SemesterOption) => s.id === r.semesterId) ?
                r.semesterId
              : defaultSemId,
          })),
        );
      } catch (error: any) {
        toast.error(getApiErrorMessage(error));
      }
    };

    fetchSemesters();
  }, [activeModal]);

  const resetSectionRowsForAdd = () => {
    const semId = semesters[0]?.id ?? 4;
    setSectionRows([createSectionRow(semId)]);
  };

  const loadCourseSectionDetails = async (course: Course) => {
    const fallbackSem = semesters[0]?.id ?? 4;
    setStaffFormData({ courseId: course.id });

    try {
      const sectionsRes = await api.get<any>(`/sections/course/${course.id}`);
      const sections = Array.isArray(sectionsRes?.data)
        ? sectionsRes.data
        : Array.isArray(sectionsRes)
          ? sectionsRes
          : [];

      if (sections.length === 0) {
        setSectionRows([createSectionRow(fallbackSem)]);
        return;
      }

      const rows: SectionRow[] = [];
      for (const sec of sections) {
        const sid = Number(sec.id);
        const [schedulesRes, instructorsRes, tasRes] = await Promise.all([
          api.get<any>(`/schedules/section/${sid}`).catch(() => []),
          api.get<any>(`/enrollments/sections/${sid}/instructors`).catch(() => []),
          api.get<any>(`/enrollments/sections/${sid}/tas`).catch(() => []),
        ]);
        const schedules = Array.isArray(schedulesRes?.data)
          ? schedulesRes.data
          : Array.isArray(schedulesRes)
            ? schedulesRes
            : [];
        const instructors = Array.isArray(instructorsRes?.data)
          ? instructorsRes.data
          : Array.isArray(instructorsRes)
            ? instructorsRes
            : [];
        const tas = Array.isArray(tasRes?.data) ? tasRes.data : Array.isArray(tasRes) ? tasRes : [];
        const firstSchedule = schedules[0];
        const instructorIds = instructors
          .map((x: any) => Number(x.userId))
          .filter((n: number) => Number.isFinite(n) && n > 0);
        const taIds = tas.map((ta: any) => Number(ta.userId)).filter((n: number) => n > 0);
        const semId = Number(sec.semesterId || sec.semester?.id || fallbackSem);
        rows.push({
          key: `existing-${sid}`,
          sectionId: sid,
          sectionNumber: String(sec.sectionNumber ?? '1'),
          maxCapacity: Number(sec.maxCapacity || 30),
          location: sec.location || firstSchedule?.room || 'Room A-101',
          semesterId: semId,
          scheduleDay: firstSchedule?.dayOfWeek
            ? firstSchedule.dayOfWeek.charAt(0).toUpperCase() +
              firstSchedule.dayOfWeek.slice(1).toLowerCase()
            : 'Monday',
          startTime: firstSchedule?.startTime?.slice(0, 5) || '09:00',
          endTime: firstSchedule?.endTime?.slice(0, 5) || '10:30',
          instructorIds,
          taIds,
        });
      }
      setSectionRows(rows);
    } catch (error: any) {
      console.warn('[CourseManagementPage] Failed to load section details:', error);
      setSectionRows([createSectionRow(fallbackSem)]);
    }
  };

  const upsertSectionSchedule = async (row: SectionRow, courseId: number): Promise<number> => {
    let sectionId = row.sectionId;
    const sectionNum = parseSectionNumberForApi(row.sectionNumber);

    if (!sectionId) {
      const body: Record<string, unknown> = {
        courseId,
        semesterId: Number(row.semesterId),
        maxCapacity: Number(row.maxCapacity),
        location: row.location,
      };
      if (sectionNum !== undefined) body.sectionNumber = sectionNum;
      const sectionRes = await api.post<any>('/sections', body);
      sectionId = Number(
        sectionRes?.id ||
          sectionRes?.sectionId ||
          sectionRes?.data?.id ||
          sectionRes?.data?.sectionId,
      );
    } else {
      await api.patch(`/sections/${sectionId}`, {
        maxCapacity: Number(row.maxCapacity),
        location: row.location,
      });
    }

    if (!sectionId) {
      throw new Error('Section could not be created or updated');
    }

    const schedulesRes = await api.get<any>(`/schedules/section/${sectionId}`).catch(() => []);
    const existingSchedules = Array.isArray(schedulesRes?.data)
      ? schedulesRes.data
      : Array.isArray(schedulesRes)
        ? schedulesRes
        : [];

    if (existingSchedules.length > 0) {
      await Promise.all(
        existingSchedules.map((schedule: any) => api.delete(`/schedules/${schedule.id}`)),
      );
    }

    await api.post(`/schedules/section/${sectionId}`, {
      dayOfWeek: row.scheduleDay.toUpperCase(),
      startTime: row.startTime,
      endTime: row.endTime,
      room: row.location,
      scheduleType: 'LECTURE',
    });

    return Number(sectionId);
  };

  const syncStaffAssignments = async (
    sectionId: number,
    instructorIds: number[],
    taIds: number[],
  ) => {
    const [currentInstructorsRes, currentTAsRes] = await Promise.all([
      api.get<any>(`/enrollments/sections/${sectionId}/instructors`).catch(() => []),
      api.get<any>(`/enrollments/sections/${sectionId}/tas`).catch(() => []),
    ]);
    const currentInstructors = Array.isArray(currentInstructorsRes?.data)
      ? currentInstructorsRes.data
      : Array.isArray(currentInstructorsRes)
        ? currentInstructorsRes
        : [];
    const currentTAs = Array.isArray(currentTAsRes?.data)
      ? currentTAsRes.data
      : Array.isArray(currentTAsRes)
        ? currentTAsRes
        : [];

    const wantInst = instructorIds.map(Number).filter((id) => id > 0);
    await Promise.all(
      currentInstructors.map((assignment: any) =>
        api.delete(`/enrollments/sections/${sectionId}/instructors/${assignment.id}`),
      ),
    );
    for (let i = 0; i < wantInst.length; i++) {
      await api.post(`/enrollments/sections/${sectionId}/instructors`, {
        userId: wantInst[i],
        role: i === 0 ? 'primary' : 'co_instructor',
      });
    }

    await Promise.all(
      currentTAs
        .filter((assignment: any) => !taIds.includes(Number(assignment.userId)))
        .map((assignment: any) =>
          api.delete(`/enrollments/sections/${sectionId}/tas/${assignment.id}`),
        ),
    );

    for (const taId of taIds) {
      const exists = currentTAs.some(
        (assignment: any) => Number(assignment.userId) === Number(taId),
      );
      if (!exists) {
        await api.post(`/enrollments/sections/${sectionId}/tas`, { userId: taId });
      }
    }
  };

  const handleEditCourseFlow = async () => {
    if (!selectedCourse) {
      return;
    }

    try {
      setIsEditSubmitting(true);
      await api.patch(`/courses/${selectedCourse.id}`, {
        name: formData.name,
        description: `${formData.name} (${formData.code})`,
        credits: Number(formData.credits),
        status: (formData.status || 'ACTIVE').toUpperCase(),
        level: (formData.level || 'FRESHMAN').toUpperCase(),
        skills: formData.skills,
      });

      for (const row of sectionRows) {
        const sectionId = await upsertSectionSchedule(row, selectedCourse.id);
        await syncStaffAssignments(sectionId, row.instructorIds, row.taIds);
      }

      await onRefreshCourses();
      toast.success('Course updated successfully');
      closeModal();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsEditSubmitting(false);
    }
  };

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
        taIds: course.taIds || [],
        skills: (course as any).skills || [],
      });
      if (type === 'staff-assign') {
        setStaffFormData({
          courseId: course.id,
        });
      }
      if (type === 'edit-course' || type === 'staff-assign') {
        void loadCourseSectionDetails(course);
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
        status: 'ACTIVE',
        instructorId: 0,
        instructor: '',
        taIds: [],
        skills: [],
      });
    }

    if (type === 'add-course') {
      setAddStep(1);
      setAddCourseId(null);
      resetSectionRowsForAdd();
    }

    if (type === 'edit-course') {
      setEditStep(1);
    }

    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
    setEditStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'edit-course' && selectedCourse) {
      await handleEditCourseFlow();
    }
  };

  const toggleTA = (taId: number) => {
    setFormData((prev) => ({
      ...prev,
      taIds: prev.taIds.includes(taId)
        ? prev.taIds.filter((id) => id !== taId)
        : [...prev.taIds, taId],
    }));
  };

  const getTANames = (taIds: number[]) => {
    return taIds
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getCourseTANames = (course: Course) => {
    if (course.taNames && course.taNames.length > 0) {
      return course.taNames.join(', ');
    }
    return getTANames(course.taIds);
  };

  const mockScheduleData: any[] = [];

  const mockExamData: any[] = [];

  const toggleRowInstructor = (rowKey: string, instructorId: number) => {
    setSectionRows((rows) =>
      rows.map((r) =>
        r.key === rowKey ?
          {
            ...r,
            instructorIds:
              r.instructorIds.includes(instructorId) ?
                r.instructorIds.filter((id) => id !== instructorId)
              : [...r.instructorIds, instructorId],
          }
        : r,
      ),
    );
  };

  const toggleRowTA = (rowKey: string, taId: number) => {
    setSectionRows((rows) =>
      rows.map((r) =>
        r.key === rowKey ?
          {
            ...r,
            taIds:
              r.taIds.includes(taId) ? r.taIds.filter((id) => id !== taId) : [...r.taIds, taId],
          }
        : r,
      ),
    );
  };

  const updateSectionRow = (rowKey: string, partial: Partial<SectionRow>) => {
    setSectionRows((rows) => rows.map((r) => (r.key === rowKey ? { ...r, ...partial } : r)));
  };

  const addEmptySectionRow = () => {
    const semId = sectionRows[0]?.semesterId ?? semesters[0]?.id ?? 4;
    setSectionRows((rows) => [...rows, createSectionRow(semId)]);
  };

  const removeSectionRow = (rowKey: string) => {
    setSectionRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== rowKey)));
  };

  const handleAddCourseStep1Next = async () => {
    if (addCourseId) {
      setAddStep(2);
      return;
    }

    try {
      setIsAddSubmitting(true);
      const courseRes = await api.post<any>('/courses', {
        code: formData.code,
        name: formData.name,
        description: `${formData.name} (${formData.code})`,
        credits: Number(formData.credits),
        level: formData.level,
        departmentId: 1,
        skills: formData.skills,
      });
      const createdCourseId = Number(courseRes?.id || courseRes?.courseId || courseRes?.data?.id);
      if (!createdCourseId) {
        throw new Error('Course created but no courseId returned');
      }
      setAddCourseId(createdCourseId);
      setAddStep(2);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const handleAddCourseStep2Next = async () => {
    if (!addCourseId) {
      toast.error('Create the course first.');
      setAddStep(1);
      return;
    }

    if (sectionRows.every((r) => r.sectionId)) {
      setAddStep(3);
      return;
    }

    try {
      setIsAddSubmitting(true);
      const updated: SectionRow[] = [];
      for (const row of sectionRows) {
        if (row.sectionId) {
          updated.push(row);
          continue;
        }
        const sid = await upsertSectionSchedule(row, addCourseId);
        updated.push({ ...row, sectionId: sid });
      }
      setSectionRows(updated);
      setAddStep(3);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const handleCreateCourseFlow = async () => {
    if (!addCourseId) {
      toast.error('Create the course first.');
      setAddStep(1);
      return;
    }

    try {
      setIsAddSubmitting(true);

      for (const row of sectionRows) {
        if (!row.sectionId) continue;
        await syncStaffAssignments(row.sectionId, row.instructorIds, row.taIds);
      }

      await onRefreshCourses();
      toast.success('Course created successfully');
      closeModal();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const handleStaffAssign = async () => {
    const courseId = selectedCourse ? selectedCourse.id : staffFormData.courseId;
    if (!courseId) {
      return;
    }

    try {
      setIsStaffSubmitting(true);
      const rows = [...sectionRows];
      if (rows.length === 0) {
        throw new Error('No sections to assign staff to.');
      }
      for (let i = 0; i < rows.length; i++) {
        let sectionId = rows[i].sectionId;
        if (!sectionId) {
          sectionId = await upsertSectionSchedule(rows[i], courseId);
          rows[i] = { ...rows[i], sectionId };
        }
        await syncStaffAssignments(sectionId, rows[i].instructorIds, rows[i].taIds);
      }
      setSectionRows(rows);

      await onRefreshCourses();
      toast.success('Staff assigned successfully');
      closeModal();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to assign staff';
      toast.error(errorMessage);
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const thClass = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const tdClass = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const getExamStyles = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case 'midterm':
        return {
          bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
          text: isDark ? 'text-amber-500' : 'text-amber-700',
          border: isDark ? 'border-amber-500/20' : 'border-amber-200',
        };
      case 'final':
        return {
          bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
          text: isDark ? 'text-rose-500' : 'text-rose-700',
          border: isDark ? 'border-rose-500/20' : 'border-rose-200',
        };
      default:
        return {
          bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50',
          text: isDark ? 'text-slate-400' : 'text-slate-700',
          border: isDark ? 'border-slate-500/20' : 'border-slate-200',
        };
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
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 flex items-center gap-1.5"
              style={{
                backgroundColor: `${accentColor}10`,
                color: accentColor,
                borderColor: `${accentColor}20`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              {adminDepartment}
            </span>
          </div>
          <p className={`text-sm mt-2.5 ${labelClass}`}>
            {t('manageCoursesSub') ||
              'Manage and organize academic courses, staff assignments, and schedules.'}
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
        {[
          { key: 'courses' as const, label: t('coursesTab'), icon: BookOpen },
          { key: 'staff' as const, label: t('staffAssignmentTab'), icon: UserCheck },
          { key: 'schedule' as const, label: t('scheduleTab'), icon: Calendar },
          { key: 'exams' as const, label: t('examsTab'), icon: ClipboardList },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.key
                ? 'text-white'
                : isDark
                  ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder={t('searchCourses')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} w-full pl-10 pr-4`}
                    style={{ borderColor: searchTerm ? accentColor : undefined }}
                    onFocus={(e) => (e.target.style.borderColor = accentColor)}
                    onBlur={(e) =>
                      (e.target.style.borderColor = searchTerm
                        ? accentColor
                        : isDark
                          ? '#334155'
                          : '#e2e8f0')
                    }
                  />
                </div>
              </div>
              <CleanSelect
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={`${inputClass} cursor-pointer min-w-[120px]`}
                style={{ borderColor: departmentFilter !== 'all' ? accentColor : undefined }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    departmentFilter !== 'all' ? accentColor : isDark ? '#334155' : '#e2e8f0')
                }
              >
                <option value="all">{t('allDepartments')}</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </CleanSelect>
              <CleanSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} cursor-pointer min-w-[120px]`}
                style={{ borderColor: statusFilter !== 'all' ? accentColor : undefined }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    statusFilter !== 'all' ? accentColor : isDark ? '#334155' : '#e2e8f0')
                }
              >
                <option value="all">{t('allStatus')}</option>
                <option value="ACTIVE">{t('active')}</option>
                <option value="ARCHIVED">{t('archived')}</option>
              </CleanSelect>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Download size={18} />
                {t('export')}
              </button>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-[#1e293b]/80 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div
                  className="h-20 flex items-center justify-center relative rounded-t-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  }}
                >
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                    <BookOpen size={80} strokeWidth={1} />
                  </div>
                  <BookOpen className="text-white relative z-10" size={32} />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-700'}`}
                      >
                        {course.code}
                      </span>
                      <h3
                        className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {course.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {course.enrolled}/{course.capacity} {t('enrolled')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {course.credits} {t('credits')}
                      </span>
                    </div>
                  </div>

                  <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>
                      {t('courseInstructor')}: {course.instructor || 'Unassigned'}
                    </p>
                    <p>
                      {t('assignedTAs')}: {getCourseTANames(course) || 'None'}
                    </p>
                    <p>
                      {t('department')}: {course.department}
                    </p>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1.5">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {t('enrollment')}
                      </span>
                      <span style={{ color: accentColor }}>
                        {Math.round((course.enrolled / course.capacity) * 100)}%
                      </span>
                    </div>
                    <div
                      className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(course.enrolled / course.capacity) * 100}%`,
                          backgroundColor: accentColor,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-500/10">
                    <Tooltip text="Edit Course" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('edit-course', course)}
                        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                          isDark
                            ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                            : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Pencil size={18} />
                      </button>
                    </Tooltip>

                    <Tooltip text="Delete Course" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('delete-course', course)}
                        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                          isDark
                            ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                            : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
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
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('staffAssignment') || 'Staff Assignment'}
            </h2>
          </div>
          <div
            className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
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
                  {deptCourses.map((course) => (
                    <tr
                      key={course.id}
                      className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}
                    >
                      <td className={tdClass + ' font-medium'}>{course.name}</td>
                      <td className={tdClass}>{course.code}</td>
                      <td className={tdClass}>
                        {course.instructor || (
                          <span className="text-gray-400 italic">{t('unassigned')}</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {getCourseTANames(course) ? (
                          getCourseTANames(course)
                        ) : (
                          <span className="text-gray-400 italic">{t('none')}</span>
                        )}
                      </td>
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
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('classSchedule')}
            </h2>
          </div>
          <div
            className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
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
                  {mockScheduleData.map((row) => (
                    <tr
                      key={row.id}
                      className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}
                    >
                      <td className={tdClass + ' font-medium'}>
                        {row.courseCode} - {row.courseName}
                      </td>
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
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('examScheduleTitle')}
            </h2>
          </div>
          <div
            className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
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
                  {mockExamData.map((row) => (
                    <tr
                      key={row.id}
                      className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}
                    >
                      <td className={tdClass + ' font-medium'}>
                        {row.courseCode} - {row.courseName}
                      </td>
                      <td className={tdClass}>{row.date}</td>
                      <td className={tdClass}>{row.time}</td>
                      <td className={tdClass}>{row.room}</td>
                      <td className={tdClass}>
                        {(() => {
                          const styles = getExamStyles(row.type);
                          return (
                            <span
                              className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}
                            >
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
          <div
            className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-hidden`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between rounded-t-2xl`}
            >
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

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-81px)]">
              {/* Add Course Multi-Step Content */}
              {activeModal === 'add-course' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 1 as const, label: '1. Course' },
                      { id: 2 as const, label: '2. Section' },
                      { id: 3 as const, label: '3. Staff' },
                    ].map((step) => (
                      <div
                        key={step.id}
                        className={`rounded-xl px-3 py-2 text-center text-xs font-bold tracking-wide border ${addStep === step.id ? 'text-white' : isDark ? 'text-slate-400 border-slate-700 bg-slate-800/40' : 'text-slate-500 border-slate-200 bg-slate-50'}`}
                        style={
                          addStep === step.id
                            ? { backgroundColor: accentColor, borderColor: accentColor }
                            : {}
                        }
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>

                  {addStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {t('courseCode')}
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder={WIZARD_PH.courseCode}
                            className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                            onFocus={(e) => (e.target.style.borderColor = accentColor)}
                            onBlur={(e) =>
                              (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                            }
                            required
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {t('credits')}
                          </label>
                          <input
                            type="number"
                            value={formData.credits}
                            onChange={(e) =>
                              setFormData({ ...formData, credits: Number(e.target.value) })
                            }
                            placeholder={WIZARD_PH.courseCredits}
                            className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                            onFocus={(e) => (e.target.style.borderColor = accentColor)}
                            onBlur={(e) =>
                              (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          {t('courseName')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={WIZARD_PH.courseName}
                          className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          onFocus={(e) => (e.target.style.borderColor = accentColor)}
                          onBlur={(e) =>
                            (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Course Level
                          </label>
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
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Status
                          </label>
                          <CleanSelect
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className={`${inputClass} w-full cursor-pointer`}
                            onFocus={(e) => (e.target.style.borderColor = accentColor)}
                            onBlur={(e) => (e.target.style.borderColor = '')}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </CleanSelect>
                        </div>
                      </div>

                      {/* Skills Tag Input */}
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          <Tag size={12} />
                          Course Skills
                          <span className={`ml-1 text-[10px] font-normal normal-case tracking-normal ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            (auto-awarded to passing students)
                          </span>
                        </label>
                        <SkillTagInput
                          tags={formData.skills}
                          onChange={(skills) => setFormData({ ...formData, skills })}
                          isDark={isDark}
                          accentColor={accentColor}
                          inputClass={inputClass}
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={closeModal}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          disabled={isAddSubmitting}
                        >
                          {t('cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCourseStep1Next}
                          style={{ backgroundColor: accentColor }}
                          disabled={isAddSubmitting || !formData.code || !formData.name}
                          className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        >
                          {isAddSubmitting ? 'Saving...' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}

                  {addStep === 2 && (
                    <div className="space-y-4">
                      <p className={`text-sm ${labelClass}`}>
                        Add one or more sections. Use numeric section numbers (1, 2, 3…) when
                        possible so the API can register them; each section can have its own
                        schedule.
                      </p>
                      {sectionRows.map((row, idx) => (
                        <div
                          key={row.key}
                          className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-bold ${headingClass}`}>
                              Section {idx + 1}
                              {row.sectionId ?
                                <span className={`ml-2 text-xs font-normal ${labelClass}`}>
                                  (saved id {row.sectionId})
                                </span>
                              : null}
                            </span>
                            {sectionRows.length > 1 ?
                              <button
                                type="button"
                                onClick={() => removeSectionRow(row.key)}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                              >
                                Remove
                              </button>
                            : null}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Section number
                              </label>
                              <input
                                type="text"
                                value={row.sectionNumber}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { sectionNumber: e.target.value })
                                }
                                placeholder={WIZARD_PH.sectionNumber}
                                className={`${inputClass} w-full`}
                              />
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Max capacity
                              </label>
                              <input
                                type="number"
                                value={row.maxCapacity}
                                onChange={(e) =>
                                  updateSectionRow(row.key, {
                                    maxCapacity: Number(e.target.value),
                                  })
                                }
                                placeholder={WIZARD_PH.maxCapacity}
                                className={`${inputClass} w-full`}
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Location
                            </label>
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) =>
                                updateSectionRow(row.key, { location: e.target.value })
                              }
                              placeholder={WIZARD_PH.location}
                              className={`${inputClass} w-full`}
                            />
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Semester
                            </label>
                            <CleanSelect
                              value={row.semesterId}
                              onChange={(e) =>
                                updateSectionRow(row.key, {
                                  semesterId: Number(e.target.value),
                                })
                              }
                              className={`${inputClass} w-full`}
                            >
                              {semesters.map((semester) => (
                                <option key={semester.id} value={semester.id}>
                                  {semester.name}
                                </option>
                              ))}
                            </CleanSelect>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Day
                              </label>
                              <CleanSelect
                                value={row.scheduleDay}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { scheduleDay: e.target.value })
                                }
                                className={`${inputClass} w-full`}
                              >
                                {WEEKDAY_OPTIONS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </CleanSelect>
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Start
                              </label>
                              <input
                                type="time"
                                value={row.startTime}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { startTime: e.target.value })
                                }
                                title="Class start time"
                                className={`${inputClass} w-full`}
                              />
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                End
                              </label>
                              <input
                                type="time"
                                value={row.endTime}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { endTime: e.target.value })
                                }
                                title="Class end time"
                                className={`${inputClass} w-full`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEmptySectionRow}
                        className={`w-full py-2 rounded-xl text-sm font-semibold border border-dashed ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                      >
                        + Add another section
                      </button>

                      <div className="flex justify-between gap-3 mt-6">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setAddStep(1)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            disabled={isAddSubmitting}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddStep(3)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            disabled={isAddSubmitting}
                          >
                            Skip
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCourseStep2Next}
                          style={{ backgroundColor: accentColor }}
                          disabled={isAddSubmitting}
                          className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        >
                          {isAddSubmitting ? 'Saving...' : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}

                  {addStep === 3 && (
                    <div className="space-y-4">
                      {!sectionRows.some((r) => r.sectionId) && (
                        <div
                          className={`p-3 rounded-xl border text-sm ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                        >
                          No sections were created yet. Go back to step 2 or finish to save the
                          course only.
                        </div>
                      )}
                      {sectionRows.some((r) => !r.sectionId) && (
                        <p
                          className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                        >
                          {WIZARD_PH.step3StaffLocked}
                        </p>
                      )}
                      <p
                        className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                      >
                        {WIZARD_PH.step3StaffHint}
                      </p>

                      {sectionRows.map((row) => (
                        <div
                          key={row.key}
                          className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <p className={`text-sm font-bold ${headingClass}`}>
                            Section {row.sectionNumber} — staff
                          </p>
                          <p className={`text-xs ${labelClass}`}>
                            First instructor selected is primary; additional instructors are
                            co-instructors.
                          </p>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Instructors
                            </label>
                            <div
                              className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                            >
                              {deptInstructors.length === 0 ?
                                <p className={`text-sm ${labelClass}`}>No instructors available</p>
                              : <div className="flex flex-wrap gap-2">
                                  {deptInstructors.map((inst) => (
                                    <button
                                      key={`${row.key}-inst-${inst.id}`}
                                      type="button"
                                      disabled={!row.sectionId}
                                      onClick={() => toggleRowInstructor(row.key, inst.id)}
                                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                        row.instructorIds.includes(inst.id) ?
                                          'text-white'
                                        : isDark ?
                                          'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                      } disabled:opacity-50`}
                                      style={
                                        row.instructorIds.includes(inst.id) ?
                                          { backgroundColor: accentColor }
                                        : {}
                                      }
                                    >
                                      {inst.name}
                                    </button>
                                  ))}
                                </div>
                              }
                            </div>
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Teaching assistants
                            </label>
                            <div
                              className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                            >
                              {deptTAs.length === 0 ?
                                <p className={`text-sm ${labelClass}`}>No TAs available</p>
                              : <div className="flex flex-wrap gap-2">
                                  {deptTAs.map((ta) => (
                                    <button
                                      key={`${row.key}-ta-${ta.id}`}
                                      type="button"
                                      disabled={!row.sectionId}
                                      onClick={() => toggleRowTA(row.key, ta.id)}
                                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                        row.taIds.includes(ta.id) ?
                                          'text-white'
                                        : isDark ?
                                          'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                      } disabled:opacity-50`}
                                      style={
                                        row.taIds.includes(ta.id) ?
                                          { backgroundColor: accentColor }
                                        : {}
                                      }
                                    >
                                      {ta.name}
                                    </button>
                                  ))}
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between gap-3 mt-6">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setAddStep(2)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            disabled={isAddSubmitting}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateCourseFlow()}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            disabled={isAddSubmitting}
                          >
                            Skip
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateCourseFlow}
                          style={{ backgroundColor: accentColor }}
                          disabled={isAddSubmitting}
                          className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                        >
                          {isAddSubmitting ? 'Creating...' : 'Create Course'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Course Content */}
              {activeModal === 'edit-course' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    className={`p-3 rounded-xl border text-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    Edit course details, section setup, and staff assignment in one flow.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 1 as const, label: '1. Course' },
                      { id: 2 as const, label: '2. Section' },
                      { id: 3 as const, label: '3. Staff' },
                    ].map((step) => (
                      <div
                        key={step.id}
                        className={`rounded-xl px-3 py-2 text-center text-xs font-bold tracking-wide border ${editStep === step.id ? 'text-white' : isDark ? 'text-slate-400 border-slate-700 bg-slate-800/40' : 'text-slate-500 border-slate-200 bg-slate-50'}`}
                        style={
                          editStep === step.id
                            ? { backgroundColor: accentColor, borderColor: accentColor }
                            : {}
                        }
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>

                  {editStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {t('courseCode')}
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder={WIZARD_PH.courseCode}
                            className={`${inputClass} w-full`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {t('credits')}
                          </label>
                          <input
                            type="number"
                            value={formData.credits}
                            onChange={(e) =>
                              setFormData({ ...formData, credits: Number(e.target.value) })
                            }
                            placeholder={WIZARD_PH.courseCredits}
                            className={`${inputClass} w-full`}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          {t('courseName')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={WIZARD_PH.courseName}
                          className={`${inputClass} w-full`}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Status
                          </label>
                          <CleanSelect
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className={`${inputClass} w-full cursor-pointer`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </CleanSelect>
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Course Level
                          </label>
                          <CleanSelect
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            className={`${inputClass} w-full cursor-pointer`}
                          >
                            <option value="FRESHMAN">Freshman</option>
                            <option value="SOPHOMORE">Sophomore</option>
                            <option value="JUNIOR">Junior</option>
                            <option value="SENIOR">Senior</option>
                            <option value="GRADUATE">Graduate</option>
                          </CleanSelect>
                        </div>
                      </div>

                      {/* Skills Tag Input – Edit Mode */}
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          <Tag size={12} />
                          Course Skills
                          <span className={`ml-1 text-[10px] font-normal normal-case tracking-normal ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            (auto-awarded to passing students)
                          </span>
                        </label>
                        <SkillTagInput
                          tags={formData.skills}
                          onChange={(skills) => setFormData({ ...formData, skills })}
                          isDark={isDark}
                          accentColor={accentColor}
                          inputClass={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {editStep === 2 && (
                    <div className="space-y-4">
                      <p className={`text-sm ${labelClass}`}>
                        Manage all sections for this course. New rows are created on save.
                      </p>
                      {sectionRows.map((row, idx) => (
                        <div
                          key={row.key}
                          className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-bold ${headingClass}`}>
                              Section {idx + 1}
                              {row.sectionId ?
                                <span className={`ml-2 text-xs font-normal ${labelClass}`}>
                                  (id {row.sectionId})
                                </span>
                              : <span className={`ml-2 text-xs font-normal ${labelClass}`}>
                                  (new)
                                </span>}
                            </span>
                            {sectionRows.length > 1 ?
                              <button
                                type="button"
                                onClick={() => removeSectionRow(row.key)}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                              >
                                Remove
                              </button>
                            : null}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Section number
                              </label>
                              <input
                                type="text"
                                value={row.sectionNumber}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { sectionNumber: e.target.value })
                                }
                                placeholder={WIZARD_PH.sectionNumber}
                                className={`${inputClass} w-full`}
                              />
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Max capacity
                              </label>
                              <input
                                type="number"
                                value={row.maxCapacity}
                                onChange={(e) =>
                                  updateSectionRow(row.key, {
                                    maxCapacity: Number(e.target.value),
                                  })
                                }
                                placeholder={WIZARD_PH.maxCapacity}
                                className={`${inputClass} w-full`}
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Location
                            </label>
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) =>
                                updateSectionRow(row.key, { location: e.target.value })
                              }
                              placeholder={WIZARD_PH.location}
                              className={`${inputClass} w-full`}
                            />
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Semester
                            </label>
                            <CleanSelect
                              value={row.semesterId}
                              onChange={(e) =>
                                updateSectionRow(row.key, {
                                  semesterId: Number(e.target.value),
                                })
                              }
                              className={`${inputClass} w-full`}
                            >
                              {semesters.map((semester) => (
                                <option key={semester.id} value={semester.id}>
                                  {semester.name}
                                </option>
                              ))}
                            </CleanSelect>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Day
                              </label>
                              <CleanSelect
                                value={row.scheduleDay}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { scheduleDay: e.target.value })
                                }
                                className={`${inputClass} w-full`}
                              >
                                {WEEKDAY_OPTIONS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </CleanSelect>
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                Start time
                              </label>
                              <input
                                type="time"
                                value={row.startTime}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { startTime: e.target.value })
                                }
                                title="Class start time"
                                className={`${inputClass} w-full`}
                              />
                            </div>
                            <div>
                              <label
                                className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                              >
                                End time
                              </label>
                              <input
                                type="time"
                                value={row.endTime}
                                onChange={(e) =>
                                  updateSectionRow(row.key, { endTime: e.target.value })
                                }
                                title="Class end time"
                                className={`${inputClass} w-full`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEmptySectionRow}
                        className={`w-full py-2 rounded-xl text-sm font-semibold border border-dashed ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                      >
                        + Add section
                      </button>
                    </div>
                  )}

                  {editStep === 3 && (
                    <div className="space-y-4">
                      <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {WIZARD_PH.step3StaffHint}
                      </p>
                      {sectionRows.map((row) => (
                        <div
                          key={row.key}
                          className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <p className={`text-sm font-bold ${headingClass}`}>
                            Section {row.sectionNumber} — staff
                          </p>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Instructors
                            </label>
                            <div
                              className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                            >
                              {deptInstructors.length === 0 ?
                                <p className={`text-sm ${labelClass}`}>No instructors available</p>
                              : <div className="flex flex-wrap gap-2">
                                  {deptInstructors.map((inst) => (
                                    <button
                                      key={`edit-${row.key}-inst-${inst.id}`}
                                      type="button"
                                      onClick={() => toggleRowInstructor(row.key, inst.id)}
                                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                        row.instructorIds.includes(inst.id) ?
                                          'text-white'
                                        : isDark ?
                                          'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                      }`}
                                      style={
                                        row.instructorIds.includes(inst.id) ?
                                          { backgroundColor: accentColor }
                                        : {}
                                      }
                                    >
                                      {inst.name}
                                    </button>
                                  ))}
                                </div>
                              }
                            </div>
                          </div>
                          <div>
                            <label
                              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              Teaching assistants
                            </label>
                            <div
                              className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                            >
                              {deptTAs.length === 0 ?
                                <p className={`text-sm ${labelClass}`}>No TAs available</p>
                              : <div className="flex flex-wrap gap-2">
                                  {deptTAs.map((ta) => (
                                    <button
                                      key={`edit-${row.key}-ta-${ta.id}`}
                                      type="button"
                                      onClick={() => toggleRowTA(row.key, ta.id)}
                                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                        row.taIds.includes(ta.id) ?
                                          'text-white'
                                        : isDark ?
                                          'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                      }`}
                                      style={
                                        row.taIds.includes(ta.id) ?
                                          { backgroundColor: accentColor }
                                        : {}
                                      }
                                    >
                                      {ta.name}
                                    </button>
                                  ))}
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6">
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {t('cancel')}
                      </button>
                      {editStep > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)))
                          }
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          Back
                        </button>
                      )}
                    </div>
                    {editStep < 3 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setEditStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)))
                        }
                        style={{ backgroundColor: accentColor }}
                        className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        style={{ backgroundColor: accentColor }}
                        disabled={isEditSubmitting}
                        className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {isEditSubmitting ? 'Saving...' : t('save')}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Staff Assign Content */}
              {activeModal === 'staff-assign' && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {selectedCourse ?
                    <div
                      className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Assigning staff for
                      </p>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedCourse.code}: {selectedCourse.name}
                      </p>
                    </div>
                  : <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Select course
                      </label>
                      <CleanSelect
                        value={staffFormData.courseId}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          setStaffFormData({ courseId: id });
                          const c = deptCourses.find((x) => x.id === id);
                          if (c) {
                            setSelectedCourse(c);
                            void loadCourseSectionDetails(c);
                          }
                        }}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                        }
                      >
                        <option value={0}>Choose a course...</option>
                        {deptCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </CleanSelect>
                    </div>
                  }

                  <p className={`text-xs ${labelClass}`}>
                    Edit sections and schedules below. Saving creates any new sections, then
                    applies staff. First instructor per section is primary; others are
                    co-instructors.
                  </p>
                  <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {WIZARD_PH.step3StaffHint}
                  </p>

                  {sectionRows.map((row, idx) => (
                    <div
                      key={row.key}
                      className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${headingClass}`}>
                          Section {idx + 1}
                          {row.sectionId ?
                            <span className={`ml-2 text-xs font-normal ${labelClass}`}>
                              (id {row.sectionId})
                            </span>
                          : <span className={`ml-2 text-xs font-normal ${labelClass}`}>(new)</span>}
                        </span>
                        {sectionRows.length > 1 ?
                          <button
                            type="button"
                            onClick={() => removeSectionRow(row.key)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                          >
                            Remove
                          </button>
                        : null}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Section number
                          </label>
                          <input
                            type="text"
                            value={row.sectionNumber}
                            onChange={(e) =>
                              updateSectionRow(row.key, { sectionNumber: e.target.value })
                            }
                            placeholder={WIZARD_PH.sectionNumber}
                            className={`${inputClass} w-full`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Max capacity
                          </label>
                          <input
                            type="number"
                            value={row.maxCapacity}
                            onChange={(e) =>
                              updateSectionRow(row.key, { maxCapacity: Number(e.target.value) })
                            }
                            placeholder={WIZARD_PH.maxCapacity}
                            className={`${inputClass} w-full`}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) => updateSectionRow(row.key, { location: e.target.value })}
                          placeholder={WIZARD_PH.location}
                          className={`${inputClass} w-full`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Semester
                        </label>
                        <CleanSelect
                          value={row.semesterId}
                          onChange={(e) =>
                            updateSectionRow(row.key, { semesterId: Number(e.target.value) })
                          }
                          className={`${inputClass} w-full`}
                        >
                          {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                              {semester.name}
                            </option>
                          ))}
                        </CleanSelect>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Day
                          </label>
                          <CleanSelect
                            value={row.scheduleDay}
                            onChange={(e) =>
                              updateSectionRow(row.key, { scheduleDay: e.target.value })
                            }
                            className={`${inputClass} w-full`}
                          >
                            {WEEKDAY_OPTIONS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </CleanSelect>
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            Start time
                          </label>
                          <input
                            type="time"
                            value={row.startTime}
                            onChange={(e) =>
                              updateSectionRow(row.key, { startTime: e.target.value })
                            }
                            title="Class start time"
                            className={`${inputClass} w-full`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            End time
                          </label>
                          <input
                            type="time"
                            value={row.endTime}
                            onChange={(e) => updateSectionRow(row.key, { endTime: e.target.value })}
                            title="Class end time"
                            className={`${inputClass} w-full`}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Instructors
                        </label>
                        <div
                          className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                          {deptInstructors.length === 0 ?
                            <p className={`text-sm ${labelClass}`}>No instructors available</p>
                          : <div className="flex flex-wrap gap-2">
                              {deptInstructors.map((inst) => (
                                <button
                                  key={`staff-${row.key}-inst-${inst.id}`}
                                  type="button"
                                  onClick={() => toggleRowInstructor(row.key, inst.id)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                    row.instructorIds.includes(inst.id) ?
                                      'text-white'
                                    : isDark ?
                                      'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  style={
                                    row.instructorIds.includes(inst.id) ?
                                      { backgroundColor: accentColor }
                                    : {}
                                  }
                                >
                                  {inst.name}
                                </button>
                              ))}
                            </div>
                          }
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                          Teaching assistants
                        </label>
                        <div
                          className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                          {deptTAs.length === 0 ?
                            <p className={`text-sm ${labelClass}`}>No TAs available</p>
                          : <div className="flex flex-wrap gap-2">
                              {deptTAs.map((ta) => (
                                <button
                                  key={`staff-${row.key}-ta-${ta.id}`}
                                  type="button"
                                  onClick={() => toggleRowTA(row.key, ta.id)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                    row.taIds.includes(ta.id) ?
                                      'text-white'
                                    : isDark ?
                                      'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  style={
                                    row.taIds.includes(ta.id) ?
                                      { backgroundColor: accentColor }
                                    : {}
                                  }
                                >
                                  {ta.name}
                                </button>
                              ))}
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addEmptySectionRow}
                    className={`w-full py-2 rounded-xl text-sm font-semibold border border-dashed ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                  >
                    + Add section
                  </button>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStaffAssign}
                      style={{ backgroundColor: accentColor }}
                      disabled={
                        isStaffSubmitting || !(selectedCourse?.id ?? staffFormData.courseId)
                      }
                      className="px-6 py-2 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {isStaffSubmitting ? 'Saving...' : 'Assign staff'}
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

                  <div
                    className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                  >
                    <p className={`text-sm mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Deleting Course
                    </p>
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
