import React, { useState } from 'react';
import { Plus, Edit, Trash2, Bell, Sparkles, MessageSquare, FileText, Search } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

export function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'chats' | 'messages'>(
    'announcements'
  );

  const announcements = [
    {
      title: 'Assignment 3 Deadline Extended',
      course: 'Calculus I',
      courseColor: 'bg-blue-100 text-blue-700',
      date: 'May 14, 2025',
      content:
        'Assignment 3 deadline has been moved to May 16 to give students more time to complete the problems.',
    },
    {
      title: 'Extra Office Hours Added',
      course: 'Physics I',
      courseColor: 'bg-purple-100 text-purple-700',
      date: 'May 13, 2025',
      content:
        'Extra office hours added this Thursday from 3-5 PM in Room 204 to help with midterm preparation.',
    },
    {
      title: 'Lab Session Reminder',
      course: 'CS',
      courseColor: 'bg-green-100 text-green-700',
      date: 'May 12, 2025',
      content:
        'Reminder: Lab session this Friday will cover pointer concepts. Please review Chapter 5 beforehand.',
    },
    {
      title: 'Guest Lecture Announcement',
      course: 'Logic Design',
      courseColor: 'bg-orange-100 text-orange-700',
      date: 'May 10, 2025',
      content:
        'Dr. James Wilson will give a guest lecture on FPGA design next Tuesday. Attendance is mandatory.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-1">
            Manage announcements, interact with course chats, and message students easily.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'announcements'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'chats'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Course Chats
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'messages'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Direct Messages
          </button>
        </div>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Header with filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CustomDropdown
                  label="Course:"
                  value="all"
                  options={[
                    { value: 'all', label: 'All Courses' },
                    { value: 'calculus', label: 'Calculus I' },
                    { value: 'physics', label: 'Physics I' },
                  ]}
                  onChange={() => {}}
                />
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus size={18} />
                Create Announcement
              </button>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.courseColor}`}
                        >
                          {announcement.course}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{announcement.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{announcement.content}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                      Delete
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Bell size={16} />
                      Send Notification
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Chats Tab */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Chats</h3>
            <p className="text-gray-600">
              View and participate in course-specific group chats with students.
            </p>
          </div>
        )}

        {/* Direct Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Messages</h3>
            <p className="text-gray-600">Send private messages to individual students or groups.</p>
          </div>
        )}

        {/* AI Communication Assistant */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Communication Assistant — Powered by Evy
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Let AI draft announcements, summarize long chats, and suggest responses to save you
            time.
          </p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <FileText size={16} />
              Generate Announcement
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm">
              <MessageSquare size={16} />
              Summarize Chat
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm">
              <Sparkles size={16} />
              Suggest Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunicationPage;
