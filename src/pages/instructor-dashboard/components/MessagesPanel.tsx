import React, { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react';

export type Message = {
  id: number;
  from: string;
  role: string;
  content: string;
  time: string;
};

type ChatMessage = {
  id: number;
  text: string;
  timestamp: string;
  isSent: boolean; // true if sent by instructor, false if received
  isRead?: boolean;
};

type Conversation = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  messages: ChatMessage[];
};

type MessagesPanelProps = {
  messages: Message[];
  onCompose: () => void;
  onReply: (message: Message) => void;
  onView: (message: Message) => void;
  onDelete: (id: number) => void;
};

// Mock conversations data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Student',
    avatar: 'AJ',
    lastMessage: 'Thank you for the clarification!',
    timestamp: '10:30 AM',
    unread: 0,
    isOnline: true,
    messages: [
      {
        id: 1,
        text: 'Hello Professor, I have a question about the assignment',
        timestamp: '10:15 AM',
        isSent: false,
      },
      {
        id: 2,
        text: 'Hi Alice! Sure, what would you like to know?',
        timestamp: '10:20 AM',
        isSent: true,
        isRead: true,
      },
      {
        id: 3,
        text: 'Could you clarify the requirements for question 3?',
        timestamp: '10:25 AM',
        isSent: false,
      },
      {
        id: 4,
        text: 'Of course! Question 3 requires you to implement a sorting algorithm. You can use any method you prefer.',
        timestamp: '10:28 AM',
        isSent: true,
        isRead: true,
      },
      { id: 5, text: 'Thank you for the clarification!', timestamp: '10:30 AM', isSent: false },
    ],
  },
  {
    id: 2,
    name: 'Noah Williams',
    role: 'Student',
    avatar: 'NW',
    lastMessage: 'When is the deadline for the project?',
    timestamp: 'Yesterday',
    unread: 2,
    isOnline: false,
    messages: [
      { id: 1, text: 'Good morning!', timestamp: 'Yesterday 9:00 AM', isSent: false },
      {
        id: 2,
        text: 'When is the deadline for the project?',
        timestamp: 'Yesterday 9:05 AM',
        isSent: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Olivia Brown',
    role: 'Student',
    avatar: 'OB',
    lastMessage: 'I submitted my assignment',
    timestamp: 'Yesterday',
    unread: 0,
    isOnline: true,
    messages: [
      { id: 1, text: 'Hi Professor!', timestamp: 'Yesterday 2:00 PM', isSent: false },
      { id: 2, text: 'I submitted my assignment', timestamp: 'Yesterday 2:01 PM', isSent: false },
      {
        id: 3,
        text: "Great! I'll review it soon.",
        timestamp: 'Yesterday 2:15 PM',
        isSent: true,
        isRead: true,
      },
    ],
  },
  {
    id: 4,
    name: 'Liam Garcia',
    role: 'Student',
    avatar: 'LG',
    lastMessage: 'Can we schedule office hours?',
    timestamp: '12/25',
    unread: 1,
    isOnline: false,
    messages: [
      { id: 1, text: 'Hello Professor', timestamp: '12/25 3:00 PM', isSent: false },
      { id: 2, text: 'Can we schedule office hours?', timestamp: '12/25 3:05 PM', isSent: false },
    ],
  },
  {
    id: 5,
    name: 'Emma Martinez',
    role: 'Student',
    avatar: 'EM',
    lastMessage: 'Thanks for the feedback!',
    timestamp: '12/24',
    unread: 0,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: 'I received your feedback on my essay',
        timestamp: '12/24 11:00 AM',
        isSent: false,
      },
      { id: 2, text: 'Thanks for the feedback!', timestamp: '12/24 11:05 AM', isSent: false },
    ],
  },
  {
    id: 6,
    name: 'Admin Office',
    role: 'Admin',
    avatar: 'AO',
    lastMessage: 'Grade submission deadline is approaching',
    timestamp: '12/23',
    unread: 0,
    isOnline: true,
    messages: [
      {
        id: 1,
        text: 'Reminder: Grade submission deadline is approaching',
        timestamp: '12/23 9:00 AM',
        isSent: false,
      },
      {
        id: 2,
        text: 'Grade submission deadline is approaching',
        timestamp: '12/23 9:01 AM',
        isSent: false,
      },
    ],
  },
];

export function MessagesPanel({
  messages,
  onCompose,
  onReply,
  onView,
  onDelete,
}: MessagesPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    MOCK_CONVERSATIONS[0]
  );
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.name.toLowerCase().includes(searchLower) ||
      conv.lastMessage.toLowerCase().includes(searchLower)
    );
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: selectedConversation.messages.length + 1,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isSent: true,
      isRead: false,
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          timestamp: 'Just now',
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
    });
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Conversations List - WhatsApp Style */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Messages</h2>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 ${
                selectedConversation?.id === conv.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    conv.role === 'Admin' ? 'bg-purple-500' : 'bg-indigo-500'
                  }`}
                >
                  {conv.avatar}
                </div>
                {conv.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center py-12 text-gray-500">No conversations found</div>
          )}
        </div>
      </div>

      {/* Chat Area - WhatsApp Style */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden">
                <ArrowLeft size={20} />
              </button>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  selectedConversation.role === 'Admin' ? 'bg-purple-500' : 'bg-indigo-500'
                }`}
              >
                {selectedConversation.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.isOnline ? (
                    <span className="text-green-600">● Online</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {selectedConversation.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    msg.isSent
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      msg.isSent ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    <span className="text-xs">{msg.timestamp}</span>
                    {msg.isSent &&
                      (msg.isRead ? (
                        <CheckCheck size={14} className="text-blue-300" />
                      ) : (
                        <Check size={14} />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <Paperclip size={20} className="text-gray-600" />
              </button>

              <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-0 focus:outline-none resize-none text-sm"
                  rows={1}
                  style={{ maxHeight: '100px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                  messageInput.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPanel;
