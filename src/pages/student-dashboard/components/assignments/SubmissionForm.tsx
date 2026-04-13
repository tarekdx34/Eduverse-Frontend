import { useState, useCallback } from 'react';
import { FileText, Upload, Link2, HardDrive, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StudentAssignmentService } from './assignmentService';
import { LateWarning } from './shared';
import TextSubmission from './TextSubmission';
import FileUpload from './FileUpload';
import LinkSubmission from './LinkSubmission';
import DriveFileSelector from './DriveFileSelector';
import type { Assignment, SubmissionType, DriveFile } from './types';

type TabType = 'text' | 'file' | 'link' | 'drive';

interface SubmissionFormProps {
  assignment: Assignment;
  onSubmitSuccess: () => void;
  disabled?: boolean;
}

/**
 * SubmissionForm - Main container for all submission types
 */
export function SubmissionForm({ assignment, onSubmitSuccess, disabled = false }: SubmissionFormProps) {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();

  // Determine available tabs based on submission type
  const getAvailableTabs = (): TabType[] => {
    switch (assignment.submissionType) {
      case 'text':
        return ['text'];
      case 'file':
        return ['file', 'drive'];
      case 'link':
        return ['link'];
      case 'any':
      default:
        return ['text', 'file', 'link', 'drive'];
    }
  };

  const availableTabs = getAvailableTabs();
  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state for each type
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [driveFile, setDriveFile] = useState<DriveFile | null>(null);

  // Validation
  const isValid = useCallback((): boolean => {
    switch (activeTab) {
      case 'text':
        return textContent.trim().length > 0;
      case 'file':
        return files.length > 0;
      case 'link':
        try {
          new URL(linkUrl);
          return true;
        } catch {
          return false;
        }
      case 'drive':
        return driveFile !== null;
      default:
        return false;
    }
  }, [activeTab, textContent, files, linkUrl, driveFile]);

  const handleSubmit = useCallback(async () => {
    if (!isValid() || submitting || disabled) return;

    setSubmitting(true);
    setUploadProgress('');
    try {
      switch (activeTab) {
        case 'text':
          await StudentAssignmentService.submitText(assignment.id, textContent);
          break;
        case 'file':
          // Two-step process: 1) Upload file, 2) Submit with fileId
          setUploadProgress('Uploading file...');
          const { fileId } = await StudentAssignmentService.uploadSubmissionFile(assignment.id, files[0]);
          
          setUploadProgress('Submitting assignment...');
          await StudentAssignmentService.submitWithFileId(assignment.id, fileId);
          break;
        case 'link':
          await StudentAssignmentService.submitLink(assignment.id, linkUrl);
          break;
        case 'drive':
          if (driveFile) {
            await StudentAssignmentService.submitWithFileId(assignment.id, driveFile.id);
          }
          break;
      }

      toast.success('Assignment submitted successfully!');
      onSubmitSuccess();

      // Clear form
      setTextContent('');
      setFiles([]);
      setLinkUrl('');
      setDriveFile(null);
      setShowConfirmation(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit assignment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [activeTab, assignment.id, disabled, driveFile, files, isValid, linkUrl, onSubmitSuccess, submitting, textContent]);

  const tabConfig: Record<TabType, { icon: React.ReactNode; label: string }> = {
    text: { icon: <FileText className="w-4 h-4" />, label: 'Text' },
    file: { icon: <Upload className="w-4 h-4" />, label: 'File Upload' },
    link: { icon: <Link2 className="w-4 h-4" />, label: 'Link' },
    drive: { icon: <HardDrive className="w-4 h-4" />, label: 'Google Drive' },
  };

  // Check if submission will be late
  const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`p-5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {t('submitYourWork') || 'Submit Your Work'}
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {assignment.submissionType === 'any'
            ? t('chooseHowToSubmit') || 'Choose how you want to submit your work'
            : (() => {
                const template = t('submitYourType');
                return template && template !== 'submitYourType'
                  ? template.replace('{{type}}', assignment.submissionType)
                  : `Submit your ${assignment.submissionType} submission`;
              })()}
        </p>
      </div>

      {/* Tabs */}
      {availableTabs.length > 1 && (
        <div className={`flex border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={disabled || submitting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? isDark
                    ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] bg-white/5'
                    : 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              } ${disabled || submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tabConfig[tab].icon}
              <span className="hidden sm:inline">{tabConfig[tab].label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Late warning */}
        {isLate && assignment.dueDate && (
          <LateWarning dueDate={assignment.dueDate} latePenalty={assignment.latePenalty} />
        )}

        {/* Tab content */}
        {activeTab === 'text' && (
          <TextSubmission
            assignmentId={assignment.id}
            value={textContent}
            onChange={setTextContent}
            disabled={disabled || submitting}
          />
        )}

        {activeTab === 'file' && (
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            maxFileSize={assignment.maxFileSize}
            allowedFileTypes={assignment.allowedFileTypes}
            disabled={disabled || submitting}
          />
        )}

        {activeTab === 'link' && (
          <LinkSubmission
            value={linkUrl}
            onChange={setLinkUrl}
            disabled={disabled || submitting}
          />
        )}

        {activeTab === 'drive' && (
          <DriveFileSelector
            selectedFile={driveFile}
            onSelect={setDriveFile}
            disabled={disabled || submitting}
          />
        )}

        {/* Submit button */}
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={!isValid() || submitting || disabled}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
            isValid() && !submitting && !disabled
              ? 'bg-[var(--accent-color)] text-white hover:opacity-90 hover:shadow-lg'
              : isDark
                ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('submitting') || 'Submitting...'}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('submitAssignment') || 'Submit Assignment'}</span>
            </>
          )}
        </button>

        {!isValid() && !disabled && (
          <p className={`text-center text-sm flex items-center justify-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <AlertCircle className="w-4 h-4" />
            {activeTab === 'text' && (t('enterResponseToSubmit') || 'Enter your response to submit')}
            {activeTab === 'file' && (t('attachFileToSubmit') || 'Attach a file to submit')}
            {activeTab === 'link' && (t('enterValidUrlToSubmit') || 'Enter a valid URL to submit')}
            {activeTab === 'drive' && (t('selectDriveFileToSubmit') || 'Select a file from Google Drive')}
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl ${
              isDark ? 'bg-card-dark' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[var(--accent-color)]" />
              </div>
              <h3 className={`text-lg font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('confirmSubmission') || 'Confirm Submission'}
              </h3>
              <p className={`text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('confirmSubmissionMessage') || 'Are you sure you want to submit this assignment?'}
              </p>

              {isLate && (
                <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                        {t('lateSubmission') || 'Late Submission'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                        {t('lateSubmissionMarked') || 'This submission will be marked as late.'}
                        {assignment.latePenalty && ` A ${assignment.latePenalty}% penalty may apply.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors bg-[var(--accent-color)] text-white hover:opacity-90 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('submitting') || 'Submitting...'}
                    </span>
                  ) : (
                    t('confirm') || 'Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionForm;
