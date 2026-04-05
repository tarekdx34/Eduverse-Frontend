import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Loader2,
  FileText,
  Calendar,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  actions?: { label: string; action: () => void }[];
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<string>;
  userRole?: 'student' | 'instructor';
  userName?: string;
  className?: string;
}

const instructorQuickActions: QuickAction[] = [
  { icon: FileText, label: 'Generate Quiz', prompt: 'Help me generate a quiz for my course' },
  { icon: Calendar, label: 'Plan Lecture', prompt: 'Help me plan my next lecture' },
  {
    icon: BarChart3,
    label: 'Analyze Performance',
    prompt: 'Analyze my class performance this week',
  },
  {
    icon: HelpCircle,
    label: 'Draft Announcement',
    prompt: 'Help me draft an announcement for my students',
  },
];

const studentQuickActions: QuickAction[] = [
  { icon: FileText, label: 'Explain Topic', prompt: 'Can you explain this concept to me?' },
  { icon: Calendar, label: 'Study Plan', prompt: 'Create a study plan for my exams' },
  { icon: BarChart3, label: 'Track Progress', prompt: 'How am I doing in my courses?' },
  { icon: HelpCircle, label: 'Get Help', prompt: 'I need help with my assignment' },
];

export function AIChatbot({
  isOpen,
  onClose,
  onSendMessage,
  userRole = 'instructor',
  userName = 'User',
  className = '',
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${userName}! 👋 I'm Evy, your AI teaching assistant. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = userRole === 'instructor' ? instructorQuickActions : studentQuickActions;

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate contextual responses based on keywords
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
      return `I'd be happy to help you create a quiz! Here's what I can do:

1. **Generate Questions** - I can create multiple-choice, true/false, or short-answer questions based on your course content.

2. **Set Difficulty** - Choose from easy, medium, or hard difficulty levels.

3. **Topic Focus** - Specify topics you want to cover.

Would you like me to start generating questions? Just tell me the topic and difficulty level, or upload your lecture notes for me to analyze.`;
    }

    if (lowerMessage.includes('lecture') || lowerMessage.includes('plan')) {
      return `Great! Let me help you plan your lecture. Here's a suggested structure:

📋 **Lecture Planning Template**

1. **Learning Objectives** (5 min)
   - What should students know by the end?

2. **Review** (10 min)
   - Quick recap of previous concepts

3. **Main Content** (30 min)
   - Core concepts with examples

4. **Interactive Activity** (10 min)
   - Group discussion or problem-solving

5. **Summary & Q&A** (5 min)

Would you like me to help fill in the details for a specific topic?`;
    }

    if (
      lowerMessage.includes('performance') ||
      lowerMessage.includes('analyze') ||
      lowerMessage.includes('analytics')
    ) {
      return `📊 **Class Performance Summary**

Based on recent data:

✅ **Strengths:**
- 85% assignment completion rate
- Strong participation in discussions
- Quiz average: 78%

⚠️ **Areas for Attention:**
- 15 students struggling with derivatives
- Lab attendance dropped 10% this week
- 3 students haven't submitted recent work

💡 **Recommendations:**
1. Consider a review session for derivatives
2. Send reminder about lab attendance
3. Reach out to inactive students

Would you like me to prepare detailed reports or draft messages to at-risk students?`;
    }

    if (lowerMessage.includes('announcement') || lowerMessage.includes('draft')) {
      return `Here's a draft announcement for you:

---
📢 **[Course Name] - Important Update**

Dear Students,

[Main message here]

**Key Points:**
• Point 1
• Point 2
• Point 3

If you have any questions, please don't hesitate to reach out during office hours or via email.

Best regards,
[Your Name]

---

Would you like me to customize this further? Tell me:
- What's the main message?
- When does this apply?
- Any specific instructions?`;
    }

    if (lowerMessage.includes('study') || lowerMessage.includes('plan')) {
      return `📚 **Personalized Study Plan**

Based on your upcoming deadlines and course load:

**This Week:**
• Monday: Review Database concepts (2 hrs)
• Tuesday: Practice SQL queries (1.5 hrs)
• Wednesday: Assignment work (2 hrs)
• Thursday: Algorithm problems (1.5 hrs)
• Friday: Light review + rest

**Priority Topics:**
1. SQL Joins (Quiz Friday)
2. Sorting Algorithms (Assignment due)
3. ER Diagrams (Project next week)

**Study Tips:**
- Use active recall techniques
- Take short breaks every 45 min
- Practice with real problems

Shall I adjust this plan or add more details?`;
    }

    // Default response
    return `I understand you're asking about "${userMessage}". 

As your AI assistant, I can help you with:

• **Content Creation** - Generate quizzes, summaries, and teaching materials
• **Analytics** - Analyze student performance and identify trends
• **Communication** - Draft announcements and messages
• **Planning** - Create schedules and lesson plans

Could you tell me more about what specific help you need?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = onSendMessage ? await onSendMessage(input) : await simulateAIResponse(input);

      // Remove typing indicator and add response
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.isTyping);
        return [
          ...withoutTyping,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => !m.isTyping);
        return [
          ...withoutTyping,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi ${userName}! 👋 I'm Evy, your AI teaching assistant. How can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${className}`}
      style={{ maxWidth: isMinimized ? '320px' : '420px' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Evy - AI Assistant</h3>
              <p className="text-xs text-white/80">{isLoading ? 'Thinking...' : 'Online'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear chat"
            >
              <RefreshCw size={18} className="text-white" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 size={18} className="text-white" />
              ) : (
                <Minimize2 size={18} className="text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              style={{ height: '350px' }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200'
                    } px-4 py-3 shadow-sm`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && !message.isTyping && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy"
                            >
                              {copiedId === message.id ? (
                                <Check size={14} className="text-green-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600 transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600 transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                    >
                      <action.icon size={12} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Powered by Evy AI • EduVerse</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIChatbot;
