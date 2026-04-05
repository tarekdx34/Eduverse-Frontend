import { client } from './client';

export interface DiscussionThread {
  id: string;
  courseId: string;
  createdBy: number;
  title: string;
  description?: string;
  isPinned: number;
  isLocked: number;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: number;
  messageText: string;
  parentMessageId?: string | null;
  isAnswer: number;
  isEndorsed: number;
  endorsedBy?: number | null;
  upvoteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscussionsParams {
  courseId?: string;
  page?: number;
  limit?: number;
}

export interface CreateDiscussionInput {
  courseId: number;
  title: string;
  description?: string;
}

export interface UpdateDiscussionInput {
  title?: string;
  description?: string;
}

export interface DiscussionDetailResponse {
  thread: DiscussionThread;
  replies: {
    data: DiscussionReply[];
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  };
}

export const discussionService = {
  // Get discussions (optionally filtered by course)
  getDiscussions: (params?: DiscussionsParams) =>
    client.get<DiscussionThread[]>('/discussions', { params }).then((r) => r.data),

  // Get discussion detail with replies
  getDiscussion: (id: string) =>
    client.get<DiscussionDetailResponse>(`/discussions/${id}`).then((r) => r.data),

  // Create discussion thread
  createDiscussion: (data: CreateDiscussionInput) =>
    client.post<DiscussionThread>('/discussions', data).then((r) => r.data),

  // Update discussion
  updateDiscussion: (id: string, data: UpdateDiscussionInput) =>
    client.put<DiscussionThread>(`/discussions/${id}`, data).then((r) => r.data),

  // Delete discussion
  deleteDiscussion: (id: string) =>
    client
      .delete<{ success?: boolean; message?: string }>(`/discussions/${id}`)
      .then((r) => r.data),

  // Reply to discussion
  replyToDiscussion: (id: string, messageText: string) =>
    client.post<DiscussionReply>(`/discussions/${id}/reply`, { messageText }).then((r) => r.data),

  // Pin/unpin discussion
  pinDiscussion: (id: string, isPinned: boolean) =>
    client.patch<DiscussionThread>(`/discussions/${id}/pin`, { isPinned }).then((r) => r.data),

  // Lock/unlock discussion
  lockDiscussion: (id: string, isLocked: boolean) =>
    client.patch<DiscussionThread>(`/discussions/${id}/lock`, { isLocked }).then((r) => r.data),
};
