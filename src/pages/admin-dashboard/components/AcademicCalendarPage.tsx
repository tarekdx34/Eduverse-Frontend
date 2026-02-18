import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, GraduationCap, BookOpen, PartyPopper, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  endDate: string | null;
  type: string;
  color: string;
}

interface AcademicCalendarPageProps {
  events: CalendarEvent[];
  onAddEvent: (event: any) => void;
  onEditEvent: (id: number, event: any) => void;
  onDeleteEvent: (id: number) => void;
}

export function AcademicCalendarPage({ events, onAddEvent, onEditEvent, onDeleteEvent }: AcademicCalendarPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedType, setSelectedType] = useState('all');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = event.date;
      const eventEndDate = event.endDate;
      if (eventEndDate) {
        return dateStr >= eventDate && dateStr <= eventEndDate;
      }
      return eventDate === dateStr;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'semesterStart':
      case 'semesterEnd':
        return <GraduationCap size={14} />;
      case 'registration':
        return <BookOpen size={14} />;
      case 'holiday':
        return <PartyPopper size={14} />;
      case 'examPeriod':
        return <AlertCircle size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'semesterStart': return t('semesterStart');
      case 'semesterEnd': return t('semesterEnd');
      case 'registration': return t('registration');
      case 'holiday': return t('holiday');
      case 'examPeriod': return t('examPeriod');
      default: return type;
    }
  };

  const filteredEvents = selectedType === 'all' ? events : events.filter(e => e.type === selectedType);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('academicCalendar')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageCalendarSub')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          {t('addEvent')}
        </button>
      </div>

      {/* Event Type Legend & Controls */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('eventTypes')}:</span>
            {[
              { type: 'semesterStart', color: '#10b981', label: t('semesterStart') },
              { type: 'semesterEnd', color: '#6366f1', label: t('semesterEnd') },
              { type: 'registration', color: '#3b82f6', label: t('registration') },
              { type: 'holiday', color: '#ef4444', label: t('holiday') },
              { type: 'examPeriod', color: '#f59e0b', label: t('examPeriod') },
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'month' ? 'bg-red-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('monthView')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'list' ? 'bg-red-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('listView')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Calendar View */
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Month Navigation */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => navigateMonth(-1)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronRight size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className={`grid grid-cols-7 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {daysOfWeek.map(day => (
              <div key={day} className={`p-3 text-center text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className={`min-h-[100px] p-2 border-b border-r ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`} />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 border-b border-r ${isDark ? 'border-gray-700' : 'border-gray-100'} ${isToday ? (isDark ? 'bg-red-900/20' : 'bg-red-50') : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-red-600' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color + '30', color: event.color }}
                        onClick={() => setEditingEvent(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Filters */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
            >
              <option value="all">{t('allEventTypes')}</option>
              <option value="semesterStart">{t('semesterStart')}</option>
              <option value="semesterEnd">{t('semesterEnd')}</option>
              <option value="registration">{t('registration')}</option>
              <option value="holiday">{t('holiday')}</option>
              <option value="examPeriod">{t('examPeriod')}</option>
            </select>
          </div>

          {/* Events List */}
          <div className="divide-y divide-gray-200">
            {filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
              <div key={event.id} className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h3>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {getEventTypeLabel(event.type)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className={`p-2 rounded-lg hover:bg-red-50 ${isDark ? 'hover:bg-red-900/20' : ''}`}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingEvent ? t('editEvent') : t('addEvent')}
            </h2>
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('eventTitle')}</label>
                <input type="text" defaultValue={editingEvent?.title} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('startDate')}</label>
                  <input type="date" defaultValue={editingEvent?.date} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('endDateOptional')}</label>
                  <input type="date" defaultValue={editingEvent?.endDate || ''} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('eventType')}</label>
                <select defaultValue={editingEvent?.type} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="semesterStart">{t('semesterStart')}</option>
                  <option value="semesterEnd">{t('semesterEnd')}</option>
                  <option value="registration">{t('registrationPeriod')}</option>
                  <option value="holiday">{t('holiday')}</option>
                  <option value="examPeriod">{t('examPeriod')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingEvent(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingEvent ? t('save') : t('addEvent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicCalendarPage;
