import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, User, Brain, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  onGrade: (submissionId: string) => void;
};

export function GradingPage({ submissions, onGrade }: GradingPageProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  const [gradingSubTab, setGradingSubTab] = useState<'manual' | 'auto'>('manual');

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return sub.status === 'submitted';
    if (filter === 'graded') return sub.status === 'graded';
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('grading')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('gradeLabSubmissions')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
              <span className="font-semibold">{pendingCount}</span> {t('pending')}
            </div>
          </div>
          <div
            className={`rounded-lg px-4 py-2 border ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}
          >
            <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-900'}`}>
              <span className="font-semibold">{gradedCount}</span> {t('graded')}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
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
          Manual Grading
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
          {/* Filters */}
          <div
            className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex gap-2">
              {(['all', 'submitted', 'graded'] as const).map((status) => (
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
                  {status === 'all'
                    ? t('all')
                    : status === 'submitted'
                      ? t('submitted')
                      : t('graded')}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {submission.studentName}
                      </h3>
                      <div
                        className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        {submission.status === 'graded' && submission.grade !== undefined && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {t('grade')}: {submission.grade}%
                            </span>
                          </div>
                        )}
                        {submission.status === 'submitted' && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-orange-500/10 text-orange-300' : 'bg-orange-100 text-orange-800'}`}
                          >
                            {t('pending')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div className="mb-4">
                  <h4
                    className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('submittedFiles')}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {submission.files.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <FileText
                          className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                        />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          ({file.size})
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {submission.feedback && (
                  <div
                    className={`mb-4 p-3 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <h4
                      className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {t('feedback')}:
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {submission.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => onGrade(submission.id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Brain className="w-4 h-4" />
                        {t('aiAssistedGrade')}
                      </button>
                      <button
                        onClick={() => onGrade(submission.id)}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View &amp; Grade
                      </button>
                    </>
                  )}
                  {submission.status === 'graded' && (
                    <button
                      onClick={() => onGrade(submission.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {t('editGrade')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSubmissions.length === 0 && (
            <div
              className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <FileText
                className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
              />
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noSubmissionsFound')}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Auto-Graded Results Tab */
        <div
          className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <th
                    className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Student Name
                  </th>
                  <th
                    className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Quiz / Assignment
                  </th>
                  <th
                    className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Score
                  </th>
                  <th
                    className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Grade
                  </th>
                  <th
                    className={`text-left px-6 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {autoGradedResults.map((result) => (
                  <tr
                    key={result.id}
                    className={`border-t ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.studentName}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {result.assignmentTitle}
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {result.score}/{result.total}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.grade.startsWith('A')
                            ? 'bg-green-100 text-green-800'
                            : result.grade.startsWith('B')
                              ? 'bg-blue-100 text-blue-800'
                              : result.grade.startsWith('C')
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
