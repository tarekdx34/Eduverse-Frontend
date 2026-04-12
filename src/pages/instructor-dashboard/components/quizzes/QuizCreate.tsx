/**
 * QuizCreate - Modal form for creating a new quiz
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Loader2, Plus, Calendar, Clock, CheckSquare, Shuffle, Eye, Bot, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CleanSelect, CustomDropdown } from '../../../../components/shared';
import { QuestionEditor } from './QuestionEditor';
import QuizService from '../../../../services/api/quizService';
import { generateQuestionsFromAiService } from './quizAiGeneration';
import {
  QuizFormData,
  QuestionFormData,
  DEFAULT_QUIZ_FORM,
  DEFAULT_QUESTION_FORM,
} from './types';

type AiGeneratorQType = 'MCQ' | 'FillBlank' | 'Explain';

const AI_GEN_TYPE_OPTIONS: { value: AiGeneratorQType; label: string }[] = [
  { value: 'MCQ', label: 'MCQ' },
  { value: 'FillBlank', label: 'Fill in the blank' },
  { value: 'Explain', label: 'Explain' },
];

const AI_DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

interface QuizCreateProps {
  courseOptions: { value: string; label: string }[];
  onSuccess: () => void;
  onCancel: () => void;
  /** When true, AI generation UI is hidden (use Live mode + real account). */
  isMockMode?: boolean;
}

