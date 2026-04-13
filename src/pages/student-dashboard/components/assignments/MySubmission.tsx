import { CheckCircle, Clock, Award, Calendar, FileText, Link2, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LateBadge, FilePreviewer } from './shared';
import type { AssignmentSubmission, Assignment } from './types';

interface MySubmissionProps {
  submission: AssignmentSubmission;
  assignment: Assignment;
  onResubmit?: () => void;
  allowResubmit?: boolean;
}

/**
 * MySubmission - Display submitted work, grade, and feedback
 */
export function MySubmission({
  submission,
  assignment,
  onResubmit,
  allowResubmit = false,
}: MySubmissionProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t, language } = useLanguage();

  const formatDateTime = (dateString: string) => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isGraded = submission.submissionStatus === 'graded';
  const scorePercent = isGraded && submission.score && assignment.maxScore
    ? (parseFloat(submission.score) / parseFloat(assignment.maxScore)) * 100
    : null;

  // Calculate penalty if late
  const effectiveScore = submission.isLate && assignment.latePenalty && submission.score
    ? parseFloat(submission.score) * (1 - assignment.latePenalty / 100)
    : submission.score ? parseFloat(submission.score) : null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-5 border-b ${
          isGraded
            ? isDark
              ? 'bg-emerald-900/20 border-emerald-700'
              : 'bg-emerald-50 border-emerald-200'
            : isDark
              ? 'bg-blue-900/20 border-blue-700'
              : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isGraded
                  ? isDark
                    ? 'bg-emerald-900/30'
                    : 'bg-emerald-100'
                  : isDark
                    ? 'bg-blue-900/30'
                    : 'bg-blue-100'
              }`}
            >
              {isGraded ? (
                <CheckCircle className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              ) : (
                <Clock className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              )}
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  isGraded
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-800'
                    : isDark
                      ? 'text-blue-400'
                      : 'text-blue-800'
                }`}
              >
                {isGraded ? t('graded') || 'Graded' : t('submitted') || 'Submitted'}
              </h3>
              <p
                className={`text-sm ${
                  isGraded
                    ? isDark
                      ? 'text-emerald-400/80'
                      : 'text-emerald-700'
                    : isDark
                      ? 'text-blue-400/80'
                      : 'text-blue-700'
                }`}
              >
                {isGraded ? 'Your assignment has been graded' : 'Waiting for grade'}
              </p>
            </div>
          </div>
          <LateBadge isLate={submission.isLate} latePenalty={assignment.latePenalty} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Submission Details */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4`}>
          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Submitted At
              </p>
            </div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {formatDateTime(submission.submittedAt)}
            </p>
          </div>

          {isGraded && submission.gradedAt && (
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Graded At
                </p>
              </div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {formatDateTime(submission.gradedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Score Card */}
        {isGraded && submission.score && (
          <div
            className={`p-6 rounded-xl border-2 ${
              scorePercent && scorePercent >= 90
                ? isDark
                  ? 'bg-emerald-900/20 border-emerald-700'
                  : 'bg-emerald-50 border-emerald-200'
                : scorePercent && scorePercent >= 70
                  ? isDark
                    ? 'bg-blue-900/20 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                  : isDark
                    ? 'bg-amber-900/20 border-amber-700'
                    : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    scorePercent && scorePercent >= 90
                      ? isDark
                        ? 'bg-emerald-900/30'
                        : 'bg-emerald-100'
                      : scorePercent && scorePercent >= 70
                        ? isDark
                          ? 'bg-blue-900/30'
                          : 'bg-blue-100'
                        : isDark
                          ? 'bg-amber-900/30'
                          : 'bg-amber-100'
                  }`}
                >
                  <Award
                    className={`w-6 h-6 ${
                      scorePercent && scorePercent >= 90
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600'
                        : scorePercent && scorePercent >= 70
                          ? isDark
                            ? 'text-blue-400'
                            : 'text-blue-600'
                          : isDark
                            ? 'text-amber-400'
                            : 'text-amber-600'
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Your Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p
                      className={`text-3xl font-bold ${
                        scorePercent && scorePercent >= 90
                          ? isDark
                            ? 'text-emerald-400'
                            : 'text-emerald-700'
                          : scorePercent && scorePercent >= 70
                            ? isDark
                              ? 'text-blue-400'
                              : 'text-blue-700'
                            : isDark
                              ? 'text-amber-400'
                              : 'text-amber-700'
                      }`}
                    >
                      {effectiveScore !== null && submission.isLate && assignment.latePenalty
                        ? effectiveScore.toFixed(1)
                        : submission.score}
                    </p>
                    <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      / {assignment.maxScore}
                    </p>
                  </div>
                  {submission.isLate && assignment.latePenalty && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Original: {submission.score} (before {assignment.latePenalty}% penalty)
                    </p>
                  )}
                </div>
              </div>
              {scorePercent !== null && (
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${
                      scorePercent >= 90
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-700'
                        : scorePercent >= 70
                          ? isDark
                            ? 'text-blue-400'
                            : 'text-blue-700'
                          : isDark
                            ? 'text-amber-400'
                            : 'text-amber-700'
                    }`}
                  >
                    {Math.round(scorePercent)}%
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Percentage
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {isGraded && submission.feedback && (
          <div
            className={`p-5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {t('feedback') || 'Feedback'}
            </h4>
            <p className={`whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {submission.feedback}
            </p>
          </div>
        )}

        {/* Submitted Content */}
        <div>
          <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Submitted Content
          </h4>

          {/* Text submission */}
          {submission.submissionText && (
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Text Response
                </p>
              </div>
              <p className={`whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {submission.submissionText}
              </p>
            </div>
          )}

          {/* Link submission */}
          {submission.submissionLink && (
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                    <Link2 className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Submitted Link
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {submission.submissionLink}
                    </p>
                  </div>
                </div>
                <a
                  href={submission.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {/* File submission */}
          {(submission.driveFile || submission.file) && (
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Submitted File{submission.driveFile ? `: ${submission.driveFile.fileName}` : ''}
                </p>
              </div>
              {submission.driveFile ? (
                <div>
                  <iframe 
                    src={submission.driveFile.iframeUrl} 
                    className="w-full h-[500px] border border-slate-200 dark:border-slate-700 rounded-lg mb-3" 
                    title="Submission Preview" 
                  />
                  <div className="flex gap-4">
                    <a
                      href={submission.driveFile.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      📎 Open in Drive
                    </a>
                    <a
                      href={submission.driveFile.downloadUrl}
                      className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </div>
              ) : (
                <FilePreviewer
                  file={submission.file}
                  showDownload
                />
              )}
            </div>
          )}
        </div>

        {/* Resubmit button */}
        {allowResubmit && onResubmit && (
          <button
            onClick={onResubmit}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-colors ${
              isDark
                ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Resubmit Assignment
          </button>
        )}
      </div>
    </div>
  );
}

export default MySubmission;
