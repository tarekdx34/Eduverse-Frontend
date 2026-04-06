import { Circle, Clock, CheckCircle, XCircle, FileText, Archive } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { AssignmentStatus, SubmissionStatus } from '../types';

interface StatusBadgeProps {
  status: AssignmentStatus | SubmissionStatus | 'not-submitted';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

/**
 * StatusBadge - Shows assignment or submission status
 */
export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const getConfig = () => {
    switch (status) {
      // Assignment statuses
      case 'draft':
        return {
          label: t('draft') || 'Draft',
          icon: <FileText className={iconSize} />,
          styles: isDark
            ? 'bg-slate-800 text-slate-400 border-slate-600'
            : 'bg-slate-100 text-slate-600 border-slate-200',
        };
      case 'published':
        return {
          label: t('published') || 'Published',
          icon: <Circle className={iconSize} />,
          styles: isDark
            ? 'bg-blue-900/50 text-blue-400 border-blue-700'
            : 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'closed':
        return {
          label: t('closed') || 'Closed',
          icon: <XCircle className={iconSize} />,
          styles: isDark
            ? 'bg-red-900/50 text-red-400 border-red-700'
            : 'bg-red-50 text-red-700 border-red-200',
        };
      case 'archived':
        return {
          label: t('archived') || 'Archived',
          icon: <Archive className={iconSize} />,
          styles: isDark
            ? 'bg-slate-800 text-slate-400 border-slate-600'
            : 'bg-slate-100 text-slate-500 border-slate-200',
        };

      // Submission statuses
      case 'pending':
      case 'not-submitted':
        return {
          label: t('notSubmitted') || 'Not Submitted',
          icon: <Circle className={iconSize} />,
          styles: isDark
            ? 'bg-red-900/50 text-red-400 border-red-700'
            : 'bg-red-50 text-red-700 border-red-200',
        };
      case 'submitted':
        return {
          label: t('submitted') || 'Submitted',
          icon: <Clock className={iconSize} />,
          styles: isDark
            ? 'bg-blue-900/50 text-blue-400 border-blue-700'
            : 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'graded':
        return {
          label: t('graded') || 'Graded',
          icon: <CheckCircle className={iconSize} />,
          styles: isDark
            ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };

      default:
        return {
          label: status,
          icon: <Circle className={iconSize} />,
          styles: isDark
            ? 'bg-white/5 text-slate-400 border-white/10'
            : 'bg-slate-50 text-slate-600 border-slate-200',
        };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium capitalize ${sizeClasses} ${config.styles}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}

/**
 * SubmissionStatusBadge - Simplified badge for submission status only
 */
interface SubmissionStatusBadgeProps {
  submissionStatus: SubmissionStatus | null;
  size?: 'sm' | 'md';
}

export function SubmissionStatusBadge({ submissionStatus, size = 'md' }: SubmissionStatusBadgeProps) {
  const status = submissionStatus || 'not-submitted';
  return <StatusBadge status={status as any} size={size} />;
}

export default StatusBadge;
