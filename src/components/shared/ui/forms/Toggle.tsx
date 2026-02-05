import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../../../utils/cn';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    toggle: 'w-8 h-4',
    dot: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    toggle: 'w-11 h-6',
    dot: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    toggle: 'w-14 h-7',
    dot: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, size = 'md', className, disabled, checked, ...props }, ref) => {
    const styles = sizeStyles[size];

    return (
      <label
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              styles.toggle,
              'rounded-full transition-all duration-300',
              'bg-gray-300 dark:bg-gray-600',
              'peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500',
              'peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-900'
            )}
          />
          <div
            className={cn(
              styles.dot,
              'absolute left-0.5 top-0.5 bg-white rounded-full shadow-sm',
              'transition-transform duration-300 ease-out',
              checked && styles.translate
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
