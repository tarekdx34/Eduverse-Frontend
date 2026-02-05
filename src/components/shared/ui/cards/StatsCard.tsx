import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../../utils/cn';

// Color themes for different dashboard roles
type ColorTheme = 'indigo' | 'green' | 'purple' | 'cyan' | 'amber' | 'red' | 'blue' | 'emerald' | 'orange';

const colorThemes: Record<ColorTheme, { bg: string; icon: string; iconBg: string; progress: string }> = {
  indigo: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    progress: 'bg-indigo-500',
  },
  green: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    progress: 'bg-green-500',
  },
  purple: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    progress: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
    progress: 'bg-cyan-500',
  },
  amber: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    progress: 'bg-amber-500',
  },
  red: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    progress: 'bg-red-500',
  },
  blue: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    progress: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    progress: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-white dark:bg-gray-800',
    icon: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    progress: 'bg-orange-500',
  },
};

interface StatsCardProps {
  // Support both naming conventions
  label?: string;
  title?: string;
  value: string | number;
  valueSuffix?: string;
  maxValue?: string | number;
  subtitle?: string;
  comparison?: string;
  isPositive?: boolean | null;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral' | { value: number | string; label: string; isPositive: boolean };
  trendValue?: string;
  progress?: { current: number; max: number };
  color?: ColorTheme;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  loading?: boolean;
}

export function StatsCard({
  label,
  title,
  value,
  valueSuffix,
  maxValue,
  subtitle,
  comparison,
  isPositive,
  icon,
  trend,
  trendValue,
  progress,
  color = 'indigo',
  className,
  variant = 'default',
  size = 'md',
  onClick,
  loading = false,
}: StatsCardProps) {
  // Support both label and title props
  const displayLabel = label || title || '';
  
  // Get color theme
  const theme = colorThemes[color];
  
  // Handle both trend formats
  let effectiveTrend: 'up' | 'down' | 'neutral' = 'neutral';
  let displayTrendValue: string | undefined = trendValue;
  let displayComparison: string | undefined = comparison || subtitle;
  
  if (typeof trend === 'object' && trend !== null) {
    effectiveTrend = trend.isPositive ? 'up' : 'down';
    displayTrendValue = String(trend.value);
    displayComparison = trend.label;
  } else if (typeof trend === 'string') {
    effectiveTrend = trend;
  } else if (isPositive === true) {
    effectiveTrend = 'up';
  } else if (isPositive === false) {
    effectiveTrend = 'down';
  }
  
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

  // Calculate progress from either format
  const progressPercent = progress 
    ? (progress.current / progress.max) * 100 
    : maxValue 
      ? (parseFloat(String(value)) / parseFloat(String(maxValue))) * 100 
      : null;

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
          {displayLabel}
        </span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-xl transition-transform duration-300 group-hover:scale-110',
              variant === 'gradient'
                ? 'bg-white/20'
                : `${theme.iconBg} ${theme.icon}`
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span
          className={cn(
            'text-3xl font-bold tracking-tight',
            variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white'
          )}
        >
          {value}{valueSuffix}
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

      {progressPercent !== null && (
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
                variant === 'gradient' ? 'bg-white' : theme.progress
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {(displayComparison || displayTrendValue) && (
        <div className="flex items-center gap-2">
          {displayTrendValue && (
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', trendColors[effectiveTrend])}>
              <TrendIcon className="w-3 h-3" />
              <span>{displayTrendValue}</span>
            </div>
          )}
          {displayComparison && (
            <span
              className={cn(
                'text-xs',
                variant === 'gradient' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {displayComparison}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsCard;
