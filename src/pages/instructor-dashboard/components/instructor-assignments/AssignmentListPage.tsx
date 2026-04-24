import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Archive, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CustomDropdown } from '../CustomDropdown';
import { StatusBadge, DueDateBadge } from '../shared';
import type { Assignment, AssignmentStatus } from '../../../../services/api/assignmentService';

interface AssignmentListPageProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onStatusChange: (id: string, newStatus: AssignmentStatus) => void;
  onViewSubmissions: (assignment: Assignment) => void;
  loading?: boolean;
  error?: string | null;
}

export function AssignmentListPage({
  assignments,
  onEdit,
  onDelete,
  onCreate,
  onStatusChange,
  onViewSubmissions,
  loading = false,
  error = null,
}: AssignmentListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AssignmentStatus>('all');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'file' | 'link' | 'any'>('all');
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { primaryHex = '#4f46e5' } = useTheme() as any;

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      const matchesType =
        filterType === 'all' || assignment.submissionType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assignments, searchTerm, filterStatus, filterType]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            <div className="w-full flex flex-col gap-1.5">
              <div
                className={`h-5 w-24 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
              <div
                className={`h-10 w-full rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            </div>
            <div className="w-full flex flex-col gap-1.5">
              <div
                className={`h-5 w-24 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
              <div
                className={`h-10 w-full rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            </div>
          </div>
          <div
            className={`h-10 w-32 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`border rounded-xl p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`h-6 w-3/4 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                />
                <div className="flex gap-1">
                  <div
                    className={`h-8 w-8 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-8 w-8 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                  />
                </div>
              </div>
              <div
                className={`h-4 w-1/2 rounded animate-pulse mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
              <div
                className={`h-4 w-1/3 rounded animate-pulse mb-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-xl border p-6 text-center ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}
      >
        <p className="font-medium">{t('errorLoadingAssignments')}</p>
        <p className="text-sm mt-1 opacity-80">{error}</p>
      </div>
    );
  }

  const getSubmissionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: t('textType'),
      file: t('fileType'),
      link: t('linkType'),
      any: t('anyType'),
    };
    return labels[type] || type;
  };

  const getNextStatus = (currentStatus: AssignmentStatus): AssignmentStatus | null => {
    switch (currentStatus) {
      case 'draft':
        return 'published';
      case 'published':
        return 'closed';
      case 'closed':
        return 'archived';
      default:
        return null;
    }
  };

  const getStatusActionLabel = (currentStatus: AssignmentStatus): string => {
    switch (currentStatus) {
      case 'draft':
        return t('publishAction');
      case 'published':
        return t('closeAction');
      case 'closed':
        return t('archiveAction');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {/* Search */}
          <div className="w-full flex flex-col gap-1.5">
            <span
              className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {t('search')}
            </span>
            <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                size={18}
              />
              <input
                type="text"
                placeholder={t('searchAssignments')}
                aria-label={t('searchAssignments')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <CustomDropdown
            label={t('statusLabel')}
            value={filterStatus}
            options={[
              { value: 'all', label: t('allStatus') },
              { value: 'draft', label: t('draft') },
              { value: 'published', label: t('publish') },
              { value: 'closed', label: t('closed') },
              { value: 'archived', label: t('archived') },
            ]}
            onChange={(v) => setFilterStatus(v as typeof filterStatus)}
            stackLabel
            fullWidth
          />

          {/* Type Filter */}
          <CustomDropdown
            label={t('submissionTypeLabel')}
            value={filterType}
            options={[
              { value: 'all', label: t('allTypes') },
              { value: 'text', label: t('textType') },
              { value: 'file', label: t('fileType') },
              { value: 'link', label: t('linkType') },
              { value: 'any', label: t('anyType') },
            ]}
            onChange={(v) => setFilterType(v as typeof filterType)}
            stackLabel
            fullWidth
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium self-end whitespace-nowrap"
          style={{ backgroundColor: primaryHex }}
        >
          <Plus size={18} />
          {t('createAssignment')}
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map((assignment) => {
          const nextStatus = getNextStatus(assignment.status);
          const statusActionLabel = getStatusActionLabel(assignment.status);

          return (
            <div
              key={assignment.id}
              className={`border rounded-xl p-5 hover:shadow-md transition-all ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header: Title + Actions */}
              <div className="flex items-start justify-between mb-3">
                <h3
                  className={`font-semibold flex-1 text-base leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {assignment.title}
                </h3>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => onEdit(assignment)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark
                        ? 'text-indigo-400 hover:bg-indigo-500/20'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title="Edit"
                    aria-label="Edit assignment"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(assignment.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark
                        ? 'text-red-400 hover:bg-red-500/20'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete"
                    aria-label="Delete assignment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {assignment.description && (
                <p
                  className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                >
                  {assignment.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={assignment.status} />
                  <DueDateBadge dueDate={assignment.dueDate} />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                    {t('submissionTypeLabel')}: <span className="font-medium">{getSubmissionTypeLabel(assignment.submissionType)}</span>
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                    {t('maxLabel')} <span className="font-medium">{assignment.maxScore} {t('ptsLabel')}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={() => onViewSubmissions(assignment)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    isDark
                      ? 'border-white/10 text-slate-300 hover:bg-white/10'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Eye size={14} />
                  {t('submissions')}
                </button>
                {nextStatus && (
                  <button
                    onClick={() => onStatusChange(assignment.id, nextStatus)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      nextStatus === 'published'
                        ? isDark
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        : nextStatus === 'archived'
                          ? isDark
                            ? 'bg-slate-500/20 text-slate-300 hover:bg-slate-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : isDark
                            ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {nextStatus === 'published' && <Send size={14} />}
                    {nextStatus === 'archived' && <Archive size={14} />}
                    {statusActionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div
            className={`col-span-full text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          >
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? t('noAssignmentsMatch')
              : t('noAssignmentsForSection')}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentListPage;
