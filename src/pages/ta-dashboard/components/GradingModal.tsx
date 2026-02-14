import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Submission = {
  id: string;
  studentName: string;
  grade?: number;
  feedback?: string;
  status: string;
};

type GradingModalProps = {
  submission: Submission | null;
  onClose: () => void;
  onSave: (grade: number, feedback: string) => void;
};

export function GradingModal({ submission, onClose, onSave }: GradingModalProps) {
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade ?? 0);
      setFeedback(submission.feedback ?? '');
    }
  }, [submission]);

  const cardCls = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
    : 'bg-gray-50 border-gray-300 text-gray-900';
  const btnPrimary = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const btnSecondary = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(grade, feedback);
  };

  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`${cardCls} border rounded-xl shadow-xl max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${textCls}`}>
            {submission.status === 'graded' ? t('editGrade') : t('manualGrade')} – {submission.studentName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg ${mutedCls} ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="grading-score" className={`block text-sm font-medium ${textCls} mb-1`}>Score (%)</label>
            <input
              id="grading-score"
              type="number"
              min={0}
              max={100}
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
              autoFocus
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('feedback')}</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
              placeholder="Optional feedback for the student..."
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg ${btnSecondary} text-sm font-medium`}>
              {t('cancel')}
            </button>
            <button type="submit" className={`px-4 py-2 rounded-lg ${btnPrimary} text-sm font-medium`}>
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
