import { Calendar, Award, Eye, ChevronRight, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DueDateBadge, StatusBadge } from './shared';
import { getDueDateInfo, getSubmissionStatus } from './hooks/useAssignments';
import type { AssignmentWithSubmission } from './types';

interface AssignmentCardProps {
  assignment: AssignmentWithSubmission;
  onClick: () => void;
}

/**
 * AssignmentCard - Displays individual assignment in list view
 */
export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();

  const dueDateInfo = getDueDateInfo(assignment.dueDate);
  const submissionStatus = getSubmissionStatus(assignment.submission);
  const isOverdue = dueDateInfo.isOverdue && submissionStatus === 'pending';

  // Get action button text
  const getActionText = () => {
    if (submissionStatus === 'graded') return t('viewGrade') || 'View Grade';
    if (submissionStatus === 'submitted') return t('viewSubmission') || 'View Submission';
    return t('Submit Work') || 'Submit Work';
  };

  return (
    <div
      onClick={onClick}
      className={`group p-5 rounded-xl border-2 transition-all cursor-pointer ${
        isOverdue
          ? isDark
            ? 'border-red-800 bg-red-900/20 hover:border-red-700 hover:bg-red-900/30'
            : 'border-red-200 bg-red-50/30 hover:border-red-300 hover:bg-red-50'
          : isDark
            ? 'border-white/5 hover:border-[var(--accent-color)] hover:bg-white/5'
            : 'border-slate-100 hover:border-[var(--accent-color)]/50 hover:bg-slate-50'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${assignment.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3
              className={`font-semibold text-base group-hover:text-[var(--accent-color)] transition-colors ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              {assignment.title}
            </h3>
            <StatusBadge status={submissionStatus} size="sm" />
          </div>
          {assignment.description && (
            <p
              className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {assignment.description}
            </p>
          )}
          {/* Course badge */}
          {assignment.course && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <FileText className="w-3 h-3" />
                {assignment.course.code}
              </span>
              <DueDateBadge dueDate={assignment.dueDate} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className={`grid grid-cols-3 gap-3 p-3 rounded-lg border mb-4 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('dueDate') || 'Due'}
            </p>
          </div>
          <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '-'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Award className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('worth') || 'Points'}
            </p>
          </div>
          <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {assignment.maxScore} {t('pts') || 'pts'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</p>
          </div>
          <p
            className={`text-xs font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            {assignment.submissionType}
          </p>
        </div>
      </div>

      {/* Score display if graded */}
      {assignment.submission?.score && (
        <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
            >
              Score
            </span>
            <span
              className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
            >
              {assignment.submission.score} / {assignment.maxScore}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
          aria-label={getActionText()}
        >
          <span>{getActionText()}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`px-4 py-2.5 border-2 rounded-lg transition-all ${
            isDark
              ? 'border-white/10 text-slate-300 hover:bg-white/10'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label={t('viewDetails') || 'View Details'}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AssignmentCard;
