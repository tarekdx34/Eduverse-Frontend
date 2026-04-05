/**
 * QuizStatistics - Analytics dashboard for a quiz
 */

import React from 'react';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  BarChart2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuizStatistics as QuizStatsType } from '../../../../services/api/quizService';

interface QuizStatisticsProps {
  statistics: QuizStatsType | null;
  loading: boolean;
}

export function QuizStatistics({ statistics, loading }: QuizStatisticsProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const cardCls = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';

  // Get color based on score
  const getScoreColor = (score: number, isPassRate = false): string => {
    if (isPassRate) {
      if (score >= 80) return 'text-green-500';
      if (score >= 60) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get background color
  const getScoreBg = (score: number): string => {
    if (score >= 80) return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100';
    if (score >= 60) return isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-100';
    return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100';
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${cardCls}`}>
      <h4 className={`font-semibold mb-4 flex items-center gap-2 ${headingCls}`}>
        <BarChart2 size={18} />
        Quiz Statistics
      </h4>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin" size={24} style={{ color: primaryHex }} />
        </div>
      ) : !statistics ? (
        <div className={`text-center py-8 ${subCls}`}>
          <BarChart2 className="mx-auto mb-2 opacity-50" size={32} />
          <p>Statistics not available yet</p>
          <p className="text-sm mt-1">Data will appear after students take the quiz.</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Total Attempts */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-indigo-500" />
                <span className={`text-xs font-medium ${subCls}`}>Total Attempts</span>
              </div>
              <p className="text-2xl font-bold text-indigo-500">
                {statistics.totalAttempts || 0}
              </p>
            </div>

            {/* Average Score */}
            <div className={`p-4 rounded-lg border ${getScoreBg(statistics.averageScore || 0)}`}>
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className={getScoreColor(statistics.averageScore || 0)} />
                <span className={`text-xs font-medium ${subCls}`}>Average Score</span>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(statistics.averageScore || 0)}`}>
                {(statistics.averageScore || 0).toFixed(1)}%
              </p>
            </div>

            {/* Highest Score */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className={`text-xs font-medium ${subCls}`}>Highest Score</span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                {(statistics.highestScore || 0).toFixed(1)}%
              </p>
            </div>

            {/* Lowest Score */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={14} className="text-red-500" />
                <span className={`text-xs font-medium ${subCls}`}>Lowest Score</span>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {(statistics.lowestScore || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Pass Rate */}
          <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={16} style={{ color: primaryHex }} />
                <span className={`font-medium ${headingCls}`}>Pass Rate</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(statistics.passRate || 0, true)}`}>
                {(statistics.passRate || 0).toFixed(1)}%
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, statistics.passRate || 0)}%`,
                  backgroundColor: (statistics.passRate || 0) >= 60 ? '#10B981' : '#EF4444',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={subCls}>
                <XCircle size={12} className="inline mr-1 text-red-500" />
                Failed: {Math.round((100 - (statistics.passRate || 0)) * (statistics.totalAttempts || 0) / 100)}
              </span>
              <span className={subCls}>
                <CheckCircle size={12} className="inline mr-1 text-green-500" />
                Passed: {Math.round((statistics.passRate || 0) * (statistics.totalAttempts || 0) / 100)}
              </span>
            </div>
          </div>

          {/* Question Analysis */}
          {statistics.questionStats && statistics.questionStats.length > 0 && (
            <div>
              <h5 className={`font-medium mb-3 ${headingCls}`}>
                Per-Question Analysis
              </h5>
              <div className="space-y-3">
                {statistics.questionStats.map((qs, index) => (
                  <div
                    key={qs.questionId}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-white/10' : 'bg-gray-200'} ${headingCls}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${headingCls}`}>
                          Question {index + 1}
                        </span>
                        <span className={`text-sm font-medium ${getScoreColor((qs.correctRate || 0) * 100)}`}>
                          {((qs.correctRate || 0) * 100).toFixed(0)}% correct
                        </span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (qs.correctRate || 0) * 100)}%`,
                            backgroundColor:
                              (qs.correctRate || 0) >= 0.8
                                ? '#10B981'
                                : (qs.correctRate || 0) >= 0.6
                                  ? '#F59E0B'
                                  : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                    {qs.averagePoints !== undefined && (
                      <div className={`text-xs ${subCls}`}>
                        Avg: {qs.averagePoints.toFixed(1)} pts
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Footer */}
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm ${subCls}`}>
              Based on{' '}
              <span className={`font-medium ${headingCls}`}>{statistics.totalAttempts || 0}</span>{' '}
              attempts.{' '}
              {statistics.totalAttempts > 0 && (
                <>
                  Score range:{' '}
                  <span className="text-green-500 font-medium">
                    {(statistics.highestScore || 0).toFixed(0)}%
                  </span>
                  {' '}-{' '}
                  <span className="text-red-500 font-medium">
                    {(statistics.lowestScore || 0).toFixed(0)}%
                  </span>
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
