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

export interface QuizStats {
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRatePercentage: number;
  averageTimeSeconds: number;
}

export interface CreateQuizDto {
  courseId: number;
  title: string;
  description?: string;
  quizType?: string;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  passingScore?: number;
  randomizeQuestions?: boolean;
  showCorrectAnswers?: string;
  availableFrom?: string;
  availableUntil?: string;
  weight?: number;
}

export interface CreateQuestionDto {
  questionText: string;
  questionType: string;
  points: number;
  options?: string[];
  correctAnswer?: any;
  explanation?: string;
  difficultyLevelId?: number;
  orderIndex?: number;
}

export class QuizService {
  static async getAll(params?: { courseId?: number }): Promise<Quiz[]> {
    const query = params?.courseId ? `?courseId=${params.courseId}` : '';
    const response = await ApiClient.get<Quiz[] | { data: Quiz[] }>(`/quizzes${query}`);
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async getById(id: number): Promise<QuizWithQuestions> {
    return ApiClient.get(`/quizzes/${id}`);
  }

  static async createQuiz(data: CreateQuizDto): Promise<Quiz> {
    return ApiClient.post('/quizzes', data);
  }

  static async updateQuiz(id: number, data: Partial<CreateQuizDto>): Promise<Quiz> {
    return ApiClient.put(`/quizzes/${id}`, data);
  }

  static async deleteQuiz(id: number): Promise<void> {
    return ApiClient.delete(`/quizzes/${id}`);
  }

  static async addQuestion(quizId: number, data: CreateQuestionDto): Promise<QuizQuestion> {
    return ApiClient.post(`/quizzes/${quizId}/questions`, data);
  }

  static async updateQuestion(quizId: number, questionId: number, data: Partial<CreateQuestionDto>): Promise<QuizQuestion> {
    return ApiClient.put(`/quizzes/${quizId}/questions/${questionId}`, data);
  }

  static async deleteQuestion(quizId: number, questionId: number): Promise<void> {
    return ApiClient.delete(`/quizzes/${quizId}/questions/${questionId}`);
  }

  static async getMyAttempts(): Promise<QuizAttempt[]> {
    const response = await ApiClient.get<QuizAttempt[] | { data: QuizAttempt[] }>(
      '/quizzes/my-attempts'
    );
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async startAttempt(
    quizId: number
  ): Promise<{ attemptId: number; questions: QuizQuestion[] }> {
    return ApiClient.post(`/quizzes/${quizId}/attempts/start`);
  }

  static async getAttempts(params?: { quizId?: number }): Promise<QuizAttempt[]> {
    const query = params?.quizId ? `?quizId=${params.quizId}` : '';
    const response = await ApiClient.get<QuizAttempt[] | { data: QuizAttempt[] }>(`/quizzes/attempts${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getStatistics(quizId: number): Promise<QuizStats> {
    return ApiClient.get(`/quizzes/${quizId}/statistics`);
  }

  static async submitAttempt(
    attemptId: number,
    answers: Record<number, unknown>
  ): Promise<QuizAttempt> {
    return ApiClient.post(`/quizzes/attempts/${attemptId}/submit`, { answers });
  }
  static async getAttemptResult(attemptId: number): Promise<QuizAttempt> {
    return ApiClient.get(`/quizzes/attempts/${attemptId}`);
  }
}

