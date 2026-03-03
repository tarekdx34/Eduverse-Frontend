import { MessageSquare, Sparkles, Send } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export function ChatbotContent() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  return (
    <div className="space-y-4">
      <div className={`${isDark ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20' : 'bg-gradient-to-br from-[var(--accent-color)]/10 to-blue-100 border-[var(--accent-color)]/20'} rounded-xl p-6 border`}>
        <h4 className={`${isDark ? 'text-white' : 'text-[#4C1D95]'} mb-2 flex items-center gap-2`}>
          <MessageSquare className="w-4 h-4" />
          Your Personal Study Assistant
        </h4>
        <p className={`text-sm ${isDark ? 'text-[var(--accent-color)]' : 'text-[var(--accent-color)]'}`}>
          Ask anything about your courses, get study tips, or request explanations
        </p>
      </div>

      <div className={`${isDark ? 'bg-card-dark border-white/5' : 'border-2 border-slate-100 bg-gradient-to-b from-white to-background-light'} rounded-xl p-6 h-96 overflow-y-auto`}>
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-white border border-slate-100'} rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-sm`}>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
                👋 Hello! I'm your AI Study Companion. I can help you with:
              </p>
              <ul className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} space-y-1 ml-4`}>
                <li>• Explaining complex concepts</li>
                <li>• Solving practice problems</li>
                <li>• Study strategies & tips</li>
                <li>• Exam preparation</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <div className="bg-[var(--accent-color)] text-white rounded-2xl rounded-tr-sm p-4 shadow-md max-w-sm">
              <p className="text-sm">
                Can you explain the difference between stacks and queues?
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-300 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-sm">You</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-white border border-slate-100'} rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-sm`}>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Great question! Both are linear data structures, but they differ in how elements are added and removed...
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['Explain concept', 'Practice problem', 'Study tips', 'Exam prep'].map((suggestion, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10' : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10'} rounded-full text-sm transition-all`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question here..."
            className={`flex-1 px-5 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-xl focus:outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all`}
          />
          <button className="px-6 py-3 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
