import { ApiClient } from './client';
import type { Notification, NotificationPreferences } from '../../types/api';

export const notificationService = {
  list: (params?: { page?: number; limit?: number }) =>
    ApiClient.get<Notification[]>('/notifications', params),

  getUnreadCount: () =>
    ApiClient.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    ApiClient.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    ApiClient.patch('/notifications/read-all', {}),

  delete: (id: number) =>
    ApiClient.delete(`/notifications/${id}`),

  clearAll: () =>
    ApiClient.delete('/notifications/clear-all'),

  // Preferences
  getPreferences: () =>
    ApiClient.get<NotificationPreferences>('/notifications/preferences'),

  updatePreferences: (prefs: Partial<NotificationPreferences>) =>
    ApiClient.put('/notifications/preferences', prefs),

  // Admin: Send notification
  send: (data: { userId: number; title: string; message: string; type: string }) =>
    ApiClient.post('/notifications/send', data),
};
