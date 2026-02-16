import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsCardProps {
  label: string;
  value: string;
  maxValue: string;
  comparison: string;
  isPositive: boolean;
  icon?: string;
}

// Color themes for each card type
const cardThemes: Record<string, { glow: string; gradient: string }> = {
  'Credits Completed': { glow: 'bg-[#7C3AED]/10 group-hover:bg-[#7C3AED]/20', gradient: 'from-violet-500 to-[#7C3AED]' },
  'Grade Point Average': { glow: 'bg-pink-500/10 group-hover:bg-pink-500/20', gradient: 'from-pink-500 to-rose-500' },
  'Active Class': { glow: 'bg-blue-500/10 group-hover:bg-blue-500/20', gradient: 'from-blue-500 to-cyan-500' },
};

export default function StatsCard({ label, value, maxValue, comparison, isPositive }: StatsCardProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const theme = cardThemes[label] || cardThemes['Credits Completed'];
  const percentage = maxValue ? Math.round((parseFloat(value) / parseFloat(maxValue)) * 100) : 0;
  const isGpa = label === 'Grade Point Average';

  return (
    <div className={`p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default ${
      isDark
        ? 'bg-card-dark border border-white/5'
        : 'glass'
    }`}>
      {/* Decorative glow */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 ${theme.glow} rounded-full blur-3xl transition-colors`}></div>

      <p className={`text-sm font-medium mb-2 ${isDark ? 'uppercase tracking-wider text-slate-400' : 'text-slate-500'}`}>{label}</p>

      <div className="flex items-baseline gap-2 mb-0">
        <h2 className={`text-5xl font-black mb-0 tracking-tighter ${
          isDark && isGpa
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#ec4899]'
            : isDark ? 'text-white' : 'text-slate-800'
        }`}>
          {value}<span className={`text-2xl font-normal ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>/{maxValue}</span>
        </h2>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
          isPositive
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-red-500/10 text-red-500'
        }`}>
          <span className="material-symbols-rounded text-sm">{isPositive ? 'trending_up' : 'trending_down'}</span>
          {comparison}
        </span>
      </div>
    </div>
  );
}
