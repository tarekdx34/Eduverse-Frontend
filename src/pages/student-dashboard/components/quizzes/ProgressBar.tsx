import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressBarProps {
  answered: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  answered,
  total,
  className = '',
}) => {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();

  // Calculate percentage
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  // Card styling based on theme
  const cardClasses = isDark
    ? 'bg-card-dark border border-white/5'
    : 'glass border border-slate-100';

  // Track styling based on theme
  const trackClasses = isDark ? 'bg-white/10' : 'bg-slate-200';

  return (
    <div className={`${cardClasses} rounded-2xl p-6 ${className}`}>
      {/* Header with title and percentage */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-sm font-semibold ${
            isDark ? 'text-white/80' : 'text-slate-700'
          }`}
        >
          {isRTL ? 'تقدم الاختبار' : 'Quiz Progress'}
        </h3>
        <span
          className={`text-lg font-bold ${
            isDark ? 'text-accent-color' : 'text-accent-color'
          }`}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full ${trackClasses} overflow-hidden mb-3`}>
        <div
          className="h-2 rounded-full bg-[var(--accent-color)] transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {/* Footer with answered count */}
      <div className="text-xs">
        <p
          className={
            isDark ? 'text-white/60' : 'text-slate-600'
          }
        >
          {isRTL
            ? `${answered} من ${total} سؤال تمت الإجابة عليه`
            : `${answered} of ${total} answered`}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
