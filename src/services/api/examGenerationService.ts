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

  static async checkGenerationReadiness(courseId: number) {
    return ApiClient.get('/exams/generation-readiness', { params: { courseId } });
  }

  static async validateDraft(draftId: number) {
    return ApiClient.get(`/exams/drafts/${draftId}/validation`);
  }

  static async regenerateDraft(draftId: number, seed?: string) {
    return ApiClient.post(`/exams/drafts/${draftId}/regenerate`, { seed });
  }

  static async duplicateDraft(draftId: number) {
    return ApiClient.post(`/exams/drafts/${draftId}/duplicate`);
  }

  static async createSection(draftId: number, dto: { title: string; instructions?: string; totalMarks?: number; answerPolicy?: string }) {
    return ApiClient.post(`/exams/drafts/${draftId}/sections`, dto);
  }

  static async updateSection(draftId: number, sectionId: number, dto: Partial<{ title: string; instructions: string; totalMarks: number; answerPolicy: string }>) {
    return ApiClient.patch(`/exams/drafts/${draftId}/sections/${sectionId}`, dto);
  }

  static async deleteSection(draftId: number, sectionId: number) {
    return ApiClient.delete(`/exams/drafts/${draftId}/sections/${sectionId}`);
  }

  static async reorderSections(draftId: number, order: number[]) {
    return ApiClient.patch(`/exams/drafts/${draftId}/sections/reorder`, { order });
  }

  static async reshuffleSection(draftId: number, sectionId: number, seed?: string) {
    return ApiClient.post(`/exams/drafts/${draftId}/sections/${sectionId}/reshuffle`, { seed });
  }

  static async normalizeMarks(draftId: number, sectionId: number) {
    return ApiClient.post(`/exams/drafts/${draftId}/sections/${sectionId}/normalize-marks`);
  }

  static async reorderDraftItems(draftId: number, order: number[]) {
    return ApiClient.patch(`/exams/drafts/${draftId}/items/reorder`, { order });
  }

  static async checkReplacement(draftId: number, itemId: number) {
    return ApiClient.post(`/exams/drafts/${draftId}/items/${itemId}/replacement-check`);
  }

  static async publishExam(id: number) {
    return ApiClient.post(`/exams/${id}/publish`);
  }

  static async unpublishExam(id: number) {
    return ApiClient.post(`/exams/${id}/unpublish`);
  }

  static async archiveExam(id: number) {
    return ApiClient.post(`/exams/${id}/archive`);
  }

  static async exportExamWord(id: number) {
    return ApiClient.post(`/exams/${id}/export-word`);
  }

  static async getExamFull(id: number) {
    return ApiClient.get(`/exams/${id}/full`);
  }

  static async getExamStats() {
    return ApiClient.get('/exams/stats');
  }

  static async listDraftsFull(params?: { courseId?: number; page?: number; limit?: number }) {
    return this.getFirstAvailable(['/exams/drafts', '/exams/drafts/list', '/exam-drafts'], params);
  }
}

export default ExamGenerationService;

