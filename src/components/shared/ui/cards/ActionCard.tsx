import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  badge?: string;
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600',
    icon: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    text: 'text-gray-900 dark:text-white',
    description: 'text-gray-500 dark:text-gray-400',
  },
  primary: {
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 border-0',
    icon: 'bg-white/20 text-white',
    text: 'text-white',
    description: 'text-indigo-100',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0',
    icon: 'bg-white/20 text-white',
    text: 'text-white',
    description: 'text-green-100',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0',
    icon: 'bg-white/20 text-white',
    text: 'text-white',
    description: 'text-amber-100',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0',
    icon: 'bg-white/20 text-white',
    text: 'text-white',
    description: 'text-red-100',
  },
};

export function ActionCard({
  title,
  description,
  icon,
  onClick,
  href,
  variant = 'default',
  badge,
  disabled = false,
  className,
}: ActionCardProps) {
  const styles = variantStyles[variant];

  const Content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl transition-all duration-300', styles.icon)}>
          {icon}
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
            {badge}
          </span>
        )}
      </div>
      <h3 className={cn('font-semibold text-lg mb-1', styles.text)}>{title}</h3>
      {description && (
        <p className={cn('text-sm mb-4', styles.description)}>{description}</p>
      )}
      <div
        className={cn(
          'flex items-center gap-1 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1',
          variant === 'default' ? 'text-indigo-600 dark:text-indigo-400' : 'text-white/90'
        )}
      >
        <span>Get Started</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </>
  );

  const baseClasses = cn(
    'block p-6 rounded-2xl transition-all duration-300 group cursor-pointer',
    'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    styles.bg,
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
    className
  );

  if (href && !disabled) {
    return (
      <a href={href} className={baseClasses}>
        {Content}
      </a>
    );
  }

  return (
    <div onClick={disabled ? undefined : onClick} className={baseClasses}>
      {Content}
    </div>
  );
}

export default ActionCard;