export function QuizCreate({ courseOptions, onSuccess, onCancel, isMockMode = false }: QuizCreateProps) {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Form state
  const [formData, setFormData] = useState<QuizFormData>(DEFAULT_QUIZ_FORM);
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiNumQuestions, setAiNumQuestions] = useState(8);
  const [aiQuestionType, setAiQuestionType] = useState<AiGeneratorQType>('MCQ');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiLoading, setAiLoading] = useState(false);

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

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        ...DEFAULT_QUESTION_FORM,
        tempId: Date.now(),
        orderIndex: prev.length,
        questionProvenance: 'manual',
      },
    ]);
  };

  const updateQuestion = (index: number, updatedQuestion: QuestionFormData) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const appendAiQuestions = async () => {
    if (!aiFile) {
      toast.error('Choose a source file first.');
      return;
    }
    if (!formData.courseId) {
      toast.error('Select a course in Quiz Settings first.');
      setActiveTab('settings');
      return;
    }
    setAiLoading(true);
    try {
      const generated = await generateQuestionsFromAiService({
        file: aiFile,
        numQuestions: aiNumQuestions,
        questionType: aiQuestionType,
        difficulty: aiDifficulty,
      });
      setQuestions((prev) => {
        const start = prev.length;
        return [
          ...prev,
          ...generated.map((q, i) => ({
            ...q,
            orderIndex: start + i,
            tempId: Date.now() + i + Math.floor(Math.random() * 10000),
          })),
        ];
      });
      toast.success(`Added ${generated.length} AI-generated question(s). You can edit them below.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
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

    if (questions.length === 0) {
      setFormError('Add at least one question (manually or with AI generation)');
      setActiveTab('questions');
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
      if (q.questionType === 'matching' && q.matchingPairs.length < 2) {
        setFormError(`Question ${i + 1}: At least 2 matching pairs are required`);
        setActiveTab('questions');
        return false;
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

      // Create quiz
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
        quizType: 'graded' as const,
      };

      const newQuiz = await QuizService.create(quizPayload);
      const quizId = (newQuiz as any).quizId || newQuiz.id;

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Build question payload based on type
        const questionPayload: any = {
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points.toString(),
          explanation: q.explanation || null,
          orderIndex: i,
        };

        // Handle options and correct answer based on question type
        if (q.questionType === 'mcq') {
          questionPayload.options = q.options.filter((opt) => opt.trim());
          questionPayload.correctAnswer = q.correctAnswer; // Index as string
        } else if (q.questionType === 'true_false') {
          questionPayload.options = ['True', 'False'];
          questionPayload.correctAnswer = q.correctAnswer; // "0" for True, "1" for False
        } else if (q.questionType === 'short_answer') {
          questionPayload.correctAnswer = q.correctAnswer; // Expected answer text
        } else if (q.questionType === 'essay') {
          // Essays don't have correct answers
          questionPayload.correctAnswer = null;
        } else if (q.questionType === 'matching') {
          questionPayload.options = q.matchingPairs.map((p) => JSON.stringify(p));
          questionPayload.correctAnswer = null;
        }

        await QuizService.addQuestion(quizId, questionPayload);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to create quiz:', err);
      const message = err instanceof Error ? err.message : 'Failed to create quiz';
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

  return (
    <div className={overlayBg} onClick={onCancel}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-quiz-title"
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border ${cardCls}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="create-quiz-title" className={`text-xl font-bold ${headingCls}`}>
            Create New Quiz
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
                  style={{ '--tw-ring-color': primaryHex } as React.CSSProperties}
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
                    checked={formData.randomizeOptions}
                    onChange={(e) => updateField('randomizeOptions', e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryHex }}
                  />
                  <span className="text-sm">
                    <Shuffle size={14} className="inline mr-1" />
                    Randomize option order (MCQ)
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
              {formData.showCorrectAnswers && (
                <div className="mt-3">
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                    Show Answers
                  </label>
                  <CleanSelect
                    value={formData.showAnswersAfter}
                    onChange={(e) => updateField('showAnswersAfter', e.target.value)}
                    className={`w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`}
                  >
                    <option value="immediate">Immediately after submission</option>
                    <option value="after_due">After due date</option>
                    <option value="never">Never</option>
                  </CleanSelect>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {/* AI generation — appended to the list below */}
            <div
              className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
              style={{ borderLeftWidth: 4, borderLeftColor: primaryHex }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Bot size={18} style={{ color: primaryHex }} aria-hidden />
                <h3 className={`text-sm font-semibold ${headingCls}`}>Generate questions with AI</h3>
              </div>
              <p className={`text-sm mb-3 ${subCls}`}>
                Upload a file. New questions are added to the list below and labeled as AI-generated. You can mix
                them with manually added questions (any type: MCQ, True/False, etc.).
              </p>
              {isMockMode ? (
                <p className={`text-sm ${subCls}`}>
                  AI generation is available in Live mode after signing in (not in mock preview).
                </p>
              ) : !formData.courseId ? (
                <p className={`text-sm font-medium ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  Select a course under Quiz Settings first — the AI service needs your course context.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer">
                      <span
                        className="inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: primaryHex }}
                      >
                        Choose file
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="sr-only"
                        onChange={(e) => setAiFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {aiFile ? (
                      <span className={`text-sm font-medium truncate max-w-[min(100%,20rem)] ${headingCls}`}>
                        {aiFile.name}
                      </span>
                    ) : (
                      <span className={`text-sm ${subCls}`}>No file selected</span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${subCls}`}>Number of questions</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={aiNumQuestions}
                        onChange={(e) => setAiNumQuestions(Number(e.target.value || 1))}
                        className={`w-full px-3 py-2 text-sm border rounded-lg ${inputCls}`}
                      />
                    </div>
                    <CustomDropdown
                      label="AI question style"
                      options={AI_GEN_TYPE_OPTIONS}
                      value={aiQuestionType}
                      onChange={(v) => setAiQuestionType(v as AiGeneratorQType)}
                      isDark={isDark}
                      accentColor={primaryHex}
                    />
                    <CustomDropdown
                      label="Difficulty"
                      options={AI_DIFFICULTY_OPTIONS}
                      value={aiDifficulty}
                      onChange={(v) => setAiDifficulty(v as 'easy' | 'medium' | 'hard')}
                      isDark={isDark}
                      accentColor={primaryHex}
                    />
                    <div className="flex flex-col justify-end">
                      <button
                        type="button"
                        disabled={aiLoading || !aiFile}
                        onClick={() => void appendAiQuestions()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40"
                        style={{ backgroundColor: primaryHex }}
                      >
                        {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {aiLoading ? 'Generating…' : 'Generate & add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {questions.length === 0 && (
              <div
                className={`text-center py-8 rounded-lg border border-dashed ${isDark ? 'border-white/15 text-slate-400' : 'border-gray-300 text-gray-600'}`}
              >
                No questions yet. Use AI above or add a question manually (all types available).
              </div>
            )}

            {questions.map((question, index) => (
              <QuestionEditor
                key={question.tempId || question.id || index}
                question={question}
                index={index}
                onUpdate={(updated) => updateQuestion(index, updated)}
                onRemove={() => removeQuestion(index)}
                canRemove={questions.length >= 1}
              />
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-3 w-full justify-center text-sm border border-dashed rounded-lg transition-colors"
              style={{
                borderColor: primaryHex,
                color: primaryHex,
              }}
            >
              <Plus size={18} />
              Add question
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
            {isSaving ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
