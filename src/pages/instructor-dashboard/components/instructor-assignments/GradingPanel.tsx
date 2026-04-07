import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, Clock, FileText, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { LateBadge } from '../shared';
import type { AssignmentSubmission } from '../../../../services/api/assignmentService';

interface GradingPanelProps {
  submission: AssignmentSubmission | null;
  maxScore: number;
  latePenalty?: number;
  onClose: () => void;
  onSave: (submissionId: string, score: number, feedback: string) => Promise<void>;
}

export function GradingPanel({
  submission,
  maxScore,
  latePenalty = 0,
  onClose,
  onSave,
}: GradingPanelProps) {
  const { isDark } = useTheme();
  const { primaryHex = '#4f46e5' } = useTheme() as any;

  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (submission) {
      setScore(submission.score !== undefined && submission.score !== null ? String(submission.score) : '');
      setFeedback(submission.feedback || '');
      setErrors({});
    }
  }, [submission]);

  const calculateAdjustedScore = () => {
    if (!submission || !score) return null;

    const rawScore = Number(score);
    if (isNaN(rawScore)) return null;

    // If late and late penalty is set
    if ((submission.isLate === 1 || submission.isLate === true) && latePenalty > 0) {
      const penalty = (rawScore * latePenalty) / 100;
      const adjustedScore = Math.max(0, rawScore - penalty);
      return {
        raw: rawScore,
        penalty,
        adjusted: adjustedScore,
      };
    }

    return {
      raw: rawScore,
      penalty: 0,
      adjusted: rawScore,
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!score.trim()) {
      newErrors.score = 'Score is required';
    } else {
      const numScore = Number(score);
      if (isNaN(numScore)) {
        newErrors.score = 'Score must be a number';
      } else if (numScore < 0) {
        newErrors.score = 'Score cannot be negative';
      } else if (numScore > maxScore) {
        newErrors.score = `Score cannot exceed ${maxScore}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submission || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const adjustedScoreData = calculateAdjustedScore();
      const finalScore = adjustedScoreData?.adjusted ?? Number(score);
      await onSave(submission.id, finalScore, feedback);
      onClose();
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission) return null;

  const adjustedScoreData = calculateAdjustedScore();
  const isLate = submission.isLate === 1 || submission.isLate === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
      <div
        className={`w-full max-w-2xl h-full overflow-y-auto shadow-2xl ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
            isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Grade Submission
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Review and grade student work
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div
            className={`rounded-lg border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
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
                  {submission.user?.firstName} {submission.user?.lastName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {submission.user?.email}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                  >
                    <Clock size={12} />
                    {new Date(submission.submittedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {isLate && <LateBadge isLate={true} />}
                  {submission.attemptNumber && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      Attempt #{submission.attemptNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Content */}
          <div>
            <h3
              className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Submission
            </h3>
            <div
              className={`rounded-lg border p-4 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
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
                      className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                    >
                      Text Submission
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-slate-300'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{submission.submissionText}</p>
                  </div>
                </div>
              )}

              {/* Link Submission */}
              {submission.submissionLink && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon
                      size={16}
                      className={isDark ? 'text-slate-400' : 'text-gray-600'}
                    />
                    <span
                      className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                    >
                      Link Submission
                    </span>
                  </div>
                  <a
                    href={submission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block p-3 rounded border text-sm hover:underline ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-indigo-400'
                        : 'bg-white border-gray-200 text-indigo-600'
                    }`}
                  >
                    {submission.submissionLink}
                  </a>
                </div>
              )}

              {/* File Submission - prioritize driveFile */}
              {(submission.driveFile || submission.fileId) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      size={16}
                      className={isDark ? 'text-slate-400' : 'text-gray-600'}
                    />
                    <span
                      className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                    >
                      File Submission{submission.driveFile ? `: ${submission.driveFile.fileName}` : ''}
                    </span>
                  </div>
                  <div
                    className={`rounded border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                    }`}
                  >
                    {submission.driveFile ? (
                      <div className="space-y-3">
                        <iframe
                          src={submission.driveFile.iframeUrl}
                          className="w-full h-[400px] rounded-t border-b border-gray-200 dark:border-white/10"
                          title="Submission Preview"
                        />
                        <div className="flex items-center gap-4 p-3">
                          <a
                            href={submission.driveFile.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm hover:underline ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                          >
                            📎 Open in Drive
                          </a>
                          <a
                            href={submission.driveFile.downloadUrl}
                            className={`text-sm hover:underline ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                          >
                            ⬇️ Download
                          </a>
                        </div>
                      </div>
                    ) : submission.file ? (
                      <div className="p-3">
                        <a
                          href={submission.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm hover:underline ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          }`}
                        >
                          {submission.file.name || `File ID: ${submission.fileId}`}
                        </a>
                      </div>
                    ) : (
                      <div className="p-3">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          File ID: {submission.fileId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!submission.submissionText && !submission.submissionLink && !submission.fileId && !submission.driveFile && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  No submission content available
                </p>
              )}
            </div>
          </div>

          {/* Score Input */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Score (out of {maxScore}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max={maxScore}
              step="0.5"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.score ? 'border-red-500' : ''}`}
              placeholder="Enter score"
            />
            {errors.score && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.score}
              </p>
            )}

            {/* Late Penalty Calculation */}
            {isLate && latePenalty > 0 && adjustedScoreData && score && !errors.score && (
              <div
                className={`mt-3 p-3 rounded-lg border ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <p
                  className={`text-sm font-medium mb-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}
                >
                  Late Penalty Applied
                </p>
                <div className={`text-xs space-y-1 ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                  <div className="flex justify-between">
                    <span>Original Score:</span>
                    <span className="font-medium">{adjustedScoreData.raw.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penalty ({latePenalty}%):</span>
                    <span className="font-medium">-{adjustedScoreData.penalty.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between pt-2 border-t font-semibold ${
                      isDark ? 'border-amber-500/30' : 'border-amber-300'
                    }`}
                  >
                    <span>Final Score:</span>
                    <span>{adjustedScoreData.adjusted.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Provide feedback to the student..."
            />
          </div>

          {/* Previously Graded Info */}
          {submission.gradedAt && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              Previously graded on{' '}
              {new Date(submission.gradedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryHex }}
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradingPanel;
