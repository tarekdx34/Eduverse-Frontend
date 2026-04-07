import { ArrowLeft, Calendar, Clock, Award, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAssignment } from './hooks/useAssignments';
import { DueDateBadge } from './shared';
import SubmissionForm from './SubmissionForm';
import MySubmission from './MySubmission';

interface AssignmentViewProps {
  assignmentId: string;
  onBack: () => void;
}

/**
 * AssignmentView - Detailed assignment view with submission
 */
export function AssignmentView({ assignmentId, onBack }: AssignmentViewProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t, language } = useLanguage();
  const { assignment, submission, loading, error, refreshSubmission } = useAssignment(assignmentId);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--accent-color)] mx-auto mb-4 animate-spin" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          {t('assignments.backToAssignments') || 'Back'}
        </button>
        <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-card-dark' : 'bg-white'}`}>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Assignment not found
          </h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            The assignment you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const daysUntil = assignment.dueDate
    ? Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const hasSubmission = submission !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          {t('assignments.backToAssignments') || 'Back to Assignments'}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <DueDateBadge dueDate={assignment.dueDate} />
        </div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {assignment.title}
        </h1>
        {assignment.course && (
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {assignment.course.code} - {assignment.course.name}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Due Date
            </p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatDate(assignment.dueDate) || 'No due date'}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className={`w-5 h-5 ${daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : 'text-amber-500'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Time Left
            </p>
          </div>
          <p
            className={`text-xl font-bold ${
              daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {daysUntil !== null
              ? daysUntil > 0
                ? `${daysUntil} days`
                : daysUntil === 0
                  ? 'Due today'
                  : 'Overdue'
              : 'No due date'}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Points
            </p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {assignment.maxScore}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
            }`}
          >
            <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Assignment Details
            </h2>
            <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
              {assignment.instructions ? (
                <div
                  className={isDark ? 'text-slate-300' : 'text-slate-700'}
                  dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                />
              ) : assignment.description ? (
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {assignment.description}
                </p>
              ) : (
                <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                  No description provided.
                </p>
              )}
            </div>

            {/* Instruction Files */}
            {assignment.instructionFiles && assignment.instructionFiles.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className={`font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Attached Materials:
                </h3>
                {assignment.instructionFiles.map(file => (
                  <div key={file.driveId} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {file.fileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'}`}>
                         Open Reference
                       </a>
                       <a href={file.downloadUrl} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors text-white hover:opacity-90`} style={{ backgroundColor: 'var(--accent-color)' }}>
                         Download
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission or View */}
          {hasSubmission ? (
            <MySubmission
              submission={submission}
              assignment={assignment}
              allowResubmit={false}
            />
          ) : (
            <SubmissionForm
              assignment={assignment}
              onSubmitSuccess={refreshSubmission}
              disabled={assignment.status === 'closed' || assignment.status === 'archived'}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requirements */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Requirements
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Submission Type
                </p>
                <p className={`capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {assignment.submissionType}
                </p>
              </div>
              {assignment.maxFileSize && (
                <div>
                  <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Max File Size
                  </p>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {(assignment.maxFileSize / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              )}
              {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
                <div>
                  <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Allowed File Types
                  </p>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {assignment.allowedFileTypes.map(t => `.${t}`).join(', ')}
                  </p>
                </div>
              )}
              {assignment.latePenalty && (
                <div>
                  <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Late Penalty
                  </p>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {assignment.latePenalty}% per day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentView;
