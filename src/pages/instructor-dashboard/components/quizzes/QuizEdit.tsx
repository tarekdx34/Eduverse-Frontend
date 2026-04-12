/**
 * QuizEdit - Modal form for editing an existing quiz
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Loader2, Plus, Calendar, Clock, Users, CheckSquare, Shuffle, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CleanSelect } from '../../../../components/shared';
import { QuestionEditor } from './QuestionEditor';
import QuizService, { Quiz, QuizQuestion } from '../../../../services/api/quizService';
import {
  QuizUIData,
  QuizFormData,
  QuestionFormData,
  DEFAULT_QUIZ_FORM,
  DEFAULT_QUESTION_FORM,
} from './types';

interface QuizEditProps {
  quiz: QuizUIData;
  courseOptions: { value: string; label: string }[];
  fetchQuizDetails: (quizId: string) => Promise<Quiz & { questions?: QuizQuestion[] }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuizEdit({
  quiz,
  courseOptions,
  fetchQuizDetails,
  onSuccess,
  onCancel,
}: QuizEditProps) {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Form state
  const [formData, setFormData] = useState<QuizFormData>({
    ...DEFAULT_QUIZ_FORM,
    title: quiz.title,
    description: quiz.description || '',
    courseId: quiz.courseId,
    timeLimitMinutes: quiz.timeLimitMinutes,
    maxAttempts: quiz.maxAttempts,
    passingScore: quiz.passingScore,
    randomizeQuestions: quiz.randomizeQuestions,
    randomizeOptions: quiz.randomizeOptions,
    showCorrectAnswers: quiz.showCorrectAnswers,
    availableFrom: quiz.availableFrom ? quiz.availableFrom.slice(0, 16) : '',
    availableUntil: quiz.availableUntil ? quiz.availableUntil.slice(0, 16) : '',
  });
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [originalQuestionIds, setOriginalQuestionIds] = useState<Set<string>>(new Set());
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  // Load full quiz details with questions
  useEffect(() => {
    async function loadQuiz() {
      try {
        setIsLoading(true);
        const fullQuiz = await fetchQuizDetails(quiz.id);

        // Map questions to form data
        const mappedQuestions: QuestionFormData[] = (fullQuiz.questions || []).map((q) => ({
          id: q.id,
          questionType: q.questionType || 'mcq',
          questionText: q.questionText,
          options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
          correctAnswer: q.correctAnswer || '0',
          matchingPairs: [],
          points: parseFloat(q.points) || 10,
          explanation: q.explanation || '',
          orderIndex: q.orderIndex,
        }));

        setQuestions(mappedQuestions.length > 0 ? mappedQuestions : [{ ...DEFAULT_QUESTION_FORM, tempId: Date.now() }]);
        setOriginalQuestionIds(new Set(mappedQuestions.map((q) => q.id!).filter(Boolean)));

        // Update form data with latest from server
        setFormData({
          title: fullQuiz.title,
          description: fullQuiz.description || '',
          courseId: fullQuiz.courseId,
          timeLimitMinutes: fullQuiz.timeLimitMinutes,
          maxAttempts: fullQuiz.maxAttempts,
          passingScore: fullQuiz.passingScore ? parseFloat(fullQuiz.passingScore) : null,
          randomizeQuestions: !!fullQuiz.randomizeQuestions,
          randomizeOptions: false,
          showCorrectAnswers: !!fullQuiz.showCorrectAnswers,
          showAnswersAfter:
            fullQuiz.showAnswersAfter === 'immediately'
              ? 'immediate'
              : fullQuiz.showAnswersAfter || 'immediate',
          availableFrom: fullQuiz.availableFrom ? fullQuiz.availableFrom.slice(0, 16) : '',
          availableUntil: fullQuiz.availableUntil ? fullQuiz.availableUntil.slice(0, 16) : '',
        });
      } catch (err) {
        console.error('Failed to load quiz details:', err);
        toast.error('Failed to load quiz details');
        setFormError('Failed to load quiz details');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [quiz.id, fetchQuizDetails]);

  // Focus management
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    setTimeout(() => modalRef.current?.focus(), 0);

    return () => {
      previousActiveElement.current?.focus();
    };
  }, []);

  // Handle escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [onCancel]);

  // Update form field
  const updateField = (field: keyof QuizFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Add question
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...DEFAULT_QUESTION_FORM, tempId: Date.now(), orderIndex: prev.length },
    ]);
  };

  // Update question
  const updateQuestion = (index: number, updatedQuestion: QuestionFormData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    const question = questions[index];
    if (question.id && originalQuestionIds.has(question.id)) {
      // Track deletion of existing question
      setDeletedQuestionIds((prev) => [...prev, question.id!]);
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setFormError('Quiz title is required');
      setActiveTab('settings');
      return false;
    }
    if (!formData.courseId) {
      setFormError('Please select a course');
      setActiveTab('settings');
      return false;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setFormError(`Question ${i + 1}: Question text is required`);
        setActiveTab('questions');
        return false;
      }
      if (q.questionType === 'mcq' || q.questionType === 'true_false') {
        const validOptions = q.options.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          setFormError(`Question ${i + 1}: At least 2 options are required`);
          setActiveTab('questions');
          return false;
        }
      }
    }

    return true;
  };

  // Save quiz
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setFormError(null);

      // Update quiz settings
      const quizPayload = {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description || null,
        timeLimitMinutes: formData.timeLimitMinutes,
        maxAttempts: formData.maxAttempts,
        passingScore: formData.passingScore?.toString() || null,
        randomizeQuestions: formData.randomizeQuestions ? 1 : 0,
        showCorrectAnswers: formData.showCorrectAnswers ? 1 : 0,
        showAnswersAfter: formData.showAnswersAfter,
        availableFrom: formData.availableFrom || null,
        availableUntil: formData.availableUntil || null,
      };

      await QuizService.update(quiz.id, quizPayload);

      // Delete removed questions
      for (const questionId of deletedQuestionIds) {
        await QuizService.deleteQuestion(quiz.id, Number(questionId));
      }

      // Update or create questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        const questionPayload: any = {
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points.toString(),
          explanation: q.explanation || null,
          orderIndex: i,
        };

        // Handle options and correct answer
        if (q.questionType === 'mcq') {
          questionPayload.options = q.options.filter((opt) => opt.trim());
          questionPayload.correctAnswer = q.correctAnswer;
        } else if (q.questionType === 'true_false') {
          questionPayload.options = ['True', 'False'];
          questionPayload.correctAnswer = q.correctAnswer;
        } else if (q.questionType === 'short_answer') {
          questionPayload.correctAnswer = q.correctAnswer;
        } else if (q.questionType === 'essay') {
          questionPayload.correctAnswer = null;
        } else if (q.questionType === 'matching') {
          questionPayload.options = q.matchingPairs.map((p) => JSON.stringify(p));
          questionPayload.correctAnswer = null;
        }

        if (q.id && originalQuestionIds.has(q.id)) {
          // Update existing question
          await QuizService.updateQuestion(quiz.id, Number(q.id), questionPayload);
        } else {
          // Create new question
          await QuizService.addQuestion(quiz.id, questionPayload);
        }
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to update quiz:', err);
      const message = err instanceof Error ? err.message : 'Failed to update quiz';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Shared classes
  const overlayBg = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  const cardCls = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-2'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2';

  if (isLoading) {
    return (
      <div className={overlayBg}>
        <div className={`relative rounded-2xl p-12 shadow-xl border ${cardCls}`}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin" size={32} style={{ color: primaryHex }} />
            <p className={subCls}>Loading quiz details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={overlayBg} onClick={onCancel}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-quiz-title"
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border ${cardCls}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="edit-quiz-title" className={`text-xl font-bold ${headingCls}`}>
            Edit Quiz
          </h2>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Close"
          >
            <X size={20} className={subCls} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-4 mb-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? `border-current`
                : `border-transparent ${subCls} hover:text-gray-700 dark:hover:text-white`
            }`}
            style={activeTab === 'settings' ? { color: primaryHex, borderColor: primaryHex } : {}}
          >
            Quiz Settings
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'questions'
                ? `border-current`
                : `border-transparent ${subCls} hover:text-gray-700 dark:hover:text-white`
            }`}
            style={activeTab === 'questions' ? { color: primaryHex, borderColor: primaryHex } : {}}
          >
            Questions ({questions.length})
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter quiz title"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter quiz description (optional)"
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none resize-none ${inputCls}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                  Course <span className="text-red-500">*</span>
                </label>
                <CleanSelect
                  value={formData.courseId}
                  onChange={(e) => updateField('courseId', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                >
                  <option value="">Select course</option>
                  {courseOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </CleanSelect>
              </div>
            </div>

            {/* Time & Attempts */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${headingCls}`}>
                <Clock size={16} />
                Time & Attempts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.timeLimitMinutes ?? ''}
                    onChange={(e) => updateField('timeLimitMinutes', e.target.value ? Number(e.target.value) : null)}
                    placeholder="No limit"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>Max Attempts</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxAttempts}
                    onChange={(e) => updateField('maxAttempts', Number(e.target.value) || 1)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>Passing Score (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.passingScore ?? ''}
                    onChange={(e) => updateField('passingScore', e.target.value ? Number(e.target.value) : null)}
                    placeholder="No minimum"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${headingCls}`}>
                <Calendar size={16} />
                Availability
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>Available From</label>
                  <input
                    type="datetime-local"
                    value={formData.availableFrom}
                    onChange={(e) => updateField('availableFrom', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>Available Until</label>
                  <input
                    type="datetime-local"
                    value={formData.availableUntil}
                    onChange={(e) => updateField('availableUntil', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${headingCls}`}>
                <CheckSquare size={16} />
                Options
              </h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 cursor-pointer ${headingCls}`}>
                  <input
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={(e) => updateField('randomizeQuestions', e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryHex }}
                  />
                  <span className="text-sm">
                    <Shuffle size={14} className="inline mr-1" />
                    Randomize question order
                  </span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer ${headingCls}`}>
                  <input
                    type="checkbox"
                    checked={formData.showCorrectAnswers}
                    onChange={(e) => updateField('showCorrectAnswers', e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryHex }}
                  />
                  <span className="text-sm">
                    <Eye size={14} className="inline mr-1" />
                    Show correct answers after submission
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.tempId || question.id || index}
                question={question}
                index={index}
                onUpdate={(updated) => updateQuestion(index, updated)}
                onRemove={() => removeQuestion(index)}
                canRemove={questions.length > 1}
              />
            ))}
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-3 w-full justify-center text-sm border border-dashed rounded-lg transition-colors"
              style={{ borderColor: primaryHex, color: primaryHex }}
            >
              <Plus size={18} />
              Add Question
            </button>
          </div>
        )}

        {/* Error Message */}
        {formError && (
          <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {formError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryHex }}
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
