import { ApiClient } from './client';
import type { BloomLevel, QuestionBankDifficulty, QuestionBankType } from './questionBankService';

export interface ExamGenerationRule {
  chapterId: number;
  count: number;
  weightPerQuestion: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
}

export interface GenerateExamPreviewPayload {
  courseId: number;
  title: string;
  rules: ExamGenerationRule[];
}

export interface ExamDraftItem {
  id: number;
  draftId: number;
  questionId: number;
  chapterId: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
  weight: number;
  itemOrder: number;
}

export interface GenerateExamPreviewResponse {
  draftId: number;
  seed?: string;
  totalQuestions: number;
  totalWeight: number;
  items: ExamDraftItem[];
}

export class ExamGenerationService {
  private static async getFirstAvailable(
    endpoints: string[],
    params?: Record<string, unknown>,
  ): Promise<unknown> {
    let lastError: unknown;
    for (const endpoint of endpoints) {
      try {
        return await ApiClient.get(endpoint, { params });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('No available endpoint');
  }

  static async generatePreview(payload: GenerateExamPreviewPayload) {
    return ApiClient.post<GenerateExamPreviewResponse>('/exams/generate-preview', payload);
  }

  static async updateDraftItem(draftId: number, itemId: number, payload: any) {
    return ApiClient.patch(`/exams/drafts/${draftId}/items/${itemId}`, payload);
  }

  static async addDraftItem(
    draftId: number,
    payload: { questionId: number; weight: number; itemOrder?: number },
  ) {
    return ApiClient.post(`/exams/drafts/${draftId}/items`, payload);
  }

  static async deleteDraftItem(draftId: number, itemId: number) {
    return ApiClient.delete(`/exams/drafts/${draftId}/items/${itemId}`);
  }

  static async saveDraft(draftId: number) {
    return ApiClient.post<{ id: number }>(`/exams/drafts/${draftId}/save`);
  }

  static async getExam(examId: number) {
    return ApiClient.get(`/exams/${examId}`);
  }

  static async getDraft(draftId: number) {
    return this.getFirstAvailable([`/exams/drafts/${draftId}`, `/exam-drafts/${draftId}`]);
  }

  static async listDrafts(params?: { courseId?: number; page?: number; limit?: number }) {
    return this.getFirstAvailable(['/exams/drafts', '/exams/drafts/list', '/exam-drafts'], params);
  }

  static async listExams(params?: { courseId?: number; page?: number; limit?: number }) {
    return this.getFirstAvailable(['/exams', '/exams/list'], params);
  }
}

export default ExamGenerationService;

