import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export type AttendanceSession = {
  id: number;
  date: string;
  present: number;
  absent: number;
};

type AttendanceTableProps = {
  sessions: AttendanceSession[];
  onCreate: () => void;
  onEdit: (session: AttendanceSession) => void;
  onDelete: (id: number) => void;
  onSwitchToAI?: () => void;
};

export function AttendanceTable({ sessions, onCreate, onEdit, onDelete, onSwitchToAI }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const filteredSessions = sessions.filter((session) => session.date.includes(searchTerm));

  return (
    <div className={`rounded-lg border p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('attendanceRecords')}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            {t('addRecord')}
          </button>
          {onSwitchToAI && (
            <button
              onClick={onSwitchToAI}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Sparkles size={18} />
              AI Attendance
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          size={18}
        />
        <input
          type="text"
          placeholder={t('searchByDate')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-100 text-gray-700'}>
              <th className="p-2 text-left">{t('date')}</th>
              <th className="p-2 text-left">{t('present')}</th>
              <th className="p-2 text-left">{t('absent')}</th>
              <th className="p-2 text-left">{t('total')}</th>
              <th className="p-2 text-left">{t('attendancePercent')}</th>
              <th className="p-2 text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((s) => {
              const total = s.present + s.absent;
              const percentage = total > 0 ? ((s.present / total) * 100).toFixed(1) : '0.0';
              return (
                <tr key={s.id} className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <td className={`p-2 font-medium ${isDark ? 'text-slate-200' : ''}`}>{s.date}</td>
                  <td className={`p-2 font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>{s.present}</td>
                  <td className={`p-2 font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>{s.absent}</td>
                  <td className={`p-2 ${isDark ? 'text-slate-300' : ''}`}>{total}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${parseFloat(percentage) >= 80 ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : (isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700')}`}
                    >
                      {percentage}%
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(s)}
                        className={`p-1 text-indigo-600 rounded transition-colors ${isDark ? 'hover:bg-indigo-500/20' : 'hover:bg-indigo-50'}`}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className={`p-1 text-red-600 rounded transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSessions.length === 0 && (
              <tr>
                <td className={`p-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`} colSpan={6}>
                  {searchTerm
                    ? t('noAttendanceMatch')
                    : t('noAttendanceRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable;
