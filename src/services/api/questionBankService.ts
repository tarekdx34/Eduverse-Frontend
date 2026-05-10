import { ApiClient } from './client';
import { API_BASE_URL, TOKEN_KEYS } from './config';
import type {
  BloomLevel,
  QuestionAttachmentPayload,
  QuestionBankAttachment,
  QuestionBankBatchStatusRequest,
  QuestionBankDifficulty,
  QuestionBankFormPayload,
  QuestionBankListParams,
  QuestionBankPage,
  QuestionBankQuestion,
  QuestionBankStats,
  QuestionBankType,
  QuestionBankUploadResponse,
  QuestionBulkCreateRequest,
  QuestionBulkCreateResult,
  QuestionStatusAction,
} from '../../types/questionBank';

export type {
  BloomLevel,
  QuestionAttachmentPayload,
  QuestionBankAttachment,
  QuestionBankBatchStatusRequest,
  QuestionBankDifficulty,
  QuestionBankFormPayload as CreateQuestionBankPayload,
  QuestionBankListParams,
  QuestionBankQuestion,
  QuestionBankStats,
  QuestionBankType,
  QuestionBulkCreateRequest,
  QuestionStatusAction,
} from '../../types/questionBank';

export type UpdateQuestionBankPayload = Partial<QuestionBankFormPayload> & {
  status?: QuestionBankQuestion['status'];
};

type LegacyBatchStatus = 'approved' | 'rejected' | 'archived' | 'draft' | 'under_review' | string;

interface UploadQuestionImageRawResponse {
  fileId?: number | string;
  data?: {
    fileId?: number | string;
    attachment?: QuestionBankAttachment;
  };
  attachment?: QuestionBankAttachment;
}

const RAW_API_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const normalizeUpload = (response: UploadQuestionImageRawResponse): QuestionBankUploadResponse => {
  const fileId =
    response?.fileId !== undefined ? Number(response.fileId) : Number(response?.data?.fileId);

  if (!Number.isFinite(fileId) || fileId <= 0) {
    throw new Error('Image upload succeeded but no valid fileId was returned');
  }

  return {
    fileId,
    attachment: response.attachment ?? response.data?.attachment,
    data: response.data,
  };
};

const mapStatusToAction = (status: LegacyBatchStatus): QuestionStatusAction => {
  if (status === 'approved') return 'approve';
  if (status === 'rejected') return 'reject';
  if (status === 'archived') return 'archive';
  if (status === 'draft') return 'restore';
  if (status === 'under_review') return 'submit-for-review';
  return status as QuestionStatusAction;
};

const normalizeAttachmentPayload = (
  dto: Partial<QuestionAttachmentPayload> & {
    type?: string;
    url?: string;
  },
): QuestionAttachmentPayload | typeof dto => {
  if (dto.fileId === undefined) {
    return dto;
  }

  return {
    fileId: dto.fileId,
    attachmentType: dto.attachmentType ?? (dto.type as QuestionAttachmentPayload['attachmentType']) ?? 'image',
    caption: dto.caption,
    altText: dto.altText,
    displayOrder: dto.displayOrder,
    isPrimary: dto.isPrimary,
  };
};

export class QuestionBankService {
  static async list(params: QuestionBankListParams) {
    return ApiClient.get<QuestionBankPage>('/question-bank/questions', { params });
  }

  static async getStats(params?: QuestionBankListParams) {
    return ApiClient.get<QuestionBankStats>('/question-bank/questions/stats', { params });
  }

  static async getById(questionId: number) {
    return ApiClient.get<QuestionBankQuestion>(`/question-bank/questions/${questionId}`);
  }

  static async create(payload: QuestionBankFormPayload) {
    return ApiClient.post<QuestionBankQuestion>('/question-bank/questions', payload);
  }

  static async update(questionId: number, payload: UpdateQuestionBankPayload) {
    return ApiClient.patch<QuestionBankQuestion>(`/question-bank/questions/${questionId}`, payload);
  }

  static async deleteQuestion(id: number) {
    return ApiClient.delete<void>(`/question-bank/questions/${id}`);
  }

