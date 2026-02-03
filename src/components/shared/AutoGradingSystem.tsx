import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Edit,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  User,
} from 'lucide-react';

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: Date;
  answers: {
    questionId: string;
    questionText: string;
    answer: string;
    correctAnswer?: string;
    autoScore?: number;
    maxScore: number;
    feedback?: string;
    needsReview?: boolean;
  }[];
  totalScore?: number;
  maxTotalScore: number;
  status: 'pending' | 'auto-graded' | 'reviewed' | 'finalized';
}

interface AutoGradingSystemProps {
  submissions: Submission[];
  onGradeUpdate: (submissionId: string, updates: Partial<Submission>) => void;
  onBulkAutoGrade?: () => Promise<void>;
  className?: string;
}

export function AutoGradingSystem({
  submissions: initialSubmissions,
  onGradeUpdate,
  onBulkAutoGrade,
  className = '',
}: AutoGradingSystemProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [editingFeedback, setEditingFeedback] = useState<{
    submissionId: string;
    questionId: string;
    feedback: string;
    score: number;
  } | null>(null);

  const toggleAnswerExpanded = (answerId: string) => {
    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) {
        newSet.delete(answerId);
      } else {
        newSet.add(answerId);
      }
      return newSet;
    });
  };

  const handleBulkAutoGrade = async () => {
    if (!onBulkAutoGrade) return;

    setIsAutoGrading(true);
    try {
      await onBulkAutoGrade();
      // Simulate auto-grading for demo
      const updatedSubmissions = submissions.map((sub) => ({
        ...sub,
        status: 'auto-graded' as const,
        answers: sub.answers.map((ans) => ({
          ...ans,
          autoScore: ans.answer.toLowerCase().includes('correct')
            ? ans.maxScore
            : Math.floor(Math.random() * ans.maxScore),
          needsReview: ans.answer.length > 100, // Short answers need review
        })),
        totalScore: Math.floor(Math.random() * sub.maxTotalScore * 0.3) + sub.maxTotalScore * 0.7,
      }));
      setSubmissions(updatedSubmissions);
    } finally {
      setIsAutoGrading(false);
    }
  };

  const handleScoreUpdate = (submissionId: string, questionId: string, newScore: number, newFeedback: string) => {
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.id !== submissionId) return sub;

      const updatedAnswers = sub.answers.map((ans) =>
        ans.questionId === questionId
          ? { ...ans, autoScore: newScore, feedback: newFeedback, needsReview: false }
          : ans
      );

      const totalScore = updatedAnswers.reduce((sum, ans) => sum + (ans.autoScore || 0), 0);

      return {
        ...sub,
        answers: updatedAnswers,
        totalScore,
        status: updatedAnswers.some((a) => a.needsReview) ? 'auto-graded' : 'reviewed' as const,
      };
    });

    setSubmissions(updatedSubmissions);
    setEditingFeedback(null);

    const submission = updatedSubmissions.find((s) => s.id === submissionId);
    if (submission) {
      onGradeUpdate(submissionId, submission);
    }
  };

  const finalizeGrade = (submissionId: string) => {
    const updatedSubmissions = submissions.map((sub) =>
      sub.id === submissionId ? { ...sub, status: 'finalized' as const } : sub
    );
    setSubmissions(updatedSubmissions);

    const submission = updatedSubmissions.find((s) => s.id === submissionId);
    if (submission) {
      onGradeUpdate(submissionId, { status: 'finalized' });
    }
  };

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'auto-graded':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
            <Sparkles size={12} />
            Auto-Graded
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
            <CheckCircle size={12} />
            Reviewed
          </span>
        );
      case 'finalized':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <CheckCircle size={12} />
            Finalized
          </span>
        );
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const needsReviewCount = submissions.filter((s) =>
    s.answers.some((a) => a.needsReview)
  ).length;

  const currentSubmission = submissions.find((s) => s.id === selectedSubmission);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Auto-Grading System</h3>
              <p className="text-sm text-gray-600">
                {submissions.length} submissions • {pendingCount} pending • {needsReviewCount} need review
              </p>
            </div>
          </div>
          {onBulkAutoGrade && (
            <button
              onClick={handleBulkAutoGrade}
              disabled={isAutoGrading || pendingCount === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              {isAutoGrading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Auto-Grade All ({pendingCount})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Submissions List */}
        <div className="w-80 border-r border-gray-200 max-h-[600px] overflow-y-auto">
          {submissions.map((submission) => (
            <button
              key={submission.id}
              onClick={() => setSelectedSubmission(submission.id)}
              className={`w-full p-4 text-left border-b border-gray-100 transition-colors ${
                selectedSubmission === submission.id
                  ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{submission.studentName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                {getStatusBadge(submission.status)}
                {submission.totalScore !== undefined && (
                  <span className="text-sm font-medium text-gray-700">
                    {submission.totalScore}/{submission.maxTotalScore}
                  </span>
                )}
              </div>
              {submission.answers.some((a) => a.needsReview) && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                  <AlertTriangle size={12} />
                  Needs review
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Submission Detail */}
        <div className="flex-1 max-h-[600px] overflow-y-auto">
          {currentSubmission ? (
            <div className="p-6">
              {/* Student Info */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {currentSubmission.studentName}
                  </h4>
                  <p className="text-sm text-gray-500">{currentSubmission.studentEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(currentSubmission.status)}
                  {currentSubmission.status !== 'finalized' && currentSubmission.status !== 'pending' && (
                    <button
                      onClick={() => finalizeGrade(currentSubmission.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Finalize Grade
                    </button>
                  )}
                </div>
              </div>

              {/* Score Summary */}
              {currentSubmission.totalScore !== undefined && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Score</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {currentSubmission.totalScore}/{currentSubmission.maxTotalScore}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{
                        width: `${(currentSubmission.totalScore / currentSubmission.maxTotalScore) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Answers */}
              <div className="space-y-4">
                {currentSubmission.answers.map((answer, index) => {
                  const answerId = `${currentSubmission.id}-${answer.questionId}`;
                  const isExpanded = expandedAnswers.has(answerId);
                  const isEditingThis =
                    editingFeedback?.submissionId === currentSubmission.id &&
                    editingFeedback?.questionId === answer.questionId;

                  return (
                    <div
                      key={answer.questionId}
                      className={`border rounded-lg ${
                        answer.needsReview ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggleAnswerExpanded(answerId)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                              {answer.needsReview && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                  Needs Review
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900">{answer.questionText}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {answer.autoScore !== undefined ? answer.autoScore : '—'}/{answer.maxScore}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                          {/* Student's Answer */}
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">Student's Answer:</p>
                            <div className="p-3 bg-white rounded border border-gray-200">
                              <p className="text-sm text-gray-900">{answer.answer}</p>
                            </div>
                          </div>

                          {/* Correct Answer */}
                          {answer.correctAnswer && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-1">Correct Answer:</p>
                              <div className="p-3 bg-green-50 rounded border border-green-200">
                                <p className="text-sm text-green-800">{answer.correctAnswer}</p>
                              </div>
                            </div>
                          )}

                          {/* Feedback & Score */}
                          {isEditingThis ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">
                                  Score
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={answer.maxScore}
                                  value={editingFeedback.score}
                                  onChange={(e) =>
                                    setEditingFeedback({
                                      ...editingFeedback,
                                      score: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <span className="text-sm text-gray-500 ml-2">/ {answer.maxScore}</span>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">
                                  Feedback
                                </label>
                                <textarea
                                  value={editingFeedback.feedback}
                                  onChange={(e) =>
                                    setEditingFeedback({
                                      ...editingFeedback,
                                      feedback: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                  placeholder="Add feedback for the student..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingFeedback(null)}
                                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleScoreUpdate(
                                      currentSubmission.id,
                                      answer.questionId,
                                      editingFeedback.score,
                                      editingFeedback.feedback
                                    )
                                  }
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {answer.feedback && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Feedback:</p>
                                  <p className="text-sm text-gray-700">{answer.feedback}</p>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFeedback({
                                    submissionId: currentSubmission.id,
                                    questionId: answer.questionId,
                                    feedback: answer.feedback || '',
                                    score: answer.autoScore || 0,
                                  });
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                              >
                                <Edit size={14} />
                                Edit Score & Feedback
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select a submission to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AutoGradingSystem;
