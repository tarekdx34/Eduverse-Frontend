import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Edit3,
  Clock,
  MapPin,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CleanSelect } from '../../../components/shared';
import { toInputDate } from '../../../lib/formatters';


// ── Types ──────────────────────────────────────────────────────────────────────
interface CalendarEvent {
  id: number;
  title: string;
  type: 'lecture' | 'lab' | 'officeHours' | 'meeting' | 'deadline' | 'grading' | 'exam';
  course?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  color: string;
  bgColor: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Calculus Lecture',
    type: 'lecture',
    course: 'Calculus I',
    date: '2025-05-12',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Room 201',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    id: 2,
    title: 'Physics Lecture',
    type: 'lecture',
    course: 'Physics II',
    date: '2025-05-13',
    startTime: '13:00',
    endTime: '14:00',
    location: 'Room 305',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    id: 3,
    title: 'Digital Logic Lab',
    type: 'lab',
    course: 'Digital Logic',
    date: '2025-05-14',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Lab 3',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  {
    id: 4,
    title: 'CS Quiz',
    type: 'exam',
    course: 'Computer Science',
    date: '2025-05-14',
    startTime: '11:30',
    endTime: '12:30',
    location: 'Hall A',
    color: '',
    bgColor: '',
  },
  {
    id: 5,
    title: 'Office Hours',
    type: 'officeHours',
    date: '2025-05-15',
    startTime: '12:00',
    endTime: '13:00',
    location: 'Office 110',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    id: 6,
    title: 'Department Meeting',
    type: 'meeting',
    date: '2025-05-15',
    startTime: '16:00',
    endTime: '17:00',
    location: 'Conference Room',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  {
    id: 7,
    title: 'Assignment Deadline',
    type: 'deadline',
    course: 'Calculus I',
    date: '2025-05-16',
    startTime: '23:00',
    endTime: '23:59',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  {
    id: 8,
    title: 'Grading Session',
    type: 'grading',
    course: 'Physics II',
    date: '2025-05-16',
    startTime: '13:00',
    endTime: '14:00',
    location: 'Office 110',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
  },
];

const EVENT_TYPES = [
  'lecture',
  'lab',
  'officeHours',
  'meeting',
  'deadline',
  'grading',
  'exam',
] as const;
const TYPE_COLORS: Record<string, { color: string; bgColor: string }> = {
  lecture: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  lab: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  officeHours: { color: 'text-green-700', bgColor: 'bg-green-100' },
  meeting: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  deadline: { color: 'text-red-700', bgColor: 'bg-red-100' },
  grading: { color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  exam: { color: '', bgColor: '' },
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8AM-8PM

// ── Helpers ────────────────────────────────────────────────────────────────────
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatHour(h: number): string {
  if (h === 0 || h === 12) return `12:00 ${h < 12 ? 'AM' : 'PM'}`;
  return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatTime24to12(t: string): string {
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ── Component ──────────────────────────────────────────────────────────────────
export function SchedulePage() {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  // State
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 14)); // May 14 2025
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form state
  const emptyForm = {
    title: '',
    type: 'lecture' as CalendarEvent['type'],
    course: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const today = new Date();

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (courseFilter !== 'all' && e.course !== courseFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      return true;
    });
  }, [events, courseFilter, typeFilter]);

  const courseOptions = useMemo(() => {
    const courses = Array.from(new Set(events.map((e) => e.course).filter(Boolean))) as string[];
    return [
      { value: 'all', label: t('allCourses') },
      ...courses.map((c) => ({ value: c, label: c })),
    ];
  }, [events, t]);

  // Navigation
  const navigatePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const navigateNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };
  const goToToday = () => setCurrentDate(new Date());

  // CRUD
  const openCreateModal = (date?: string, time?: string) => {
    setEditingEvent(null);
    setFormData({
      ...emptyForm,
      date: date || formatDateISO(currentDate),
      startTime: time || '09:00',
      endTime: time
        ? `${String(parseInt(time.split(':')[0], 10) + 1).padStart(2, '0')}:00`
        : '10:00',
    });
    setShowEventModal(true);
  };
  const openEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      type: ev.type,
      course: ev.course || '',
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location || '',
    });
    setShowEventDetails(null);
    setShowEventModal(true);
  };
  const saveEvent = () => {
    const colors = TYPE_COLORS[formData.type] || TYPE_COLORS.lecture;
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...formData, ...colors } : e))
      );
    } else {
      const newId = Math.max(0, ...events.map((e) => e.id)) + 1;
      setEvents((prev) => [...prev, { id: newId, ...formData, ...colors }]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };
  const deleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setShowEventDetails(null);
    setShowEventModal(false);
  };

  // Header label
  const headerLabel = useMemo(() => {
    if (viewMode === 'month')
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'day')
      return `${DAY_NAMES_FULL[currentDate.getDay()]}, ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    const ws = startOfWeek(currentDate);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()} - ${MONTH_NAMES[we.getMonth()]} ${we.getDate()}, ${we.getFullYear()}`;
  }, [currentDate, viewMode]);

  // Dark mode helpers
  const pageBg = isDark ? 'bg-transparent' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200';
  const headerText = isDark ? 'text-white' : 'text-gray-900';
  const subtitleText = isDark ? 'text-gray-400' : 'text-gray-600';
  const slotBorder = isDark ? 'border-white/5' : 'border-gray-100';
  const toggleBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const toggleInactive = isDark
    ? 'text-gray-300 hover:bg-gray-600'
    : 'text-gray-600 hover:bg-white';
  const dayHeaderText = isDark ? 'text-gray-300' : 'text-gray-700';
  const timeText = isDark ? 'text-gray-500' : 'text-gray-500';
  const modalBg = isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200';
  const inputBg = isDark
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const getEventStyle = (event: CalendarEvent): React.CSSProperties | undefined => {
    if (event.type !== 'exam') return undefined;
    return {
      backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
      color: primaryHex,
    };
  };

  const getEventClasses = (event: CalendarEvent) =>
    event.type === 'exam' ? '' : `${event.bgColor} ${event.color}`;

  // ── Month View ─────────────────────────────────────────────────────────────
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: Date[][] = [];
    const cursor = new Date(startDate);
    while (cursor <= lastDay || weeks.length < 5) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= 6) break;
    }

    return (
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className={`text-xs font-medium text-center py-1 ${dayHeaderText}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day, idx) => {
            const iso = formatDateISO(day);
            const dayEvents = filteredEvents.filter((e) => e.date === iso);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentDate(new Date(day));
                  setViewMode('day');
                }}
                className={`relative p-2 min-h-[70px] rounded-lg text-left transition-colors ${
                  isToday
                    ? 'text-white'
                    : isCurrentMonth
                      ? isDark
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                      : isDark
                        ? 'opacity-40'
                        : 'opacity-40'
                } ${slotBorder} border`}
                style={isToday ? { backgroundColor: primaryHex } : undefined}
              >
                <span
                  className={`text-sm font-medium ${isToday ? 'text-white' : isCurrentMonth ? headerText : timeText}`}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={`w-2 h-2 rounded-full ${ev.type === 'exam' ? '' : ev.bgColor}`}
                        style={ev.type === 'exam' ? { backgroundColor: primaryHex } : undefined}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-[10px] ${isToday ? 'text-white/80' : timeText}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Week View ──────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const ws = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      return d;
    });

    return (
      <div className="p-4 overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 mb-4 min-w-[700px]">
          <div className={`text-xs font-medium ${timeText}`}>Time</div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`text-xs font-medium ${isSameDay(day, today) ? 'font-bold' : dayHeaderText}`}
              style={isSameDay(day, today) ? { color: primaryHex } : undefined}
            >
              {DAY_NAMES[day.getDay()]} {MONTH_NAMES[day.getMonth()].slice(0, 3)} {day.getDate()}
            </div>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-2 mb-2 min-w-[700px]">
            <div className={`text-xs ${timeText} py-2`}>{formatHour(hour)}</div>
            {weekDays.map((day) => {
              const iso = formatDateISO(day);
              const hourStr = String(hour).padStart(2, '0');
              const slotEvents = filteredEvents.filter((e) => {
                if (e.date !== iso) return false;
                const eHour = parseInt(e.startTime.split(':')[0], 10);
                return eHour === hour;
              });
              return (
                <div
                  key={`${iso}-${hour}`}
                  className={`border ${slotBorder} rounded p-1 min-h-[60px] cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    if (slotEvents.length === 0) openCreateModal(iso, `${hourStr}:00`);
                  }}
                >
                  {slotEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`${getEventClasses(ev)} p-2 rounded text-xs cursor-pointer mb-1`}
                      style={getEventStyle(ev)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEventDetails(ev);
                      }}
                    >
                      <div className="font-medium truncate">{ev.title}</div>
                      <div>{formatTime24to12(ev.startTime)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // ── Day View ───────────────────────────────────────────────────────────────
  const renderDayView = () => {
    const iso = formatDateISO(currentDate);
    const dayEvents = filteredEvents.filter((e) => e.date === iso);

    return (
      <div className="p-4">
        {HOURS.map((hour) => {
          const hourStr = String(hour).padStart(2, '0');
          const slotEvents = dayEvents.filter((e) => {
            const eH = parseInt(e.startTime.split(':')[0], 10);
            return eH === hour;
          });
          return (
            <div
              key={hour}
              className={`flex border-b ${slotBorder} min-h-[70px] cursor-pointer ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
              onClick={() => {
                if (slotEvents.length === 0) openCreateModal(iso, `${hourStr}:00`);
              }}
            >
              <div
                className={`w-20 flex-shrink-0 text-xs ${timeText} py-3 ${isRTL ? 'text-left pl-3' : 'text-right pr-3'}`}
              >
                {formatHour(hour)}
              </div>
              <div className="flex-1 py-1 px-2 space-y-1">
                {slotEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`${getEventClasses(ev)} p-3 rounded-lg text-sm cursor-pointer`}
                    style={getEventStyle(ev)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEventDetails(ev);
                    }}
                  >
                    <div className="font-medium">{ev.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatTime24to12(ev.startTime)} -{' '}
                        {formatTime24to12(ev.endTime)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {ev.location}
                        </span>
                      )}
                    </div>
                    {ev.course && <div className="text-xs mt-1 opacity-80">{ev.course}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Event Details Popup ────────────────────────────────────────────────────
  const renderEventDetails = () => {
    if (!showEventDetails) return null;
    const ev = showEventDetails;
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={() => setShowEventDetails(null)}
      >
        <div
          className={`rounded-xl border shadow-xl p-6 w-full max-w-md ${modalBg}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${headerText}`}>{ev.title}</h3>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getEventClasses(ev)}`}
                style={getEventStyle(ev)}
              >
                {ev.type}
              </span>
            </div>
            <button
              onClick={() => setShowEventDetails(null)}
              className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={subtitleText} />
            </button>
          </div>
          <div className={`space-y-2 text-sm ${subtitleText}`}>
            {ev.course && (
              <div>
                <span className="font-medium">Course:</span> {ev.course}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={14} /> {formatTime24to12(ev.startTime)} - {formatTime24to12(ev.endTime)}
            </div>
            {ev.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {ev.location}
              </div>
            )}
            <div>
              <span className="font-medium">Date:</span> {ev.date}
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => openEditModal(ev)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
              style={{ backgroundColor: primaryHex }}
            >
              <Edit3 size={14} /> Edit
            </button>
            <button
              onClick={() => deleteEvent(ev.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Add/Edit Event Modal ───────────────────────────────────────────────────
  const renderEventModal = () => {
    if (!showEventModal) return null;
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }}
      >
        <div
          className={`rounded-xl border shadow-xl p-6 w-full max-w-lg ${modalBg}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${headerText}`}>
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </h3>
            <button
              onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
              }}
              className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={subtitleText} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${headerText}`}>Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${headerText}`}>Type</label>
                <CleanSelect
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, type: e.target.value as CalendarEvent['type'] }))
                  }
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${headerText}`}>
                  Course (optional)
                </label>
                <input
                  value={formData.course}
                  onChange={(e) => setFormData((p) => ({ ...p, course: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                  placeholder="Course name"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${headerText}`}>Date</label>
              <input
                type="date"
                value={toInputDate(formData.date)}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${headerText}`}>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${headerText}`}>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${headerText}`}>
                Location (optional)
              </label>
              <input
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`}
                placeholder="Room / Hall"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={saveEvent}
              disabled={!formData.title || !formData.date}
              className="flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryHex }}
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
            {editingEvent && (
              <button
                onClick={() => deleteEvent(editingEvent.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button
              onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
              }}
              className={`px-4 py-2 rounded-lg border text-sm ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Sidebar upcoming events (derived from state) ───────────────────────────
  const upcomingEvents = useMemo(() => {
    const todayISO = formatDateISO(today);
    return [...events]
      .filter((e) => e.date >= todayISO)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 4);
  }, [events, today]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${headerText}`}>{t('teachingSchedule')}</h2>
          <p className={`${subtitleText} text-sm mt-1`}>{t('scheduleDescription')}</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
          style={{ backgroundColor: primaryHex }}
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* View toggles and filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className={`flex items-center gap-1 ${toggleBg} rounded-xl p-1 w-full sm:w-fit`}>
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg transition-all ${viewMode === mode ? 'text-white shadow-sm' : toggleInactive}`}
                style={viewMode === mode ? { backgroundColor: primaryHex } : undefined}
              >
                {t(mode)}
              </button>
            ))}
          </div>
        </div>

        <CustomDropdown
          label={t('courseLabel')}
          value={courseFilter}
          options={courseOptions}
          onChange={setCourseFilter}
          stackLabel
          fullWidth
        />

        <CustomDropdown
          label={t('eventTypeLabel')}
          value={typeFilter}
          options={[
            { value: 'all', label: t('allEvents') },
            { value: 'lecture', label: t('lectures') },
            { value: 'lab', label: t('labs') },
            { value: 'exam', label: 'Exams' },
            { value: 'meeting', label: 'Meetings' },
            { value: 'officeHours', label: t('officeHours') },
            { value: 'deadline', label: 'Deadlines' },
            { value: 'grading', label: 'Grading' },
          ]}
          onChange={setTypeFilter}
          stackLabel
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className={`lg:col-span-3 rounded-xl border shadow-sm overflow-hidden ${cardBg}`}>
          <div
            className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={navigatePrev}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={20} className={subtitleText} />
              </button>
              <h3 className={`font-semibold ${headerText}`}>{headerLabel}</h3>
              <button
                onClick={navigateNext}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight size={20} className={subtitleText} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="text-sm font-medium"
              style={{ color: primaryHex }}
            >
              {t('today')}
            </button>
          </div>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className={`rounded-xl p-4 border shadow-sm ${cardBg}`}>
            <h3 className={`font-semibold ${headerText} mb-4`}>{t('upcomingTeachingEvents')}</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg ${getEventClasses(event)} cursor-pointer`}
                  style={getEventStyle(event)}
                  onClick={() => setShowEventDetails(event)}
                >
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs mt-1">{formatTime24to12(event.startTime)}</div>
                  <div className="text-xs">
                    {MONTH_NAMES[parseInt(event.date.split('-')[1], 10) - 1].slice(0, 3)}{' '}
                    {parseInt(event.date.split('-')[2], 10)}
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className={`text-sm ${subtitleText}`}>No upcoming events</p>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className={`rounded-xl p-4 border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: primaryHex + '20' }}>
                <Sparkles style={{ color: primaryHex }} size={20} />
              </div>
              <h3 className={`font-semibold ${headerText}`}>{t('evySchedulingAssistant')}</h3>
            </div>
            <p className={`text-sm ${subtitleText} mb-4`}>{t('scheduleAssistantDescription')}</p>
            <div className="space-y-2">
              <button
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('detectConflicts')}
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                style={{ backgroundColor: primaryHex }}
              >
                {t('optimizeSchedule')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={`rounded-xl p-4 border shadow-sm ${cardBg}`}>
            <h3 className={`font-semibold ${headerText} mb-4`}>{t('thisWeek')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('totalHours')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>18.5h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('lectures')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('labs')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('conflicts')}</span>
                <span className="text-sm font-semibold text-red-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderEventDetails()}
      {renderEventModal()}
    </div>
  );
}

export default SchedulePage;
