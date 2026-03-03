import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  MessageCircle,
  BarChart3,
  Lightbulb,
  Send,
  Paperclip,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  ArrowRight,
  Shield,
  Users,
  Server,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type Mode = 'general' | 'analytics' | 'recommendations';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const aiStats = [
  { label: 'Queries Answered', value: '1,248' },
  { label: 'Reports Generated', value: '56' },
  { label: 'Issues Detected', value: '12' },
  { label: 'Recommendations', value: '24' },
  { label: 'Satisfaction', value: '94%' },
];

const quickActions = [
  { text: 'Analyze enrollment trends', icon: TrendingUp },
  { text: 'Check system health', icon: Server },
  { text: 'Review user activity', icon: Users },
  { text: 'Generate monthly report', icon: BarChart3 },
];

const analyticsInsights = [
  {
    title: 'Enrollment Growth',
    text: 'Enrollment is up 15% compared to last semester. CS department leads growth.',
    icon: TrendingUp,
  },
  {
    title: 'System Performance',
    text: 'System performance stable. Peak usage: Mon-Wed 10AM-2PM.',
    icon: Server,
  },
  {
    title: 'Course Completion',
    text: '3 courses have below-average completion rates and may need attention.',
    icon: AlertTriangle,
  },
];

const recommendations = [
  {
    priority: 'High',
    color: 'red',
    text: 'Increase server capacity before midterm week (expected 40% traffic spike)',
    icon: Server,
  },
  {
    priority: 'Medium',
    color: 'yellow',
    text: 'Consider adding TA for CS303 - student-to-TA ratio exceeds threshold',
    icon: Users,
  },
  {
    priority: 'Low',
    color: 'blue',
    text: "Update password policy - current policy hasn't been reviewed in 6 months",
    icon: Shield,
  },
  {
    priority: 'Info',
    color: 'gray',
    text: 'New AI grading model available - 15% accuracy improvement',
    icon: Sparkles,
  },
];

function getMockResponse(mode: Mode): string {
  switch (mode) {
    case 'analytics':
      return 'Looking at the analytics data, I can identify the following trends...';
    case 'recommendations':
      return 'Based on current system metrics, I recommend the following actions...';
    default:
      return 'Based on my analysis of the system data, here are some key insights...';
  }
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AIInsightsPage() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'ai',
      text: "Hello Admin! I'm your AI assistant. I can help with system analytics, user management insights, and operational recommendations.",
      timestamp: getTimestamp(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: text.trim(),
      timestamp: getTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: getMockResponse(mode),
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const cardClass = `rounded-xl border shadow-sm p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  const priorityStyles: Record<string, { badge: string; border: string }> = {
    red: {
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      border: isDark ? 'border-red-500/30' : 'border-red-200',
    },
    yellow: {
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      border: isDark ? 'border-yellow-500/30' : 'border-yellow-200',
    },
    blue: {
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      border: isDark ? 'border-blue-500/30' : 'border-blue-200',
    },
    gray: {
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      border: isDark ? 'border-gray-600' : 'border-gray-200',
    },
  };

  const modes: { key: Mode; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: MessageCircle },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                    : 'bg-blue-50 text-blue-600 border-blue-500'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* AI Stats Bar */}
      <div className={`${cardClass} !p-4`}>
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Stats</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {aiStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}:</span>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`${cardClass} !p-0 flex flex-col`} style={{ minHeight: '480px' }}>
        {/* General Mode - Chat */}
        {mode === 'general' && (
          <div className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '400px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? isDark
                            ? ''
                            : 'bg-blue-500 text-white'
                          : isDark
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles size={14} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                          <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                            AI Assistant
                          </span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <span className={`text-xs mt-1 block ${msg.role === 'user' ? 'text-right' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-3 text-sm ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Cards */}
            {messages.length <= 1 && (
              <div className={`px-6 pb-4 grid grid-cols-2 gap-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`col-span-2 pt-4 pb-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Quick Actions
                </div>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.text}
                      onClick={() => sendMessage(action.text)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                      {action.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Suggestions after AI response */}
            {messages.length > 1 && !isTyping && messages[messages.length - 1].role === 'ai' && (
              <div className={`px-6 pb-4 flex gap-2 flex-wrap border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {['Tell me more', 'Show details', 'Generate report'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Mode */}
        {mode === 'analytics' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI-Generated Insights</h3>
            </div>
            {analyticsInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.title}
                  className={`rounded-lg border p-4 flex items-start gap-4 ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    <Icon size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{insight.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{insight.text}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMode('general');
                      sendMessage(insight.text);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDark
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    Explore <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Recommendations Mode */}
        {mode === 'recommendations' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Recommendations</h3>
            </div>
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              const styles = priorityStyles[rec.color];
              return (
                <div
                  key={rec.text}
                  className={`rounded-lg border p-4 ${styles.border} ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <Icon size={18} className={isDark ? 'text-gray-300' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{rec.text}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          <CheckCircle size={12} className="inline mr-1" />
                          Accept
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            setMode('general');
                            sendMessage(rec.text);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-gray-200'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className={`${cardClass} !p-3 flex items-center gap-3`}>
        <button
          type="button"
          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant..."
          className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`p-2 rounded-lg transition-colors ${
            input.trim()
              ? 'bg-blue-500 text-white hover:'
              : isDark
                ? 'bg-gray-700 text-gray-500'
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
