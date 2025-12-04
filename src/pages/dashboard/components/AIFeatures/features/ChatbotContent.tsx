import { MessageSquare, Sparkles, Send } from 'lucide-react';

export function ChatbotContent() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
        <h4 className="text-indigo-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Your Personal Study Assistant
        </h4>
        <p className="text-sm text-indigo-700">
          Ask anything about your courses, get study tips, or request explanations
        </p>
      </div>

      <div className="border-2 border-gray-200 rounded-xl p-6 h-96 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 max-w-sm">
              <p className="text-sm text-gray-900 mb-2">
                👋 Hello! I'm your AI Study Companion. I can help you with:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li>• Explaining complex concepts</li>
                <li>• Solving practice problems</li>
                <li>• Study strategies & tips</li>
                <li>• Exam preparation</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-md max-w-sm">
              <p className="text-sm">
                Can you explain the difference between stacks and queues?
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-sm">You</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 max-w-sm">
              <p className="text-sm text-gray-900">
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
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question here..."
            className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
          />
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
