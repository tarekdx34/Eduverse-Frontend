import { ReactNode } from 'react';
import { cn } from '../../../../utils/cn';

interface WelcomeHeaderProps {
  greeting: string;
  userName: string;
  subtitle?: string;
  highlightText?: string;
  actions?: ReactNode;
  avatar?: string;
  role?: 'student' | 'instructor' | 'admin' | 'it-admin';
  className?: string;
}

const roleGradients = {
  student: 'from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30',
  instructor: 'from-cyan-500/10 via-blue-500/10 to-indigo-500/10 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-indigo-900/30',
  admin: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30',
  'it-admin': 'from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-900/30 dark:via-orange-900/30 dark:to-amber-900/30',
};

const roleBorders = {
  student: 'border-indigo-200 dark:border-indigo-800',
  instructor: 'border-cyan-200 dark:border-cyan-800',
  admin: 'border-emerald-200 dark:border-emerald-800',
  'it-admin': 'border-red-200 dark:border-red-800',
};

export function WelcomeHeader({
  greeting,
  userName,
  subtitle,
  highlightText,
  actions,
  avatar,
  role = 'student',
  className,
}: WelcomeHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 border transition-all duration-300',
        `bg-gradient-to-br ${roleGradients[role]}`,
        roleBorders[role],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={userName}
              className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 shadow-lg"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {greeting}, {userName}! 
              <span className="ml-2">👋</span>
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {subtitle}
                {highlightText && (
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1">
                    {highlightText}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="hidden lg:flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeHeader;
