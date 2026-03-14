import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, TOKEN_KEYS } from '../api/config';

export interface ChatSocketEvents {
  new_message: (payload: unknown) => void;
  message_sent: (payload: unknown) => void;
  new_message_notification: (payload: unknown) => void;
  user_typing: (payload: unknown) => void;
  message_read: (payload: unknown) => void;
  message_deleted: (payload: unknown) => void;
  delete_confirmed: (payload: unknown) => void;
  message_edited: (payload: unknown) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
}

function getServerOrigin(): string {
  if (typeof window !== 'undefined') {
    const configuredSocketBase = window.localStorage.getItem('socketBaseUrl');
    if (configuredSocketBase?.trim()) {
      return configuredSocketBase.replace(/\/$/, '');
    }
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

export class ChatSocketClient {
  private socket: Socket | null = null;

  connect(namespace = '/messaging', token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const authToken = token || localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || '';
    this.socket = io(`${getServerOrigin()}${namespace}`, {
      auth: { token: authToken },
      query: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1200,
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: keyof ChatSocketEvents, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: keyof ChatSocketEvents, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
      return;
    }
    this.socket.off(event);
  }

  emitJoinConversation(conversationId: number): void {
    this.socket?.emit('join_conversation', { conversationId });
  }

  emitLeaveConversation(conversationId: number): void {
    this.socket?.emit('leave_conversation', { conversationId });
  }

  emitSendMessage(conversationId: number, text: string, replyToId?: number): void {
    this.socket?.emit('send_message', {
      conversationId,
      text,
      replyToId: typeof replyToId === 'number' ? replyToId : null,
      fileId: null,
    });
  }

  emitTyping(conversationId: number, isTyping: boolean): void {
    this.socket?.emit('typing', { conversationId, isTyping });
  }

  emitMarkRead(conversationId: number): void {
    this.socket?.emit('mark_read', { conversationId });
  }

  emitDeleteMessage(messageId: number, forEveryone: boolean): void {
    this.socket?.emit('delete_message', { messageId, forEveryone });
  }

  emitEditMessage(messageId: number, text: string): void {
    this.socket?.emit('edit_message', { messageId, text });
  }
}

export const chatSocketClient = new ChatSocketClient();
