import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  Timer,
  AlertCircle,
  BookOpen,
  Pencil,
  X,
  Calendar,
  Layers,
  UserCheck,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect, Tooltip } from '../../../components/shared';
import CampusEventsManagementPage from './CampusEventsManagementPage';
import ScheduleTemplatesPage from './ScheduleTemplatesPage';
import OfficeHoursManagementPage from './OfficeHoursManagementPage';

type SubTabKey = 'periods' | 'events' | 'templates' | 'office-hours';

interface SubTab {
  key: SubTabKey;
  label: string;
  icon: React.ElementType;
}

interface EnrollmentPeriod {
  id: number;
  /** Same as semester row id when loaded from API */
  semesterId?: number;
  department: string;
  semester: string;
  semesterCode?: string;
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  semesterStart?: string;
  semesterEnd?: string;
  totalStudents: number;
  registeredStudents: number;
  /** Distinct courses with OPEN/FULL sections in this semester (dept-scoped when API filtered) */
  coursesAvailable?: number;
  status: 'active' | 'closed' | 'upcoming';
  description: string;
}

interface EnrollmentPeriodPageProps {
  /** When true, nested scheduling pages never substitute mock data on API failure. */
  useLiveApi?: boolean;
  isLoading?: boolean;
  enrollmentPeriods: EnrollmentPeriod[];
  courses: {
    id: number;
    code: string;
    name: string;
    department: string;
    semester?: string;
    offeringSemesterIds?: number[];
    enrolled: number;
    capacity: number;
    prerequisites: string[];
  }[];
  adminDepartment: string;
  onAddPeriod: (period: any) => void;
  onEditPeriod: (id: number, period: any) => void;
  onDeletePeriod: (id: number) => void;
}

