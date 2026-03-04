import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Users,
  MessageSquare,
  Send,
  ThumbsUp,
  MessageCircle,
  Pin,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Clock,
  BookOpen,
  Star,
  CheckCircle,
  Image as ImageIcon,
  Paperclip,
  Smile,
  ChevronRight,
} from 'lucide-react';
import { CustomDropdown } from '../../../components/shared/CustomDropdown';
import { useApi, useMutation } from '../../../hooks/useApi';
import { discussionService } from '../../../services/api/discussionService';
import { LoadingSkeleton } from '../../../components/shared';

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  authorRole: 'student' | 'instructor' | 'ta';
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isPinned: boolean;
  isLiked: boolean;
  courseCode: string;
  tags: string[];
}

interface Community {
  id: string;
  courseCode: string;
  courseName: string;
  members: number;
  posts: number;
  lastActivity: string;
  color: string;
  joined: boolean;
}

const communities: Community[] = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    members: 156,
    posts: 234,
    lastActivity: '2 hours ago',
    color: 'bg-blue-500',
    joined: true,
  },
  {
    id: '2',
    courseCode: 'CS201',
    courseName: 'Data Structures & Algorithms',
    members: 128,
    posts: 189,
    lastActivity: '30 min ago',
    color: 'bg-blue-500',
    joined: true,
  },
  {
    id: '3',
    courseCode: 'CS220',
    courseName: 'Database Management Systems',
    members: 98,
    posts: 145,
    lastActivity: '1 hour ago',
    color: 'bg-orange-500',
    joined: true,
  },
  {
    id: '4',
    courseCode: 'CS305',
    courseName: 'Software Engineering Principles',
    members: 112,
    posts: 167,
    lastActivity: '3 hours ago',
    color: 'bg-pink-500',
    joined: true,
  },
  {
    id: '5',
    courseCode: 'CS350',
    courseName: 'Mobile Application Development',
    members: 85,
    posts: 98,
    lastActivity: '5 hours ago',
    color: 'bg-[var(--accent-color)]/100',
    joined: false,
  },
  {
    id: '6',
    courseCode: 'CS401',
    courseName: 'Machine Learning Fundamentals',
    members: 145,
    posts: 256,
    lastActivity: '20 min ago',
    color: 'bg-green-500',
    joined: false,
  },
];

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function CourseCommunity() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const [selectedCommunity, setSelectedCommunity] = useState<string>('CS220');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const { data: threads, loading: loadingThreads, refetch } = useApi(
    () => discussionService.listThreads(),
    []
  );

  const createThreadMutation = useMutation(
    (data: { title: string; content: string }) =>
      discussionService.createThread(data)
  );

  const postsList: Post[] = useMemo(() => {
    if (!threads) return [];
    return threads.map((thread): Post => ({
      id: String(thread.id),
      author: thread.author
        ? `${thread.author.firstName} ${thread.author.lastName}`
        : 'Unknown User',
      authorAvatar: thread.author
        ? `${thread.author.firstName?.[0] || ''}${thread.author.lastName?.[0] || ''}`
        : '??',
      authorRole: 'student',
      content: thread.title ? `${thread.title}\n\n${thread.content}` : thread.content,
      timestamp: formatRelativeTime(thread.createdAt),
      likes: likedPosts.has(String(thread.id)) ? 1 : 0,
      replies: thread.replyCount || 0,
      isPinned: thread.isPinned || false,
      isLiked: likedPosts.has(String(thread.id)),
      courseCode: selectedCommunity,
      tags: [],
    }));
  }, [threads, selectedCommunity, likedPosts]);

  const filterOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'question', label: 'Questions' },
    { value: 'help', label: 'Help Needed' },
    { value: 'study-group', label: 'Study Groups' },
    { value: 'tips', label: 'Tips & Resources' },
  ];

  const currentCommunity = communities.find((c) => c.courseCode === selectedCommunity);
  const filteredPosts = postsList
    .filter((p) => p.courseCode === selectedCommunity)
    .filter((p) => filterTag === 'all' || p.tags.includes(filterTag))
    .filter(
      (p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned);
  const regularPosts = filteredPosts.filter((p) => !p.isPinned);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      await createThreadMutation.mutate({
        title: newPostContent.slice(0, 100),
        content: newPostContent,
      });
      setNewPostContent('');
      refetch();
    } catch {
      // Error is captured in createThreadMutation.error
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ta':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return '';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'Instructor';
      case 'ta':
        return 'TA';
      default:
        return '';
    }
  };

  if (loadingThreads) {
    return <LoadingSkeleton variant="card" count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Connect & Collaborate
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Join discussions, ask questions, and learn together with your classmates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Communities Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                My Communities
              </h3>
            </div>
            <div className="p-2">
              {communities
                .filter((c) => c.joined)
                .map((community) => (
                  <button
                    key={community.id}
                    onClick={() => setSelectedCommunity(community.courseCode)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      selectedCommunity === community.courseCode
                        ? 'bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)]/20'
                        : `${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} border-2 border-transparent`
                    }`}
                  >
                    <div
                      className={`w-10 h-10 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {community.courseCode.slice(-3)}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {community.courseCode}
                      </p>
                      <p className="text-xs text-slate-500">{community.members} members</p>
                    </div>
                    {selectedCommunity === community.courseCode && (
                      <ChevronRight className="w-4 h-4 text-[var(--accent-color)]" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Discover Communities */}
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Discover
              </h3>
            </div>
            <div className="p-2">
              {communities
                .filter((c) => !c.joined)
                .map((community) => (
                  <div
                    key={community.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all`}
                  >
                    <div
                      className={`w-10 h-10 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {community.courseCode.slice(-3)}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {community.courseCode}
                      </p>
                      <p className="text-xs text-slate-500">{community.members} members</p>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium text-[var(--accent-color)] bg-[var(--accent-color)]/10 rounded-lg hover:bg-[var(--accent-color)]/10 transition-all">
                      Join
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Community Header */}
          {currentCommunity && (
            <div className="glass rounded-[2.5rem] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 ${currentCommunity.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {currentCommunity.courseCode.slice(-3)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {currentCommunity.courseName}
                    </h2>
                    <div
                      className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}
                    >
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {currentCommunity.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {currentCommunity.posts} posts
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Active {currentCommunity.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-all`}
                >
                  <MoreVertical
                    className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Create Post */}
          <div
            className={`glass rounded-[2rem] p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-color)] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                TM
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share something with your classmates..."
                  rows={3}
                  className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'} border-2 rounded-2xl focus:outline-none focus:border-[var(--accent-color)] resize-none transition-all`}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      className={`p-2 ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} rounded-lg transition-all`}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      className={`p-2 ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} rounded-lg transition-all`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      className={`p-2 ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} rounded-lg transition-all`}
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPostContent.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-[var(--accent-color)] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span className="font-medium">Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div
            className={`glass relative z-30 rounded-[2rem] p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search
                  className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400 group-focus-within:text-[var(--accent-color)]'}`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'} border-2 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-all`}
                />
              </div>
              <div className="w-full md:w-56">
                <CustomDropdown
                  label=""
                  placeholder="All Posts"
                  options={filterOptions}
                  value={filterTag}
                  onChange={setFilterTag}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-3">
              <h3
                className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} flex items-center gap-2 px-1`}
              >
                <Pin className="w-4 h-4" />
                Pinned Posts
              </h3>
              {pinnedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  getRoleBadge={getRoleBadge}
                  getRoleLabel={getRoleLabel}
                  isDark={isDark}
                />
              ))}
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-3">
            {pinnedPosts.length > 0 && (
              <h3
                className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} px-1`}
              >
                Recent Posts
              </h3>
            )}
            {regularPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                getRoleBadge={getRoleBadge}
                getRoleLabel={getRoleLabel}
                isDark={isDark}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="glass rounded-[2.5rem] p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3
                  className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}
                >
                  No posts yet
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Be the first to start a discussion!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  onLike,
  getRoleBadge,
  getRoleLabel,
  isDark,
}: {
  post: Post;
  onLike: (id: string) => void;
  getRoleBadge: (role: string) => string;
  getRoleLabel: (role: string) => string;
  isDark: boolean;
}) {
  return (
    <div
      className={`glass rounded-xl border-2 p-5 transition-all hover:shadow-md ${
        post.isPinned
          ? isDark
            ? 'border-amber-700/50 bg-amber-900/20'
            : 'border-amber-200 bg-amber-50/30'
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              post.authorRole === 'instructor'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : post.authorRole === 'ta'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
            }`}
          >
            {post.authorAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {post.author}
              </span>
              {post.authorRole !== 'student' && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(post.authorRole)}`}
                >
                  {getRoleLabel(post.authorRole)}
                </span>
              )}
              {post.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
            </div>
            <span className="text-xs text-slate-500">{post.timestamp}</span>
          </div>
        </div>
        <button
          className={`p-1 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded transition-all`}
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <p className={`${isDark ? 'text-white' : 'text-slate-800'} mb-4 whitespace-pre-wrap`}>
        {post.content}
      </p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-50 text-slate-600'} rounded text-xs`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        className={`flex items-center gap-4 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
      >
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            post.isLiked
              ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
              : `${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-600'} transition-all`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{post.replies} replies</span>
        </button>
      </div>
    </div>
  );
}

export default CourseCommunity;