import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, User, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GradingModal } from './GradingModal';

type Submission = {
  id: string;
  labId: string;
  studentName: string;
  submittedAt: string;
  files: { name: string; size: string }[];
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
};

type GradingPageProps = {
  submissions: Submission[];
  onGrade: (submissionId: string) => void;
  onUpdateSubmission?: (submissionId: string, grade: number, feedback: string) => void;
};

export function GradingPage({ submissions, onGrade, onUpdateSubmission }: GradingPageProps) {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const btnPrimaryCls = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const btnSecondaryCls = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  const linkCls = isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';
  const fileBoxCls = isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  const feedbackBoxCls = isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return sub.status === 'submitted';
    if (filter === 'graded') return sub.status === 'graded';
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  const filterLabel = (status: string) =>
    status === 'all' ? t('all') : status === 'submitted' ? t('pendingFilter') : t('gradedFilter');

  const submissionToGrade = gradingSubmissionId ? submissions.find((s) => s.id === gradingSubmissionId) ?? null : null;

  const handleSaveGrade = (grade: number, feedback: string) => {
    if (gradingSubmissionId) {
      onUpdateSubmission?.(gradingSubmissionId, grade, feedback);
      setGradingSubmissionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {gradingSubmissionId && submissionToGrade && (
        <GradingModal
          submission={submissionToGrade}
          onClose={() => setGradingSubmissionId(null)}
          onSave={handleSaveGrade}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textCls}`}>{t('gradingTitle')}</h2>
          <p className={`${mutedCls} mt-1`}>{t('gradingSubtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`${isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg px-4 py-2`}>
            <div className={isDark ? 'text-sm text-orange-300' : 'text-sm text-orange-900'}>
              <span className="font-semibold">{pendingCount}</span> {t('pendingFilter')}
            </div>
          </div>
          <div className={`${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg px-4 py-2`}>
            <div className={isDark ? 'text-sm text-green-300' : 'text-sm text-green-900'}>
              <span className="font-semibold">{gradedCount}</span> {t('gradedFilter')}
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardCls} border rounded-lg p-4`}>
        <div className="flex gap-2">
          {(['all', 'submitted', 'graded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status ? btnPrimaryCls : btnSecondaryCls
              }`}
            >
              {filterLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className={`${cardCls} border rounded-lg p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                  <User className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${textCls}`}>{submission.studentName}</h3>
                  <div className={`flex items-center gap-4 mt-2 text-sm ${mutedCls}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    {submission.status === 'graded' && submission.grade !== undefined && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className={isDark ? 'w-4 h-4 text-green-400' : 'w-4 h-4 text-green-600'} />
                        <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {submission.grade}%
                        </span>
                      </div>
                    )}
                    {submission.status === 'submitted' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                        {t('pending')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`text-sm font-medium ${textCls} mb-2`}>{t('submittedFiles')}</h4>
              <div className="flex flex-wrap gap-2">
                {submission.files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${fileBoxCls} border rounded-lg px-3 py-2`}
                  >
                    <FileText className={`w-4 h-4 ${mutedCls}`} />
                    <span className={`text-sm ${textCls}`}>{file.name}</span>
                    <span className={`text-xs ${mutedCls}`}>({file.size})</span>
                    <button
                      type="button"
                      className={linkCls}
                      aria-label={`${t('download')} ${file.name}`}
                      onClick={() => toast.info(`${t('download')}: ${file.name}`)}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {submission.feedback && (
              <div className={`mb-4 p-3 ${feedbackBoxCls} border rounded-lg`}>
                <h4 className={`text-sm font-medium ${textCls} mb-1`}>{t('feedback')}</h4>
                <p className={`text-sm ${mutedCls}`}>{submission.feedback}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {submission.status === 'submitted' && (
                <>
                  <button
                    onClick={() => setGradingSubmissionId(submission.id)}
                    className={`flex items-center gap-2 ${btnPrimaryCls} px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
                  >
                    <Brain className="w-4 h-4" />
                    {t('aiAssistedGrade')}
                  </button>
                  <button
                    onClick={() => setGradingSubmissionId(submission.id)}
                    className={`flex items-center gap-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
                  >
                    <FileText className="w-4 h-4" />
                    {t('manualGrade')}
                  </button>
                </>
              )}
              {submission.status === 'graded' && (
                <button onClick={() => setGradingSubmissionId(submission.id)} className={`${linkCls} text-sm font-medium`}>
                  {t('editGrade')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className={`text-center py-12 ${cardCls} border rounded-lg`}>
          <FileText className={`w-12 h-12 ${mutedCls} mx-auto mb-4`} />
          <p className={mutedCls}>{t('noSubmissionsFound')}</p>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
