import { ChevronLeft, ChevronRight, Clock, Calendar, MapPin, User } from 'lucide-react';
import { useState } from 'react';

interface ClassSession {
  id: string;
  code: string;
  title: string;
  time: string;
  date: string;
  room: string;
  instructor: string;
  progress?: number;
}

interface ScheduleData {
  [day: string]: ClassSession[];
}

interface WeeklyScheduleProps {
  scheduleData?: ScheduleData;
  weekStart?: string;
  upcomingClasses?: ClassSession[];
}

const DAYS_OF_WEEK = ['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
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
];

const defaultScheduleData: ScheduleData = {
  Monday: [
    {
      id: '1',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      time: '08:00 AM - 09:30 AM',
      date: 'Monday, Dec 4, 2025',
      room: 'Room A-101',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
    },
    {
      id: '2',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      time: '08:00 AM - 09:30 AM',
      date: 'Monday, Dec 4, 2025',
      room: 'Room A-101',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
    },
  ],
  Tuesday: [
    {
      id: '3',
      code: 'CS201',
      title: 'Data Structures',
      time: '10:00 AM - 11:30 AM',
      date: 'Tuesday, Dec 5, 2025',
      room: 'Room B-205',
      instructor: 'Prof. Michael Chen',
      progress: 60,
    },
    {
      id: '4',
      code: 'CS220',
      title: 'Database Systems',
      time: '01:00 PM - 02:30 PM',
      date: 'Tuesday, Dec 5, 2025',
      room: 'Room D-102',
      instructor: 'Dr. James Wilson',
      progress: 45,
    },
  ],
  Wednesday: [],
  Thursday: [
    {
      id: '5',
      code: 'CS305',
      title: 'Software Engineering',
      time: '11:00 AM - 12:30 PM',
      date: 'Thursday, Dec 6, 2025',
      room: 'Room A-203',
      instructor: 'Prof. Lisa Anderson',
      progress: 90,
    },
  ],
  Friday: [
    {
      id: '6',
      code: 'CS305',
      title: 'Software Engineering',
      time: '11:00 AM - 12:30 PM',
      date: 'Friday, Dec 7, 2025',
      room: 'Room A-203',
      instructor: 'Prof. Lisa Anderson',
      progress: 90,
    },
    {
      id: '7',
      code: 'CS150',
      title: 'Web Development',
      time: '02:00 PM - 03:30 PM',
      date: 'Friday, Dec 7, 2025',
      room: 'Lab C-301',
      instructor: 'Dr. Emily Roberts',
      progress: 85,
    },
  ],
  Saturday: [],
  Sunday: [],
};

const defaultUpcomingClasses: ClassSession[] = [
  {
    id: '1',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    time: '08:30 AM - 09:30 AM',
    date: 'Monday, Dec 4, 2025',
    room: 'Room A-101',
    instructor: 'Dr. Sarah Johnson',
    progress: 75,
  },
  {
    id: '2',
    code: 'CS305',
    title: 'Software Engineering',
    time: '11:00 AM - 12:30 PM',
    date: 'Monday, Dec 4, 2025',
    room: 'Room A-203',
    instructor: 'Prof. Lisa Anderson',
    progress: 90,
  },
  {
    id: '3',
    code: 'CS150',
    title: 'Web Development',
    time: '02:00 PM - 03:30 PM',
    date: 'Monday, Dec 4, 2025',
    room: 'Lab C-301',
    instructor: 'Dr. Emily Roberts',
    progress: 85,
  },
  {
    id: '4',
    code: 'CS201',
    title: 'Data Structures',
    time: '10:00 AM - 11:30 AM',
    date: 'Tuesday, Dec 5, 2025',
    room: 'Room B-205',
    instructor: 'Prof. Michael Chen',
    progress: 60,
  },
];

const UpcomingClassCard = ({ classSession }: { classSession: ClassSession }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-1 h-16 rounded" style={{ backgroundColor: '#4f39f6' }} />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{classSession.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{classSession.code}</p>
      </div>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Clock size={16} />
        <span>{classSession.time}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Calendar size={16} />
        <span>{classSession.date}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <MapPin size={16} />
        <span>{classSession.room}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <User size={16} />
        <span>{classSession.instructor}</span>
      </div>
    </div>

    {classSession.progress !== undefined && (
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{classSession.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{ width: `${classSession.progress}%`, backgroundColor: '#4f39f6' }}
          />
        </div>
      </div>
    )}
  </div>
);

const ScheduleGrid = ({ scheduleData }: { scheduleData: ScheduleData }) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Header */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="w-24 py-3 px-2 font-semibold text-center text-gray-900"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="flex gap-2 mb-4 border-b border-gray-100">
            {/* Time Column */}
            <div className="w-20 py-4 px-2 text-sm text-gray-600 font-medium">
              {time}
            </div>

            {/* Day Columns */}
            {DAYS_OF_WEEK.slice(1).map((day) => (
              <div
                key={`${day}-${time}`}
                className="w-24 min-h-24 p-2 border border-gray-100 rounded bg-gray-50"
              >
                {scheduleData[day]
                  ?.filter((cls) => cls.time.startsWith(time))
                  .map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 border-l-4 border-purple-600 rounded p-2 mb-2"
                    >
                      <p className="text-xs font-bold text-purple-900">{cls.code}</p>
                      <p className="text-xs text-gray-700 line-clamp-2 mt-1">{cls.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{cls.room}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function WeeklySchedule({
  scheduleData = defaultScheduleData,
  weekStart = 'Week of Dec 4 - Dec 10, 2025',
  upcomingClasses = defaultUpcomingClasses,
}: WeeklyScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(0);

  return (
    <div className="space-y-8">
      {/* Main Schedule Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">{weekStart}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <ScheduleGrid scheduleData={scheduleData} />
      </div>

      {/* Upcoming Classes Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Upcoming Classes</h3>
          <p className="text-sm text-gray-600 mt-1">Your next scheduled classes</p>
        </div>

        {/* Upcoming Classes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingClasses.map((classSession) => (
            <UpcomingClassCard key={classSession.id} classSession={classSession} />
          ))}
        </div>
      </div>
    </div>
  );
}
