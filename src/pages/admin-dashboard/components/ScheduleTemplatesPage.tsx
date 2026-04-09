import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  X,
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Layers,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';
import { ScheduleService, ScheduleTemplate, ScheduleTemplateQuery } from '../../../services/api/scheduleService';
import { adminService } from '../../../services/adminService';
import { ApiClient } from '../../../services/api/client';

interface ScheduleTemplatesPageProps {
  isMockMode?: boolean;
}

interface DepartmentOption {
  id: number;
  name: string;
}

const extractApiErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return maybe?.response?.data?.message || maybe?.message || fallback;
};

const normalizeDepartments = (raw: any): DepartmentOption[] => {
  const rows = Array.isArray(raw) ? raw : [];
  return rows
    .map((department: any) => {
      const id = Number(department?.id ?? department?.departmentId);
      const name = String(department?.name ?? department?.departmentName ?? '').trim();
      if (!Number.isFinite(id) || !name) return null;
      return { id, name };
    })
    .filter(Boolean) as DepartmentOption[];
};

const getCreatorDisplayName = (creator?: Partial<{ firstName: string; lastName: string }> | null) => {
  if (!creator) return 'Unknown';
  const first = creator.firstName?.trim() ?? '';
  const last = creator.lastName?.trim() ?? '';
  const fullName = `${first} ${last}`.trim();
  return fullName || 'Unknown';
};

