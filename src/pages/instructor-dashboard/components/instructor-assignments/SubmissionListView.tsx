import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LateBadge } from '../shared';
import type { AssignmentSubmission } from '../../../../services/api/assignmentService';

type SortField = 'student' | 'date' | 'score' | 'status';
type SortOrder = 'asc' | 'desc';

interface SubmissionListViewProps {
  submissions: AssignmentSubmission[];
  maxScore: number;
  onGrade: (submission: AssignmentSubmission) => void;
  onViewSubmission: (submission: AssignmentSubmission) => void;
  loading?: boolean;
}

export function SubmissionListView({
  submissions,
  maxScore,
  onGrade,
  onViewSubmission,
  loading = false,
}: SubmissionListViewProps) {
  const { isDark } = useTheme();
  const { primaryHex = '#4f46e5' } = useTheme() as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'ungraded'>('all');
  const [filterLate, setFilterLate] = useState<'all' | 'late' | 'ontime'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter((sub) => {
      const studentName = `${sub.user?.firstName || ''} ${sub.user?.lastName || ''}`.toLowerCase();
      const email = sub.user?.email?.toLowerCase() || '';
      const matchesSearch =
        studentName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      const isGraded = sub.score !== undefined && sub.score !== null;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'graded' && isGraded) ||
        (filterStatus === 'ungraded' && !isGraded);

      const isLate = sub.isLate === 1 || sub.isLate === true;
      const matchesLate =
        filterLate === 'all' ||
        (filterLate === 'late' && isLate) ||
        (filterLate === 'ontime' && !isLate);

      return matchesSearch && matchesStatus && matchesLate;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'student':
          aVal = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
          bVal = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.submittedAt).getTime();
          bVal = new Date(b.submittedAt).getTime();
          break;
        case 'score':
          aVal = a.score !== undefined && a.score !== null ? Number(a.score) : -1;
          bVal = b.score !== undefined && b.score !== null ? Number(b.score) : -1;
          break;
        case 'status':
          aVal = a.score !== undefined && a.score !== null ? 1 : 0;
          bVal = b.score !== undefined && b.score !== null ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, searchTerm, filterStatus, filterLate, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div
                  className={`h-5 w-1/3 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                />
                <div
                  className={`h-4 w-1/4 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                />
              </div>
              <div
                className={`h-10 w-24 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark
              ? 'bg-white/5 border-white/10 text-slate-200'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Submissions</option>
          <option value="graded">Graded Only</option>
          <option value="ungraded">Ungraded Only</option>
        </select>

        {/* Late Filter */}
        <select
          value={filterLate}
          onChange={(e) => setFilterLate(e.target.value as typeof filterLate)}
          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark
              ? 'bg-white/5 border-white/10 text-slate-200'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Status</option>
          <option value="late">Late Only</option>
          <option value="ontime">On Time Only</option>
        </select>
      </div>

      {/* Table Header (Desktop) */}
      <div className="hidden md:block">
        <div
          className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <button
            onClick={() => handleSort('student')}
            className={`col-span-3 flex items-center gap-2 text-left text-xs font-medium uppercase tracking-wide ${
              isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Student
            <SortIcon field="student" />
          </button>
          <button
            onClick={() => handleSort('date')}
            className={`col-span-3 flex items-center gap-2 text-left text-xs font-medium uppercase tracking-wide ${
              isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Submitted
            <SortIcon field="date" />
          </button>
          <button
            onClick={() => handleSort('status')}
            className={`col-span-2 flex items-center gap-2 text-left text-xs font-medium uppercase tracking-wide ${
              isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Status
            <SortIcon field="status" />
          </button>
          <button
            onClick={() => handleSort('score')}
            className={`col-span-2 flex items-center gap-2 text-left text-xs font-medium uppercase tracking-wide ${
              isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Score
            <SortIcon field="score" />
          </button>
          <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-right">
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Actions</span>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredAndSortedSubmissions.map((submission) => {
          const isGraded = submission.score !== undefined && submission.score !== null;
          const score = isGraded ? Number(submission.score) : null;

          return (
            <div
              key={submission.id}
              className={`border rounded-lg p-4 hover:shadow-sm transition-all ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/8' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                {/* Student */}
                <div className="col-span-3">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {submission.user?.firstName} {submission.user?.lastName}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    {submission.user?.email}
                  </p>
                </div>

                {/* Submitted Date */}
                <div className="col-span-3">
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {new Date(submission.submittedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {submission.attemptNumber && (
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      Attempt #{submission.attemptNumber}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <LateBadge isLate={submission.isLate} />
                    {isGraded ? (
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        Graded
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2">
                  {isGraded ? (
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {score} / {maxScore}
                    </p>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      Not graded
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewSubmission(submission)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="View submission"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onGrade(submission)}
                    className="px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryHex }}
                  >
                    {isGraded ? 'Edit Grade' : 'Grade'}
                  </button>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {submission.user?.firstName} {submission.user?.lastName}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      {submission.user?.email}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <LateBadge isLate={submission.isLate} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                  {isGraded ? (
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {score} / {maxScore}
                    </span>
                  ) : (
                    <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewSubmission(submission)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      isDark
                        ? 'border-white/10 text-slate-300 hover:bg-white/10'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onGrade(submission)}
                    className="flex-1 px-3 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryHex }}
                  >
                    {isGraded ? 'Edit Grade' : 'Grade'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAndSortedSubmissions.length === 0 && (
          <div
            className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          >
            {searchTerm || filterStatus !== 'all' || filterLate !== 'all'
              ? 'No submissions match your filters'
              : 'No submissions yet'}
          </div>
        )}
      </div>

      {/* Summary */}
      {submissions.length > 0 && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Showing {filteredAndSortedSubmissions.length} of {submissions.length} submissions
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              {submissions.filter((s) => s.score !== undefined && s.score !== null).length} graded
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionListView;
