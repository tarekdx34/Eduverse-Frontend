import { cn } from '../../../../utils/cn';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const statusStyles: Record<StatusType, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
  pending: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
};

const statusMap: Record<string, StatusType> = {
  active: 'success',
  completed: 'success',
  approved: 'success',
  present: 'success',
  passed: 'success',
  paid: 'success',
  healthy: 'success',
  valid: 'success',
  
  pending: 'pending',
  processing: 'pending',
  in_progress: 'pending',
  waiting: 'pending',
  
  warning: 'warning',
  expiring: 'warning',
  late: 'warning',
  
  failed: 'error',
  error: 'error',
  rejected: 'error',
  absent: 'error',
  expired: 'error',
  critical: 'error',
  
  info: 'info',
  
  inactive: 'neutral',
  draft: 'neutral',
  archived: 'neutral',
  unknown: 'neutral',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({ status, label, size = 'md', dot = false, className }: StatusBadgeProps) {
  const statusType = statusMap[status.toLowerCase()] || 'neutral';
  const styles = statusStyles[statusType];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', styles.dot)} />}
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
