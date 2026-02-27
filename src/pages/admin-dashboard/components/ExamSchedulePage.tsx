import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, FileText, Clock, MapPin, CalendarDays, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ExamSchedule {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  duration: number;
  department: string;
}

interface ExamSchedulePageProps {
  exams: ExamSchedule[];
  courses: { id: number; code: string; name: string; department: string }[];
  adminDepartment: string;
  onAddExam: (exam: any) => void;
  onEditExam: (id: number, exam: any) => void;
  onDeleteExam: (id: number) => void;
}

export function ExamSchedulePage({ exams, courses, adminDepartment, onAddExam, onEditExam, onDeleteExam }: ExamSchedulePageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);

  const [formData, setFormData] = useState({
    courseId: 0, examType: 'midterm' as const, date: '', startTime: '09:00', endTime: '11:00', room: '', duration: 120,
  });

  const deptExams = exams.filter(e => e.department === adminDepartment);
  const deptCourses = courses.filter(c => c.department === adminDepartment);

  const filteredExams = deptExams.filter(e => {
    const matchesSearch = e.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || e.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || e.examType === typeFilter;
    return matchesSearch && matchesType;
  });

  const upcomingCount = deptExams.filter(e => new Date(e.date) >= new Date()).length;

  const typeColors: Record<string, string> = {
    midterm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    final: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    quiz: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    practical: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const openAddModal = () => {
    setFormData({ courseId: deptCourses[0]?.id || 0, examType: 'midterm', date: '', startTime: '09:00', endTime: '11:00', room: '', duration: 120 });
    setShowAddModal(true);
  };

  const openEditModal = (exam: ExamSchedule) => {
    setFormData({ courseId: exam.courseId, examType: exam.examType, date: exam.date, startTime: exam.startTime, endTime: exam.endTime, room: exam.room, duration: exam.duration });
    setEditingExam(exam);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = deptCourses.find(c => c.id === formData.courseId);
    const payload = { ...formData, courseCode: course?.code || '', courseName: course?.name || '', department: adminDepartment };
    if (editingExam) {
      onEditExam(editingExam.id, payload);
      setEditingExam(null);
    } else {
      onAddExam(payload);
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('examSchedule')}</h1>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{adminDepartment}</span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('manageExamsSub')}</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={18} /> {t('addExam')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('totalExams'), value: deptExams.length, icon: FileText, color: 'text-blue-500' },
          { label: t('upcomingExams'), value: upcomingCount, icon: AlertCircle, color: 'text-amber-500' },
          { label: t('totalCourses'), value: deptCourses.length, icon: CalendarDays, color: 'text-green-500' },
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
              <input type="text" placeholder={t('searchExams')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} />
            </div>
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
            <option value="all">{t('allExamTypes')}</option>
            <option value="midterm">{t('midterm')}</option>
            <option value="final">{t('final')}</option>
            <option value="quiz">{t('quiz')}</option>
            <option value="practical">{t('practical')}</option>
          </select>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => (
          <div key={exam.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`h-2 ${exam.examType === 'final' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColors[exam.examType] || ''}`}>{t(exam.examType)}</span>
                  <h3 className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.courseCode} - {exam.courseName}</h3>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm"><CalendarDays size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{exam.date}</span></div>
                <div className="flex items-center gap-2 text-sm"><Clock size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{exam.startTime} - {exam.endTime} ({exam.duration} min)</span></div>
                <div className="flex items-center gap-2 text-sm"><MapPin size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{exam.room}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(exam)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Edit2 size={14} />{t('edit')}</button>
                <button onClick={() => onDeleteExam(exam.id)} className={`p-2 rounded-lg border text-red-500 hover:bg-red-50 ${isDark ? 'border-gray-600 hover:bg-red-900/20' : 'border-gray-200'}`}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {filteredExams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('noExams')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingExam) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingExam ? t('editExam') : t('addExam')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('course')}</label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required>
                  <option value={0}>{t('selectCourse')}</option>
                  {deptCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('examType')}</label>
                  <select value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                    <option value="midterm">{t('midterm')}</option>
                    <option value="final">{t('final')}</option>
                    <option value="quiz">{t('quiz')}</option>
                    <option value="practical">{t('practical')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('examDate')}</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('startTime')}</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('endTime')}</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('duration')}</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('room')}</label>
                <input type="text" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="e.g., Exam Hall 1" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingExam(null); }} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{editingExam ? t('save') : t('addExam')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamSchedulePage;
