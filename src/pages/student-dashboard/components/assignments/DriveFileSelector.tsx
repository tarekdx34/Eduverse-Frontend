import { useState, useCallback } from 'react';
import { HardDrive, Search, Loader2, File, FileText, Image, Film, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { DriveFile } from './types';

interface DriveFileSelectorProps {
  selectedFile: DriveFile | null;
  onSelect: (file: DriveFile | null) => void;
  disabled?: boolean;
}

/**
 * DriveFileSelector - Select files from Google Drive
 * Note: This is a simplified implementation. Full Google Drive integration
 * would require the Google Drive Picker API or similar.
 */
export function DriveFileSelector({
  selectedFile,
  onSelect,
  disabled = false,
}: DriveFileSelectorProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Note: In a real implementation, these would come from Google Drive API
  const [files] = useState<DriveFile[]>([]);

  const handleOpenPicker = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setError(null);

    // Simulate loading Drive files
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // In real implementation, fetch files from Google Drive API
    }, 1000);
  }, [disabled]);

  const handleSelectFile = useCallback(
    (file: DriveFile) => {
      onSelect(file);
      setIsOpen(false);
    },
    [onSelect]
  );

  const handleRemoveFile = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-5 h-5" />;
    if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    if (mimeType.includes('video')) {
      return <Film className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Selected file display
  if (selectedFile) {
    return (
      <div className="space-y-3">
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-white'
              }`}
            >
              {getFileIcon(selectedFile.mimeType)}
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {selectedFile.name}
              </p>
              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <HardDrive className="w-3 h-3" />
                <span>Google Drive</span>
                {selectedFile.size && <span>• {formatFileSize(selectedFile.size)}</span>}
              </div>
            </div>
          </div>

          {!disabled && (
            <button
              onClick={handleRemoveFile}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20'
                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Open picker button */}
      <button
        onClick={handleOpenPicker}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all ${
          disabled
            ? isDark
              ? 'border-white/5 bg-white/5 text-slate-600 cursor-not-allowed'
              : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            : isDark
              ? 'border-white/10 hover:border-[var(--accent-color)] hover:bg-white/5 text-white'
              : 'border-slate-200 hover:border-[var(--accent-color)] hover:bg-slate-50 text-slate-700'
        }`}
      >
        <div
          className={`p-3 rounded-xl ${
            isDark ? 'bg-white/5' : 'bg-slate-100'
          }`}
        >
          <HardDrive className="w-6 h-6 text-[var(--accent-color)]" />
        </div>
        <div className="text-left">
          <p className="font-medium">Select from Google Drive</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Choose a file from your Drive
          </p>
        </div>
      </button>

      {/* Picker modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl ${
              isDark ? 'bg-card-dark' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Select from Google Drive
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-[var(--accent-color)]'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[var(--accent-color)]'
                  } focus:outline-none`}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin mb-3" />
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    Loading files...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                  <p className="text-red-500">{error}</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <HardDrive className={`w-12 h-12 mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No files found
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Google Drive integration requires setup
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files
                    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFile(file)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-white/5'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isDark ? 'bg-white/5' : 'bg-slate-100'
                          }`}
                        >
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {file.name}
                          </p>
                          {file.size && (
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Note: Full Google Drive integration requires Google API setup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Select a file directly from your Google Drive
      </p>
    </div>
  );
}

export default DriveFileSelector;
