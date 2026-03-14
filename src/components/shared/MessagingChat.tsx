import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CornerUpLeft,
  Mail,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  Video,
  X,
  File as FileIcon,
} from 'lucide-react';
import {
  ChatConversationApi,
  ChatMessageApi,
  ChatService,
  StartConversationResponse,
} from '../../services/api/chatService';
import { TOKEN_KEYS } from '../../services/api/config';
import { chatSocketClient } from '../../services/chat/chatSocket';

export interface Message {
  id: string;
  conversationId?: string;
  replyToId?: string;
  sender: string;
  senderInitials: string;
  senderColor: string;
  text?: string;
  image?: string;
  file?: { name: string; size: string; type: string };
  timestamp: string;
  rawTimestamp?: string;
  isCurrentUser: boolean;
  isDeleted?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  pending?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  searchName: string;
  searchEmail: string;
  initials: string;
  color: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  role?: string;
  isGroup?: boolean;
  otherParticipantId?: string;
  otherParticipantEmail?: string;
}

interface UserDirectoryEntry {
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

interface MessagingChatProps {
  conversations?: Conversation[];
  messages?: Message[];
  currentUserId?: string;
  currentUserName?: string;
  onSendMessage?: (conversationId: string, message: { text?: string; file?: File }) => void;
  onSelectConversation?: (conversationId: string) => void;
  onStartNewConversation?: () => void;
  showVideoCall?: boolean;
  showVoiceCall?: boolean;
  showCalls?: boolean;
  showSearch?: boolean;
  showVoiceMessage?: boolean;
  showEmojiPicker?: boolean;
  showNewConversation?: boolean;
  accentColor?: string;
  className?: string;
  height?: string;
  isDark?: boolean;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Prof. Sarah Johnson',
    searchName: 'Prof. Sarah Johnson',
    searchEmail: '',
    initials: 'SJ',
    color: '#4f39f6',
    lastMessage: 'The assignment deadline has been extended to Friday',
    timestamp: '12:45 PM',
    unreadCount: 2,
    isOnline: true,
    role: 'Database Systems Instructor',
  },
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: 'Welcome to EduVerse messaging.',
    timestamp: '2:20 PM',
    isCurrentUser: false,
  },
];

function toTimeLabel(value?: string): string {
  if (!value) return 'Now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getDisplayNameFromParticipant(
  participant:
    | { firstName?: string; lastName?: string; fullName?: string; email?: string }
    | undefined
): string {
  if (!participant) return '';
  if (participant.fullName?.trim()) return participant.fullName.trim();
  const fullName = [participant.firstName, participant.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return participant.email?.trim() ?? '';
}

function getDisplayNameFromDirectory(user?: UserDirectoryEntry): string {
  if (!user) return '';
  if (user.fullName?.trim()) return user.fullName.trim();
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return user.email?.trim() ?? '';
}

function getEmailFromParticipant(participant: { email?: string } | undefined): string {
  return participant?.email?.trim() ?? '';
}

function isGenericConversationName(name?: string): boolean {
  if (!name) return true;
  const normalized = name.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized === 'direct message' ||
    normalized === 'message' ||
    normalized === 'conversation' ||
    normalized === 'chat'
  );
}

