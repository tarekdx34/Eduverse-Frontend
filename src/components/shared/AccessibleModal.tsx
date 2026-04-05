import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface AccessibleModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title for accessibility */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Whether to use dark theme */
  isDark?: boolean;
  /** Maximum width class (default: max-w-2xl) */
  maxWidth?: string;
  /** Maximum height class (default: max-h-[90vh]) */
  maxHeight?: string;
  /** Optional additional class names for the modal container */
  className?: string;
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;
}

/**
 * AccessibleModal - A fully accessible modal component with:
 * - Focus trapping (Tab cycles within modal)
 * - Escape key closes modal
 * - ARIA attributes (role="dialog", aria-modal, aria-labelledby)
 * - Focus restoration on close
 * - Visible focus indicators
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  isDark = false,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]',
  className = '',
  showCloseButton = true,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

  // Store the previously focused element and focus the modal on open
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal container for keyboard navigation
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else if (previousActiveElement.current) {
      // Restore focus when modal closes
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      // Focus trap: Tab navigation stays within modal
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`rounded-lg shadow-xl w-full ${maxWidth} ${maxHeight} flex flex-col outline-none ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } ${className}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b shrink-0 ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <div>
            <h2
              id={titleId}
              className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className={`shrink-0 p-6 border-t ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessibleModal;
