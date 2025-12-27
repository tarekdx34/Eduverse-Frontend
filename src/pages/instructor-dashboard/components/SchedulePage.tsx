import React, { useState } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teaching Schedule</h1>
          <p className="text-gray-600 mt-1">
            View lectures, labs, office hours, quizzes, and deadlines in one smart calendar.
          </p>
        </div>

        {/* View toggles and filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-md transition-colors">
                Month
              </button>
              <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md">
                Week
              </button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-md transition-colors">
                Day
              </button>
            </div>
            <CustomDropdown
              label="Course:"
              value="all"
              options={[{ value: 'all', label: 'All Courses' }]}
              onChange={() => {}}
            />
            <CustomDropdown
              label="Event Type:"
              value="all"
              options={[
                { value: 'all', label: 'All Events' },
                { value: 'lecture', label: 'Lectures' },
                { value: 'lab', label: 'Labs' },
              ]}
              onChange={() => {}}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">May 12 - May 16, 2025</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">Today</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="text-xs font-medium text-gray-500">Time</div>
                {[
                  'Monday May 12',
                  'Tuesday May 13',
                  'Wednesday May 14',
                  'Thursday May 15',
                  'Friday May 16',
                ].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>
              {/* Time slots */}
              {[
                '9:00 AM',
                '10:00 AM',
                '11:00 AM',
                '12:00 PM',
                '1:00 PM',
                '2:00 PM',
                '3:00 PM',
                '4:00 PM',
              ].map((time) => (
                <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="text-xs text-gray-500 py-2">{time}</div>
                  {[0, 1, 2, 3, 4].map((day) => (
                    <div key={day} className="border border-gray-100 rounded p-1 min-h-[60px]">
                      {time === '9:00 AM' && day === 0 && (
                        <div className="bg-blue-100 text-blue-700 p-2 rounded text-xs">
                          <div className="font-medium">Calculus</div>
                          <div>9:00 AM</div>
                        </div>
                      )}
                      {time === '10:00 AM' && day === 2 && (
                        <div className="bg-orange-100 text-orange-700 p-2 rounded text-xs">
                          <div className="font-medium">Digital Logic Lab</div>
                          <div>10:00 AM</div>
                        </div>
                      )}
                      {time === '11:00 AM' && day === 2 && (
                        <div className="bg-purple-100 text-purple-700 p-2 rounded text-xs">
                          <div className="font-medium">Quiz: CS</div>
                          <div>11:30 AM - 12:30</div>
                        </div>
                      )}
                      {time === '1:00 PM' && day === 1 && (
                        <div className="bg-blue-100 text-blue-700 p-2 rounded text-xs">
                          <div className="font-medium">Physics Lecture</div>
                          <div>1:00 PM</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Teaching Events</h3>
              <div className="space-y-3">
                {[
                  {
                    title: 'Calculus Lecture',
                    time: '9:00 AM',
                    date: 'May 12',
                    color: 'bg-blue-100 text-blue-700',
                  },
                  {
                    title: 'Physics Lab',
                    time: '2:00 PM',
                    date: 'May 13',
                    color: 'bg-orange-100 text-orange-700',
                  },
                  {
                    title: 'Quiz: CS',
                    time: '11:30 AM',
                    date: 'May 14',
                    color: 'bg-purple-100 text-purple-700',
                  },
                  {
                    title: 'Office Hours',
                    time: '12:00 PM',
                    date: 'May 15',
                    color: 'bg-green-100 text-green-700',
                  },
                ].map((event, index) => (
                  <div key={index} className={`p-3 rounded-lg ${event.color}`}>
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs mt-1">{event.time}</div>
                    <div className="text-xs">{event.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Evy - Smart Scheduling Assistant</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Automatically detect conflicts and suggest optimal teaching times.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm">
                  Detect Conflicts
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  Optimize Schedule
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <span className="text-sm font-semibold text-gray-900">18.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lectures:</span>
                  <span className="text-sm font-semibold text-gray-900">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Labs:</span>
                  <span className="text-sm font-semibold text-gray-900">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conflicts:</span>
                  <span className="text-sm font-semibold text-red-600">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
