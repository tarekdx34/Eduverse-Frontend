import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

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
  { id: '1', courseCode: 'CS101', courseName: 'Introduction to Computer Science', members: 156, posts: 234, lastActivity: '2 hours ago', color: 'bg-blue-500', joined: true },
  { id: '2', courseCode: 'CS201', courseName: 'Data Structures & Algorithms', members: 128, posts: 189, lastActivity: '30 min ago', color: 'bg-purple-500', joined: true },
  { id: '3', courseCode: 'CS220', courseName: 'Database Management Systems', members: 98, posts: 145, lastActivity: '1 hour ago', color: 'bg-orange-500', joined: true },
  { id: '4', courseCode: 'CS305', courseName: 'Software Engineering Principles', members: 112, posts: 167, lastActivity: '3 hours ago', color: 'bg-pink-500', joined: true },
  { id: '5', courseCode: 'CS350', courseName: 'Mobile Application Development', members: 85, posts: 98, lastActivity: '5 hours ago', color: 'bg-indigo-500', joined: false },
  { id: '6', courseCode: 'CS401', courseName: 'Machine Learning Fundamentals', members: 145, posts: 256, lastActivity: '20 min ago', color: 'bg-green-500', joined: false },
];

const posts: Post[] = [
  {
    id: '1',
    author: 'Prof. Sarah Johnson',
    authorAvatar: 'SJ',
    authorRole: 'instructor',
    content: '📢 Important: The deadline for the Database Design Project has been extended to December 10th. Please make sure to review the updated requirements in the assignment description.',
    timestamp: '2 hours ago',
    likes: 45,
    replies: 12,
    isPinned: true,
    isLiked: false,
    courseCode: 'CS220',
    tags: ['announcement', 'deadline']
  },
  {
    id: '2',
    author: 'Ahmed Hassan',
    authorAvatar: 'AH',
    authorRole: 'student',
    content: 'Can someone explain the difference between 2NF and 3NF in database normalization? I\'m having trouble understanding when to apply each one.',
    timestamp: '4 hours ago',
    likes: 23,
    replies: 8,
    isPinned: false,
    isLiked: true,
    courseCode: 'CS220',
    tags: ['question', 'help']
  },
  {
    id: '3',
    author: 'TA Michael Chen',
    authorAvatar: 'MC',
    authorRole: 'ta',
    content: '📚 Study Session Reminder: We\'ll be holding a review session for the upcoming midterm on Friday at 4 PM in Lab 302. Topics will include: joins, subqueries, and normalization. All are welcome!',
    timestamp: '6 hours ago',
    likes: 67,
    replies: 15,
    isPinned: true,
    isLiked: false,
    courseCode: 'CS220',
    tags: ['study-session', 'exam-prep']
  },
  {
    id: '4',
    author: 'Emma Wilson',
    authorAvatar: 'EW',
    authorRole: 'student',
    content: 'Just finished the SQL exercises! Here\'s a tip for anyone struggling with JOIN queries: always visualize your tables first and identify the common columns. It makes writing the query much easier.',
    timestamp: '1 day ago',
    likes: 34,
    replies: 6,
    isPinned: false,
    isLiked: false,
    courseCode: 'CS220',
    tags: ['tips', 'sql']
  },
  {
    id: '5',
    author: 'James Wilson',
    authorAvatar: 'JW',
    authorRole: 'student',
    content: 'Is anyone interested in forming a study group for the final exam? I was thinking we could meet twice a week at the library.',
    timestamp: '1 day ago',
    likes: 28,
    replies: 11,
    isPinned: false,
    isLiked: true,
    courseCode: 'CS220',
    tags: ['study-group']
  }
];

export function CourseCommunity() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>('CS220');
  const [postsList, setPostsList] = useState<Post[]>(posts);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const currentCommunity = communities.find(c => c.courseCode === selectedCommunity);
  const filteredPosts = postsList
    .filter(p => p.courseCode === selectedCommunity)
    .filter(p => filterTag === 'all' || p.tags.includes(filterTag))
    .filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 p.author.toLowerCase().includes(searchQuery.toLowerCase()));

  const pinnedPosts = filteredPosts.filter(p => p.isPinned);
  const regularPosts = filteredPosts.filter(p => !p.isPinned);

  const handleLike = (postId: string) => {
    setPostsList(postsList.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: `${Date.now()}`,
      author: 'Tarek Mohamed',
      authorAvatar: 'TM',
      authorRole: 'student',
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
      isPinned: false,
      isLiked: false,
      courseCode: selectedCommunity,
      tags: []
    };
    
    setPostsList([newPost, ...postsList]);
    setNewPostContent('');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ta':
        return 'bg-purple-100 text-purple-700 border-purple-200';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Course Communities</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Connect & Collaborate</h1>
        <p className="text-indigo-100 text-lg">Join discussions, ask questions, and learn together with your classmates</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">Communities Joined</p>
            <p className="text-2xl font-bold">{communities.filter(c => c.joined).length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">Your Posts</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">Helpful Answers</p>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Communities Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">My Communities</h3>
            </div>
            <div className="p-2">
              {communities.filter(c => c.joined).map((community) => (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunity(community.courseCode)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedCommunity === community.courseCode
                      ? 'bg-indigo-50 border-2 border-indigo-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {community.courseCode.slice(-3)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{community.courseCode}</p>
                    <p className="text-xs text-gray-500">{community.members} members</p>
                  </div>
                  {selectedCommunity === community.courseCode && (
                    <ChevronRight className="w-4 h-4 text-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Discover Communities */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Discover</h3>
            </div>
            <div className="p-2">
              {communities.filter(c => !c.joined).map((community) => (
                <div
                  key={community.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className={`w-10 h-10 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {community.courseCode.slice(-3)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{community.courseCode}</p>
                    <p className="text-xs text-gray-500">{community.members} members</p>
                  </div>
                  <button className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all">
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
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${currentCommunity.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                    {currentCommunity.courseCode.slice(-3)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentCommunity.courseName}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Create Post */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                TM
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share something with your classmates..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none transition-all"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPostContent.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">All Posts</option>
                <option value="announcement">Announcements</option>
                <option value="question">Questions</option>
                <option value="help">Help Needed</option>
                <option value="study-group">Study Groups</option>
                <option value="tips">Tips & Resources</option>
              </select>
            </div>
          </div>

          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2 px-1">
                <Pin className="w-4 h-4" />
                Pinned Posts
              </h3>
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} getRoleBadge={getRoleBadge} getRoleLabel={getRoleLabel} />
              ))}
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-3">
            {pinnedPosts.length > 0 && (
              <h3 className="text-sm font-semibold text-gray-600 px-1">Recent Posts</h3>
            )}
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} getRoleBadge={getRoleBadge} getRoleLabel={getRoleLabel} />
            ))}
            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onLike, getRoleBadge, getRoleLabel }: { 
  post: Post; 
  onLike: (id: string) => void;
  getRoleBadge: (role: string) => string;
  getRoleLabel: (role: string) => string;
}) {
  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
      post.isPinned ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            post.authorRole === 'instructor' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
            post.authorRole === 'ta' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
            'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            {post.authorAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.author}</span>
              {post.authorRole !== 'student' && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(post.authorRole)}`}>
                  {getRoleLabel(post.authorRole)}
                </span>
              )}
              {post.isPinned && (
                <Pin className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <span className="text-xs text-gray-500">{post.timestamp}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded transition-all">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            post.isLiked 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-all">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{post.replies} replies</span>
        </button>
      </div>
    </div>
  );
}

export default CourseCommunity;
