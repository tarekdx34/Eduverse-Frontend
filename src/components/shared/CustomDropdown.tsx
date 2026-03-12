import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onSelectOption?: (option: DropdownOption) => void;
  className?: string;
  placeholder?: string;
  accentColor?: string;
}

export function CustomDropdown({
  label,
  options,
  value,
  onChange,
  isDark,
  onSelectOption,
  className = '',
  placeholder = 'Select an option',
  accentColor = '#7C3AED',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
            isDark
              ? 'bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-500 hover:bg-slate-800/60'
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
          }`}
          style={{ borderColor: isOpen ? accentColor : undefined }}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption?.label || placeholder}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute z-50 w-full mt-2 rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in duration-150 ${
              isDark
                ? 'bg-[#1e293b] border-slate-700 shadow-black/50'
                : 'bg-white border-gray-200 shadow-slate-200/50'
            }`}
          >
            <div className="max-h-64 overflow-y-auto py-2">
              {options.length === 0 ? (
                <div
                  className={`px-4 py-3 text-sm text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      if (onSelectOption) onSelectOption(option);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                      value !== option.value
                        ? isDark
                          ? 'text-slate-300 hover:bg-white/5'
                          : 'text-gray-700 hover:bg-gray-50'
                        : ''
                    }`}
                    style={
                      value === option.value
                        ? {
                            backgroundColor: isDark ? `${accentColor}20` : `${accentColor}1A`,
                            color: isDark ? accentColor : accentColor,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3 truncate">
                      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {value === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDropdown;
