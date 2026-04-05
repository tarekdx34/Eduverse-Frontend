import { Star, Zap } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export function FeedbackContent() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-5">
      <div
        className={`${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'} rounded-xl p-6 border`}
      >
        <h4
          className={`${isDark ? 'text-white' : 'text-emerald-900'} mb-2 flex items-center gap-2`}
        >
          <Star className="w-4 h-4" />
          Professional Writing Analysis
        </h4>
        <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
          Get instant feedback to improve your academic writing
        </p>
      </div>

      <div>
        <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
          Paste Your Text Below
        </label>
        <textarea
          rows={10}
          placeholder="Type or paste your essay, report, or assignment here...&#10;&#10;The AI will analyze:&#10;• Grammar and spelling&#10;• Writing style and clarity&#10;• Sentence structure&#10;• Vocabulary suggestions"
          className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-2 border-slate-100'} rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 resize-none transition-all`}
        />
        <div
          className={`flex items-center justify-between mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <span>0 words • 0 characters</span>
          <span>Minimum 50 words recommended</span>
        </div>
      </div>

      <div>
        <label className={`block text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
          Analysis Preferences
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Grammar & Spelling', checked: true },
            { label: 'Style & Tone', checked: true },
            { label: 'Clarity & Flow', checked: true },
            { label: 'Academic Level', checked: false },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 border-2 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} rounded-lg cursor-pointer transition-all`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                defaultChecked={item.checked}
              />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Zap className="w-5 h-5" />
        Analyze Writing
      </button>
    </div>
  );
}
