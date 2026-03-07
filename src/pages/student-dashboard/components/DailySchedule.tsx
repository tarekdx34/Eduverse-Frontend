import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CourseSchedule {
  id: number;
  course: string;
  time: string;
  lecturer: string;
  room: string;
  credits: number;
  image: string;
}

interface DailyScheduleProps {
  schedules: CourseSchedule[];
}

const ScheduleItem = ({
  course,
  index,
  isDark,
  isLast,
  accentColor,
}: {
  course: CourseSchedule;
  index: number;
  isDark: boolean;
  isLast: boolean;
  accentColor: string;
}) => {
  const dotColor =
    index === 0 ? accentColor : index === 1 ? '#ec4899' : isDark ? '#475569' : '#cbd5e1';

  return (
    <div className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
      {/* Timeline line */}
      <div
        className={`absolute left-0 top-0 ${isLast ? 'h-4' : 'bottom-0'} w-px ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}
      ></div>
      {/* Timeline dot */}
      <div
        className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full ring-4`}
        style={{ backgroundColor: dotColor, boxShadow: `0 0 0 4px ${dotColor}20` } as any}
      ></div>
      {/* Time label */}
      <div
        className={`text-[10px] font-bold uppercase tracking-widest mb-1`}
        style={{ color: dotColor }}
      >
        {course.time}
      </div>
      {/* Card */}
      <div
        className={`p-4 rounded-2xl transition-all border ${
          isDark
            ? 'bg-white/5 border-transparent hover:border-white/10'
            : 'bg-slate-50 border-transparent hover:border-slate-200'
        }`}
      >
        <h5 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {course.course}
        </h5>
        <p
          className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} flex items-center gap-1 mb-3`}
        >
          <span className="material-symbols-rounded text-xs">person</span> {course.lecturer}
        </p>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
              isDark
                ? 'bg-white/5 text-slate-400'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {course.room}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
              isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
            }`}
          >
            LECTURE
          </span>
        </div>
      </div>
    </div>
  );
};

export default function DailySchedule({ schedules }: DailyScheduleProps) {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  return (
    <div
      className={`p-8 rounded-3xl border h-full transition-all duration-300 ${
        isDark
          ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-xl font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('dailyClassSchedule') || 'Daily Schedule'}
        </h3>
        <button
          className="text-sm font-bold hover:opacity-80 transition-opacity"
          style={{ color: accentColor }}
        >
          {t('fullWeek') || 'Full Week'}
        </button>
      </div>

      <div className="space-y-0">
        {schedules.map((course, index) => (
          <ScheduleItem
            key={course.id}
            course={course}
            index={index}
            isDark={isDark}
            isLast={index === schedules.length - 1}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Deadlines / Upcoming Exam section */}
      <div className={`mt-8 pt-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-bold text-sm mb-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('todayDeadlines') || "Today's Deadlines"}
          </h4>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
            2
          </span>
        </div>
        <div className="space-y-3">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-red-500 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
          >
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div>
              <p className={`text-xs font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Algorithms Quiz
              </p>
              <p className="text-[10px] text-slate-500 mb-0">Due in 4 hours</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-amber-500 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div>
              <p className={`text-xs font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Project Proposal
              </p>
              <p className="text-[10px] text-slate-500 mb-0">Due at midnight</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