export function EnrollmentPeriodPage({
  useLiveApi = false,
  isLoading = false,
  enrollmentPeriods,
  courses,
  adminDepartment,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
}: EnrollmentPeriodPageProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t, isRTL } = useLanguage();

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('periods');

  const SUB_TABS: SubTab[] = [
    { key: 'periods', label: t('enrollmentPeriods'), icon: CalendarDays },
    { key: 'events', label: t('campusEvents'), icon: Calendar },
    { key: 'templates', label: t('scheduleTemplates'), icon: Layers },
    { key: 'office-hours', label: t('officeHours') || 'Office Hours', icon: UserCheck },
  ];

  // Enrollment Periods state
  type ModalType = 'add-period' | 'edit-period' | 'delete-period';
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<EnrollmentPeriod | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    semester: 'Spring 2026',
    semesterCode: '',
    startDate: '',
    endDate: '',
    semesterStartDate: '',
    semesterEndDate: '',
    description: '',
  });

  const headingClass = `${isDark ? 'text-white' : 'text-slate-900'}`;
  const labelClass = `${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200`;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={`h-10 w-36 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className={`h-20 rounded-2xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={`h-24 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className={`h-48 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  const deptPeriods = enrollmentPeriods.filter(
    (p) => !p.department || p.department === adminDepartment,
  );
  const deptCourses =
    !adminDepartment || adminDepartment === 'Department'
      ? courses
      : courses.filter((c) => c.department === adminDepartment);

  const deptCoursesForPeriod = (period: EnrollmentPeriod) => {
    const sid = period.semesterId ?? period.id;
    return deptCourses.filter((c) => {
      if (c.offeringSemesterIds?.length && sid) {
        return c.offeringSemesterIds.includes(sid);
      }
      return !!(period.semester && c.semester === period.semester);
    });
  };

  const displayedCoursesAvailable = (period: EnrollmentPeriod) => {
    if (typeof period.coursesAvailable === 'number') {
      return period.coursesAvailable;
    }
    return deptCoursesForPeriod(period).length;
  };

  const filteredPeriods = deptPeriods.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );
  const activePeriods = deptPeriods.filter((p) => p.status === 'active').length;
  const totalRegistered = deptPeriods
    .filter((p) => p.status === 'active')
    .reduce((s, p) => s + p.registeredStudents, 0);
  const totalSeatCapacityActive = deptPeriods
    .filter((p) => p.status === 'active')
    .reduce((s, p) => s + (Number(p.totalStudents) || 0), 0);

  const statusConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ReactNode; gradient: string }
  > = {
    active: {
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      text: isDark ? 'text-emerald-400' : 'text-emerald-700',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      icon: (
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
      ),
      gradient: 'from-emerald-500 to-teal-500',
    },
    closed: {
      bg: isDark ? 'bg-slate-700/50' : 'bg-slate-100',
      text: isDark ? 'text-slate-400' : 'text-slate-600',
      border: isDark ? 'border-slate-600' : 'border-slate-200',
      icon: <CheckCircle2 size={12} />,
      gradient: 'from-slate-400 to-slate-500',
    },
    upcoming: {
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      text: isDark ? 'text-amber-500' : 'text-amber-700',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
      icon: <Timer size={12} />,
      gradient: 'from-amber-400 to-amber-500',
    },
  };

  const openModal = (type: ModalType, period?: EnrollmentPeriod) => {
    if (period) {
      setSelectedPeriod(period);
      setFormData({
        semester: period.semester,
        semesterCode: period.semesterCode || '',
        startDate: period.registrationStart || period.startDate,
        endDate: period.registrationEnd || period.endDate,
        semesterStartDate: period.semesterStart || '',
        semesterEndDate: period.semesterEnd || '',
        description: period.description,
      });
    } else {
      setSelectedPeriod(null);
      setFormData({
        semester: 'Spring 2026',
        semesterCode: '',
        startDate: '',
        endDate: '',
        semesterStartDate: '',
        semesterEndDate: '',
        description: '',
      });
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPeriod(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().split('T')[0];
    let status: 'active' | 'closed' | 'upcoming' = 'upcoming';
    if (formData.startDate <= now && formData.endDate >= now) status = 'active';
    else if (formData.endDate < now) status = 'closed';

    const payload = {
      ...formData,
      department: adminDepartment,
      status,
      registeredStudents: selectedPeriod?.registeredStudents || 0,
    };
    if (activeModal === 'edit-period' && selectedPeriod) {
      onEditPeriod(selectedPeriod.id, payload);
      closeModal();
    } else if (activeModal === 'add-period') {
      onAddPeriod(payload);
      closeModal();
    }
  };

  // Sub-tab rendering for Campus Events and Schedule Templates
  if (activeSubTab === 'events') {
    return (
      <div className="space-y-6">
        {/* Sub-tabs Navigation */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-md'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <CampusEventsManagementPage useLiveApi={useLiveApi} />
      </div>
    );
  }

  if (activeSubTab === 'templates') {
    return (
      <div className="space-y-6">
        {/* Sub-tabs Navigation */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-md'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <ScheduleTemplatesPage useLiveApi={useLiveApi} />
      </div>
    );
  }

  if (activeSubTab === 'office-hours') {
    return (
      <div className="space-y-6">
        {/* Sub-tabs Navigation */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-md'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <OfficeHoursManagementPage useLiveApi={useLiveApi} />
      </div>
    );
  }

  // Default: Enrollment Periods sub-tab
  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              style={isActive ? { backgroundColor: accentColor } : {}}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold leading-none m-0 ${headingClass}`}>
              {t('enrollmentPeriods') || 'Enrollment Periods'}
            </h1>
            <span
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}10`,
                color: accentColor,
                borderColor: `${accentColor}20`,
              }}
            >
              {adminDepartment}
            </span>
          </div>
          <p className={`text-sm mt-2.5 ${labelClass}`}>
            {t('manageEnrollmentSub') ||
              'Configure and manage course registration windows for students.'}
          </p>
        </div>
        <button
          onClick={() => openModal('add-period')}
          style={{ backgroundColor: accentColor }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all active:scale-95 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t('openEnrollmentPeriod') || 'Open Period'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: t('totalPeriods'),
            value: deptPeriods.length,
            icon: CalendarDays,
            color: 'text-blue-500',
          },
          {
            label: t('activePeriods'),
            value: activePeriods,
            icon: AlertCircle,
            color: 'text-green-500',
          },
          {
            label: t('students'),
            value:
              totalSeatCapacityActive > 0
                ? `${totalRegistered}/${totalSeatCapacityActive}`
                : String(totalRegistered),
            icon: Users,
            color: 'text-blue-500',
          },
          {
            label: t('totalCourses'),
            value: deptCourses.length,
            icon: BookOpen,
            color: 'text-amber-500',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="p-0">
        <div className="flex items-center gap-4">
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
            <option value="active">{t('activePeriod')}</option>
            <option value="upcoming">{t('upcomingPeriod')}</option>
            <option value="closed">{t('closedPeriod')}</option>
          </CleanSelect>
        </div>
      </div>

      {/* Period Cards */}
      <div className="space-y-4">
        {filteredPeriods.map((period) => {
          const regPercent =
            period.totalStudents > 0
              ? Math.min(
                  100,
                  Math.round((period.registeredStudents / period.totalStudents) * 100),
                )
              : 0;
          const cfg = statusConfig[period.status] || statusConfig.closed;
          return (
            <div
              key={period.id}
              className={`rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-[#1e293b]/80 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <div className={`h-1.5 bg-gradient-to-r rounded-t-2xl ${cfg.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.icon}
                        {t(
                          period.status === 'active'
                            ? 'activePeriod'
                            : period.status === 'upcoming'
                              ? 'upcomingPeriod'
                              : 'closedPeriod'
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                      >
                        {period.semester}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {period.semester} — Course Registration
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {period.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip text="Edit Period" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('edit-period', period)}
                        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                          isDark
                            ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                            : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Pencil size={18} />
                      </button>
                    </Tooltip>

                    <Tooltip text="Delete Period" accentColor={accentColor}>
                      <button
                        onClick={() => openModal('delete-period', period)}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays
                      size={14}
                      className={isDark ? 'text-gray-400' : 'text-gray-500'}
                    />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {period.startDate} → {period.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {period.totalStudents > 0
                        ? `${period.registeredStudents}/${period.totalStudents}`
                        : `${period.registeredStudents}`}{' '}
                      {t('students')} registered
                      {period.totalStudents === 0 && (
                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                          {' '}
                          (no section capacity yet)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {displayedCoursesAvailable(period)} courses available
                    </span>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Student Registration Progress
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {regPercent}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${regPercent >= 90 ? 'bg-green-500' : regPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${regPercent}%` }}
                    />
                  </div>
                </div>

                {/* Available courses during this period */}
                {period.status === 'active' && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4
                      className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Available Courses (prerequisites enforced)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {deptCoursesForPeriod(period).map((course) => (
                        <div
                          key={course.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                        >
                          <div>
                            <span
                              className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}
                            >
                              {course.code}
                            </span>
                            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {course.name}
                            </p>
                            {course.prerequisites?.length > 0 && (
                              <p
                                className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                              >
                                Prereq: {course.prerequisites.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {course.enrolled}/{course.capacity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredPeriods.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays
              size={48}
              className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
            />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('noEnrollmentPeriods')}</p>
          </div>
        )}
      </div>

      {/* Unified Modal Rendering */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border w-full max-w-lg rounded-2xl shadow-2xl relative`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between rounded-t-2xl`}
            >
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeModal === 'add-period' && t('openEnrollmentPeriod')}
                {activeModal === 'edit-period' && t('editEnrollmentPeriod')}
                {activeModal === 'delete-period' && 'Delete Period'}
              </h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Add/Edit Content */}
              {(activeModal === 'add-period' || activeModal === 'edit-period') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Open a registration window for all <strong>{adminDepartment}</strong> students
                    to select their courses for the semester. Prerequisites will be enforced
                    automatically.
                  </p>
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      {t('semester')}
                    </label>
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
                      <option value="Fall 2026">Fall 2026</option>
                    </CleanSelect>
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      Semester code (API)
                    </label>
                    <input
                      type="text"
                      value={formData.semesterCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semesterCode: e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, '')
                            .slice(0, 20),
                        })
                      }
                      placeholder="e.g. SPRING2026 — optional; derived from name if empty"
                      maxLength={20}
                      className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                      onFocus={(e) => (e.target.style.borderColor = accentColor)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                      }
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      2–20 uppercase letters or digits (server requirement). Leave blank to auto-build
                      from the semester name.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Registration start
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
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
                        Registration end
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Semester start (classes)
                      </label>
                      <input
                        type="date"
                        value={formData.semesterStartDate}
                        onChange={(e) =>
                          setFormData({ ...formData, semesterStartDate: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                        }
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      >
                        Semester end (classes)
                      </label>
                      <input
                        type="date"
                        value={formData.semesterEndDate}
                        onChange={(e) =>
                          setFormData({ ...formData, semesterEndDate: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        onFocus={(e) => (e.target.style.borderColor = accentColor)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')
                        }
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    If semester dates are empty, the server uses the day after registration ends as
                    semester start and adds 119 days for semester end (you can override here).
                  </p>
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      {t('eventDescription')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="e.g., Spring 2026 registration — students select courses"
                      className={`w-full px-4 py-2 rounded-xl border focus:ring-0 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      onFocus={(e) => (e.target.style.borderColor = accentColor)}
                      onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0')}
                    />
                  </div>
                  <div
                    className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}
                  >
                    <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      ℹ️ During this period, all {adminDepartment} students can register for
                      courses. Prerequisites are checked automatically — students can only enroll in
                      courses whose prerequisites they have completed.
                    </p>
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
                      {activeModal === 'edit-period' ? t('save') : t('openEnrollmentPeriod')}
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Period Content */}
              {activeModal === 'delete-period' && selectedPeriod && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-500">Irreversible Action</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Closing this period will stop all active registrations.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                  >
                    <p className={`text-sm mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Deleting Period
                    </p>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedPeriod.semester} ({selectedPeriod.startDate} -{' '}
                      {selectedPeriod.endDate})
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Keep Period
                    </button>
                    <button
                      onClick={() => {
                        onDeletePeriod(selectedPeriod.id);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
                    >
                      Delete Period
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

export default EnrollmentPeriodPage;