  static async createBatch(requestOrQuestions: QuestionBulkCreateRequest | QuestionBankFormPayload[]) {
    const request = Array.isArray(requestOrQuestions)
      ? {
          courseId: Number(requestOrQuestions[0]?.courseId),
          defaultChapterId: requestOrQuestions[0]?.chapterId,
          questions: requestOrQuestions,
        }
      : requestOrQuestions;

    return ApiClient.post<QuestionBulkCreateResult>('/question-bank/questions/batch', request);
  }

  static async getChapterCounts(courseId: number) {
    return ApiClient.get<Record<number, number>>('/question-bank/questions/chapter-counts', {
      params: { courseId },
    });
  }

  static async uploadImage(file: File): Promise<QuestionBankUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await ApiClient.post<UploadQuestionImageRawResponse>(
      '/question-bank/questions/upload-image',
      formData,
    );

    return normalizeUpload(response);
  }

  static async deleteUploadedFile(fileId: number) {
    return ApiClient.delete<void>(`/files/${fileId}`);
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

  static async uploadImageAttachment(
    questionId: number,
    file: File,
    metadata?: Partial<Omit<QuestionAttachmentPayload, 'fileId'>>,
  ): Promise<QuestionBankUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (metadata?.caption !== undefined) formData.append('caption', String(metadata.caption ?? ''));
    if (metadata?.altText !== undefined) formData.append('altText', String(metadata.altText ?? ''));
    if (metadata?.displayOrder !== undefined) formData.append('displayOrder', String(metadata.displayOrder));
    if (metadata?.isPrimary !== undefined) formData.append('isPrimary', String(metadata.isPrimary));

    const response = await ApiClient.post<UploadQuestionImageRawResponse>(
      `/question-bank/questions/${questionId}/attachments/upload-image`,
      formData,
    );

    return normalizeUpload(response);
  }

  static async addAttachment(
    questionId: number,
    dto: QuestionAttachmentPayload | (Partial<QuestionAttachmentPayload> & { type?: string; url?: string }),
  ) {
    return ApiClient.post<QuestionBankAttachment>(
      `/question-bank/questions/${questionId}/attachments`,
      normalizeAttachmentPayload(dto),
    );
  }

  static async updateAttachment(
    questionId: number,
    attachmentId: number,
    dto: Partial<QuestionAttachmentPayload> & { type?: string },
  ) {
    return ApiClient.patch<QuestionBankAttachment>(
      `/question-bank/questions/${questionId}/attachments/${attachmentId}`,
      normalizeAttachmentPayload(dto),
    );
  }

  static async deleteAttachment(questionId: number, attachmentId: number) {
    return ApiClient.delete<void>(`/question-bank/questions/${questionId}/attachments/${attachmentId}`);
  }

  static async reorderAttachments(questionId: number, orderedAttachmentIds: number[]) {
    return ApiClient.patch<void>(`/question-bank/questions/${questionId}/attachments/reorder`, {
      items: orderedAttachmentIds.map((attachmentId, displayOrder) => ({ attachmentId, displayOrder })),
    });
  }

  static async statusAction(id: number, action: QuestionStatusAction, comment?: string) {
    return ApiClient.post<QuestionBankQuestion>(
      `/question-bank/questions/${id}/${action}`,
      comment ? { comment } : undefined,
    );
  }

  static async submitForReview(id: number) {
    return this.statusAction(id, 'submit-for-review');
  }

  static async approveQuestion(id: number) {
    return this.statusAction(id, 'approve');
  }

  static async rejectQuestion(id: number, comment: string) {
    return this.statusAction(id, 'reject', comment);
  }

  static async archiveQuestion(id: number) {
    return this.statusAction(id, 'archive');
  }

  static async restoreQuestion(id: number) {
    return this.statusAction(id, 'restore');
  }

  static async batchStatusAction(request: QuestionBankBatchStatusRequest) {
    return ApiClient.post<QuestionBankQuestion[]>('/question-bank/questions/status/batch', request);
  }

  static async batchUpdateStatus(ids: number[], status: LegacyBatchStatus, comment?: string) {
    return this.batchStatusAction({
      questionIds: ids,
      action: mapStatusToAction(status),
      comment,
      expectedQuestionCount: ids.length,
    });
  }
}

export default QuestionBankService;
