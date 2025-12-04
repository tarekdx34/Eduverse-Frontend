import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Filter, Plus } from 'lucide-react';
import { useState } from 'react';

interface CalendarEvent {
  id: string;
  date: number;
  title: string;
  type: 'exam' | 'assignment' | 'event' | 'holiday' | 'deadline';
  color: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'Exam' | 'Event' | 'Assignment' | 'Deadline' | 'Holiday';
  description: string;
  date: string;
  time: string;
  location?: string;
}

interface AcademicCalendarProps {
  month?: number;
  year?: number;
  events?: CalendarEvent[];
  upcomingEvents?: UpcomingEvent[];
  stats?: {
    totalEvents: number;
    exams: number;
    assignments: number;
    events: number;
    deadlines: number;
  };
}

const defaultStats = {
  totalEvents: 10,
  exams: 2,
  assignments: 3,
  events: 3,
  deadlines: 1,
};

const defaultEvents: CalendarEvent[] = [
  { id: '1', date: 1, title: '', type: 'exam', color: 'bg-blue-100' },
  { id: '2', date: 2, title: '', type: 'exam', color: 'bg-blue-100' },
  { id: '3', date: 3, title: '', type: 'exam', color: 'bg-blue-100' },
  { id: '4', date: 4, title: 'Study Group - Data Structures', type: 'event', color: 'bg-green-100' },
  { id: '5', date: 5, title: 'Final Exam - Database Systems', type: 'exam', color: 'bg-red-100' },
  { id: '6', date: 6, title: 'Midterm Exam - Web Development', type: 'exam', color: 'bg-red-100' },
  { id: '6b', date: 6, title: 'Algorithm Analysis Report Due', type: 'assignment', color: 'bg-yellow-100' },
  { id: '8', date: 8, title: 'Mobile App Prototype Due', type: 'assignment', color: 'bg-yellow-100' },
  { id: '10', date: 10, title: 'Database Design Project Due', type: 'assignment', color: 'bg-yellow-100' },
  { id: '12', date: 12, title: 'CS Department Seminar', type: 'event', color: 'bg-green-100' },
  { id: '15', date: 15, title: 'Registration Deadline - Spring 2026', type: 'deadline', color: 'bg-purple-100' },
  { id: '18', date: 18, title: 'Career Fair', type: 'event', color: 'bg-green-100' },
  { id: '20', date: 20, title: 'Winter Break Begins', type: 'holiday', color: 'bg-orange-100' },
];

const defaultUpcomingEvents: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Study Group - Data Structures',
    type: 'Event',
    description: 'Exam preparation study session',
    date: 'Thu, Dec 4, 2025',
    time: '06:00 PM - 08:00 PM',
    location: 'Library Room 3',
  },
  {
    id: '2',
    title: 'Final Exam - Database Systems',
    type: 'Exam',
    description: 'Comprehensive final examination',
    date: 'Fri, Dec 5, 2025',
    time: '09:00 AM - 11:00 AM',
    location: 'Room D-102',
  },
  {
    id: '3',
    title: 'Midterm Exam - Web Development',
    type: 'Exam',
    description: 'Midterm examination',
    date: 'Sat, Dec 6, 2025',
    time: '01:00 PM - 03:00 PM',
    location: 'Lab C-301',
  },
  {
    id: '4',
    title: 'Algorithm Analysis Report Due',
    type: 'Assignment',
    description: 'Submit complexity analysis report',
    date: 'Sat, Dec 6, 2025',
    time: '11:59 PM',
  },
];

const getEventBadgeColor = (type: string) => {
  switch (type) {
    case 'Exam':
      return 'bg-red-100 text-red-700';
    case 'Event':
      return 'bg-green-100 text-green-700';
    case 'Assignment':
      return 'bg-yellow-100 text-yellow-700';
    case 'Deadline':
      return 'bg-purple-100 text-purple-700';
    case 'Holiday':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const StatCard = ({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: number;
  subtext: string;
  color: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Calendar size={24} className="text-gray-600" />
      </div>
    </div>
  </div>
);

const UpcomingEventCard = ({ event }: { event: UpcomingEvent }) => (
  <div className="border-l-4 border-l-blue-500 bg-white rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start gap-4 mb-3">
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
        <p className="text-sm text-gray-600">{event.description}</p>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap ${getEventBadgeColor(event.type)}`}>
        {event.type}
      </span>
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Calendar size={12} />
        <span>{event.date}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Clock size={12} />
        <span>{event.time}</span>
      </div>
      {event.location && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
      )}
    </div>
  </div>
);

const CalendarGrid = ({ events, month, year }: { events: CalendarEvent[]; month: number; year: number }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const calendarDays = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const dayEvents = events.reduce(
    (acc, event) => {
      acc[event.date] = [...(acc[event.date] || []), event];
      return acc;
    },
    {} as Record<number, CalendarEvent[]>
  );

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">{monthNames[month]} {year}</h2>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700 text-sm py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-3 min-h-24 bg-gray-50 relative"
          >
            {day && (
              <>
                <p className="font-semibold text-gray-900 mb-2">{day}</p>
                {dayEvents[day]?.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-1 truncate"
                    title={event.title}
                  >
                    {event.title || `${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-3">Legend:</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-gray-600">Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span className="text-gray-600">Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-gray-600">Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 rounded"></div>
            <span className="text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 rounded"></div>
            <span className="text-gray-600">Deadline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AcademicCalendar({
  month = 11,
  year = 2025,
  events = defaultEvents,
  upcomingEvents = defaultUpcomingEvents,
  stats = defaultStats,
}: AcademicCalendarProps) {
  const [filterCategory, setFilterCategory] = useState('All Categories');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard label="Total Events" value={stats.totalEvents} subtext="This month" color="bg-blue-100" />
        <StatCard label="Exams" value={stats.exams} subtext="Scheduled" color="bg-red-100" />
        <StatCard label="Assignments" value={stats.assignments} subtext="Due dates" color="bg-yellow-100" />
        <StatCard label="Events" value={stats.events} subtext="Campus activities" color="bg-green-100" />
        <StatCard label="Deadlines" value={stats.deadlines} subtext="Important dates" color="bg-purple-100" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2">
          <CalendarGrid events={events} month={month} year={year} />
        </div>

        {/* Sidebar with upcoming events */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
              <p className="text-sm text-gray-600">Next scheduled events</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Categories</option>
            <option>Exams</option>
            <option>Assignments</option>
            <option>Holidays</option>
            <option>Events</option>
            <option>Deadlines</option>
          </select>

          {/* Upcoming events list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingEvents.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
