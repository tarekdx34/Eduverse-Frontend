import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  FileText,
  Save,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabService } from '../../../../services/api/labService';
import { toast } from 'sonner';
import type { Lab, LabSubmission, GradeFormData } from './types';
import { DEFAULT_GRADE_FORM } from './types';

/**
 * Props for the GradingPanel component
 */
interface GradingPanelProps {
  isOpen: boolean;
  lab: Lab;
  submission: LabSubmission | null;
  onClose: () => void;
  onGraded: () => void;
}

/**
 * GradingPanel Component
 * 
 * Modal component for grading a single student submission.
 * Displays submission details and a form to enter score and feedback.
 * 
 * Features:
 * - Student info (name, email)
 * - Submission details (date, late indicator, text, file download)
 * - Grading form with score and feedback inputs
 * - Save button with loading state
 * - Cancel button
 * 
 * @component
 */
export function GradingPanel({
  isOpen,
  lab,
  submission,
  onClose,
  onGraded,
}: GradingPanelProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<GradeFormData>(DEFAULT_GRADE_FORM);
  const [saving, setSaving] = useState(false);

  // Pre-fill form if submission is already graded
  useEffect(() => {
    if (submission) {
      setFormData({
        score: submission.score ? parseFloat(submission.score) : 0,
        feedback: submission.feedback || '',
      });
    } else {
      setFormData(DEFAULT_GRADE_FORM);
    }
  }, [submission]);

  if (!isOpen || !submission) {
    return null;
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.score === null || formData.score === undefined) {
      toast.error(t('pleaseEnterScore') || 'Please enter a score');
      return;
    }

    const maxScoreNum = parseInt(lab.maxScore, 10);
    if (formData.score < 0 || formData.score > maxScoreNum) {
      toast.error(
        t('scoreOutOfRange') ||
          `Score must be between 0 and ${maxScoreNum}`
      );
      return;
    }

    setSaving(true);
    try {
      await LabService.gradeSubmission(
        lab.id,
        submission.id,
        formData.score,
        formData.feedback
      );
      toast.success(t('gradeSubmitted') || 'Grade submitted successfully');
      onGraded();
      onClose();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      toast.error(t('failedToGradeSubmission') || 'Failed to grade submission');
    } finally {
      setSaving(false);
    }
  };

  const studentName = submission.user
    ? `${submission.user.firstName} ${submission.user.lastName}`
    : 'Unknown Student';
  const studentEmail = submission.user?.email || '';
  const submittedDate = new Date(submission.submittedAt).toLocaleString();
  const maxScoreNum = parseInt(lab.maxScore, 10);

  // Determine if submission is late
  const isLate = submission.isLate === true;

  // Determine if submission has file attachment
  const hasFile = submission.file && submission.file.webContentLink;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grading-panel-title"
    >
      <div
        className={`rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark
              ? 'border-white/10 bg-slate-800'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div>
            <h2
              id="grading-panel-title"
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('gradeSubmission') || 'Grade Submission'}
            </h2>
            <p
              className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              {lab.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
              isDark ? 'hover:bg-white' : 'hover:bg-gray-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGradeSubmit} className="p-6 space-y-6">
          {/* Student Information Section */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? 'border-white/10 bg-white/5'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('studentInformation') || 'Student Information'}
            </h3>
            <div className="space-y-2">
              {/* Student Name */}
              <div className="flex items-center gap-2">
                <User
                  className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {t('name') || 'Name'}:
                  </span>{' '}
                  {studentName}
                </span>
              </div>

              {/* Student Email */}
              {studentEmail && (
                <div className="flex items-center gap-2">
                  <FileText
                    className={`w-4 h-4 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-medium">
                      {t('email') || 'Email'}:
                    </span>{' '}
                    <a
                      href={`mailto:${studentEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {studentEmail}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submission Details Section */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? 'border-white/10 bg-white/5'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('submissionDetails') || 'Submission Details'}
            </h3>
            <div className="space-y-3">
              {/* Submission Date */}
              <div className="flex items-center gap-2">
                <Calendar
                  className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {t('submittedAt') || 'Submitted At'}:
                  </span>{' '}
                  {submittedDate}
                </span>
              </div>

              {/* Late Indicator */}
              {isLate && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t('submissionIsLate') ||
                      'This submission is late'}
                  </span>
                </div>
              )}

              {/* Submission Text */}
              {submission.submissionText && (
                <div>
                  <span
                    className={`text-sm font-medium block mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}
                  >
                    {t('submissionText') || 'Submission Text'}:
                  </span>
                  <div
                    className={`p-3 rounded text-sm max-h-48 overflow-y-auto whitespace-pre-wrap ${
                      isDark
                        ? 'bg-white/5 text-slate-300 border border-white/10'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {submission.submissionText}
                  </div>
                </div>
              )}

              {/* File Download Link */}
              {hasFile && (
                <div>
                  <a
                    href={submission.file!.webContentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {t('downloadSubmissionFile') ||
                      'Download Submission File'}{' '}
                    ({submission.file!.fileName})
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Grading Form Section */}
          <div className="space-y-4">
            {/* Score Input */}
            <div>
              <label
                htmlFor="grade-score"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('score') || 'Score'} /{' '}
                <span className="font-semibold">{maxScoreNum}</span>
              </label>
              <input
                id="grade-score"
                type="number"
                min="0"
                max={maxScoreNum}
                step="0.5"
                value={formData.score}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    score: isNaN(value) ? 0 : value,
                  }));
                }}
                placeholder={`${t('enterScore') || 'Enter score'} (0-${maxScoreNum})`}
                aria-label={`${t('score') || 'Score'} out of ${maxScoreNum}`}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    : 'border-gray-300 bg-white placeholder-gray-500'
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {t('scoreRange') || `Enter a score between 0 and ${maxScoreNum}`}
              </p>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label
                htmlFor="grade-feedback"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('feedback') || 'Feedback'}
              </label>
              <textarea
                id="grade-feedback"
                value={formData.feedback}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    feedback: e.target.value,
                  }))
                }
                placeholder={
                  t('enterFeedback') ||
                  'Enter feedback for the student (optional)...'
                }
                rows={4}
                aria-label={t('feedback') || 'Feedback'}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    : 'border-gray-300 bg-white placeholder-gray-500'
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {t('feedbackHelp') ||
                  'Provide constructive feedback to help the student improve'}
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className={`flex items-center justify-between gap-4 p-6 border-t ${
            isDark
              ? 'border-white/10 bg-slate-800'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saving
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                  ? 'text-slate-300 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleGradeSubmit}
            disabled={saving}
            aria-label={t('saveGrade') || 'Save Grade'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saving
                ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? t('saving') || 'Saving...' : t('saveGrade') || 'Save Grade'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GradingPanel;
