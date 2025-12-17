import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-500'
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
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-500'
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
  const [currentWeek, setCurrentWeek] = useState('Week of Dec 4 - Dec 10, 2025');

  const getClassesForDay = (day: string) => {
    return classes.filter(c => c.day === day);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Weekly Schedule</h2>
                <p className="text-gray-600 text-sm">{currentWeek}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Week Days Header */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                <span className="text-sm font-semibold text-gray-600">Time</span>
              </div>
              {weekDays.map((day) => (
                <div key={day} className="p-4 border-r border-gray-200 last:border-r-0 bg-gradient-to-b from-gray-50 to-white text-center">
                  <span className="text-sm font-semibold text-gray-900">{day.substring(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="overflow-y-auto max-h-[600px]">
              {timeSlots.map((time, timeIndex) => (
                <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                  <div className="p-3 border-r border-gray-200 bg-gray-50/50">
                    <span className="text-xs font-medium text-gray-600">{time}</span>
                  </div>
                  {weekDays.map((day) => {
                    const dayClasses = getClassesForDay(day).filter(c => c.startTime === time);
                    return (
                      <div key={`${day}-${time}`} className="p-2 border-r border-gray-100 last:border-r-0 min-h-[80px] relative">
                        {dayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className={`${classItem.bgLight} border-l-4 ${classItem.borderColor} rounded-lg p-2.5 mb-1 hover:shadow-md transition-all cursor-pointer group`}
                          >
                            <p className={`text-xs font-bold ${classItem.textColor} mb-1 group-hover:opacity-80`}>
                              {classItem.code}
                            </p>
                            <p className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-1">
                              {classItem.name}
                            </p>
                            <p className="text-xs text-gray-600">{classItem.room}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Classes List */}
        <div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Upcoming Classes</h3>
              <p className="text-gray-600 text-sm">Your next scheduled classes</p>
            </div>

            <div className="space-y-5">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-1.5 h-20 ${classItem.color} rounded-full flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 font-semibold mb-1 text-sm">{classItem.name}</h4>
                      <p className="text-gray-600 text-xs font-medium mb-3">{classItem.code}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{classItem.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{classItem.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{classItem.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                      {/* Progress */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 font-medium">Course Progress</span>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {classItem.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
