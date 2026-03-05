import { Sparkles, Brain } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CleanSelect } from '../../../../../components/shared';


interface QuizContentProps {
  quizDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

export function QuizContent({ quizDifficulty, onDifficultyChange }: QuizContentProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  return (
    <div className="space-y-5">
      <div
        className={`${isDark ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'} rounded-xl p-6 border`}
      >
        <h4 className={`${isDark ? 'text-white' : 'text-blue-900'} mb-2 flex items-center gap-2`}>
          <Sparkles className="w-4 h-4" />
          AI-Powered Quiz Generation
        </h4>
        <p className={`text-sm ${isDark ? 'text-[var(--accent-color)]' : 'text-blue-700'}`}>
          Our AI analyzes your study materials to create targeted questions
        </p>
      </div>

      <div>
        <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
          What would you like to be quizzed on?
        </label>
        <input
          type="text"
          placeholder="Enter topic (e.g., Data Structures, Algorithms, React Hooks)"
          className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
        />
      </div>

      <div>
        <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
          Select Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { level: 'easy', emoji: '😊', desc: 'Beginner' },
            { level: 'medium', emoji: '🎯', desc: 'Intermediate' },
            { level: 'hard', emoji: '🔥', desc: 'Advanced' },
          ].map(({ level, emoji, desc }) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`px-4 py-4 rounded-xl border-2 transition-all ${
                quizDifficulty === level
                  ? isDark
                    ? 'border-blue-500 bg-blue-500/10 shadow-md scale-105'
                    : 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : isDark
                    ? 'border-white/10 hover:border-blue-300 hover:bg-blue-500/10'
                    : 'border-slate-100 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
            Questions
          </label>
          <CleanSelect
            className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-blue-500 transition-all`}
          >
            <option>5 Questions</option>
            <option>10 Questions</option>
            <option>15 Questions</option>
            <option>20 Questions</option>
          </CleanSelect>
        </div>
        <div>
          <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
            Question Type
          </label>
          <CleanSelect
            className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-blue-500 transition-all`}
          >
            <option>Multiple Choice</option>
            <option>True/False</option>
            <option>Mixed</option>
          </CleanSelect>
        </div>
      </div>

      <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Brain className="w-5 h-5" />
        Generate Quiz Now
      </button>
    </div>
  );
}
