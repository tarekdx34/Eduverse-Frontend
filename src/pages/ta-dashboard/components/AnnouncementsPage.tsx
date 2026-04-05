import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Calendar,
  BookOpen,
  Pin,
  Edit,
  Trash2,
  MessageSquare,
  Users,
  X,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { MessagingChat } from '../../../components/shared';
import { CleanSelect } from '../../../components/shared';

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
    content:
      'The deadline for Lab 2 submissions has been extended to Friday, Feb 28th at 11:59 PM. Please make sure to submit your work on time.',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    date: '2025-02-21',
    pinned: true,
    author: 'Ahmed Hassan (TA)',
  },
  {
    id: 'ann2',
    title: 'Lab 1 Grades Released',
    content:
      'Lab 1 grades have been released. Please check your grades and come to office hours if you have any questions about your feedback.',
    course: 'Introduction to Programming',
    courseCode: 'CS101',
    date: '2025-02-20',
    pinned: false,
    author: 'Ahmed Hassan (TA)',
  },
  {
    id: 'ann3',
    title: 'Extra Office Hours This Week',
    content:
      'I will be holding extra office hours on Thursday 2-4 PM in Office B-204 to help with the upcoming lab assignment.',
    course: 'Data Structures',
    courseCode: 'CS202',
    date: '2025-02-19',
    pinned: false,
    author: 'Ahmed Hassan (TA)',
  },
];

export function AnnouncementsPage() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    courseCode: 'CS101',
    pinned: false,
  });
  const [activeCommTab, setActiveCommTab] = useState<
    'announcements' | 'courseChats' | 'directMessages'
  >('announcements');

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
    setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)));
  };

  const commTabs = [
    { id: 'announcements' as const, label: 'Announcements', icon: Megaphone },
    { id: 'courseChats' as const, label: 'Course Chats', icon: Users },
    { id: 'directMessages' as const, label: 'Direct Messages', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Communication Hub Tabs */}
      <div
        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-2 overflow-x-auto`}
      >
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {commTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCommTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeCommTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Chats Tab */}
      {activeCommTab === 'courseChats' && (
        <div className="h-[calc(100vh-220px)]">
          <MessagingChat isDark={isDark} />
        </div>
      )}

      {/* Direct Messages Tab */}
      {activeCommTab === 'directMessages' && (
        <div className="h-[calc(100vh-220px)]">
          <MessagingChat isDark={isDark} />
        </div>
      )}

      {/* Announcements Tab */}
      {activeCommTab === 'announcements' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('announcements')}
              </h2>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {t('postAndManageAnnouncements')}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('newAnnouncement')}
            </button>
          </div>

          {/* New Announcement Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div
                className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
                } overflow-hidden animate-in fade-in zoom-in duration-200`}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('createAnnouncement')}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'hover:bg-white/10 text-slate-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label
                      className={`block text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-700'} mb-2`}
                    >
                      {t('title')}
                    </label>
                    <input
                      type="text"
                      value={newAnn.title}
                      onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                      placeholder={t('announcementTitlePlaceholder') || 'Announcement title...'}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all outline-none ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-700'} mb-2`}
                    >
                      {t('course')}
                    </label>
                    <CleanSelect
                      value={newAnn.courseCode}
                      onChange={(e) => setNewAnn({ ...newAnn, courseCode: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {courses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </CleanSelect>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-700'} mb-2`}
                    >
                      {t('content')}
                    </label>
                    <textarea
                      value={newAnn.content}
                      onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                      placeholder={
                        t('writeAnnouncementPlaceholder') ||
                        'Write your announcement content here...'
                      }
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <input
                      type="checkbox"
                      id="pin"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={newAnn.pinned}
                      onChange={(e) => setNewAnn({ ...newAnn, pinned: e.target.checked })}
                    />
                    <label
                      htmlFor="pin"
                      className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-900'}`}
                    >
                      {t('pinThisAnnouncement')}
                    </label>
                  </div>
                </div>

                <div
                  className={`p-6 flex flex-col sm:flex-row gap-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} bg-slate-50/50 dark:bg-white/2`}
                >
                  <button
                    onClick={handlePost}
                    disabled={!newAnn.title || !newAnn.content}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {t('postAnnouncement')}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className={`flex-1 px-6 py-3 rounded-xl border transition-all font-bold ${
                      isDark
                        ? 'border-white/10 text-slate-400 hover:bg-white/5'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Course Filter */}
          <div
            className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg p-4`}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCourse('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCourse === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('allCourses')}
              </button>
              {courses.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setFilterCourse(c.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterCourse === c.code
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10'
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
                className={`border rounded-lg p-6 ${
                  announcement.pinned
                    ? isDark
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-blue-50/30 border-blue-200'
                    : isDark
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}
                    >
                      <Megaphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {announcement.title}
                        </h3>
                        {announcement.pinned && <Pin className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div
                        className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {announcement.courseCode} - {announcement.course}
                          </span>
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
                          : isDark
                            ? 'text-slate-400 hover:bg-white/10'
                            : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={announcement.pinned ? t('unpin') : t('pin')}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p
                  className={`text-sm leading-relaxed ml-[52px] ${isDark ? 'text-slate-400' : 'text-gray-700'}`}
                >
                  {announcement.content}
                </p>
                <p
                  className={`text-xs mt-3 ml-[52px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                >
                  {t('postedBy')} {announcement.author}
                </p>
              </div>
            ))}
          </div>

          {filteredAnnouncements.length === 0 && (
            <div
              className={`text-center py-12 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-lg`}
            >
              <Megaphone
                className={`w-12 h-12 ${isDark ? 'text-slate-500' : 'text-gray-400'} mx-auto mb-4`}
              />
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noAnnouncementsFound')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnnouncementsPage;
