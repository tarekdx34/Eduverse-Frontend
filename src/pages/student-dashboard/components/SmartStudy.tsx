import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Brain,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle,
  Flame,
  Bookmark,
  HelpCircle,
  Layers,
  Play,
  RefreshCw,
  CalendarOff,
  Loader2,
} from 'lucide-react';

interface Topic {
  id: number;
  title: string;
  course: string;
  priority: 'urgent' | 'recommended' | 'normal';
  progress: number;
  studyTime: string;
  flashcards: number;
  questions: number;
  lastReviewed: string;
  bookmarked: boolean;
}

interface ScheduleSession {
  time: string;
  topic: string;
  course: string;
  type: string;
  status: 'completed' | 'in-progress' | 'pending';
  color: string;
}

const topicsData: Topic[] = [
  { id: 1, title: 'Database Normalization', course: 'CS220 - Database Systems', priority: 'urgent', progress: 35, studyTime: '2h recommended', flashcards: 12, questions: 8, lastReviewed: '2 days ago', bookmarked: true },
  { id: 2, title: 'Graph Algorithms', course: 'CS201 - Data Structures', priority: 'urgent', progress: 20, studyTime: '3h recommended', flashcards: 18, questions: 15, lastReviewed: '5 days ago', bookmarked: false },
  { id: 3, title: 'Design Patterns', course: 'CS305 - Software Engineering', priority: 'recommended', progress: 60, studyTime: '1.5h recommended', flashcards: 10, questions: 6, lastReviewed: '1 day ago', bookmarked: true },
  { id: 4, title: 'Neural Networks', course: 'CS410 - Machine Learning', priority: 'recommended', progress: 45, studyTime: '2.5h recommended', flashcards: 15, questions: 10, lastReviewed: '3 days ago', bookmarked: false },
  { id: 5, title: 'Process Scheduling', course: 'CS310 - Operating Systems', priority: 'normal', progress: 70, studyTime: '1h recommended', flashcards: 8, questions: 5, lastReviewed: 'Today', bookmarked: false },
  { id: 6, title: 'TCP/IP Protocol', course: 'CS301 - Computer Networks', priority: 'normal', progress: 55, studyTime: '1.5h recommended', flashcards: 10, questions: 7, lastReviewed: '4 days ago', bookmarked: true },
  { id: 7, title: 'React Hooks', course: 'CS150 - Web Development', priority: 'recommended', progress: 80, studyTime: '45min recommended', flashcards: 6, questions: 4, lastReviewed: 'Today', bookmarked: false },
  { id: 8, title: 'Time Complexity', course: 'CS250 - Algorithms', priority: 'urgent', progress: 25, studyTime: '2h recommended', flashcards: 14, questions: 12, lastReviewed: '1 week ago', bookmarked: false },
];

