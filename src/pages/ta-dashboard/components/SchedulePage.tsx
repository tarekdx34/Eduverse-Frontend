import React, { useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

type ScheduleEvent = {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  type: 'lab' | 'office-hours' | 'meeting' | 'grading-deadline';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
};

const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'ev1',
    title: 'Lab 2: Control Structures',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'lab',
    date: '2025-02-22',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Lab A-101',
    color: 'blue',
  },
  {
    id: 'ev2',
    title: 'Office Hours',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'office-hours',
    date: '2025-02-22',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Office B-204',
    color: 'green',
  },
  {
    id: 'ev3',
    title: 'Lab 1: Arrays and Linked Lists',
    course: 'Data Structures',
    courseCode: 'CS202',
    type: 'lab',
    date: '2025-02-23',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Lab B-205',
    color: 'purple',
  },
  {
    id: 'ev4',
    title: 'Grading Deadline - Lab 1',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'grading-deadline',
    date: '2025-02-24',
    startTime: '11:59 PM',
    endTime: '11:59 PM',
    location: 'Online',
    color: 'red',
  },
  {
    id: 'ev5',
    title: 'Meeting with Dr. Smith',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    type: 'meeting',
    date: '2025-02-24',
    startTime: '3:00 PM',
    endTime: '3:30 PM',
    location: 'Online - Zoom',
    color: 'orange',
  },
  {
    id: 'ev6',
    title: 'Lab 1: Sorting Algorithms',
    course: 'Advanced Algorithms',
    courseCode: 'CS303',
    type: 'lab',
    date: '2025-02-25',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    location: 'Lab C-301',
    color: 'indigo',
  },
  {
    id: 'ev7',
    title: 'Office Hours',
    course: 'Data Structures',
    courseCode: 'CS202',
    type: 'office-hours',
    date: '2025-02-25',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    location: 'Office B-204',
    color: 'green',
  },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export function SchedulePage() {
  const [view, setView] = useState<'week' | 'list'>('week');
  const [currentWeekStart] = useState('2025-02-22');

  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    };
    return map[color] || map.blue;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      lab: { label: 'Lab Session', className: 'bg-blue-100 text-blue-800' },
      'office-hours': { label: 'Office Hours', className: 'bg-green-100 text-green-800' },
      meeting: { label: 'Meeting', className: 'bg-orange-100 text-orange-800' },
      'grading-deadline': { label: 'Deadline', className: 'bg-red-100 text-red-800' },
    };
    const badge = badges[type] || badges.lab;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const groupedByDate = MOCK_SCHEDULE.reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-gray-600 mt-1">View your labs, office hours, meetings, and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            Feb 22 – Feb 27, 2025
          </h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Schedule View */}
      {view === 'list' ? (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, events]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="space-y-2">
                  {events.map((event) => {
                    const colors = getColorClasses(event.color);
                    return (
                      <div
                        key={event.id}
                        className={`${colors.bg} border ${colors.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${colors.text}`}>{event.title}</h4>
                              {getTypeBadge(event.type)}
                            </div>
                            <p className="text-sm text-gray-600">{event.course} ({event.courseCode})</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{event.startTime} - {event.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Week Grid View */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 divide-x divide-gray-200">
            {DAYS.map((day, idx) => {
              const date = new Date('2025-02-22');
              date.setDate(date.getDate() + idx);
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = groupedByDate[dateStr] || [];

              return (
                <div key={day} className="min-h-[300px]">
                  <div className="bg-gray-50 p-3 border-b border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">{day}</p>
                    <p className="text-lg font-bold text-gray-900">{date.getDate()}</p>
                  </div>
                  <div className="p-2 space-y-2">
                    {dayEvents.map((event) => {
                      const colors = getColorClasses(event.color);
                      return (
                        <div
                          key={event.id}
                          className={`${colors.bg} border ${colors.border} rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                          <p className={`text-xs font-semibold ${colors.text} truncate`}>{event.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{event.startTime}</p>
                          <div className="mt-1">{getTypeBadge(event.type)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-gray-600">Lab Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm text-gray-600">Office Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-sm text-gray-600">Meetings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm text-gray-600">Deadlines</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
