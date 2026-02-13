import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, User, Brain } from 'lucide-react';

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
};

export function GradingPage({ submissions, onGrade }: GradingPageProps) {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('all');

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
          <h2 className="text-2xl font-bold text-gray-900">Grading</h2>
          <p className="text-gray-600 mt-1">Grade lab submissions with AI assistance or manually</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <div className="text-sm text-orange-900">
              <span className="font-semibold">{pendingCount}</span> Pending
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <div className="text-sm text-green-900">
              <span className="font-semibold">{gradedCount}</span> Graded
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex gap-2">
          {(['all', 'submitted', 'graded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{submission.studentName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    {submission.status === 'graded' && submission.grade !== undefined && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">Grade: {submission.grade}%</span>
                      </div>
                    )}
                    {submission.status === 'submitted' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted Files:</h4>
              <div className="flex flex-wrap gap-2">
                {submission.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500">({file.size})</span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {submission.feedback && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Feedback:</h4>
                <p className="text-sm text-gray-700">{submission.feedback}</p>
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
                    AI-Assisted Grade
                  </button>
                  <button
                    onClick={() => onGrade(submission.id)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Manual Grade
                  </button>
                </>
              )}
              {submission.status === 'graded' && (
                <button
                  onClick={() => onGrade(submission.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit Grade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No submissions found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
