import { ApiClient } from './client';

export interface Notification {
  id: string;
  userId: number;
  notificationType:
    | 'announcement'
    | 'grade'
    | 'assignment'
    | 'message'
    | 'deadline'
    | 'system'
    | 'lab'
    | 'quiz'
    | 'material'
    | 'community'
    | 'discussion'
    | 'enrollment'
    | 'schedule'
    | 'office_hours'
    | string;
  title: string;
  body: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | number | null;
  announcementId?: string | null;
  isRead: number | boolean;
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

function normalizeReadValue(value: unknown): { read: boolean; isRead: 0 | 1 } {
  if (typeof value === 'boolean') {
    return { read: value, isRead: value ? 1 : 0 };
  }
  if (typeof value === 'number') {
    const normalized = value === 1;
    return { read: normalized, isRead: normalized ? 1 : 0 };
  }
  return { read: false, isRead: 0 };
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
      const hasIsRead = (item as Partial<Notification>).isRead !== undefined;
      const normalizedReadBits = hasIsRead
        ? normalizeReadValue((item as Partial<Notification>).isRead)
        : normalizeReadValue((item as Partial<Notification>).read);

      return {
        ...item,
        id: normalizedId,
        notificationId: Number(normalizedId || 0),
        notificationType: normalizedType,
        type: normalizedType,
        body: normalizedBody,
        message: normalizedBody,
        isRead: normalizedReadBits.isRead,
        read: normalizedReadBits.read,
        actionUrl: (item as Partial<Notification>).actionUrl ?? null,
        createdAt: (item as Partial<Notification>).createdAt || new Date().toISOString(),
        userId: Number((item as Partial<Notification>).userId ?? 0),
      };
    });
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    const payload = await ApiClient.get<{ count?: number; unreadCount?: number }>(
      '/notifications/unread-count'
    );
    return { count: Number(payload?.count ?? payload?.unreadCount ?? 0) };
  }

  static async markAsRead(id: string | number): Promise<Notification> {
    return ApiClient.request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  static async markAllAsRead(): Promise<{ message?: string }> {
    return ApiClient.request<{ message?: string }>('/notifications/read-all', { method: 'PATCH' });
  }

  static async deleteNotification(id: number | string): Promise<void> {
    await ApiClient.delete('/notifications/' + id);
  }

  static async clearAll(): Promise<void> {
    await ApiClient.delete('/notifications');
  }

  static async clearRead(): Promise<{ affected: number }> {
    return ApiClient.request<{ affected: number }>('/notifications/read', { method: 'DELETE' });
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
