import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Notification } from '../services/api/notificationService';
import { TOKEN_KEYS } from '../services/api/config';
import {
  normalizeSocketNotification,
  notificationSocketClient,
} from '../services/notifications/notificationSocket';

type UseNotificationRealtimeOptions = {
  enabled?: boolean;
  showToast?: boolean;
  onNewNotification?: (notification: Notification) => void;
  onUnreadCountUpdate?: (count: number) => void;
};

export function useNotificationRealtime({
  enabled = true,
  showToast = true,
  onNewNotification,
  onUnreadCountUpdate,
}: UseNotificationRealtimeOptions) {
  const onNewNotificationRef = useRef(onNewNotification);
  const onUnreadCountUpdateRef = useRef(onUnreadCountUpdate);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    onUnreadCountUpdateRef.current = onUnreadCountUpdate;
  }, [onUnreadCountUpdate]);

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (!token) return;

    const socket = notificationSocketClient.retain(token);

    const handleNewNotification = (payload: unknown) => {
      const notification = normalizeSocketNotification(payload);
      onNewNotificationRef.current?.(notification);

      if (showToast) {
        toast.success(notification.title, {
          description: notification.body || 'You received a new notification.',
        });
      }
    };

    const handleUnreadCountUpdate = (payload: { unreadCount?: number; count?: number }) => {
      const resolved = Number(payload?.unreadCount ?? payload?.count ?? 0);
      onUnreadCountUpdateRef.current?.(resolved);
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('unreadCountUpdate', handleUnreadCountUpdate);

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('unreadCountUpdate', handleUnreadCountUpdate);
      notificationSocketClient.release();
    };
  }, [enabled, showToast]);
}