function mapConversation(
  conversation: ChatConversationApi,
  currentUserId: string,
  userDirectory: Record<string, UserDirectoryEntry>
): Conversation {
  const id = String(conversation.conversationId ?? conversation.id ?? Date.now());
  const participantUsers = conversation.participantUsers ?? [];
  const legacyParticipants = (conversation.participants ?? []).filter(
    (participant): participant is Exclude<typeof participant, number> =>
      typeof participant === 'object' && participant !== null
  );
  const participants = participantUsers.length ? participantUsers : legacyParticipants;
  const currentUserIdNumber = Number(currentUserId);
  const hasCurrentUser = !Number.isNaN(currentUserIdNumber);

  const directDisplayUser = conversation.directDisplayUser ?? undefined;
  const otherParticipant =
    directDisplayUser ||
    (hasCurrentUser
      ? participants.find((participant) => {
          const pid = Number(participant.userId ?? participant.id);
          return Number.isNaN(pid) || pid !== currentUserIdNumber;
        })
      : participants[0]);
  const otherParticipantId = String(otherParticipant?.userId ?? otherParticipant?.id ?? '');
  const directoryUser = otherParticipantId ? userDirectory[otherParticipantId] : undefined;
  const directDisplayName =
    getDisplayNameFromParticipant(directDisplayUser) || getDisplayNameFromDirectory(directoryUser);
  const directDisplayEmail =
    getEmailFromParticipant(directDisplayUser) ||
    directoryUser?.email?.trim() ||
    getEmailFromParticipant(otherParticipant);

  const fallbackName =
    directDisplayName ||
    directDisplayEmail ||
    getDisplayNameFromParticipant(otherParticipant) ||
    participants.map(getDisplayNameFromParticipant).find(Boolean);

  const explicitName = (conversation.name ?? conversation.title ?? '').trim();
  const isDirectConversation = conversation.type === 'direct';
  const name = isDirectConversation
    ? directDisplayName || directDisplayEmail || fallbackName || 'Direct Message'
    : explicitName || fallbackName || 'Group Conversation';

  const fallbackLastMessage =
    typeof conversation.lastMessage === 'string'
      ? conversation.lastMessage
      : (conversation.lastMessage?.text ??
        conversation.lastMessage?.body ??
        conversation.lastMessage?.content ??
        '');
  const lastMessage = conversation.lastMessageInfo?.text ?? fallbackLastMessage;
  const messageTime =
    conversation.lastMessageInfo?.sentAt ??
    conversation.lastMessageAt ??
    (typeof conversation.lastMessage === 'string'
      ? undefined
      : (conversation.lastMessage?.sentAt ?? conversation.lastMessage?.createdAt)) ??
    conversation.updatedAt ??
    conversation.createdAt;

  return {
    id,
    name,
    searchName: directDisplayName || name,
    searchEmail: directDisplayEmail || '',
    initials: getInitials(name || 'U'),
    color: '#4f39f6',
    lastMessage,
    timestamp: toTimeLabel(messageTime),
    unreadCount: conversation.unreadCount ?? 0,
    isOnline: false,
    isGroup:
      !isDirectConversation && (conversation.type === 'group' || Boolean(conversation.isGroup)),
    otherParticipantId: otherParticipantId || undefined,
    otherParticipantEmail: directDisplayEmail || directoryUser?.email || otherParticipant?.email,
  };
}

function buildDirectoryFromConversations(
  conversations: ChatConversationApi[]
): Record<string, UserDirectoryEntry> {
  const directory: Record<string, UserDirectoryEntry> = {};

  conversations.forEach((conversation) => {
    (conversation.participants ?? []).forEach((participant) => {
      if (typeof participant !== 'object' || participant === null) return;
      const id = String(participant.userId ?? participant.id ?? '').trim();
      if (!id) return;

      const existing = directory[id];
      directory[id] = {
        userId: id,
        firstName: participant.firstName || existing?.firstName,
        lastName: participant.lastName || existing?.lastName,
        fullName: participant.fullName || existing?.fullName,
        email: participant.email || existing?.email,
      };
    });

    (conversation.participantUsers ?? []).forEach((participant) => {
      const id = String(participant.userId ?? '').trim();
      if (!id) return;

      const existing = directory[id];
      directory[id] = {
        userId: id,
        firstName: participant.firstName || existing?.firstName,
        lastName: participant.lastName || existing?.lastName,
        fullName: participant.fullName || existing?.fullName,
        email: participant.email || existing?.email,
      };
    });

    if (conversation.directDisplayUser?.userId) {
      const id = String(conversation.directDisplayUser.userId);
      const existing = directory[id];
      directory[id] = {
        userId: id,
        firstName: conversation.directDisplayUser.firstName || existing?.firstName,
        lastName: conversation.directDisplayUser.lastName || existing?.lastName,
        fullName: conversation.directDisplayUser.fullName || existing?.fullName,
        email: conversation.directDisplayUser.email || existing?.email,
      };
    }
  });

  return directory;
}

function mergeDirectory(
  current: Record<string, UserDirectoryEntry>,
  incoming: Record<string, UserDirectoryEntry>
): Record<string, UserDirectoryEntry> {
  const merged = { ...current };

  Object.entries(incoming).forEach(([id, user]) => {
    const existing = merged[id];
    merged[id] = {
      userId: id,
      firstName: user.firstName || existing?.firstName,
      lastName: user.lastName || existing?.lastName,
      fullName: user.fullName || existing?.fullName,
      email: user.email || existing?.email,
    };
  });

  return merged;
}

