import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Paperclip,
  Sparkles,
  FileText,
  BookOpen,
  BarChart3,
  Brain,
  Clipboard,
  Lightbulb,
  Beaker,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Mode = 'general' | 'grading' | 'teaching' | 'analysis';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
};

const modes: { key: Mode; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General Help', icon: MessageCircle },
  { key: 'grading', label: 'Grading Mode', icon: Clipboard },
  { key: 'teaching', label: 'Teaching Mode', icon: BookOpen },
  { key: 'analysis', label: 'Analysis Mode', icon: BarChart3 },
];

const quickActions = [
  { label: 'Grade Assistance', text: 'Help me grade this student submission', icon: Clipboard },
  {
    label: 'Generate Feedback',
    text: 'Generate constructive feedback for student work',
    icon: FileText,
  },
  { label: 'Create Rubric', text: 'Create a grading rubric for this assignment', icon: Sparkles },
  { label: 'Explain Concept', text: 'Explain this concept in simple terms', icon: Lightbulb },
  { label: 'Generate Quiz', text: 'Generate quiz questions for this topic', icon: Brain },
  { label: 'Lab Preparation', text: 'Help me prepare for the upcoming lab session', icon: Beaker },
];

const mockResponses: Record<Mode, { text: string; suggestions: string[] }> = {
  general: {
    text: "I'd be happy to help! Here are some suggestions based on your query:\n\n• Break the task into smaller, manageable steps\n• Review the course materials for reference\n• Consider using practical examples to reinforce understanding\n\nLet me know if you'd like me to elaborate on any of these points.",
    suggestions: ['Tell me more', 'Show an example', 'What else can you help with?'],
  },
  grading: {
    text: 'Based on the rubric criteria, I recommend the following approach:\n\n• **Correctness (40%):** Check if the solution produces the expected output for all test cases\n• **Code Quality (30%):** Evaluate readability, naming conventions, and structure\n• **Documentation (15%):** Verify comments and documentation completeness\n• **Efficiency (15%):** Assess algorithm complexity and optimization\n\nWould you like me to generate detailed feedback for a specific submission?',
    suggestions: ['Generate feedback template', 'Show grading rubric', 'Compare submissions'],
  },
  teaching: {
    text: "Here's an effective approach to explain this concept:\n\n1. **Start with a real-world analogy** that students can relate to\n2. **Build up gradually** from simple to complex examples\n3. **Use visual diagrams** to illustrate relationships\n4. **Provide hands-on exercises** for immediate practice\n\nThis scaffolded approach helps students build mental models progressively.",
    suggestions: ['Create a lesson plan', 'Suggest visual aids', 'Generate practice problems'],
  },
  analysis: {
    text: 'Looking at the data, I can see the following trends:\n\n📊 **Performance Summary:**\n• Average class score: 78.5% (↑ 3.2% from last week)\n• Submission rate: 92% (stable)\n• Topics with lowest scores: Recursion (65%), Dynamic Programming (68%)\n\n⚠️ **Areas of Concern:**\n• 8 students scored below 60% on the latest assignment\n• Lab attendance dropped 5% this week\n\nShall I drill deeper into any of these metrics?',
    suggestions: [
      'Show student breakdown',
      'Identify at-risk students',
      'Compare with previous semester',
    ],
  },
};

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Hello! I'm your TA AI Assistant. I can help you with:\n\n• **Grading assistance** — Review and grade student submissions\n• **Performance analysis** — Track student progress and identify trends\n• **Lab preparation** — Plan and organize lab sessions\n• **Teaching tips** — Get pedagogical advice and strategies\n\nHow can I assist you today?",
  timestamp: formatTime(),
};

export function AIAssistantPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<Mode>('general');
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[activeMode];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.text,
        timestamp: formatTime(),
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const cardClass = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className={`${cardClass} border rounded-lg p-4 mb-3`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}
              >
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                TA AI Assistant
              </h2>
              <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                Online — Ready to help
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {modes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveMode(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeMode === key
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                      : 'bg-blue-50 text-blue-600 border-blue-500'
                    : isDark
                      ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${cardClass} border rounded-lg flex-1 flex flex-col overflow-hidden`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? isDark
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-blue-500 text-white rounded-br-md'
                      : isDark
                        ? 'bg-white/10 text-white rounded-bl-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {/* Timestamp & actions */}
                <div
                  className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg.text)}
                        className={`p-1 rounded hover:bg-white/10 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => sendMessage(msg.text)}
                        className={`p-1 rounded hover:bg-white/10 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Regenerate"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggestion buttons */}
                {msg.suggestions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isDark
                            ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                            : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quick Actions (shown after welcome only) */}
          {messages.length === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {quickActions.map(({ label, text, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(text)}
                  className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}
                  />
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    <p
                      className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className={`px-4 py-3 rounded-2xl rounded-bl-md ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 p-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
        >
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 rounded-full text-sm outline-none transition-colors ${
              isDark
                ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-all ${
              input.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : isDark
                  ? 'bg-white/5 text-gray-600'
                  : 'bg-gray-100 text-gray-300'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
