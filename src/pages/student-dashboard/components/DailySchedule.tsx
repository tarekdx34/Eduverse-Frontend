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

const ScheduleItem = ({ course }: { course: CourseSchedule }) => (
  <div className="border-b border-gray-100 pb-4 last:border-b-0">
    <div className="flex gap-3 mb-3">
      <img
        src={course.image}
        alt={course.course}
        className="w-12 h-12 rounded-lg object-cover"
        onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E')}
      />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{course.course}</h3>
        <p className="text-xs text-gray-600">{course.time}</p>
      </div>
    </div>

    <div className="space-y-2 ml-15 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 bg-gray-300 rounded" />
        <span>{course.lecturer}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 bg-gray-300 rounded" />
        <span>Course Room: {course.room}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 bg-gray-300 rounded" />
        <span>Course Credits: {course.credits}</span>
      </div>
    </div>
  </div>
);

export default function DailySchedule({ schedules }: DailyScheduleProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Daily Class Schedule</h2>
      <p className="text-sm text-gray-600 mb-6">Schedule for your class in week</p>

      <div className="space-y-4">
        {schedules.map((course) => (
          <ScheduleItem key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
