/**
 * Quizzes Module - Barrel Exports
 */

// Main dashboard component
export { QuizzesDashboard } from './QuizzesDashboard';

// Sub-components
export { QuizList } from './QuizList';
export { QuizCreate } from './QuizCreate';
export { QuizEdit } from './QuizEdit';
export { QuestionEditor } from './QuestionEditor';
export { QuestionReorder } from './QuestionReorder';
export { AttemptsList } from './AttemptsList';
export { GradingPanel } from './GradingPanel';
export { QuizStatistics } from './QuizStatistics';

// Hooks
export { useQuizzes } from './hooks/useQuizzes';

// Types
export * from './types';
