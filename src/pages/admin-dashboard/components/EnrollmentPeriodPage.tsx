import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CalendarDays, Users, Clock, CheckCircle2, Timer, AlertCircle, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EnrollmentPeriod {
  id: number;
  department: string;
  semester: string;
  startDate: string;
  endDate: string;
  totalStudents: number;
  registeredStudents: number;
  status: 'active' | 'closed' | 'upcoming';
  description: string;
}

interface EnrollmentPeriodPageProps {
  enrollmentPeriods: EnrollmentPeriod[];
  courses: { id: number; code: string; name: string; department: string; enrolled: number; capacity: number; prerequisites: string[] }[];
  adminDepartment: string;
  onAddPeriod: (period: any) => void;
  onEditPeriod: (id: number, period: any) => void;
  onDeletePeriod: (id: number) => void;
}

export function EnrollmentPeriodPage({ enrollmentPeriods, courses, adminDepartment, onAddPeriod, onEditPeriod, onDeletePeriod }: EnrollmentPeriodPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<EnrollmentPeriod | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    semester: 'Spring 2026', startDate: '', endDate: '', description: '',
  });

  const deptPeriods = enrollmentPeriods.filter(p => p.department === adminDepartment);
  const deptCourses = courses.filter(c => c.department === adminDepartment);

  const filteredPeriods = deptPeriods.filter(p => statusFilter === 'all' || p.status === statusFilter);
  const activePeriods = deptPeriods.filter(p => p.status === 'active').length;
  const totalRegistered = deptPeriods.filter(p => p.status === 'active').reduce((s, p) => s + p.registeredStudents, 0);

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; gradient: string }> = {
    active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />, gradient: 'from-green-500 to-emerald-500' },
    closed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: <CheckCircle2 size={12} />, gradient: 'from-gray-400 to-gray-500' },
    upcoming: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Timer size={12} />, gradient: 'from-blue-500 to-cyan-500' },
  };

  const openAddModal = () => {
    setFormData({ semester: 'Spring 2026', startDate: '', endDate: '', description: '' });
    setShowAddModal(true);
  };

  const openEditModal = (period: EnrollmentPeriod) => {
    setFormData({ semester: period.semester, startDate: period.startDate, endDate: period.endDate, description: period.description });
    setEditingPeriod(period);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().split('T')[0];
    let status: 'active' | 'closed' | 'upcoming' = 'upcoming';
    if (formData.startDate <= now && formData.endDate >= now) status = 'active';
    else if (formData.endDate < now) status = 'closed';

    const payload = {
      ...formData, department: adminDepartment, status,
      totalStudents: 150, registeredStudents: editingPeriod?.registeredStudents || 0,
    };
    if (editingPeriod) {
      onEditPeriod(editingPeriod.id, payload);
      setEditingPeriod(null);
    } else {
      onAddPeriod(payload);
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('enrollmentPeriods')}</h1>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{adminDepartment}</span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageEnrollmentSub')}</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={18} /> {t('openEnrollmentPeriod')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('totalPeriods'), value: deptPeriods.length, icon: CalendarDays, color: 'text-blue-500' },
          { label: t('activePeriods'), value: activePeriods, icon: AlertCircle, color: 'text-green-500' },
          { label: t('students'), value: `${totalRegistered}/150`, icon: Users, color: 'text-purple-500' },
          { label: t('totalCourses'), value: deptCourses.length, icon: BookOpen, color: 'text-amber-500' },
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

      {/* Filter */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
            <option value="all">{t('allStatus')}</option>
            <option value="active">{t('activePeriod')}</option>
            <option value="upcoming">{t('upcomingPeriod')}</option>
            <option value="closed">{t('closedPeriod')}</option>
          </select>
        </div>
      </div>

      {/* Period Cards */}
      <div className="space-y-4">
        {filteredPeriods.map(period => {
          const regPercent = period.totalStudents > 0 ? Math.round((period.registeredStudents / period.totalStudents) * 100) : 0;
          const cfg = statusConfig[period.status] || statusConfig.closed;
          return (
            <div key={period.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`h-2 bg-gradient-to-r ${cfg.gradient}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${cfg.color}`}>{cfg.icon} {t(period.status === 'active' ? 'activePeriod' : period.status === 'upcoming' ? 'upcomingPeriod' : 'closedPeriod')}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{period.semester}</span>
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {period.semester} — Course Registration
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{period.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(period)} className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Edit2 size={14} />{t('edit')}</button>
                    <button onClick={() => onDeletePeriod(period.id)} className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm"><CalendarDays size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{period.startDate} → {period.endDate}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{period.registeredStudents}/{period.totalStudents} {t('students')} registered</span></div>
                  <div className="flex items-center gap-2 text-sm"><BookOpen size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{deptCourses.length} courses available</span></div>
                </div>

                {/* Registration Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Student Registration Progress</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{regPercent}%</span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all ${regPercent >= 90 ? 'bg-green-500' : regPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${regPercent}%` }} />
                  </div>
                </div>

                {/* Available courses during this period */}
                {period.status === 'active' && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Available Courses (prerequisites enforced)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {deptCourses.map(course => (
                        <div key={course.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div>
                            <span className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{course.code}</span>
                            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{course.name}</p>
                            {course.prerequisites.length > 0 && (
                              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Prereq: {course.prerequisites.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.enrolled}/{course.capacity}</span>
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
            <CalendarDays size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('noEnrollmentPeriods')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingPeriod) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingPeriod ? t('editEnrollmentPeriod') : t('openEnrollmentPeriod')}</h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Open a registration window for all <strong>{adminDepartment}</strong> students to select their courses for the semester. Prerequisites will be enforced automatically.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('semester')}</label>
                <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                  <option value="Fall 2026">Fall 2026</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('startDate')}</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('endDate')}</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('eventDescription')}</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="e.g., Spring 2026 registration — students select courses" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  ℹ️ During this period, all {adminDepartment} students can register for courses. Prerequisites are checked automatically — students can only enroll in courses whose prerequisites they have completed.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingPeriod(null); }} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingPeriod ? t('save') : t('openEnrollmentPeriod')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnrollmentPeriodPage;
