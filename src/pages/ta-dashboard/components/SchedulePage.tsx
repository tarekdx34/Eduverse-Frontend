import React, { useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

type ScheduleEvent = {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  type: 'lab' | 'office-hours' | 'meeting' | 'grading-deadline';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
};

const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'ev1',
    title: 'Lab 2: Control Structures',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'lab',
    date: '2025-02-22',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Lab A-101',
    color: 'blue',
  },
  {
    id: 'ev2',
    title: 'Office Hours',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'office-hours',
    date: '2025-02-22',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Office B-204',
    color: 'green',
  },
  {
    id: 'ev3',
    title: 'Lab 1: Arrays and Linked Lists',
    course: 'Data Structures',
    courseCode: 'CS202',
    type: 'lab',
    date: '2025-02-23',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Lab B-205',
    color: 'purple',
  },
  {
    id: 'ev4',
    title: 'Grading Deadline - Lab 1',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'grading-deadline',
    date: '2025-02-24',
    startTime: '11:59 PM',
    endTime: '11:59 PM',
    location: 'Online',
    color: 'red',
  },
  {
    id: 'ev5',
    title: 'Meeting with Dr. Smith',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'meeting',
    date: '2025-02-24',
    startTime: '3:00 PM',
    endTime: '3:30 PM',
    location: 'Online - Zoom',
    color: 'orange',
  },
  {
    id: 'ev6',
    title: 'Lab 1: Sorting Algorithms',
    course: 'Advanced Algorithms',
    courseCode: 'CS303',
    type: 'lab',
    date: '2025-02-25',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    location: 'Lab C-301',
    color: 'indigo',
  },
  {
    id: 'ev7',
    title: 'Office Hours',
    course: 'Data Structures',
    courseCode: 'CS202',
    type: 'office-hours',
    date: '2025-02-25',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    location: 'Office B-204',
    color: 'green',
  },
];

const DAYS_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;

