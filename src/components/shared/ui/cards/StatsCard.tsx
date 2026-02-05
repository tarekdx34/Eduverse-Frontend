import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface StatsCardProps {
  label: string;
  value: string | number;
  maxValue?: string | number;
  comparison?: string;
  isPositive?: boolean | null;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  label,
  value,
  maxValue,
  comparison,
  isPositive,
  icon,
  trend,
  trendValue,
  className,
  variant = 'default',
  size = 'md',
  onClick,
  loading = false,
}: StatsCardProps) {
  const effectiveTrend = trend || (isPositive === true ? 'up' : isPositive === false ? 'down' : 'neutral');
  
  const trendColors = {
    up: 'text-green-500 bg-green-50 dark:bg-green-900/30',
    down: 'text-red-500 bg-red-50 dark:bg-red-900/30',
    neutral: 'text-gray-500 bg-gray-50 dark:bg-gray-700',
  };

  const TrendIcon = effectiveTrend === 'up' ? TrendingUp : effectiveTrend === 'down' ? TrendingDown : Minus;

  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0',
    outline: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const progress = maxValue ? (parseFloat(String(value)) / parseFloat(String(maxValue))) * 100 : null;

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-2xl transition-all duration-300',
          variantStyles[variant],
          sizeStyles[size],
          'animate-pulse',
          className
        )}
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-300 group',
        variantStyles[variant],
        sizeStyles[size],
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn(
            'text-sm font-medium',
            variant === 'gradient' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-xl transition-transform duration-300 group-hover:scale-110',
              variant === 'gradient'
                ? 'bg-white/20'
                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span
          className={cn(
            'text-3xl font-bold tracking-tight',
            variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white'
          )}
        >
          {value}
        </span>
        {maxValue && (
          <span
            className={cn(
              'text-lg mb-1',
              variant === 'gradient' ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            / {maxValue}
          </span>
        )}
      </div>

      {progress !== null && (
        <div className="mb-3">
          <div
            className={cn(
              'h-2 rounded-full overflow-hidden',
              variant === 'gradient' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                variant === 'gradient'
                  ? 'bg-white'
                  : progress >= 80
                    ? 'bg-green-500'
                    : progress >= 50
                      ? 'bg-yellow-500'
                      : 'bg-indigo-500'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {(comparison || trendValue) && (
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', trendColors[effectiveTrend])}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
          {comparison && (
            <span
              className={cn(
                'text-xs',
                variant === 'gradient' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {comparison}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsCard;
