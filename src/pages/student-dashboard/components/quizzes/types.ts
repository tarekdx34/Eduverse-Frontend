// Types for Quiz components - aligned with QuizService types

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  quizType: 'practice' | 'graded';
  timeLimitMinutes: number | null;
  maxAttempts: number;
  passingScore: string | null;
  randomizeQuestions: number;
  showCorrectAnswers: number;
  showAnswersAfter: 'immediate' | 'after_due' | 'never';
  availableFrom: string | null;
  availableUntil: string | null;
  weight: string;
  createdBy: number;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
  creator?: { userId: number; firstName: string; lastName: string };
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: QuestionType;
  questionText: string;
  options: string[] | null;
  correctAnswer: string | null;
  matchingPairs?: MatchingPair[];
  explanation: string | null;
  points: string;
  difficultyLevelId: string | null;
  orderIndex: number;
  difficultyLevel?: { id: string; name: string } | null;
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching' | '';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: number;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  score: string | null;
  timeTakenMinutes: number | null;
  status: 'in_progress' | 'submitted' | 'graded';
  answers?: AttemptAnswer[];
  questions?: QuizQuestion[];
  quiz?: Quiz;
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: number;
  selectedOption: string | null;
  answerText: string | null;
  matchingAnswers?: MatchingPair[];
  isCorrect: number | null;
  pointsEarned: string | null;
}

export interface AttemptResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTakenMinutes: number;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  questions?: {
    questionId: number;
    questionText: string;
    questionType: string;
    studentAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer?: string;
    maxPoints?: number;
    explanation?: string;
  }[];
}

// UI State types
export type QuizView = 'list' | 'active' | 'results' | 'history';

export interface QuizCardData {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  questionsCount: number;
  duration: string;
  timeLimitMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  quizType: 'practice' | 'graded';
  maxAttempts: number;
  remainingAttempts: number;
  passingScore: number;
  showCorrectAnswers: boolean;
  color: string;
}

export interface QuizResultData {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  grade: string;
  correct: number;
  wrong: number;
  skipped: number;
  questions: QuestionResultData[];
}

export interface QuestionResultData {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  isCorrect: boolean;
  userAnswer: string | MatchingPair[] | null;
  correctAnswer: string | MatchingPair[] | null;
  points: number;
  pointsEarned: number;
}

// Answer state for quiz-taking
export type AnswerValue = string | number | MatchingPair[];

export interface AnswersState {
  [questionId: string]: AnswerValue;
}

// Navigator state
export interface QuestionStatus {
  id: string;
  isAnswered: boolean;
  isSkipped: boolean;
  isCurrent: boolean;
}
