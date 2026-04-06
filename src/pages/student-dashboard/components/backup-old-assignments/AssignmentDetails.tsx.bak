import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  Paperclip,
  Send,
  AlertCircle,
  CheckCircle,
  Award,
  X,
  File,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi, useMutation } from '../../../hooks/useApi';
import { AssignmentService } from '../../../services/api/assignmentService';

interface AssignmentDetailsProps {
  assignmentId: number;
  onBack: () => void;
}

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function AssignmentDetails({ assignmentId, onBack }: AssignmentDetailsProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isDark } = useTheme() as any;
  const { t, language } = useLanguage();

  // Locale-aware date formatting helper
  const formatDate = (
    dateString: string | null | undefined,
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!dateString) return '';
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(locale, options || defaultOptions);
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch assignment details from API
  const { data: assignment, loading: loadingAssignment } = useApi(
    () => AssignmentService.getById(String(assignmentId)),
    [assignmentId]
  );

  // Fetch my submission status
  const { data: mySubmission, refetch: refetchSubmission } = useApi(
    () => AssignmentService.getMySubmission(String(assignmentId)),
    [assignmentId]
  );

  // Mutation for submitting assignment
  const { mutate: submitAssignment, loading: submitting } = useMutation(
    async (data: { text: string; files: File[] }) => {
      if (data.files.length > 0) {
        // Submit with file
        return AssignmentService.submitFile(
          String(assignmentId),
          data.files[0],
          data.text || undefined
        );
      } else if (data.text) {
        // Submit text only
        return AssignmentService.submitText(String(assignmentId), data.text);
      }
      throw new Error('No content to submit');
    }
  );

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut: Ctrl/Cmd+Enter to submit
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if ((!isSubmitted && attachedFiles.length > 0) || submissionText) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSubmitted, attachedFiles, submissionText]);

  if (loadingAssignment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--accent-color)] mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-slate-800 mb-2 font-semibold">{t('assignments.notFound')}</h2>
          <p className="text-slate-600 mb-4">{t('assignments.notFoundDesc')}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90"
          >
            {t('assignments.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // Calculate days until due
  const daysUntil = assignment.dueDate ? getDaysUntilDue(assignment.dueDate.split('T')[0]) : null;

  // Check if already submitted
  const isSubmitted = mySubmission !== null;
  const submissionStatus = mySubmission?.submissionStatus || 'Not submitted';

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitConfirmation(false);
    try {
      await submitAssignment({
        text: submissionText,
        files: attachedFiles,
      });
      toast.success('Assignment submitted successfully!');
      refetchSubmission(); // Refresh submission status
      setShowSuccessModal(true);
      setAttachedFiles([]); // Clear files
      setSubmissionText(''); // Clear text
    } catch (error) {
      console.error('Submit failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit assignment. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onBack();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          aria-label={t('assignments.backToAssignments')}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>{t('assignments.backToAssignments')}</span>
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                Assignment #{assignment.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {assignment.submissionType || 'Assignment'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                  assignment.status === 'published'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : assignment.status === 'draft'
                      ? 'bg-gray-50 border-gray-200 text-gray-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {assignment.status}
              </span>
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {assignment.title}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {assignment.course?.code} - {assignment.course?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Calendar className={`w-5 h-5 text-[var(--accent-color)]`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Due Date
            </p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {assignment.dueDate ? formatDate(assignment.dueDate) : t('assignments.dueDate')}
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {assignment.dueDate ? '11:59 PM' : '-'}
          </p>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Clock
                className={`w-5 h-5 ${daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : 'text-amber-500'}`}
              />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Time Left
            </p>
          </div>
          <p
            className={`text-xl font-bold ${daysUntil !== null && daysUntil <= 2 ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {daysUntil !== null
              ? daysUntil > 0
                ? `${daysUntil} days left`
                : daysUntil === 0
                  ? 'Due today'
                  : 'Overdue'
              : 'No due date'}
          </p>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Award className={`w-5 h-5 text-emerald-500`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Points</p>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(assignment.maxScore)} Points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">Assignment Details</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {assignment.detailedDescription ||
                    assignment.description ||
                    'No description provided.'}
                </div>
              </div>
            </div>
          </div>

          {/* Grading Rubric */}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
                <h2 className="text-slate-800 font-semibold">Grading Rubric</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Total: {assignment.points || assignment.maxScore} points
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(assignment.rubric || []).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-slate-800 font-medium">{item.criteria}</h3>
                        <span className="px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg text-sm border border-[var(--accent-color)]/20 font-medium">
                          {item.points} pts
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Assignment */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">{t('assignments.submitYourWork')}</h2>
              <p className="text-slate-600 text-sm mt-1">{t('assignments.attachFiles')}</p>
            </div>
            <div className="p-6">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10/50 transition-all mb-4"
                role="region"
                aria-label={t('assignments.attachFiles')}
              >
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-800 mb-2 font-medium">{t('assignments.dragDropFiles')}</p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-colors"
                >
                  <Paperclip className="w-4 h-4" aria-hidden="true" />
                  <span>{t('assignments.attachFiles')}</span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileAttach}
                    className="hidden"
                    aria-label={t('assignments.attachFiles')}
                  />
                </label>
                <p className="text-slate-500 text-xs mt-3">PDF, DOC, DOCX, ZIP, RAR (Max 50MB)</p>
              </div>

              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-slate-800 mb-3 font-medium">
                    {t('assignments.attachedFiles')} ({attachedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center"
                            aria-hidden="true"
                          >
                            <File className="w-5 h-5 text-[var(--accent-color)]" />
                          </div>
                          <div>
                            <p className="text-slate-800 text-sm font-medium">{file.name}</p>
                            <p className="text-slate-500 text-xs">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Remove file: ${file.name}`}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Text */}
              <div className="mb-6">
                <label htmlFor="submission-notes" className="text-slate-800 mb-3 font-medium block">
                  {t('assignments.yourResponse')}
                </label>
                <textarea
                  id="submission-notes"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder={t('assignments.writeResponse')}
                  className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent resize-none"
                  rows={4}
                  disabled={isSubmitted}
                  aria-label={t('assignments.yourResponse')}
                  aria-describedby="submission-notes-hint"
                />
                <p id="submission-notes-hint" className="text-slate-600 text-sm mt-1">
                  {t('assignments.submittingKeyboardHint')}
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitted || submitting || (attachedFiles.length === 0 && !submissionText)
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none font-medium"
                aria-label={
                  isSubmitted
                    ? t('assignments.submitted')
                    : submitting
                      ? t('assignments.submittingAssignment')
                      : t('assignments.submitButton')
                }
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span className="text-lg">{t('assignments.submittingAssignment')}</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    <span className="text-lg">{t('assignments.submitted')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" aria-hidden="true" />
                    <span className="text-lg">{t('assignments.submitButton')}</span>
                  </>
                )}
              </button>

              {!isSubmitted && attachedFiles.length === 0 && !submissionText && (
                <p className="text-amber-600 text-sm text-center mt-3 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('assignments.attachFiles')}
                </p>
              )}

              {isSubmitted && mySubmission && (
                <div
                  className={`mt-4 p-4 ${mySubmission.isLate ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} border rounded-lg`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle
                      className={`w-5 h-5 ${mySubmission.isLate ? 'text-amber-600' : 'text-emerald-600'}`}
                    />
                    <p
                      className={`${mySubmission.isLate ? 'text-amber-900' : 'text-emerald-900'} font-medium`}
                    >
                      {t('assignments.submitted')}
                    </p>
                    {mySubmission.isLate && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('assignments.lateSubmission')}
                        {assignment.latePenalty && ` (-${assignment.latePenalty}%)`}
                      </span>
                    )}
                  </div>
                  <p
                    className={`${mySubmission.isLate ? 'text-amber-700' : 'text-emerald-700'} text-sm`}
                  >
                    {t('assignments.statusLabel')}:{' '}
                    <span className="font-medium">{submissionStatus}</span>
                  </p>
                  <p
                    className={`${mySubmission.isLate ? 'text-amber-700' : 'text-emerald-700'} text-sm`}
                  >
                    {t('assignments.submittedAt')}: {formatDateTime(mySubmission.submittedAt)}
                  </p>
                  {mySubmission.score && (
                    <p
                      className={`${mySubmission.isLate ? 'text-amber-700' : 'text-emerald-700'} text-sm mt-1`}
                    >
                      {t('assignments.score')}:{' '}
                      <span className="font-bold">
                        {mySubmission.score}/{assignment.maxScore}
                      </span>
                      {mySubmission.isLate && assignment.latePenalty && (
                        <span className="text-amber-600 ml-2 text-xs">
                          ({t('assignments.afterPenalty')}:{' '}
                          {parseFloat(mySubmission.score) * (1 - assignment.latePenalty / 100)}/
                          {assignment.maxScore})
                        </span>
                      )}
                    </p>
                  )}
                  {mySubmission.feedback && (
                    <div className="mt-2">
                      <p
                        className={`${mySubmission.isLate ? 'text-amber-900' : 'text-emerald-900'} text-sm font-medium`}
                      >
                        {t('assignments.feedback')}:
                      </p>
                      <p
                        className={`${mySubmission.isLate ? 'text-amber-700' : 'text-emerald-700'} text-sm`}
                      >
                        {mySubmission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Assignment Information</h3>
            </div>
            <div className="p-4 space-y-4">
              {(assignment.instructor || assignment.createdBy) && (
                <div>
                  <p className="text-slate-600 text-sm mb-1 font-medium">Instructor</p>
                  <p className="text-slate-800 font-medium">
                    {assignment.instructor || 'Instructor Name Not Available'}
                  </p>
                  {assignment.instructorEmail && (
                    <p className="text-[var(--accent-color)] text-sm">
                      {assignment.instructorEmail}
                    </p>
                  )}
                </div>
              )}
              {assignment.dateAssigned && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-slate-600 text-sm mb-1 font-medium">
                    {t('assignments.dueDate')}
                  </p>
                  <p className="text-slate-800 font-medium">
                    {formatDate(assignment.dateAssigned, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-1 font-medium">{t('assignments.status')}</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    assignment.status === 'pending'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : assignment.status === 'in-progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {assignment.status === 'pending' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : assignment.status === 'in-progress' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span className="capitalize">
                    {assignment.status === 'in-progress' ? 'In Progress' : assignment.status}
                  </span>
                </span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-2 font-medium">Progress</p>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${assignment.color || 'bg-blue-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${assignment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-800 mt-2 font-medium">
                    {assignment.progress || 0}% Complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Downloadable Resources */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Assignment Instructions</h3>
              <p className="text-slate-600 text-sm mt-1">Download required materials</p>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {(assignment.resources || []).map((resource: any, index: number) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent-color)]/20 transition-colors">
                        <FileText className="w-5 h-5 text-[var(--accent-color)]" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-800 text-sm group-hover:text-[var(--accent-color)] transition-colors font-medium">
                          {resource.name}
                        </p>
                        <p className="text-slate-500 text-xs">{resource.size}</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-[var(--accent-color)] transition-colors" />
                  </button>
                ))}
                {(!assignment.resources || assignment.resources.length === 0) && (
                  <p className="text-center text-slate-500 text-sm py-4">
                    No resources available for this assignment
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-background-light to-white p-4 border-b border-slate-100">
              <h3 className="text-slate-800 font-semibold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                Ask Instructor Question
              </button>
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                View Class Discussion
              </button>
              <button className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                Request Extension
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            <h2 className="text-slate-800 text-center mb-2 font-semibold">
              {t('assignments.confirmSubmit')}
            </h2>
            <p className="text-slate-600 text-center mb-6">
              {t('assignments.confirmSubmitMessage')}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-900 text-sm mb-1 font-medium">
                    {t('assignments.attachedFiles')}: {attachedFiles.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-medium"
              >
                {t('assignments.cancel')}
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                {t('assignments.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('assignments.success')}</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">{t('assignments.successMessage')}</p>
            <button
              onClick={handleSuccessClose}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-200"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
