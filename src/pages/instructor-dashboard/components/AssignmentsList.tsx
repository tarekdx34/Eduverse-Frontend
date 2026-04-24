import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomDropdown } from './CustomDropdown';
import { toast } from 'sonner';

export type AssignmentItem = {
  id: number;
  title: string;
  dueDate: string;
  submissions: number;
  status: 'draft' | 'open' | 'closed';
};

type AssignmentsListProps = {
  data: AssignmentItem[];
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onStatusChange: (id: number, newStatus: 'draft' | 'open' | 'closed') => void;
  onViewSubmissions?: (assignment: AssignmentItem) => void;
  loading?: boolean;
  error?: string | null;
};

export function AssignmentsList({
  data,
  onEdit,
  onDelete,
  onCreate,
  onStatusChange,
  onViewSubmissions,
  loading = false,
  error = null,
}: AssignmentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'open' | 'closed'>('all');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
            <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <div className={`h-5 w-24 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-10 w-full rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
            <div className="w-full flex flex-col gap-1.5">
              <div className={`h-5 w-24 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-10 w-full rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
          </div>
          <div className={`h-10 w-32 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`border rounded-xl p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`h-6 w-3/4 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className="flex gap-1 ml-2">
                  <div className={`h-8 w-8 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`h-8 w-8 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className={`h-4 w-1/2 rounded animate-pulse mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-4 w-1/3 rounded animate-pulse mb-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="flex items-center justify-between mt-4">
                <div className={`h-6 w-20 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className={`h-8 w-24 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredData = data.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const { primaryHex = '#4f46e5' } = useTheme() as any;

  return (
    <div className="space-y-6">
      {/* Filters Bar + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
          <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
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
          <CustomDropdown
            label={t('statusLabel')}
            value={filterStatus}
            options={[
              { value: 'all', label: t('allStatus') },
              { value: 'draft', label: t('draft') },
              { value: 'open', label: t('open') },
              { value: 'closed', label: t('closed') },
            ]}
            onChange={(v) => setFilterStatus(v as 'all' | 'draft' | 'open' | 'closed')}
            stackLabel
            fullWidth
          />
        </div>
        <button
          onClick={onCreate}
          id="walkthrough-create-assignment"
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium self-end"
          style={{ backgroundColor: primaryHex }}
        >
          <Plus size={18} />
          {t('createAssignment')}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="walkthrough-assignments-grid">
        {filteredData.map((a) => (
          <div
            key={a.id}
            className={`border rounded-xl p-5 hover:shadow-sm transition-all ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`font-semibold flex-1 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {a.title}
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onEdit(a)}
                  className={`p-1.5 text-indigo-600 rounded-lg transition-colors ${isDark ? 'hover:bg-indigo-500/20' : 'hover:bg-indigo-50'}`}
                  title={t('common.edit') || "Edit"}
                  aria-label={t('common.edit') || "Edit assignment"}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className={`p-1.5 text-red-500 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                  title={t('common.delete') || "Delete"}
                  aria-label={t('common.delete') || "Delete assignment"}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className={`text-xs mb-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              {t('dueLabel')} {a.dueDate}
            </div>
            <div className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('submissionsLabel')} {a.submissions}
            </div>
            {onViewSubmissions && (
              <button
                onClick={() => onViewSubmissions(a)}
                className={`mb-3 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                aria-label={t('assignments.viewSubmissions') || "View submissions"}
              >
                {t('assignments.viewSubmissions') || "View Submissions"}
              </button>
            )}
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  a.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : a.status === 'closed'
                      ? isDark
                        ? 'bg-white/10 text-slate-300'
                        : 'bg-gray-100 text-gray-600'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
              <div className="flex gap-2">
                {a.status === 'draft' && (
                  <button
                    onClick={() => onStatusChange(a.id, 'open')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    {t('open')}
                  </button>
                )}
                {a.status === 'open' && (
                  <button
                    onClick={() => onStatusChange(a.id, 'closed')}
                    className={`text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 transition-colors ${
                      isDark
                        ? 'bg-white/5 text-slate-300 border-white/10'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {t('closeAction')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div
            className={`col-span-full text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          >
            {searchTerm || filterStatus !== 'all'
              ? t('noAssignmentsMatch')
              : t('noAssignmentsForSection')}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentsList;
