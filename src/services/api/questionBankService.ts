import { ApiClient } from './client';
import { API_BASE_URL, TOKEN_KEYS } from './config';

export type QuestionBankType = 'written' | 'mcq' | 'true_false' | 'fill_blanks' | 'essay';
export type QuestionBankDifficulty = 'easy' | 'medium' | 'hard';
export type BloomLevel =
  | 'remembering'
  | 'understanding'
  | 'applying'
  | 'analyzing'
  | 'evaluating'
  | 'creating';

export interface QuestionBankOptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface FillBlankInput {
  blankKey: string;
  acceptableAnswer: string;
  isCaseSensitive?: boolean;
}

export interface CreateQuestionBankPayload {
  courseId: number;
  chapterId: number;
  questionType: QuestionBankType;
  difficulty: QuestionBankDifficulty;
  bloomLevel: BloomLevel;
  questionText?: string;
  questionFileId?: number;
  expectedAnswerText?: string;
  hints?: string;
  options?: QuestionBankOptionInput[];
  fillBlanks?: FillBlankInput[];
}

const RAW_API_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export interface UpdateQuestionBankPayload extends Partial<CreateQuestionBankPayload> {
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';
}

interface UploadQuestionImageRawResponse {
  fileId?: number | string;
  data?: {
    fileId?: number | string;
  };
}

export class QuestionBankService {
  static async create(payload: CreateQuestionBankPayload) {
    return ApiClient.post('/question-bank/questions', payload);
  }

  static async getById(questionId: number) {
    return ApiClient.get(`/question-bank/questions/${questionId}`);
  }

  static async downloadImageBlob(fileId: number): Promise<Blob> {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const response = await fetch(`${RAW_API_BASE_URL}/api/files/${fileId}/download`, {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to load question image (${response.status})`);
    }

    return response.blob();
  }

  static async update(questionId: number, payload: UpdateQuestionBankPayload) {
    return ApiClient.patch(`/question-bank/questions/${questionId}`, payload);
  }

  static async uploadImage(file: File): Promise<{ fileId: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiClient.post<UploadQuestionImageRawResponse>(
      '/question-bank/questions/upload-image',
      formData,
    );

    const fileId =
      response?.fileId !== undefined ? Number(response.fileId) : Number(response?.data?.fileId);

    if (!Number.isFinite(fileId) || fileId <= 0) {
      throw new Error('Image upload succeeded but no valid fileId was returned');
    }

    return { fileId };
  }

  static async list(params: {
    courseId?: number;
    chapterId?: number;
    questionType?: QuestionBankType;
    difficulty?: QuestionBankDifficulty;
    bloomLevel?: BloomLevel;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    return ApiClient.get<{ data: any[]; total: number }>('/question-bank/questions', { params });
  }

  static async submitForReview(id: number) {
    return ApiClient.post(`/question-bank/questions/${id}/submit-for-review`);
  }

  static async approveQuestion(id: number) {
    return ApiClient.post(`/question-bank/questions/${id}/approve`);
  }

  static async rejectQuestion(id: number, reason: string) {
    return ApiClient.post(`/question-bank/questions/${id}/reject`, { reason });
  }

  static async archiveQuestion(id: number) {
    return ApiClient.post(`/question-bank/questions/${id}/archive`);
  }

  static async restoreQuestion(id: number) {
    return ApiClient.post(`/question-bank/questions/${id}/restore`);
  }

  static async batchUpdateStatus(ids: number[], status: string) {
    return ApiClient.post('/question-bank/questions/status/batch', { ids, status });
  }

  static async getStats() {
    return ApiClient.get('/question-bank/questions/stats');
  }

  static async getChapterCounts(courseId: number) {
    return ApiClient.get('/question-bank/questions/chapter-counts', { params: { courseId } });
  }

  static async addAttachment(questionId: number, dto: { url?: string; type: string; caption?: string; altText?: string }) {
    return ApiClient.post(`/question-bank/questions/${questionId}/attachments`, dto);
  }

  static async uploadImageAttachment(questionId: number, file: File): Promise<{ fileId: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiClient.post<UploadQuestionImageRawResponse>(
      `/question-bank/questions/${questionId}/attachments/upload-image`,
      formData,
    );

    const fileId =
      response?.fileId !== undefined ? Number(response.fileId) : Number(response?.data?.fileId);

    if (!Number.isFinite(fileId) || fileId <= 0) {
      throw new Error('Image upload succeeded but no valid fileId was returned');
    }

    return { fileId };
  }

  static async updateAttachment(questionId: number, attachmentId: number, dto: { caption?: string; altText?: string; type?: string }) {
    return ApiClient.patch(`/question-bank/questions/${questionId}/attachments/${attachmentId}`, dto);
  }

  static async deleteAttachment(questionId: number, attachmentId: number) {
    return ApiClient.delete(`/question-bank/questions/${questionId}/attachments/${attachmentId}`);
  }

  static async reorderAttachments(questionId: number, order: number[]) {
    return ApiClient.patch(`/question-bank/questions/${questionId}/attachments/reorder`, { order });
  }

  static async createBatch(payloads: CreateQuestionBankPayload[]) {
    return ApiClient.post('/question-bank/questions/batch', payloads);
  }

  static async deleteQuestion(id: number) {
    return ApiClient.delete(`/question-bank/questions/${id}`);
  }
}

export default QuestionBankService;

