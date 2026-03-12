import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Clock, CalendarDays, MapPin, AlertTriangle, BookOpen, Users as UsersIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';


interface Schedule {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  instructor: string;
  instructorId: number;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'section' | 'tutorial';
  department: string;
}

interface ScheduleManagementPageProps {
  schedules: Schedule[];
  courses: { id: number; code: string; name: string; department: string }[];
  users: { id: number; name: string; role: string; department: string }[];
  adminDepartment: string;
  onAddSchedule: (schedule: any) => void;
  onEditSchedule: (id: number, schedule: any) => void;
  onDeleteSchedule: (id: number) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];
const TIME_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

export function ScheduleManagementPage({ schedules, courses, users, adminDepartment, onAddSchedule, onEditSchedule, onDeleteSchedule }: ScheduleManagementPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [conflictError, setConflictError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    courseId: 0, instructor: '', instructorId: 0, day: 'Sunday',
    startTime: '09:00', endTime: '10:30', room: '', type: 'lecture' as const,
  });

  const deptSchedules = schedules.filter(s => s.department === adminDepartment);
  const deptCourses = courses.filter(c => c.department === adminDepartment);
  const deptStaff = users.filter(u => (u.role === 'instructor' || u.role === 'ta') && u.department === adminDepartment);

  const filteredSchedules = deptSchedules.filter(s => {
    const matchesSearch = s.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || s.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || s.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === 'all' || s.day === dayFilter;
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesDay && matchesType;
  });

  const checkConflict = (data: typeof formData, excludeId?: number) => {
    return deptSchedules.filter(s => excludeId ? s.id !== excludeId : true).find(s =>
      s.day === data.day &&
      ((data.startTime >= s.startTime && data.startTime < s.endTime) || (data.endTime > s.startTime && data.endTime <= s.endTime) || (data.startTime <= s.startTime && data.endTime >= s.endTime)) &&
      (s.instructorId === data.instructorId || s.room === data.room)
    );
  };

  const openAddModal = () => {
    setFormData({ courseId: deptCourses[0]?.id || 0, instructor: '', instructorId: 0, day: 'Sunday', startTime: '09:00', endTime: '10:30', room: '', type: 'lecture' });
    setConflictError('');
    setShowAddModal(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setFormData({ courseId: schedule.courseId, instructor: schedule.instructor, instructorId: schedule.instructorId, day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime, room: schedule.room, type: schedule.type });
    setConflictError('');
    setEditingSchedule(schedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflict(formData, editingSchedule?.id);
    if (conflict) {
      const reason = conflict.instructorId === formData.instructorId ? `Instructor "${conflict.instructor}" already has "${conflict.courseCode}" at that time` : `Room "${conflict.room}" is occupied by "${conflict.courseCode}" at that time`;
      setConflictError(reason);
      return;
    }
    const course = deptCourses.find(c => c.id === formData.courseId);
    const payload = { ...formData, courseCode: course?.code || '', courseName: course?.name || '', department: adminDepartment };
    if (editingSchedule) {
      onEditSchedule(editingSchedule.id, payload);
      setEditingSchedule(null);
    } else {
      onAddSchedule(payload);
      setShowAddModal(false);
    }
    setConflictError('');
  };

  const getStatusStyles = (type: string) => {
    switch (type) {
      case 'lecture': return { bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50', text: isDark ? 'text-indigo-400' : 'text-indigo-700', border: isDark ? 'border-indigo-500/20' : 'border-indigo-200' };
      case 'lab': return { bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', text: isDark ? 'text-emerald-400' : 'text-emerald-700', border: isDark ? 'border-emerald-500/20' : 'border-emerald-200' };
      case 'section': return { bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', text: isDark ? 'text-blue-400' : 'text-blue-700', border: isDark ? 'border-blue-500/20' : 'border-blue-200' };
      case 'tutorial': return { bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', text: isDark ? 'text-amber-500' : 'text-amber-700', border: isDark ? 'border-amber-500/20' : 'border-amber-200' };
      default: return { bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50', text: isDark ? 'text-slate-400' : 'text-slate-700', border: isDark ? 'border-slate-500/20' : 'border-slate-200' };
    }
  };

  const dayTranslations: Record<string, string> = { Sunday: t('sunday'), Monday: t('monday'), Tuesday: t('tuesday'), Wednesday: t('wednesday'), Thursday: t('thursday'), Saturday: t('saturday') };

  const uniqueRooms = [...new Set(deptSchedules.map(s => s.room))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('scheduleManagement')}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {adminDepartment}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageScheduleSub')}</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={18} /> {t('addSchedule')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('totalSessions'), value: deptSchedules.length, icon: CalendarDays, color: 'text-blue-500' },
          { label: t('totalRooms'), value: uniqueRooms.length, icon: MapPin, color: 'text-green-500' },
          { label: t('totalCourses'), value: deptCourses.length, icon: BookOpen, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}><stat.icon size={20} className={stat.color} /></div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
              <input type="text" placeholder={t('searchSchedules')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
            </div>
          </div>
          <CleanSelect value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
            <option value="all">{t('allDays')}</option>
            {DAYS.map(d => <option key={d} value={d}>{dayTranslations[d]}</option>)}
          </CleanSelect>
          <CleanSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
            <option value="all">{t('allTypes')}</option>
            <option value="lecture">{t('lecture')}</option>
            <option value="lab">{t('lab')}</option>
            <option value="section">{t('section')}</option>
            <option value="tutorial">{t('tutorial')}</option>
          </CleanSelect>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'list' ? 'bg-red-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('listView')}</button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'week' ? 'bg-red-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('weeklyView')}</button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map(schedule => (
            <div key={schedule.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {(() => {
                      const styles = getStatusStyles(schedule.type);
                      return (
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
                          {t(schedule.type)}
                        </span>
                      );
                    })()}
                    <h3 className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{schedule.courseCode} - {schedule.courseName}</h3>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm"><UsersIcon size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{schedule.instructor}</span></div>
                  <div className="flex items-center gap-2 text-sm"><CalendarDays size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{dayTranslations[schedule.day]}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{schedule.startTime} - {schedule.endTime}</span></div>
                  <div className="flex items-center gap-2 text-sm"><MapPin size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{schedule.room}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(schedule)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Edit2 size={14} />{t('edit')}</button>
                  <button onClick={() => onDeleteSchedule(schedule.id)} className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredSchedules.length === 0 && (
            <div className="col-span-full text-center py-12">
              <CalendarDays size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('noSchedules')}</p>
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className={`rounded-xl border overflow-x-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className={`p-3 text-left text-sm font-medium border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>{t('time')}</th>
                {DAYS.map(day => (
                  <th key={day} className={`p-3 text-center text-sm font-medium border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>{dayTranslations[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                <tr key={time}>
                  <td className={`p-2 text-sm border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>{time}</td>
                  {DAYS.map(day => {
                    const slot = deptSchedules.find(s => s.day === day && s.startTime === time);
                    return (
                      <td key={day} className={`p-1 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {slot && (
                          <div className={`p-2 rounded-lg text-xs ${typeColors[slot.type] || ''}`}>
                            <p className="font-semibold">{slot.courseCode}</p>
                            <p>{slot.room}</p>
                            <p>{slot.startTime}-{slot.endTime}</p>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingSchedule) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingSchedule ? t('editSchedule') : t('addSchedule')}</h2>
            {conflictError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} /> {conflictError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('course')}</label>
                <CleanSelect value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required>
                  <option value={0}>{t('selectCourse')}</option>
                  {deptCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('courseInstructor')}</label>
                <CleanSelect value={formData.instructorId} onChange={(e) => { const staff = deptStaff.find(s => s.id === Number(e.target.value)); setFormData({ ...formData, instructorId: Number(e.target.value), instructor: staff?.name || '' }); }} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required>
                  <option value={0}>{t('selectInstructor')}</option>
                  {deptStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({t(s.role)})</option>)}
                </CleanSelect>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('day')}</label>
                  <CleanSelect value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    {DAYS.map(d => <option key={d} value={d}>{dayTranslations[d]}</option>)}
                  </CleanSelect>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('scheduleType')}</label>
                  <CleanSelect value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="lecture">{t('lecture')}</option>
                    <option value="lab">{t('lab')}</option>
                    <option value="section">{t('section')}</option>
                    <option value="tutorial">{t('tutorial')}</option>
                  </CleanSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('startTime')}</label>
                  <CleanSelect value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    {TIME_SLOTS.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                  </CleanSelect>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('endTime')}</label>
                  <CleanSelect value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    {TIME_SLOTS.filter(ts => ts > formData.startTime).map(ts => <option key={ts} value={ts}>{ts}</option>)}
                  </CleanSelect>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('room')}</label>
                <input type="text" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="e.g., Hall A-101" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingSchedule(null); setConflictError(''); }} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingSchedule ? t('save') : t('addSchedule')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleManagementPage;
