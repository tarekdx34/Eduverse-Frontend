import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Lab, LabStatus } from './types';
import LabStatusBadge from './shared/LabStatusBadge';
import CustomDropdown from '../CustomDropdown';
import {
  Beaker,
  Plus,
  Search,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface LabListProps {
  labs: Lab[];
  loading: boolean;
  error: string | null;

  // Filters
  courses: { id: string; name: string; code: string }[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  selectedStatus: LabStatus | 'all';
  onStatusChange: (status: LabStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Actions
  onCreateClick: () => void;
  onEditClick: (lab: Lab) => void;
  onDeleteClick: (lab: Lab) => void;
  onViewSubmissions: (lab: Lab) => void;
  onViewDetails: (lab: Lab) => void;
  onStatusChangeClick: (lab: Lab) => void;
  onRefresh: () => void;
}

export function LabList({
  labs,
  loading,
  error,
  courses,
  selectedCourse,
  onCourseChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onViewSubmissions,
  onViewDetails,
  onStatusChangeClick,
  onRefresh,
}: LabListProps) {
  const { isDark, primaryHex } = useTheme();
  const { t, isRTL } = useLanguage();

  // Filter labs based on selected filters and search query
  const filteredLabs = useMemo(() => {
    let filtered = [...labs];

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter((lab) => lab.courseId === selectedCourse);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((lab) => lab.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lab) =>
          lab.title.toLowerCase().includes(query) ||
          (lab.description && lab.description.toLowerCase().includes(query)) ||
          (lab.course && lab.course.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [labs, selectedCourse, selectedStatus, searchQuery]);

  // Calculate statistics
  const stats = useMemo(
    () => ({
      total: labs.length,
      active: labs.filter((l) => l.status === 'published').length,
      draft: labs.filter((l) => l.status === 'draft').length,
    }),
    [labs]
  );

  // Render skeleton card for loading
  const SkeletonCard = () => (
    <div
      className={`rounded-xl p-6 border shadow-sm animate-pulse ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon skeleton */}
        <div
          className={`w-24 h-24 rounded-lg flex-shrink-0 ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}
        />
        {/* Content skeleton */}
        <div className="flex-1 space-y-4 w-full">
          <div
            className={`h-6 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          />
          <div
            className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          />
          <div
            className={`h-4 rounded w-1/3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          />
          <div className="flex gap-2 pt-2">
            <div
              className={`h-8 rounded w-24 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
            />
            <div
              className={`h-8 rounded w-24 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with create button */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('labsManagement') || 'Labs Management'}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('labsDescription') || 'Manage your lab sessions and submissions'}
            </p>
          </div>
          <button
            onClick={onCreateClick}
            aria-label={t('createNewLab') || 'Create New Lab'}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryHex }}
          >
            <Plus size={20} />
            {t('createNewLab') || 'Create New Lab'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              isDark
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <AlertCircle size={20} />
            <p>{error}</p>
            <button
              onClick={onRefresh}
              className="ml-auto px-3 py-1 rounded text-sm font-medium hover:opacity-80 transition-colors"
              style={{
                backgroundColor: isDark
                  ? `${primaryHex}20`
                  : `${primaryHex}15`,
                color: primaryHex,
              }}
            >
              {t('retry') || 'Retry'}
            </button>
          </div>
        )}

        {/* Filters section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CustomDropdown
            label={t('courseLabel') || 'Course'}
            value={selectedCourse}
            options={[
              { value: 'all', label: t('allCourses') || 'All Courses' },
              ...courses.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.code})`,
              })),
            ]}
            onChange={onCourseChange}
            stackLabel
            fullWidth
          />
          <CustomDropdown
            label={t('statusLabel') || 'Status'}
            value={selectedStatus}
            options={[
              { value: 'all', label: t('all') || 'All' },
              { value: 'published', label: t('published') || 'Published' },
              { value: 'draft', label: t('draft') || 'Draft' },
              { value: 'closed', label: t('closed') || 'Closed' },
            ]}
            onChange={(v) => onStatusChange(v as LabStatus | 'all')}
            stackLabel
            fullWidth
          />
          <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="lab-search"
              className={`text-sm font-medium whitespace-nowrap ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              {t('search') || 'Search'}
            </label>
            <div className="relative w-full">
              <Search
                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-gray-400'
                }`}
                size={18}
                aria-hidden="true"
              />
              <input
                id="lab-search"
                type="text"
                placeholder={t('searchLabs') || 'Search labs...'}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={t('searchLabs') || 'Search labs'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className={`rounded-lg p-4 border ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}
              >
                <Beaker className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}
                >
                  {t('totalLabs') || 'Total Labs'}
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`rounded-lg p-4 border ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-green-500/20' : 'bg-green-100'
                }`}
              >
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}
                >
                  {t('activeLabs') || 'Active Labs'}
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`rounded-lg p-4 border ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}
                >
                  {t('draftLabs') || 'Draft Labs'}
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stats.draft}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lab cards section */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton cards
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredLabs.length === 0 ? (
            // Empty state or no results
            <div
              className={`text-center py-12 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Search
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`}
              />
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {labs.length === 0
                  ? t('noLabsYet') || 'No labs created yet'
                  : t('noLabsMatchFilter') ||
                    'No labs match your filters'}
              </p>
              {labs.length === 0 && (
                <button
                  onClick={onCreateClick}
                  className="mt-4 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: primaryHex }}
                >
                  {t('createNewLab') || 'Create New Lab'}
                </button>
              )}
            </div>
          ) : (
            // Lab cards
            filteredLabs.map((lab) => (
              <div
                key={lab.id}
                className={`rounded-xl p-6 border shadow-sm transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                role="article"
                aria-label={lab.title}
              >
                <div className="flex items-start gap-4">
                  {/* Lab icon */}
                  <div
                    className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-white/10' : 'bg-gray-100'
                    }`}
                    aria-hidden="true"
                  >
                    <Beaker
                      size={32}
                      className={isDark ? 'text-slate-400' : 'text-gray-400'}
                    />
                  </div>

                  {/* Lab details */}
                  <div className="flex-1 min-w-0">
                    {/* Title and status row */}
                    <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                      <div className="flex-1">
                        {/* Title, course badge, lab number */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3
                            className={`text-lg font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {lab.title}
                          </h3>
                          {lab.course && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: isDark
                                  ? `${primaryHex}26`
                                  : `${primaryHex}1A`,
                                color: primaryHex,
                              }}
                            >
                              {lab.course.code}
                            </span>
                          )}
                          {lab.labNumber && (
                            <span
                              className={`text-sm ${
                                isDark ? 'text-slate-400' : 'text-gray-500'
                              }`}
                            >
                              {t('lab') || 'Lab'} #{lab.labNumber}
                            </span>
                          )}
                        </div>

                        {/* Due date */}
                        {lab.dueDate && (
                          <div
                            className={`flex items-center gap-2 text-sm mb-3 ${
                              isDark ? 'text-slate-400' : 'text-gray-600'
                            }`}
                          >
                            <Calendar size={14} aria-hidden="true" />
                            {t('dueDate') || 'Due'}:{' '}
                            {new Date(lab.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <LabStatusBadge status={lab.status} size="md" />
                    </div>

                    {/* Description */}
                    {lab.description && (
                      <p
                        className={`text-sm mb-4 line-clamp-2 ${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}
                      >
                        {lab.description}
                      </p>
                    )}

                    {/* Max score */}
                    <div className="flex items-center gap-6 mb-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText
                          size={16}
                          className={
                            isDark ? 'text-slate-500' : 'text-gray-400'
                          }
                          aria-hidden="true"
                        />
                        <span
                          className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {lab.maxScore}
                        </span>
                        <span
                          className={isDark ? 'text-slate-400' : 'text-gray-600'}
                        >
                          {t('maxScore') || 'Max Score'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onViewDetails(lab)}
                        aria-label={`${
                          t('viewDetails') || 'View Details'
                        } ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isDark
                            ? 'text-slate-300 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Eye size={16} aria-hidden="true" />
                        {t('viewDetails') || 'View Details'}
                      </button>
                      <button
                        onClick={() => onViewSubmissions(lab)}
                        aria-label={`${
                          t('viewSubmissions') || 'View Submissions'
                        } ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isDark
                            ? 'text-slate-300 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Eye size={16} aria-hidden="true" />
                        {t('viewSubmissions') || 'Submissions'}
                      </button>
                      <button
                        onClick={() => onEditClick(lab)}
                        aria-label={`${t('editLab') || 'Edit Lab'} ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isDark
                            ? 'text-slate-300 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Edit size={16} aria-hidden="true" />
                        {t('editLab') || 'Edit'}
                      </button>
                      {lab.status !== 'archived' && (
                        <button
                          onClick={() => onStatusChangeClick(lab)}
                          aria-label={`${
                            t('changeStatus') || 'Change Status'
                          } ${lab.title}`}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            isDark
                              ? 'text-slate-300 hover:bg-white/10'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {t('changeStatus') || 'Change Status'}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteClick(lab)}
                        aria-label={`${
                          t('deleteLab') || 'Delete Lab'
                        } ${lab.title}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        {t('delete') || 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LabList;
