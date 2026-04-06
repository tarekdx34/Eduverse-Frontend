import { CheckCircle, Clock, Save } from 'lucide-react';

interface LabStatusBadgeProps {
  status: 'draft' | 'published' | 'closed' | 'archived';
}

export function LabStatusBadge({ status }: LabStatusBadgeProps) {
  switch (status) {
    case 'published':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          Published
        </span>
      );
    case 'draft':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Save className="w-3.5 h-3.5" />
          Draft
        </span>
      );
    case 'closed':
    case 'archived':
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <Clock className="w-3.5 h-3.5" />
          {status === 'closed' ? 'Closed' : 'Archived'}
        </span>
      );
    default:
      return null;
  }
}
