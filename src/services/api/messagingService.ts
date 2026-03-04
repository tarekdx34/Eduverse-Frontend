import { ApiClient } from './client';
import type { Conversation, Message } from '../../types/api';

export const messagingService = {
  // Conversations
  listConversations: () =>
    ApiClient.get<Conversation[]>('/messaging/conversations'),

  startConversation: (participantIds: number[]) =>
    ApiClient.post<Conversation>('/messaging/conversations', { participantIds }),

  // Messages
  getMessages: (conversationId: number, params?: { page?: number; limit?: number }) =>
    ApiClient.get<Message[]>(`/messaging/conversations/${conversationId}`, params),

  sendMessage: (conversationId: number, data: { content: string; type?: string }) =>
    ApiClient.post<Message>(`/messaging/conversations/${conversationId}`, data),

  markAsRead: (messageId: number) =>
    ApiClient.patch(`/messaging/${messageId}/read`, {}),

  deleteForMe: (messageId: number) =>
    ApiClient.delete(`/messaging/${messageId}`),

  deleteForEveryone: (messageId: number) =>
    ApiClient.delete(`/messaging/${messageId}/everyone`),

  // Utility
  getUnreadCount: () =>
    ApiClient.get<{ count: number }>('/messaging/unread-count'),

  searchMessages: (query: string) =>
    ApiClient.get<Message[]>('/messaging/search', { q: query }),

  getOnlineUsers: () =>
    ApiClient.get<{ userId: number; isOnline: boolean }[]>('/messaging/online-users'),
};
