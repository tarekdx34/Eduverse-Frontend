import { ApiClient } from './client';
import type { DiscussionThread, DiscussionReply } from '../../types/api';

export const discussionService = {
  listThreads: (params?: { courseId?: number }) =>
    ApiClient.get<DiscussionThread[]>('/discussions', params),

  getThread: (id: number) =>
    ApiClient.get<DiscussionThread>(`/discussions/${id}`),

  createThread: (data: { title: string; content: string; courseId?: number }) =>
    ApiClient.post<DiscussionThread>('/discussions', data),

  updateThread: (id: number, data: { title?: string; content?: string }) =>
    ApiClient.put<DiscussionThread>(`/discussions/${id}`, data),

  deleteThread: (id: number) =>
    ApiClient.delete(`/discussions/${id}`),

  // Replies
  addReply: (threadId: number, data: { content: string; parentReplyId?: number }) =>
    ApiClient.post<DiscussionReply>(`/discussions/${threadId}/reply`, data),

  // Moderation
  togglePin: (threadId: number) =>
    ApiClient.patch(`/discussions/${threadId}/pin`, {}),

  toggleLock: (threadId: number) =>
    ApiClient.patch(`/discussions/${threadId}/lock`, {}),

  markAnswer: (replyId: number) =>
    ApiClient.patch(`/discussions/replies/${replyId}/mark-answer`, {}),

  endorseReply: (replyId: number) =>
    ApiClient.patch(`/discussions/replies/${replyId}/endorse`, {}),
};
