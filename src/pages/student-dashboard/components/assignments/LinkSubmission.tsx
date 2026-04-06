import { useState, useCallback } from 'react';
import { Link2, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface LinkSubmissionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * LinkSubmission - URL input with validation and preview
 */
export function LinkSubmission({
  value,
  onChange,
  disabled = false,
  placeholder,
}: LinkSubmissionProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const [touched, setTouched] = useState(false);

  const validateUrl = useCallback((url: string): { valid: boolean; message?: string } => {
    if (!url.trim()) {
      return { valid: false, message: 'URL is required' };
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, message: 'URL must start with http:// or https://' };
      }
      return { valid: true };
    } catch {
      // Try adding https:// prefix
      try {
        new URL(`https://${url}`);
        return { valid: false, message: 'URL must include http:// or https://' };
      } catch {
        return { valid: false, message: 'Please enter a valid URL' };
      }
    }
  }, []);

  const validation = validateUrl(value);
  const showError = touched && value && !validation.valid;
  const showSuccess = value && validation.valid;

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Try to extract domain for display
  const getDomain = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return null;
    }
  };

  const domain = getDomain(value);

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="relative">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <Link2 className="w-5 h-5" />
        </div>

        <input
          type="url"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder || 'https://example.com/my-submission'}
          className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            showError
              ? isDark
                ? 'border-red-700 bg-red-900/10 text-white focus:ring-red-500/20'
                : 'border-red-300 bg-red-50 text-slate-800 focus:ring-red-500/20'
              : showSuccess
                ? isDark
                  ? 'border-emerald-700 bg-emerald-900/10 text-white focus:ring-emerald-500/20'
                  : 'border-emerald-300 bg-emerald-50 text-slate-800 focus:ring-emerald-500/20'
                : isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20'
                  : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Submission URL"
          aria-invalid={showError}
          aria-describedby={showError ? 'url-error' : undefined}
        />

        {/* Status icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {showError && <AlertCircle className="w-5 h-5 text-red-500" />}
          {showSuccess && <CheckCircle className="w-5 h-5 text-emerald-500" />}
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <p id="url-error" className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {validation.message}
        </p>
      )}

      {/* URL Preview */}
      {showSuccess && domain && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-white'
              }`}
            >
              <Link2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {domain}
              </p>
              <p className={`text-xs truncate max-w-[300px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {value}
              </p>
            </div>
          </div>

          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Help text */}
      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Paste a link to your work (Google Docs, GitHub, Figma, etc.)
      </p>
    </div>
  );
}

export default LinkSubmission;
