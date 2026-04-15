import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowUpDown, Calendar, Loader2, StickyNote, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { enrollmentService, EnrolledCourse } from '../../../services/api/enrollmentService';

export type RosterEntry = {
  id: string;
  userId: number;
  enrollmentDate: string;
  status: string;
  grade: string;
  finalScore: string;
};

type RosterTableProps = {
  sectionId?: string;
  data?: Array<{
    id: number;
    name?: string;
    email?: string;
    status: string;
    grades?: { total?: string };
  }>;
  grades?: unknown[];
  onEdit?: (student: {
    id: number;
    name: string;
    email: string;
    status: string;
    grade?: string;
  }) => void;
};

export function RosterTable({ sectionId, data = [] }: RosterTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'userId' | 'enrollmentDate' | 'status'>('userId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rows, setRows] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionId) {
      const fallbackRows = data.map((student) => ({
        id: String(student.id),
        userId: student.id,
        enrollmentDate: new Date().toISOString(),
        status: student.status,
        grade: student.grades?.total || 'N/A',
        finalScore: 'N/A',
      }));
      setRows(fallbackRows);
      return;
    }

    const fetchRoster = async () => {
      try {
        setLoading(true);
        setError(null);
        const enrollments = await enrollmentService.getSectionStudents(sectionId);
        const mapped = enrollments.map((enrollment: EnrolledCourse) => ({
          id: enrollment.id,
          userId: enrollment.userId,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          grade: enrollment.grade || 'N/A',
          finalScore:
            enrollment.finalScore === null || enrollment.finalScore === undefined
              ? 'N/A'
              : String(enrollment.finalScore),
        }));
        setRows(mapped);
      } catch (err) {
        console.error('Failed to fetch section students', err);
        const message = err instanceof Error ? err.message : 'Failed to load section students';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [sectionId, data]);

  const handleSort = (field: 'userId' | 'enrollmentDate' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openNoteModal = (studentId: string) => {
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

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

  const filteredAndSortedData = useMemo(
    () =>
      rows
        .filter((student) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            String(student.userId).toLowerCase().includes(searchLower) ||
            student.status.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => {
          let comparison = 0;
          if (sortField === 'userId') {
            comparison = a.userId - b.userId;
          } else if (sortField === 'enrollmentDate') {
            comparison =
              new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime();
          } else {
            comparison = a.status.localeCompare(b.status);
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        }),
    [rows, searchTerm, sortField, sortDirection]
  );

  return (
    <div
      className={`rounded-lg border p-4 md:p-6 shadow-sm ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {filteredAndSortedData.length} students enrolled
        </h3>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Loading roster...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            isDark
              ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={isDark ? 'bg-white/5 text-slate-200' : 'bg-gray-100 text-gray-900'}>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('userId')}
                  className={`flex items-center gap-1 font-semibold transition-colors ${isDark ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}
                >
                  Student ID
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('enrollmentDate')}
                  className={`flex items-center gap-1 font-semibold transition-colors ${isDark ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}
                >
                  Enrollment Date
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className={`flex items-center gap-1 font-semibold transition-colors ${isDark ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}
                >
                  Status
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className={`p-3 text-left font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Grade</th>
              <th className={`p-3 text-left font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Final Score</th>
              <th className={`p-3 text-right font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((student, index) => (
              <tr
                key={student.id || `${student.userId}-${index}`}
                className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <td className="p-3">
                  <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    {student.userId}
                  </div>
                  {notes[student.id] && (
                    <div
                      className={`text-xs mt-1 italic ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      Note: {notes[student.id]}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div
                    className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    <Calendar size={14} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                    {formatDate(student.enrollmentDate)}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDark
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {student.grade || 'N/A'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {student.finalScore || 'N/A'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openNoteModal(student.id)}
                    className={`p-1.5 rounded-lg transition-colors inline-block ${
                      notes[student.id]
                        ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        : isDark
                          ? 'text-slate-400 hover:bg-white/10'
                          : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={notes[student.id] ? 'Edit Note' : 'Add Note'}
                  >
                    <StickyNote size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td
                  className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                  colSpan={6}
                >
                  {searchTerm ? t('noStudentsMatch') : t('noStudentsEnrolled')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredAndSortedData.length > 100 && (
          <div
            className={`mt-4 text-sm text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
          >
            {t('showingFirst100')} {filteredAndSortedData.length} {t('results')}
          </div>
        )}
      </div>

      {noteStudentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className={`rounded-lg border p-5 w-full max-w-md mx-4 shadow-xl ${isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('addNote') || 'Add Note'}
              </h4>
              <button
                onClick={() => {
                  setNoteStudentId(null);
                  setNoteText('');
                }}
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
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setNoteStudentId(null);
                  setNoteText('');
                }}
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
    </div>
  );
}

export default RosterTable;
