import React, { useMemo, useState } from 'react';
import { FileText, Download, CheckCircle, Clock, User, Brain, Eye, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AIStatusBanner } from './LiveModeViews';

type SubmissionStatus = 'submitted' | 'graded' | 'returned' | 'resubmit' | 'late';

type Submission = {
  id: string;
  labId: string;
  studentName: string;
  submittedAt: string;
  submissionText?: string;
  files: { name: string; size: string; fileId?: number | null }[];
  status: SubmissionStatus;
};

type AutoGradedResult = {
  id: string;
  studentName: string;
  assignmentTitle: string;
  score: number;
  total: number;
  grade: string;
  submittedAt: string;
};

const autoGradedResults: AutoGradedResult[] = [
  {
    id: 'ag1',
    studentName: 'Alice Johnson',
    assignmentTitle: 'Data Structures Quiz 1',
    score: 18,
    total: 20,
    grade: 'A',
    submittedAt: '2024-12-01T10:30:00',
  },
  {
    id: 'ag2',
    studentName: 'Bob Smith',
    assignmentTitle: 'Data Structures Quiz 1',
    score: 14,
    total: 20,
    grade: 'B',
    submittedAt: '2024-12-01T11:00:00',
  },
  {
    id: 'ag3',
    studentName: 'Carol Davis',
    assignmentTitle: 'Algorithms MCQ',
    score: 9,
    total: 15,
    grade: 'B+',
    submittedAt: '2024-12-02T09:15:00',
  },
  {
    id: 'ag4',
    studentName: 'David Wilson',
    assignmentTitle: 'Algorithms MCQ',
    score: 6,
    total: 15,
    grade: 'D',
    submittedAt: '2024-12-02T09:45:00',
  },
  {
    id: 'ag5',
    studentName: 'Eva Martinez',
    assignmentTitle: 'OOP Concepts Quiz',
    score: 24,
    total: 25,
    grade: 'A+',
    submittedAt: '2024-12-03T14:20:00',
  },
];
type GradingPageProps = {
  submissions: Submission[];
  onGradeStatusChange?: (submissionId: string, status: SubmissionStatus) => Promise<void> | void;
  onDownloadFile?: (fileId: number, fileName?: string) => Promise<void> | void;
  gradingSubmissionId?: string | null;
  disabledActions?: {
    aiGrade?: string;
    download?: string;
  };
};

const statusOptions: SubmissionStatus[] = ['graded', 'returned', 'resubmit', 'submitted'];

const statusCopy: Record<SubmissionStatus, string> = {
  submitted: 'Pending Review',
  graded: 'Marked Graded',
  returned: 'Returned',
  resubmit: 'Needs Resubmission',
  late: 'Late Submission',
};

const statusClasses: Record<SubmissionStatus, string> = {
  submitted: 'bg-orange-100 text-orange-800',
  graded: 'bg-green-100 text-green-800',
  returned: 'bg-blue-100 text-blue-800',
  resubmit: 'bg-red-100 text-red-800',
  late: 'bg-red-100 text-red-800',
};

