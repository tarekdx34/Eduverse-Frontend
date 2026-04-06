import { AlertCircle, CheckCircle, Clock, HelpCircle } from 'lucide-react';

interface AttendanceBadgeProps {
  status?: 'present' | 'absent' | 'late' | 'excused' | 'not_marked';
}

export function AttendanceBadge({ status = 'not_marked' }: AttendanceBadgeProps) {
  switch (status) {
    case 'present':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
          <CheckCircle className="w-3.5 h-3.5" />
          Present
        </span>
      );
    case 'absent':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
          <AlertCircle className="w-3.5 h-3.5" />
          Absent
        </span>
      );
    case 'late':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <Clock className="w-3.5 h-3.5" />
          Late
        </span>
      );
    case 'excused':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
          <HelpCircle className="w-3.5 h-3.5" />
          Excused
        </span>
      );
    case 'not_marked':
    default:
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Not Marked
        </span>
      );
  }
}
