import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';

interface StatusBadgeProps {
  status: AssignmentStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { isDark } = useTheme();

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return {
          bg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
          text: isDark ? 'text-amber-300' : 'text-amber-700',
          label: 'Draft',
        };
      case 'published':
        return {
          bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
          text: isDark ? 'text-green-300' : 'text-green-700',
          label: 'Published',
        };
      case 'closed':
        return {
          bg: isDark ? 'bg-gray-500/20' : 'bg-gray-100',
          text: isDark ? 'text-gray-300' : 'text-gray-700',
          label: 'Closed',
        };
      case 'archived':
        return {
          bg: isDark ? 'bg-slate-500/20' : 'bg-slate-100',
          text: isDark ? 'text-slate-400' : 'text-slate-600',
          label: 'Archived',
        };
      default:
        return {
          bg: isDark ? 'bg-white/10' : 'bg-gray-100',
          text: isDark ? 'text-slate-300' : 'text-gray-600',
          label: status,
        };
    }
  };

  const { bg, text, label } = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
