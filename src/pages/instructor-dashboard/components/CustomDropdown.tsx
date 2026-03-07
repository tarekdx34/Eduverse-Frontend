import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  stackLabel?: boolean;
};

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  fullWidth = false,
  stackLabel = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const theme = useTheme() as any;
  const isDark = theme?.isDark ?? false;
  const primaryHex = theme?.primaryHex ?? '#3b82f6';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`flex ${stackLabel ? 'flex-col items-start gap-1.5' : 'items-center gap-2'} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {label && (
        <span
          className={`text-sm whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
        >
          {label}
        </span>
      )}
      <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 border rounded-lg text-sm transition-colors flex items-center gap-2 ${fullWidth ? 'w-full' : 'min-w-[180px]'} justify-between ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-300 hover:bg-gray-50'
          } outline-none ${isOpen ? 'ring-2' : ''}`}
          style={
            isOpen ? ({ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties) : undefined
          }
        >
          <span className={`truncate ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isDark ? 'text-slate-500' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute top-full left-0 mt-1 min-w-full w-max border rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto ${
              isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                  option.value !== value
                    ? isDark
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-gray-700 hover:bg-gray-50'
                    : ''
                }`}
                style={
                  option.value === value
                    ? {
                        backgroundColor: isDark ? `${primaryHex}20` : `${primaryHex}1A`,
                        color: primaryHex,
                        fontWeight: 500,
                      }
                    : undefined
                }
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDropdown;
