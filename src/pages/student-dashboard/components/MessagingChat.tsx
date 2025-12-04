import { useState } from 'react';
import { Send, Plus, Paperclip, Smile, Phone, Video } from 'lucide-react';

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

export function MessagingChat() {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(MESSAGES);

  const currentConversation = CONVERSATIONS.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: String(messages.length + 1),
      sender: 'You',
      senderInitials: 'You',
      senderColor: '#4f39f6',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6 col-span-2 flex gap-6" style={{ height: '600px' }}>
      {/* Conversations List */}
      <div className="w-96 bg-gray-50 border border-gray-200 rounded-lg flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <Plus size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-purple-600"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full p-4 border-l-4 transition-colors text-left ${
                selectedConversation === conversation.id
                  ? 'bg-indigo-50 border-l-indigo-600'
                  : 'border-l-transparent hover:bg-gray-100'
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
                    <p className="font-medium text-gray-900">{conversation.name}</p>
                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div className="bg-indigo-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
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
        <div className="flex-1 flex flex-col bg-gray-50 rounded-lg border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 bg-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: currentConversation.color }}
              >
                {currentConversation.initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentConversation.name}</p>
                {currentConversation.role && <p className="text-xs text-gray-600">{currentConversation.role}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div key={message.id} className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isCurrentUser && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md"
                    style={{ backgroundColor: message.senderColor }}
                  >
                    {message.senderInitials}
                  </div>
                )}

                <div className={message.isCurrentUser ? 'flex flex-col items-end gap-1' : 'flex flex-col items-start gap-1'}>
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
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2 mb-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip size={20} className="text-gray-600" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      )}
    </div>
  );
}
