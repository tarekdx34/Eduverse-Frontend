import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Clock } from 'lucide-react';

interface LateBadgeProps {
  isLate: boolean | number;
  className?: string;
  showIcon?: boolean;
}

export function LateBadge({ isLate, className = '', showIcon = true }: LateBadgeProps) {
  const { isDark } = useTheme();

  // Handle both boolean and number (0/1) values
  const late = typeof isLate === 'number' ? isLate === 1 : isLate;

  if (!late) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        isDark
          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
          : 'bg-red-100 text-red-700 border border-red-200'
      } ${className}`}
    >
      {showIcon && <Clock size={11} />}
      Late
    </span>
  );
}

export default LateBadge;
