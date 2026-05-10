import { ApiClient } from './client';
import type {
  ExamAvailability,
  ExamDraft,
  ExamDraftItem,
  ExamDraftItemAddPayload,
  ExamDraftItemUpdatePayload,
  ExamDraftListParams,
  ExamDraftSection,
  ExamDraftSectionPayload,
  ExamDraftValidation,
  ExamExportOptions,
  ExamExportResponse,
  ExamFullDetail,
  ExamGenerationPayload,
  ExamGenerationReadiness,
  ExamGenerationRule,
  ExamListParams,
  ExamPage,
  ExamPaperTemplate,
  ExamReplacementCheck,
  ExamResponse,
  ExamStats,
} from '../../types/examGenerator';

export type {
  ExamDraft,
  ExamDraftItem,
  ExamExportOptions,
  ExamGenerationPayload,
  ExamGenerationRule,
} from '../../types/examGenerator';

export interface GenerateExamPreviewPayload extends ExamGenerationPayload {
  rules: ExamGenerationRule[];
}

export interface GenerateExamPreviewResponse extends ExamDraft {
  draftId: number;
  seed?: string;
  totalQuestions: number;
  totalWeight: number;
  items: ExamDraftItem[];
}

const DEFAULT_EXPORT_OPTIONS: ExamExportOptions = {
  format: 'docx',
  variant: 'student',
  includeAnswerKey: false,
  studentNameLine: true,
  showCourseCode: true,
  pageBreakPerSection: false,
  showInstructorName: false,
  showTotalMarks: true,
  showQuestionMarks: true,
  answerKeyStyle: 'inline',
};

const normalizeRule = (rule: ExamGenerationRule): ExamGenerationRule => ({
  ...rule,
  scope:
    rule.scope ??
    (rule.groupIds?.length
      ? 'group'
      : rule.chapterIds?.length
        ? 'chapters'
        : rule.chapterId
          ? 'chapter'
          : 'course'),
});

const normalizePayload = <T extends ExamGenerationPayload>(payload: T): T => ({
  ...payload,
  rules: payload.rules?.map(normalizeRule),
  sections: payload.sections?.map((section) => ({
    ...section,
    answerPolicy: section.answerPolicy === 'answer_any' ? 'answer_any' : 'answer_all',
    rules: section.rules.map(normalizeRule),
  })),
});

const normalizeSectionPayload = (payload: ExamDraftSectionPayload): ExamDraftSectionPayload => ({
  ...payload,
  answerPolicy:
    payload.answerPolicy === 'answer_any' || payload.answerPolicy === 'answer_all'
      ? payload.answerPolicy
      : 'answer_all',
});

const normalizeAddItemPayload = (
  payload: ExamDraftItemAddPayload & { sectionId?: number | null },
): ExamDraftItemAddPayload => {
  const { sectionId, weight, weightUnits, ...rest } = payload;
  return {
    ...rest,
    draftSectionId: payload.draftSectionId ?? sectionId,
    weight,
    weightUnits: weightUnits ?? weight,
  };
};

export class ExamGenerationService {
  static async generatePreview(payload: ExamGenerationPayload) {
    return ApiClient.post<GenerateExamPreviewResponse>(
      '/exams/generate-preview',
      normalizePayload(payload),
    );
  }

  static async checkGenerationAvailability(payload: ExamGenerationPayload) {
    return ApiClient.post<ExamAvailability>(
      '/exams/generation-availability',
      normalizePayload(payload),
    );
  }

  static async checkGenerationReadiness(courseId: number) {
    return ApiClient.get<ExamGenerationReadiness>('/exams/generation-readiness', {
      params: { courseId },
    });
  }

  static async listDrafts(params?: ExamDraftListParams) {
    return ApiClient.get<ExamPage<ExamDraft>>('/exams/drafts', { params });
  }

  static async listDraftsFull(params?: ExamDraftListParams) {
    return this.listDrafts(params);
  }

  static async listExams(params?: ExamListParams) {
    return ApiClient.get<ExamPage<ExamResponse>>('/exams', { params });
  }

  static async getDraft(draftId: number) {
    return ApiClient.get<ExamDraft>(`/exams/drafts/${draftId}`);
  }

  static async getExam(examId: number) {
    return ApiClient.get<ExamResponse>(`/exams/${examId}`);
  }

  static async getExamFull(id: number) {
    return ApiClient.get<ExamFullDetail>(`/exams/${id}/full`);
  }

  static async getExamStats(params?: { courseId?: number }) {
    return ApiClient.get<ExamStats>('/exams/stats', { params });
  }

  static async getPaperTemplates(params?: { courseId?: number }) {
    return ApiClient.get<ExamPaperTemplate[]>('/exams/paper-templates', { params });
  }

  static async createPaperTemplate(template: ExamPaperTemplate) {
    return ApiClient.post<ExamPaperTemplate>('/exams/paper-templates', template);
  }

  static async updatePaperTemplate(template: ExamPaperTemplate) {
    if (!template.id) {
      throw new Error('Template id is required');
    }
    return ApiClient.patch<ExamPaperTemplate>(`/exams/paper-templates/${template.id}`, template);
  }

