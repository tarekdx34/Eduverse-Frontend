import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExamGenerationService from './examGenerationService';
import { ApiClient } from './client';

vi.mock('./client', () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ExamGenerationService parity payloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends full generation payload with rule scopes and sections', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({ draftId: 1, items: [] });

    await ExamGenerationService.generatePreview({
      courseId: 34,
      title: 'Midterm',
      totalMarks: 40,
      markDistributionMode: 'weight_normalized',
      roundingPolicy: 'nearest_0_5',
      groupSelectionMode: 'keep_group_together',
      seed: 'abc',
      durationMinutes: 90,
      instructions: 'Answer clearly',
      sections: [
        {
          title: 'A',
          totalMarks: 20,
          answerPolicy: 'answer_any',
          requiredAnswerCount: 2,
          rules: [{ scope: 'group', groupIds: [7], count: 2, weightPerQuestion: 5 }],
        },
      ],
    });

    expect(ApiClient.post).toHaveBeenCalledWith('/exams/generate-preview', expect.objectContaining({
      totalMarks: 40,
      groupSelectionMode: 'keep_group_together',
      sections: [expect.objectContaining({
        answerPolicy: 'answer_any',
        rules: [expect.objectContaining({ scope: 'group', groupIds: [7] })],
      })],
    }));
  });

  it('sends draft section/item/reorder/replacement payloads in Flutter shape', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({});
    vi.mocked(ApiClient.patch).mockResolvedValue({});

    await ExamGenerationService.createSection(1, {
      title: 'A',
      answerPolicy: 'answer_all',
      totalMarks: 10,
    });
    await ExamGenerationService.reorderSections(1, [3, 4]);
    await ExamGenerationService.addDraftItem(1, {
      questionId: 9,
      draftSectionId: 3,
      marks: 2,
      weightUnits: 1,
      overrideReason: 'manual add',
    });
    await ExamGenerationService.checkReplacement(1, 2, 99);

    expect(ApiClient.post).toHaveBeenCalledWith('/exams/drafts/1/sections', expect.objectContaining({
      answerPolicy: 'answer_all',
    }));
    expect(ApiClient.patch).toHaveBeenCalledWith('/exams/drafts/1/sections/reorder', {
      items: [
        { sectionId: 3, sectionOrder: 0 },
        { sectionId: 4, sectionOrder: 1 },
      ],
    });
    expect(ApiClient.post).toHaveBeenCalledWith('/exams/drafts/1/items', expect.objectContaining({
      draftSectionId: 3,
      marks: 2,
      weightUnits: 1,
    }));
    expect(ApiClient.post).toHaveBeenCalledWith('/exams/drafts/1/items/2/replacement-check', {
      replacementQuestionId: 99,
    });
  });

  it('sends export variants and lifecycle reason', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({});

    await ExamGenerationService.lifecycle(7, 'archive', 'done');
    await ExamGenerationService.exportExam(7, {
      format: 'docx',
      variant: 'combined',
      includeAnswerKey: true,
      studentNameLine: true,
      showCourseCode: true,
      pageBreakPerSection: false,
      showInstructorName: false,
      showTotalMarks: true,
      showQuestionMarks: true,
      answerKeyStyle: 'separate',
      paperTemplateId: 3,
    });

    expect(ApiClient.post).toHaveBeenCalledWith('/exams/7/archive', { reason: 'done' });
    expect(ApiClient.post).toHaveBeenCalledWith('/exams/7/export', expect.objectContaining({
      variant: 'combined',
      answerKeyStyle: 'separate',
      paperTemplateId: 3,
    }));
  });
});
