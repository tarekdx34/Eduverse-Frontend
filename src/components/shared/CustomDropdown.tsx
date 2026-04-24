import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal, flushSync } from 'react-dom';
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

type MenuCoords = { top: number; left: number; width: number; maxHeight: number };

function computeMenuCoords(triggerEl: HTMLElement): MenuCoords {
  const rect = triggerEl.getBoundingClientRect();
  const gap = 8;
  const viewportPad = 12;
  const preferredMax = 256;
  const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPad;
  const spaceAbove = rect.top - gap - viewportPad;
  let top = rect.bottom + gap;
  let maxHeight = Math.min(preferredMax, Math.max(96, spaceBelow));

  if (spaceBelow < 120 && spaceAbove > spaceBelow) {
    maxHeight = Math.min(preferredMax, Math.max(96, spaceAbove));
    top = Math.max(viewportPad, rect.top - gap - maxHeight);
  }

  let left = rect.left;
  let width = rect.width;
  if (left + width > window.innerWidth - viewportPad) {
    left = Math.max(viewportPad, window.innerWidth - width - viewportPad);
  }
  if (left < viewportPad) {
    width = Math.min(width, window.innerWidth - viewportPad * 2);
    left = viewportPad;
  }

  return { top, left, width, maxHeight };
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
  const [menuCoords, setMenuCoords] = useState<MenuCoords | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateMenuPosition = useCallback(() => {
    const el = triggerWrapRef.current;
    if (!el) return;
    setMenuCoords(computeMenuCoords(el));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuCoords(null);
      return;
    }
    updateMenuPosition();
    const el = triggerWrapRef.current;
    const ro = el ? new ResizeObserver(() => updateMenuPosition()) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: MouseEvent | PointerEvent) {
      const t = event.target as Node;
      if (triggerWrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setIsOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isOpen]);

  const menuPanel =
    isOpen &&
    menuCoords &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuRef}
        role="listbox"
        className={`fixed z-[9999] rounded-2xl shadow-xl border overflow-y-auto py-2 animate-in fade-in zoom-in duration-150 ${
          isDark
            ? 'bg-[#1e293b] border-slate-700 shadow-black/50'
            : 'bg-white border-gray-200 shadow-slate-200/50'
        }`}
        style={{
          top: menuCoords.top,
          left: menuCoords.left,
          width: menuCoords.width,
          maxHeight: menuCoords.maxHeight,
        }}
      >
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
              role="option"
              aria-selected={value === option.value}
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
              {value === option.value && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          ))
        )}
      </div>,
      document.body,
    );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}

      <div className="relative" ref={triggerWrapRef}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }
            const el = triggerWrapRef.current;
            if (el) {
              const coords = computeMenuCoords(el);
              flushSync(() => {
                setMenuCoords(coords);
                setIsOpen(true);
              });
            } else {
              setIsOpen(true);
            }
          }}
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
      </div>
      {menuPanel}
    </div>
  );
}

export default CustomDropdown;
