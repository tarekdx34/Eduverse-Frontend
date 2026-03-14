import { ApiClient } from './client';

export interface ChatUser {
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

export interface ChatConversationApi {
  conversationId?: number;
  id?: number;
  name?: string;
  title?: string;
  type?: 'direct' | 'group' | string;
  isGroup?: boolean;
  participants?: Array<
    | number
    | {
        userId?: number;
        id?: number;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
      }
  >;
  participantUsers?: Array<{
    userId?: number;
    id?: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  }>;
  directDisplayUser?: {
    userId?: number;
    id?: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  } | null;
  lastMessage?:
    | string
    | {
        id?: number;
        text?: string;
        body?: string;
        content?: string;
        sentAt?: string;
        createdAt?: string;
        senderId?: number;
        senderUserId?: number;
      };
  lastMessageInfo?: {
    id?: number;
    text?: string;
    senderId?: number;
    senderName?: string;
    senderEmail?: string;
    sentAt?: string;
    isDeleted?: boolean;
  };
  lastMessageAt?: string;
  lastSenderId?: number;
  unreadCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface ChatMessageApi {
  id?: number;
  messageId?: number;
  text?: string;
  body?: string;
  content?: string;
  sentAt?: string;
  createdAt?: string;
  updatedAt?: string;
  editedAt?: string;
  senderId?: number;
  senderUserId?: number;
  conversationId?: number;
  replyToId?: number;
  readAt?: string;
  deletedAt?: string;
  isDeleted?: boolean;
  senderName?: string;
  senderFirstName?: string;
  senderLastName?: string;
  sender?: {
    userId?: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
}

interface ConversationListResponse {
  conversations?: ChatConversationApi[];
  data?: ChatConversationApi[];
}

interface MessageListResponse {
  messages?: ChatMessageApi[];
  data?: ChatMessageApi[];
}

interface StartConversationBody {
  participantIds: number[];
  type?: 'direct' | 'group';
  text?: string;
  groupName?: string;
}

export interface StartConversationResponse {
  conversationId?: number;
  id?: number;
  existing?: boolean;
  data?: {
    conversationId?: number;
    id?: number;
    existing?: boolean;
  };
}

interface SendMessageBody {
  text?: string;
  messageType?: string;
}

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data)) return p.data as T[];
    if (Array.isArray(p.messages)) return p.messages as T[];
    if (Array.isArray(p.conversations)) return p.conversations as T[];
  }
  return [];
}

export class ChatService {
  static async listConversations(): Promise<ChatConversationApi[]> {
    const response = await ApiClient.get<ChatConversationApi[] | ConversationListResponse>(
      '/messages/conversations'
    );
    return extractArray<ChatConversationApi>(response);
  }

  static async getConversationMessages(conversationId: number): Promise<ChatMessageApi[]> {
    const response = await ApiClient.get<ChatMessageApi[] | MessageListResponse>(
      `/messages/conversations/${conversationId}`
    );
    return extractArray<ChatMessageApi>(response);
  }

  static async sendMessage(conversationId: number, text: string): Promise<ChatMessageApi> {
    const body: SendMessageBody = { text, messageType: 'text' };
    return ApiClient.post<ChatMessageApi>(`/messages/conversations/${conversationId}`, body);
  }

  static async startConversation(body: StartConversationBody): Promise<StartConversationResponse> {
    return ApiClient.post<StartConversationResponse>('/messages/conversations', body);
  }

  static async searchUsers(query: string, limit = 10): Promise<ChatUser[]> {
    const params = new URLSearchParams({ query, limit: String(limit) });
    const response = await ApiClient.get<ChatUser[] | { data?: ChatUser[] }>(
      `/messages/users/search?${params.toString()}`
    );
    return extractArray<ChatUser>(response);
  }

  static async markRead(messageId: number): Promise<void> {
    await ApiClient.patch(`/messages/${messageId}/read`);
  }

  static getConversationId(
    payload: StartConversationResponse | ChatConversationApi | null | undefined
  ): number | null {
    if (!payload) return null;
    const nestedData = 'data' in payload ? payload.data : undefined;
    const candidate =
      payload.conversationId ?? payload.id ?? nestedData?.conversationId ?? nestedData?.id;
    if (typeof candidate !== 'number') return null;
    return Number.isNaN(candidate) ? null : candidate;
  }
}
