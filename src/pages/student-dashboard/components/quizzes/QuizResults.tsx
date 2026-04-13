import React from 'react';
import {
  CheckCircle,
  XCircle,
  Minus,
  Trophy,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { QuizResultData, QuestionResultData } from './types';

interface QuizResultsProps {
  result: QuizResultData;
  quizTitle: string;
  showCorrectAnswers: boolean;
  canRetake: boolean;
  onRetake: () => void;
  onBackToList: () => void;
}

const getScoreColor = (pct: number) => {
  if (pct >= 90) return '#10B981';
  if (pct >= 70) return '#3B82F6';
  if (pct >= 50) return '#F59E0B';
  return '#EF4444';
};

const getGradeLetter = (pct: number) => {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
};

const getMessage = (pct: number, passed: boolean) => {
  if (!passed) return 'Keep Practicing!';
  if (pct >= 90) return 'Excellent Work!';
  if (pct >= 70) return 'Great Job!';
  return 'You Passed!';
};

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  quizTitle,
  showCorrectAnswers,
  canRetake,
  onRetake,
  onBackToList,
}) => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();

  const scoreColor = getScoreColor(result.percentage);
  const gradeLetter = getGradeLetter(result.percentage);
  const passed = result.passed;
  const congratulationsMessage = getMessage(result.percentage, passed);

  // SVG Circle calculations
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset =
    circumference - (result.percentage / 100) * circumference;

  const trackColor = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F3F4F6' : '#111827';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const cardBorder = isDark ? '#374151' : '#E5E7EB';
  const mutedText = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Results Card */}
        <div
          className={`rounded-[2.5rem] p-8 mb-8 border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg`}
        >
          {/* Score Circle */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-36 h-36 mb-4">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={trackColor}
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="text-4xl font-bold"
                  style={{ color: scoreColor }}
                >
                  {result.percentage}%
                </div>
                <div className={`text-sm ${mutedText}`}>
                  {result.score}/{result.maxScore}
                </div>
              </div>
            </div>

            {/* Congratulations Message */}
            <h2 className={`text-2xl font-bold mb-2 ${textColor}`}>
              {congratulationsMessage}
            </h2>
            <p className={`${mutedText} text-center mb-4`}>{quizTitle}</p>

            {/* Grade Badge and Pass/Fail Status */}
            <div className="flex gap-3 justify-center">
              <div
                className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2`}
                style={{
                  backgroundColor: scoreColor,
                  color: '#FFFFFF',
                }}
              >
                <Trophy size={18} />
                Grade {gradeLetter}
              </div>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  passed
                    ? isDark
                      ? 'bg-green-900 text-green-100'
                      : 'bg-green-100 text-green-800'
                    : isDark
                      ? 'bg-red-900 text-red-100'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {passed ? '✓ Passed' : '✗ Failed'}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{borderColor: cardBorder}}>
            {/* Correct */}
            <div
              className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <CheckCircle
                size={24}
                className="text-green-500 mx-auto mb-2"
              />
              <div className={`text-2xl font-bold ${textColor}`}>
                {result.correct}
              </div>
              <div className={`text-sm ${mutedText}`}>Correct</div>
            </div>

            {/* Wrong */}
            <div
              className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <XCircle size={24} className="text-red-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${textColor}`}>
                {result.wrong}
              </div>
              <div className={`text-sm ${mutedText}`}>Wrong</div>
            </div>

            {/* Skipped */}
            <div
              className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <Minus size={24} className="text-amber-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${textColor}`}>
                {result.skipped}
              </div>
              <div className={`text-sm ${mutedText}`}>Skipped</div>
            </div>
          </div>
        </div>

        {/* Question Review Card */}
        {showCorrectAnswers && result.questions && result.questions.length > 0 && (
          <div
            className={`rounded-[2.5rem] p-8 mb-8 border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{borderColor: cardBorder}}>
              <BookOpen size={28} style={{ color: scoreColor }} />
              <h3 className={`text-xl font-bold ${textColor}`}>
                Question Review
              </h3>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {result.questions.map((question, index) => {
                const isCorrect = question.isCorrect;
                const isSkipped = question.userAnswer === null;

                let borderColor = '#10B981';
                let bgColor = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';

                if (isSkipped) {
                  borderColor = '#F59E0B';
                  bgColor = isDark
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(245, 158, 11, 0.05)';
                } else if (!isCorrect) {
                  borderColor = '#EF4444';
                  bgColor = isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.05)';
                }

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border-l-4"
                    style={{
                      borderLeftColor: borderColor,
                      backgroundColor: bgColor,
                    }}
                  >
                    {/* Question Number and Status */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${textColor} mb-1`}
                        >
                          Question {index + 1}
                        </div>
                        <p className={`${mutedText} text-sm`}>
                          {question.questionText}
                        </p>
                      </div>
                      <div className={isCorrect ? 'text-green-500' : isSkipped ? 'text-amber-500' : 'text-red-500'}>
                        {isCorrect ? (
                          <CheckCircle size={20} />
                        ) : isSkipped ? (
                          <Minus size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </div>
                    </div>

                    {/* User's Answer */}
                    {question.userAnswer !== null && (
                      <div className="mb-2">
                        <div
                          className={`text-xs font-semibold mb-1 ${mutedText}`}
                        >
                          Your Answer:
                        </div>
                        <p
                          className={`text-sm px-3 py-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textColor}`}
                        >
                          {question.userAnswer}
                        </p>
                      </div>
                    )}

                    {/* Correct Answer (if wrong or skipped and showCorrectAnswers) */}
                    {(!isCorrect || isSkipped) && showCorrectAnswers && (
                      <div>
                        <div
                          className={`text-xs font-semibold mb-1 ${mutedText}`}
                        >
                          Correct Answer:
                        </div>
                        <p
                          className={`text-sm px-3 py-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-green-500 font-medium`}
                        >
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {/* Explanation (if available) */}
                    {question.explanation && (
                      <div className="mt-3">
                        <div
                          className={`text-xs font-semibold mb-1 ${mutedText}`}
                        >
                          Explanation:
                        </div>
                        <p className={`text-sm ${mutedText}`}>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {canRetake && (
            <button
              onClick={onRetake}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RotateCcw size={20} />
              Retake Quiz
            </button>
          )}
          <button
            onClick={onBackToList}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
