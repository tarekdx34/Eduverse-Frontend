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

export default function StatsCard({ label, value, maxValue, comparison, isPositive }: StatsCardProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`rounded-lg p-6 hover:shadow-md transition-shadow border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
            <span className={`text-2xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/{maxValue}</span>
          </div>
        </div>
        <div className={`w-5 h-5 cursor-pointer text-center ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>⋯</div>
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('comparedToLastSemester')}</p>
        <div className={`px-3 py-2 rounded text-sm font-medium ${
          isPositive 
            ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-700' 
            : isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-700'
        }`}>{comparison}</div>
      </div>
    </div>
  );
}
