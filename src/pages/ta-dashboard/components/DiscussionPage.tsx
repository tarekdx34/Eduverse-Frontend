import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  Pin,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CustomDropdown } from '../../../components/shared';

type Reply = {
  id: string;
  author: string;
  authorRole: 'student' | 'ta' | 'instructor';
  content: string;
  timestamp: string;
  likes: number;
  isAnswer: boolean;
};

type Discussion = {
  id: string;
  title: string;
  content: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  lab?: string;
  timestamp: string;
  status: 'open' | 'answered' | 'closed';
  pinned: boolean;
  replies: Reply[];
  views: number;
};

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc1',
    title: 'How do I submit multiple files for the lab assignment?',
    content:
      'I have three Python files for Lab 2. The submission portal only seems to accept one file at a time. Should I zip them together or submit each one separately?',
    studentName: 'Fatima Ahmed',
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    lab: 'Lab 2',
    timestamp: '2025-02-22T10:30:00',
    status: 'open',
    pinned: false,
    views: 24,
    replies: [],
  },
  {
    id: 'disc2',
    title: 'Can you explain the linked list implementation?',
    content:
      'I am having trouble understanding how the linked list insert method works. Specifically, how does the pointer update work when inserting at a specific position? The textbook explanation is confusing.',
    studentName: 'Omar Hassan',
    courseCode: 'CS202',
    courseName: 'Data Structures',
    lab: 'Lab 1',
    timestamp: '2025-02-21T15:20:00',
    status: 'answered',
    pinned: true,
    views: 56,
    replies: [
      {
        id: 'rep1',
        author: 'Ahmed Hassan (TA)',
        authorRole: 'ta',
        content:
          "Great question! When inserting at position i, you need to: 1) Traverse to node at position i-1, 2) Create a new node, 3) Set the new node's next pointer to the current node at position i, 4) Update the previous node's (i-1) next pointer to point to the new node. Think of it like inserting a new link in a chain - you have to break the chain at the right spot and reconnect it.",
        timestamp: '2025-02-21T16:00:00',
        likes: 8,
        isAnswer: true,
      },
      {
        id: 'rep2',
        author: 'Omar Hassan',
        authorRole: 'student',
        content: 'Thank you! That chain analogy makes it much clearer. I understand now.',
        timestamp: '2025-02-21T16:15:00',
        likes: 1,
        isAnswer: false,
      },
    ],
  },
  {
    id: 'disc3',
    title: 'Difference between while and for loops?',
    content:
      'In Lab 2 we used both while and for loops. When should I use which one? Are they interchangeable? What are the best practices?',
    studentName: 'Mohamed Ali',
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    lab: 'Lab 2',
    timestamp: '2025-02-22T09:00:00',
    status: 'open',
    pinned: false,
    views: 18,
    replies: [
      {
        id: 'rep3',
        author: 'Layla Mohamed',
        authorRole: 'student',
        content:
          "I had the same question! From what I understand, for loops are better when you know the number of iterations, and while loops when you don't.",
        timestamp: '2025-02-22T09:30:00',
        likes: 3,
        isAnswer: false,
      },
    ],
  },
  {
    id: 'disc4',
    title: 'Lab 1 grading criteria clarification',
    content:
      "I got 88% on Lab 1 but I'm not sure what I lost points on. Could you clarify the grading rubric? Is code style part of the grade?",
    studentName: 'Sara Ibrahim',
    courseCode: 'CS202',
    courseName: 'Data Structures',
    lab: 'Lab 1',
    timestamp: '2025-02-20T14:00:00',
    status: 'answered',
    pinned: false,
    views: 32,
    replies: [
      {
        id: 'rep4',
        author: 'Ahmed Hassan (TA)',
        authorRole: 'ta',
        content:
          'The grading rubric is: Correctness (60%), Code quality & style (20%), Comments & documentation (10%), Edge case handling (10%). Yes, code style is part of the grade. I noticed your solution was missing proper comments on some functions.',
        timestamp: '2025-02-20T15:30:00',
        likes: 12,
        isAnswer: true,
      },
    ],
  },
  {
    id: 'disc5',
    title: 'Sorting algorithm time complexity comparison',
    content:
      'For the upcoming lab, can someone explain why quicksort is preferred over bubble sort even though worst case is the same O(n²)?',
    studentName: 'Ahmed Youssef',
    courseCode: 'CS303',
    courseName: 'Advanced Algorithms',
    timestamp: '2025-02-23T11:00:00',
    status: 'open',
    pinned: false,
    views: 8,
    replies: [],
  },
];

