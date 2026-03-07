import { useState } from 'react';
import { Send, Plus, Paperclip, Smile, Phone, Video, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  senderColor: string;
  text?: string;
  image?: string;
  timestamp: string;
  isCurrentUser: boolean;
  unreadCount?: number;
  status?: string;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  role?: string;
}

const CONVERSATIONS: Conversation[] = [
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
    lastMessage: 'Great work on the prototype! Just a few minor adjustments needed.',
    timestamp: '11:30 AM',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    initials: 'EW',
    color: '#fe9a00',
    lastMessage: 'Should we meet at the library tomorrow?',
    timestamp: '10:15 AM',
    unreadCount: 5,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Prof. David Martinez',
    initials: 'DM',
    color: '#99a1af',
    lastMessage: 'Office hours are from 2-4 PM today',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'CS Study Group',
    initials: 'CS',
    color: '#ad46ff',
    lastMessage: `Alex: Does anyone have notes from today's lecture?`,
    timestamp: 'Yesterday',
    unreadCount: 8,
    isOnline: true,
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    initials: 'LA',
    color: '#99a1af',
    lastMessage: `I've pushed the latest changes to GitHub`,
    timestamp: '2 days ago',
    unreadCount: 0,
    isOnline: false,
  },
];

const MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: `Hello! I hope you're doing well. I wanted to discuss your recent submission.`,
    timestamp: 'Friday 2:20 PM',
    isCurrentUser: false,
  },
  {
    id: '2',
    sender: 'You',
    senderInitials: 'You',
    senderColor: '#4f39f6',
    text: `Hi Professor! Yes, I'd love to hear your feedback.`,
    timestamp: 'Friday 2:22 PM',
    isCurrentUser: true,
  },
  {
    id: '3',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: `Your database design is excellent! The normalization is well done.`,
    timestamp: 'Friday 2:23 PM',
    isCurrentUser: false,
  },
  {
    id: '4',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    image: 'https://via.placeholder.com/300x200?text=ER+Diagram',
    text: `Here's an example of the ER diagram structure I mentioned in class.`,
    timestamp: 'Friday 2:25 PM',
    isCurrentUser: false,
  },
  {
    id: '5',
    sender: 'You',
    senderInitials: 'You',
    senderColor: '#4f39f6',
    text: `Thank you so much! This is really helpful. I'll incorporate these suggestions.`,
    timestamp: 'Friday 2:28 PM',
    isCurrentUser: true,
  },
  {
    id: '6',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: `The assignment deadline has been extended to Friday`,
    timestamp: '12:45 PM',
    isCurrentUser: false,
  },
  {
    id: '7',
    sender: 'Prof. Sarah Johnson',
    senderInitials: 'SJ',
    senderColor: '#4f39f6',
    text: `This should give everyone more time to refine their projects.`,
    timestamp: '12:45 PM',
    isCurrentUser: false,
  },
];

interface MessagingChatProps {
  height?: string;
  isDark?: boolean;
  accentColor?: string;
}

export function MessagingChat({
  height = '100vh',
  isDark: isDarkProp,
  accentColor: accentColorProp,
}: MessagingChatProps) {
  const accentColor = accentColorProp || '#3b82f6';
  const isDark = isDarkProp;
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const currentConversation = CONVERSATIONS.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: String(messages.length + 1),
      sender: 'You',
      senderInitials: 'You',
      senderColor: '#4f39f6',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div
      className={`flex flex-col md:flex-row w-full ${isDark ? 'bg-card-dark' : 'bg-white'} overflow-hidden rounded-none border-0`}
      style={{ height, minHeight: height }}
    >
      {/* Conversations List */}
      <div
        className={`w-80 flex flex-col border-r ${isDark ? 'border-white/10' : 'border-slate-200'} ${showChatOnMobile ? 'hidden lg:flex' : 'flex w-full lg:w-80'}`}
      >
        {/* Header */}
        <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Messages
            </h3>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation.id);
                setShowChatOnMobile(true);
              }}
              className={`w-full p-4 border-l-4 transition-colors text-left ${
                selectedConversation === conversation.id
                  ? 'bg-[var(--accent-color)]/10 border-l-[var(--accent-color)]'
                  : `border-l-transparent ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {conversation.name}
                    </p>
                    <span className="text-xs text-slate-500">{conversation.timestamp}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} truncate`}>
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div className="bg-[var(--accent-color)] text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {currentConversation && (
        <div className={`flex-1 flex flex-col ${showChatOnMobile ? 'flex' : 'hidden lg:flex'}`}>
          {/* Header */}
          <div
            className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatOnMobile(false)}
                className={`lg:hidden p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-colors`}
              >
                <ArrowLeft
                  size={20}
                  className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                />
              </button>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: currentConversation.color }}
              >
                {currentConversation.initials}
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {currentConversation.name}
                </p>
                {currentConversation.role && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {currentConversation.role}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
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
                  {message.image ? (
                    <img
                      src={message.image}
                      alt="shared"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  ) : (
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-xs ${
                        message.isCurrentUser
                          ? 'bg-[var(--accent-color)] text-white rounded-br-sm'
                          : `${isDark ? 'bg-card-dark text-white border-white/5' : 'bg-white text-slate-800 border-slate-100'} border rounded-tl-sm`
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'} p-4`}>
            <div className="flex gap-2 mb-2">
              <button
                className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-colors`}
              >
                <Plus size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>
              <button
                className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-colors`}
              >
                <Paperclip
                  size={20}
                  className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-slate-100'} border rounded-lg text-sm focus:outline-none focus:border-[var(--accent-color)]`}
              />
              <button
                className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-colors`}
              >
                <Smile size={20} className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-gradient-to-r from-[var(--accent-color)] to-blue-700 hover:from-[var(--accent-color)] hover:to-blue-800 text-white rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} text-center`}>
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
