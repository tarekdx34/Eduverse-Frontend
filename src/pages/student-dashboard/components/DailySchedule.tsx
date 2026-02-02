import { useTheme } from '../contexts/ThemeContext';

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

const ScheduleItem = ({ course, isDark }: { course: CourseSchedule; isDark: boolean }) => (
  <div className={`border-b pb-4 last:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
    <div className="flex gap-3 mb-3">
      <img
        src={course.image}
        alt={course.course}
        className="w-12 h-12 rounded-lg object-cover"
        onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E')}
      />
      <div className="flex-1">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.course}</h3>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{course.time}</p>
      </div>
    </div>

    <div className={`space-y-2 ml-15 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-4 h-4 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>{course.lecturer}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-4 h-4 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>Course Room: {course.room}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-4 h-4 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
        <span>Course Credits: {course.credits}</span>
      </div>
    </div>
  </div>
);

export default function DailySchedule({ schedules }: DailyScheduleProps) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Class Schedule</h2>
      <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Schedule for your class in week</p>

      <div className="space-y-4">
        {schedules.map((course) => (
          <ScheduleItem key={course.id} course={course} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}
