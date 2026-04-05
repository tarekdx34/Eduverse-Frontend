/**
 * GradingPanel - Manual grading interface for essay and short answer questions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  X,
  FileText,
  Type,
  CheckCircle,
  Send,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import QuizService from '../../../../services/api/quizService';
import { GradeSubmission, PendingGradingQuestion } from './types';

interface GradingPanelProps {
  attemptId: string;
  onClose: () => void;
  onGraded: () => void;
}

interface PendingQuestion {
  questionId: number;
  questionText: string;
  questionType: string;
  answerText: string;
  maxPoints: number;
  pointsEarned: number;
  feedback: string;
}

export function GradingPanel({ attemptId, onClose, onGraded }: GradingPanelProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shared classes
  const overlayBg = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  const cardCls = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-2'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2';

  // Fetch pending questions
  useEffect(() => {
    async function loadPendingQuestions() {
      try {
        setLoading(true);
        setError(null);
        const data = await QuizService.getPendingGrading(attemptId);
        
        // Map to local state with editing fields
        const mapped: PendingQuestion[] = (data.questions || data || []).map((q: any) => ({
          questionId: q.questionId || q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          answerText: q.answerText || q.answer?.answerText || '',
          maxPoints: parseFloat(q.points || q.maxPoints) || 10,
          pointsEarned: 0,
          feedback: '',
        }));

        if (mapped.length === 0) {
          setError('No questions pending grading.');
        }
        
        setQuestions(mapped);
      } catch (err) {
        console.error('Failed to load pending questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    }

    loadPendingQuestions();
  }, [attemptId]);

  // Update grade for current question
  const updateGrade = useCallback((field: 'pointsEarned' | 'feedback', value: number | string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === currentIndex ? { ...q, [field]: value } : q))
    );
  }, [currentIndex]);

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Submit all grades
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const grades: GradeSubmission[] = questions.map((q) => ({
        questionId: q.questionId,
        pointsEarned: q.pointsEarned,
        feedback: q.feedback || undefined,
      }));

      await QuizService.gradeAttempt('', attemptId, grades);
      toast.success('Grades submitted successfully');
      onGraded();
      onClose();
    } catch (err) {
      console.error('Failed to submit grades:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit grades';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const allGraded = questions.every((q) => q.pointsEarned >= 0);

  return (
    <div className={overlayBg} onClick={onClose}>
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border ${cardCls}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${headingCls}`}>
            Manual Grading
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Close"
          >
            <X size={20} className={subCls} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin mb-4" size={32} style={{ color: primaryHex }} />
            <p className={subCls}>Loading questions...</p>
          </div>
        ) : error && questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 text-yellow-500" size={32} />
            <p className={subCls}>{error}</p>
          </div>
        ) : (
          <>
            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {questions.map((q, i) => (
                <button
                  key={q.questionId}
                  onClick={() => goToQuestion(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    i === currentIndex
                      ? 'text-white'
                      : q.pointsEarned > 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : `${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-700'}`
                  }`}
                  style={i === currentIndex ? { backgroundColor: primaryHex } : {}}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="space-y-4">
                {/* Question Info */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {currentQuestion.questionType === 'essay' ? (
                      <FileText size={16} style={{ color: primaryHex }} />
                    ) : (
                      <Type size={16} style={{ color: primaryHex }} />
                    )}
                    <span className={`text-sm font-medium ${headingCls}`}>
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} ${subCls}`}>
                      {currentQuestion.questionType === 'essay' ? 'Essay' : 'Short Answer'}
                    </span>
                    <span className={`text-xs ${subCls} ml-auto`}>
                      Max: {currentQuestion.maxPoints} pts
                    </span>
                  </div>
                  <p className={`text-sm ${headingCls}`}>
                    {currentQuestion.questionText}
                  </p>
                </div>

                {/* Student Answer */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${subCls}`}>
                    Student's Answer
                  </label>
                  <div className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                    <p className={`text-sm whitespace-pre-wrap ${headingCls}`}>
                      {currentQuestion.answerText || <em className={subCls}>No answer provided</em>}
                    </p>
                  </div>
                </div>

                {/* Points Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${subCls}`}>
                    Points Earned (max {currentQuestion.maxPoints})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={currentQuestion.maxPoints}
                      step={0.5}
                      value={currentQuestion.pointsEarned}
                      onChange={(e) => updateGrade('pointsEarned', Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: primaryHex }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={currentQuestion.maxPoints}
                      step={0.5}
                      value={currentQuestion.pointsEarned}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), currentQuestion.maxPoints);
                        updateGrade('pointsEarned', Math.max(0, val));
                      }}
                      className={`w-20 px-3 py-2 text-center border rounded-lg focus:outline-none ${inputCls}`}
                    />
                    <span className={subCls}>/ {currentQuestion.maxPoints}</span>
                  </div>
                  {/* Quick grade buttons */}
                  <div className="flex gap-2 mt-2">
                    {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                      const pts = Math.round(currentQuestion.maxPoints * fraction * 2) / 2;
                      return (
                        <button
                          key={fraction}
                          onClick={() => updateGrade('pointsEarned', pts)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            currentQuestion.pointsEarned === pts
                              ? 'text-white'
                              : `${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                          }`}
                          style={currentQuestion.pointsEarned === pts ? { backgroundColor: primaryHex } : {}}
                        >
                          {Math.round(fraction * 100)}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${subCls}`}>
                    <MessageSquare size={14} className="inline mr-1" />
                    Feedback (optional)
                  </label>
                  <textarea
                    value={currentQuestion.feedback}
                    onChange={(e) => updateGrade('feedback', e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none resize-none ${inputCls}`}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {error}
              </div>
            )}

            {/* Navigation & Submit */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !allGraded}
                className="flex items-center gap-2 px-6 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryHex }}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {submitting ? 'Submitting...' : 'Submit Grades'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
