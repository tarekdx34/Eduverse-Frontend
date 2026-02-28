import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekDaysAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
  '04:00 PM', '05:00 PM', '06:00 PM'
];

const classes = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    room: 'Room A-101',
    day: 'Monday',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  {
    id: 2,
    name: 'Web Development',
    code: 'CS150',
    instructor: 'Dr. Emily Roberts',
    room: 'Lab C-301',
    day: 'Monday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-500'
  },
  {
    id: 3,
    name: 'Software Engineering',
    code: 'CS305',
    instructor: 'Prof. Lisa Anderson',
    room: 'Room A-203',
    day: 'Monday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    color: 'bg-pink-500',
    textColor: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-500'
  },
  {
    id: 4,
    name: 'Data Structures',
    code: 'CS201',
    instructor: 'Prof. Michael Chen',
    room: 'Room B-205',
    day: 'Tuesday',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-500'
  },
  {
    id: 5,
    name: 'Database Systems',
    code: 'CS220',
    instructor: 'Dr. James Wilson',
    room: 'Room D-102',
    day: 'Tuesday',
    startTime: '01:00 PM',
    endTime: '02:30 PM',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-500'
  },
  {
    id: 6,
    name: 'Mobile Development',
    code: 'CS350',
    instructor: 'Dr. Robert Taylor',
    room: 'Lab B-401',
    day: 'Tuesday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    color: 'bg-[#7C3AED]/100',
    textColor: 'text-[#7C3AED]',
    bgLight: 'bg-[#7C3AED]/10',
    borderColor: 'border-[#7C3AED]'
  },
  {
    id: 7,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    room: 'Room A-101',
    day: 'Wednesday',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  {
    id: 8,
    name: 'Web Development',
    code: 'CS150',
    instructor: 'Dr. Emily Roberts',
    room: 'Lab C-301',
    day: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-500'
  },
  {
    id: 9,
    name: 'Software Engineering',
    code: 'CS305',
    instructor: 'Prof. Lisa Anderson',
    room: 'Room A-203',
    day: 'Wednesday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    color: 'bg-pink-500',
    textColor: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-500'
  },
  {
    id: 10,
    name: 'Data Structures',
    code: 'CS201',
    instructor: 'Prof. Michael Chen',
    room: 'Room B-205',
    day: 'Thursday',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-500'
  },
  {
    id: 11,
    name: 'Database Systems',
    code: 'CS220',
    instructor: 'Dr. James Wilson',
    room: 'Room D-102',
    day: 'Thursday',
    startTime: '01:00 PM',
    endTime: '02:30 PM',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-500'
  },
  {
    id: 12,
    name: 'Mobile Development',
    code: 'CS350',
    instructor: 'Dr. Robert Taylor',
    room: 'Lab B-401',
    day: 'Thursday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    color: 'bg-[#7C3AED]/100',
    textColor: 'text-[#7C3AED]',
    bgLight: 'bg-[#7C3AED]/10',
    borderColor: 'border-[#7C3AED]'
  },
  {
    id: 13,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    room: 'Room A-101',
    day: 'Friday',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  {
    id: 14,
    name: 'Software Engineering',
    code: 'CS305',
    instructor: 'Prof. Lisa Anderson',
    room: 'Room A-203',
    day: 'Friday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    color: 'bg-pink-500',
    textColor: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-500'
  }
];

// Get upcoming classes (next 5)
const upcomingClasses = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    time: '08:30 AM - 09:30 AM',
    date: 'Monday, Dec 4, 2025',
    room: 'Room A-101',
    instructor: 'Dr. Sarah Johnson',
    color: 'bg-blue-500',
    progress: 75
  },
  {
    id: 2,
    name: 'Software Engineering',
    code: 'CS305',
    time: '11:00 AM - 12:30 PM',
    date: 'Monday, Dec 4, 2025',
    room: 'Room A-203',
    instructor: 'Prof. Lisa Anderson',
    color: 'bg-pink-500',
    progress: 90
  },
  {
    id: 3,
    name: 'Web Development',
    code: 'CS150',
    time: '02:00 PM - 03:30 PM',
    date: 'Monday, Dec 4, 2025',
    room: 'Lab C-301',
    instructor: 'Dr. Emily Roberts',
    color: 'bg-green-500',
    progress: 85
  },
  {
    id: 4,
    name: 'Data Structures',
    code: 'CS201',
    time: '10:00 AM - 11:30 AM',
    date: 'Tuesday, Dec 5, 2025',
    room: 'Room B-205',
    instructor: 'Prof. Michael Chen',
    color: 'bg-purple-500',
    progress: 60
  },
  {
    id: 5,
    name: 'Database Systems',
    code: 'CS220',
    time: '01:00 PM - 02:30 PM',
    date: 'Tuesday, Dec 5, 2025',
    room: 'Room D-102',
    instructor: 'Dr. James Wilson',
    color: 'bg-orange-500',
    progress: 45
  }
];

export default function ClassSchedule() {
  const { t, isRTL, language } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState('Week of Dec 4 - Dec 10, 2025');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // For daily view navigation
  const weekDays = language === 'ar' ? weekDaysAr : weekDaysEn;

  const getClassesForDay = (day: string) => {
    // Map Arabic days back to English for data lookup
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
                  {scheduleType === 'daily' ? weekDays[currentDayIndex] : (isRTL ? 'أسبوع 4 - 10 ديسمبر 2025' : currentWeek)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map(type => (
                    <button key={type} onClick={() => setScheduleType(type)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                        scheduleType === type
                          ? 'bg-[#7C3AED] text-white shadow-sm'
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
                <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-[#7C3AED]/30 scrollbar-track-transparent">
                  {timeSlots.map((time) => (
                    <div key={time} className={`grid grid-cols-8 min-w-[700px] border-b last:border-b-0 transition-colors ${isDark ? 'border-white/5 hover:bg-white/5/30' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                      <div className={`p-3 border-r ${isDark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-100 bg-background-light/50'}`}>
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{time}</span>
                      </div>
                      {weekDays.map((day) => {
                        const dayClasses = getClassesForDay(day).filter(c => c.startTime === time);
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
                    const dayClasses = getClassesForDay(weekDays[currentDayIndex]).filter(c => c.startTime === time);
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
                          <Clock className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                          <span>{classItem.time}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <Calendar className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                          <span>{classItem.date}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <MapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                          <span>{classItem.room}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          <User className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                      {/* Progress */}
                      <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t('progress')}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDark ? 'text-[#7C3AED]/70 bg-[#7C3AED]/20' : 'text-[#7C3AED] bg-[#7C3AED]/10'}`}>
                            {classItem.progress}%
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <div 
                            className={`${classItem.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${classItem.progress}%` }}
                          ></div>
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
    </div>
  );
}
