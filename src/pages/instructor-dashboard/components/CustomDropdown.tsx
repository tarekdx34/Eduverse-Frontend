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
};

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

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
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{label}</span>}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 min-w-[150px] justify-between ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span className={isDark ? 'text-slate-200' : 'text-gray-900'}>{selectedOption?.label || placeholder}</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isDark ? 'text-slate-500' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className={`absolute top-full left-0 mt-1 w-full border rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto ${
            isDark
              ? 'bg-card-dark border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                  option.value === value
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                      : 'bg-indigo-50 text-indigo-700 font-medium'
                    : isDark
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDropdown;
