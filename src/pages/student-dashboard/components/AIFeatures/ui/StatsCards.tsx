import { TrendingUp, Zap, Star, Clock } from 'lucide-react';
import { AIFeature } from '../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatsCardsProps {
  totalFeatures: number;
  totalUsage: number;
  mostUsedFeature: AIFeature;
}

export function StatsCards({ totalFeatures, totalUsage, mostUsedFeature }: StatsCardsProps) {
  const { isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const cards = [
    {
      label: isRTL ? 'أدوات الذكاء الاصطناعي' : 'AI Tools Available',
      value: `0${totalFeatures}`,
      sub: <span className="text-green-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {isRTL ? 'جميعها متاحة' : 'All unlocked'}</span>,
      icon: 'apps',
      iconBg: 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]',
      hoverBorder: 'hover:border-[var(--accent-color)]/50',
    },
    {
      label: isRTL ? 'إجمالي التفاعلات' : 'Total Interactions',
      value: totalUsage.toString(),
      sub: <span className="text-slate-400 text-xs">{isRTL ? 'هذا الفصل' : 'This semester'}</span>,
      icon: 'bolt',
      iconBg: 'bg-blue-500/10 text-blue-500',
      hoverBorder: 'hover:border-blue-500/50',
    },
    {
      label: isRTL ? 'الأكثر استخداماً' : 'Most Popular',
      value: mostUsedFeature.title,
      isText: true,
      sub: <span className="text-emerald-500 text-xs font-bold">{mostUsedFeature.usageCount} {isRTL ? 'استخدام' : 'uses'}</span>,
      icon: 'star',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      hoverBorder: 'hover:border-emerald-500/50',
    },
    {
      label: isRTL ? 'الوقت الموفر' : 'Time Saved',
      value: isRTL ? '42 ساعة' : '42h',
      sub: <span className="text-amber-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {isRTL ? '+8 ساعات هذا الأسبوع' : '+8h this week'}</span>,
      icon: 'schedule',
      iconBg: 'bg-amber-500/10 text-amber-500',
      hoverBorder: 'hover:border-amber-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {cards.map((card, i) => (
        <div key={i} className={`p-6 glass rounded-[2.5rem] flex items-center justify-between group transition-all ${card.hoverBorder}`}>
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
            <h4 className={`mt-1 font-bold ${isDark ? 'text-white' : 'text-slate-800'} ${card.isText ? 'text-lg leading-tight' : 'text-3xl'}`}>{card.value}</h4>
            <div className="mt-2">{card.sub}</div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} transition-all`}>
            <span className="material-symbols-rounded">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