const SCHEDULE_TYPES = [
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'LAB', label: 'Lab' },
  { value: 'TUTORIAL', label: 'Tutorial' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const SLOT_TYPES = [
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'LAB', label: 'Lab' },
  { value: 'TUTORIAL', label: 'Tutorial' },
  { value: 'EXAM', label: 'Exam' },
];

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday', short: 'Mon' },
  { value: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { value: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { value: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { value: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { value: 'SUNDAY', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
});

interface TemplateSlotInput {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotType: string;
  building: string;
  room: string;
}

type ModalType = 'create' | 'edit' | 'delete' | 'apply' | 'bulk-apply' | null;
type WizardStep = 1 | 2 | 3;

export function ScheduleTemplatesPage({ isMockMode: propMockMode = false }: ScheduleTemplatesPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  // Mock data for when API is unavailable
  const MOCK_DEPARTMENTS = [
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Engineering' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Physics' },
  ];

  const MOCK_TEMPLATES: ScheduleTemplate[] = [
    {
      id: 1,
      name: 'Standard Lecture Template',
      description: 'Standard lecture schedule: MWF 9am-10am',
      departmentId: 1,
      scheduleType: 'LECTURE',
      isActive: true,
      slots: [
        { id: 1, dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '10:00:00', slotType: 'LECTURE' },
        { id: 2, dayOfWeek: 'WEDNESDAY', startTime: '09:00:00', endTime: '10:00:00', slotType: 'LECTURE' },
        { id: 3, dayOfWeek: 'FRIDAY', startTime: '09:00:00', endTime: '10:00:00', slotType: 'LECTURE' },
      ],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'Lab Session Template',
      description: 'Lab sessions: Tu/Th 2pm-5pm',
      departmentId: 1,
      scheduleType: 'LAB',
      isActive: true,
      slots: [
        { id: 4, dayOfWeek: 'TUESDAY', startTime: '14:00:00', endTime: '17:00:00', slotType: 'LAB' },
        { id: 5, dayOfWeek: 'THURSDAY', startTime: '14:00:00', endTime: '17:00:00', slotType: 'LAB' },
      ],
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 3,
      name: 'Hybrid Course Template',
      description: 'Hybrid: Mon lecture, Wed online, Fri discussion',
      departmentId: 2,
      scheduleType: 'HYBRID',
      isActive: false,
      slots: [
        { id: 6, dayOfWeek: 'MONDAY', startTime: '10:00:00', endTime: '11:30:00', slotType: 'LECTURE' },
        { id: 7, dayOfWeek: 'FRIDAY', startTime: '10:00:00', endTime: '11:00:00', slotType: 'TUTORIAL' },
      ],
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-10T14:30:00Z',
    },
  ];

  const MOCK_SECTIONS = [
    { id: 1, name: 'CS101-A', courseCode: 'CS101', courseName: 'Intro to Programming' },
    { id: 2, name: 'CS101-B', courseCode: 'CS101', courseName: 'Intro to Programming' },
    { id: 3, name: 'CS201-A', courseCode: 'CS201', courseName: 'Data Structures' },
    { id: 4, name: 'ENG101-A', courseCode: 'ENG101', courseName: 'Engineering Fundamentals' },
  ];

  const isMockMode = propMockMode;

  // State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: undefined as number | undefined,
    scheduleType: 'LECTURE' as 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID',
    isActive: true,
  });

  const [slots, setSlots] = useState<TemplateSlotInput[]>([]);

  // Apply template state
  const [applySectionId, setApplySectionId] = useState<number | undefined>();
  const [applyBuilding, setApplyBuilding] = useState('');
  const [applyRoom, setApplyRoom] = useState('');
  const [bulkSectionIds, setBulkSectionIds] = useState<number[]>([]);

  // Fetch departments with fallback
  const { data: departmentsData, isError: deptError } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => adminService.getDepartments(),
    retry: 1,
  });
  const liveDepartments = normalizeDepartments(departmentsData);
  const isDepartmentsFallback = deptError || liveDepartments.length === 0;
  const departments = isDepartmentsFallback ? MOCK_DEPARTMENTS : liveDepartments;

  // Fetch sections for applying templates with fallback
  const { data: sectionsData, isError: sectionsError } = useQuery({
    queryKey: ['all-sections'],
    queryFn: async () => {
      const res = await ApiClient.get<any>('/sections');
      return res?.data || res || [];
    },
    enabled: activeModal === 'apply' || activeModal === 'bulk-apply',
    retry: 1,
  });
  const sections = (sectionsError || !sectionsData || sectionsData.length === 0) ? MOCK_SECTIONS : sectionsData;

  // Build query params
  const queryParams: ScheduleTemplateQuery = {
    page,
    limit,
    search: searchTerm || undefined,
    scheduleType: typeFilter !== 'all' ? (typeFilter as ScheduleTemplateQuery['scheduleType']) : undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
    isActive: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
  };

  // Fetch templates with fallback
  const { data: templatesData, isLoading, isError: templatesError } = useQuery({
    queryKey: ['schedule-templates', queryParams],
    queryFn: () => ScheduleService.getScheduleTemplates(queryParams),
    retry: 1,
  });

  // Filter mock data locally if API fails
  const getFilteredMockTemplates = () => {
    let filtered = [...MOCK_TEMPLATES];
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.scheduleType === typeFilter);
    }
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(t => t.departmentId === departmentFilter);
    }
    if (activeFilter !== 'all') {
      filtered = filtered.filter(t => t.isActive === (activeFilter === 'true'));
    }
    return filtered;
  };

  const templates = templatesError || !templatesData?.data ? getFilteredMockTemplates() : templatesData.data;
  const totalPages = templatesError || !templatesData?.meta ? 1 : templatesData.meta.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof ScheduleService.createScheduleTemplate>[0]) =>
      ScheduleService.createScheduleTemplate(data),
    onSuccess: () => {
      toast.success(t('templateCreated'));
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to create template');
      console.error('[ScheduleTemplates:create] API error', error);
      toast.error(details);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof ScheduleService.updateScheduleTemplate>[1] }) =>
      ScheduleService.updateScheduleTemplate(id, data),
    onSuccess: () => {
      toast.success(t('templateUpdated'));
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to update template');
      console.error('[ScheduleTemplates:update] API error', error);
      toast.error(details);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ScheduleService.deleteScheduleTemplate(id),
    onSuccess: () => {
      toast.success(t('templateDeleted'));
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to delete template');
      console.error('[ScheduleTemplates:delete] API error', error);
      toast.error(details);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (data: Parameters<typeof ScheduleService.applyTemplateToSection>[0]) =>
      ScheduleService.applyTemplateToSection(data),
    onSuccess: (response) => {
      toast.success(`${t('templatesApplied')}: ${response.schedulesCreated} ${t('schedulesCreated')}`);
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to apply template');
      console.error('[ScheduleTemplates:apply] API error', error);
      toast.error(details);
    },
  });

  const bulkApplyMutation = useMutation({
    mutationFn: (data: Parameters<typeof ScheduleService.bulkApplyTemplate>[0]) =>
      ScheduleService.bulkApplyTemplate(data),
    onSuccess: (response) => {
      toast.success(`${t('templatesApplied')}: ${response.successful} successful, ${response.failed} failed`);
      if (response.errors.length > 0) {
        response.errors.forEach((err) => {
          toast.error(`Section ${err.sectionId}: ${err.message}`);
        });
      }
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to bulk apply template');
      console.error('[ScheduleTemplates:bulk-apply] API error', error);
      toast.error(details);
    },
  });

  // Helpers
  const openModal = (type: ModalType, template?: ScheduleTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      if (type === 'edit') {
        setFormData({
          name: template.name,
          description: template.description || '',
          departmentId: template.departmentId || undefined,
          scheduleType: template.scheduleType as any,
          isActive: template.isActive,
        });
        setSlots(
          template.slots.map((s) => ({
            id: crypto.randomUUID(),
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            slotType: s.slotType,
            building: s.building || '',
            room: s.room || '',
          }))
        );
      }
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        departmentId: undefined,
        scheduleType: 'LECTURE',
        isActive: true,
      });
      setSlots([]);
    }
    setWizardStep(1);
    setApplySectionId(undefined);
    setApplyBuilding('');
    setApplyRoom('');
    setBulkSectionIds([]);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTemplate(null);
    setWizardStep(1);
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: crypto.randomUUID(),
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '10:30:00',
        slotType: formData.scheduleType === 'HYBRID' ? 'LECTURE' : formData.scheduleType,
        building: '',
        room: '',
      },
    ]);
  };

  const updateSlot = (id: string, field: keyof TemplateSlotInput, value: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (slots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      departmentId: formData.departmentId,
      scheduleType: formData.scheduleType,
      isActive: formData.isActive,
      slots: slots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotType: s.slotType as 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM',
        building: s.building || undefined,
        room: s.room || undefined,
      })),
    };

    if (activeModal === 'edit' && selectedTemplate) {
      updateMutation.mutate({
        id: selectedTemplate.templateId,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          departmentId: formData.departmentId,
          scheduleType: formData.scheduleType,
          isActive: formData.isActive,
        },
      });
    } else if (activeModal === 'create') {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.templateId);
    }
  };

  const handleApply = () => {
    if (selectedTemplate && applySectionId) {
      applyMutation.mutate({
        templateId: selectedTemplate.templateId,
        sectionId: applySectionId,
        building: applyBuilding || undefined,
        room: applyRoom || undefined,
      });
    }
  };

  const handleBulkApply = () => {
    if (selectedTemplate && bulkSectionIds.length > 0) {
      bulkApplyMutation.mutate({
        templateId: selectedTemplate.templateId,
        sectionIds: bulkSectionIds,
        building: applyBuilding || undefined,
        room: applyRoom || undefined,
      });
    }
  };

  const toggleBulkSection = (sectionId: number) => {
    setBulkSectionIds((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  // Weekly preview grid
  const WeeklyPreview = useMemo(() => {
    const daySlots: Record<string, TemplateSlotInput[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      daySlots[day.value] = slots.filter((s) => s.dayOfWeek === day.value);
    });

    const slotColors: Record<string, string> = {
      LECTURE: '#3B82F6',
      LAB: '#10B981',
      TUTORIAL: '#F59E0B',
      EXAM: '#EF4444',
    };

    return (
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.value}
              className={`p-2 text-center text-xs font-semibold uppercase ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}
            >
              {day.short}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 min-h-[200px]">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className={`p-2 space-y-1 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              {daySlots[day.value].map((slot) => (
                <div
                  key={slot.id}
                  className="p-2 rounded text-xs text-white"
                  style={{ backgroundColor: slotColors[slot.slotType] || '#6B7280' }}
                >
                  <div className="font-medium">{slot.slotType}</div>
                  <div className="opacity-80">
                    {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                  </div>
                  {slot.room && <div className="opacity-70">{slot.room}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }, [slots, isDark]);

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
          <h2 className={`text-xl font-bold ${headingClass}`}>{t('scheduleTemplates')}</h2>
          <p className={`text-sm mt-1 ${labelClass}`}>{t('scheduleTemplatesDescription')}</p>
        </div>
        <button
          onClick={() => openModal('create')}
          style={{ backgroundColor: accentColor }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
        >
          <Plus size={16} />
          {t('createTemplate')}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${cardClass}`}>
        {isDepartmentsFallback && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            {t('warning') || 'Warning'}: using fallback department mock data because live departments API failed.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} ${inputClass}`}
            />
          </div>

          {/* Type Filter */}
          <CleanSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allTypes')}</option>
            {SCHEDULE_TYPES.map((st) => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </CleanSelect>

          {/* Department Filter */}
          <CleanSelect
            value={String(departmentFilter)}
            onChange={(e) => setDepartmentFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={inputClass}
          >
            <option value="all">{t('allDepartments')}</option>
            {departments.map((d: any) => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </CleanSelect>

          {/* Active Filter */}
          <CleanSelect
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="true">{t('active')}</option>
            <option value="false">{t('inactive')}</option>
          </CleanSelect>
        </div>
      </div>

      {/* Templates Table */}
      <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Layers className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={labelClass}>No templates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('templateName')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('scheduleType')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('department')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('slotsCount')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('status')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('createdBy')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {templates.map((template) => (
                  <tr key={template.templateId} className={isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-4">
                      <div>
                        <p className={`font-medium ${headingClass}`}>{template.name}</p>
                        {template.description && (
                          <p className={`text-xs ${labelClass} truncate max-w-xs`}>{template.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                        isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'
                      } border`}>
                        {template.scheduleType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${labelClass}`}>
                        {template.department?.departmentName || t('universityWide')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${labelClass}`}>{template.slots.length}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                        template.isActive
                          ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDark ? 'bg-slate-700/50 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {template.isActive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {template.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${labelClass}`}>
                        {getCreatorDisplayName(template.creator) || t('unknown') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal('apply', template)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-emerald-500/20' : 'hover:bg-emerald-50'}`}
                          title={t('applyTemplate')}
                        >
                          <Play size={16} className="text-emerald-500" />
                        </button>
                        <button
                          onClick={() => openModal('bulk-apply', template)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-blue-500/20' : 'hover:bg-blue-50'}`}
                          title={t('bulkApply')}
                        >
                          <Copy size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => openModal('edit', template)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                          title={t('editTemplate')}
                        >
                          <Edit2 size={16} className={labelClass} />
                        </button>
                        <button
                          onClick={() => openModal('delete', template)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                          title={t('deleteTemplate')}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              {t('previous')}
            </button>
            <span className={`text-sm ${labelClass}`}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Multi-step Wizard */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${headingClass}`}>
                {activeModal === 'create' ? t('createTemplate') : t('editTemplate')}
              </h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                      wizardStep >= step
                        ? 'text-white'
                        : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
                    }`}
                    style={{ backgroundColor: wizardStep >= step ? accentColor : undefined }}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-20 h-1 mx-2 rounded transition-colors ${
                        wizardStep > step
                          ? ''
                          : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                      style={{ backgroundColor: wizardStep > step ? accentColor : undefined }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mb-6 px-2">
              <span className={`text-sm ${wizardStep === 1 ? headingClass : labelClass} font-medium`}>{t('basicInfo')}</span>
              <span className={`text-sm ${wizardStep === 2 ? headingClass : labelClass} font-medium`}>{t('timeSlots')}</span>
              <span className={`text-sm ${wizardStep === 3 ? headingClass : labelClass} font-medium`}>{t('previewConfirm')}</span>
            </div>

            {/* Step 1: Basic Info */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('templateName')} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('templateDescription')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full ${inputClass}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('scheduleType')} *</label>
                    <CleanSelect
                      value={formData.scheduleType}
                      onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as any })}
                      className={`w-full ${inputClass}`}
                    >
                      {SCHEDULE_TYPES.map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </CleanSelect>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('department')}</label>
                    <CleanSelect
                      value={String(formData.departmentId || '')}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : undefined })}
                      className={`w-full ${inputClass}`}
                    >
                      <option value="">{t('universityWide')}</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={String(d.id)}>{d.name}</option>
                      ))}
                    </CleanSelect>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className={`text-sm ${labelClass}`}>{t('isActive')}</span>
                </label>
              </div>
            )}

            {/* Step 2: Time Slots */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                {slots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={labelClass}>{t('noSlotsAdded')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {slots.map((slot, index) => (
                      <div key={slot.id} className={`p-4 rounded-xl border ${cardClass}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${headingClass}`}>Slot {index + 1}</span>
                          <button
                            onClick={() => removeSlot(slot.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <CleanSelect
                            value={slot.dayOfWeek}
                            onChange={(e) => updateSlot(slot.id, 'dayOfWeek', e.target.value)}
                            className={inputClass}
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </CleanSelect>
                          <CleanSelect
                            value={slot.startTime}
                            onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                            className={inputClass}
                          >
                            {TIME_SLOTS.map((ts) => (
                              <option key={ts} value={ts}>{ts.slice(0, 5)}</option>
                            ))}
                          </CleanSelect>
                          <CleanSelect
                            value={slot.endTime}
                            onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                            className={inputClass}
                          >
                            {TIME_SLOTS.map((ts) => (
                              <option key={ts} value={ts}>{ts.slice(0, 5)}</option>
                            ))}
                          </CleanSelect>
                          <CleanSelect
                            value={slot.slotType}
                            onChange={(e) => updateSlot(slot.id, 'slotType', e.target.value)}
                            className={inputClass}
                          >
                            {SLOT_TYPES.map((st) => (
                              <option key={st.value} value={st.value}>{st.label}</option>
                            ))}
                          </CleanSelect>
                          <input
                            type="text"
                            value={slot.building}
                            onChange={(e) => updateSlot(slot.id, 'building', e.target.value)}
                            placeholder={t('building')}
                            className={inputClass}
                          />
                          <input
                            type="text"
                            value={slot.room}
                            onChange={(e) => updateSlot(slot.id, 'room', e.target.value)}
                            placeholder={t('room')}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={addSlot}
                  className={`w-full py-3 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
                    isDark ? 'border-slate-600 hover:border-slate-500 text-slate-400' : 'border-slate-300 hover:border-slate-400 text-slate-500'
                  }`}
                >
                  <Plus size={20} />
                  {t('addSlot')}
                </button>
              </div>
            )}

            {/* Step 3: Preview & Confirm */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <h4 className={`font-semibold mb-3 ${headingClass}`}>Template Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={labelClass}>{t('templateName')}:</span>
                      <span className={`ml-2 font-medium ${headingClass}`}>{formData.name}</span>
                    </div>
                    <div>
                      <span className={labelClass}>{t('scheduleType')}:</span>
                      <span className={`ml-2 font-medium ${headingClass}`}>{formData.scheduleType}</span>
                    </div>
                    <div>
                      <span className={labelClass}>{t('department')}:</span>
                      <span className={`ml-2 font-medium ${headingClass}`}>
                        {formData.departmentId
                          ? departments.find((d: any) => d.id === formData.departmentId)?.name
                          : t('universityWide')}
                      </span>
                    </div>
                    <div>
                      <span className={labelClass}>{t('slotsCount')}:</span>
                      <span className={`ml-2 font-medium ${headingClass}`}>{slots.length}</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Preview */}
                <div>
                  <h4 className={`font-semibold mb-3 ${headingClass}`}>{t('weeklyPreview')}</h4>
                  {WeeklyPreview}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setWizardStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))}
                disabled={wizardStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  wizardStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                } ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <ChevronLeft size={16} />
                {t('previous')}
              </button>

              {wizardStep < 3 ? (
                <button
                  onClick={() => {
                    if (wizardStep === 1 && !formData.name) {
                      toast.error('Please enter a template name');
                      return;
                    }
                    setWizardStep((s) => (s < 3 ? ((s + 1) as WizardStep) : s));
                  }}
                  style={{ backgroundColor: accentColor }}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  {t('next')}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ backgroundColor: accentColor }}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('confirm')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className={`text-xl font-bold ${headingClass}`}>{t('confirmDelete')}</h3>
            </div>
            <p className={`mb-6 ${labelClass}`}>
              {t('deleteTemplateConfirm')}
              <br />
              <strong className={headingClass}>{selectedTemplate.name}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('deleteTemplate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Modal */}
      {activeModal === 'apply' && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${headingClass}`}>{t('applyTemplate')}</h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <p className={`text-sm ${labelClass}`}>Template: <strong className={headingClass}>{selectedTemplate.name}</strong></p>
                <p className={`text-sm ${labelClass}`}>Slots: {selectedTemplate.slots.length}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('selectSections')} *</label>
                <CleanSelect
                  value={String(applySectionId || '')}
                  onChange={(e) => setApplySectionId(e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full ${inputClass}`}
                >
                  <option value="">{t('selectSections')}</option>
                  {sections.map((s: any) => (
                    <option key={s.id || s.sectionId} value={String(s.id || s.sectionId)}>
                      {s.sectionNumber || s.id} - {s.course?.name || s.course?.code || 'Section'}
                    </option>
                  ))}
                </CleanSelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('building')} (override)</label>
                  <input
                    type="text"
                    value={applyBuilding}
                    onChange={(e) => setApplyBuilding(e.target.value)}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('room')} (override)</label>
                  <input
                    type="text"
                    value={applyRoom}
                    onChange={(e) => setApplyRoom(e.target.value)}
                    className={`w-full ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleApply}
                disabled={!applySectionId || applyMutation.isPending}
                style={{ backgroundColor: accentColor }}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('applyTemplate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Apply Modal */}
      {activeModal === 'bulk-apply' && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${headingClass}`}>{t('bulkApply')}</h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <p className={`text-sm ${labelClass}`}>Template: <strong className={headingClass}>{selectedTemplate.name}</strong></p>
                <p className={`text-sm ${labelClass}`}>Selected: {bulkSectionIds.length} sections</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>{t('selectSections')}</label>
                <div className={`max-h-48 overflow-y-auto rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  {sections.map((section: any) => {
                    const sectionId = section.id || section.sectionId;
                    return (
                      <label
                        key={sectionId}
                        className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 ${
                          isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={bulkSectionIds.includes(sectionId)}
                          onChange={() => toggleBulkSection(sectionId)}
                          className="rounded"
                        />
                        <span className={`text-sm ${headingClass}`}>
                          {section.sectionNumber || sectionId} - {section.course?.name || section.course?.code || 'Section'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('building')} (override)</label>
                  <input
                    type="text"
                    value={applyBuilding}
                    onChange={(e) => setApplyBuilding(e.target.value)}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('room')} (override)</label>
                  <input
                    type="text"
                    value={applyRoom}
                    onChange={(e) => setApplyRoom(e.target.value)}
                    className={`w-full ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleBulkApply}
                disabled={bulkSectionIds.length === 0 || bulkApplyMutation.isPending}
                style={{ backgroundColor: accentColor }}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkApplyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('bulkApply')} ({bulkSectionIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleTemplatesPage;
