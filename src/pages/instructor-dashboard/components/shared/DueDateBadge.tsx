import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Clock, AlertCircle } from 'lucide-react';

interface DueDateBadgeProps {
  dueDate: string | Date | null;
  className?: string;
}

export function DueDateBadge({ dueDate, className = '' }: DueDateBadgeProps) {
  const { isDark } = useTheme();

  const { status, text, icon: Icon } = useMemo(() => {
    if (!dueDate) {
      return {
        status: 'none',
        text: 'No due date',
        icon: Clock,
      };
    }

    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hours = Math.ceil(diff / (1000 * 60 * 60));

    if (diff < 0) {
      const daysOverdue = Math.abs(days);
      return {
        status: 'overdue',
        text: daysOverdue === 0 ? 'Overdue today' : `Overdue by ${daysOverdue}d`,
        icon: AlertCircle,
      };
    } else if (hours < 24) {
      return {
        status: 'today',
        text: hours <= 1 ? 'Due in < 1 hour' : `Due in ${hours}h`,
        icon: AlertCircle,
      };
    } else if (days === 1) {
      return {
        status: 'tomorrow',
        text: 'Due tomorrow',
        icon: Clock,
      };
    } else if (days <= 3) {
      return {
        status: 'soon',
        text: `Due in ${days} days`,
        icon: Clock,
      };
    } else if (days <= 7) {
      return {
        status: 'week',
        text: `Due in ${days} days`,
        icon: Clock,
      };
    } else {
      return {
        status: 'normal',
        text: due.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        }),
        icon: Clock,
      };
    }
  }, [dueDate]);

  const getStatusStyles = () => {
    switch (status) {
      case 'overdue':
        return {
          bg: isDark ? 'bg-red-500/20' : 'bg-red-100',
          text: isDark ? 'text-red-300' : 'text-red-700',
          border: isDark ? 'border-red-500/30' : 'border-red-200',
        };
      case 'today':
        return {
          bg: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
          text: isDark ? 'text-orange-300' : 'text-orange-700',
          border: isDark ? 'border-orange-500/30' : 'border-orange-200',
        };
      case 'tomorrow':
      case 'soon':
        return {
          bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
          text: isDark ? 'text-yellow-300' : 'text-yellow-700',
          border: isDark ? 'border-yellow-500/30' : 'border-yellow-200',
        };
      case 'week':
        return {
          bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
          text: isDark ? 'text-blue-300' : 'text-blue-700',
          border: isDark ? 'border-blue-500/30' : 'border-blue-200',
        };
      case 'normal':
        return {
          bg: isDark ? 'bg-slate-500/20' : 'bg-slate-100',
          text: isDark ? 'text-slate-300' : 'text-slate-700',
          border: isDark ? 'border-slate-500/30' : 'border-slate-200',
        };
      case 'none':
      default:
        return {
          bg: isDark ? 'bg-white/5' : 'bg-gray-100',
          text: isDark ? 'text-slate-400' : 'text-gray-500',
          border: isDark ? 'border-white/10' : 'border-gray-200',
        };
    }
  };

  const { bg, text: textColor, border } = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${bg} ${textColor} ${border} ${className}`}
    >
      <Icon size={12} />
      {text}
    </span>
  );
}

export default DueDateBadge;