export function GradingPage({
  submissions,
  onGradeStatusChange,
  onDownloadFile,
  gradingSubmissionId,
  disabledActions,
}: GradingPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | SubmissionStatus>('all');
  const [gradingSubTab, setGradingSubTab] = useState<'manual' | 'auto'>('manual');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>('graded');

  const filteredSubmissions = submissions.filter((sub) => (filter === 'all' ? true : sub.status === filter));
  const selectedSubmission = submissions.find((submission) => submission.id === selectedSubmissionId) || null;
  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  const aiDisabledReason =
    disabledActions?.aiGrade ||
    t('aiGradingPending') ||
    'AI-assisted grading is currently in development for RAG synchronization.';

  const autoResults = useMemo(
    () =>
      submissions
        .filter((submission) => submission.status === 'graded')
        .slice(0, 10)
        .map((submission) => ({
          id: submission.id,
          studentName: submission.studentName,
          assignmentTitle: `Lab ${submission.labId}`,
          status: statusCopy[submission.status],
          submittedAt: submission.submittedAt,
        })),
    [submissions]
  );

  const openSubmissionModal = (submission: Submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedStatus(submission.status === 'submitted' ? 'graded' : submission.status);
  };

  const closeSubmissionModal = () => {
    if (gradingSubmissionId) return;
    setSelectedSubmissionId(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedSubmission || !onGradeStatusChange) return;
    await onGradeStatusChange(selectedSubmission.id, selectedStatus);
    setSelectedSubmissionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('grading')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage lab submissions and review student work.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {aiDisabledReason && <AIStatusBanner message={aiDisabledReason} />}
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
              <span className="font-semibold">{pendingCount}</span> Pending
            </div>
          </div>
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-900'}`}>
              <span className="font-semibold">{gradedCount}</span> Graded
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGradingSubTab('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            gradingSubTab === 'manual'
              ? 'bg-indigo-600 text-white'
              : isDark
                ? 'text-slate-400 hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Manual Review
        </button>
        <button
          onClick={() => setGradingSubTab('auto')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            gradingSubTab === 'auto'
              ? 'bg-indigo-600 text-white'
              : isDark
                ? 'text-slate-400 hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Auto-Graded Results
        </button>
      </div>

      {gradingSubTab === 'manual' ? (
        <>
          <div className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-wrap gap-2">
              {(['all', 'submitted', 'graded', 'returned', 'resubmit'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? t('all') || 'All' : t(status) || statusCopy[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{submission.studentName}</h3>
                      <div className={`flex flex-wrap items-center gap-3 mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusClasses[submission.status]}`}>
                          {t(submission.status) || statusCopy[submission.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submission.submissionText && (
                  <div className={`mb-4 p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('submissionNotes') || 'Submission Notes'}</h4>
                    <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{submission.submissionText}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Submitted Files</h4>
                  {submission.files.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {submission.files.map((file, idx) => {
                        const downloadDisabledReason = disabledActions?.download || (!file.fileId ? 'No uploaded file is linked to this submission yet.' : '');
                        return (
                          <div
                            key={`${submission.id}-${idx}`}
                            className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.name}</span>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>({file.size})</span>
                            <button
                              disabled={Boolean(downloadDisabledReason)}
                              title={downloadDisabledReason}
                              onClick={() => {
                                if (!file.fileId || downloadDisabledReason || !onDownloadFile) return;
                                onDownloadFile(file.fileId, file.name);
                              }}
                              className="text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No files attached.</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {submission.status === 'submitted' ? (
                    <>
                      <button
                        disabled
                        title={disabledActions?.aiGrade}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-60"
                      >
                        <Brain className="w-4 h-4" />
                        AI Assisted Grade
                      </button>
                      <button
                        onClick={() => openSubmissionModal(submission)}
                        className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View &amp; Grade
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openSubmissionModal(submission)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSubmissions.length === 0 && (
            <div className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noSubmissionsFound') || 'No submissions found.'}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className={`m-4 rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {t('autoGradingNote') || 'Auto-grading is not connected yet. This panel currently shows only submissions already marked as graded.'}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <th className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('studentName') || 'Student Name'}</th>
                  <th className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('assignmentTitle') || 'Quiz / Assignment'}</th>
                  <th className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('score') || 'Score'}</th>
                  <th className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('grade') || 'Grade'}</th>
                  <th className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('submitted') || 'Submitted'}</th>
                </tr>
              </thead>
              <tbody>
                {/* Combined list of real auto-results and static mock auto-results */}
                {[...autoResults.map(r => ({ ...r, score: 0, total: 0, grade: 'N/A' })), ...autoGradedResults].map((result) => (
                  <tr key={result.id} className={`border-t ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.studentName}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{result.assignmentTitle}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {'score' in result && result.score !== undefined ? `${result.score}/${result.total}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {'grade' in result && result.grade && result.grade !== 'N/A' ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.grade}
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClasses.graded}`}>{t('graded') || 'Graded'}</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(result.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(autoResults.length === 0 && autoGradedResults.length === 0) && (
                  <tr>
                    <td colSpan={5} className={`px-6 py-8 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {t('noGradedSubmissions') || 'No graded submissions yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" onClick={closeSubmissionModal}>
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold">{t('reviewSubmission') || 'Review Submission'}</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{selectedSubmission.studentName}</p>
              </div>
              <button
                onClick={closeSubmissionModal}
                disabled={Boolean(gradingSubmissionId)}
                className="rounded-full p-2 text-slate-500 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('submittedAt') || 'Submitted At'}</p>
                  <p className="mt-2 text-sm">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <div className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('status') || 'Current Status'}</p>
                  <p className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[selectedSubmission.status]}`}>
                      {t(selectedSubmission.status) || statusCopy[selectedSubmission.status]}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{t('submissionNotes') || 'Submission Notes'}</label>
                <div className={`min-h-28 rounded-xl border p-4 text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                  {selectedSubmission.submissionText?.trim() || t('noSubmissionNotes') || 'No text notes were submitted.'}
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{t('setStatus') || 'Set Status'}</label>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as SubmissionStatus)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(status) || statusCopy[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-inherit px-6 py-4">
              <button
                onClick={closeSubmissionModal}
                disabled={Boolean(gradingSubmissionId)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={Boolean(gradingSubmissionId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" />
                {gradingSubmissionId ? t('saving') || 'Saving...' : t('saveStatus') || 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default GradingPage;

