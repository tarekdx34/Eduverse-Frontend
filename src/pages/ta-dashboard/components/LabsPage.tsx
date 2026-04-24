import React, { useState } from 'react';
import {
  Beaker,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { LabService, Lab, LabSubmission } from '../../../services/api/labService';
import { toast } from 'sonner';
import GradingModal from './GradingModal';

type LabsPageProps = {
  labs?: Lab[];
  onViewLab?: (labId: string) => void;
  disableCreateReason?: string;
  disableViewDetailsReason?: string;
};

export function LabsPage({
  labs: mockLabs,
  onViewLab,
  disableCreateReason,
  disableViewDetailsReason,
}: LabsPageProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabForGrading, setSelectedLabForGrading] = useState<Lab | null>(null);
  const [gradingSubmissions, setGradingSubmissions] = useState<LabSubmission[]>([]);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);

  // Fetch labs using useApi hook if no mock labs are provided
  const {
    data: fetchedLabs = [],
    loading,
    error,
    refetch,
  } = useApi(() => LabService.getAll(), [], !mockLabs);

  const displayLabs = mockLabs || fetchedLabs;

  // Determine user role for permission checks
  const isTA = user?.roles?.includes('teaching_assistant');

  // Handle errors with toast
  React.useEffect(() => {
    if (error && !mockLabs) {
      toast.error(t('errorLoadingLabs') || 'Failed to load labs');
    }
  }, [error, t, mockLabs]);

  const filteredLabs = displayLabs.filter((lab) => {
    const matchesFilter = filter === 'all' || lab.status === filter;
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.course?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });


  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      published: {
        color: isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800',
        label: t('active') || 'Active',
      },
      draft: {
        color: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
        label: t('draft') || 'Draft',
      },
      closed: {
        color: isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800',
        label: t('completed') || 'Completed',
      },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleViewSubmissions = async (lab: Lab) => {
    try {
      const submissions = await LabService.getSubmissions(lab.id);
      setSelectedLabForGrading(lab);
      setGradingSubmissions(submissions);
      setGradingModalOpen(true);
    } catch (err) {
      toast.error(t('errorLoadingSubmissions') || 'Failed to load submissions');
    }
  };

  const handleGradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    if (!selectedLabForGrading) return;
    try {
      await LabService.gradeSubmission(selectedLabForGrading.id, submissionId, score, feedback);
      toast.success(t('submissionGraded') || 'Submission graded successfully');
      // Refetch submissions
      const submissions = await LabService.getSubmissions(selectedLabForGrading.id);
      setGradingSubmissions(submissions);
      refetch();
    } catch (err) {
      toast.error(t('errorGradingSubmission') || 'Failed to grade submission');
    }
  };

  // Loading skeleton - T098
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div
              className={`h-8 w-40 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
            />
            <div
              className={`h-4 w-60 rounded animate-pulse mt-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
            />
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-12 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state - T098
  if (!loading && labs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('labManagement') || 'Lab Management'}
            </h2>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('manageLabSessions') || 'View and grade lab sessions'}
            </p>
          </div>
        </div>
        <div
          className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <Beaker
            className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
          />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            {t('noLabsFound') || 'No labs found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('labManagement') || 'Lab Management'}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('manageLabSessions') || 'View and grade lab sessions'}
          </p>
        </div>
        <button
          disabled={Boolean(disableCreateReason)}
          title={disableCreateReason || undefined}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('createNewLab') || 'Create New Lab'}
        </button>
      </div>

      {/* Filters and Search */}
      <div
        className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchLabsPlaceholder') || 'Search labs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' : 'border-gray-300'}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? t('all') : status === 'active' ? t('active') : t('completed')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Labs Table */}
      <div
        className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`border-b ${isDark ? 'bg-transparent border-white/10' : 'bg-gray-50 border-gray-200'}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('lab') || 'Lab'}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('course') || 'Course'}
                </th>
                <th
                  className={`hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('dueDate') || 'Due Date'}
                </th>
                <th
                  className={`hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('submissions') || 'Submissions'}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('status') || 'Status'}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDark ? 'divide-white/10' : 'bg-white divide-gray-200'}`}
            >
              {filteredLabs.map((lab) => (
                <tr
                  key={lab.id}
                  className={`transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Beaker className="w-5 h-5 text-blue-600" />
                      <div>
                        <div
                          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {lab.title}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {lab.labNumber ? `Lab #${lab.labNumber}` : 'Lab'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {lab.course?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center gap-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      <Calendar
                        className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
                      />
                      {lab.dueDate ? new Date(lab.dueDate).toLocaleDateString() : 'No date'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <FileText
                          className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
                        />
                        <span>{t('view') || 'View'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lab.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {/* T096: Only show View/Grade for TA, hide Create/Delete */}
                      <button
                        onClick={() => {
                          if (disableViewDetailsReason) return;
                          handleViewSubmissions(lab);
                          if (onViewLab) onViewLab(lab.id);
                        }}
                        disabled={Boolean(disableViewDetailsReason)}
                        title={disableViewDetailsReason || t('viewSubmissions') || 'View submissions'}
                        className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLabs.length === 0 && (
        <div
          className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <Beaker
            className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
          />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            {t('noLabsFound') || 'No labs found'}
          </p>
        </div>
      )}

      {/* T097: Grading modal for lab submissions */}
      {gradingModalOpen && selectedLabForGrading && (
        <GradingModal
          isOpen={gradingModalOpen}
          labTitle={selectedLabForGrading.title}
          submissions={gradingSubmissions}
          onGrade={handleGradeSubmission}
          onClose={() => {
            setGradingModalOpen(false);
            setSelectedLabForGrading(null);
          }}
        />
      )}
    </div>
  );
}

export default LabsPage;
