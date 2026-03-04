import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { enrollmentService } from '../../../services/api/enrollmentService';
import { LoadingSkeleton } from '../../../components/shared';

const weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekDaysAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
  '04:00 PM', '05:00 PM', '06:00 PM'
];

const colorPalette = [
  { color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-500' },
  { color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', borderColor: 'border-green-500' },
  { color: 'bg-pink-500', textColor: 'text-pink-700', bgLight: 'bg-pink-50', borderColor: 'border-pink-500' },
  { color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', borderColor: 'border-orange-500' },
  { color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', borderColor: 'border-purple-500' },
  { color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50', borderColor: 'border-teal-500' },
];

function formatTime24to12(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export default function ClassSchedule() {
  const { t, isRTL, language } = useLanguage();
  const { isDark } = useTheme() as any;
  const navigate = useNavigate();
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const weekDays = language === 'ar' ? weekDaysAr : weekDaysEn;

  const { data: enrollments, loading } = useApi(
    () => enrollmentService.getMyEnrolledCourses(),
    []
  );

  // Derive schedule classes from enrolled courses
  const classes = useMemo(() => {
    if (!enrollments?.length) return [];
    const result: Array<{
      id: string;
      name: string;
      code: string;
      instructor: string;
      room: string;
      day: string;
      startTime: string;
      endTime: string;
      color: string;
      textColor: string;
      bgLight: string;
      borderColor: string;
    }> = [];

    enrollments.forEach((enrollment: any, enrollIndex: number) => {
      const course = enrollment.course;
      const schedules = enrollment.section?.schedules || [];
      const colors = colorPalette[enrollIndex % colorPalette.length];
      const instructorName = enrollment.instructor
        ? `${enrollment.instructor.firstName} ${enrollment.instructor.lastName}`
        : enrollment.section?.instructor
          ? `${enrollment.section.instructor.firstName} ${enrollment.section.instructor.lastName}`
          : 'TBD';

      schedules.forEach((sched: any) => {
        const room = [sched.building, sched.room].filter(Boolean).join(' ') || 'TBD';
        result.push({
          id: `${enrollment.id}-${sched.id}`,
          name: course?.name || 'Unknown Course',
          code: course?.code || 'N/A',
          instructor: instructorName,
          room,
          day: sched.dayOfWeek,
          startTime: formatTime24to12(sched.startTime),
          endTime: formatTime24to12(sched.endTime),
          ...colors,
        });
      });
    });

    return result;
  }, [enrollments]);

  // Derive upcoming classes (next 5 sorted by day order then time)
  const upcomingClasses = useMemo(() => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return [...classes]
      .sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        time: `${c.startTime} - ${c.endTime}`,
        date: c.day,
        room: c.room,
        instructor: c.instructor,
        color: c.color,
      }));
  }, [classes]);

  const getClassesForDay = (day: string) => {
    const dayMap: Record<string, string> = {
      'الاثنين': 'Monday',
      'الثلاثاء': 'Tuesday',
      'الأربعاء': 'Wednesday',
      'الخميس': 'Thursday',
      'الجمعة': 'Friday',
      'السبت': 'Saturday',
      'الأحد': 'Sunday',
    };
    const lookupDay = dayMap[day] || day;
    return classes.filter(c => c.day === lookupDay);
  };

  const handlePrevious = () => {
    if (scheduleType === 'daily') {
      setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : weekDays.length - 1));
    }
  };

  const handleNext = () => {
    if (scheduleType === 'daily') {
      setCurrentDayIndex((prev) => (prev < weekDays.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {loading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className={`rounded-[2.5rem] p-6 mb-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {scheduleType === 'daily' && (isRTL ? 'الجدول اليومي' : 'Daily Schedule')}
                  {scheduleType === 'weekly' && t('weeklySchedule')}
                  {scheduleType === 'monthly' && (isRTL ? 'الجدول الشهري' : 'Monthly Schedule')}
                </h2>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {scheduleType === 'daily' ? weekDays[currentDayIndex] : (isRTL ? 'جدولك الأسبوعي' : 'Your weekly schedule')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map(type => (
                    <button key={type} onClick={() => setScheduleType(type)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                        scheduleType === type
                          ? 'bg-[var(--accent-color)] text-white shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
                      }`}>{type}</button>
                  ))}
                </div>
                <button onClick={handlePrevious} className={`p-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />
                </button>
                <button onClick={handleNext} className={`p-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className={`rounded-[2.5rem] overflow-hidden ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
           <div className="overflow-x-auto">
            {/* WEEKLY VIEW */}
            {scheduleType === 'weekly' && (
              <>
                {/* Week Days Header */}
                <div className={`grid grid-cols-8 min-w-[700px] border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className={`p-4 border-r ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-gradient-to-b from-background-light to-white'}`}>
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t('time')}</span>
                  </div>
                  {weekDays.map((day) => (
                    <div key={day} className={`p-4 border-r last:border-r-0 text-center ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-gradient-to-b from-background-light to-white'}`}>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{language === 'ar' ? day : day.substring(0, 3)}</span>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent">
                  {timeSlots.map((time) => (
                    <div key={time} className={`grid grid-cols-8 min-w-[700px] border-b last:border-b-0 transition-colors ${isDark ? 'border-white/5 hover:bg-white/5/30' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                      <div className={`p-3 border-r ${isDark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-100 bg-background-light/50'}`}>
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{time}</span>
                      </div>
                      {weekDays.map((day) => {
                        const dayClasses = getClassesForDay(day).filter(c => c.startTime === time || c.startTime.replace(/:\d{2} /, ':00 ') === time);
                        return (
                          <div key={`${day}-${time}`} className={`p-2 border-r last:border-r-0 min-h-[80px] relative ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            {dayClasses.map((classItem) => (
                              <div
                                key={classItem.id}
                                onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                                className={`${isDark ? 'bg-white/5' : classItem.bgLight} border-l-4 ${classItem.borderColor} rounded-lg p-2.5 mb-1 hover:shadow-md transition-all cursor-pointer group`}
                              >
                                <p className={`text-xs font-bold ${classItem.textColor} mb-1 group-hover:opacity-80`}>
                                  {classItem.code}
                                </p>
                                <p className={`text-xs font-semibold mb-0.5 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {classItem.name}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{classItem.room}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* DAILY VIEW */}
            {scheduleType === 'daily' && (
              <div className="min-h-[600px] p-6">
                <div className="space-y-4">
                  {timeSlots.map((time) => {
                    const dayClasses = getClassesForDay(weekDays[currentDayIndex]).filter(c => c.startTime === time || c.startTime.replace(/:\d{2} /, ':00 ') === time);
                    if (dayClasses.length === 0) return null;
                    
                    return (
                      <div key={time} className={`flex gap-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="w-24 flex-shrink-0">
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{time}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          {dayClasses.map((classItem) => (
                            <div
                              key={classItem.id}
                              onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                              className={`${isDark ? 'bg-white/5 border-white/10' : classItem.bgLight} border-l-4 ${classItem.borderColor} rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className={`text-sm font-bold ${classItem.textColor} mb-1`}>{classItem.code}</p>
                                  <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{classItem.name}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                  {classItem.startTime} - {classItem.endTime}
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
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {getClassesForDay(weekDays[currentDayIndex]).length === 0 && (
                    <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">{isRTL ? 'لا توجد محاضرات اليوم' : 'No classes scheduled today'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MONTHLY VIEW */}
            {scheduleType === 'monthly' && (
              <div className="p-6">
                {/* Month Days Grid */}
                <div className={`grid grid-cols-7 gap-2 mb-4 border-b pb-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  {weekDays.map((day) => (
                    <div key={day} className="text-center">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {language === 'ar' ? day : day.substring(0, 3)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayOfMonth = i + 1;
                    const dayIndex = i % 7;
                    const dayClasses = getClassesForDay(weekDays[dayIndex]);
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] p-3 rounded-lg border ${isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/5' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'} transition-colors`}
                      >
                        <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {dayOfMonth <= 31 ? dayOfMonth : ''}
                        </div>
                        <div className="space-y-1">
                          {dayClasses.slice(0, 2).map((classItem) => (
                            <div
                              key={classItem.id}
                              onClick={() => navigate(`/studentdashboard/myclass/${classItem.code}`)}
                              className={`text-[10px] px-1.5 py-1 rounded cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10' : classItem.bgLight} border-l-2 ${classItem.borderColor}`}
                            >
                              <p className={`font-bold ${classItem.textColor} truncate`}>{classItem.code}</p>
                            </div>
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

        {/* Upcoming Classes List */}
        <div>
          <div className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{isRTL ? 'المحاضرات القادمة' : 'Upcoming Classes'}</h3>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{isRTL ? 'محاضراتك المجدولة القادمة' : 'Your next scheduled classes'}</p>
            </div>

            <div className="space-y-5">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className={`border-b pb-5 last:border-b-0 last:pb-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-1.5 h-20 ${classItem.color} rounded-full flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold mb-1 text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{classItem.name}</h4>
                      <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{classItem.code}</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <Clock className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{classItem.time}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{classItem.date}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{classItem.room}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <User className="w-3.5 h-3.5 text-[var(--accent-color)] flex-shrink-0" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
