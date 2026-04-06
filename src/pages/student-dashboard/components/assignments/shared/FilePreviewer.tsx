import { FileText, Image, Film, Music, Archive, File, Download, ExternalLink } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface FilePreviewerProps {
  file?: {
    id?: number;
    name: string;
    url?: string;
    mimeType?: string;
    size?: number;
  };
  localFile?: File;
  onRemove?: () => void;
  showDownload?: boolean;
  compact?: boolean;
}

/**
 * FilePreviewer - Preview uploaded files with type icons
 */
export function FilePreviewer({
  file,
  localFile,
  onRemove,
  showDownload = true,
  compact = false,
}: FilePreviewerProps) {
  const { isDark } = useTheme() as { isDark: boolean };

  const fileName = file?.name || localFile?.name || 'Unknown file';
  const fileSize = file?.size || localFile?.size;
  const fileUrl = file?.url;

  const getFileExtension = (): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || '';
  };

  const getFileIcon = () => {
    const ext = getFileExtension();
    const iconClass = compact ? 'w-5 h-5' : 'w-6 h-6';

    // Document types
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      return <FileText className={`${iconClass} text-blue-500`} />;
    }
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return <Image className={`${iconClass} text-green-500`} />;
    }
    // Video types
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(ext)) {
      return <Film className={`${iconClass} text-purple-500`} />;
    }
    // Audio types
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
      return <Music className={`${iconClass} text-pink-500`} />;
    }
    // Archive types
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className={`${iconClass} text-amber-500`} />;
    }
    // Default
    return <File className={`${iconClass} text-slate-500`} />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIconBackground = () => {
    const ext = getFileExtension();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      return isDark ? 'bg-blue-900/30' : 'bg-blue-50';
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return isDark ? 'bg-green-900/30' : 'bg-green-50';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(ext)) {
      return isDark ? 'bg-purple-900/30' : 'bg-purple-50';
    }
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
      return isDark ? 'bg-pink-900/30' : 'bg-pink-50';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return isDark ? 'bg-amber-900/30' : 'bg-amber-50';
    }
    return isDark ? 'bg-white/5' : 'bg-slate-50';
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-md ${getIconBackground()}`}>{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {fileName}
          </p>
          {fileSize && (
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {formatFileSize(fileSize)}
            </p>
          )}
        </div>
        {showDownload && fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className={`p-1.5 rounded-lg transition-colors text-red-500 ${
              isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
            }`}
          >
            <span className="sr-only">Remove file</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${getIconBackground()}`}>{getFileIcon()}</div>
        <div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{fileName}</p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {getFileExtension().toUpperCase()}
            {fileSize && ` • ${formatFileSize(fileSize)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showDownload && fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
            title="Open file"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
        {showDownload && fileUrl && (
          <a
            href={fileUrl}
            download={fileName}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
            title="Download file"
          >
            <Download className="w-5 h-5" />
          </a>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className={`p-2 rounded-lg transition-colors text-red-500 ${
              isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
            }`}
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * FileList - Display multiple files
 */
interface FileListProps {
  files: Array<{
    id?: number;
    name: string;
    url?: string;
    mimeType?: string;
    size?: number;
  }>;
  onRemove?: (index: number) => void;
  compact?: boolean;
}

export function FileList({ files, onRemove, compact = false }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <FilePreviewer
          key={file.id || index}
          file={file}
          onRemove={onRemove ? () => onRemove(index) : undefined}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default FilePreviewer;
