import React from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface TimerProps {
  timeRemaining: number; // seconds
  isWarning?: boolean; // true when < 60s
  isAutoSaving?: boolean;
  className?: string;
}

/**
 * Timer Component
 * Displays a countdown timer for quiz sessions with theme and RTL support
 * @component
 */
export const Timer: React.FC<TimerProps> = ({
  timeRemaining,
  isWarning = false,
  isAutoSaving = false,
  className = '',
}) => {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();

  /**
   * Format seconds to MM:SS format
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Determine base styles based on theme
   */
  const getBaseStyles = (): string => {
    return isDark
      ? 'bg-white/5 text-white'
      : 'bg-slate-100 text-slate-700';
  };

  /**
   * Determine warning styles
   */
  const getWarningStyles = (): string => {
    return isWarning ? 'bg-red-500/10 text-red-500' : getBaseStyles();
  };

  /**
   * Combine all styles
   */
  const containerClasses = `
    inline-flex items-center gap-2 px-3 py-1.5
    rounded-xl font-mono font-semibold text-sm
    transition-colors duration-200 ease-in-out
    ${getWarningStyles()}
    ${isRTL ? 'flex-row-reverse' : ''}
    ${className}
  `;

  /**
   * Auto-save indicator classes
   */
  const autoSaveClasses = `
    inline-block w-2 h-2 rounded-full
    ${isDark ? 'bg-green-400' : 'bg-green-500'}
    animate-pulse
  `;

  return (
    <div
      className={containerClasses}
      role="timer"
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
      aria-live="polite"
    >
      <Clock size={16} className="flex-shrink-0" />
      <span className="tabular-nums">{formatTime(timeRemaining)}</span>
      
      {isAutoSaving && (
        <div
          className={autoSaveClasses}
          title="Auto-saving..."
          aria-label="Quiz is being auto-saved"
        />
      )}
    </div>
  );
};

export default Timer;
