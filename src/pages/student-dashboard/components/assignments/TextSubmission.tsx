import { useState, useEffect, useCallback } from 'react';
import { FileText, Save, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDraftStorage } from './hooks/useAssignments';

interface TextSubmissionProps {
  assignmentId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

/**
 * TextSubmission - Text input with auto-save draft functionality
 */
export function TextSubmission({
  assignmentId,
  value,
  onChange,
  disabled = false,
  maxLength = 10000,
  placeholder,
}: TextSubmissionProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const { getDraft, saveDraft, clearDraft } = useDraftStorage(assignmentId);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft && !value) {
      setHasDraft(true);
    }
  }, [getDraft, value]);

  // Auto-save draft with debounce
  useEffect(() => {
    if (disabled) return;

    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        saveDraft(value);
        setLastSaved(new Date());
        setHasDraft(true);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [value, saveDraft, disabled]);

  const handleRestoreDraft = useCallback(() => {
    const draft = getDraft();
    if (draft) {
      onChange(draft);
      setHasDraft(false);
    }
  }, [getDraft, onChange]);

  const handleClearDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
    setLastSaved(null);
  }, [clearDraft]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="space-y-3">
      {/* Draft notification */}
      {hasDraft && !value && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${
            isDark
              ? 'bg-blue-900/20 border-blue-700 text-blue-400'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span className="text-sm">You have a saved draft</span>
          </div>
          <button
            onClick={handleRestoreDraft}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
            }`}
          >
            Restore
          </button>
        </div>
      )}

      {/* Text area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || t('assignments.writeResponse') || 'Write your response here...'}
          rows={8}
          className={`w-full p-4 rounded-xl border-2 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20'
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Submission text"
        />

        {/* Character count */}
        <div
          className={`absolute bottom-3 right-3 text-xs ${
            isNearLimit
              ? 'text-amber-500'
              : isDark
                ? 'text-slate-500'
                : 'text-slate-400'
          }`}
        >
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
        </div>
      </div>

      {/* Footer with draft info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {lastSaved && value && (
            <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Save className="w-3 h-3" />
              Draft saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {value && !disabled && (
          <button
            onClick={() => {
              onChange('');
              handleClearDraft();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20'
                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          Ctrl
        </kbd>
        {' + '}
        <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          Enter
        </kbd>
        {' to submit'}
      </p>
    </div>
  );
}

export default TextSubmission;
