import { ApiClient } from './client';
import { API_BASE_URL, TOKEN_KEYS } from './config';
import type {
  QuestionBankFormPayload,
  QuestionBankGroup,
  QuestionBankQuestion,
  QuestionBankUploadResponse,
  QuestionGroupListParams,
  QuestionGroupPayload,
  QuestionGroupType,
} from '../../types/questionBank';

export type { QuestionGroupPayload as QuestionGroupDto, QuestionGroupType } from '../../types/questionBank';

const RAW_API_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

type LegacyGroupPayload = Partial<QuestionGroupPayload> & {
  courseId?: number;
  description?: string;
  chapterId?: number;
  sharedImageFileId?: number | null;
};

const normalizeGroupPayload = (
  dto: LegacyGroupPayload,
  includeCourse = true,
): Partial<QuestionGroupPayload> & { chapterId?: number } => {
  const payload: Partial<QuestionGroupPayload> & { chapterId?: number } = {
    ...(includeCourse && dto.courseId !== undefined ? { courseId: dto.courseId } : {}),
    title: dto.title,
    sharedPrompt: dto.sharedPrompt ?? dto.description ?? null,
    sharedFileId: dto.sharedFileId ?? dto.sharedImageFileId ?? null,
    sharedFileCaption: dto.sharedFileCaption ?? null,
    sharedFileAltText: dto.sharedFileAltText ?? null,
    groupType: dto.groupType as QuestionGroupType,
  };

  if (dto.chapterId !== undefined) {
    payload.chapterId = dto.chapterId;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<QuestionGroupPayload> & { chapterId?: number };
};

export class QuestionGroupService {
  static async list(params?: QuestionGroupListParams) {
    return ApiClient.get<{ data: QuestionBankGroup[]; total?: number } | QuestionBankGroup[]>(
      '/question-bank/groups',
      { params },
    );
  }

  static async getById(groupId: number) {
    return ApiClient.get<QuestionBankGroup>(`/question-bank/groups/${groupId}`);
  }

  static async create(dto: QuestionGroupPayload | LegacyGroupPayload) {
    return ApiClient.post<QuestionBankGroup>('/question-bank/groups', normalizeGroupPayload(dto));
  }

  static async update(groupId: number, dto: Partial<QuestionGroupPayload> | LegacyGroupPayload) {
    return ApiClient.patch<QuestionBankGroup>(
      `/question-bank/groups/${groupId}`,
      normalizeGroupPayload(dto, false),
    );
  }

  static async delete(groupId: number) {
    return ApiClient.delete<void>(`/question-bank/groups/${groupId}`);
  }

  static async addQuestions(groupId: number, questions: QuestionBankFormPayload[]) {
    return ApiClient.post<QuestionBankQuestion[]>(
      `/question-bank/groups/${groupId}/questions/batch`,
      { questions },
    );
  }

  static async linkQuestions(groupId: number, questionIds: number[]) {
    return ApiClient.post<QuestionBankQuestion[]>(
      `/question-bank/groups/${groupId}/questions/link`,
      { questionIds },
    );
  }

  static async unlinkQuestion(groupId: number, questionId: number) {
    return ApiClient.delete<void>(`/question-bank/groups/${groupId}/questions/${questionId}`);
  }

  static async reorderQuestions(groupId: number, orderedQuestionIds: number[]) {
    return ApiClient.patch<void>(`/question-bank/groups/${groupId}/questions/reorder`, {
      items: orderedQuestionIds.map((questionId, itemOrder) => ({ questionId, itemOrder })),
    });
  }

  static async uploadGroupImage(file: File): Promise<QuestionBankUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiClient.post<{
      fileId?: number | string;
      data?: { fileId?: number | string };
    }>('/question-bank/groups/upload-image', formData);

    const fileId =
      response?.fileId !== undefined ? Number(response.fileId) : Number(response?.data?.fileId);

    if (!Number.isFinite(fileId) || fileId <= 0) {
      throw new Error('Image upload succeeded but no valid fileId was returned');
    }

    return { fileId, data: response.data };
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
