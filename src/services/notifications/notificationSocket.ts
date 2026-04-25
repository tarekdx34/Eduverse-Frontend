import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, TOKEN_KEYS } from '../api/config';
import type { Notification } from '../api/notificationService';

export type NotificationSocketEvents = {
  newNotification: (payload: unknown) => void;
  unreadCountUpdate: (payload: { unreadCount?: number; count?: number }) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
};

function getServerOrigin(): string {
  if (typeof window !== 'undefined') {
    const configuredSocketBase = window.localStorage.getItem('socketBaseUrl');
    if (configuredSocketBase?.trim()) {
      return configuredSocketBase.replace(/\/$/, '');
    }
  }

  const envSocketBase = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim();
  if (envSocketBase) {
    return envSocketBase.replace(/\/$/, '');
  }

  const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envApiUrl) {
    return envApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }

  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8081';
    }
    return window.location.origin;
  }

  return 'http://localhost:8081';
}

const parseReadState = (
  payload: Partial<Notification> & { read?: boolean; isRead?: number | boolean }
) => {
  if (typeof payload.isRead === 'boolean') return payload.isRead;
  if (typeof payload.isRead === 'number') return payload.isRead === 1;
  return Boolean(payload.read);
};

export const normalizeSocketNotification = (payload: unknown): Notification => {
  const item = (payload as Partial<Notification> & { read?: boolean; message?: string }) || {};
  const id = String(item.id ?? item.notificationId ?? Date.now());
  const notificationType = item.notificationType || item.type || 'system';
  const body = item.body || item.message || '';
  const read = parseReadState(item);

  return {
    ...item,
    id,
    notificationId: Number(id) || 0,
    userId: Number(item.userId ?? 0),
    notificationType,
    type: notificationType,
    title: item.title || 'Notification',
    body,
    message: body,
    isRead: read ? 1 : 0,
    read,
    priority: item.priority || 'medium',
    actionUrl: item.actionUrl ?? null,
    relatedEntityType: item.relatedEntityType ?? null,
    relatedEntityId: item.relatedEntityId ?? null,
    announcementId: item.announcementId ?? null,
    readAt: item.readAt ?? null,
    createdAt: item.createdAt || new Date().toISOString(),
    data: item.data,
  };
};

export class NotificationSocketClient {
  private socket: Socket | null = null;
  private consumers = 0;
  private disconnectTimer: number | null = null;

  private resolveUserIdFromStorage(): string | null {
    const rawUser = localStorage.getItem(TOKEN_KEYS.USER);
    if (!rawUser) return null;

    try {
      const parsed = JSON.parse(rawUser) as { userId?: number | string };
      const userId = parsed?.userId;
      if (userId === undefined || userId === null) return null;
      const normalized = String(userId).trim();
      return normalized || null;
    } catch {
      return null;
    }
  }

  connect(token?: string): Socket {
    if (this.disconnectTimer !== null) {
      window.clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }

    if (this.socket) return this.socket;

    const authToken = token || localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || '';
    const userId = this.resolveUserIdFromStorage();

    this.socket = io(`${getServerOrigin()}/notifications`, {
      auth: { token: authToken },
      query: {
        userId: userId ?? undefined,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1200,
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  retain(token?: string): Socket {
    this.consumers += 1;
    return this.connect(token);
  }

  release(): void {
    this.consumers = Math.max(0, this.consumers - 1);
    if (this.consumers > 0) return;

    // Delay disconnect slightly to avoid React StrictMode mount/unmount remount churn.
    this.disconnectTimer = window.setTimeout(() => {
      this.disconnectTimer = null;
      if (this.consumers === 0) {
        this.disconnect();
      }
    }, 0);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: keyof NotificationSocketEvents, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: keyof NotificationSocketEvents, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
      return;
    }
    this.socket.off(event);
  }
}

export const notificationSocketClient = new NotificationSocketClient();
