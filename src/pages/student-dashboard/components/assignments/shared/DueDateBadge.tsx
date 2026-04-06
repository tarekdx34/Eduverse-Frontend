import { useMemo } from 'react';
import { Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getDueDateInfo } from '../hooks/useAssignments';

interface DueDateBadgeProps {
  dueDate: string | null;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

/**
 * DueDateBadge - Shows due date with countdown and urgency colors
 * - Overdue: Red
 * - Due Today: Red
 * - Due Tomorrow / Soon (≤3 days): Orange/Amber
 * - Normal: Gray
 */
export function DueDateBadge({ dueDate, showIcon = true, size = 'md' }: DueDateBadgeProps) {
  const { isDark } = useTheme() as { isDark: boolean };

  const info = useMemo(() => getDueDateInfo(dueDate), [dueDate]);

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const getStyles = () => {
    switch (info.urgency) {
      case 'overdue':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'today':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'soon':
        return isDark
          ? 'bg-amber-900/50 text-amber-400 border-amber-700'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return isDark
          ? 'bg-white/5 text-slate-400 border-white/10'
          : 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (info.urgency) {
      case 'overdue':
        return <AlertTriangle className={iconSize} />;
      case 'today':
      case 'soon':
        return <Clock className={iconSize} />;
      default:
        return <Calendar className={iconSize} />;
    }
  };

  if (!dueDate) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${sizeClasses} ${isDark ? 'bg-white/5 text-slate-500 border-white/10' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
      >
        {showIcon && <Calendar className={iconSize} />}
        <span>No due date</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${sizeClasses} ${getStyles()}`}
    >
      {getIcon()}
      <span>{info.label}</span>
    </span>
  );
}

export default DueDateBadge;
