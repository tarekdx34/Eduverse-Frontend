import { CheckCircle } from 'lucide-react';
import type { LabSubmission } from '../../../../services/api/labService';
import { useLanguage } from '../../contexts/LanguageContext';

interface MySubmissionProps {
  submission: LabSubmission;
  maxScore: string | number;
  isDark?: boolean;
}

export function MySubmission({ submission, maxScore, isDark }: MySubmissionProps) {
  const { language } = useLanguage();

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div
        className={
          'p-5 rounded-xl border ' +
          (isDark
            ? 'bg-emerald-900/20 border-emerald-800/50'
            : 'bg-emerald-50 border-emerald-200')
        }
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span
              className={'font-medium ' + (isDark ? 'text-emerald-400' : 'text-emerald-700')}
            >
              Submitted
            </span>
          </div>
          {submission.score && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-white shadow-sm text-slate-800'}`}>
              Score: {submission.score}/{maxScore}
            </div>
          )}
        </div>
        
        <p className={'text-sm ' + (isDark ? 'text-emerald-300' : 'text-emerald-600')}>
          Submitted at: {formatDateTime(submission.submittedAt)}
        </p>
        
        {submission.submissionText && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-slate-600'}`}>
            <p className="font-medium mb-1">Your response:</p>
            <p className="whitespace-pre-wrap">{submission.submissionText}</p>
          </div>
        )}

        {submission.fileId && (
          <div className="mt-4">
            <a
              href={`/api/drive/files/${submission.fileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'}`}
            >
              📎 View Submitted File
            </a>
          </div>
        )}

        {submission.feedback && (
          <div className={`mt-4 p-4 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <p className="font-semibold mb-1">Instructor Feedback:</p>
            <p className="whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}