export function SchedulePage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('week');
  const [currentWeekStart] = useState('2025-02-22');
  const [selectedDay, setSelectedDay] = useState('2025-02-22');
  const [events, setEvents] = useState<ScheduleEvent[]>(MOCK_SCHEDULE);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    courseCode: 'CS101',
    type: 'lab' as ScheduleEvent['type'],
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const courseMap: Record<string, { name: string; color: string }> = {
    CS101: { name: 'Introduction to Programming', color: 'blue' },
    CS202: { name: 'Data Structures', color: 'purple' },
    CS303: { name: 'Advanced Algorithms', color: 'indigo' },
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setModalForm({ title: '', courseCode: 'CS101', type: 'lab', date: '', startTime: '', endTime: '', location: '' });
    setShowModal(true);
  };

  const openEditModal = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setModalForm({
      title: ev.title,
      courseCode: ev.courseCode,
      type: ev.type,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
    });
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!modalForm.title || !modalForm.date) return;
    const course = courseMap[modalForm.courseCode] || courseMap.CS101;
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? { ...ev, ...modalForm, course: course.name, color: course.color }
            : ev
        )
      );
    } else {
      const newEvent: ScheduleEvent = {
        id: 'ev-' + Date.now(),
        title: modalForm.title,
        course: course.name,
        courseCode: modalForm.courseCode,
        type: modalForm.type,
        date: modalForm.date,
        startTime: modalForm.startTime,
        endTime: modalForm.endTime,
        location: modalForm.location,
        color: course.color,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setShowModal(false);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    setEvents((prev) => prev.filter((ev) => ev.id !== editingEvent.id));
    setShowModal(false);
  };

  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    };
    return map[color] || map.blue;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      lab: { label: t('labSession'), className: 'bg-blue-100 text-blue-800' },
      'office-hours': { label: t('officeHours'), className: 'bg-green-100 text-green-800' },
      meeting: { label: t('meeting'), className: 'bg-orange-100 text-orange-800' },
      'grading-deadline': { label: t('deadline'), className: 'bg-red-100 text-red-800' },
    };
    const badge = badges[type] || badges.lab;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const groupedByDate = events.reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  // Month view helpers for February 2025
  const febDays = 28;
  const firstDayOfWeek = new Date('2025-02-01').getDay(); // 6 = Saturday
  const monthWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateDay = (offset: number) => {
    const d = new Date(selectedDay + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDay(d.toISOString().split('T')[0]);
  };

  // View selector button helper
  const viewBtn = (v: typeof view, label: string) => (
    <button
      onClick={() => setView(v)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        view === v
          ? 'bg-blue-600 text-white'
          : isDark
            ? 'text-slate-300 hover:bg-white/10'
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('schedule')}</h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('viewScheduleDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-1 flex gap-1`}>
            {viewBtn('month', 'Month')}
            {viewBtn('week', t('week'))}
            {viewBtn('day', 'Day')}
            {viewBtn('list', t('list'))}
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => view === 'day' ? navigateDay(-1) : undefined}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {view === 'month'
              ? 'February 2025'
              : view === 'day'
                ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : 'Feb 22 – Feb 27, 2025'}
          </h3>
          <button
            onClick={() => view === 'day' ? navigateDay(1) : undefined}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Schedule Views */}
      {view === 'month' ? (
        /* Month Grid View */
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className={`grid grid-cols-7 ${isDark ? 'divide-white/10' : 'divide-gray-200'} divide-x`}>
            {monthWeekdays.map((wd) => (
              <div key={wd} className={`p-2 text-center text-xs font-semibold ${isDark ? 'bg-white/5 text-slate-400 border-b border-white/10' : 'bg-gray-50 text-gray-500 border-b border-gray-200'}`}>
                {wd}
              </div>
            ))}
          </div>
          <div className={`grid grid-cols-7 ${isDark ? 'divide-white/10' : 'divide-gray-200'} divide-x`}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className={`min-h-[90px] ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'}`} />
            ))}
            {Array.from({ length: febDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2025-02-${String(day).padStart(2, '0')}`;
              const dayEvents = groupedByDate[dateStr] || [];
              const isSelected = dateStr === selectedDay;
              return (
                <div
                  key={day}
                  onClick={() => { setSelectedDay(dateStr); setView('day'); }}
                  className={`min-h-[90px] p-1.5 cursor-pointer transition-colors ${
                    isDark
                      ? `border-b border-white/10 hover:bg-white/10 ${isSelected ? 'bg-white/10' : ''}`
                      : `border-b border-gray-200 hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`
                  }`}
                >
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{day}</p>
                  <div className="flex flex-wrap gap-1">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className={`w-2 h-2 rounded-full bg-${ev.color}-500`} title={ev.title} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : view === 'day' ? (
        /* Day View */
        <div className="space-y-3">
          {(groupedByDate[selectedDay] || []).length === 0 ? (
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-8 text-center`}>
              <Calendar className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No events scheduled for this day.</p>
            </div>
          ) : (
            (groupedByDate[selectedDay] || []).map((event) => {
              const colors = getColorClasses(event.color);
              return (
                <div
                  key={event.id}
                  className={`${colors.bg} border ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${colors.text}`}>{event.title}</h4>
                        {getTypeBadge(event.type)}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{event.course} ({event.courseCode})</p>
                      <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openEditModal(event)}
                      className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayEvents]) => (
              <div key={date}>
                <h3 className={`text-sm font-semibold uppercase mb-3 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="space-y-2">
                  {dayEvents.map((event) => {
                    const colors = getColorClasses(event.color);
                    return (
                      <div
                        key={event.id}
                        className={`${colors.bg} border ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${colors.text}`}>{event.title}</h4>
                              {getTypeBadge(event.type)}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{event.course} ({event.courseCode})</p>
                            <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{event.startTime} - {event.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openEditModal(event)}
                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Week Grid View */
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className={`grid grid-cols-5 ${isDark ? 'divide-white/10' : 'divide-gray-200'} divide-x`}>
            {DAYS_KEYS.map((dayKey, idx) => {
              const date = new Date('2025-02-22');
              date.setDate(date.getDate() + idx);
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = groupedByDate[dateStr] || [];

              return (
                <div key={dayKey} className="min-h-[300px]">
                  <div className={`p-3 text-center ${isDark ? 'bg-white/5 border-b border-white/10' : 'bg-gray-50 border-b border-gray-200'}`}>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t(dayKey)}</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{date.getDate()}</p>
                  </div>
                  <div className="p-2 space-y-2">
                    {dayEvents.map((event) => {
                      const colors = getColorClasses(event.color);
                      return (
                        <div
                          key={event.id}
                          onClick={() => openEditModal(event)}
                          className={`${colors.bg} border ${colors.border} rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                          <p className={`text-xs font-semibold ${colors.text} truncate`}>{event.title}</p>
                          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{event.startTime}</p>
                          <div className="mt-1">{getTypeBadge(event.type)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('legend')}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('labSessions')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('officeHours')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('meetings')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('deadlines')}</span>
          </div>
        </div>
      </div>

      {/* Event CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`${isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200'} border rounded-xl shadow-xl w-full max-w-md p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Title</label>
                <input
                  type="text"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Course</label>
                <select
                  value={modalForm.courseCode}
                  onChange={(e) => setModalForm({ ...modalForm, courseCode: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="CS101">CS101 - Introduction to Programming</option>
                  <option value="CS202">CS202 - Data Structures</option>
                  <option value="CS303">CS303 - Advanced Algorithms</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Type</label>
                <select
                  value={modalForm.type}
                  onChange={(e) => setModalForm({ ...modalForm, type: e.target.value as ScheduleEvent['type'] })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="lab">Lab Session</option>
                  <option value="office-hours">Office Hours</option>
                  <option value="meeting">Meeting</option>
                  <option value="grading-deadline">Grading Deadline</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Date</label>
                <input
                  type="date"
                  value={modalForm.date}
                  onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Start Time</label>
                  <input
                    type="time"
                    value={modalForm.startTime}
                    onChange={(e) => setModalForm({ ...modalForm, startTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>End Time</label>
                  <input
                    type="time"
                    value={modalForm.endTime}
                    onChange={(e) => setModalForm({ ...modalForm, endTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  value={modalForm.location}
                  onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g. Lab A-101"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div>
                {editingEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;
