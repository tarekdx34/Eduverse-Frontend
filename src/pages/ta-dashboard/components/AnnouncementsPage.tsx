import React, { useState } from 'react';
import { Megaphone, Plus, Send, Calendar, BookOpen, Pin, Edit, Trash2 } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  course: string;
  courseCode: string;
  date: string;
  pinned: boolean;
  author: string;
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'Lab 2 Deadline Extended',
    content: 'The deadline for Lab 2 submissions has been extended to Friday, Feb 28th at 11:59 PM. Please make sure to submit your work on time.',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    date: '2025-02-21',
    pinned: true,
    author: 'Ahmed Hassan (TA)',
  },
  {
    id: 'ann2',
    title: 'Lab 1 Grades Released',
    content: 'Lab 1 grades have been released. Please check your grades and come to office hours if you have any questions about your feedback.',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    date: '2025-02-20',
    pinned: false,
    author: 'Ahmed Hassan (TA)',
  },
  {
    id: 'ann3',
    title: 'Extra Office Hours This Week',
    content: 'I will be holding extra office hours on Thursday 2-4 PM in Office B-204 to help with the upcoming lab assignment.',
    course: 'Data Structures',
    courseCode: 'CS202',
    date: '2025-02-19',
    pinned: false,
    author: 'Ahmed Hassan (TA)',
  },
];

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [newAnn, setNewAnn] = useState({ title: '', content: '', courseCode: 'CS101', pinned: false });

  const courses = [
    { code: 'CS101', name: 'Introduction to Programming' },
    { code: 'CS202', name: 'Data Structures' },
    { code: 'CS303', name: 'Advanced Algorithms' },
  ];

  const filteredAnnouncements = announcements
    .filter((a) => filterCourse === 'all' || a.courseCode === filterCourse)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handlePost = () => {
    const course = courses.find((c) => c.code === newAnn.courseCode);
    const ann: Announcement = {
      id: `ann${Date.now()}`,
      title: newAnn.title,
      content: newAnn.content,
      course: course?.name || '',
      courseCode: newAnn.courseCode,
      date: new Date().toISOString().split('T')[0],
      pinned: newAnn.pinned,
      author: 'Ahmed Hassan (TA)',
    };
    setAnnouncements([ann, ...announcements]);
    setNewAnn({ title: '', content: '', courseCode: 'CS101', pinned: false });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-600 mt-1">Post and manage announcements for your lab sections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newAnn.title}
                onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                placeholder="Announcement title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={newAnn.courseCode}
                onChange={(e) => setNewAnn({ ...newAnn, courseCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newAnn.content}
                onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                placeholder="Write your announcement..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin"
                checked={newAnn.pinned}
                onChange={(e) => setNewAnn({ ...newAnn, pinned: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="pin" className="text-sm text-gray-700">Pin this announcement</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePost}
                disabled={!newAnn.title || !newAnn.content}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Post Announcement
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCourse('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCourse === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.code}
              onClick={() => setFilterCourse(c.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCourse === c.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white border rounded-lg p-6 ${
              announcement.pinned ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    {announcement.pinned && (
                      <Pin className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{announcement.courseCode} - {announcement.course}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePin(announcement.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    announcement.pinned
                      ? 'text-blue-600 hover:bg-blue-100'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={announcement.pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed ml-[52px]">{announcement.content}</p>
            <p className="text-xs text-gray-400 mt-3 ml-[52px]">Posted by {announcement.author}</p>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No announcements found.</p>
        </div>
      )}
    </div>
  );
}

export default AnnouncementsPage;
