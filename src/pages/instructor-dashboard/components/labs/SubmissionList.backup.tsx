import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabService } from '../../../../services/api/labService';
import { LabSubmission, Lab } from './types';
import { toast } from 'sonner';
import {
  X,
  Search,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Award,
  Loader,
} from 'lucide-react';

interface SubmissionListProps {
  isOpen: boolean;
  lab: Lab;
  onClose: () => void;
  onGradeSubmission: (submission: LabSubmission) => void;
}

type FilterType = 'all' | 'pending' | 'graded';

export const SubmissionList: React.FC<SubmissionListProps> = ({
  isOpen,
  lab,
  onClose,
  onGradeSubmission,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<LabSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fetch submissions
  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, lab.id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await LabService.getSubmissions(lab.id);
      setSubmissions(data);
      filterSubmissions(data, activeFilter, searchQuery);
    } catch (error) {
      toast.error(t('error.fetchSubmissions') || 'Failed to fetch submissions');
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions
  useEffect(() => {
    filterSubmissions(submissions, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, submissions]);

  const filterSubmissions = (
    subs: LabSubmission[],
    filter: FilterType,
    search: string
  ) => {
    let filtered = subs;

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter((sub) => !sub.gradedAt);
    } else if (filter === 'graded') {
      filtered = filtered.filter((sub) => sub.gradedAt);
    }

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (sub) => {
          const studentName = sub.studentName || 
            (sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : '');
          const studentEmail = sub.studentEmail || sub.user?.email || '';
          return studentName.toLowerCase().includes(lowerSearch) ||
            studentEmail.toLowerCase().includes(lowerSearch);
        }
      );
    }

    setFilteredSubmissions(filtered);
  };

  // Calculate statistics
  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => !s.gradedAt).length,
    graded: submissions.filter((s) => s.gradedAt).length,
    averageScore:
      submissions.filter((s) => s.score !== null).length > 0
        ? (
            submissions
              .filter((s) => s.score !== null)
              .reduce((acc, s) => acc + (s.score || 0), 0) /
            submissions.filter((s) => s.score !== null).length
          ).toFixed(2)
        : '0',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
          theme === 'dark' ? 'border border-slate-700' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('submissions.title') || 'Lab Submissions'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lab.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('submissions.total') || 'Total'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('submissions.pending') || 'Pending'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('submissions.graded') || 'Graded'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.graded}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('submissions.average') || 'Avg Score'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.averageScore}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'graded'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {t(`filter.${filter}`) ||
                  filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('search.placeholder') || 'Search by student name or email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-blue-600" size={32} />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('loading') || 'Loading submissions...'}
                </p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('empty.submissions') || 'No submissions found'}
              </p>
              <p className="text-sm mt-2">
                {searchQuery || activeFilter !== 'all'
                  ? t('empty.tryAdjusting') || 'Try adjusting your filters or search'
                  : t('empty.noSubmissionsYet') || 'No submissions yet'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const studentName = submission.studentName || 
                (submission.user ? `${submission.user.firstName} ${submission.user.lastName}` : 'Unknown Student');
              const studentEmail = submission.studentEmail || submission.user?.email || '';
              const submissionText = submission.text || submission.submissionText;
              const hasDriveFile = submission.driveFile && submission.driveFile.webViewLink;
              const hasLegacyFile = submission.fileUrl || (submission.file && submission.file.webContentLink);
              
              return (
              <div
                key={submission.id}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md dark:hover:shadow-slate-800 transition bg-white dark:bg-slate-800"
              >
                {/* Student Info */}
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <User className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {studentName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {studentEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {submission.gradedAt ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full whitespace-nowrap">
                        <CheckCircle
                          size={16}
                          className="text-green-600 dark:text-green-400"
                        />
                        <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                          {t('status.graded') || 'Graded'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full whitespace-nowrap">
                        <Clock
                          size={16}
                          className="text-yellow-600 dark:text-yellow-400"
                        />
                        <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {t('status.pending') || 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span>
                      {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  {submissionText && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {submissionText}
                    </p>
                  )}

                  {/* Drive File Link (new format) */}
                  {hasDriveFile && (
                    <a
                      href={submission.driveFile!.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FileText size={16} className="flex-shrink-0" />
                      <span className="truncate">
                        {submission.driveFile!.fileName}
                      </span>
                    </a>
                  )}

                  {/* Legacy File Link (fallback) */}
                  {!hasDriveFile && hasLegacyFile && (
                    <a
                      href={submission.fileUrl || submission.file?.webContentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FileText size={16} className="flex-shrink-0" />
                      <span className="truncate">
                        {submission.fileName || submission.file?.fileName || 'Download attachment'}
                      </span>
                    </a>
                  )}
                </div>

                {/* Grade Info and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700 gap-4">
                  {submission.gradedAt && submission.score !== null && (
                    <div className="flex items-center gap-2">
                      <Award
                        size={18}
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t('score') || 'Score'}: {submission.score}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => onGradeSubmission(submission)}
                    className={`px-4 py-2 rounded-lg font-medium transition flex-shrink-0 whitespace-nowrap ${
                      submission.gradedAt
                        ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submission.gradedAt
                      ? t('button.viewGrade') || 'View Grade'
                      : t('button.grade') || 'Grade'}
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionList;
