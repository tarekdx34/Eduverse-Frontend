import { ApiClient } from './client';

// Backend Quiz entity shape
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
  deletedAt?: string | null;
  course?: { id: string; name: string; code: string; departmentId?: string };
  creator?: { userId: number; firstName: string; lastName: string; email: string };
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching' | '';
  questionText: string;
  options: string[] | null;
  correctAnswer: string | null; // Index as string (e.g., "0", "1") for MCQ/true_false
  explanation: string | null;
  points: string;
  difficultyLevelId: string | null;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
  difficultyLevel?: { id: string; name: string } | null;
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
  ipAddress: string | null;
  answers?: AttemptAnswer[];
  questions?: QuizQuestion[];
  quiz?: Quiz;
  user?: { userId: number; firstName: string; lastName: string; email: string };
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: number;
  selectedOption: string | null;
  answerText: string | null;
  isCorrect: number | null;
  pointsEarned: string | null;
}

export interface AttemptResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: {
    questionId: number;
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer?: string;
    selectedAnswer?: string;
    questionText?: string;
  }[];
}

export interface MyAttemptsResponse {
  data: QuizAttempt[];
  total: number;
}

export interface CourseProgress {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  passingRate: number;
}

export interface QuizListResponse {
  data: Quiz[];
  total: number;
}

export interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  questionStats: Array<{
    questionId: number;
    correctRate: number;
    averagePoints: number;
  }>;
}

// Backend controller is at @Controller('api/quizzes')
// Frontend baseURL is /api, so we use /quizzes
export class QuizService {
  // ============ QUIZ CRUD ============

  // Get quizzes list (returns { data, total })
  static async getAll(params?: { courseId?: string }): Promise<QuizListResponse> {
    return ApiClient.get<QuizListResponse>('/quizzes', { params });
  }

  // Get quiz by ID
  static async getById(id: string): Promise<Quiz & { questions?: QuizQuestion[] }> {
    return ApiClient.get<Quiz & { questions?: QuizQuestion[] }>('/quizzes/' + id);
  }

  // Create quiz (instructor)
  static async create(data: Partial<Quiz>): Promise<Quiz> {
    return ApiClient.post<Quiz>('/quizzes', data);
  }

  // Alias for backward compatibility
  static async createQuiz(data: Partial<Quiz>): Promise<Quiz> {
    return this.create(data);
  }

  // Update quiz (instructor)
  static async update(id: string, data: Partial<Quiz>): Promise<Quiz> {
    return ApiClient.put<Quiz>('/quizzes/' + id, data);
  }

