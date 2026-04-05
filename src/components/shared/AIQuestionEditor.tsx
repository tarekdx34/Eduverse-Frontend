import { useState } from 'react';
import { CleanSelect } from './';

import {
  Sparkles,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  RefreshCw,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface AIQuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onGenerateMore?: (difficulty: string, count: number) => Promise<Question[]>;
  className?: string;
  readOnly?: boolean;
  isDark?: boolean;
}

const getDifficultyColors = (isDark: boolean) => ({
  easy: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
  medium: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
  hard: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
});

const typeLabels = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  essay: 'Essay',
};

export function AIQuestionEditor({
  questions: initialQuestions,
  onQuestionsChange,
  onGenerateMore,
  className = '',
  readOnly = false,
  isDark = false,
}: AIQuestionEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateDifficulty, setGenerateDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );
  const [generateCount, setGenerateCount] = useState(5);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const updateQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    onQuestionsChange(newQuestions);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setEditingQuestion({ ...question });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingQuestion(null);
  };

  const saveEditing = () => {
    if (!editingQuestion) return;

    const newQuestions = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    updateQuestions(newQuestions);
    setEditingId(null);
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    const newQuestions = questions.filter((q) => q.id !== id);
    updateQuestions(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      question: 'New question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      points: 1,
      difficulty: 'medium',
    };
    updateQuestions([...questions, newQuestion]);
    startEditing(newQuestion);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    updateQuestions(newQuestions);
  };

  const handleGenerateMore = async () => {
    if (!onGenerateMore) return;

    setIsGenerating(true);
    try {
      const newQuestions = await onGenerateMore(generateDifficulty, generateCount);
      updateQuestions([...questions, ...newQuestions]);
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (!editingQuestion?.options) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const addOption = () => {
    if (!editingQuestion?.options) return;
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, `Option ${editingQuestion.options.length + 1}`],
    });
  };

  const removeOption = (index: number) => {
    if (!editingQuestion?.options || editingQuestion.options.length <= 2) return;
    const newOptions = editingQuestion.options.filter((_, i) => i !== index);
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions,
      correctAnswer:
        typeof editingQuestion.correctAnswer === 'number' && editingQuestion.correctAnswer >= index
          ? Math.max(0, (editingQuestion.correctAnswer as number) - 1)
          : editingQuestion.correctAnswer,
    });
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const difficultyColors = getDifficultyColors(isDark);

  const inputClass = isDark
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';
  const optionClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';

  return (
    <div
      className={`${isDark ? 'bg-[#1e293b]' : 'bg-white'} rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} rounded-lg`}>
              <Sparkles className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Question Editor
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {questions.length} questions • {totalPoints} points total
              </p>
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              {onGenerateMore && (
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className={`px-3 py-2 ${isDark ? 'text-purple-400 hover:bg-purple-900/20' : 'text-purple-600 hover:bg-purple-50'} rounded-lg transition-colors flex items-center gap-2 text-sm`}
                >
                  <Sparkles size={16} />
                  Generate More
                </button>
              )}
              <button
                onClick={addQuestion}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div
        className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'} max-h-[600px] overflow-y-auto`}
      >
        {questions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle
              size={48}
              className={`mx-auto ${isDark ? 'text-gray-600' : 'text-gray-300'} mb-4`}
            />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No questions yet</p>
            {!readOnly && (
              <button
                onClick={addQuestion}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add your first question
              </button>
            )}
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}
            >
              {editingId === question.id && editingQuestion ? (
                /* Editing Mode */
                <div className="space-y-4">
                  {/* Question Type & Difficulty */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                      >
                        Type
                      </label>
                      <CleanSelect
                        value={editingQuestion.type}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            type: e.target.value as Question['type'],
                          })
                        }
                        className={`w-full px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option className={optionClass} value="multiple-choice">
                          Multiple Choice
                        </option>
                        <option className={optionClass} value="true-false">
                          True/False
                        </option>
                        <option className={optionClass} value="short-answer">
                          Short Answer
                        </option>
                        <option className={optionClass} value="essay">
                          Essay
                        </option>
                      </CleanSelect>
                    </div>
                    <div>
                      <label
                        className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                      >
                        Difficulty
                      </label>
                      <CleanSelect
                        value={editingQuestion.difficulty}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            difficulty: e.target.value as Question['difficulty'],
                          })
                        }
                        className={`w-full px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option className={optionClass} value="easy">
                          Easy
                        </option>
                        <option className={optionClass} value="medium">
                          Medium
                        </option>
                        <option className={optionClass} value="hard">
                          Hard
                        </option>
                      </CleanSelect>
                    </div>
                    <div>
                      <label
                        className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                      >
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editingQuestion.points}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            points: parseInt(e.target.value) || 1,
                          })
                        }
                        className={`w-full px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label
                      className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                    >
                      Question
                    </label>
                    <textarea
                      value={editingQuestion.question}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, question: e.target.value })
                      }
                      rows={2}
                      className={`w-full px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                    />
                  </div>

                  {/* Options (for multiple choice) */}
                  {editingQuestion.type === 'multiple-choice' && editingQuestion.options && (
                    <div>
                      <label
                        className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                      >
                        Options
                      </label>
                      <div className="space-y-2">
                        {editingQuestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${editingQuestion.id}`}
                              checked={editingQuestion.correctAnswer === optIndex}
                              onChange={() =>
                                setEditingQuestion({ ...editingQuestion, correctAnswer: optIndex })
                              }
                              className="w-4 h-4 text-green-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(optIndex, e.target.value)}
                              className={`flex-1 px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                            <button
                              onClick={() => removeOption(optIndex)}
                              className={`p-1 ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'} rounded`}
                              disabled={editingQuestion.options!.length <= 2}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addOption}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* True/False */}
                  {editingQuestion.type === 'true-false' && (
                    <div>
                      <label
                        className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                      >
                        Correct Answer
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={editingQuestion.correctAnswer === 'true'}
                            onChange={() =>
                              setEditingQuestion({ ...editingQuestion, correctAnswer: 'true' })
                            }
                            className="w-4 h-4 text-green-600"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : ''}`}>True</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={editingQuestion.correctAnswer === 'false'}
                            onChange={() =>
                              setEditingQuestion({ ...editingQuestion, correctAnswer: 'false' })
                            }
                            className="w-4 h-4 text-green-600"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : ''}`}>False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <label
                      className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}
                    >
                      Explanation (optional)
                    </label>
                    <textarea
                      value={editingQuestion.explanation || ''}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                      }
                      rows={2}
                      placeholder="Explain the correct answer..."
                      className={`w-full px-3 py-2 border ${inputClass} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className={`px-3 py-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-lg text-sm transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditing}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors flex items-center gap-2"
                    >
                      <Check size={16} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-start gap-3">
                  {!readOnly && (
                    <div className="flex flex-col gap-1 opacity-50 hover:opacity-100">
                      <button
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded disabled:opacity-30`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <GripVertical
                        size={14}
                        className={isDark ? 'text-gray-500' : 'text-gray-400'}
                      />
                      <button
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className={`p-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded disabled:opacity-30`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            Q{index + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              difficultyColors[question.difficulty]
                            }`}
                          >
                            {question.difficulty}
                          </span>
                          <span
                            className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded text-xs`}
                          >
                            {typeLabels[question.type]}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {question.points} pts
                          </span>
                        </div>
                        <p className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                          {question.question}
                        </p>

                        {/* Collapsed Options Preview */}
                        {!expandedIds.has(question.id) &&
                          question.type === 'multiple-choice' &&
                          question.options && (
                            <p
                              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}
                            >
                              {question.options.length} options •{' '}
                              <button
                                onClick={() => toggleExpanded(question.id)}
                                className="text-indigo-600 hover:underline"
                              >
                                Show details
                              </button>
                            </p>
                          )}

                        {/* Expanded Options */}
                        {expandedIds.has(question.id) && question.options && (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`flex items-center gap-2 text-sm ${
                                  question.correctAnswer === optIndex
                                    ? 'text-green-700 font-medium'
                                    : isDark
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                }`}
                              >
                                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                {option}
                                {question.correctAnswer === optIndex && (
                                  <Check size={14} className="text-green-600" />
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => toggleExpanded(question.id)}
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              Hide details
                            </button>
                          </div>
                        )}
                      </div>

                      {!readOnly && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditing(question)}
                            className={`p-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className={`p-2 ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'} rounded-lg transition-colors`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-[#1e293b]' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Generate More Questions
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                >
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setGenerateDifficulty(level)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        generateDifficulty === level
                          ? 'bg-indigo-600 text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                >
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 5)}
                  className={`w-full px-3 py-2 border ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className={`px-4 py-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateMore}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIQuestionEditor;
