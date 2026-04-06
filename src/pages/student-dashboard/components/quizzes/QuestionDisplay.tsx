import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MatchingQuestion from './MatchingQuestion';

// Types
type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching' | '';

interface MatchingPair {
  left: string;
  right: string;
}

interface QuestionDisplayProps {
  id: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  options?: string[] | null;
  matchingPairs?: MatchingPair[];
  points: number;
  selectedAnswer: string | MatchingPair[] | null;
  onAnswerChange: (answer: string | MatchingPair[]) => void;
}

// Question type metadata
const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  {
    label: string;
    badgeClasses: string;
  }
> = {
  mcq: {
    label: 'MCQ',
    badgeClasses: 'bg-blue-100 text-blue-700',
  },
  true_false: {
    label: 'True/False',
    badgeClasses: 'bg-purple-100 text-purple-700',
  },
  short_answer: {
    label: 'Short Answer',
    badgeClasses: 'bg-green-100 text-green-700',
  },
  essay: {
    label: 'Essay',
    badgeClasses: 'bg-amber-100 text-amber-700',
  },
  matching: {
    label: 'Matching',
    badgeClasses: 'bg-cyan-100 text-cyan-700',
  },
  '': {
    label: '',
    badgeClasses: '',
  },
};

// Option labels for MCQ
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  id,
  questionNumber,
  questionType,
  questionText,
  options,
  matchingPairs,
  points,
  selectedAnswer,
  onAnswerChange,
}) => {
  const { isDarkMode } = useTheme();
  const { isRTL, direction } = useLanguage();

  const typeConfig = QUESTION_TYPE_CONFIG[questionType] || QUESTION_TYPE_CONFIG[''];

  // Determine accent color based on theme
  const accentColor = isDarkMode ? '#60a5fa' : '#3b82f6';

  // Render MCQ options
  const renderMCQOptions = () => {
    if (!options || options.length === 0) return null;

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const label = OPTION_LABELS[index] || '';

          return (
            <button
              key={index}
              onClick={() => onAnswerChange(option)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isSelected
                  ? `border-[var(--accent-color)] bg-[var(--accent-color)]/10`
                  : isDarkMode
                    ? 'border-white/10 hover:border-white/20'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{
                '--accent-color': accentColor,
              } as React.CSSProperties}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  isSelected
                    ? `bg-[var(--accent-color)] text-white`
                    : isDarkMode
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-200 text-slate-700'
                }`}
                style={{
                  '--accent-color': accentColor,
                } as React.CSSProperties}
              >
                {label}
              </div>
              <span
                className={`text-base font-medium ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Render True/False buttons
  const renderTrueFalseOptions = () => {
    const options = [
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' },
    ];

    return (
      <div className="flex gap-4">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onAnswerChange(option.value)}
              className={`flex-1 p-4 rounded-2xl border-2 font-bold text-lg transition-all cursor-pointer ${
                isSelected
                  ? `border-[var(--accent-color)] bg-[var(--accent-color)]/10`
                  : isDarkMode
                    ? 'border-white/10 hover:border-white/20'
                    : 'border-slate-200 hover:border-slate-300'
              } ${
                isDarkMode
                  ? isSelected
                    ? 'text-[var(--accent-color)]'
                    : 'text-white'
                  : isSelected
                    ? 'text-[var(--accent-color)]'
                    : 'text-slate-900'
              }`}
              style={{
                '--accent-color': accentColor,
              } as React.CSSProperties}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  // Render Short Answer input
  const renderShortAnswerInput = () => {
    return (
      <input
        type="text"
        value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Enter your answer here..."
        className={`w-full p-4 rounded-2xl border-2 font-medium focus:outline-none transition-all ${
          isDarkMode
            ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[var(--accent-color)]'
            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[var(--accent-color)]'
        }`}
        style={{
          '--accent-color': accentColor,
        } as React.CSSProperties}
      />
    );
  };

  // Render Essay textarea
  const renderEssayTextarea = () => {
    return (
      <textarea
        value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Write your response here..."
        rows={6}
        className={`w-full p-4 rounded-2xl border-2 font-medium resize-none focus:outline-none transition-all ${
          isDarkMode
            ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[var(--accent-color)]'
            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[var(--accent-color)]'
        }`}
        style={{
          '--accent-color': accentColor,
        } as React.CSSProperties}
      />
    );
  };

  // Render based on question type
  const renderQuestionContent = () => {
    switch (questionType) {
      case 'mcq':
        return renderMCQOptions();
      case 'true_false':
        return renderTrueFalseOptions();
      case 'short_answer':
        return renderShortAnswerInput();
      case 'essay':
        return renderEssayTextarea();
      case 'matching':
        return (
          <MatchingQuestion
            pairs={matchingPairs || []}
            selectedAnswers={Array.isArray(selectedAnswer) ? selectedAnswer : []}
            onAnswerChange={(pairs) => onAnswerChange(pairs)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 transition-all ${
        isDarkMode
          ? 'bg-white/5 border border-white/10'
          : 'bg-slate-50 border border-slate-200'
      }`}
      dir={direction}
    >
      {/* Question Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Question Number Badge */}
        <div
          className="w-8 h-8 rounded-lg bg-[var(--accent-color)] text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
          style={{
            '--accent-color': accentColor,
          } as React.CSSProperties}
        >
          {questionNumber}
        </div>

        {/* Type Badge */}
        {questionType && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${typeConfig.badgeClasses}`}
          >
            {typeConfig.label}
          </span>
        )}

        {/* Points Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            isDarkMode
              ? 'bg-white/10 text-slate-300'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {points} {points === 1 ? 'point' : 'points'}
        </span>
      </div>

      {/* Question Text */}
      <p
        className={`text-xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}
      >
        {questionText}
      </p>

      {/* Question Content */}
      {renderQuestionContent()}
    </div>
  );
};

export default QuestionDisplay;
export type { QuestionDisplayProps, MatchingPair, QuestionType };
