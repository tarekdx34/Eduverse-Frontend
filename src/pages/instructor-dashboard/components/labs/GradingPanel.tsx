import React, { useState, useEffect } from 'react';
import { X, User, Clock, FileText, Save, AlertTriangle, Download, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabService } from '../../../../services/api/labService';
import { toast } from 'sonner';
import type { Lab, LabSubmission, GradeFormData } from './types';
import { DEFAULT_GRADE_FORM } from './types';

interface GradingPanelProps {
  isOpen: boolean;
  lab: Lab;
  submission: LabSubmission | null;
  onClose: () => void;
  onGraded: () => void;
}

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

  if (!isOpen || !submission) return null;

  // Debug log to verify new version is loaded
  console.log('🎨 NEW GradingPanel UI loaded - v2.0');

  const maxScore = parseInt(lab.maxScore, 10);
  const studentName = submission.user
    ? `${submission.user.firstName} ${submission.user.lastName}`
    : 'Unknown Student';
  const studentEmail = submission.user?.email || '';
  const isLate = submission.isLate === true;
  const isGraded = submission.score !== null && submission.score !== undefined;
  const scorePercent = formData.score ? Math.round((formData.score / maxScore) * 100) : 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.score === null || formData.score === undefined || String(formData.score).trim() === '') {
      newErrors.score = 'Score is required';
    } else if (isNaN(formData.score)) {
      newErrors.score = 'Must be a valid number';
    } else if (formData.score < 0) {
      newErrors.score = 'Cannot be negative';
    } else if (formData.score > maxScore) {
      newErrors.score = `Cannot exceed ${maxScore}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await LabService.gradeSubmission(lab.id, submission.id, formData.score, formData.feedback);
      toast.success('Grade submitted successfully');
      onGraded();
      onClose();
    } catch (error) {
      console.error('Failed to grade:', error);
      toast.error('Failed to submit grade');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full max-w-2xl h-full flex flex-col shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex-shrink-0 flex items-center justify-between p-6 border-b ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Grade Submission ✨
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Info */}
          <div className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                <User size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {studentName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {studentEmail}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    <Clock size={12} />
                    {new Date(submission.submittedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isLate && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                      <AlertTriangle size={12} />
                      Late
                    </span>
                  )}
                  {isGraded && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600">
                      <CheckCircle2 size={12} />
                      Graded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Content */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Submission
            </h3>
            
            {/* Text Submission */}
            {submission.submissionText && (
              <div className={`rounded-lg border p-4 mb-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Text Submission
                  </span>
                </div>
                <div className={`p-3 rounded border max-h-64 overflow-y-auto ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                  <p className="whitespace-pre-wrap text-sm">{submission.submissionText}</p>
                </div>
              </div>
            )}

            {/* File Submission */}
            {(submission.driveFile || submission.file) && (
              <div className={`rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      File Submission
                      {submission.driveFile && `: ${submission.driveFile.fileName}`}
                      {!submission.driveFile && submission.file && `: ${submission.file.fileName}`}
                    </span>
                  </div>
                  
                  {submission.driveFile?.iframeUrl && (
                    <>
                      <iframe
                        src={submission.driveFile.iframeUrl}
                        className="w-full h-[400px] rounded border border-gray-200 dark:border-white/10 mb-3"
                        title="File Preview"
                      />
                      <div className="flex items-center gap-4">
                        <a
                          href={submission.driveFile.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                        >
                          📎 Open in Drive
                        </a>
                        <a
                          href={submission.driveFile.downloadUrl}
                          className={`text-sm hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                        >
                          ⬇️ Download
                        </a>
                      </div>
                    </>
                  )}
                  
                  {!submission.driveFile && submission.file?.webContentLink && (
                    <a
                      href={submission.file.webContentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 text-sm hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                    >
                      <Download size={16} />
                      Download File
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Score Input */}
            <div>
              <label htmlFor="score" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Score
              </label>
              <div className="relative">
                <input
                  id="score"
                  type="number"
                  min="0"
                  max={maxScore}
                  step="0.5"
                  value={formData.score || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData(prev => ({ ...prev, score: isNaN(val) ? 0 : val }));
                    if (errors.score) setErrors(prev => ({ ...prev, score: '' }));
                  }}
                  placeholder="Enter score"
                  className={`w-full px-4 py-3 pr-20 border rounded-lg focus:outline-none focus:ring-2 text-lg font-medium ${
                    errors.score ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  } ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-gray-300 bg-white placeholder-gray-500'}`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  / {maxScore}
                </div>
              </div>
              
              {errors.score ? (
                <p className="text-xs mt-1 text-red-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.score}
                </p>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Enter a score between 0 and {maxScore}
                  </p>
                  {formData.score > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      scorePercent >= 90 ? 'bg-green-500/10 text-green-600' :
                      scorePercent >= 70 ? 'bg-blue-500/10 text-blue-600' :
                      scorePercent >= 50 ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {scorePercent}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label htmlFor="feedback" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Feedback <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>(Optional)</span>
              </label>
              <textarea
                id="feedback"
                value={formData.feedback}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Provide constructive feedback..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-gray-300 bg-white placeholder-gray-500'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {formData.feedback.length} characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  saving ? 'opacity-50 cursor-not-allowed' : isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !!errors.score}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                  saving || errors.score ? 'opacity-50 cursor-not-allowed bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GradingPanel;
