import { Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LateBadgeProps {
  isLate: boolean | number;
  latePenalty?: number;
  size?: 'sm' | 'md';
}

/**
 * LateBadge - Shows late submission indicator with penalty
 */
export function LateBadge({ isLate, latePenalty, size = 'md' }: LateBadgeProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();

  // Convert number to boolean (API returns 0 or 1)
  const late = Boolean(isLate);

  if (!late) return null;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const styles = isDark
    ? 'bg-amber-900/50 text-amber-400 border-amber-700'
    : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${sizeClasses} ${styles}`}>
      <Clock className={iconSize} />
      <span>{t('lateSubmission') || 'Late'}</span>
      {latePenalty !== undefined && latePenalty > 0 && (
        <span className="opacity-75">(-{latePenalty}%)</span>
      )}
    </span>
  );
}

/**
 * LateWarning - Shows warning before submitting late
 */
interface LateWarningProps {
  dueDate: string;
  latePenalty?: number;
}

export function LateWarning({ dueDate, latePenalty }: LateWarningProps) {
  const { isDark } = useTheme() as { isDark: boolean };

  const now = new Date();
  const due = new Date(dueDate);
  const isLate = now > due;

  if (!isLate) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${
        isDark
          ? 'bg-amber-900/20 border-amber-700 text-amber-400'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Late Submission Warning</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
          The due date has passed. Your submission will be marked as late.
          {latePenalty !== undefined && latePenalty > 0 && (
            <span className="font-medium"> A {latePenalty}% penalty may be applied.</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default LateBadge;
