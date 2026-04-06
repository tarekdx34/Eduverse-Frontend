import { useState } from 'react';
import { Upload, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LabService } from '../../../../services/api/labService';

interface SubmissionFormProps {
  labId: string;
  isDark?: boolean;
  accentColor?: string;
  onSubmitSuccess: () => void;
}

export function SubmissionForm({ labId, isDark, accentColor = '#3b82f6', onSubmitSuccess }: SubmissionFormProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText && !selectedFile) {
      console.log('[Submission Debug] Attempted to submit with no text and no file.');
      return;
    }

    setSubmitting(true);
    console.log('[Submission Debug] Submitting lab:', {
      labId,
      submissionTextLength: submissionText.length,
      submissionText,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileType: selectedFile?.type
    });

    try {
      const response = await LabService.submit(labId, submissionText, selectedFile || undefined);
      console.log('[Submission Debug] Submit response:', response);
      toast.success('Lab submitted successfully!');
      setSubmitSuccess(true);
      setSubmissionText('');
      setSelectedFile(null);
      onSubmitSuccess();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('[Submission Debug] Failed to submit lab:', error);
      toast.error('Failed to submit lab. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

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
        <div
          className={
            'border-2 border-dashed rounded-xl p-4 text-center transition-colors ' +
            (isDark
              ? 'border-white/10 hover:border-white/20'
              : 'border-slate-200 hover:border-slate-300')
          }
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="lab-file-upload"
          />
          <label htmlFor="lab-file-upload" className="cursor-pointer block">
            <Upload className={'w-8 h-8 mx-auto mb-2 ' + textSecondary} />
            <p className={textSecondary}>
              {selectedFile ? selectedFile.name : 'Click to upload a file'}
            </p>
          </label>
        </div>
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
