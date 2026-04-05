import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  User,
  Eye,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import AssignmentService, {
  Assignment,
  AssignmentSubmission,
} from '../../../services/api/assignmentService';
import { toast } from 'sonner';

type GradingSubmission = AssignmentSubmission & {
  assignmentTitle?: string;
  assignmentMaxScore?: string;
};

type AssignmentGradingPageProps = {
  courseId?: string;
};

export function AssignmentGradingPage({ courseId }: AssignmentGradingPageProps) {
  const { isDark } = useTheme() as any;
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<GradingSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<GradingSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Check if user is TA
  const isTa = user?.roles?.includes('teaching_assistant');

  useEffect(() => {
    if (!isTa) {
      toast.error(t('cannotAccessAsTA') || 'You do not have permission to access this feature.');
      return;
    }
    loadAssignmentsAndSubmissions();
  }, [courseId, isTa]);

  const loadAssignmentsAndSubmissions = async () => {
    try {
      setLoading(true);
      const assignmentsData = await AssignmentService.getAll(courseId ? { courseId } : undefined);
      setAssignments(assignmentsData);

      // Get all submissions for all assignments
      const allSubmissions: GradingSubmission[] = [];
      for (const assignment of assignmentsData) {
        try {
          const subs = await AssignmentService.getSubmissions(assignment.id);
          allSubmissions.push(
            ...subs.map((sub) => ({
              ...sub,
              assignmentTitle: assignment.title,
              assignmentMaxScore: assignment.maxScore,
            }))
          );
        } catch (error) {
          // Some assignments might have no submissions yet
        }
      }
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error(t('errorLoadingAssignments') || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    return sub.submissionStatus === filter;
  });

  const pendingCount = submissions.filter((s) => s.submissionStatus === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.submissionStatus === 'graded').length;

  const handleGradeSubmit = async () => {
    if (!selectedSubmission || !gradeInput) {
      toast.error(t('required') || 'Grade is required');
      return;
    }

    try {
      setGrading(true);
      const score = parseFloat(gradeInput);

      if (isNaN(score) || score < 0) {
        toast.error(t('invalidInput') || 'Invalid score');
        return;
      }

      // Find the assignment for this submission
      const assignment = assignments.find((a) => a.id === selectedSubmission.assignmentId);
      if (!assignment) {
        toast.error(t('assignmentNotFound') || 'Assignment not found');
        return;
      }

      await AssignmentService.gradeSubmission(
        selectedSubmission.assignmentId,
        selectedSubmission.id,
        score,
        feedbackInput
      );

      toast.success(t('successGraded') || 'Submission graded successfully');
      setSelectedSubmission(null);
      setGradeInput('');
      setFeedbackInput('');
      await loadAssignmentsAndSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(t('errorGradingSubmission') || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  if (!isTa) {
    return (
      <div
        className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <AlertCircle
          className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-500' : 'text-red-400'}`}
        />
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          {t('cannotAccessAsTA') || 'Access denied'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('grading') || 'Grading'}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('gradeAssignmentSubmissions') || 'Grade assignment submissions'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
              <span className="font-semibold">{pendingCount}</span> {t('pending') || 'Pending'}
            </div>
          </div>
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-900'}`}>
              <span className="font-semibold">{gradedCount}</span> {t('graded') || 'Graded'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex gap-2">
          {(['all', 'submitted', 'graded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              aria-label={`Filter by ${status} status`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all'
                ? t('all') || 'All'
                : status === 'submitted'
                  ? t('submitted') || 'Submitted'
                  : t('graded') || 'Graded'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <Loader
            className={`w-12 h-12 mx-auto mb-4 animate-spin ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
          />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            {t('loading') || 'Loading...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('submissions') || 'Submissions'}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div
                  className={`text-center py-8 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                >
                  <FileText
                    className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                  />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {t('noSubmissionsFound') || 'No submissions found'}
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGradeInput(submission.score || '');
                      setFeedbackInput(submission.feedback || '');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? isDark
                          ? 'bg-indigo-600/20 border-indigo-600'
                          : 'bg-indigo-50 border-indigo-300'
                        : isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    aria-label={`Select submission from ${submission.user?.firstName} ${submission.user?.lastName}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {submission.user?.firstName} {submission.user?.lastName}
                        </p>
                        <p
                          className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          {submission.assignmentTitle}
                        </p>
                      </div>
                      {submission.submissionStatus === 'graded' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Submission Details & Grading Form */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div
                className={`border rounded-lg p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {selectedSubmission.assignmentTitle}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedSubmission.submissionStatus === 'graded'
                          ? isDark
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-800'
                          : isDark
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                      role="status"
                    >
                      {selectedSubmission.submissionStatus === 'graded'
                        ? t('graded') || 'Graded'
                        : t('submitted') || 'Submitted'}
                    </span>
                  </div>

                  {/* Submission Details */}
                  <div
                    className={`mb-4 p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedSubmission.isLate ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span
                          className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}
                        >
                          {t('lateSubmission') || 'Late submission'}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Submission Content */}
                  {selectedSubmission.submissionText && (
                    <div
                      className={`mb-4 p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <h4
                        className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {t('submissionText') || 'Submission Text'}:
                      </h4>
                      <p
                        className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-400' : 'text-gray-700'}`}
                      >
                        {selectedSubmission.submissionText}
                      </p>
                    </div>
                  )}

                  {/* Files */}
                  {selectedSubmission.fileId && (
                    <div
                      className={`mb-4 p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <h4
                        className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {t('submittedFiles') || 'Submitted Files'}:
                      </h4>
                      <div
                        className={`flex items-center gap-2 p-2 border rounded ${isDark ? 'border-white/10' : 'border-gray-300'}`}
                      >
                        <FileText
                          className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                        />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {t('file') || 'File'} #{selectedSubmission.fileId}
                        </span>
                        <button
                          className="ml-auto text-blue-600 hover:text-blue-700"
                          aria-label="Download submission file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grading Form */}
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="grade-input"
                        className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        {t('grade') || 'Grade'} / {selectedSubmission.assignmentMaxScore || '100'}
                      </label>
                      <input
                        id="grade-input"
                        type="number"
                        min="0"
                        max={parseFloat(selectedSubmission.assignmentMaxScore || '100')}
                        step="0.5"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        aria-label="Enter grade for submission"
                        aria-describedby="grade-help"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                        }`}
                        placeholder="0"
                        disabled={grading}
                      />
                      <p
                        id="grade-help"
                        className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {t('enterValidScore') || 'Enter a valid score'}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="feedback-input"
                        className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        {t('feedback') || 'Feedback'}
                      </label>
                      <textarea
                        id="feedback-input"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        aria-label="Enter feedback for submission"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                        }`}
                        placeholder={t('provideFeedback') || 'Provide constructive feedback...'}
                        disabled={grading}
                      />
                    </div>

                    {selectedSubmission.submissionStatus === 'graded' &&
                      selectedSubmission.feedback && (
                        <div
                          className={`p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <h4
                            className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {t('previousFeedback') || 'Previous Feedback'}:
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                            {selectedSubmission.feedback}
                          </p>
                        </div>
                      )}

                    <button
                      onClick={handleGradeSubmit}
                      disabled={grading || !gradeInput}
                      aria-disabled={grading || !gradeInput}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        grading || !gradeInput
                          ? isDark
                            ? 'bg-indigo-600/50 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-300 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {grading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          {t('submitting') || 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          {t('submitGrade') || 'Submit Grade'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <FileText
                  className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                />
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  {t('selectSubmissionToGrade') || 'Select a submission to grade'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentGradingPage;
