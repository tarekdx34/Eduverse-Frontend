import { ApiClient } from './client';

export interface Notification {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
  priority?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories?: Record<string, boolean>;
}

export class NotificationService {
  static async getAll(params?: { page?: number; limit?: number }): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const response = await ApiClient.get<Notification[] | { data: Notification[] }>(
      `/notifications${qs ? `?${qs}` : ''}`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    return ApiClient.get('/notifications/unread-count');
  }

  static async markAsRead(id: number): Promise<void> {
    await ApiClient.request('/notifications/' + id + '/read', { method: 'PATCH' });
  }

  static async markAllAsRead(): Promise<void> {
    await ApiClient.request('/notifications/read-all', { method: 'PATCH' });
  }

  static async deleteNotification(id: number): Promise<void> {
    await ApiClient.delete('/notifications/' + id);
  }

  static async clearAll(): Promise<void> {
    await ApiClient.delete('/notifications/clear-all');
  }

  static async getPreferences(): Promise<NotificationPreferences> {
    return ApiClient.get('/notifications/preferences');
  }

  static async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return ApiClient.put('/notifications/preferences', prefs);
  }
}
