import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export type GradeEntry = {
  id: number;
  student: string;
  email: string;
  assignment: string;
  score: number;
  grade: string;
};

type GradesTableProps = {
  data: GradeEntry[];
  onEdit: (grade: GradeEntry) => void;
  onDelete: (id: number) => void;
};

export function GradesTable({ data, onEdit, onDelete }: GradesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'student' | 'assignment' | 'score'>('student');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleSort = (field: 'student' | 'assignment' | 'score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = data
    .filter((grade) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (grade.student || '').toLowerCase().includes(searchLower) ||
        (grade.assignment || '').toLowerCase().includes(searchLower) ||
        (grade.email || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'student') {
        comparison = (a.student || '').localeCompare(b.student || '');
      } else if (sortField === 'assignment') {
        comparison = (a.assignment || '').localeCompare(b.assignment || '');
      } else if (sortField === 'score') {
        comparison = Number(a.score || 0) - Number(b.score || 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className={`rounded-lg border p-6 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('grades')}</h3>

      <div className="mb-4 relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          size={18}
        />
        <input
          type="text"
          placeholder={t('searchGradesPlaceholder')}
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
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('student')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  {t('student')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">{t('email')}</th>
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('assignment')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  {t('assignment')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-1 hover:text-indigo-600"
                >
                  {t('score')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-2 text-left">{t('grade')}</th>
              <th className="p-2 text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((g) => (
              <tr key={g.id} className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                <td className={`p-2 ${isDark ? 'text-slate-200' : ''}`}>{g.student}</td>
                <td className={`p-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{g.email}</td>
                <td className={`p-2 ${isDark ? 'text-slate-200' : ''}`}>{g.assignment}</td>
                <td className={`p-2 font-medium ${isDark ? 'text-slate-200' : ''}`}>{g.score}</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {g.grade}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(g)}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(g.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td className={`p-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`} colSpan={6}>
                  {searchTerm ? t('noGradesMatch') : t('noGradesRecorded')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredAndSortedData.length > 100 && (
          <div className={`mt-4 text-sm text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            {t('showingFirst100')} {filteredAndSortedData.length} {t('results')}
          </div>
        )}
      </div>
    </div>
  );
}

export default GradesTable;
