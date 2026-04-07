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
  AlertCircle,
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
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<LabSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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
      toast.error('Failed to fetch submissions');
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterSubmissions(submissions, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, submissions]);

  const filterSubmissions = (
    subs: LabSubmission[],
    filter: FilterType,
    search: string
  ) => {
    let filtered = subs;

    if (filter === 'pending') {
      filtered = filtered.filter((sub) => !sub.gradedAt);
    } else if (filter === 'graded') {
      filtered = filtered.filter((sub) => sub.gradedAt);
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((sub) => {
        const studentName = sub.studentName || (sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : '');
        const studentEmail = sub.studentEmail || sub.user?.email || '';
        return (
          studentName.toLowerCase().includes(query) ||
          studentEmail.toLowerCase().includes(query)
        );
      });
    }

    setFilteredSubmissions(filtered);
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => !s.gradedAt).length,
    graded: submissions.filter((s) => s.gradedAt).length,
    averageScore:
      submissions.filter((s) => s.score !== null).length > 0
        ? (
            submissions
              .filter((s) => s.score !== null)
              .reduce((acc, s) => acc + parseFloat(s.score as any || '0'), 0) /
            submissions.filter((s) => s.score !== null).length
          ).toFixed(2)
        : '0.00',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lab Submissions
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {lab.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Statistics */}
        <div className={`grid grid-cols-4 gap-4 p-6 border-b ${isDark ? 'bg-slate-800 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Total
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Pending
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Graded
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.graded}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Avg Score
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.averageScore}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`p-6 border-b space-y-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'pending', 'graded'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-3 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500'
                  : 'bg-white border-gray-300 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-blue-600" size={32} />
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  Loading submissions...
                </p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <FileText size={48} className="mb-4 opacity-50" />
              <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                No submissions found
              </p>
              <p className="text-sm mt-2">
                {searchQuery || activeFilter !== 'all'
                  ? 'Try adjusting your filters or search'
                  : 'No submissions yet'}
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
                className={`p-4 border rounded-lg transition ${
                  isDark
                    ? 'bg-slate-800 border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-blue-900' : 'bg-blue-100'
                    }`}>
                      <User className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {studentName}
                      </h3>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {studentEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {submission.gradedAt ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Graded
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 rounded-full">
                        <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          Pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Details */}
                <div className="space-y-2 mb-3">
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    <Calendar size={16} className="flex-shrink-0" />
                    <span>
                      {new Date(submission.submittedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {submissionText && (
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {submissionText}
                    </p>
                  )}

                  {/* Drive File Link */}
                  {hasDriveFile && (
                    <a
                      href={submission.driveFile!.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FileText size={16} className="flex-shrink-0" />
                      <span className="truncate">{submission.driveFile!.fileName}</span>
                    </a>
                  )}

                  {/* Legacy File Link */}
                  {!hasDriveFile && hasLegacyFile && (
                    <a
                      href={submission.fileUrl || submission.file?.webContentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FileText size={16} className="flex-shrink-0" />
                      <span className="truncate">
                        {submission.fileName || submission.file?.fileName || 'Download file'}
                      </span>
                    </a>
                  )}
                </div>

                {/* Grade Info and Actions */}
                <div className={`flex items-center justify-between pt-3 border-t gap-4 ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  {submission.gradedAt && submission.score !== null ? (
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Score: {submission.score}
                      </span>
                    </div>
                  ) : (
                    <div /> 
                  )}
                  <button
                    onClick={() => onGradeSubmission(submission)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      submission.gradedAt
                        ? isDark
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submission.gradedAt ? 'View Grade' : 'Grade'}
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