const scheduleData: Record<string, ScheduleSession[]> = {
  Monday: [
    { time: '9:00 AM - 10:30 AM', topic: 'Database Normalization', course: 'CS220', type: 'Lecture Review', status: 'completed', color: '#10B981' },
    { time: '2:00 PM - 3:00 PM', topic: 'Graph Algorithms', course: 'CS201', type: 'Problem Solving', status: 'in-progress', color: '#3B82F6' },
    { time: '5:00 PM - 6:00 PM', topic: 'Design Patterns', course: 'CS305', type: 'Quiz Practice', status: 'pending', color: '#7C3AED' },
  ],
  Tuesday: [
    { time: '10:00 AM - 11:30 AM', topic: 'Neural Networks', course: 'CS410', type: 'Lecture Review', status: 'pending', color: '#F59E0B' },
    { time: '1:00 PM - 2:30 PM', topic: 'Time Complexity', course: 'CS250', type: 'Problem Solving', status: 'pending', color: '#EF4444' },
    { time: '4:00 PM - 5:00 PM', topic: 'TCP/IP Protocol', course: 'CS301', type: 'Flashcards', status: 'pending', color: '#06B6D4' },
  ],
  Wednesday: [
    { time: '9:00 AM - 10:00 AM', topic: 'React Hooks', course: 'CS150', type: 'Coding Practice', status: 'pending', color: '#EC4899' },
    { time: '2:00 PM - 3:30 PM', topic: 'Process Scheduling', course: 'CS310', type: 'Lecture Review', status: 'pending', color: '#8B5CF6' },
  ],
  Thursday: [
    { time: '10:00 AM - 11:00 AM', topic: 'Database Normalization', course: 'CS220', type: 'Quiz Practice', status: 'pending', color: '#10B981' },
    { time: '3:00 PM - 4:30 PM', topic: 'Graph Algorithms', course: 'CS201', type: 'Problem Solving', status: 'pending', color: '#3B82F6' },
    { time: '6:00 PM - 7:00 PM', topic: 'Neural Networks', course: 'CS410', type: 'Flashcards', status: 'pending', color: '#F59E0B' },
  ],
  Friday: [
    { time: '9:00 AM - 10:30 AM', topic: 'Design Patterns', course: 'CS305', type: 'Coding Practice', status: 'pending', color: '#7C3AED' },
    { time: '1:00 PM - 2:00 PM', topic: 'Time Complexity', course: 'CS250', type: 'Quiz Practice', status: 'pending', color: '#EF4444' },
  ],
  Saturday: [
    { time: '10:00 AM - 12:00 PM', topic: 'Full Review Session', course: 'All Courses', type: 'Review', status: 'pending', color: '#6366F1' },
  ],
  Sunday: [],
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getSessionTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'Lecture Review': return 'bg-blue-100 text-blue-700';
    case 'Problem Solving': return 'bg-green-100 text-green-700';
    case 'Quiz Practice': return 'bg-purple-100 text-purple-700';
    case 'Flashcards': return 'bg-amber-100 text-amber-700';
    case 'Coding Practice': return 'bg-pink-100 text-pink-700';
    case 'Review': return 'bg-indigo-100 text-indigo-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'bg-red-500';
  if (progress < 60) return 'bg-amber-500';
  if (progress < 80) return 'bg-blue-500';
  return 'bg-green-500';
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700';
    case 'recommended': return 'bg-amber-100 text-amber-700';
    case 'normal': return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const SmartStudy = () => {
  const { isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'topics' | 'schedule'>('topics');
  const [topicFilter, setTopicFilter] = useState<'all' | 'urgent' | 'recommended' | 'bookmarked'>('all');
  const [topics, setTopics] = useState<Topic[]>(topicsData);

  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<string>(dayNames[todayIndex]);

  const filteredTopics = topics.filter((topic) => {
    if (topicFilter === 'all') return true;
    if (topicFilter === 'urgent') return topic.priority === 'urgent';
    if (topicFilter === 'recommended') return topic.priority === 'recommended';
    if (topicFilter === 'bookmarked') return topic.bookmarked;
    return true;
  });

  const toggleBookmark = (id: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bookmarked: !t.bookmarked } : t))
    );
  };

  const sessions = scheduleData[selectedDay] || [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Brain className="w-7 h-7 text-[#7C3AED]" />
            Smart Study
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            AI-Powered Study Plan
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all">
          <Sparkles className="w-4 h-4" />
          Optimize Plan
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Topics to Review', value: '8', icon: <BookOpen className="w-5 h-5" />, color: 'text-[#7C3AED]', bg: isDark ? 'bg-[#7C3AED]/10' : 'bg-purple-50' },
          { label: 'Study Hours This Week', value: '12.5h', icon: <Clock className="w-5 h-5" />, color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Quizzes Completed', value: '6', icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-500', bg: isDark ? 'bg-green-500/10' : 'bg-green-50' },
          { label: 'Streak', value: '5 days', icon: <Flame className="w-5 h-5" />, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-[2.5rem] ${isDark ? 'bg-card-dark border border-white/5' : 'glass border-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className={`rounded-[2.5rem] flex gap-2 p-2 ${isDark ? 'bg-card-dark border border-white/5' : 'glass border-slate-100'}`}>
        {[
          { id: 'topics' as const, label: 'Topics to Review', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'schedule' as const, label: 'Study Schedule', icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#7C3AED] text-white shadow-md'
                : `${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Topics to Review */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'urgent', 'recommended', 'bookmarked'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTopicFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  topicFilter === filter
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : `${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'} border border-transparent`
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* AI Insight Card */}
          <div className={`p-4 rounded-[2rem] bg-gradient-to-br from-[#7C3AED]/20 to-indigo-500/20 border ${isDark ? 'border-[#7C3AED]/30' : 'border-[#7C3AED]/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Insight</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Focus on Database Normalization and Graph Algorithms today for optimal exam preparation.
                  </p>
                </div>
              </div>
              <button className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-white/60 text-slate-600 hover:bg-white/80'}`}>
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>

          {/* Topic Cards */}
          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`p-4 rounded-[2rem] ${isDark ? 'bg-card-dark border border-white/5' : 'glass border-slate-100'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Priority + Title */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityBadge(topic.priority)}`}>
                        {topic.priority}
                      </span>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {topic.title}
                      </h3>
                    </div>
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {topic.course}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className={`flex justify-between text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span>Progress</span>
                        <span>{topic.progress}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(topic.progress)}`}
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {topic.studyTime}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Layers className="w-3.5 h-3.5" />
                        {topic.flashcards} cards
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <HelpCircle className="w-3.5 h-3.5" />
                        {topic.questions} questions
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Reviewed: {topic.lastReviewed}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 sm:items-end flex-shrink-0">
                    <button
                      onClick={() => toggleBookmark(topic.id)}
                      className={`p-2 rounded-lg transition-all ${
                        topic.bookmarked
                          ? 'text-[#7C3AED] bg-[#7C3AED]/10'
                          : `${isDark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-100'}`
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${topic.bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all">
                      <Play className="w-3.5 h-3.5" />
                      Study Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Study Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Weekly Days Row */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dayNames.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedDay === day
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : idx === todayIndex
                      ? `${isDark ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30' : 'bg-purple-50 text-[#7C3AED] border border-purple-200'}`
                      : `${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`
                }`}
              >
                {dayAbbr[idx]}
              </button>
            ))}
          </div>

          {/* Schedule Sessions */}
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-[2rem] ${isDark ? 'bg-card-dark border border-white/5' : 'glass border-slate-100'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Color Indicator */}
                    <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: session.color }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {session.time}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {session.course}
                        </span>
                      </div>
                      <p className={`text-sm mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {session.topic}
                      </p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionTypeBadgeColor(session.type)}`}>
                        {session.type}
                      </span>
                    </div>

                    {/* Status + Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {session.status === 'completed' && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      {session.status === 'in-progress' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        </div>
                      )}
                      {session.status === 'pending' && (
                        <>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                          </div>
                          <button className="px-3 py-1.5 bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all">
                            Start
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Day State */
            <div className={`flex flex-col items-center justify-center py-16 rounded-[2.5rem] ${isDark ? 'bg-card-dark border border-white/5' : 'glass border-slate-100'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <CalendarOff className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <p className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                No sessions scheduled
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enjoy your day off! 🎉
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Start Study Session', desc: 'Begin focused study', icon: <Play className="w-5 h-5" />, color: 'text-green-500', bg: isDark ? 'bg-green-500/10' : 'bg-green-50' },
              { label: 'Quick Quiz', desc: 'Test your knowledge', icon: <Brain className="w-5 h-5" />, color: 'text-[#7C3AED]', bg: isDark ? 'bg-[#7C3AED]/10' : 'bg-purple-50' },
              { label: 'Flashcards', desc: 'Review with flashcards', icon: <Layers className="w-5 h-5" />, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
            ].map((action, idx) => (
              <button
                key={idx}
                className={`p-4 rounded-[2rem] text-left transition-all hover:shadow-md ${isDark ? 'bg-card-dark border border-white/5 hover:border-white/10' : 'glass border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.bg} ${action.color}`}>
                  {action.icon}
                </div>
                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{action.label}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartStudy;
