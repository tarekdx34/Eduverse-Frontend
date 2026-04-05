import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Users,
  MessageSquare,
  Send,
  Pin,
  Search,
  Plus,
  MoreVertical,
  Clock,
  Lock,
  ChevronRight,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { CustomDropdown } from '../../../components/shared/CustomDropdown';
import {
  discussionService,
  type DiscussionDetailResponse,
  type DiscussionReply,
  type DiscussionThread,
} from '../../../services/api/discussionService';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const normalizeDiscussions = (
  payload: DiscussionThread[] | { data?: DiscussionThread[] } | undefined
) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
};

export function CourseCommunity() {
  const { isDark, primaryHex } = useTheme() as any;
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, DiscussionDetailResponse>>({});
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionThread | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDiscussions = useCallback(async (courseId?: string) => {
    try {
      setLoading(true);
      const response = await discussionService.getDiscussions(courseId ? { courseId } : undefined);
      setDiscussions(normalizeDiscussions(response as DiscussionThread[]));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const courseId = selectedCommunity === 'all' ? undefined : selectedCommunity;
    void loadDiscussions(courseId);
  }, [selectedCommunity, loadDiscussions]);

  const communities = useMemo(() => {
    const ids = Array.from(new Set(discussions.map((discussion) => discussion.courseId))).sort(
      (a, b) => Number(a) - Number(b)
    );
    return ids.map((id) => ({
      id: String(id),
      courseCode: `Course #${id}`,
      members: 0,
      posts: discussions.filter((d) => d.courseId === id).length,
      lastActivity: 'recently',
      color: 'bg-blue-500',
      joined: true,
    }));
  }, [discussions]);

  const filterOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'locked', label: 'Locked' },
  ];

  const filteredPosts = useMemo(
    () =>
      discussions
        .filter((discussion) => {
          const searchable = `${discussion.title} ${discussion.description ?? ''}`.toLowerCase();
          const matchSearch = searchable.includes(searchQuery.toLowerCase());
          if (!matchSearch) return false;

          if (filterTag === 'pinned') return discussion.isPinned === 1;
          if (filterTag === 'locked') return discussion.isLocked === 1;
          return true;
        })
        .sort((a, b) => {
          if (a.isPinned === 1 && b.isPinned !== 1) return -1;
          if (a.isPinned !== 1 && b.isPinned === 1) return 1;
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        }),
    [discussions, filterTag, searchQuery]
  );

  const pinnedPosts = filteredPosts.filter((post) => post.isPinned === 1);
  const regularPosts = filteredPosts.filter((post) => post.isPinned !== 1);

  const selectedCourseId = selectedCommunity === 'all' ? communities[0]?.id : selectedCommunity;

  const handlePost = async () => {
    if (!newTitle.trim() || !selectedCourseId) {
      toast.error('Title is required');
      return;
    }

    try {
      await discussionService.createDiscussion({
        courseId: Number(selectedCourseId),
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      toast.success('Discussion posted');
      setNewTitle('');
      setNewDescription('');
      await loadDiscussions(selectedCommunity === 'all' ? undefined : selectedCommunity);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    const loadSelectedDiscussion = async () => {
      if (!selectedDiscussion) return;
      if (detailsById[selectedDiscussion.id]) return;
      try {
        const detail = await discussionService.getDiscussion(selectedDiscussion.id);
        setDetailsById((prev) => ({ ...prev, [selectedDiscussion.id]: detail }));
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };
    void loadSelectedDiscussion();
  }, [selectedDiscussion, detailsById]);

  const handleReply = async () => {
    if (!selectedDiscussion || !replyText.trim()) return;

    try {
      await discussionService.replyToDiscussion(selectedDiscussion.id, replyText.trim());
      const updatedDetail = await discussionService.getDiscussion(selectedDiscussion.id);
      setDetailsById((prev) => ({ ...prev, [selectedDiscussion.id]: updatedDetail }));
      setDiscussions((prev) =>
        prev.map((discussion) =>
          discussion.id === selectedDiscussion.id
            ? { ...discussion, replyCount: (discussion.replyCount ?? 0) + 1 }
            : discussion
        )
      );
      setReplyText('');
      toast.success('Reply added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Connect & Collaborate
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Join discussions, ask questions, and learn together with your classmates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              <button
                onClick={() => setSelectedCommunity('all')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedCommunity === 'all' ? 'bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)]/20' : `${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} border-2 border-transparent`}`}
              >
                <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  ALL
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    All Courses
                  </p>
                </div>
              </button>
              {communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunity(community.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedCommunity === community.id ? 'bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)]/20' : `${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} border-2 border-transparent`}`}
                >
                  <div
                    className={`w-10 h-10 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {community.courseCode.split('#')[1]}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {community.courseCode}
                    </p>
                    <p className="text-xs text-slate-500">{community.posts} discussions</p>
                  </div>
                  {selectedCommunity === community.id && (
                    <ChevronRight className="w-4 h-4 text-[var(--accent-color)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {!selectedDiscussion && (
            <>
              <div
                className={`glass rounded-[2rem] p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <div className="space-y-3">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Discussion title"
                    className={`w-full px-4 py-2 border-2 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Share something with your classmates..."
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-2xl resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handlePost}
                      className="flex items-center gap-2 px-5 py-2 bg-[var(--accent-color)] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4" /> <span className="font-medium">Post</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`glass relative z-30 rounded-[2rem] p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Search
                      className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
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

              {loading ? (
                <div className="glass rounded-[2.5rem] p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-500" />
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Loading discussions...
                  </p>
                </div>
              ) : (
                <>
                  {pinnedPosts.length > 0 && (
                    <div className="space-y-3">
                      <h3
                        className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} flex items-center gap-2 px-1`}
                      >
                        <Pin className="w-4 h-4" /> Pinned Posts
                      </h3>
                      {pinnedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onOpen={(discussion) => setSelectedDiscussion(discussion)}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {regularPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpen={(discussion) => setSelectedDiscussion(discussion)}
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
                </>
              )}
            </>
          )}

          {selectedDiscussion && detailsById[selectedDiscussion.id] && (
            <div
              className={`glass rounded-[2rem] p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <button
                type="button"
                onClick={() => setSelectedDiscussion(null)}
                className="mb-3 text-sm text-blue-600"
              >
                ← Back to discussions
              </button>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {detailsById[selectedDiscussion.id].thread.title}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {detailsById[selectedDiscussion.id].thread.description}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {detailsById[selectedDiscussion.id].thread.replyCount} replies •{' '}
                {detailsById[selectedDiscussion.id].thread.viewCount} views
              </p>
              {detailsById[selectedDiscussion.id].thread.isLocked === 1 && (
                <div
                  className={`mt-2 px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}
                >
                  🔒 This discussion is locked. Replies are disabled.
                </div>
              )}
              <div className="mt-4 space-y-3">
                {detailsById[selectedDiscussion.id].replies.data.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    No replies yet. Be the first to reply!
                  </p>
                ) : (
                  [...detailsById[selectedDiscussion.id].replies.data]
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
                    )
                    .map((reply: DiscussionReply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'} ${reply.parentMessageId ? 'ml-6 border-l-2 border-indigo-300/40' : ''}`}
                      >
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span>User #{reply.userId}</span>
                          {reply.isAnswer === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700">
                              <CheckCircle size={10} />✓ Accepted Answer
                            </span>
                          )}
                          {reply.isEndorsed === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              <ShieldCheck size={10} />
                              Endorsed
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {reply.messageText}
                        </p>
                        <div className="text-xs text-slate-500 mt-1">
                          {reply.upvoteCount ?? 0} upvotes •{' '}
                          {new Date(reply.createdAt ?? Date.now()).toLocaleString()}
                        </div>
                      </div>
                    ))
                )}
              </div>

              {detailsById[selectedDiscussion.id].thread.isLocked !== 1 && (
                <div className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Write a reply..."
                    className={`w-full px-4 py-2 border rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: primaryHex || '#3b82f6' }}
                    >
                      <Send className="w-4 h-4 inline mr-1" /> Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  onOpen,
  isDark,
}: {
  post: DiscussionThread;
  onOpen: (discussion: DiscussionThread) => void;
  isDark: boolean;
}) {
  return (
    <div
      onClick={() => onOpen(post)}
      className={`glass rounded-xl border-2 p-5 transition-all hover:shadow-md cursor-pointer ${post.isPinned === 1 ? (isDark ? 'border-amber-700/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50/30') : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {post.title}
            </span>
            {post.isPinned === 1 && <Pin className="w-4 h-4 text-amber-500" />}
            {post.isLocked === 1 && <Lock className="w-4 h-4 text-red-500" />}
          </div>
          <span className="text-xs text-slate-500">
            {new Date(post.createdAt ?? Date.now()).toLocaleString()}
          </span>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpen(post);
          }}
          className={`p-1 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded transition-all`}
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <p className={`${isDark ? 'text-white' : 'text-slate-800'} mb-4 whitespace-pre-wrap`}>
        {post.description}
      </p>

      <div
        className={`flex items-center gap-4 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
      >
        <span className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" /> User #{post.createdBy}
        </span>
        <span className="flex items-center gap-2 text-sm text-slate-500">
          <MessageSquare className="w-4 h-4" /> {post.replyCount ?? 0} replies
        </span>
        <span className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" /> {post.viewCount ?? 0} views
        </span>
      </div>
    </div>
  );
}

export default CourseCommunity;
