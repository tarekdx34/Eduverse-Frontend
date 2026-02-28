import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsCardProps {
  label: string;
  value: string;
  maxValue?: string;
  comparison: string;
  isPositive: boolean;
}

// Color themes for each card type — matches Student dashboard style
const cardThemes: Record<string, { glow: string; gradient: string }> = {
  'Total Courses': {
    glow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    gradient: 'from-blue-500 to-cyan-500',
  },
  'Active Labs': {
    glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-500',
  },
  'Pending Submissions': {
    glow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    gradient: 'from-amber-500 to-orange-500',
  },
  'Avg Performance': {
    glow: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    gradient: 'from-purple-500 to-pink-500',
  },
};

export function StatsCard({ label, value, maxValue, comparison, isPositive }: StatsCardProps) {
  const { isDark } = useTheme();

  const theme = cardThemes[label] || cardThemes['Total Courses'];

  return (
    <div
      className={`p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default ${
        isDark ? 'bg-card-dark border border-white/5' : 'glass'
      }`}
    >
      {/* Decorative glow */}
      <div
        className={`absolute -right-16 -top-16 w-32 h-32 ${theme.glow} rounded-full blur-3xl transition-colors`}
      ></div>

      <p
        className={`text-sm font-medium mb-2 ${isDark ? 'uppercase tracking-wider text-slate-400' : 'text-slate-500'}`}
      >
        {label}
      </p>

      <div className="flex items-baseline gap-2 mb-0">
        <h2
          className={`text-5xl font-black mb-0 tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}
        >
          {value}
          {maxValue && (
            <span
              className={`text-2xl font-normal ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
            >
              /{maxValue}
            </span>
          )}
        </h2>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          <span className="material-symbols-rounded text-sm">
            {isPositive ? 'trending_up' : 'trending_down'}
          </span>
          {comparison}
        </span>
      </div>
    </div>
  );
}

export default StatsCard;
