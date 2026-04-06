import { useState } from 'react';
import { Search, SlidersHorizontal, Check, Loader2, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAssignments } from './hooks/useAssignments';
import AssignmentCard from './AssignmentCard';
import type { FilterStatus, SortOption } from './types';

interface AssignmentListProps {
  courseId?: string;
  onSelectAssignment: (assignmentId: string) => void;
}

/**
 * AssignmentList - List view with filters, search, and statistics
 */
export function AssignmentList({ courseId, onSelectAssignment }: AssignmentListProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const { assignments, stats, loading, filters, updateFilters } = useAssignments(courseId);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: t('allAssignments') || 'All Assignments' },
    { value: 'pending', label: t('notSubmitted') || 'Not Submitted' },
    { value: 'submitted', label: t('submitted') || 'Submitted' },
    { value: 'graded', label: t('graded') || 'Graded' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--accent-color)] mx-auto mb-4 animate-spin" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            {t('loading') || 'Loading assignments...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('totalAssignments') || 'Total'}
          </p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {stats.total}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('pending') || 'Pending'}
          </p>
          <p className="text-3xl font-bold text-red-500">{stats.pending}</p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('submitted') || 'Submitted'}
          </p>
          <p className="text-3xl font-bold text-blue-500">{stats.submitted}</p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('averageScore') || 'Avg Score'}
          </p>
          <p className="text-3xl font-bold text-emerald-500">
            {stats.averageScore !== null ? `${Math.round(stats.averageScore)}%` : '-'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder={t('searchAssignments') || 'Search assignments...'}
              className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-[var(--accent-color)]'
                  : 'border-slate-200 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10'
              } focus:outline-none`}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm transition-all ${
                isDark
                  ? 'border-white/10 text-slate-400 hover:bg-white/5'
                  : 'border-slate-100 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('filter') || 'Filter'}</span>
            </button>

            {showFilterDropdown && (
              <div
                className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden ${
                  isDark ? 'bg-card-dark border border-white/10' : 'bg-white border border-slate-200'
                }`}
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilters({ status: option.value });
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      filters.status === option.value
                        ? isDark
                          ? 'bg-white/10 text-white'
                          : 'bg-blue-50 text-blue-700'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5'
                          : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {filters.status === option.value && <Check className="w-4 h-4" />}
                    <span className={filters.status !== option.value ? 'ml-7' : ''}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignment List */}
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {filters.status === 'all' ? t('noAssignments') || 'No Assignments' : `No ${filters.status} assignments`}
            </h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {filters.status === 'all'
                ? 'You have no assignments yet'
                : `You don't have any ${filters.status} assignments`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => onSelectAssignment(assignment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentList;
