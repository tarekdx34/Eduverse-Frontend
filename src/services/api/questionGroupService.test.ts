import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuestionGroupService from './questionGroupService';
import { ApiClient } from './client';

vi.mock('./client', () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('QuestionGroupService parity payloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps group create to shared prompt/file fields and supports other type', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue({});

    await QuestionGroupService.create({
      courseId: 34,
      title: 'Case',
      description: 'Legacy passage',
      groupType: 'other',
      sharedImageFileId: 100,
      sharedFileCaption: 'Caption',
      sharedFileAltText: 'Alt',
    });

    expect(ApiClient.post).toHaveBeenCalledWith('/question-bank/groups', {
      courseId: 34,
      title: 'Case',
      sharedPrompt: 'Legacy passage',
      sharedFileId: 100,
      sharedFileCaption: 'Caption',
      sharedFileAltText: 'Alt',
      groupType: 'other',
    });
  });

  it('wraps added questions and reorders with itemOrder', async () => {
    vi.mocked(ApiClient.post).mockResolvedValue([]);
    vi.mocked(ApiClient.patch).mockResolvedValue(undefined);

    await QuestionGroupService.addQuestions(4, [
      {
        courseId: 1,
        chapterId: 2,
        questionType: 'mcq',
        difficulty: 'easy',
        bloomLevel: 'remembering',
        questionText: 'Q',
      },
    ]);
    await QuestionGroupService.reorderQuestions(4, [10, 11]);

    expect(ApiClient.post).toHaveBeenCalledWith('/question-bank/groups/4/questions/batch', {
      questions: [expect.objectContaining({ questionText: 'Q' })],
    });
    expect(ApiClient.patch).toHaveBeenCalledWith('/question-bank/groups/4/questions/reorder', {
      items: [
        { questionId: 10, itemOrder: 0 },
        { questionId: 11, itemOrder: 1 },
      ],
    });
  });
});
