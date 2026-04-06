import { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFileValidation } from './hooks/useAssignments';
import { FilePreviewer } from './shared';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * FileUpload - Drag and drop file upload with validation
 */
export function FileUpload({
  files,
  onFilesChange,
  maxFileSize,
  allowedFileTypes,
  maxFiles = 1,
  disabled = false,
}: FileUploadProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const { validateFile } = useFileValidation(maxFileSize, allowedFileTypes);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      for (const file of fileArray) {
        if (files.length + validFiles.length >= maxFiles) {
          newErrors.push(`Maximum ${maxFiles} file(s) allowed`);
          break;
        }

        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else if (validation.error) {
          newErrors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
      setErrors(newErrors);

      // Clear errors after 5 seconds
      if (newErrors.length > 0) {
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [files, maxFiles, validateFile, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatAllowedTypes = (): string => {
    if (!allowedFileTypes || allowedFileTypes.length === 0) return 'All file types';
    return allowedFileTypes.map((t) => `.${t.toUpperCase()}`).join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          disabled
            ? isDark
              ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
              : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
            : isDragging
              ? isDark
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                : 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
              : isDark
                ? 'border-white/10 hover:border-[var(--accent-color)] hover:bg-white/5'
                : 'border-slate-200 hover:border-[var(--accent-color)] hover:bg-slate-50'
        }`}
        role="button"
        aria-label="Upload files"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          accept={allowedFileTypes?.map((t) => `.${t}`).join(',')}
          disabled={disabled}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`p-4 rounded-full ${
              isDragging
                ? 'bg-[var(--accent-color)]/20'
                : isDark
                  ? 'bg-white/5'
                  : 'bg-slate-100'
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                isDragging ? 'text-[var(--accent-color)]' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
          </div>

          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              or click to browse
            </p>
          </div>

          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p>{formatAllowedTypes()}</p>
            {maxFileSize && <p>Max size: {formatFileSize(maxFileSize)}</p>}
          </div>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                isDark
                  ? 'bg-red-900/20 text-red-400 border border-red-700'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
            Attached files ({files.length})
          </p>
          {files.map((file, index) => (
            <FilePreviewer
              key={`${file.name}-${index}`}
              localFile={file}
              onRemove={disabled ? undefined : () => handleRemoveFile(index)}
              showDownload={false}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
