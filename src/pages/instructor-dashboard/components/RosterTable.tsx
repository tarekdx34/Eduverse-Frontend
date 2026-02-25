import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowUpDown, Mail, StickyNote, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GradesTable, type GradeEntry } from './GradesTable';

export type RosterEntry = {
  id: number;
  name: string;
  email: string;
  status: string;
  grade?: string;
};

type RosterTableProps = {
  data: RosterEntry[];
  grades?: GradeEntry[];
  onEdit: (student: RosterEntry) => void;
  onDelete?: (id: number) => void;
};

export function RosterTable({ data, grades = [], onEdit, onDelete }: RosterTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [noteStudentId, setNoteStudentId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showDetailedGrades, setShowDetailedGrades] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleSort = (field: 'name' | 'email' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openNoteModal = (studentId: number) => {
    setNoteStudentId(studentId);
    setNoteText(notes[studentId] || '');
  };

  const saveNote = () => {
    if (noteStudentId !== null) {
      setNotes((prev) => ({ ...prev, [noteStudentId]: noteText }));
      setNoteStudentId(null);
      setNoteText('');
    }
  };

  const getStudentGrade = (studentName: string): string => {
    const match = grades.find((g) => g.student.toLowerCase() === studentName.toLowerCase());
    return match ? match.grade : '-';
  };

  const enrolledStudents = data.filter((s) => s.status.toLowerCase() === 'enrolled');

  const filteredAndSortedData = enrolledStudents
    .filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className={`rounded-lg border p-4 md:p-6 shadow-sm ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('enrolledStudents')}</h3>
      </div>

      <div className="mb-4 relative w-full">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          size={18}
        />
        <input
          type="text"
          placeholder={t('searchStudentsPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-100 text-gray-700'}>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  {t('studentName')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left hidden md:table-cell">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  {t('email')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left font-semibold">{t('grade')}</th>
              <th className="p-3 text-left font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((student) => (
              <tr key={student.id} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                <td className="p-3">
                  <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{student.name}</div>
                  {notes[student.id] && (
                    <div className={`text-xs mt-1 italic ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      📝 {notes[student.id]}
                    </div>
                  )}
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    <Mail size={14} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                    {student.email}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    {student.grade || getStudentGrade(student.name)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1 md:p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Student"
                    >
                      <Edit2 size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => openNoteModal(student.id)}
                      className={`p-1 md:p-1.5 rounded transition-colors ${
                        notes[student.id]
                          ? 'text-amber-600 hover:bg-amber-50'
                          : isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title="Add Note"
                    >
                      <StickyNote size={14} className="md:w-4 md:h-4" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(student.id)}
                        className="p-1 md:p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove Student"
                      >
                        <Trash2 size={14} className="md:w-4 md:h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`} colSpan={4}>
                  {searchTerm ? t('noStudentsMatch') : t('noStudentsEnrolled')}
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

      {/* Add Note Modal */}
      {noteStudentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-lg border p-5 w-full max-w-md mx-4 shadow-xl ${isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('addNote') || 'Add Note'}
              </h4>
              <button
                onClick={() => { setNoteStudentId(null); setNoteText(''); }}
                className={`p-1 rounded hover:bg-gray-100 ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a note about this student..."
              rows={4}
              className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                isDark ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setNoteStudentId(null); setNoteText(''); }}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Detailed Grades Section */}
      {grades.length > 0 && (
        <div className={`mt-6 border-t pt-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setShowDetailedGrades(!showDetailedGrades)}
            className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {showDetailedGrades ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {t('detailedGrades') || 'Detailed Grades'}
          </button>
          {showDetailedGrades && (
            <GradesTable
              data={grades}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default RosterTable;
