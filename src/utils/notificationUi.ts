import type { Notification } from '../services/api/notificationService';

export type HeaderNotificationItem = {
  id: string;
  type: 'deadline' | 'grade' | 'announcement' | 'reminder' | 'achievement' | 'message' | 'warning';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const HEADER_TYPE_MAP: Record<string, HeaderNotificationItem['type']> = {
  assignment: 'deadline',
  lab: 'deadline',
  quiz: 'deadline',
  material: 'announcement',
  community: 'message',
  discussion: 'message',
  enrollment: 'announcement',
  schedule: 'reminder',
  office_hours: 'reminder',
  announcement: 'announcement',
  grade: 'grade',
  system: 'warning',
};

const formatRelative = (value?: string) => {
  const date = new Date(value || Date.now());
  const now = Date.now();
  const diffMin = Math.max(1, Math.floor((now - date.getTime()) / (1000 * 60)));

  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

export const toHeaderNotification = (notification: Notification): HeaderNotificationItem => ({
  id: String(notification.id),
  type: HEADER_TYPE_MAP[notification.notificationType || notification.type] || 'warning',
  title: notification.title || 'Notification',
  description: notification.body || notification.message || '',
  timestamp: formatRelative(notification.createdAt),
  read: notification.isRead === 1 || notification.read,
});