function mapMessage(apiMessage: ChatMessageApi, userId: string, userName: string): Message {
  const senderId = String(apiMessage.senderId ?? apiMessage.senderUserId ?? '');
  const isCurrentUser = senderId !== '' && senderId === userId;
  const rawTimestamp = apiMessage.sentAt ?? apiMessage.createdAt;
  const sender = isCurrentUser
    ? userName
    : apiMessage.senderName ||
      [apiMessage.senderFirstName, apiMessage.senderLastName].filter(Boolean).join(' ').trim() ||
      apiMessage.sender?.fullName ||
      [apiMessage.sender?.firstName, apiMessage.sender?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      `User ${senderId || 'Unknown'}`;

  return {
    id: String(apiMessage.id ?? apiMessage.messageId ?? `temp-${Date.now()}`),
    conversationId: String(apiMessage.conversationId ?? ''),
    replyToId: apiMessage.replyToId ? String(apiMessage.replyToId) : undefined,
    sender,
    senderInitials: getInitials(sender),
    senderColor: isCurrentUser ? '#4f39f6' : '#6366F1',
    text: apiMessage.text ?? apiMessage.body ?? apiMessage.content ?? '',
    timestamp: toTimeLabel(rawTimestamp),
    rawTimestamp,
    isCurrentUser,
    isDeleted: Boolean(apiMessage.isDeleted || apiMessage.deletedAt),
    status: apiMessage.readAt ? 'read' : 'delivered',
  };
}

function messagesMatch(left: Message, right: Message): boolean {
  return (
    (left.conversationId || '') === (right.conversationId || '') &&
    left.isCurrentUser === right.isCurrentUser &&
    (left.text || '').trim() === (right.text || '').trim()
  );
}

function timestampsAreClose(left?: string, right?: string): boolean {
  if (!left || !right) return false;

  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return left === right;
  }

  return Math.abs(leftTime - rightTime) <= 15000;
}

function upsertIncomingMessage(previous: Message[], incoming: Message): Message[] {
  if (previous.some((message) => message.id === incoming.id)) {
    return previous;
  }

  if (incoming.pending) {
    return [...previous, incoming];
  }

  const optimisticIndex = previous.findIndex(
    (message) => message.pending && messagesMatch(message, incoming)
  );

  if (optimisticIndex >= 0) {
    const next = [...previous];
    next[optimisticIndex] = { ...incoming, pending: false };
    return next;
  }

  const duplicateExists =
    incoming.isCurrentUser &&
    previous.some(
      (message) =>
        !message.pending &&
        messagesMatch(message, incoming) &&
        timestampsAreClose(message.rawTimestamp, incoming.rawTimestamp)
    );

  if (duplicateExists) {
    return previous;
  }

  return [...previous, { ...incoming, pending: false }];
}

function parseSocketMessage(payload: unknown): ChatMessageApi {
  const data = payload as Record<string, unknown> | undefined;
  const root = (data?.data as Record<string, unknown>) ?? data ?? {};
  const nestedMessage = (root.message as Record<string, unknown>) ?? {};

  return {
    id: Number(root.id ?? nestedMessage.id) || undefined,
    messageId: Number(root.messageId) || undefined,
    text: String(root.text ?? nestedMessage.text ?? root.content ?? nestedMessage.content ?? ''),
    body: String(root.body ?? nestedMessage.body ?? ''),
    content: String(root.content ?? nestedMessage.content ?? ''),
    conversationId: Number(root.conversationId ?? nestedMessage.conversationId) || undefined,
    replyToId: Number(root.replyToId ?? nestedMessage.replyToId) || undefined,
    senderId:
      Number(root.senderId ?? root.senderUserId ?? nestedMessage.senderId ?? data?.senderUserId) ||
      undefined,
    senderName: String(
      root.senderName ?? nestedMessage.senderName ?? nestedMessage.senderFullName ?? ''
    ),
    senderFirstName: String(root.senderFirstName ?? nestedMessage.senderFirstName ?? ''),
    senderLastName: String(root.senderLastName ?? nestedMessage.senderLastName ?? ''),
    sender: (nestedMessage.sender as ChatMessageApi['sender']) ?? undefined,
    sentAt: String(
      root.sentAt ?? nestedMessage.sentAt ?? root.createdAt ?? nestedMessage.createdAt ?? ''
    ),
    readAt: root.readAt ? String(root.readAt) : undefined,
    isDeleted: Boolean(root.isDeleted ?? nestedMessage.isDeleted),
  };
}

