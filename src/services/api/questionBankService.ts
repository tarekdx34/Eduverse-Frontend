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
  status?: 'draft' | 'approved' | 'archived';
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
  }) {
    return ApiClient.get<{ data: any[]; total: number }>('/question-bank/questions', { params });
  }
}

export default QuestionBankService;

