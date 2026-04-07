import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  FileText,
  Save,
  AlertTriangle,
  Download,
  Clock,
  CheckCircle,
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form if submission is already graded
  useEffect(() => {
    if (submission) {
      setFormData({
        score: submission.score ? parseFloat(submission.score) : 0,
        feedback: submission.feedback || '',
      });
      setErrors({});
    } else {
      setFormData(DEFAULT_GRADE_FORM);
      setErrors({});
    }
  }, [submission]);

  if (!isOpen || !submission) {
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const maxScoreNum = parseInt(lab.maxScore, 10);

    if (formData.score === null || formData.score === undefined || formData.score === '') {
      newErrors.score = t('scoreRequired') || 'Score is required';
    } else if (isNaN(formData.score)) {
      newErrors.score = t('scoreMustBeNumber') || 'Score must be a valid number';
    } else if (formData.score < 0) {
      newErrors.score = t('scoreCannotBeNegative') || 'Score cannot be negative';
    } else if (formData.score > maxScoreNum) {
      newErrors.score = t('scoreExceedsMax') || `Score cannot exceed ${maxScoreNum}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
  const submittedDate = new Date(submission.submittedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const maxScoreNum = parseInt(lab.maxScore, 10);

  // Determine if submission is late
  const isLate = submission.isLate === true;

  // Determine if already graded
  const isAlreadyGraded = submission.score !== null && submission.score !== undefined;

  // Determine if submission has file attachment (prioritize driveFile)
  const hasDriveFile = submission.driveFile && submission.driveFile.iframeUrl;
  const hasLegacyFile = submission.file && submission.file.webContentLink;

  // Calculate score percentage
  const scorePercentage = formData.score ? Math.round((formData.score / maxScoreNum) * 100) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-end z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grading-panel-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl h-full overflow-y-auto shadow-2xl ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header - Sticky */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
            isDark
              ? 'bg-slate-900 border-white/10'
              : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <h2
              id="grading-panel-title"
              className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('gradeSubmission') || 'Grade Submission'}
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              {lab.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleGradeSubmit} className="p-6 space-y-6">
          {/* Student Information Section */}
          <div
            className={`rounded-lg border p-4 ${
              isDark
                ? 'border-white/10 bg-white/5'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'}`}
              >
                <User size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {studentName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {studentEmail}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div
                    className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                  >
                    <Clock size={12} />
                    {submittedDate}
                  </div>
                  {isLate && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <AlertTriangle size={12} />
                      {t('late') || 'Late'}
                    </span>
                  )}
                  {isAlreadyGraded && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                      <CheckCircle size={12} />
                      {t('graded') || 'Graded'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Content Section */}
          <div>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('submission') || 'Submission'}
            </h3>
            <div
              className={`rounded-lg border p-4 ${
                isDark
                  ? 'border-white/10 bg-white/5'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >

              {/* Text Submission */}
              {submission.submissionText && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      size={16}
                      className={isDark ? 'text-slate-400' : 'text-gray-600'}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      {t('textSubmission') || 'Text Submission'}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded border max-h-64 overflow-y-auto ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-slate-300'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{submission.submissionText}</p>
                  </div>
                </div>
              )}

              {/* File Submission - prioritize driveFile with preview */}
              {(hasDriveFile || hasLegacyFile) && (
                <div className={submission.submissionText ? 'mt-4' : ''}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      size={16}
                      className={isDark ? 'text-slate-400' : 'text-gray-600'}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      {t('fileSubmission') || 'File Submission'}
                      {hasDriveFile && `: ${submission.driveFile!.fileName}`}
                      {!hasDriveFile && hasLegacyFile && `: ${submission.file!.fileName}`}
                    </span>
                  </div>
                  <div
                    className={`rounded border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                    }`}
                  >
                    {hasDriveFile ? (
                      <div className="space-y-3">
                        <iframe
                          src={submission.driveFile!.iframeUrl}
                          className="w-full h-[400px] rounded-t border-b border-gray-200 dark:border-white/10"
                          title="Submission Preview"
                        />
                        <div className="flex items-center gap-4 p-3">
                          <a
                            href={submission.driveFile!.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm hover:underline ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                          >
                            📎 {t('openInDrive') || 'Open in Drive'}
                          </a>
                          <a
                            href={submission.driveFile!.downloadUrl}
                            className={`text-sm hover:underline ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                          >
                            ⬇️ {t('download') || 'Download'}
                          </a>
                        </div>
                      </div>
                    ) : hasLegacyFile ? (
                      <div className="p-3">
                        <a
                          href={submission.file!.webContentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 hover:underline ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          }`}
                        >
                          <Download size={16} />
                          {t('downloadFile') || 'Download File'}
                        </a>
                      </div>
                    ) : null}
                  </div>
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
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('score') || 'Score'}
              </label>
              <div className="relative">
                <input
                  id="grade-score"
                  type="number"
                  min="0"
                  max={maxScoreNum}
                  step="0.5"
                  value={formData.score || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      score: value === '' ? 0 : (isNaN(value as number) ? 0 : value as number),
                    }));
                    // Clear error on change
                    if (errors.score) {
                      setErrors((prev) => ({ ...prev, score: '' }));
                    }
                  }}
                  placeholder={`${t('enterScore') || 'Enter score'}`}
                  aria-label={`${t('score') || 'Score'} out of ${maxScoreNum}`}
                  aria-invalid={!!errors.score}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-medium ${
                    errors.score
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-blue-500'
                  } ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                      : 'border-gray-300 bg-white placeholder-gray-500'
                  }`}
                />
                <div
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  / {maxScoreNum}
                </div>
              </div>
              {errors.score ? (
                <p className="text-xs mt-1 text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.score}
                </p>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {t('scoreRange') || `Enter a score between 0 and ${maxScoreNum}`}
                  </p>
                  {formData.score > 0 && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        scorePercentage >= 90
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : scorePercentage >= 70
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : scorePercentage >= 50
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {scorePercentage}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Feedback Textarea */}
            <div>
              <label
                htmlFor="grade-feedback"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('feedback') || 'Feedback'}{' '}
                <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  ({t('optional') || 'Optional'})
                </span>
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
                  'Provide constructive feedback to help the student improve...'
                }
                rows={5}
                aria-label={t('feedback') || 'Feedback'}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
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
                {formData.feedback.length} {t('characters') || 'characters'}
              </p>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div
            className={`sticky bottom-0 flex items-center justify-between gap-4 p-6 border-t ${
              isDark
                ? 'border-white/10 bg-slate-900'
                : 'border-gray-200 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                saving
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'text-slate-300 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              onClick={handleGradeSubmit}
              disabled={saving || !!errors.score}
              aria-label={t('saveGrade') || 'Save Grade'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                saving || errors.score
                  ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? t('saving') || 'Saving...' : t('saveGrade') || 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradingPanel;
