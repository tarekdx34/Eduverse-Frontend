import React from 'react';
import { BookOpen, Clock, Loader2, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export interface QuizCardProps {
  id: string;
  title: string;
  course: string;
  questionsCount: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxAttempts: number;
  remainingAttempts: number;
  color: string;
  isLoading?: boolean;
  onStart: () => void;
}

export default function QuizCard({
  id,
  title,
  course,
  questionsCount,
  duration,
  difficulty,
  maxAttempts,
  remainingAttempts,
  color,
  isLoading = false,
  onStart,
}: QuizCardProps) {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();

  // Determine if button should be disabled
  const isDisabled = remainingAttempts === 0 || isLoading;

  // Get difficulty badge styles
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'Easy':
        return isDark
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-green-600 bg-green-100 border-green-200';
      case 'Medium':
        return isDark
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Hard':
        return isDark
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : 'text-red-600 bg-red-100 border-red-200';
      default:
        return isDark
          ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
          : 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  // Card background
  const cardBgClass = isDark
    ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/5 backdrop-blur-xl'
    : 'bg-gradient-to-br from-white/80 to-white/60 border-white/40 backdrop-blur-xl';

  // Text colors
  const textTitleClass = isDark ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const textTertiaryClass = isDark ? 'text-slate-500' : 'text-slate-500';

  // Button styles
  const buttonBgClass = isDisabled
    ? isDark
      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
    : `bg-[${color || '#3B82F6'}] hover:opacity-90 text-white`;

  return (
    <div
      className={`rounded-[2.5rem] p-6 border transition-all hover:shadow-lg ${cardBgClass}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color || '#3B82F6', opacity: 0.15 }}
        >
          <BarChart3
            size={24}
            style={{ color: color || '#3B82F6' }}
            className="flex-shrink-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${textTitleClass} truncate mb-2`}>
            {title}
          </h3>

          {/* Course Badge */}
          <div className="inline-flex">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: color || '#3B82F6', opacity: 0.8 }}
            >
              {course}
            </span>
          </div>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2 mb-4">
        {/* Questions Count */}
        <div className={`flex items-center gap-2 ${textSecondaryClass} text-sm`}>
          <BookOpen size={16} className="flex-shrink-0" />
          <span>{questionsCount} questions</span>
        </div>

        {/* Duration */}
        <div className={`flex items-center gap-2 ${textSecondaryClass} text-sm`}>
          <Clock size={16} className="flex-shrink-0" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Difficulty and Attempts Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Difficulty Badge */}
        <div
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyStyles()}`}
        >
          {difficulty}
        </div>

        {/* Attempts */}
        <div
          className={`text-xs font-medium ${textTertiaryClass} ${
            remainingAttempts === 0 ? (isDark ? 'text-red-400' : 'text-red-600') : ''
          }`}
        >
          {remainingAttempts}/{maxAttempts} attempts
        </div>
      </div>

      {/* Attempts Warning */}
      {remainingAttempts === 0 && (
        <div
          className={`mb-4 text-xs font-medium ${
            isDark ? 'text-red-400/80' : 'text-red-600/80'
          }`}
        >
          No attempts remaining
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={isDisabled}
        className={`w-full px-5 py-2 rounded-xl text-white text-sm font-medium transition-all ${buttonBgClass} flex items-center justify-center gap-2`}
        style={
          !isDisabled
            ? { backgroundColor: color || '#3B82F6' }
            : undefined
        }
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Starting...' : 'Start Quiz'}
      </button>
    </div>
  );
}
