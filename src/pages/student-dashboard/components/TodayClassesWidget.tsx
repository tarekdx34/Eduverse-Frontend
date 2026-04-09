import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  buildUnifiedScheduleItems,
  formatTime24To12,
  getUpcomingScheduleItems,
  toISODate,
  useStudentDailySchedule,
} from '../../../hooks/useSchedule';

export default function TodayClassesWidget() {
  const { isDark, primaryHex } = useTheme() as any;
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const today = toISODate(new Date());
  const { data, isLoading, error } = useStudentDailySchedule(today);

  const todayItems = useMemo(() => {
    const days = data ? [data] : [];
    return buildUnifiedScheduleItems(days, t('room') || 'TBD').filter((item) => item.kind === 'class');
  }, [data, t]);

  const upcomingToday = useMemo(() => getUpcomingScheduleItems(todayItems, 4), [todayItems]);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const currentClassId = useMemo(() => {
    const found = upcomingToday.find((item) => {
      const [startH, startM] = item.startTime.split(':').map(Number);
      const [endH, endM] = item.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return nowMinutes >= start && nowMinutes <= end;
    });
    return found?.id;
  }, [upcomingToday, nowMinutes]);

  return (
    <section
      className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
      }`}
      aria-label={isRTL ? 'محاضرات اليوم' : "Today's Classes"}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isRTL ? 'محاضرات اليوم' : "Today's Classes"}
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{today}</p>
        </div>
        <button
          onClick={() => navigate('/studentdashboard/schedule')}
          className="text-xs font-semibold inline-flex items-center gap-1 hover:opacity-90"
          style={{ color: primaryHex || '#3b82f6' }}
        >
          {t('viewAll')}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading && (
        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {isRTL ? 'جاري تحميل الجدول...' : 'Loading schedule...'}
        </div>
      )}

      {error && (
        <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{String(error)}</div>
      )}

      {!isLoading && !error && upcomingToday.length === 0 && (
        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t('noClassesToday') || 'No classes scheduled for today'}
        </div>
      )}

      <div className="space-y-3">
        {upcomingToday.map((item, idx) => {
          const isNow = item.id === currentClassId;
          const isNext = !isNow && idx === 0;
          return (
            <article
              key={item.id}
              className={`p-3 rounded-xl border ${
                isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </h4>
                {isNow && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                    {t('nowLabel')}
                  </span>
                )}
                {isNext && !isNow && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                    {t('nextUp')}
                  </span>
                )}
              </div>
              <div className={`text-xs space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {formatTime24To12(item.startTime)} - {formatTime24To12(item.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{item.location || (t('room') || 'Room')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.subtitle || t('classSchedule')}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
