import { useState } from 'react';
import { Upload, Send, Loader2, CheckCircle, AlertCircle, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import { LabService } from '../../../../services/api/labService';

interface SubmissionFormProps {
  labId: string;
  isDark?: boolean;
  accentColor?: string;
  onSubmitSuccess: () => void;
  allowedFileTypes?: string | null;
  maxFileSizeMb?: number | null;
}

export function SubmissionForm({
  labId,
  isDark,
  accentColor = '#3b82f6',
  onSubmitSuccess,
  allowedFileTypes,
  maxFileSizeMb,
}: SubmissionFormProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const parseAllowedExtensions = (): string[] => {
    if (!allowedFileTypes) return [];
    return allowedFileTypes
      .split(',')
      .map((ext) => ext.trim().toLowerCase())
      .filter((ext) => ext.startsWith('.'))
      .map((ext) => ext);
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (maxFileSizeMb) {
      const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size exceeds the maximum allowed size of ${maxFileSizeMb}MB`;
      }
    }

    // Check file type
    const allowedExtensions = parseAllowedExtensions();
    if (allowedExtensions.length > 0) {
      const fileName = file.name.toLowerCase();
      const fileExtension = '.' + fileName.split('.').pop();
      if (!allowedExtensions.includes(fileExtension)) {
        return `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`;
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        toast.error(error);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const getAcceptAttribute = (): string => {
    const extensions = parseAllowedExtensions();
    if (extensions.length === 0) {
      return '*';
    }
    return extensions.join(',');
  };

  const handleSubmit = async () => {
    if (!submissionText && !selectedFile) {
      return;
    }

    setSubmitting(true);

    try {
      await LabService.submit(labId, submissionText, selectedFile || undefined);
      toast.success('Lab submitted successfully!');
      setSubmitSuccess(true);
      setSubmissionText('');
      setSelectedFile(null);
      setFileError(null);
      onSubmitSuccess();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit lab:', error);
      toast.error('Failed to submit lab. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const hasRestrictions = allowedFileTypes || maxFileSizeMb;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="submission-text"
          className={'block text-sm font-medium mb-2 ' + textSecondary}
        >
          Submission Text
        </label>
        <textarea
          id="submission-text"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="Enter your submission text here..."
          rows={6}
          className={
            'w-full p-3 rounded-xl border focus:ring-2 focus:border-transparent ' +
            (isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400')
          }
          style={{ '--tw-ring-color': accentColor } as any}
        />
      </div>

      <div>
        <label
          htmlFor="lab-file-upload"
          className={'block text-sm font-medium mb-2 ' + textSecondary}
        >
          Attach File (Optional)
        </label>
        
        {hasRestrictions && (
          <div
            className={`flex items-start gap-2 mb-2 p-3 rounded-lg ${
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {allowedFileTypes && (
                <p>
                  <strong>Allowed file types:</strong> {allowedFileTypes}
                </p>
              )}
              {maxFileSizeMb && (
                <p>
                  <strong>Maximum file size:</strong> {maxFileSizeMb}MB
                </p>
              )}
            </div>
          </div>
        )}

        <div
          className={
            'border-2 border-dashed rounded-xl p-4 text-center transition-colors ' +
            (fileError
              ? isDark
                ? 'border-red-500/50 bg-red-500/5'
                : 'border-red-300 bg-red-50'
              : isDark
                ? 'border-white/10 hover:border-white/20'
                : 'border-slate-200 hover:border-slate-300')
          }
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="lab-file-upload"
            accept={getAcceptAttribute()}
          />
          <label htmlFor="lab-file-upload" className="cursor-pointer block">
            <Upload className={'w-8 h-8 mx-auto mb-2 ' + textSecondary} />
            <p className={textSecondary}>
              {selectedFile ? selectedFile.name : 'Click to upload a file'}
            </p>
          </label>
        </div>

        {fileError && (
          <div className="flex items-center gap-2 mt-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{fileError}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || (!submissionText && !selectedFile)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        style={{ backgroundColor: accentColor }}
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Lab
          </>
        )}
      </button>

      {submitSuccess && (
        <div className="flex items-center justify-center gap-2 text-emerald-500 mt-4">
          <CheckCircle className="w-5 h-5" />
          <span>Lab submitted successfully!</span>
        </div>
      )}
    </div>
  );
}
