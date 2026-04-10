import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Pin,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
  Lock,
  Trash2,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { BackendStatusBanner } from './LiveModeViews';
import { CustomDropdown } from '../../../components/shared';
import {
  discussionService,
  type DiscussionDetailResponse,
  type DiscussionReply,
  type DiscussionThread,
} from '../../../services/api/discussionService';
import { toast } from 'sonner';

interface DiscussionPageProps {
  userRole?: 'ta' | 'instructor';
  userName?: string;
  disableDeleteReason?: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const normalizeDiscussions = (
  payload: DiscussionThread[] | { data?: DiscussionThread[] } | undefined
) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
};

export function DiscussionPage({
  userRole = 'instructor',
  disableDeleteReason,
}: DiscussionPageProps) {
  const { t } = useLanguage();
  const { isDark, primaryHex = '#4f46e5' } = useTheme() as any;

  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, DiscussionDetailResponse>>({});
  const [expandedDiscussions, setExpandedDiscussions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [newDiscussion, setNewDiscussion] = useState({ courseId: '', title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [replyTextByDiscussion, setReplyTextByDiscussion] = useState<Record<string, string>>({});

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
    const courseId = filterCourse === 'all' ? undefined : filterCourse;
    void loadDiscussions(courseId);
  }, [filterCourse, loadDiscussions]);

  const courseOptions = useMemo(() => {
    const courseIds = Array.from(new Set(discussions.map((d) => d.courseId))).sort(
      (a, b) => Number(a) - Number(b)
    );
    return [
      { value: 'all', label: t('allCourses') },
      ...courseIds.map((id) => ({ value: String(id), label: `Course #${id}` })),
    ];
  }, [discussions, t]);

  const filteredDiscussions = useMemo(
    () =>
      discussions
        .filter((d) => {
          const target = `${d.title} ${d.description ?? ''}`.toLowerCase();
          return target.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
          if (a.isPinned === 1 && b.isPinned !== 1) return -1;
          if (a.isPinned !== 1 && b.isPinned === 1) return 1;
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        }),
    [discussions, searchQuery]
  );

  const openCount = discussions.filter((d) => d.isLocked !== 1).length;
  const lockedCount = discussions.filter((d) => d.isLocked === 1).length;

  const toggleExpand = async (id: string) => {
    setExpandedDiscussions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (!detailsById[id]) {
      try {
        const detail = await discussionService.getDiscussion(id);
        setDetailsById((prev) => ({ ...prev, [id]: detail }));
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.courseId) {
      toast.error('Course and title are required');
      return;
    }

    try {
      setCreating(true);
      await discussionService.createDiscussion({
        courseId: Number(newDiscussion.courseId),
        title: newDiscussion.title.trim(),
        description: newDiscussion.description.trim() || undefined,
      });
      toast.success('Discussion created');
      setNewDiscussion({ courseId: '', title: '', description: '' });
      await loadDiscussions(filterCourse === 'all' ? undefined : filterCourse);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const refreshDetail = async (id: string) => {
    const detail = await discussionService.getDiscussion(id);
    setDetailsById((prev) => ({ ...prev, [id]: detail }));
  };

  const handlePinToggle = async (discussion: DiscussionThread) => {
    try {
      await discussionService.pinDiscussion(discussion.id, discussion.isPinned !== 1);
      toast.success(discussion.isPinned === 1 ? 'Discussion unpinned' : 'Discussion pinned');
      await loadDiscussions(filterCourse === 'all' ? undefined : filterCourse);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLockToggle = async (discussion: DiscussionThread) => {
    try {
      await discussionService.lockDiscussion(discussion.id, discussion.isLocked !== 1);
      toast.success(discussion.isLocked === 1 ? 'Discussion unlocked' : 'Discussion locked');
      await loadDiscussions(filterCourse === 'all' ? undefined : filterCourse);
      if (detailsById[discussion.id]) {
        await refreshDetail(discussion.id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (discussionId: string) => {
    try {
      await discussionService.deleteDiscussion(discussionId);
      toast.success('Discussion deleted');
      await loadDiscussions(filterCourse === 'all' ? undefined : filterCourse);
      setExpandedDiscussions((prev) => {
        const next = new Set(prev);
        next.delete(discussionId);
        return next;
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReply = async (discussionId: string) => {
    const messageText = replyTextByDiscussion[discussionId]?.trim();
    if (!messageText) return;

    try {
      await discussionService.replyToDiscussion(discussionId, messageText);
      toast.success('Reply sent');
      setReplyTextByDiscussion((prev) => ({ ...prev, [discussionId]: '' }));
      await refreshDetail(discussionId);
      await loadDiscussions(filterCourse === 'all' ? undefined : filterCourse);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('discussions')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {userRole === 'instructor' && (
            <button
              onClick={() => {
                const element = document.getElementById('new-discussion-form');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              {t('startDiscussion')}
            </button>
          )}
        </div>
      </div>

      {disableDeleteReason && <BackendStatusBanner message={disableDeleteReason} />}

      <div
        className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm ${
          isDark ? 'border-white/10 bg-slate-900/50' : 'border-gray-200 bg-white'
        } sm:flex-row sm:items-center`}
      >
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('discussionForum')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {t('respondToQuestions')}
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className={`border rounded-lg px-4 py-2 ${isDark ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200'}`}
          >
            <span
              className={`text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-900'}`}
            >
              {openCount}
            </span>
            <span className={`text-sm ml-1 ${isDark ? 'text-orange-500' : 'text-orange-700'}`}>
              Open
            </span>
          </div>
          <div
            className={`border rounded-lg px-4 py-2 ${isDark ? 'bg-gray-700/30 border-gray-600/30' : 'bg-gray-50 border-gray-200'}`}
          >
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              {lockedCount}
            </span>
            <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Locked
            </span>
          </div>
        </div>
      </div>

      <div
        className={`border rounded-lg p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <CustomDropdown
            value={newDiscussion.courseId}
            onChange={(value) => setNewDiscussion((prev) => ({ ...prev, courseId: value }))}
            options={courseOptions.filter((option) => option.value !== 'all')}
            className="w-full"
            isDark={isDark}
          />
          <input
            type="text"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Discussion title"
            className={`md:col-span-1 px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <input
            type="text"
            value={newDiscussion.description}
            onChange={(e) => setNewDiscussion((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Discussion description"
            className={`md:col-span-2 px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleCreateDiscussion}
            disabled={creating}
            className="px-4 py-2 text-white rounded-lg text-sm"
            style={{ backgroundColor: primaryHex }}
          >
            {creating ? 'Creating...' : 'Create Discussion'}
          </button>
        </div>
      </div>

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
              className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
          </div>
          <CustomDropdown
            value={filterCourse}
            onChange={setFilterCourse}
            options={courseOptions}
            className="w-full md:w-auto"
            isDark={isDark}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div
            className={`text-center py-12 border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Loading discussions...
          </div>
        ) : (
          filteredDiscussions.map((discussion) => {
            const isExpanded = expandedDiscussions.has(discussion.id);
            const detail = detailsById[discussion.id];
            const thread = detail?.thread;
            const replies = detail?.replies?.data ?? [];

            return (
              <div
                key={discussion.id}
                className={`border rounded-lg overflow-hidden ${isDark ? 'bg-white/5' : 'bg-white'} ${discussion.isPinned === 1 ? 'border-blue-200' : isDark ? 'border-white/10' : 'border-gray-200'}`}
              >
                <div
                  className={`p-4 sm:p-6 cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleExpand(discussion.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {discussion.isPinned === 1 && <Pin size={14} className="text-blue-600" />}
                        {discussion.isLocked === 1 && <Lock size={14} className="text-red-500" />}
                        <h3
                          className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {discussion.title}
                        </h3>
                      </div>
                      <p
                        className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                      >
                        {discussion.description}
                      </p>
                      <div
                        className={`flex items-center gap-4 mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                      >
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>User #{discussion.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen size={12} />
                          <span>Course #{discussion.courseId}</span>
                        </div>
                        <span>
                          {new Date(discussion.createdAt ?? Date.now()).toLocaleDateString()}
                        </span>
                        <span>{discussion.replyCount ?? replies.length} replies</span>
                        <span>{discussion.viewCount ?? 0} views</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    {thread && (
                      <div
                        className={`px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}
                      >
                        <h4
                          className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {thread.title}
                        </h4>
                        <p
                          className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                        >
                          {thread.description || 'No description provided.'}
                        </p>
                        <div
                          className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                        >
                          {thread.replyCount} replies • {thread.viewCount} views
                        </div>
                      </div>
                    )}
                    {discussion.isLocked === 1 && (
                      <div
                        className={`px-6 py-3 text-sm ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}
                      >
                        This thread is locked. Replies are disabled.
                      </div>
                    )}

                    <div
                      className={`p-4 sm:p-6 flex gap-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                    >
                      <button
                        onClick={() => handlePinToggle(discussion)}
                        className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white"
                      >
                        {discussion.isPinned === 1 ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleLockToggle(discussion)}
                        className="text-xs px-3 py-1 rounded-lg bg-slate-600 text-white"
                      >
                        {discussion.isLocked === 1 ? 'Unlock' : 'Lock'}
                      </button>
                      <button
                        onClick={() => {
                          if (disableDeleteReason) return;
                          handleDelete(discussion.id);
                        }}
                        disabled={Boolean(disableDeleteReason)}
                        title={disableDeleteReason || undefined}
                        className="text-xs px-3 py-1 rounded-lg bg-red-600 text-white flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={12} /> {t('delete') || 'Delete'}
                      </button>
                    </div>

                    {replies.length === 0 ? (
                      <div
                        className={`px-6 py-5 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
                      >
                        Be the first to reply!
                      </div>
                    ) : (
                      <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-100'}`}>
                        {replies.map((reply: DiscussionReply) => (
                          <div
                            key={reply.id}
                            className={`p-6 ${reply.parentMessageId ? 'ml-6 border-l-2 border-indigo-300/40' : ''}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                              >
                                User #{reply.userId}
                              </span>
                              {reply.isAnswer === 1 && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}
                                >
                                  <CheckCircle size={10} /> Answer
                                </span>
                              )}
                              {reply.isEndorsed === 1 && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
                                >
                                  <ShieldCheck size={10} /> Endorsed
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              {reply.messageText}
                            </p>
                            <div
                              className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                            >
                              <span>
                                {new Date(reply.createdAt ?? Date.now()).toLocaleString()}
                              </span>
                              <span>Upvotes: {reply.upvoteCount ?? 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {discussion.isLocked !== 1 && (
                      <div
                        className={`p-6 border-t ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <textarea
                          value={replyTextByDiscussion[discussion.id] ?? ''}
                          onChange={(e) =>
                            setReplyTextByDiscussion((prev) => ({
                              ...prev,
                              [discussion.id]: e.target.value,
                            }))
                          }
                          placeholder={t('writeReplyPlaceholder')}
                          rows={3}
                          className={`w-full px-4 py-2 border rounded-lg resize-none text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleReply(discussion.id)}
                            disabled={!replyTextByDiscussion[discussion.id]?.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            style={{ backgroundColor: primaryHex }}
                          >
                            <Send size={14} />
                            {t('reply')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!loading && filteredDiscussions.length === 0 && (
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
