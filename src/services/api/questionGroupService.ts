import { ApiClient } from './client';
import { API_BASE_URL, TOKEN_KEYS } from './config';
import { CreateQuestionBankPayload } from './questionBankService';

const RAW_API_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export interface QuestionGroupDto {
  title: string;
  description?: string;
  groupType: 'passage' | 'case_study' | 'image_set' | 'multipart';
  chapterId?: number;
  sharedImageFileId?: number;
}

export class QuestionGroupService {
  static async list(params?: { courseId?: number; chapterId?: number; page?: number; limit?: number; search?: string; groupType?: string }) {
    return ApiClient.get('/question-bank/groups', { params });
  }

  static async getById(groupId: number) {
    return ApiClient.get(`/question-bank/groups/${groupId}`);
  }

  static async create(dto: QuestionGroupDto) {
    return ApiClient.post('/question-bank/groups', dto);
  }

  static async update(groupId: number, dto: Partial<QuestionGroupDto>) {
    return ApiClient.patch(`/question-bank/groups/${groupId}`, dto);
  }

  static async delete(groupId: number) {
    return ApiClient.delete(`/question-bank/groups/${groupId}`);
  }

  static async addQuestions(groupId: number, questions: CreateQuestionBankPayload[]) {
    return ApiClient.post(`/question-bank/groups/${groupId}/questions/batch`, questions);
  }

  static async linkQuestions(groupId: number, questionIds: number[]) {
    return ApiClient.post(`/question-bank/groups/${groupId}/questions/link`, { questionIds });
  }

  static async unlinkQuestion(groupId: number, questionId: number) {
    return ApiClient.delete(`/question-bank/groups/${groupId}/questions/${questionId}`);
  }

  static async reorderQuestions(groupId: number, order: number[]) {
    return ApiClient.patch(`/question-bank/groups/${groupId}/questions/reorder`, { order });
  }

  static async uploadGroupImage(file: File): Promise<{ fileId: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiClient.post<{ fileId?: number | string; data?: { fileId?: number | string } }>(
      '/question-bank/groups/upload-image',
      formData,
    );

    const fileId =
      response?.fileId !== undefined ? Number(response.fileId) : Number(response?.data?.fileId);

    if (!Number.isFinite(fileId) || fileId <= 0) {
      throw new Error('Image upload succeeded but no valid fileId was returned');
    }

    return { fileId };
  }

  static async downloadGroupImage(fileId: number): Promise<Blob> {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const response = await fetch(`${RAW_API_BASE_URL}/api/files/${fileId}/download`, {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to load group image (${response.status})`);
    }

    return response.blob();
  }
}

export default QuestionGroupService;
