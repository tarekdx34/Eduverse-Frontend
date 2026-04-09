import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MapPin,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  addDays,
  buildUnifiedScheduleItems,
  detectScheduleConflicts,
  formatTime24To12,
  getUpcomingScheduleItems,
  startOfWeek,
  toISODate,
  useStudentScheduleData,
} from '../../../hooks/useSchedule';
import { exportScheduleToICS } from '../../../utils/scheduleExport';

const weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekDaysAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

const timeSlots = [
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

type ScheduleType = 'daily' | 'weekly' | 'monthly';
type ClassKindFilter = 'all' | 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';

const dayMapArToEn: Record<string, string> = {
  الاثنين: 'Monday',
  الثلاثاء: 'Tuesday',
  الأربعاء: 'Wednesday',
  الخميس: 'Thursday',
  الجمعة: 'Friday',
  السبت: 'Saturday',
  الأحد: 'Sunday',
};

const normalizeDay = (value: string) => {
  const normalized = value.trim().toUpperCase();
  const map: Record<string, string> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
  };
  return map[normalized] || value;
};

export default function ClassSchedule() {
  const { t, isRTL, language } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const navigate = useNavigate();
  const accentColor = primaryHex || '#3b82f6';

  const [scheduleType, setScheduleType] = useState<ScheduleType>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showWeekends, setShowWeekends] = useState(false);
  const [courseFilter, setCourseFilter] = useState<'all' | string>('all');
  const [kindFilter, setKindFilter] = useState<ClassKindFilter>('all');

  const viewMode = scheduleType === 'daily' ? 'daily' : scheduleType === 'weekly' ? 'weekly' : 'monthly';
  const { days, isLoading, error } = useStudentScheduleData(viewMode, currentDate);
  const scheduleItems = useMemo(() => buildUnifiedScheduleItems(days, t('room') || 'TBD'), [days, t]);
  const conflicts = useMemo(() => detectScheduleConflicts(scheduleItems), [scheduleItems]);
  const weekDays = language === 'ar' ? weekDaysAr : weekDaysEn;
  const visibleWeekDays = showWeekends ? weekDays : weekDays.slice(0, 5);

  const classItems = useMemo(
    () =>
      scheduleItems
        .filter((item) => item.kind === 'class')
        .map((item, index) => ({
          id: index + 1,
          code: item.courseCode || 'N/A',
          name: item.title,
          day: normalizeDay(item.classItem?.dayOfWeek || ''),
          startTime: item.startTime,
          endTime: item.endTime,
          instructor: item.classItem?.section?.sectionNumber
            ? `${t('classSchedule')} ${item.classItem.section.sectionNumber}`
            : 'TBD',
          room: item.location || 'TBD',
          kind: (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType || 'LECTURE') as ClassKindFilter,
          color:
            (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'LAB'
              ? 'bg-emerald-500'
              : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'TUTORIAL'
                ? 'bg-purple-500'
                : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'EXAM'
                  ? 'bg-red-500'
                  : 'bg-blue-500',
          bgLight:
            (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'LAB'
              ? 'bg-emerald-50'
              : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'TUTORIAL'
                ? 'bg-purple-50'
                : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'EXAM'
                  ? 'bg-red-50'
                  : 'bg-blue-50',
          borderColor:
            (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'LAB'
              ? 'border-emerald-500'
              : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'TUTORIAL'
                ? 'border-purple-500'
                : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'EXAM'
                  ? 'border-red-500'
                  : 'border-blue-500',
          textColor:
            (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'LAB'
              ? 'text-emerald-700'
              : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'TUTORIAL'
                ? 'text-purple-700'
                : (item.subtitle?.toUpperCase?.() || item.classItem?.scheduleType) === 'EXAM'
                  ? 'text-red-700'
                  : 'text-blue-700',
        })),
    [scheduleItems, t]
  );

  const filteredClassItems = useMemo(
    () =>
      classItems.filter((item) => {
        if (!showWeekends && (item.day === 'Saturday' || item.day === 'Sunday')) return false;
        if (courseFilter !== 'all' && item.code !== courseFilter) return false;
        if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
        return true;
      }),
    [classItems, showWeekends, courseFilter, kindFilter]
  );

  const upcoming = useMemo(
    () =>
      getUpcomingScheduleItems(scheduleItems, 6).map((item, index) => ({
        id: index + 1,
        code: item.courseCode || item.kind.toUpperCase(),
        name: item.title,
        time: `${formatTime24To12(item.startTime)} - ${formatTime24To12(item.endTime)}`,
        date: item.date,
        room: item.location || 'TBD',
        subtitle: item.subtitle || '',
      })),
    [scheduleItems]
  );

  const courseOptions = useMemo(
    () => Array.from(new Set(classItems.map((item) => item.code))).sort((a, b) => a.localeCompare(b)),
    [classItems]
  );

  const weekLabel = useMemo(() => {
    const ws = startOfWeek(currentDate);
    const we = addDays(ws, 6);
    return `${toISODate(ws)} - ${toISODate(we)}`;
  }, [currentDate]);

  const getClassesForDay = (day: string) => {
    const normalizedDay = dayMapArToEn[day] || day;
    return filteredClassItems.filter((item) => item.day === normalizedDay);
  };

  const handlePrevious = () => {
    if (scheduleType === 'daily') {
      setCurrentDate((prev) => addDays(prev, -1));
      setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : weekDays.length - 1));
      return;
    }
    if (scheduleType === 'weekly') {
      setCurrentDate((prev) => addDays(prev, -7));
      return;
    }
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (scheduleType === 'daily') {
      setCurrentDate((prev) => addDays(prev, 1));
      setCurrentDayIndex((prev) => (prev < weekDays.length - 1 ? prev + 1 : 0));
      return;
    }
    if (scheduleType === 'weekly') {
      setCurrentDate((prev) => addDays(prev, 7));
      return;
    }
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {error && (
        <div
          className={`rounded-xl border p-4 ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}
        >
          {String(error)}
        </div>
      )}

      {conflicts.length > 0 && (
        <div
          className={`rounded-xl border p-4 flex items-start gap-3 ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-800'}`}
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">{t('scheduleConflictsDetected')}</p>
            <p className="text-sm mb-0">
              {`${conflicts.length} ${t('overlappingSlotsFound')}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div
            className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
            style={{ ['--accent-color' as string]: accentColor }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {scheduleType === 'daily'
                      ? isRTL
                        ? 'الجدول اليومي'
                        : 'Daily Schedule'
                    : scheduleType === 'weekly'
                      ? t('weeklySchedule')
                      : isRTL
                        ? 'الجدول الشهري'
                        : 'Monthly Schedule'}
                </h2>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {scheduleType === 'daily' ? weekDays[currentDayIndex] : weekLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    exportScheduleToICS(scheduleItems, `student-schedule-${toISODate(new Date())}.ics`)
                  }
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Download className="w-4 h-4" />
                  {t('exportICal')}
                </button>
                <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setScheduleType(type)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                        scheduleType === type
                          ? 'bg-[var(--accent-color)] text-white shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePrevious}
                  className={`p-2 border rounded-lg transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />
                </button>
                <button
                  onClick={handleNext}
                  className={`p-2 border rounded-lg transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className={`text-xs rounded-lg px-3 py-2 border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <option value="all">{t('allCourses')}</option>
                {courseOptions.map((courseCode) => (
                  <option key={courseCode} value={courseCode}>
                    {courseCode}
                  </option>
                ))}
              </select>

              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as ClassKindFilter)}
                className={`text-xs rounded-lg px-3 py-2 border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <option value="all">{t('allTypes')}</option>
                <option value="LECTURE">{t('lecture')}</option>
                <option value="LAB">{t('lab')}</option>
                <option value="TUTORIAL">{t('tutorial')}</option>
                <option value="EXAM">{t('exam')}</option>
              </select>

              <label
                className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border cursor-pointer ${isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-700'}`}
              >
                <input
                  type="checkbox"
                  checked={showWeekends}
                  onChange={(e) => setShowWeekends(e.target.checked)}
                />
                <span>{t('showWeekends')}</span>
              </label>
            </div>
          </div>

          <div
            className={`rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
          >
            <div className="overflow-x-auto">
              {scheduleType === 'weekly' && (
                <>
                  <div
                    className="grid border-b min-w-[760px]"
                    style={{ gridTemplateColumns: `90px repeat(${visibleWeekDays.length}, minmax(120px, 1fr))` }}
                  >
                    <div
                      className={`p-4 border-r ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-gradient-to-b from-background-light to-white'}`}
                    >
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {t('time')}
                      </span>
                    </div>
                    {visibleWeekDays.map((day) => (
                      <div
                        key={day}
                        className={`p-4 border-r last:border-r-0 text-center ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-gradient-to-b from-background-light to-white'}`}
                      >
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {language === 'ar' ? day : day.substring(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-y-auto max-h-[620px]">
                    {timeSlots.map((timeLabel) => (
                      <div
                        key={timeLabel}
                        className="grid border-b min-w-[760px]"
                        style={{ gridTemplateColumns: `90px repeat(${visibleWeekDays.length}, minmax(120px, 1fr))` }}
                      >
                        <div
                          className={`p-3 border-r ${isDark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-100 bg-background-light/50'}`}
                        >
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {timeLabel}
                          </span>
                        </div>

                        {visibleWeekDays.map((day) => {
                          const dayClasses = getClassesForDay(day).filter(
                            (item) => formatTime24To12(item.startTime) === timeLabel
                          );
                          return (
                            <div
                              key={`${day}-${timeLabel}`}
                              className={`p-2 border-r last:border-r-0 min-h-[86px] ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                            >
                              {dayClasses.map((classItem) => (
                                <button
                                  key={`${classItem.id}-${classItem.code}`}
                                  onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                                  className={`${isDark ? 'bg-white/5' : classItem.bgLight} border-l-4 ${classItem.borderColor} rounded-lg p-2.5 mb-1 hover:shadow-md transition-all cursor-pointer group w-full text-left`}
                                >
                                  <p className={`text-xs font-bold ${classItem.textColor} mb-1`}>
                                    {classItem.code}
                                  </p>
                                  <p
                                    className={`text-xs font-semibold mb-0.5 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}
                                  >
                                    {classItem.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                                    {classItem.room}
                                  </p>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {scheduleType === 'daily' && (
                <div className="min-h-[560px] p-6">
                  <div className="space-y-4">
                    {timeSlots.map((timeLabel) => {
                      const dayClasses = getClassesForDay(weekDays[currentDayIndex]).filter(
                        (item) => formatTime24To12(item.startTime) === timeLabel
                      );
                      if (dayClasses.length === 0) return null;

                      return (
                        <div key={timeLabel} className="flex gap-4">
                          <div className="w-24 flex-shrink-0">
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {timeLabel}
                            </span>
                          </div>
                          <div className="flex-1 space-y-3">
                            {dayClasses.map((classItem) => (
                              <button
                                key={`${classItem.id}-${classItem.code}`}
                                onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                                className={`${isDark ? 'bg-white/5 border-white/10' : classItem.bgLight} border-l-4 ${classItem.borderColor} rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group w-full text-left`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className={`text-sm font-bold ${classItem.textColor} mb-1`}>{classItem.code}</p>
                                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                      {classItem.name}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
                                  >
                                    {formatTime24To12(classItem.startTime)} - {formatTime24To12(classItem.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    <MapPin className="w-4 h-4" />
                                    <span>{classItem.room}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    <User className="w-4 h-4" />
                                    <span>{classItem.instructor}</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {getClassesForDay(weekDays[currentDayIndex]).length === 0 && (
                      <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">
                          {isRTL ? 'لا توجد محاضرات اليوم' : 'No classes scheduled today'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scheduleType === 'monthly' && (
                <div className="p-6">
                  <div className={`grid grid-cols-7 gap-2 mb-4 border-b pb-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    {(showWeekends ? weekDays : weekDays.slice(0, 5)).map((day) => (
                      <div key={day} className="text-center">
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {language === 'ar' ? day : day.substring(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, index) => {
                      const dayNumber = index + 1;
                      const dayIndex = index % 7;
                      const dayName = weekDays[dayIndex];
                      const dayClasses = showWeekends
                        ? getClassesForDay(dayName)
                        : ['Saturday', 'Sunday', 'السبت', 'الأحد'].includes(dayName)
                          ? []
                          : getClassesForDay(dayName);

                      return (
                        <div
                          key={`${dayNumber}-${dayName}`}
                          className={`min-h-[100px] p-3 rounded-lg border ${isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/5' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'} transition-colors`}
                        >
                          <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {dayNumber <= 31 ? dayNumber : ''}
                          </div>
                          <div className="space-y-1">
                            {dayClasses.slice(0, 2).map((classItem) => (
                              <button
                                key={`${classItem.id}-${classItem.code}`}
                                onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                                className={`text-[10px] px-1.5 py-1 rounded cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10' : classItem.bgLight} border-l-2 ${classItem.borderColor} w-full text-left`}
                              >
                                <p className={`font-bold ${classItem.textColor} truncate`}>{classItem.code}</p>
                              </button>
                            ))}
                            {dayClasses.length > 2 && (
                              <div className={`text-[10px] px-1.5 py-0.5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                                +{dayClasses.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('upcomingClasses') || 'Upcoming Classes'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('nextScheduledClasses') || 'Your next scheduled classes'}
              </p>
            </div>

            <div className="space-y-5">
              {(upcoming.length ? upcoming : []).map((item) => (
                <div
                  key={item.id}
                  className={`border-b pb-5 last:border-b-0 last:pb-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-1.5 h-20 bg-blue-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold mb-1 text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {item.code}
                      </p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <Clock className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{item.time}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{item.date}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{item.room}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <User className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{item.subtitle || t('classSchedule')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!upcoming.length && (
                <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {t('noClasses') || 'No classes scheduled'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