  // Alias for backward compatibility
  static async updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
    return this.update(id, data);
  }

  // Delete quiz (instructor)
  static async delete(id: string): Promise<void> {
    return ApiClient.delete('/quizzes/' + id);
  }

  // ============ QUESTIONS ============

  // Add question to quiz
  static async addQuestion(quizId: string, question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    return ApiClient.post<QuizQuestion>('/quizzes/' + quizId + '/questions', question);
  }

  // Update question
  static async updateQuestion(
    quizId: string,
    questionId: number,
    question: Partial<QuizQuestion>
  ): Promise<QuizQuestion> {
    return ApiClient.put<QuizQuestion>('/quizzes/' + quizId + '/questions/' + questionId, question);
  }

  // Delete question
  static async deleteQuestion(quizId: string, questionId: number): Promise<void> {
    return ApiClient.delete('/quizzes/' + quizId + '/questions/' + questionId);
  }

  // Reorder questions
  static async reorderQuestions(quizId: string, questionIds: number[]): Promise<void> {
    return ApiClient.put('/quizzes/' + quizId + '/questions/reorder', { questionIds });
  }

  // ============ ATTEMPTS (Student) ============

  // Start a new attempt - POST /quizzes/:quizId/attempts/start
  static async startAttempt(quizId: string): Promise<QuizAttempt & { questions?: QuizQuestion[] }> {
    return ApiClient.post<QuizAttempt & { questions?: QuizQuestion[] }>(
      '/quizzes/' + quizId + '/attempts/start',
      {}
    );
  }

  // Submit attempt - POST /quizzes/attempts/:attemptId/submit
  static async submitAttempt(
    quizId: string,
    attemptId: string,
    answers: { questionId: number; selectedOption?: string[]; answerText?: string }[]
  ): Promise<AttemptResult> {
    return ApiClient.post<AttemptResult>('/quizzes/attempts/' + attemptId + '/submit', { answers });
  }

  // Get attempt details - GET /quizzes/attempts/:attemptId
  static async getAttempt(quizId: string, attemptId: string): Promise<QuizAttempt> {
    return ApiClient.get<QuizAttempt>('/quizzes/attempts/' + attemptId);
  }

  // Save progress (auto-save) - PATCH /quizzes/:quizId/attempts/:attemptId/progress

  // Get my attempts - GET /quizzes/my-attempts
  static async getMyAttempts(quizId?: string): Promise<QuizAttempt[]> {
    const params = quizId ? { quizId } : undefined;
    const response = await ApiClient.get<MyAttemptsResponse | QuizAttempt[]>('/quizzes/my-attempts', { params });
    // Handle both { data: [], total } and array responses
    return Array.isArray(response) ? response : response.data;
  }

  // Get in-progress attempt for a quiz - GET /quizzes/my-attempts?quizId=X&status=in_progress
  static async getInProgressAttempt(quizId: string): Promise<QuizAttempt | null> {
    try {
      const response = await ApiClient.get<{ data: QuizAttempt[]; total: number } | QuizAttempt[]>(
        '/quizzes/my-attempts',
        {
          params: { quizId, status: 'in_progress' },
        }
      );
      const attempts = Array.isArray(response) ? response : response.data;
      return attempts.length > 0 ? attempts[0] : null;
    } catch {
      return null;
    }
  }

  // ============ ATTEMPTS (Instructor/TA) ============

  // Get all attempts - GET /quizzes/attempts
  static async getAllAttempts(params?: { quizId?: string }): Promise<QuizAttempt[]> {
    return ApiClient.get<QuizAttempt[]>('/quizzes/attempts', { params });
  }

  // Alias for backward compatibility
  static async getAttempts(params?: { quizId?: string }): Promise<QuizAttempt[]> {
    return this.getAllAttempts(params);
  }

  // Grade attempt - POST /quizzes/attempts/:attemptId/grade
  static async gradeAttempt(
    quizId: string,
    attemptId: string,
    grades: { questionId: number; pointsEarned: number }[]
  ): Promise<QuizAttempt> {
    return ApiClient.post<QuizAttempt>('/quizzes/attempts/' + attemptId + '/grade', { grades });
  }

  // Get pending grading - GET /quizzes/attempts/:attemptId/pending-grading
  static async getPendingGrading(attemptId: string): Promise<any> {
    return ApiClient.get('/quizzes/attempts/' + attemptId + '/pending-grading');
  }

  // ============ STATISTICS & PROGRESS ============

  // Get quiz statistics - GET /quizzes/:quizId/statistics
  static async getStatistics(quizId: string): Promise<QuizStatistics> {
    return ApiClient.get<QuizStatistics>('/quizzes/' + quizId + '/statistics');
  }

  // Get course progress - GET /quizzes/progress/course/:courseId
  static async getCourseProgress(courseId: string): Promise<CourseProgress> {
    return ApiClient.get<CourseProgress>('/quizzes/progress/course/' + courseId);
  }

  // Get difficulty levels - GET /quizzes/difficulty-levels
  static async getDifficultyLevels(): Promise<string[]> {
    return ApiClient.get<string[]>('/quizzes/difficulty-levels');
  }

  // Save progress (auto-save) - PATCH /quizzes/:quizId/attempts/:attemptId/progress
  static async saveProgress(
    quizId: string,
    attemptId: string,
    answers: { questionId: number; selectedOption?: string[]; answerText?: string }[]
  ): Promise<QuizAttempt> {
    return ApiClient.patch<QuizAttempt>(
      '/quizzes/' + quizId + '/attempts/' + attemptId + '/progress',
      { answers }
    );
  }
}

export default QuizService;
