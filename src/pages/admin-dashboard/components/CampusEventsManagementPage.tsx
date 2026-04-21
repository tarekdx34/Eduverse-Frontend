import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Eye,
  X,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';
import { ScheduleService, CampusEvent, CampusEventQuery } from '../../../services/api/scheduleService';
import { adminService } from '../../../services/adminService';

interface CampusEventsManagementPageProps {
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

const EVENT_TYPES = [
  { value: 'university_wide', label: 'University Wide' },
  { value: 'department', label: 'Department' },
  { value: 'campus', label: 'Campus' },
  { value: 'program', label: 'Program' },
];

const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const DEFAULT_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

type ModalType = 'create' | 'edit' | 'delete' | 'registrations' | null;

export function CampusEventsManagementPage({ isMockMode: propMockMode = false }: CampusEventsManagementPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  // Mock data for when API is unavailable
  const MOCK_DEPARTMENTS: DepartmentOption[] = [];

  const MOCK_EVENTS: CampusEvent[] = [];

  // Determine mock mode - if no auth or prop indicates mock
  const isMockMode = propMockMode;

  // State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [expandedRegistrations, setExpandedRegistrations] = useState<number | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'university_wide' as 'university_wide' | 'department' | 'campus' | 'program',
    scopeId: undefined as number | undefined,
    startDatetime: '',
    endDatetime: '',
    location: '',
    building: '',
    room: '',
    isMandatory: false,
    registrationRequired: false,
    maxAttendees: undefined as number | undefined,
    color: '#10B981',
    status: 'draft' as 'draft' | 'published' | 'cancelled' | 'completed',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch departments with fallback to mock data
  const { data: departmentsData, isError: deptError } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => adminService.getDepartments(),
    retry: 1,
  });
  const liveDepartments = normalizeDepartments(departmentsData);
  const isDepartmentsFallback = deptError || liveDepartments.length === 0;
  const departments = isDepartmentsFallback ? MOCK_DEPARTMENTS : liveDepartments;

  // Build query params
  const queryParams: CampusEventQuery = {
    page,
    limit,
    search: searchTerm || undefined,
    eventType: typeFilter !== 'all' ? (typeFilter as CampusEventQuery['eventType']) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as CampusEventQuery['status']) : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    scopeId: departmentFilter !== 'all' ? departmentFilter : undefined,
  };

  // Fetch events with fallback to mock data
  const { data: eventsData, isLoading, isError: eventsError, refetch } = useQuery({
    queryKey: ['campus-events', queryParams],
    queryFn: () => ScheduleService.getCampusEvents(queryParams),
    retry: 1,
  });

  // Filter mock data locally if API fails
  const getFilteredMockEvents = () => {
    let filtered = [...MOCK_EVENTS];
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.eventType === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    return filtered;
  };

  const events = eventsError || !eventsData?.data ? getFilteredMockEvents() : eventsData.data;
  const totalPages = eventsError || !eventsData?.meta ? 1 : eventsData.meta.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof ScheduleService.createCampusEvent>[0]) =>
      ScheduleService.createCampusEvent(data),
    onSuccess: () => {
      toast.success(t('eventCreated'));
      queryClient.invalidateQueries({ queryKey: ['campus-events'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to create event');
      console.error('[CampusEventsManagement:create] API error', error);
      toast.error(details);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof ScheduleService.updateCampusEvent>[1] }) =>
      ScheduleService.updateCampusEvent(id, data),
    onSuccess: () => {
      toast.success(t('eventUpdated'));
      queryClient.invalidateQueries({ queryKey: ['campus-events'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to update event');
      console.error('[CampusEventsManagement:update] API error', error);
      toast.error(details);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ScheduleService.deleteCampusEvent(id),
    onSuccess: () => {
      toast.success(t('eventDeleted'));
      queryClient.invalidateQueries({ queryKey: ['campus-events'] });
      closeModal();
    },
    onError: (error: any) => {
      const details = extractApiErrorMessage(error, 'Failed to delete event');
      console.error('[CampusEventsManagement:delete] API error', error);
      toast.error(details);
    },
  });

  // Registrations query
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ['event-registrations', expandedRegistrations],
    queryFn: () => ScheduleService.getCampusEventRegistrations(expandedRegistrations!),
    enabled: !!expandedRegistrations && !isMockMode,
  });

  // Helpers
  const openModal = (type: ModalType, event?: CampusEvent) => {
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType as any,
        scopeId: event.scopeId || undefined,
        startDatetime: event.startDatetime.slice(0, 16),
        endDatetime: event.endDatetime.slice(0, 16),
        location: event.location || '',
        building: event.building || '',
        room: event.room || '',
        isMandatory: event.isMandatory,
        registrationRequired: event.registrationRequired,
        maxAttendees: event.maxAttendees || undefined,
        color: event.color,
        status: event.status as any,
        tags: event.tags || [],
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        eventType: 'university_wide',
        scopeId: undefined,
        startDatetime: '',
        endDatetime: '',
        location: '',
        building: '',
        room: '',
        isMandatory: false,
        registrationRequired: false,
        maxAttendees: undefined,
        color: '#10B981',
        status: 'draft',
        tags: [],
      });
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      startDatetime: new Date(formData.startDatetime).toISOString(),
      endDatetime: new Date(formData.endDatetime).toISOString(),
      maxAttendees: formData.maxAttendees || undefined,
      scopeId: formData.eventType !== 'university_wide' ? formData.scopeId : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    if (activeModal === 'edit' && selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.eventId, data: payload });
    } else if (activeModal === 'create') {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.eventId);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  // Status badge styles
  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      draft: {
        bg: isDark ? 'bg-slate-700/50' : 'bg-slate-100',
        text: isDark ? 'text-slate-400' : 'text-slate-600',
        border: isDark ? 'border-slate-600' : 'border-slate-200',
      },
      published: {
        bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
        text: isDark ? 'text-emerald-400' : 'text-emerald-700',
        border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      },
      cancelled: {
        bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
        text: isDark ? 'text-red-400' : 'text-red-700',
        border: isDark ? 'border-red-500/20' : 'border-red-200',
      },
      completed: {
        bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
        text: isDark ? 'text-blue-400' : 'text-blue-700',
        border: isDark ? 'border-blue-500/20' : 'border-blue-200',
      },
    };
    return styles[status] || styles.draft;
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString();
  };

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
          <h2 className={`text-xl font-bold ${headingClass}`}>{t('campusEvents')}</h2>
          <p className={`text-sm mt-1 ${labelClass}`}>{t('campusEventsDescription')}</p>
        </div>
        <button
          onClick={() => openModal('create')}
          style={{ backgroundColor: accentColor }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
        >
          <Plus size={16} />
          {t('createEvent')}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${cardClass}`}>
        {isDepartmentsFallback && (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
            {t('warning') || 'Warning'}: using fallback department mock data because live departments API failed.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            {EVENT_TYPES.map((et) => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </CleanSelect>

          {/* Status Filter */}
          <CleanSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('allStatuses')}</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
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

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`flex-1 ${inputClass}`}
              placeholder={t('fromDate')}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`flex-1 ${inputClass}`}
              placeholder={t('toDate')}
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={labelClass}>No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('eventTitle')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('eventTypeLabel')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('startDateTime')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('location')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('eventStatus')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('attendees')}</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {events.map((event) => {
                  const statusStyle = getStatusStyle(event.status);
                  return (
                    <React.Fragment key={event.eventId}>
                      <tr className={isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <div>
                              <p className={`font-medium ${headingClass}`}>{event.title}</p>
                              {event.isMandatory && (
                                <span className="text-xs text-red-500 font-medium">{t('isMandatory')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm ${labelClass}`}>
                            {EVENT_TYPES.find((t) => t.value === event.eventType)?.label || event.eventType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className={labelClass} />
                            <span className={`text-sm ${labelClass}`}>{formatDateTime(event.startDatetime)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className={labelClass} />
                            <span className={`text-sm ${labelClass}`}>
                              {[event.building, event.room, event.location].filter(Boolean).join(', ') || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {event.status === 'published' && <CheckCircle2 size={12} />}
                            {event.status === 'cancelled' && <AlertCircle size={12} />}
                            {t(event.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className={labelClass} />
                            <span className={`text-sm ${labelClass}`}>
                              {event.registrationCount}
                              {event.maxAttendees && ` / ${event.maxAttendees}`}
                            </span>
                            {event.registrationRequired && event.registrationCount > 0 && (
                              <button
                                onClick={() => setExpandedRegistrations(expandedRegistrations === event.eventId ? null : event.eventId)}
                                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700`}
                              >
                                {expandedRegistrations === event.eventId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal('edit', event)}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                              title={t('editEvent')}
                            >
                              <Edit2 size={16} className={labelClass} />
                            </button>
                            <button
                              onClick={() => openModal('delete', event)}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                              title={t('deleteEvent')}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Registrations */}
                      {expandedRegistrations === event.eventId && (
                        <tr>
                          <td colSpan={7} className={`px-4 py-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                            {registrationsLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className={labelClass}>Loading registrations...</span>
                              </div>
                            ) : registrationsData ? (
                              <div>
                                <div className="flex items-center gap-4 mb-3">
                                  <span className={`text-sm font-medium ${headingClass}`}>{t('registrationSummary')}:</span>
                                  <span className={`text-sm ${labelClass}`}>{t('registered')}: {registrationsData.summary.registered}</span>
                                  <span className={`text-sm ${labelClass}`}>{t('attended')}: {registrationsData.summary.attended}</span>
                                  <span className={`text-sm ${labelClass}`}>{t('cancelled')}: {registrationsData.summary.cancelled}</span>
                                  <span className={`text-sm ${labelClass}`}>{t('noShow')}: {registrationsData.summary.noShow}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {registrationsData.registrations.slice(0, 8).map((reg) => (
                                    <div key={reg.registrationId} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                                      <p className={`text-sm font-medium ${headingClass}`}>{reg.user.firstName} {reg.user.lastName}</p>
                                      <p className={`text-xs ${labelClass}`}>{reg.user.email}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
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

      {/* Create/Edit Modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${headingClass}`}>
                {activeModal === 'create' ? t('createEvent') : t('editEvent')}
              </h3>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} className={labelClass} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('eventTitle')} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={255}
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('eventDescription')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full ${inputClass}`}
                />
              </div>

              {/* Event Type & Scope */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('eventTypeLabel')} *</label>
                  <CleanSelect
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any, scopeId: undefined })}
                    className={`w-full ${inputClass}`}
                  >
                    {EVENT_TYPES.map((et) => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </CleanSelect>
                </div>
                {formData.eventType !== 'university_wide' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('selectScope')} *</label>
                    <CleanSelect
                      value={String(formData.scopeId || '')}
                      onChange={(e) => setFormData({ ...formData, scopeId: Number(e.target.value) })}
                      className={`w-full ${inputClass}`}
                    >
                      <option value="">{t('selectScope')}</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={String(d.id)}>{d.name}</option>
                      ))}
                    </CleanSelect>
                  </div>
                )}
              </div>

              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('startDateTime')} *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDatetime}
                    onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
                    required
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('endDateTime')} *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDatetime}
                    onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                    required
                    className={`w-full ${inputClass}`}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('building')}</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('room')}</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full ${inputClass}`}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                    className="rounded"
                  />
                  <span className={`text-sm ${labelClass}`}>{t('isMandatory')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.registrationRequired}
                    onChange={(e) => setFormData({ ...formData, registrationRequired: e.target.checked })}
                    className="rounded"
                  />
                  <span className={`text-sm ${labelClass}`}>{t('registrationRequired')}</span>
                </label>
              </div>

              {/* Max Attendees */}
              {formData.registrationRequired && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('maxAttendees')}</label>
                  <input
                    type="number"
                    value={formData.maxAttendees || ''}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value ? Number(e.target.value) : undefined })}
                    min={1}
                    placeholder={t('unlimited')}
                    className={`w-full ${inputClass}`}
                  />
                </div>
              )}

              {/* Color & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('eventColor')}</label>
                  <div className="flex items-center gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === color ? 'border-white ring-2 ring-offset-2' : 'border-transparent'}`}
                        style={{ backgroundColor: color, ringColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('eventStatus')}</label>
                  <CleanSelect
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`w-full ${inputClass}`}
                  >
                    {EVENT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </CleanSelect>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>{t('tags')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                    >
                      <Tag size={12} />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('addTag')}
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className={`px-3 py-2 rounded-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ backgroundColor: accentColor }}
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {activeModal === 'create' ? t('createEvent') : t('save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className={`text-xl font-bold ${headingClass}`}>{t('confirmDelete')}</h3>
            </div>
            <p className={`mb-6 ${labelClass}`}>
              {t('deleteEventConfirm')}
              <br />
              <strong className={headingClass}>{selectedEvent.title}</strong>
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
                {t('deleteEvent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampusEventsManagementPage;
