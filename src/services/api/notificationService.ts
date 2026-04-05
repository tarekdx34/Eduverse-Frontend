import { ApiClient } from './client';

export interface Notification {
  id: string;
  userId: number;
  notificationType: 'system' | 'assignment' | 'grade' | 'announcement' | 'enrollment' | string;
  title: string;
  body: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  announcementId?: string | null;
  isRead: number;
  readAt?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  actionUrl?: string | null;
  createdAt: string;
  // Legacy compatibility fields still used in other dashboard pages.
  notificationId: number;
  type: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
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
    const rows = Array.isArray(response) ? response : (response.data ?? []);
    return rows.map((item) => {
      const normalizedId = String(
        (item as Partial<Notification>).id ?? (item as Partial<Notification>).notificationId ?? ''
      );
      const normalizedType =
        (item as Partial<Notification>).notificationType ||
        (item as Partial<Notification>).type ||
        'system';
      const normalizedBody =
        (item as Partial<Notification>).body || (item as Partial<Notification>).message || '';
      const normalizedRead =
        (item as Partial<Notification>).isRead !== undefined
          ? (item as Partial<Notification>).isRead === 1
          : Boolean((item as Partial<Notification>).read);

      return {
        ...item,
        id: normalizedId,
        notificationId: Number(normalizedId || 0),
        notificationType: normalizedType,
        type: normalizedType,
        body: normalizedBody,
        message: normalizedBody,
        isRead:
          (item as Partial<Notification>).isRead !== undefined
            ? ((item as Partial<Notification>).isRead as number)
            : normalizedRead
              ? 1
              : 0,
        read: normalizedRead,
        actionUrl: (item as Partial<Notification>).actionUrl ?? null,
        createdAt: (item as Partial<Notification>).createdAt || new Date().toISOString(),
        userId: Number((item as Partial<Notification>).userId ?? 0),
      };
    });
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    return ApiClient.get('/notifications/unread-count');
  }

  static async markAsRead(id: string | number): Promise<Notification> {
    return ApiClient.request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  static async markAllAsRead(): Promise<{ message?: string }> {
    return ApiClient.request<{ message?: string }>('/notifications/read-all', { method: 'PATCH' });
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

  static async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return ApiClient.put('/notifications/preferences', prefs);
  }
}