  static async applyPaperTemplate(examId: number, template: ExamPaperTemplate) {
    return ApiClient.patch(`/exams/${examId}/paper-template`, {
      paperTemplateId: template.id,
      paperTemplateSnapshot: template.snapshot ?? template.template,
    });
  }

  static async createSection(draftId: number, dto: ExamDraftSectionPayload) {
    return ApiClient.post<ExamDraftSection>(
      `/exams/drafts/${draftId}/sections`,
      normalizeSectionPayload(dto),
    );
  }

  static async updateSection(
    draftId: number,
    sectionId: number,
    dto: Partial<ExamDraftSectionPayload>,
  ) {
    return ApiClient.patch<ExamDraftSection>(
      `/exams/drafts/${draftId}/sections/${sectionId}`,
      dto.answerPolicy ? normalizeSectionPayload(dto as ExamDraftSectionPayload) : dto,
    );
  }

  static async deleteSection(draftId: number, sectionId: number) {
    return ApiClient.delete<void>(`/exams/drafts/${draftId}/sections/${sectionId}`);
  }

  static async reorderSections(draftId: number, orderedSectionIds: number[]) {
    return ApiClient.patch<void>(`/exams/drafts/${draftId}/sections/reorder`, {
      items: orderedSectionIds.map((sectionId, sectionOrder) => ({ sectionId, sectionOrder })),
    });
  }

  static async addDraftItem(
    draftId: number,
    payload: ExamDraftItemAddPayload & { sectionId?: number | null },
  ) {
    return ApiClient.post<ExamDraftItem>(
      `/exams/drafts/${draftId}/items`,
      normalizeAddItemPayload(payload),
    );
  }

  static async updateDraftItem(draftId: number, itemId: number, payload: ExamDraftItemUpdatePayload) {
    return ApiClient.patch<void>(`/exams/drafts/${draftId}/items/${itemId}`, payload);
  }

  static async checkReplacement(draftId: number, itemId: number, replacementQuestionId: number) {
    return ApiClient.post<ExamReplacementCheck>(
      `/exams/drafts/${draftId}/items/${itemId}/replacement-check`,
      { replacementQuestionId },
    );
  }

  static async deleteDraftItem(draftId: number, itemId: number) {
    return ApiClient.delete<void>(`/exams/drafts/${draftId}/items/${itemId}`);
  }

  static async reorderDraftItems(
    draftId: number,
    orderedItems: number[] | { itemId: number; itemOrder: number }[],
  ) {
    const items =
      typeof orderedItems[0] === 'number'
        ? (orderedItems as number[]).map((itemId, itemOrder) => ({ itemId, itemOrder }))
        : orderedItems;

    return ApiClient.patch<void>(`/exams/drafts/${draftId}/items/reorder`, { items });
  }

  static async validateDraft(draftId: number) {
    return ApiClient.get<ExamDraftValidation>(`/exams/drafts/${draftId}/validation`);
  }

  static async saveDraft(draftId: number) {
    return ApiClient.post<ExamResponse>(`/exams/drafts/${draftId}/save`);
  }

  static async regenerateDraft(
    draftId: number,
    payload?: string | { seed?: string; keepManualEdits?: boolean },
  ) {
    return ApiClient.post<ExamDraft>(
      `/exams/drafts/${draftId}/regenerate`,
      typeof payload === 'string' ? { seed: payload } : payload,
    );
  }

  static async duplicateDraft(
    draftId: number,
    payload?: { title?: string; seed?: string; regenerate?: boolean },
  ) {
    return ApiClient.post<ExamDraft>(`/exams/drafts/${draftId}/duplicate`, payload);
  }

  static async reshuffleSection(
    draftId: number,
    sectionId: number,
    payload?: string | { seed?: string; keepManualEdits?: boolean },
  ) {
    return ApiClient.post<ExamDraft>(
      `/exams/drafts/${draftId}/sections/${sectionId}/reshuffle`,
      typeof payload === 'string' ? { seed: payload } : payload,
    );
  }

  static async normalizeSectionMarks(draftId: number, sectionId: number, totalMarks?: number) {
    return ApiClient.post<void>(
      `/exams/drafts/${draftId}/sections/${sectionId}/normalize-marks`,
      totalMarks !== undefined ? { totalMarks } : undefined,
    );
  }

  static async normalizeMarks(draftId: number, sectionId: number, totalMarks?: number) {
    return this.normalizeSectionMarks(draftId, sectionId, totalMarks);
  }

  static async lifecycle(examId: number, action: string, reason?: string) {
    return ApiClient.post<ExamResponse>(
      `/exams/${examId}/${action}`,
      reason ? { reason } : undefined,
    );
  }

  static async publishExam(id: number, reason?: string) {
    return this.lifecycle(id, 'publish', reason);
  }

  static async unpublishExam(id: number, reason?: string) {
    return this.lifecycle(id, 'unpublish', reason);
  }

  static async archiveExam(id: number, reason?: string) {
    return this.lifecycle(id, 'archive', reason);
  }

  static async exportExam(id: number, options: ExamExportOptions = DEFAULT_EXPORT_OPTIONS) {
    return ApiClient.post<ExamExportResponse>(`/exams/${id}/export-word`, options);
  }

  static async exportExamWord(id: number, options?: { format?: string }) {
    return this.exportExam(id, { ...DEFAULT_EXPORT_OPTIONS, ...options });
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
