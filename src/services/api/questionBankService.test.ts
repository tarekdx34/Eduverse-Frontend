import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuestionBankService from './questionBankService';
import { ApiClient } from './client';

vi.mock('./client', () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('QuestionBankService parity payloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends every list filter to the backend', async () => {
    vi.mocked(ApiClient.get).mockResolvedValue({ data: [], total: 0 });

    await QuestionBankService.list({
      courseId: 1,
      chapterId: 2,
      questionType: 'mcq',
      difficulty: 'medium',
      bloomLevel: 'understanding',
      status: 'approved',
      search: 'network',
      hasAttachments: true,
      groupId: 9,
      questionGroupId: 9,
      groupIds: [9, 10],
      page: 2,
      limit: 25,
    });

    expect(ApiClient.get).toHaveBeenCalledWith('/question-bank/questions', {
      params: expect.objectContaining({
        courseId: 1,
        hasAttachments: true,
        groupId: 9,
        questionGroupId: 9,
        groupIds: [9, 10],
      }),
    });
  });

  it('wraps legacy batch create arrays in the Flutter request shape', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({ successCount: 1 });

    await QuestionBankService.createBatch([
      {
        courseId: 34,
        chapterId: 2,
        questionType: 'written',
        difficulty: 'easy',
        bloomLevel: 'remembering',
        questionText: 'Explain HTTP',
      },
    ]);

    expect(ApiClient.post).toHaveBeenCalledWith('/question-bank/questions/batch', {
      courseId: 34,
      defaultChapterId: 2,
      questions: [expect.objectContaining({ questionText: 'Explain HTTP' })],
    });
  });

  it('sends batch status actions with questionIds/action/comment', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue([]);

    await QuestionBankService.batchUpdateStatus([1, 2], 'approved', 'looks good');

    expect(ApiClient.post).toHaveBeenCalledWith('/question-bank/questions/status/batch', {
      questionIds: [1, 2],
      action: 'approve',
      comment: 'looks good',
      expectedQuestionCount: 2,
    });
  });

  it('sends reject comments and attachment reorder items', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({});
    vi.mocked(ApiClient.patch).mockResolvedValue(undefined);

    await QuestionBankService.rejectQuestion(5, 'Needs a source');
    await QuestionBankService.reorderAttachments(5, [8, 7]);

    expect(ApiClient.post).toHaveBeenCalledWith('/question-bank/questions/5/reject', {
      comment: 'Needs a source',
    });
    expect(ApiClient.patch).toHaveBeenCalledWith('/question-bank/questions/5/attachments/reorder', {
      items: [
        { attachmentId: 8, displayOrder: 0 },
        { attachmentId: 7, displayOrder: 1 },
      ],
    });
  });
});
