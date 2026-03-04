import { ApiClient } from './client';
import type { Quiz, QuizQuestion, QuizAttempt, QuizStatistics } from '../../types/api';

export const quizService = {
  // CRUD
  listQuizzes: (params?: { courseId?: number; status?: string }) =>
    ApiClient.get<Quiz[]>('/quizzes', params),

  getQuiz: (id: number) =>
    ApiClient.get<Quiz>(`/quizzes/${id}`),

  createQuiz: (data: Partial<Quiz>) =>
    ApiClient.post<Quiz>('/quizzes', data),

  updateQuiz: (id: number, data: Partial<Quiz>) =>
    ApiClient.put<Quiz>(`/quizzes/${id}`, data),

  deleteQuiz: (id: number) =>
    ApiClient.delete(`/quizzes/${id}`),

  // Questions
  addQuestion: (quizId: number, data: Partial<QuizQuestion>) =>
    ApiClient.post<QuizQuestion>(`/quizzes/${quizId}/questions`, data),

  updateQuestion: (quizId: number, questionId: number, data: Partial<QuizQuestion>) =>
    ApiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data),

  deleteQuestion: (quizId: number, questionId: number) =>
    ApiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),

  reorderQuestions: (quizId: number, questionIds: number[]) =>
    ApiClient.put(`/quizzes/${quizId}/questions/reorder`, { questionIds }),

  // Student attempts
  startAttempt: (quizId: number) =>
    ApiClient.post<QuizAttempt>(`/quizzes/${quizId}/attempts/start`, {}),

  submitAttempt: (attemptId: number, answers: { questionId: number; answer: string }[]) =>
    ApiClient.post(`/quizzes/attempts/${attemptId}/submit`, { answers }),

  getMyAttempts: () =>
    ApiClient.get<QuizAttempt[]>('/quizzes/my-attempts'),

  getAttemptResult: (attemptId: number) =>
    ApiClient.get<QuizAttempt>(`/quizzes/attempts/${attemptId}`),

  // Instructor
  getQuizStatistics: (quizId: number) =>
    ApiClient.get<QuizStatistics>(`/quizzes/${quizId}/statistics`),

  getStudentProgress: (courseId: number) =>
    ApiClient.get(`/quizzes/progress/course/${courseId}`),

  getDifficultyLevels: () =>
    ApiClient.get('/quizzes/difficulty-levels'),

  findAttempts: (params?: { quizId?: number }) =>
    ApiClient.get<QuizAttempt[]>('/quizzes/attempts', params),

  gradeAttempt: (attemptId: number, grades: { questionId: number; points: number }[]) =>
    ApiClient.post(`/quizzes/attempts/${attemptId}/grade`, { grades }),

  getPendingGrading: (attemptId: number) =>
    ApiClient.get(`/quizzes/attempts/${attemptId}/pending-grading`),
};
