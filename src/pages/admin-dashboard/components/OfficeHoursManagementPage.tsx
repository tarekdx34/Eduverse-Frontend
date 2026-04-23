import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  User,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Video,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';
import {
  ScheduleService,
  OfficeHoursSlot,
  OfficeHoursAppointment,
} from '../../../services/api/scheduleService';
import { adminService } from '../../../services/adminService';

interface OfficeHoursManagementPageProps {
  isMockMode?: boolean;
  /** Real signed-in session: never use mock instructors / office hours when API fails. */
  useLiveApi?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

const MODES = [
  { value: 'in_person', label: 'In Person' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
];

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  return { value: time, label: time.slice(0, 5) };
});

const DAY_NAME_TO_VALUE: Record<string, string> = {
  monday: 'MONDAY',
  tuesday: 'TUESDAY',
  wednesday: 'WEDNESDAY',
  thursday: 'THURSDAY',
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
  sunday: 'SUNDAY',
};

function normalizeDayOfWeekForForm(day: string | undefined): string {
  if (!day) return 'MONDAY';
  const upper = String(day).toUpperCase();
  if (DAYS_OF_WEEK.some((d) => d.value === upper)) return upper;
  return DAY_NAME_TO_VALUE[String(day).toLowerCase()] || 'MONDAY';
}

function normalizeTimeToHms(time: string | undefined): string {
  if (!time) return '09:00:00';
  const parts = time.trim().split(':');
  if (parts.length < 2) return '09:00:00';
  const h = parts[0].padStart(2, '0');
  const m = (parts[1] || '00').padStart(2, '0');
  const sec = (parts[2] || '00').replace(/\..*$/, '').padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function mergeTimeOptions(
  base: { value: string; label: string }[],
  needed: (string | undefined)[],
) {
  const out = new Map<string, { value: string; label: string }>();
  base.forEach((s) => out.set(s.value, s));
  needed.forEach((t) => {
    const n = normalizeTimeToHms(t);
    if (!out.has(n)) {
      out.set(n, { value: n, label: n.slice(0, 5) });
    }
  });
  return Array.from(out.values()).sort((a, b) => a.value.localeCompare(b.value));
}

function toDateInputValue(v: string | Date | null | undefined): string {
  if (v == null) return '';
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return '';
    return v.toISOString().slice(0, 10);
  }
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (s.includes('T')) {
    return s.split('T')[0] || '';
  }
  return s.slice(0, 10);
}

function buildFormFromSlot(
  slot: OfficeHoursSlot & { building?: string; room?: string; isRecurring?: boolean },
) {
  const s = slot as OfficeHoursSlot & { meetingUrl?: string | null };
  const locationValue =
    s.mode === 'online' ? s.meetingUrl || s.location || '' : s.location || '';
  return {
    instructorId: slot.instructorId,
    dayOfWeek: normalizeDayOfWeekForForm(slot.dayOfWeek),
    startTime: normalizeTimeToHms(slot.startTime),
    endTime: normalizeTimeToHms(slot.endTime),
    location: locationValue,
    building: slot.building || '',
    room: slot.room || '',
    mode: (slot.mode as 'in_person' | 'online' | 'hybrid') || 'in_person',
    maxAppointments: slot.maxAppointments ?? 5,
    isRecurring: slot.isRecurring ?? true,
    effectiveFrom: toDateInputValue(s.effectiveFrom as string | Date | null | undefined),
    effectiveUntil: toDateInputValue(s.effectiveUntil as string | Date | null | undefined),
    notes: s.notes != null && s.notes !== undefined ? String(s.notes) : '',
  };
}

type ModalType = 'create' | 'edit' | 'delete' | null;

// Extended type for UI with instructor info
interface OfficeHourWithInstructor extends OfficeHoursSlot {
  id?: number;
  instructor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  building?: string;
  room?: string;
  isRecurring?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  notes?: string;
  isActive?: boolean;
}

