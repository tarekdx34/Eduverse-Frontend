import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LabSubmission } from '../../../services/api/labService';

interface GradingModalProps {
  isOpen: boolean;
  labTitle: string;
  submissions: LabSubmission[];
  onGrade: (submissionId: string, score: number, feedback: string) => void;
  onClose: () => void;
}

export function GradingModal({
  isOpen,
  labTitle,
  submissions,
  onGrade,
  onClose,
}: GradingModalProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    submissions[0]?.id || null
  );
  const [gradeScore, setGradeScore] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Accessibility: refs and state for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management - focus modal on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 0);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Keyboard handler for Escape and focus trap
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const selectedSubmission = submissions.find((s) => s.id === selectedSubmissionId);

  const handleGradeSubmit = async () => {
    if (!selectedSubmissionId || !gradeScore) {
      alert(t('pleaseEnterScore') || 'Please enter a score');
      return;
    }

    setSaving(true);
    try {
      await onGrade(selectedSubmissionId, parseFloat(gradeScore), gradeFeedback);
      setGradeScore('');
      setGradeFeedback('');
    } finally {
      setSaving(false);
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.submissionStatus === 'submitted');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="grading-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto outline-none ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}
        >
          <div>
            <h2
              id="grading-modal-title"
              className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {t('gradeSubmissions') || 'Grade Submissions'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{labTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-gray-200'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div
              className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
            >
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noSubmissionsToGrade') || 'All submissions have been graded'}
              </p>
            </div>
          ) : (
            <>
              {/* Submissions List */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  {t('selectSubmission') || 'Select Submission'}
                </label>
                <div
                  className={`border rounded-lg overflow-y-auto max-h-48 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white'}`}
                >
                  {submissions.map((submission) => (
                    <button
                      key={submission.id}
                      onClick={() => {
                        setSelectedSubmissionId(submission.id);
                        setGradeScore('');
                        setGradeFeedback('');
                      }}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${
                        selectedSubmissionId === submission.id
                          ? isDark
                            ? 'bg-blue-500/20 border-white/10'
                            : 'bg-blue-50 border-gray-200'
                          : isDark
                            ? 'border-white/10 hover:bg-white/5'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {submission.user?.firstName} {submission.user?.lastName}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString()
                          : 'Not submitted'}
                      </div>
                      {submission.submissionStatus !== 'submitted' && (
                        <div
                          className={`text-xs font-medium ${submission.score ? 'text-green-600' : 'text-gray-500'}`}
                        >
                          {submission.score ? `Score: ${submission.score}/${100}` : 'Graded'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubmission && (
                <>
                  {/* Submission Details */}
                  <div
                    className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('submissionDetails') || 'Submission Details'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        <span className="font-medium">{t('student') || 'Student'}:</span>{' '}
                        {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
                      </div>
                      <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        <span className="font-medium">{t('submittedAt') || 'Submitted At'}:</span>{' '}
                        {selectedSubmission.submittedAt
                          ? new Date(selectedSubmission.submittedAt).toLocaleString()
                          : 'Not submitted'}
                      </div>
                      {selectedSubmission.submissionText && (
                        <div>
                          <span className="font-medium block mb-1">
                            {t('submission') || 'Submission'}:
                          </span>
                          <div
                            className={`p-2 rounded text-sm max-h-32 overflow-y-auto ${isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-gray-700'}`}
                          >
                            {selectedSubmission.submissionText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grading Form */}
                  <div className="space-y-4">
                    {/* Score */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        {t('score') || 'Score'} / 100
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="Enter score (0-100)"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>

                    {/* Feedback */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        {t('feedback') || 'Feedback'}
                      </label>
                      <textarea
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder={t('enterFeedback') || 'Enter feedback for the student...'}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between p-6 border-t ${isDark ? 'border-white/10 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}
        >
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {pendingSubmissions.length} {t('pendingSubmissions') || 'pending submissions'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('close') || 'Close'}
            </button>
            {selectedSubmission && selectedSubmission.submissionStatus === 'submitted' && (
              <button
                onClick={handleGradeSubmit}
                disabled={saving || !gradeScore}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  saving || !gradeScore
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? t('saving') || 'Saving...' : t('saveGrade') || 'Save Grade'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradingModal;