interface DiscussionPageProps {
  userRole?: 'ta' | 'instructor';
  userName?: string;
}

export function DiscussionPage({
  userRole = 'ta',
  userName = 'Ahmed Hassan',
}: DiscussionPageProps) {
  const { t } = useLanguage();
  const { isDark, primaryHex = '#4f46e5' } = useTheme() as any;
  const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS);
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [expandedDiscussions, setExpandedDiscussions] = useState<Set<string>>(new Set());

  const courses = [
    { code: 'CS101', name: 'Introduction to Programming' },
    { code: 'CS202', name: 'Data Structures' },
    { code: 'CS303', name: 'Advanced Algorithms' },
  ];

  const filteredDiscussions = discussions
    .filter((d) => filterCourse === 'all' || d.courseCode === filterCourse)
    .filter((d) => filterStatus === 'all' || d.status === filterStatus)
    .filter(
      (d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const openCount = discussions.filter((d) => d.status === 'open').length;
  const answeredCount = discussions.filter((d) => d.status === 'answered').length;

  const handleReply = (discussionId: string) => {
    if (!replyText.trim()) return;

    const roleLabel = userRole === 'instructor' ? 'Prof.' : '(TA)';
    const newReply: Reply = {
      id: `rep${Date.now()}`,
      author: `${userName} ${roleLabel}`,
      authorRole: userRole,
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      isAnswer: false,
    };

    setDiscussions(
      discussions.map((d) =>
        d.id === discussionId ? { ...d, replies: [...d.replies, newReply] } : d
      )
    );
    setReplyText('');
  };

  const handleMarkAsAnswer = (discussionId: string, replyId: string) => {
    setDiscussions(
      discussions.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              status: 'answered' as const,
              replies: d.replies.map((r) => ({
                ...r,
                isAnswer: r.id === replyId,
              })),
            }
          : d
      )
    );
  };

  const handleTogglePin = (discussionId: string) => {
    setDiscussions(
      discussions.map((d) => (d.id === discussionId ? { ...d, pinned: !d.pinned } : d))
    );
  };

  const handleCloseThread = (discussionId: string) => {
    setDiscussions(
      discussions.map((d) => (d.id === discussionId ? { ...d, status: 'closed' as const } : d))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedDiscussions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800'}`}
          >
            <Clock size={12} /> {t('open')}
          </span>
        );
      case 'answered':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}
          >
            <CheckCircle size={12} /> {t('answered')}
          </span>
        );
      case 'closed':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
          >
            {t('closed')}
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ta':
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}
          >
            {t('ta')}
          </span>
        );
      case 'instructor':
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}
          >
            {t('instructorRole')}
          </span>
        );
      default:
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
          >
            {t('studentRole')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('discussionForum')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('respondToQuestions')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div
            className={`border rounded-lg px-4 py-2 ${isDark ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200'}`}
          >
            <span
              className={`text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-900'}`}
            >
              {openCount}
            </span>
            <span className={`text-sm ml-1 ${isDark ? 'text-orange-500' : 'text-orange-700'}`}>
              {t('open')}
            </span>
          </div>
          <div
            className={`border rounded-lg px-4 py-2 ${isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'}`}
          >
            <span
              className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-900'}`}
            >
              {answeredCount}
            </span>
            <span className={`text-sm ml-1 ${isDark ? 'text-green-500' : 'text-green-700'}`}>
              {t('answered')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
            />
            <input
              type="text"
              placeholder={t('searchDiscussionsPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-white/30' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'}`}
            />
          </div>
          <div className="flex gap-2 min-w-[300px]">
            <div className="flex-1">
              <CustomDropdown
                options={[
                  { value: 'all', label: t('allCourses') },
                  ...courses.map((c) => ({ value: c.code, label: c.code })),
                ]}
                value={filterCourse}
                onChange={setFilterCourse}
                isDark={isDark}
                accentColor={primaryHex}
              />
            </div>
            <div className="flex-1">
              <CustomDropdown
                options={[
                  { value: 'all', label: t('allStatus') },
                  { value: 'open', label: t('open') },
                  { value: 'answered', label: t('answered') },
                  { value: 'closed', label: t('closed') },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                isDark={isDark}
                accentColor={primaryHex}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => {
          const isExpanded = expandedDiscussions.has(discussion.id);

          return (
            <div
              key={discussion.id}
              className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} ${
                discussion.pinned
                  ? 'border-blue-200'
                  : isDark
                    ? 'border-white/10'
                    : 'border-gray-200'
              }`}
            >
              {/* Discussion Header */}
              <div
                className={`p-4 sm:p-6 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                onClick={() => toggleExpand(discussion.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {discussion.pinned && <Pin size={14} className="text-blue-600" />}
                      <h3
                        className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {discussion.title}
                      </h3>
                      {getStatusBadge(discussion.status)}
                    </div>
                    <p
                      className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                    >
                      {discussion.content}
                    </p>
                    <div
                      className={`flex items-center gap-4 mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                    >
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{discussion.studentName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} />
                        <span>
                          {discussion.courseCode}
                          {discussion.lab ? ` • ${discussion.lab}` : ''}
                        </span>
                      </div>
                      <span>{new Date(discussion.timestamp).toLocaleDateString()}</span>
                      <span>
                        {discussion.replies.length} {t('replies')}
                      </span>
                      <span>
                        {discussion.views} {t('views')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  {/* Full Question */}
                  <div className={`p-4 sm:p-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p
                      className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-800'}`}
                    >
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => handleTogglePin(discussion.id)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          discussion.pinned
                            ? isDark
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                            : isDark
                              ? 'bg-white/10 text-white hover:bg-white/20'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {discussion.pinned ? t('unpin') : t('pin')}
                      </button>
                      {discussion.status !== 'closed' && (
                        <button
                          onClick={() => handleCloseThread(discussion.id)}
                          className={`text-xs px-3 py-1 rounded-lg transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {t('closeThread')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {discussion.replies.length > 0 && (
                    <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-100'}`}>
                      {discussion.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-6 ${reply.isAnswer ? (isDark ? 'bg-green-900/20 border-l-4 border-green-500' : 'bg-green-50 border-l-4 border-green-500') : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                reply.authorRole === 'ta'
                                  ? isDark
                                    ? 'bg-blue-900/30'
                                    : 'bg-blue-100'
                                  : reply.authorRole === 'instructor'
                                    ? isDark
                                      ? 'bg-purple-900/30'
                                      : 'bg-purple-100'
                                    : isDark
                                      ? 'bg-gray-700'
                                      : 'bg-gray-100'
                              }`}
                            >
                              <User
                                size={14}
                                className={
                                  reply.authorRole === 'ta'
                                    ? 'text-blue-600'
                                    : reply.authorRole === 'instructor'
                                      ? 'text-purple-600'
                                      : 'text-gray-600'
                                }
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                                >
                                  {reply.author}
                                </span>
                                {getRoleBadge(reply.authorRole)}
                                {reply.isAnswer && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}
                                  >
                                    <CheckCircle size={10} /> {t('acceptedAnswer')}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                              >
                                {reply.content}
                              </p>
                              <div
                                className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                              >
                                <span>{new Date(reply.timestamp).toLocaleString()}</span>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp size={12} />
                                  <span>{reply.likes}</span>
                                </div>
                                {!reply.isAnswer && discussion.status !== 'closed' && (
                                  <button
                                    onClick={() => handleMarkAsAnswer(discussion.id, reply.id)}
                                    className="text-green-600 hover:text-green-700 font-medium"
                                  >
                                    {t('markAsAnswer')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Box */}
                  {discussion.status !== 'closed' && (
                    <div
                      className={`p-6 border-t ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}
                        >
                          <User size={14} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={selectedDiscussion === discussion.id ? replyText : ''}
                            onFocus={() => setSelectedDiscussion(discussion.id)}
                            onChange={(e) => {
                              setSelectedDiscussion(discussion.id);
                              setReplyText(e.target.value);
                            }}
                            placeholder={t('writeReplyPlaceholder')}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors resize-none text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-white/30' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'}`}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleReply(discussion.id)}
                              disabled={!replyText.trim() || selectedDiscussion !== discussion.id}
                              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${!replyText.trim() || selectedDiscussion !== discussion.id ? (isDark ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-gray-300 opacity-50 cursor-not-allowed') : 'hover:opacity-90'}`}
                              style={
                                replyText.trim() && selectedDiscussion === discussion.id
                                  ? { backgroundColor: primaryHex }
                                  : undefined
                              }
                            >
                              <Send size={14} />
                              {t('reply')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredDiscussions.length === 0 && (
        <div
          className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
        >
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>{t('noDiscussionsFound')}</p>
        </div>
      )}
    </div>
  );
}

export default DiscussionPage;
