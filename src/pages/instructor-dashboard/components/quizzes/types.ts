/**
 * Quizzes Module - Shared Types
 * UI-specific interfaces extending the base QuizService types
 */

import type { Quiz, QuizQuestion, QuizAttempt, QuizStatistics } from '../../../../services/api/quizService';

// Quiz status as defined in the backend
export type QuizStatus = 'draft' | 'published' | 'closed' | 'archived';

// Question types supported by the system
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching';

// UI representation of a quiz with computed display fields
export interface QuizUIData {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  status: QuizStatus;
  statusColor: string;
  questionCount: number;
  attemptCount: number;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  passingScore: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showCorrectAnswers: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  createdAt: string;
  raw: Quiz; // Original backend data
}

// Form data for creating/editing a quiz
export interface QuizFormData {
  title: string;
  description: string;
  courseId: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  passingScore: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showCorrectAnswers: boolean;
  showAnswersAfter: 'immediate' | 'after_due' | 'never';
  availableFrom: string;
  availableUntil: string;
}

/** manual: user-created; ai: from AI generator; ai_edited: AI then changed by user */
export type QuestionProvenance = 'manual' | 'ai' | 'ai_edited';

// UI representation of a question for editing
export interface QuestionFormData {
  id?: string;
  tempId?: number; // For newly created questions not yet saved
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string; // Index as string for MCQ (e.g., "0", "1"), or "true"/"false" for T/F
  matchingPairs: { left: string; right: string }[];
  points: number;
  explanation: string;
  orderIndex: number;
  /** Omitted or manual = user-built; ai / ai_edited shown as badges in the editor */
  questionProvenance?: QuestionProvenance;
}

// Attempt with UI-friendly fields
export interface AttemptUIData {
  id: string;
  quizId: string;
  userId: number;
  userName: string;
  userEmail: string;
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'graded';
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  timeTakenMinutes: number | null;
  hasPendingGrading: boolean;
  raw: QuizAttempt;
}

// Pending grading question
export interface PendingGradingQuestion {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  answerText: string;
  maxPoints: number;
}

// Grade submission payload
export interface GradeSubmission {
  questionId: number;
  pointsEarned: number;
  feedback?: string;
}

// Status badge styling
export const STATUS_STYLES: Record<QuizStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  published: { label: 'Published', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  archived: { label: 'Archived', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// Question type icons and labels
export const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string; icon: string }> = {
  mcq: { label: 'Multiple Choice', icon: 'CircleDot' },
  true_false: { label: 'True/False', icon: 'ToggleLeft' },
  short_answer: { label: 'Short Answer', icon: 'Type' },
  essay: { label: 'Essay', icon: 'FileText' },
  matching: { label: 'Matching', icon: 'Link2' },
};

// Default form values
export const DEFAULT_QUIZ_FORM: QuizFormData = {
  title: '',
  description: '',
  courseId: '',
  timeLimitMinutes: 30,
  maxAttempts: 1,
  passingScore: 50,
  randomizeQuestions: false,
  randomizeOptions: false,
  showCorrectAnswers: true,
  showAnswersAfter: 'immediate',
  availableFrom: '',
  availableUntil: '',
};

export const DEFAULT_QUESTION_FORM: QuestionFormData = {
  questionType: 'mcq',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '0',
  matchingPairs: [],
  points: 10,
  explanation: '',
  orderIndex: 0,
};

// Helper to derive status from quiz dates
export function deriveQuizStatus(quiz: Quiz): QuizStatus {
  const now = new Date();
  const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
  const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

  if (!availableFrom) {
    return 'draft';
  }
  if (availableFrom > now) {
    return 'draft'; // Scheduled but not yet available
  }
  if (availableUntil && availableUntil < now) {
    return 'closed';
  }
  return 'published';
}

// Map backend Quiz to UI representation
export function mapQuizToUI(quiz: Quiz): QuizUIData {
  const status = deriveQuizStatus(quiz);
  const statusStyle = STATUS_STYLES[status];

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description || undefined,
    courseId: quiz.courseId,
    courseName: quiz.course?.name || 'Unknown Course',
    status,
    statusColor: statusStyle.color,
    questionCount: quiz.questions?.length || 0,
    attemptCount: 0, // Will be populated separately if needed
    timeLimitMinutes: quiz.timeLimitMinutes,
    maxAttempts: quiz.maxAttempts,
    passingScore: quiz.passingScore ? parseFloat(quiz.passingScore) : null,
    randomizeQuestions: !!quiz.randomizeQuestions,
    randomizeOptions: false, // Backend uses randomizeQuestions for both
    showCorrectAnswers: !!quiz.showCorrectAnswers,
    availableFrom: quiz.availableFrom,
    availableUntil: quiz.availableUntil,
    createdAt: quiz.createdAt || new Date().toISOString(),
    raw: quiz,
  };
}

// Map backend QuizAttempt to UI representation
export function mapAttemptToUI(attempt: QuizAttempt): AttemptUIData {
  const score = attempt.score ? parseFloat(attempt.score) : null;
  let timeTaken: number | null = null;
  
  if (attempt.startedAt && attempt.submittedAt) {
    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.submittedAt).getTime();
    timeTaken = Math.round((end - start) / 60000);
  }

  return {
    id: attempt.id,
    quizId: attempt.quizId,
    userId: attempt.userId,
    userName: attempt.user 
      ? `${attempt.user.firstName} ${attempt.user.lastName}`.trim() 
      : 'Unknown User',
    userEmail: attempt.user?.email || '',
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    score,
    maxScore: null, // Will be computed from quiz
    percentage: score, // Backend may return percentage directly
    timeTakenMinutes: timeTaken,
    hasPendingGrading: attempt.status === 'submitted',
    raw: attempt,
  };
}
