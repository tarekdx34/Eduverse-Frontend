import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Paperclip,
  Smile,
  Phone,
  Video,
  Search,
  X,
  Image,
  File,
  Mic,
  MicOff,
  ArrowLeft,
} from 'lucide-react';
import { useTheme } from '../../pages/instructor-dashboard/contexts/ThemeContext';

export interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  senderColor: string;
  text?: string;
  image?: string;
  file?: { name: string; size: string; type: string };
  timestamp: string;
  isCurrentUser: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  role?: string;
  isGroup?: boolean;
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
  className?: string;
  height?: string;
  isDark?: boolean;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Prof. Sarah Johnson',
    initials: 'SJ',
    color: '#4f39f6',
    lastMessage: 'The assignment deadline has been extended to Friday',
    timestamp: '12:45 PM',
    unreadCount: 2,
    isOnline: true,
    role: 'Database Systems Instructor',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    initials: 'MC',
    color: '#432dd7',
    lastMessage: 'Great work on the prototype!',
    timestamp: '11:30 AM',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'CS Study Group',
    initials: 'CS',
    color: '#ad46ff',
    lastMessage: 'Alex: Does anyone have notes from today?',
    timestamp: 'Yesterday',
    unreadCount: 8,
    isOnline: true,
    isGroup: true,
  },
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: "Hello! I hope you're doing well. I wanted to discuss your recent submission.",
    timestamp: 'Friday 2:20 PM',
    isCurrentUser: false,
  },
  {
    id: '2',
    sender: 'You',
    senderInitials: 'You',
    senderColor: '#4f39f6',
    text: "Hi Professor! Yes, I'd love to hear your feedback.",
    timestamp: 'Friday 2:22 PM',
    isCurrentUser: true,
    status: 'read',
  },
  {
    id: '3',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: 'Your database design is excellent! The normalization is well done.',
    timestamp: 'Friday 2:23 PM',
    isCurrentUser: false,
  },
];

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
  className = '',
  height = '600px',
  isDark = false,
}: MessagingChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string>(
    conversations[0]?.id || ''
  );
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { primaryHex = '#4f46e5' } = useTheme() as any;

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: String(Date.now()),
      sender: currentUserName,
      senderInitials: currentUserName.slice(0, 2).toUpperCase(),
      senderColor: '#4f39f6',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isCurrentUser: true,
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    if (onSendMessage) {
      onSendMessage(selectedConversation, { text: messageInput });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newMessage: Message = {
      id: String(Date.now()),
      sender: currentUserName,
      senderInitials: currentUserName.slice(0, 2).toUpperCase(),
      senderColor: '#4f39f6',
      file: {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
      },
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isCurrentUser: true,
      status: 'sent',
    };

    setMessages([...messages, newMessage]);

    if (onSendMessage) {
      onSendMessage(selectedConversation, { file });
    }
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    setShowChatOnMobile(true);
    if (onSelectConversation) {
      onSelectConversation(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '🎉', '❤️', '🔥', '👏'];

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200'} rounded-xl border shadow-sm flex flex-col md:flex-row overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Full Screen Chat View */}
      {selectedConversation && showChatOnMobile ? (
        <>
          {/* Chat Header */}
          <div
            className={`${isDark ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'} border-b p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatOnMobile(false)}
                className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
              </button>
              {currentConversation && (
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentConversation.name}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {currentConversation.isOnline ? '🟢 Online' : 'Offline'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
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

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isCurrentUser && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md"
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
                  {message.image && (
                    <img
                      src={message.image}
                      alt="shared"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  )}
                  {message.file && (
                    <div
                      className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'} border flex items-center gap-3`}
                    >
                      <File size={24} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
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
                      className={`px-4 py-3 max-w-xs ${
                        message.isCurrentUser
                          ? 'text-white rounded-2xl rounded-br-sm'
                          : `${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'} border rounded-2xl rounded-tl-sm`
                      } shadow-sm`}
                      style={message.isCurrentUser ? { backgroundColor: primaryHex } : undefined}
                    >
                      <p className="text-sm">{message.text}</p>
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
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-t p-4`}>
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
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className={`flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-600 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-200'}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`p-2 text-white rounded-lg transition-colors ${!messageInput.trim() ? (isDark ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 'hover:opacity-90'}`}
                style={messageInput.trim() ? { backgroundColor: primaryHex } : undefined}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Conversations List */}
          <div
            className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r ${isDark ? 'bg-gray-900/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}
          >
            {/* Header */}
            <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-b p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Messages
                </h3>
                {showNewConversation && (
                  <button
                    onClick={onStartNewConversation}
                    className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-white'} rounded-lg transition-colors`}
                    title="New conversation"
                  >
                    <Plus size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  </button>
                )}
              </div>
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
            </div>

            {/* Conversations */}
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
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
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
                          className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} flex-shrink-0`}
                        >
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} truncate`}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <div className="bg-indigo-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area - Desktop only if a conversation is selected, or hidden on mobile unless selected */}
          {currentConversation ? (
            <div
              className={`${showChatOnMobile ? 'hidden md:flex' : 'hidden lg:flex'} flex-1 flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* Header */}
              <div
                className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-b p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowChatOnMobile(false)}
                    className={`p-2 rounded-lg transition-colors lg:hidden ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <ArrowLeft size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                  </button>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: currentConversation.color }}
                  >
                    {currentConversation.initials}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentConversation.name}
                    </p>
                    {currentConversation.role && (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {currentConversation.role}
                      </p>
                    )}
                    {currentConversation.isOnline && !currentConversation.role && (
                      <p className="text-xs text-green-600">Online</p>
                    )}
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

              {/* Messages */}
              <div
                className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.isCurrentUser && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md"
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
                      {message.image && (
                        <img
                          src={message.image}
                          alt="shared"
                          className="max-w-xs rounded-lg shadow-md"
                        />
                      )}
                      {message.file && (
                        <div
                          className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'} border flex items-center gap-3`}
                        >
                          <File size={24} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
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
                          className={`px-4 py-3 rounded-2xl max-w-xs ${
                            message.isCurrentUser
                              ? 'text-white rounded-br-sm'
                              : `${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'} border rounded-tl-sm`
                          }`}
                          style={
                            message.isCurrentUser ? { backgroundColor: primaryHex } : undefined
                          }
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                        {message.isCurrentUser && message.status && (
                          <span
                            className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                          >
                            {message.status === 'read'
                              ? '✓✓'
                              : message.status === 'delivered'
                                ? '✓✓'
                                : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-t p-4`}>
                {/* Emoji Picker */}
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
                      onClick={() => setIsRecording(!isRecording)}
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
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-600 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-200'}`}
                  />
                  {showEmojiPicker && (
                    <button
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                      title="Add emoji"
                    >
                      <Smile size={20} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                    </button>
                  )}
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`p-2 text-white rounded-lg transition-colors ${!messageInput.trim() ? (isDark ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 'hover:opacity-90'}`}
                    style={messageInput.trim() ? { backgroundColor: primaryHex } : undefined}
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p
                  className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} text-center mt-2`}
                >
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`${showChatOnMobile ? 'hidden md:flex' : 'hidden lg:flex'} flex-1 items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 ${isDark ? 'bg-white/10' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Send size={24} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                </div>
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MessagingChat;
