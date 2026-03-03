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

// Assign colors for timeline dots and time labels
const scheduleColors = [
  { dot: 'bg-[var(--accent-color)]', ring: 'ring-[#7C3AED]/20', timeColor: 'text-[var(--accent-color)]', hoverBorder: 'hover:border-[var(--accent-color)]/20', tagBg: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { dot: 'bg-[#ec4899]', ring: 'ring-[#ec4899]/20', timeColor: 'text-[#ec4899]', hoverBorder: 'hover:border-[#ec4899]/20', tagBg: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { dot: 'bg-slate-300 dark:bg-slate-700', ring: 'ring-slate-300/20', timeColor: 'text-slate-400', hoverBorder: '', tagBg: 'bg-slate-100 dark:bg-white/10 text-slate-400' },
];

const ScheduleItem = ({ course, index, isDark, isLast }: { course: CourseSchedule; index: number; isDark: boolean; isLast: boolean }) => {
  const color = scheduleColors[index % scheduleColors.length];
  
  return (
    <div className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
      {/* Timeline line */}
      <div className={`absolute left-0 top-0 ${isLast ? 'h-4' : 'bottom-0'} w-px ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
      {/* Timeline dot */}
      <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full ${color.dot} ring-4 ${color.ring}`}></div>
      {/* Time label */}
      <div className={`text-[10px] font-bold ${color.timeColor} uppercase tracking-widest mb-1`}>{course.time}</div>
      {/* Card */}
      <div className={`p-5 rounded-2xl group-hover:translate-x-1 transition-transform border border-transparent ${color.hoverBorder} ${
        isDark ? 'bg-white/5' : 'bg-slate-50'
      }`}>
        <h5 className={`font-bold text-sm mb-1 ${isLast && isDark ? 'text-slate-400' : isDark ? 'text-white' : 'text-slate-800'}`}>{course.course}</h5>
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
          <span className="material-symbols-rounded text-xs">person</span> {course.lecturer}
        </p>
        <div className="flex gap-2">
          <span className={`px-2 py-1 ${color.tagBg} text-[10px] font-bold rounded-md uppercase`}>{course.room}</span>
          <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>LECTURE</span>
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
    <div className={`p-8 rounded-[2.5rem] h-full ${
      isDark ? 'bg-card-dark border border-white/5' : 'glass'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-xl font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {t('dailyClassSchedule') || 'Smart Schedule'}
        </h3>
        <button className="text-[var(--accent-color)] text-sm font-bold hover:underline">
          Full Week
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
          />
        ))}
      </div>

      {/* Deadlines / Upcoming Exam section */}
      <div className={`mt-10 pt-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-bold text-sm mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Today's Deadlines</h4>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">2</span>
        </div>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-red-500 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div>
              <p className={`text-xs font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Algorithms Quiz</p>
              <p className="text-[10px] text-slate-500 mb-0">Due in 4 hours</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-amber-500 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div>
              <p className={`text-xs font-bold mb-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Project Proposal</p>
              <p className="text-[10px] text-slate-500 mb-0">Due at midnight</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
