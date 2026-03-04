import { io, Socket } from 'socket.io-client';
import { TOKEN_KEYS } from './api/config';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (!token || this.socket?.connected) return;

    this.socket = io(
      import.meta.env.MODE === 'development' ? 'http://localhost:8081' : window.location.origin,
      {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
      }
    );

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Messaging events
  onNewMessage(callback: (message: unknown) => void) {
    this.socket?.on('newMessage', callback);
    return () => this.socket?.off('newMessage', callback);
  }

  onMessageRead(callback: (data: { messageId: number; userId: number }) => void) {
    this.socket?.on('messageRead', callback);
    return () => this.socket?.off('messageRead', callback);
  }

  onUserOnline(callback: (data: { userId: number }) => void) {
    this.socket?.on('userOnline', callback);
    return () => this.socket?.off('userOnline', callback);
  }

  onUserOffline(callback: (data: { userId: number }) => void) {
    this.socket?.on('userOffline', callback);
    return () => this.socket?.off('userOffline', callback);
  }

  // Notification events
  onNotification(callback: (notification: unknown) => void) {
    this.socket?.on('notification', callback);
    return () => this.socket?.off('notification', callback);
  }

  // Generic event helpers
  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
    return () => this.socket?.off(event, callback);
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
