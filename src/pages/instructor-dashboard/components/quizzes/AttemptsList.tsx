/**
 * AttemptsList - View student attempts for a quiz
 */

import React from 'react';
import { Loader2, User, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Edit3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuizAttempt } from '../../../../services/api/quizService';

interface AttemptsListProps {
  attempts: QuizAttempt[];
  loading: boolean;
  onGradeClick?: (attemptId: string) => void;
}

export function AttemptsList({ attempts, loading, onGradeClick }: AttemptsListProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const cardCls = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';

  // Calculate time taken
  const getTimeTaken = (attempt: QuizAttempt): string => {
    if (!attempt.startedAt || !attempt.submittedAt) return '-';
    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.submittedAt).getTime();
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
  };

  // Get score display
  const getScoreDisplay = (
    attempt: QuizAttempt
  ): { text: string; color: string; pointsText: string | null } => {
    const points = Number((attempt as any).score ?? 0);
    const maxScore = Number((attempt as any).maxScore ?? (attempt as any).totalScore ?? 0);

    const percentageRaw = Number(
      (attempt as any).scorePercentage ??
      (attempt as any).score_percentage ??
      (maxScore > 0 ? (points / maxScore) * 100 : NaN)
    );

    if (!Number.isFinite(percentageRaw)) {
      return { text: '-', color: subCls, pointsText: null };
    }

    const percentage = Math.max(0, Math.min(100, percentageRaw));
    const pointsText = maxScore > 0 ? `${points.toFixed(1)} / ${maxScore.toFixed(1)}` : null;

    if (percentage >= 90) {
      return { text: `${percentage.toFixed(1)}%`, color: 'text-green-500', pointsText };
    }
    if (percentage >= 70) {
      return { text: `${percentage.toFixed(1)}%`, color: 'text-yellow-500', pointsText };
    }
    return { text: `${percentage.toFixed(1)}%`, color: 'text-red-500', pointsText };
  };

  // Get status badge
  const getStatusBadge = (status: QuizAttempt['status']): { label: string; color: string; icon: React.ReactNode } => {
    switch (status) {
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: <Clock size={12} />,
        };
      case 'submitted':
        return {
          label: 'Pending Grade',
          color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          icon: <AlertCircle size={12} />,
        };
      case 'graded':
        return {
          label: 'Graded',
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: <CheckCircle size={12} />,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
          icon: null,
        };
    }
  };

  // Format date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${cardCls}`}>
      <h4 className={`font-semibold mb-4 flex items-center gap-2 ${headingCls}`}>
        <User size={18} />
        Student Attempts
      </h4>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin" size={24} style={{ color: primaryHex }} />
        </div>
      ) : attempts.length === 0 ? (
        <div className={`text-center py-8 ${subCls}`}>
          <XCircle className="mx-auto mb-2 opacity-50" size={32} />
          <p>No attempts found for this quiz</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${subCls} text-left`}>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Attempt #</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Submitted</th>
                {onGradeClick && <th className="pb-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => {
                const score = getScoreDisplay(attempt);
                const status = getStatusBadge(attempt.status);

                return (
                  <tr
                    key={attempt.id}
                    className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    <td className={`py-3 ${headingCls}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                          {attempt.user?.firstName?.[0] || '?'}
                          {attempt.user?.lastName?.[0] || ''}
                        </div>
                        <div>
                          <div className="font-medium">
                            {attempt.user
                              ? `${attempt.user.firstName} ${attempt.user.lastName}`
                              : 'Unknown User'}
                          </div>
                          {attempt.user?.email && (
                            <div className={`text-xs ${subCls}`}>{attempt.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 ${subCls}`}>
                      #{attempt.attemptNumber}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className={`py-3 font-medium ${score.color}`}>
                      <div>{score.text}</div>
                      {score.pointsText && <div className={`text-xs ${subCls}`}>{score.pointsText}</div>}
                    </td>
                    <td className={`py-3 ${subCls}`}>
                      {getTimeTaken(attempt)}
                    </td>
                    <td className={`py-3 ${subCls}`}>
                      {formatDate(attempt.submittedAt || attempt.startedAt)}
                    </td>
                    {onGradeClick && (
                      <td className="py-3">
                        {attempt.status === 'submitted' && (
                          <button
                            onClick={() => onGradeClick(attempt.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: primaryHex }}
                          >
                            <Edit3 size={14} />
                            Grade
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!loading && attempts.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className={subCls}>
              <span className={`font-medium ${headingCls}`}>{attempts.length}</span> total attempts
            </div>
            <div className={subCls}>
              <span className={`font-medium ${headingCls}`}>
                {attempts.filter((a) => a.status === 'graded').length}
              </span>{' '}
              graded
            </div>
            <div className={subCls}>
              <span className={`font-medium ${headingCls}`}>
                {attempts.filter((a) => a.status === 'submitted').length}
              </span>{' '}
              pending
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
