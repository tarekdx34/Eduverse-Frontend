import { ReactNode } from 'react';
import { cn } from '../../../../utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: string | number;
    positive?: boolean;
  };
  className?: string;
  size?: 'sm' | 'md';
}

export function MetricCard({ label, value, icon, change, className, size = 'md' }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        'transition-all duration-300 hover:shadow-md',
        size === 'sm' ? 'p-4' : 'p-5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className={cn(
          'font-bold text-gray-900 dark:text-white',
          size === 'sm' ? 'text-xl' : 'text-2xl'
        )}>
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium mb-0.5',
              change.positive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {change.positive ? '+' : ''}{change.value}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