interface AdminUserRole {
  roleName?: string;
}

interface AdminUserRow {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  userType?: string;
  roles?: Array<AdminUserRole | string>;
}

const ELIGIBLE_ROLE_ALIASES = new Set([
  'instructor',
  'ta',
  'teaching_assistant',
  'teaching-assistant',
  'teacher_assistant',
]);

const extractRoles = (user: AdminUserRow): string[] => {
  const mappedRoles = Array.isArray(user.roles)
    ? user.roles
        .map((r) => (typeof r === 'string' ? r : r?.roleName))
        .filter(Boolean)
        .map((role) => String(role).toLowerCase())
    : [];
  const fallbackRoles = [user.role, user.userType]
    .filter(Boolean)
    .map((role) => String(role).toLowerCase());
  return [...mappedRoles, ...fallbackRoles];
};

const normalizeRoleLabel = (roles: string[]) =>
  roles.includes('instructor') ? 'instructor' : 'ta';

const extractApiErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return (
    maybe?.response?.data?.message ||
    maybe?.message ||
    fallback
  );
};

export function OfficeHoursManagementPage({
  isMockMode: propMockMode = false,
  useLiveApi = false,
}: OfficeHoursManagementPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  // Mock data
  const MOCK_INSTRUCTORS = [
    { id: 1, firstName: 'Dr. Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@university.edu', role: 'instructor' },
    { id: 2, firstName: 'Dr. Sarah', lastName: 'Ibrahim', email: 'sarah.ibrahim@university.edu', role: 'instructor' },
    { id: 3, firstName: 'Eng. Mohammed', lastName: 'Ali', email: 'mohammed.ali@university.edu', role: 'ta' },
    { id: 4, firstName: 'Eng. Fatima', lastName: 'Omar', email: 'fatima.omar@university.edu', role: 'ta' },
  ];

  const MOCK_OFFICE_HOURS: OfficeHourWithInstructor[] = [
    {
      slotId: 1,
      instructorId: 1,
      dayOfWeek: 'MONDAY',
      startTime: '10:00:00',
      endTime: '12:00:00',
      location: 'Office 301',
      building: 'Engineering Building',
      room: '301',
      mode: 'in_person',
      maxAppointments: 6,
      currentAppointments: 3,
      isRecurring: true,
      isActive: true,
      instructor: MOCK_INSTRUCTORS[0],
    },
    {
      slotId: 2,
      instructorId: 1,
      dayOfWeek: 'WEDNESDAY',
      startTime: '14:00:00',
      endTime: '16:00:00',
      location: 'https://zoom.us/j/123456',
      mode: 'online',
      maxAppointments: 8,
      currentAppointments: 5,
      isRecurring: true,
      isActive: true,
      instructor: MOCK_INSTRUCTORS[0],
    },
    {
      slotId: 3,
      instructorId: 2,
      dayOfWeek: 'TUESDAY',
      startTime: '09:00:00',
      endTime: '11:00:00',
      location: 'Office 205',
      building: 'Science Building',
      room: '205',
      mode: 'hybrid',
      maxAppointments: 4,
      currentAppointments: 2,
      isRecurring: true,
      isActive: true,
      instructor: MOCK_INSTRUCTORS[1],
    },
    {
      slotId: 4,
      instructorId: 3,
      dayOfWeek: 'THURSDAY',
      startTime: '13:00:00',
      endTime: '15:00:00',
      location: 'Lab 102',
      building: 'Engineering Building',
      room: '102',
      mode: 'in_person',
      maxAppointments: 5,
      currentAppointments: 0,
      isRecurring: true,
      isActive: true,
      instructor: MOCK_INSTRUCTORS[2],
    },
  ];

  const isMockMode = propMockMode;

  // State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSlot, setSelectedSlot] = useState<OfficeHourWithInstructor | null>(null);
  const [expandedAppointments, setExpandedAppointments] = useState<number | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState<number | 'all'>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Form state
  const [formData, setFormData] = useState({
    instructorId: undefined as number | undefined,
    dayOfWeek: 'MONDAY',
    startTime: '09:00:00',
    endTime: '10:00:00',
    location: '',
    building: '',
    room: '',
    mode: 'in_person' as 'in_person' | 'online' | 'hybrid',
    maxAppointments: 5,
    isRecurring: true,
    effectiveFrom: '',
    effectiveUntil: '',
    notes: '',
  });

  // Fetch instructors (and TAs)
  const { data: instructorsData, isError: instructorsError } = useQuery({
    queryKey: ['instructors-tas'],
    queryFn: async () => {
      const pageSize = 500;
      const collected: AdminUserRow[] = [];
      let nextPage = 1;
      let totalFromApi: number | null = null;

      while (true) {
        const usersResponse = await adminService.getUsers({ page: nextPage, size: pageSize });
        const rows = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

        if (totalFromApi === null && typeof usersResponse?.total === 'number') {
          totalFromApi = usersResponse.total;
        }

        collected.push(...rows);

        const reachedTotal = totalFromApi !== null && collected.length >= totalFromApi;
        const reachedLastPage = rows.length < pageSize;

        if (reachedTotal || reachedLastPage) {
          break;
        }

        nextPage += 1;
      }

      const eligible = collected
        .filter((user) => {
          const roles = extractRoles(user);
          return roles.some((role) => ELIGIBLE_ROLE_ALIASES.has(role));
        })
        .map((user) => {
          const roles = extractRoles(user);
          return {
            ...user,
            role: normalizeRoleLabel(roles),
          };
        });

      return eligible;
    },
    retry: 1,
  });
  const instructors = useLiveApi
    ? instructorsData ?? []
    : instructorsError || !instructorsData || instructorsData.length === 0
      ? MOCK_INSTRUCTORS
      : instructorsData;

  // Fetch office hours with fallback
  const { data: officeHoursData, isLoading, isError: officeHoursError } = useQuery({
    queryKey: ['office-hours', { instructorFilter, dayFilter, page, limit }],
    queryFn: () => ScheduleService.getOfficeHours({
      instructorId: instructorFilter !== 'all' ? instructorFilter : undefined,
      dayOfWeek: dayFilter !== 'all' ? dayFilter : undefined,
      page,
      limit,
    }),
    retry: 1,
  });

  // Filter mock data locally
  const getFilteredMockData = () => {
    let filtered = [...MOCK_OFFICE_HOURS];
    if (searchTerm) {
      filtered = filtered.filter(oh =>
        oh.instructor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oh.instructor?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oh.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (instructorFilter !== 'all') {
      filtered = filtered.filter(oh => oh.instructorId === instructorFilter);
    }
    if (dayFilter !== 'all') {
      filtered = filtered.filter(oh => oh.dayOfWeek === dayFilter);
    }
    if (modeFilter !== 'all') {
      filtered = filtered.filter(oh => oh.mode === modeFilter);
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(oh => oh.instructor?.role === roleFilter);
    }
    return filtered;
  };

  const officeHours = useLiveApi
    ? officeHoursError || !officeHoursData?.data
      ? []
      : officeHoursData.data
    : officeHoursError || !officeHoursData?.data
      ? getFilteredMockData()
      : officeHoursData.data;
  const totalPages = officeHoursError || !officeHoursData?.meta ? 1 : officeHoursData.meta.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof ScheduleService.createOfficeHour>[0]) =>
      ScheduleService.createOfficeHour(data),
    onSuccess: () => {
      toast.success(t('officeHourCreated') || 'Office hour created successfully');
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to create office hour');
      console.error('[OfficeHoursManagement:create] API error', error);
      toast.error(details);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof ScheduleService.updateOfficeHour>[1] }) =>
      ScheduleService.updateOfficeHour(id, data),
    onSuccess: () => {
      toast.success(t('officeHourUpdated') || 'Office hour updated successfully');
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to update office hour');
      console.error('[OfficeHoursManagement:update] API error', error);
      toast.error(details);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ScheduleService.deleteOfficeHour(id),
    onSuccess: () => {
      toast.success(t('officeHourDeleted') || 'Office hour deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to delete office hour');
      console.error('[OfficeHoursManagement:delete] API error', error);
      toast.error(details);
    },
  });

  // Fetch appointments for expanded row
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['office-hour-appointments', expandedAppointments],
    queryFn: () => ScheduleService.getOfficeHourAppointments(expandedAppointments!),
    enabled: !!expandedAppointments,
    retry: 1,
  });

  const editSlotId = activeModal === 'edit' && selectedSlot ? selectedSlot.slotId : null;
  const { data: slotDetail, isLoading: isSlotDetailLoading } = useQuery({
    queryKey: ['office-hour-slot', editSlotId],
    queryFn: () => ScheduleService.getOfficeHourById(editSlotId!),
    enabled: editSlotId != null,
  });

  useEffect(() => {
    if (activeModal !== 'edit' || !selectedSlot) return;
    const detailForSlot =
      slotDetail && slotDetail.slotId === selectedSlot.slotId ? slotDetail : undefined;
    const merged = { ...selectedSlot, ...(detailForSlot || {}) } as OfficeHoursSlot &
      OfficeHourWithInstructor;
    setFormData(buildFormFromSlot(merged));
  }, [activeModal, selectedSlot, slotDetail]);

  const timeSelectOptions = useMemo(
    () => mergeTimeOptions(TIME_SLOTS, [formData.startTime, formData.endTime]),
    [formData.startTime, formData.endTime],
  );

  // Modal handlers
  const openModal = (type: ModalType, slot?: OfficeHourWithInstructor) => {
    setActiveModal(type);
    if (slot) {
      setSelectedSlot(slot);
    } else {
      setSelectedSlot(null);
      setFormData({
        instructorId: undefined,
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '10:00:00',
        location: '',
        building: '',
        room: '',
        mode: 'in_person',
        maxAppointments: 5,
        isRecurring: true,
        effectiveFrom: '',
        effectiveUntil: '',
        notes: '',
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSlot(null);
  };

  const handleSubmit = () => {
    if (!formData.instructorId) {
      toast.error('Please select an instructor or TA');
      return;
    }
    if (!formData.location) {
      toast.error('Please enter a location');
      return;
    }

    const payload = {
      instructorId: formData.instructorId,
      dayOfWeek: formData.dayOfWeek.toLowerCase(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      building: formData.building || undefined,
      room: formData.room || undefined,
      mode: formData.mode,
      maxAppointments: formData.maxAppointments,
      isRecurring: formData.isRecurring,
      effectiveFrom: formData.effectiveFrom || undefined,
      effectiveUntil: formData.effectiveUntil || undefined,
      notes: formData.notes || undefined,
    };

    if (activeModal === 'edit' && selectedSlot) {
      updateMutation.mutate({ id: selectedSlot.slotId, data: payload });
    } else if (activeModal === 'create') {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedSlot) {
      deleteMutation.mutate(selectedSlot.slotId);
    }
  };

  // Mode badge styles
  const getModeStyle = (mode: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      in_person: {
        bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
        text: isDark ? 'text-emerald-400' : 'text-emerald-700',
        border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      },
      online: {
        bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
        text: isDark ? 'text-blue-400' : 'text-blue-700',
        border: isDark ? 'border-blue-500/20' : 'border-blue-200',
      },
      hybrid: {
        bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
        text: isDark ? 'text-purple-400' : 'text-purple-700',
        border: isDark ? 'border-purple-500/20' : 'border-purple-200',
      },
    };
    return styles[mode] || styles.in_person;
  };

  const formatTime = (time: string) => time.slice(0, 5);
  const getDayLabel = (day: string) => DAYS_OF_WEEK.find(d => d.value === day)?.label || day;

  // Styles
  const headingClass = isDark ? 'text-white' : 'text-slate-900';
  const labelClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const cardClass = isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200';
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${headingClass}`}>{t('officeHours') || 'Office Hours'}</h2>
          <p className={`text-sm mt-1 ${labelClass}`}>
            {t('officeHoursDescription') || 'Manage office hours for instructors and teaching assistants'}
          </p>
        </div>
        <button
          onClick={() => openModal('create')}
          style={{ backgroundColor: accentColor }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
        >
          <Plus size={16} />
          {t('addOfficeHour') || 'Add Office Hour'}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${cardClass}`}>
        {!useLiveApi && (instructorsError || !instructorsData || instructorsData.length === 0) && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            {t('warning') || 'Warning'}: using fallback instructor/TA mock list. Live user API data is unavailable.
          </div>
        )}
        {!useLiveApi && (officeHoursError || !officeHoursData?.data) && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            {t('warning') || 'Warning'}: using fallback office-hours mock data. Live office-hours API data is unavailable.
          </div>
        )}
        {useLiveApi && instructorsError && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {t('warning') || 'Warning'}: could not load instructors/TAs from the server.
          </div>
        )}
        {useLiveApi && officeHoursError && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {t('warning') || 'Warning'}: could not load office hours from the server.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder={t('search') || 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} ${inputClass}`}
            />
          </div>

          {/* Instructor Filter */}
          <CleanSelect
            value={String(instructorFilter)}
            onChange={(e) => setInstructorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={inputClass}
          >
            <option value="all">{t('allInstructors') || 'All Instructors/TAs'}</option>
            {instructors.map((i: any) => (
              <option key={i.id || i.userId} value={String(i.id || i.userId)}>
                {i.firstName} {i.lastName}
              </option>
            ))}
          </CleanSelect>

          {/* Day Filter */}
          <CleanSelect
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allDays') || 'All Days'}</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>{t(d.value.toLowerCase()) || d.label}</option>
            ))}
          </CleanSelect>

          {/* Mode Filter */}
          <CleanSelect
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allModes') || 'All Modes'}</option>
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>{t(m.value) || m.label}</option>
            ))}
          </CleanSelect>

          {/* Role Filter */}
          <CleanSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allRoles') || 'All Roles'}</option>
            <option value="instructor">{t('instructors') || 'Instructors'}</option>
            <option value="ta">{t('teachingAssistants') || 'Teaching Assistants'}</option>
          </CleanSelect>
        </div>
      </div>

      {/* Office Hours List */}
      <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
          </div>
        ) : officeHours.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-sm ${labelClass}`}>{t('noOfficeHours') || 'No office hours found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-900/50' : 'bg-slate-50'}>
                <tr>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('instructor') || 'Instructor/TA'}
                  </th>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('schedule') || 'Schedule'}
                  </th>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('location') || 'Location'}
                  </th>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('mode') || 'Mode'}
                  </th>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('appointments') || 'Appointments'}
                  </th>
                  <th className={`px-4 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
                    {t('actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {officeHours.map((oh: OfficeHourWithInstructor) => {
                  const modeStyle = getModeStyle(oh.mode);
                  const isExpanded = expandedAppointments === oh.slotId;
                  const instructor = oh.instructor || instructors.find((i: any) => (i.id || i.userId) === oh.instructorId);
                  
                  return (
                    <React.Fragment key={oh.slotId}>
                      <tr className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium`}
                              style={{ backgroundColor: accentColor }}
                            >
                              {instructor?.firstName?.[0]}{instructor?.lastName?.[0]}
                            </div>
                            <div>
                              <p className={`font-medium ${headingClass}`}>
                                {instructor?.firstName} {instructor?.lastName}
                              </p>
                              <p className={`text-xs ${labelClass}`}>
                                {instructor?.role === 'ta' ? 'Teaching Assistant' : 'Instructor'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className={labelClass} />
                            <span className={headingClass}>{getDayLabel(oh.dayOfWeek)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className={labelClass} />
                            <span className={`text-sm ${labelClass}`}>
                              {formatTime(oh.startTime)} - {formatTime(oh.endTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {oh.mode === 'online' ? (
                              <Video size={14} className={labelClass} />
                            ) : (
                              <MapPin size={14} className={labelClass} />
                            )}
                            <span className={`text-sm ${headingClass}`}>{oh.location}</span>
                          </div>
                          {oh.building && (
                            <p className={`text-xs mt-1 ${labelClass}`}>
                              {oh.building} {oh.room && `- ${oh.room}`}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${modeStyle.bg} ${modeStyle.text} ${modeStyle.border}`}
                          >
                            {oh.mode === 'online' && <Video size={12} />}
                            {oh.mode === 'in_person' && <User size={12} />}
                            {oh.mode === 'hybrid' && <Users size={12} />}
                            {t(oh.mode) || oh.mode.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setExpandedAppointments(isExpanded ? null : oh.slotId)}
                            className={`flex items-center gap-2 px-2 py-1 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                          >
                            <span className={headingClass}>
                              {oh.currentAppointments}/{oh.maxAppointments}
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal('edit', oh)}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                              title={t('edit') || 'Edit'}
                            >
                              <Edit2 size={16} className={labelClass} />
                            </button>
                            <button
                              onClick={() => openModal('delete', oh)}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                              title={t('delete') || 'Delete'}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded appointments row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className={`px-4 py-4 ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
                            {appointmentsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />
                              </div>
                            ) : (appointmentsData?.data?.length || 0) === 0 ? (
                              <p className={`text-sm text-center py-4 ${labelClass}`}>
                                {t('noAppointments') || 'No appointments scheduled'}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <h4 className={`text-sm font-medium ${headingClass}`}>
                                  {t('scheduledAppointments') || 'Scheduled Appointments'}
                                </h4>
                                <div className="grid gap-2">
                                  {appointmentsData?.data?.map((apt: OfficeHoursAppointment) => (
                                    <div
                                      key={apt.appointmentId}
                                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <User size={16} className={labelClass} />
                                        <div>
                                          <p className={`text-sm font-medium ${headingClass}`}>
                                            {apt.student?.firstName} {apt.student?.lastName}
                                          </p>
                                          <p className={`text-xs ${labelClass}`}>{apt.topic}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className={`text-xs ${labelClass}`}>{apt.appointmentDate}</span>
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${
                                            apt.status === 'confirmed'
                                              ? 'bg-emerald-500/10 text-emerald-500'
                                              : apt.status === 'cancelled'
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'bg-amber-500/10 text-amber-500'
                                          }`}
                                        >
                                          {apt.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <p className={`text-sm ${labelClass}`}>
              {t('page')} {page} {t('of')} {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  page === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : isDark
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-300 hover:bg-slate-100'
                } ${headingClass}`}
              >
                {t('previous') || 'Previous'}
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  page === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : isDark
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-300 hover:bg-slate-100'
                } ${headingClass}`}
              >
                {t('next') || 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border ${cardClass} shadow-2xl`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-lg font-semibold ${headingClass}`}>
                {activeModal === 'create' ? t('addOfficeHour') || 'Add Office Hour' : t('editOfficeHour') || 'Edit Office Hour'}
              </h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            <div
              className={`p-6 space-y-6 relative ${isSlotDetailLoading && activeModal === 'edit' ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {isSlotDetailLoading && activeModal === 'edit' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-2xl">
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: accentColor }} />
                </div>
              )}
              {/* Instructor Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {t('instructor') || 'Instructor/TA'} *
                </label>
                <CleanSelect
                  value={formData.instructorId ? String(formData.instructorId) : ''}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value ? Number(e.target.value) : undefined })}
                  className={`w-full ${inputClass}`}
                >
                  <option value="">{t('selectInstructor') || 'Select instructor or TA'}</option>
                  {instructors.map((i: any) => {
                    const uid = i.id ?? i.userId;
                    const name =
                      [i.firstName, i.lastName].filter(Boolean).join(' ').trim() ||
                      i.email ||
                      (uid != null ? `User ${uid}` : 'Unknown');
                    return (
                      <option key={uid} value={String(uid ?? '')}>
                        {name} ({i.role === 'ta' ? 'TA' : 'Instructor'})
                      </option>
                    );
                  })}
                </CleanSelect>
              </div>

              {/* Day and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                    {t('day') || 'Day'} *
                  </label>
                  <CleanSelect
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className={`w-full ${inputClass}`}
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>{t(d.value.toLowerCase()) || d.label}</option>
                    ))}
                  </CleanSelect>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                    {t('startTime') || 'Start Time'} *
                  </label>
                  <CleanSelect
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`w-full ${inputClass}`}
                  >
                    {timeSelectOptions.map((timeOpt) => (
                      <option key={timeOpt.value} value={timeOpt.value}>
                        {timeOpt.label}
                      </option>
                    ))}
                  </CleanSelect>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                    {t('endTime') || 'End Time'} *
                  </label>
                  <CleanSelect
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full ${inputClass}`}
                  >
                    {timeSelectOptions.map((timeOpt) => (
                      <option key={`end-${timeOpt.value}`} value={timeOpt.value}>
                        {timeOpt.label}
                      </option>
                    ))}
                  </CleanSelect>
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {t('mode') || 'Mode'} *
                </label>
                <CleanSelect
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'in_person' | 'online' | 'hybrid' })}
                  className={`w-full ${inputClass}`}
                >
                  {MODES.map((m) => (
                    <option key={m.value} value={m.value}>{t(m.value) || m.label}</option>
                  ))}
                </CleanSelect>
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {formData.mode === 'online' ? t('meetingLink') || 'Meeting Link' : t('location') || 'Location'} *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={formData.mode === 'online' ? 'https://zoom.us/j/...' : 'Office 301'}
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Building & Room (for in-person/hybrid) */}
              {formData.mode !== 'online' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                      {t('building') || 'Building'}
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      placeholder="Engineering Building"
                      className={`w-full ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                      {t('room') || 'Room'}
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="301"
                      className={`w-full ${inputClass}`}
                    />
                  </div>
                </div>
              )}

              {/* Max Appointments */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {t('maxAppointments') || 'Maximum Appointments'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxAppointments}
                  onChange={(e) => setFormData({ ...formData, maxAppointments: parseInt(e.target.value) || 5 })}
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded"
                  style={{ accentColor }}
                />
                <label htmlFor="isRecurring" className={`text-sm ${labelClass}`}>
                  {t('recurringWeekly') || 'Recurring weekly'}
                </label>
              </div>

              {/* Effective Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                    {t('effectiveFrom') || 'Effective From'}
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                    {t('effectiveUntil') || 'Effective Until'}
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveUntil}
                    onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                    className={`w-full ${inputClass}`}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {t('notes') || 'Notes'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder={t('optionalNotes') || 'Optional notes about this office hour...'}
                  className={`w-full ${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ backgroundColor: accentColor }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {activeModal === 'create' ? t('create') || 'Create' : t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border ${cardClass} shadow-2xl`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-lg font-semibold ${headingClass}`}>
                {t('confirmDelete') || 'Confirm Delete'}
              </h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className={`font-medium ${headingClass}`}>
                    {t('deleteOfficeHourWarning') || 'Are you sure you want to delete this office hour?'}
                  </p>
                  <p className={`text-sm mt-1 ${labelClass}`}>
                    {getDayLabel(selectedSlot.dayOfWeek)} {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${labelClass}`}>
                {t('deleteOfficeHourNote') || 'This action cannot be undone. All scheduled appointments for this slot will also be cancelled.'}
              </p>
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficeHoursManagementPage;
