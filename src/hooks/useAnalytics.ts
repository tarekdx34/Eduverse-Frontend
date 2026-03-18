import { useMemo } from 'react';

/**
 * Analytics data structure for submissions/attempts
 */
export interface SubmissionAnalyticsData {
  totalSubmissions: number;
  submittedCount: number;
  pendingCount: number;
  gradedCount: number;
  averageScore?: number | null;
  scoreDistribution: {
    submitted: number;
    graded: number;
    pending: number;
  };
}

export interface AttemptAnalyticsData {
  totalAttempts: number;
  completedAttempts: number;
  averageScore?: number | null;
  passRate?: number | null;
  scoreDistribution: number[];
}

/**
 * Hook for calculating submission/attempt analytics
 * 
 * Features:
 * - Calculate submission counts by status
 * - Calculate average scores
 * - Generate score distributions
 * - Null-safe (handles missing data gracefully)
 * 
 * @param submissions - Array of submission objects
 * @param scoreField - Name of score field (default: 'score')
 * @param statusField - Name of status field (default: 'submissionStatus')
 * @returns Analytics data object
 * 
 * @example
 * const analytics = useAnalytics(submissions, 'score', 'submissionStatus');
 * // Returns: { totalSubmissions: 5, submittedCount: 3, pendingCount: 1, ... }
 */
export function useAnalytics(
  submissions: any[] | undefined | null,
  scoreField = 'score',
  statusField = 'submissionStatus'
): SubmissionAnalyticsData {
  return useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        totalSubmissions: 0,
        submittedCount: 0,
        pendingCount: 0,
        gradedCount: 0,
        averageScore: null,
        scoreDistribution: {
          submitted: 0,
          graded: 0,
          pending: 0,
        },
      };
    }

    const totalSubmissions = submissions.length;
    let submittedCount = 0;
    let pendingCount = 0;
    let gradedCount = 0;
    let totalScore = 0;
    let scoredCount = 0;

    submissions.forEach((submission) => {
      const status = submission[statusField];
      const score = submission[scoreField];

      // Count by status
      if (status === 'submitted') submittedCount++;
      else if (status === 'pending') pendingCount++;
      else if (status === 'graded') gradedCount++;

      // Calculate average score (only for graded submissions with scores)
      if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
        totalScore += parseFloat(score);
        scoredCount++;
      }
    });

    const averageScore = scoredCount > 0 ? totalScore / scoredCount : null;

    return {
      totalSubmissions,
      submittedCount,
      pendingCount,
      gradedCount,
      averageScore,
      scoreDistribution: {
        submitted: submittedCount,
        graded: gradedCount,
        pending: pendingCount,
      },
    };
  }, [submissions, scoreField, statusField]);
}

/**
 * Hook for quiz attempt analytics
 * 
 * @param attempts - Array of quiz attempt objects
 * @param scoreField - Name of score field (default: 'score')
 * @param maxScoreField - Name of max score field (default: 'maxScore')
 * @param statusField - Name of status field (default: 'status')
 * @returns Attempt analytics data
 * 
 * @example
 * const analytics = useQuizAnalytics(attempts, 'score', 'maxScore', 'status');
 * // Returns: { totalAttempts: 10, completedAttempts: 8, averageScore: 75, ... }
 */
export function useQuizAnalytics(
  attempts: any[] | undefined | null,
  scoreField = 'score',
  maxScoreField = 'maxScore',
  statusField = 'status'
): AttemptAnalyticsData {
  return useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: null,
        passRate: null,
        scoreDistribution: [],
      };
    }

    const totalAttempts = attempts.length;
    let completedAttempts = 0;
    let passedCount = 0;
    let totalScore = 0;
    let scoredCount = 0;
    const scoreDistribution: number[] = [];

    attempts.forEach((attempt) => {
      const status = attempt[statusField];
      const score = attempt[scoreField];
      const maxScore = attempt[maxScoreField];

      // Count completed attempts (submitted or graded)
      if (status === 'submitted' || status === 'graded') {
        completedAttempts++;
      }

      // Calculate average score
      if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
        const numScore = parseFloat(score);
        totalScore += numScore;
        scoredCount++;

        // Track score distribution
        const percentage = maxScore ? (numScore / parseFloat(maxScore)) * 100 : numScore;
        scoreDistribution.push(Math.round(percentage));

        // Check if passed (assuming 50% is passing threshold)
        if (maxScore && percentage >= 50) {
          passedCount++;
        } else if (!maxScore && numScore >= 50) {
          passedCount++;
        }
      }
    });

    const averageScore = scoredCount > 0 ? Math.round((totalScore / scoredCount) * 100) / 100 : null;
    const passRate = completedAttempts > 0 ? Math.round((passedCount / completedAttempts) * 100) : null;

    return {
      totalAttempts,
      completedAttempts,
      averageScore,
      passRate,
      scoreDistribution,
    };
  }, [attempts, scoreField, maxScoreField, statusField]);
}

/**
 * Hook for calculating submission percentages by status
 * Useful for pie charts or progress indicators
 */
export function useSubmissionPercentages(
  submissions: any[] | undefined | null,
  statusField = 'submissionStatus'
): {
  pending: number;
  submitted: number;
  graded: number;
} {
  return useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return { pending: 0, submitted: 0, graded: 0 };
    }

    const analytics = useAnalytics(submissions, 'score', statusField);
    const total = analytics.totalSubmissions;

    return {
      pending: total > 0 ? Math.round((analytics.pendingCount / total) * 100) : 0,
      submitted: total > 0 ? Math.round((analytics.submittedCount / total) * 100) : 0,
      graded: total > 0 ? Math.round((analytics.gradedCount / total) * 100) : 0,
    };
  }, [submissions, statusField]);
}

/**
 * Helper function to format scores for display
 * Handles decimal strings from backend
 */
export function formatScore(score: any, maxScore?: any, decimals = 2): string {
  if (score === null || score === undefined) return 'N/A';
  
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return 'N/A';
  
  if (maxScore) {
    const numMaxScore = parseFloat(maxScore);
    if (isNaN(numMaxScore)) return numScore.toFixed(decimals);
    return `${numScore.toFixed(decimals)}/${numMaxScore.toFixed(decimals)}`;
  }
  
  return numScore.toFixed(decimals);
}

/**
 * Helper function to calculate percentage score
 * Handles decimal strings from backend
 */
export function calculatePercentage(score: any, maxScore: any): number | null {
  if (!score || !maxScore) return null;
  
  const numScore = parseFloat(score);
  const numMaxScore = parseFloat(maxScore);
  
  if (isNaN(numScore) || isNaN(numMaxScore) || numMaxScore === 0) return null;
  
  return Math.round((numScore / numMaxScore) * 100);
}

/**
 * Helper function to get grade letter from percentage
 */
export function getGradeLetter(percentage: number | null): string {
  if (percentage === null || percentage === undefined) return '-';
  
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
