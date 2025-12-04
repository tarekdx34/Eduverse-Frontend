import { Sparkles, Brain } from 'lucide-react';

interface QuizContentProps {
  quizDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

export function QuizContent({ quizDifficulty, onDifficultyChange }: QuizContentProps) {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <h4 className="text-purple-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI-Powered Quiz Generation
        </h4>
        <p className="text-sm text-purple-700">
          Our AI analyzes your study materials to create targeted questions
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-3">What would you like to be quizzed on?</label>
        <input
          type="text"
          placeholder="Enter topic (e.g., Data Structures, Algorithms, React Hooks)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-3">Select Difficulty Level</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { level: 'easy', emoji: '😊', desc: 'Beginner' },
            { level: 'medium', emoji: '🎯', desc: 'Intermediate' },
            { level: 'hard', emoji: '🔥', desc: 'Advanced' }
          ].map(({ level, emoji, desc }) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`px-4 py-4 rounded-xl border-2 transition-all ${
                quizDifficulty === level
                  ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm text-gray-900">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
              <div className="text-xs text-gray-600">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Questions</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all">
            <option>5 Questions</option>
            <option>10 Questions</option>
            <option>15 Questions</option>
            <option>20 Questions</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Question Type</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all">
            <option>Multiple Choice</option>
            <option>True/False</option>
            <option>Mixed</option>
          </select>
        </div>
      </div>

      <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Brain className="w-5 h-5" />
        Generate Quiz Now
      </button>
    </div>
  );
}
