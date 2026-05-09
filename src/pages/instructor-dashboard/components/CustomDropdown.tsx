import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
  disabled?: boolean;
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
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const theme = useTheme() as any;
  const isDark = theme?.isDark ?? false;
  const primaryHex = theme?.primaryHex ?? '#3b82f6';

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    updatePosition();
    setIsOpen((o) => !o);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const popover = isOpen ? ReactDOM.createPortal(
    <div
      ref={popoverRef}
      style={popoverStyle}
      className={`border rounded-lg shadow-lg max-h-60 overflow-x-hidden overflow-y-auto ${
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
    </div>,
    document.body,
  ) : null;

  return (
    <div
      className={`flex ${stackLabel ? 'flex-col items-start gap-1.5' : 'items-center gap-2'} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {label && (
        <span className={`text-sm whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {label}
        </span>
      )}
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`px-4 py-2 border rounded-lg text-sm transition-colors flex items-center gap-2 ${fullWidth ? 'w-full' : 'min-w-[180px]'} justify-between ${
            disabled
              ? isDark ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed' : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
              : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-300 hover:bg-gray-50'
          } outline-none ${isOpen ? 'ring-2' : ''}`}
          style={isOpen ? ({ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties) : undefined}
        >
          <span className={`truncate ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 transition-transform ${isDark ? 'text-slate-500' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {popover}
      </div>
    </div>
  );
}

export default CustomDropdown;
