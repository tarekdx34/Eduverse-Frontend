import { ApiClient } from './client';

export interface Quiz {
  quizId: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  type: string;
  totalQuestions: number;
  totalPoints: number;
  duration: number; // in minutes
  startDate?: string;
  endDate?: string;
  status: string;
  attemptsAllowed?: number;
}

export interface QuizQuestion {
  questionId: number;
  questionText: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  points: number;
  options?: { optionId: number; optionText: string }[];
  orderNumber: number;
}

export interface QuizAttempt {
  attemptId: number;
  quizId: number;
  quizTitle?: string;
  courseName?: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalPoints: number;
  percentage?: number;
  status: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export class QuizService {
  static async getAll(params?: { courseId?: number }): Promise<Quiz[]> {
    const query = params?.courseId ? `?courseId=${params.courseId}` : '';
    const response = await ApiClient.get<Quiz[] | { data: Quiz[] }>(`/quizzes${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getById(id: number): Promise<QuizWithQuestions> {
    return ApiClient.get(`/quizzes/${id}`);
  }

  static async getMyAttempts(): Promise<QuizAttempt[]> {
    const response = await ApiClient.get<QuizAttempt[] | { data: QuizAttempt[] }>('/quizzes/my-attempts');
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async startAttempt(quizId: number): Promise<{ attemptId: number; questions: QuizQuestion[] }> {
    return ApiClient.post(`/quizzes/${quizId}/attempts/start`);
  }

  static async submitAttempt(attemptId: number, answers: Record<number, unknown>): Promise<QuizAttempt> {
    return ApiClient.post(`/quizzes/attempts/${attemptId}/submit`, { answers });
  }

  static async getAttemptResult(attemptId: number): Promise<QuizAttempt> {
    return ApiClient.get(`/quizzes/attempts/${attemptId}`);
  }
}
