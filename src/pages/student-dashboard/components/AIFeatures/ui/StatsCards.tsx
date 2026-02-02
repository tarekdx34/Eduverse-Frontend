import { Sparkles, TrendingUp, Zap, Star, Clock } from 'lucide-react';
import { AIFeature } from '../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface StatsCardsProps {
  totalFeatures: number;
  totalUsage: number;
  mostUsedFeature: AIFeature;
}

export function StatsCards({ totalFeatures, totalUsage, mostUsedFeature }: StatsCardsProps) {
  const { isRTL } = useLanguage();
  
  return (
    <div className="grid grid-cols-4 gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">{isRTL ? 'أدوات الذكاء الاصطناعي' : 'AI Tools Available'}</p>
            <p className="text-gray-900 text-3xl">{totalFeatures}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>{isRTL ? 'جميعها متاحة' : 'All unlocked'}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">{isRTL ? 'إجمالي التفاعلات' : 'Total Interactions'}</p>
            <p className="text-gray-900 text-3xl">{totalUsage}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-purple-600">
          <span>{isRTL ? 'هذا الفصل' : 'This semester'}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">{isRTL ? 'الأكثر استخداماً' : 'Most Popular'}</p>
            <p className="text-gray-900 text-lg leading-tight">{mostUsedFeature.title}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-emerald-600">
          <span>{mostUsedFeature.usageCount} {isRTL ? 'استخدام' : 'uses'}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">{isRTL ? 'الوقت الموفر' : 'Time Saved'}</p>
            <p className="text-gray-900 text-3xl">{isRTL ? '42 ساعة' : '42h'}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-amber-600">
          <TrendingUp className="w-4 h-4" />
          <span>{isRTL ? '+8 ساعات هذا الأسبوع' : '+8h this week'}</span>
        </div>
      </div>
    </div>
  );
}