export function MessagingChat({
  conversations = DEFAULT_CONVERSATIONS,
  messages: initialMessages = DEFAULT_MESSAGES,
  currentUserId = 'current-user',
  currentUserName = 'You',
  onSendMessage,
  onSelectConversation,
  onStartNewConversation,
  showVideoCall = true,
  showVoiceCall = true,
  showCalls = true,
  showSearch = true,
  showVoiceMessage = true,
  showEmojiPicker = true,
  showNewConversation = true,
  accentColor = '#4f46e5',
  className = '',
  height = '600px',
  isDark = false,
}: MessagingChatProps) {
  const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || '';

  const resolvedUserId = useMemo(() => {
    if (currentUserId !== 'current-user') return String(currentUserId);
    if (!token || token.split('.').length < 2) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, string | number>;
      return String(payload.sub ?? payload.userId ?? payload.id ?? '');
    } catch {
      return '';
    }
  }, [currentUserId, token]);

  const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations);
  const [selectedConversation, setSelectedConversation] = useState<string>(
    conversations[0]?.id || ''
  );
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [newChatFirstMessage, setNewChatFirstMessage] = useState('Hello!');
  const [typingLabel, setTypingLabel] = useState('');
  const [pendingReply, setPendingReply] = useState<{ id: string; text: string } | null>(null);
  const [chatError, setChatError] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userDirectory, setUserDirectory] = useState<Record<string, UserDirectoryEntry>>({});
  const [deletedForMeMessageIds, setDeletedForMeMessageIds] = useState<Set<string>>(new Set());

  const typingEmitTimer = useRef<number | null>(null);
  const typingDisplayTimer = useRef<number | null>(null);
  const lastJoinedConversation = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConversation = localConversations.find((c) => c.id === selectedConversation);
  const visibleMessages = messages.filter((message) => !deletedForMeMessageIds.has(message.id));
  const messageTextById = useMemo(() => {
    const map: Record<string, string> = {};
    messages.forEach((message) => {
      map[message.id] = message.text || (message.isDeleted ? 'This message was deleted' : '');
    });
    return map;
  }, [messages]);
  const filteredConversations = localConversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.searchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.searchEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    setIsLoadingConversations(true);
    setChatError('');

    ChatService.listConversations()
      .then((list) => {
        if (!mounted || !list.length) return;
        const fromConversations = buildDirectoryFromConversations(list);
        const mergedDirectory = mergeDirectory(userDirectory, fromConversations);
        setUserDirectory((prev) => mergeDirectory(prev, fromConversations));

        const mapped = list.map((conversation) =>
          mapConversation(conversation, resolvedUserId, mergedDirectory)
        );
        setLocalConversations(mapped);
        setSelectedConversation((prev) => prev || mapped[0]?.id || '');
      })
      .catch((error) => {
        if (!mounted) return;
        setChatError(error instanceof Error ? error.message : 'Failed to load conversations.');
      })
      .finally(() => {
        if (mounted) setIsLoadingConversations(false);
      });

    return () => {
      mounted = false;
    };
  }, [token, resolvedUserId]);

  useEffect(() => {
    if (!token) return;

    chatSocketClient.connect('/messaging', token);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleConversationPreview = (conversationId: string, mapped: Message) => {
      setLocalConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          const shouldIncrementUnread =
            !mapped.isCurrentUser && selectedConversation !== conversationId;
          return {
            ...conversation,
            lastMessage: mapped.text ?? conversation.lastMessage,
            timestamp: mapped.timestamp,
            unreadCount: shouldIncrementUnread
              ? conversation.unreadCount + 1
              : conversation.unreadCount,
          };
        })
      );
    };

    const handleMessageSent = (payload: unknown) => {
      const parsed = parseSocketMessage(payload);
      const conversationId = String(parsed.conversationId ?? '');
      if (!conversationId) return;

      const mapped = mapMessage(parsed, resolvedUserId, currentUserName);
      handleConversationPreview(conversationId, mapped);

      if (conversationId !== selectedConversation) return;
      setMessages((prev) => upsertIncomingMessage(prev, mapped));
    };

    const handleNewMessage = (payload: unknown) => {
      const parsed = parseSocketMessage(payload);
      const conversationId = String(parsed.conversationId ?? '');
      if (!conversationId) return;

      const mapped = mapMessage(parsed, resolvedUserId, currentUserName);
      if (mapped.isCurrentUser) return;

      handleConversationPreview(conversationId, mapped);

      if (conversationId !== selectedConversation) return;
      setMessages((prev) => upsertIncomingMessage(prev, mapped));
    };

    const handleTyping = (payload: unknown) => {
      const data = payload as Record<string, unknown> | undefined;
      const conversationId = String(data?.conversationId ?? '');
      const userId = String(data?.userId ?? '');
      const isTyping = Boolean(data?.isTyping);

      if (!isTyping || conversationId !== selectedConversation || userId === resolvedUserId) {
        setTypingLabel('');
        return;
      }

      setTypingLabel(`User ${userId} is typing...`);
      window.clearTimeout(typingDisplayTimer.current ?? undefined);
      typingDisplayTimer.current = window.setTimeout(() => setTypingLabel(''), 1800);
    };

    const handleMessageDeleted = (payload: unknown) => {
      const data = payload as Record<string, unknown> | undefined;
      const root = (data?.data as Record<string, unknown>) ?? data ?? {};
      const messageId = String(root.messageId ?? root.id ?? '');
      if (!messageId) return;

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: 'This message was deleted',
                isDeleted: true,
                pending: false,
              }
            : message
        )
      );
    };

    const handleNewMessageNotification = (payload: unknown) => {
      const data = payload as Record<string, unknown> | undefined;
      const conversationId = String(data?.conversationId ?? '');
      if (!conversationId) return;

      const message = (data?.message as Record<string, unknown> | undefined) ?? {};
      const preview = String(message.text ?? message.body ?? message.content ?? '').trim();
      const senderId = String(data?.senderUserId ?? message.senderId ?? message.senderUserId ?? '');
      const isCurrentUser = senderId !== '' && senderId === resolvedUserId;

      setLocalConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          return {
            ...conversation,
            lastMessage: preview || conversation.lastMessage,
            timestamp: toTimeLabel(new Date().toISOString()),
            unreadCount:
              !isCurrentUser && selectedConversation !== conversationId
                ? conversation.unreadCount + 1
                : conversation.unreadCount,
          };
        })
      );
    };

    chatSocketClient.on('connect', handleConnect);
    chatSocketClient.on('disconnect', handleDisconnect);
    chatSocketClient.on('new_message', handleNewMessage);
    chatSocketClient.on('message_sent', handleMessageSent);
    chatSocketClient.on('new_message_notification', handleNewMessageNotification);
    chatSocketClient.on('user_typing', handleTyping);
    chatSocketClient.on('message_deleted', handleMessageDeleted);
    chatSocketClient.on('delete_confirmed', handleMessageDeleted);

    if (chatSocketClient.getSocket()?.connected) {
      setIsConnected(true);
    }

    return () => {
      chatSocketClient.off('connect', handleConnect);
      chatSocketClient.off('disconnect', handleDisconnect);
      chatSocketClient.off('new_message', handleNewMessage);
      chatSocketClient.off('message_sent', handleMessageSent);
      chatSocketClient.off('new_message_notification', handleNewMessageNotification);
      chatSocketClient.off('user_typing', handleTyping);
      chatSocketClient.off('message_deleted', handleMessageDeleted);
      chatSocketClient.off('delete_confirmed', handleMessageDeleted);
    };
  }, [token, selectedConversation, resolvedUserId, currentUserName]);

  useEffect(() => {
    if (!token || !selectedConversation) return;

    const conversationId = Number(selectedConversation);
    if (Number.isNaN(conversationId)) return;

    let mounted = true;
    setIsLoadingMessages(true);

    if (lastJoinedConversation.current && !Number.isNaN(Number(lastJoinedConversation.current))) {
      chatSocketClient.emitLeaveConversation(Number(lastJoinedConversation.current));
    }

    ChatService.getConversationMessages(conversationId)
      .then((list) => {
        if (!mounted) return;
        const mapped = list.map((message) => mapMessage(message, resolvedUserId, currentUserName));
        setMessages(mapped);
        chatSocketClient.emitJoinConversation(conversationId);
        chatSocketClient.emitMarkRead(conversationId);
        lastJoinedConversation.current = selectedConversation;

        setLocalConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === selectedConversation
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      })
      .catch((error) => {
        if (!mounted) return;
        setChatError(error instanceof Error ? error.message : 'Failed to load messages.');
      })
      .finally(() => {
        if (mounted) setIsLoadingMessages(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedConversation, token, resolvedUserId, currentUserName]);

  useEffect(() => {
    const conversationId = Number(selectedConversation);
    if (!token || Number.isNaN(conversationId)) return;

    if (typingEmitTimer.current) {
      window.clearTimeout(typingEmitTimer.current);
    }

    if (!messageInput.trim()) {
      chatSocketClient.emitTyping(conversationId, false);
      return;
    }

    chatSocketClient.emitTyping(conversationId, true);
    typingEmitTimer.current = window.setTimeout(() => {
      chatSocketClient.emitTyping(conversationId, false);
    }, 1500);

    return () => {
      if (typingEmitTimer.current) {
        window.clearTimeout(typingEmitTimer.current);
      }
    };
  }, [messageInput, selectedConversation, token]);

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    setShowChatOnMobile(true);
    setTypingLabel('');
    onSelectConversation?.(id);
  };

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !selectedConversation) return;
    const replyToId = pendingReply?.id;
    const replyToIdNumber = replyToId ? Number(replyToId) : NaN;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation,
      replyToId,
      sender: currentUserName,
      senderInitials: getInitials(currentUserName),
      senderColor: '#4f39f6',
      text,
      timestamp: toTimeLabel(new Date().toISOString()),
      rawTimestamp: new Date().toISOString(),
      isCurrentUser: true,
      status: 'sent',
      pending: true,
    };

    setMessages((prev) => upsertIncomingMessage(prev, optimisticMessage));
    setMessageInput('');
    setPendingReply(null);

    const conversationId = Number(selectedConversation);

    try {
      if (!Number.isNaN(conversationId)) {
        if (chatSocketClient.getSocket()?.connected) {
          chatSocketClient.emitSendMessage(
            conversationId,
            text,
            Number.isNaN(replyToIdNumber) ? undefined : replyToIdNumber
          );
        } else {
          if (!Number.isNaN(replyToIdNumber)) {
            setChatError(
              'Reply requires a live socket connection. Please reconnect and try again.'
            );
          }
          await ChatService.sendMessage(conversationId, text);
        }
      }

      setLocalConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversation
            ? {
                ...conversation,
                lastMessage: text,
                timestamp: toTimeLabel(new Date().toISOString()),
              }
            : conversation
        )
      );

      onSendMessage?.(selectedConversation, { text });
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Failed to send message.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newMessage: Message = {
      id: `temp-file-${Date.now()}`,
      conversationId: selectedConversation,
      sender: currentUserName,
      senderInitials: getInitials(currentUserName),
      senderColor: '#4f39f6',
      file: {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
      },
      timestamp: toTimeLabel(new Date().toISOString()),
      rawTimestamp: new Date().toISOString(),
      isCurrentUser: true,
      status: 'sent',
      pending: true,
    };

    setMessages((prev) => upsertIncomingMessage(prev, newMessage));
    onSendMessage?.(selectedConversation, { file });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleReplyToMessage = (message: Message) => {
    const preview = (message.text || '').trim() || 'Message';
    setPendingReply({ id: message.id, text: preview.slice(0, 80) });
  };

  const handleDeleteForMe = (messageId: string) => {
    setDeletedForMeMessageIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });
    setPendingReply((prev) => (prev?.id === messageId ? null : prev));
  };

  const handleDeleteForEveryone = (messageId: string) => {
    const idAsNumber = Number(messageId);
    if (Number.isNaN(idAsNumber)) {
      setChatError('This message is not synced yet. Please wait and try again.');
      return;
    }

    if (!window.confirm('Delete this message for everyone?')) return;

    chatSocketClient.emitDeleteMessage(idAsNumber, true);
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              text: 'This message was deleted',
              isDeleted: true,
              pending: false,
            }
          : message
      )
    );
  };

  const startNewChatByEmail = async () => {
    const email = newChatEmail.trim();
    const firstMessage = newChatFirstMessage.trim();
    if (!email || !email.includes('@')) return;
    if (!firstMessage) {
      setChatError('First message is required.');
      return;
    }

    setChatError('');

    try {
      const users = await ChatService.searchUsers(email, 10);
      if (users.length) {
        const fromSearch: Record<string, UserDirectoryEntry> = {};
        users.forEach((user) => {
          const id = String(user.userId ?? '').trim();
          if (!id) return;
          fromSearch[id] = {
            userId: id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
          };
        });
        setUserDirectory((prev) => mergeDirectory(prev, fromSearch));
      }

      const lowerEmail = email.toLowerCase();
      const target = users.find((user) => user.email?.toLowerCase() === lowerEmail) ?? users[0];
      const targetLabel = getDisplayNameFromParticipant(target) || target?.email || email;

      if (!target?.userId) {
        setChatError('No user found for this email.');
        return;
      }

      const startResponse: StartConversationResponse = await ChatService.startConversation({
        participantIds: [target.userId],
        type: 'direct',
        text: firstMessage,
      });

      const conversationId = ChatService.getConversationId(startResponse);
      if (conversationId && startResponse.existing) {
        await ChatService.sendMessage(conversationId, firstMessage);
      }

      const refreshed = await ChatService.listConversations();
      const fromConversations = buildDirectoryFromConversations(refreshed);
      const fromSearch = users.reduce<Record<string, UserDirectoryEntry>>((acc, user) => {
        const id = String(user.userId ?? '').trim();
        if (!id) return acc;
        acc[id] = {
          userId: id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
        };
        return acc;
      }, {});
      const mergedDirectory = mergeDirectory(
        mergeDirectory(userDirectory, fromConversations),
        fromSearch
      );
      setUserDirectory(mergedDirectory);

      const mapped = refreshed.map((conversation) =>
        mapConversation(conversation, resolvedUserId, mergedDirectory)
      );
      if (mapped.length) {
        const selectedId =
          conversationId !== null
            ? mapped.find((conversation) => Number(conversation.id) === conversationId)?.id
            : undefined;
        const nextConversations = mapped.map((conversation) =>
          selectedId &&
          conversation.id === selectedId &&
          isGenericConversationName(conversation.name)
            ? {
                ...conversation,
                name: targetLabel,
                initials: getInitials(targetLabel),
              }
            : conversation
        );
        setLocalConversations(nextConversations);
        setSelectedConversation(selectedId || mapped[0].id);
      }

      setShowChatOnMobile(true);
      setNewChatEmail('');
      setNewChatFirstMessage('Hello!');
      setShowNewChatModal(false);
      onStartNewConversation?.();
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Failed to start conversation.');
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '🎉', '❤️'];

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200'} rounded-xl border flex flex-col md:flex-row overflow-hidden ${className}`}
      style={{ height }}
    >
      <aside
        className={`w-full md:w-80 shrink-0 flex flex-col border-r ${isDark ? 'bg-gray-900/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}
      >
        <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Messages
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${isConnected ? 'text-green-600' : isDark ? 'text-slate-400' : 'text-gray-500'}`}
              >
                {isConnected ? 'Live' : 'Offline'}
              </span>
              {showNewConversation && (
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-white'} rounded-lg transition-colors`}
                  title="New conversation"
                >
                  <Plus size={18} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                </button>
              )}
            </div>
          </div>

          {showNewChatModal && (
            <div
              className={`mb-3 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <p
                className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Start a chat by email
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail
                    className={`absolute left-2.5 top-2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  />
                  <input
                    type="email"
                    value={newChatEmail}
                    onChange={(e) => setNewChatEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void startNewChatByEmail();
                      }
                    }}
                    placeholder="name@campus.edu"
                    className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-slate-200 text-slate-700 placeholder:text-slate-400'}`}
                    autoFocus
                  />
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={newChatFirstMessage}
                  onChange={(e) => setNewChatFirstMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void startNewChatByEmail();
                    }
                  }}
                  placeholder="First message..."
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-slate-200 text-slate-700 placeholder:text-slate-400'}`}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => void startNewChatByEmail()}
                  disabled={!newChatEmail.includes('@') || !newChatFirstMessage.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  Start
                </button>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatEmail('');
                  setNewChatFirstMessage('Hello!');
                }}
                className={`text-xs mt-2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
              >
                Cancel
              </button>
            </div>
          )}

          {showSearch && (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className={`w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:border-indigo-600 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-200 text-gray-600'}`}
              />
              <Search
                className={`absolute left-3 top-2.5 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5">
                  <X className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          )}

          {chatError && <p className="mt-2 text-xs text-red-500">{chatError}</p>}
          {isLoadingConversations && (
            <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading conversations...
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation.id)}
              className={`w-full p-4 border-l-4 transition-colors text-left ${
                selectedConversation === conversation.id
                  ? `${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'} border-l-indigo-600`
                  : `border-l-transparent ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: conversation.color }}
                  >
                    {conversation.initials}
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}
                    >
                      {conversation.name}
                    </p>
                    <span
                      className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} shrink-0`}
                    >
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} truncate`}>
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <div className="bg-indigo-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section
        className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        {currentConversation ? (
          <>
            <div
              className={`${isDark ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'} border-b p-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className={`p-2 rounded-lg transition-colors md:hidden ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <ArrowLeft size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: currentConversation.color }}
                >
                  {currentConversation.initials}
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentConversation.name}
                  </p>
                  <p
                    className={`text-xs ${typingLabel ? 'text-amber-500' : isDark ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    {typingLabel || (currentConversation.isOnline ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {showVoiceCall && showCalls && (
                  <button
                    className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <Phone size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  </button>
                )}
                {showVideoCall && showCalls && (
                  <button
                    className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <Video size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  </button>
                )}
              </div>
            </div>

            <div
              className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
            >
              {isLoadingMessages && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Loading messages...
                </p>
              )}

              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isCurrentUser && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ backgroundColor: message.senderColor }}
                    >
                      {message.senderInitials}
                    </div>
                  )}

                  <div
                    className={
                      message.isCurrentUser
                        ? 'flex flex-col items-end gap-1'
                        : 'flex flex-col items-start gap-1'
                    }
                  >
                    {message.file && (
                      <div
                        className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'} border flex items-center gap-3`}
                      >
                        <FileIcon
                          size={20}
                          className={isDark ? 'text-slate-400' : 'text-gray-500'}
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {message.file.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {message.file.size}
                          </p>
                        </div>
                      </div>
                    )}

                    {message.text && (
                      <div
                        className={`px-4 py-3 max-w-xs md:max-w-md ${
                          message.isCurrentUser
                            ? 'text-white rounded-2xl rounded-br-sm'
                            : `${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'} border rounded-2xl rounded-tl-sm`
                        }`}
                        style={message.isCurrentUser ? { backgroundColor: accentColor } : undefined}
                      >
                        {message.replyToId && (
                          <div
                            className={`mb-2 rounded-md px-2 py-1 text-xs border ${
                              message.isCurrentUser
                                ? 'bg-white/20 border-white/30 text-white/90'
                                : isDark
                                  ? 'bg-white/10 border-white/20 text-slate-200'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            Replying to #{message.replyToId}:{' '}
                            {messageTextById[message.replyToId] || 'Original message'}
                          </div>
                        )}
                        <p
                          className={`text-sm whitespace-pre-wrap ${
                            message.isDeleted ? 'italic opacity-80 line-through' : ''
                          }`}
                        >
                          {message.text}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {message.timestamp}
                      </p>
                      {message.isCurrentUser && message.status && (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {message.status === 'read'
                            ? '✓✓'
                            : message.status === 'delivered'
                              ? '✓✓'
                              : '✓'}
                        </span>
                      )}
                      <button
                        onClick={() => handleReplyToMessage(message)}
                        className={`ml-2 p-1 rounded ${
                          isDark
                            ? 'text-slate-400 hover:bg-white/10'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Reply"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteForMe(message.id)}
                        className={`p-1 rounded ${
                          isDark
                            ? 'text-slate-400 hover:bg-white/10'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Delete for me"
                      >
                        <Trash2 size={14} />
                      </button>
                      {message.isCurrentUser && !message.pending && !message.isDeleted && (
                        <button
                          onClick={() => handleDeleteForEveryone(message.id)}
                          className={`p-1 rounded ${
                            isDark
                              ? 'text-red-300 hover:bg-red-500/20'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Delete for everyone"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-t p-4`}>
              {pendingReply && (
                <div
                  className={`mb-2 rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>
                    Replying to #{pendingReply.id}: {pendingReply.text}
                  </span>
                  <button
                    onClick={() => setPendingReply(null)}
                    className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Cancel reply"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {isPickerOpen && (
                <div
                  className={`mb-2 p-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'} rounded-lg flex gap-2`}
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageInput((prev) => prev + emoji);
                        setIsPickerOpen(false);
                      }}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                  title="Attach file"
                >
                  <Paperclip size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                </button>

                {showVoiceMessage && (
                  <button
                    onClick={() => setIsRecording((prev) => !prev)}
                    className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-100' : `${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}`}
                    title="Voice message"
                  >
                    {isRecording ? (
                      <MicOff size={20} className="text-red-600" />
                    ) : (
                      <Mic size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                    )}
                  </button>
                )}

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-600 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-200'}`}
                />

                {showEmojiPicker && (
                  <button
                    onClick={() => setIsPickerOpen((prev) => !prev)}
                    className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                    title="Add emoji"
                  >
                    <Smile size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  </button>
                )}

                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!messageInput.trim() || isLoadingMessages}
                  className={`p-2 text-white rounded-lg transition-colors ${!messageInput.trim() ? (isDark ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 'hover:opacity-90'}`}
                  style={messageInput.trim() ? { backgroundColor: accentColor } : undefined}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default MessagingChat;
