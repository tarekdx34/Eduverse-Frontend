import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowUpDown, UserCheck, UserX, Mail, Calendar, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { enrollmentService, EnrolledCourse } from '../../../services/api/enrollmentService';

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  status: string;
  priority?: number;
};

type WaitlistTableProps = {
  sectionId?: string;
  data?: WaitlistEntry[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export function WaitlistTable({ sectionId, data = [], onApprove, onReject }: WaitlistTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'requestedAt' | 'status'>('requestedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionId) {
      setWaitlistData(data);
      return;
    }

    const fetchWaitlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const enrollments = await enrollmentService.getSectionWaitlist(sectionId);
        const mapped = enrollments.map((enrollment: EnrolledCourse, index) => ({
          id: enrollment.id,
          name: `Student ${enrollment.userId}`,
          email: `ID: ${enrollment.userId}`,
          requestedAt: enrollment.enrollmentDate,
          status: enrollment.status,
          priority: index + 1,
        }));
        setWaitlistData(mapped);
      } catch (err) {
        console.error('Failed to fetch section waitlist', err);
        const message = err instanceof Error ? err.message : 'Failed to load waitlist';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, [sectionId, data]);

  const handleSort = (field: 'name' | 'requestedAt' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
      waitlistData
        .filter((student) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            student.name.toLowerCase().includes(searchLower) ||
            student.email.toLowerCase().includes(searchLower) ||
            student.status.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => {
          let comparison = 0;
          if (sortField === 'name') {
            comparison = a.name.localeCompare(b.name);
          } else if (sortField === 'requestedAt') {
            comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
          } else {
            comparison = a.status.localeCompare(b.status);
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        }),
    [waitlistData, searchTerm, sortField, sortDirection]
  );

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('waitlist')}
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {waitlistData.length} {t('waitingForEnrollment')}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Loading waitlist...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          size={18}
        />
        <input
          type="text"
          placeholder={t('searchWaitlistPlaceholder')}
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
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  {t('status') || 'Status'}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => handleSort('requestedAt')}
                  className="flex items-center gap-1 hover:text-indigo-600 font-semibold"
                >
                  {t('requestedDate')}
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="p-3 text-left font-semibold">{t('priority')}</th>
              <th className="p-3 text-left font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.slice(0, 100).map((student, index) => (
              <tr
                key={student.id || `${student.email}-${index}`}
                className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <td className="p-3">
                  <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    {student.name}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    <Mail size={14} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                    {student.email}
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
                    {student.status}
                  </span>
                </td>
                <td className="p-3">
                  <div
                    className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    <Calendar size={14} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                    {formatDate(student.requestedAt)}
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    #{student.priority || index + 1}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {onApprove && (
                      <button
                        onClick={() => onApprove(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors border border-green-200"
                        title="Approve & Enroll"
                      >
                        <UserCheck size={14} />
                        {t('approve')}
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => onReject(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors border border-red-200"
                        title="Reject Request"
                      >
                        <UserX size={14} />
                        {t('reject')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedData.length === 0 && (
              <tr>
                <td
                  className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                  colSpan={5}
                >
                  {searchTerm ? t('noStudentsMatch') : 'No students on waitlist'}
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
    </div>
  );
}

export default WaitlistTable;
