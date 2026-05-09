import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, X, Layers, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ConfirmDialog, LoadingSkeleton } from '../shared';
import ChapterService, { CourseChapter } from '../../services/api/chapterService';
import QuestionBankService from '../../services/api/questionBankService';
import { CheckCircle2 } from 'lucide-react';

interface ChapterManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  onChapterChange: () => void;
}

interface ChapterWithCount extends CourseChapter {
  questionCount?: number;
}

export const ChapterManagerDrawer: React.FC<ChapterManagerDrawerProps> = ({
  open,
  onOpenChange,
  courseId,
  onChapterChange,
}) => {
  const [chapters, setChapters] = useState<ChapterWithCount[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; chapterId: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);

        // Load chapters
        const chaptersData = await ChapterService.listByCourse(courseId);
        if (!mounted) return;
        const safeChapters = Array.isArray(chaptersData) ? chaptersData : [];
        setChapters(safeChapters);

        // Load question counts
        try {
          const countsData = await QuestionBankService.getChapterCounts(courseId);
          if (!mounted) return;
          if (countsData && typeof countsData === 'object') {
            setChapterCounts(countsData as Record<number, number>);
          }
        } catch {
          // If counts fail to load, continue anyway
          if (mounted) {
            setChapterCounts({});
          }
        }
      } catch (err) {
        if (!mounted) return;
        toast.error(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();
    return () => {
      mounted = false;
    };
  }, [open, courseId]);

  const handleStartEdit = (chapter: CourseChapter) => {
    setEditingId(chapter.id);
    setEditingName(chapter.name);
  };

  const handleSaveEdit = async (chapterId: number) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      toast.error('Chapter name cannot be empty');
      return;
    }

    try {
      setActionLoading(`edit-${chapterId}`);
      await ChapterService.update(courseId, chapterId, { name: trimmedName });
      setChapters((prev) =>
        prev.map((ch) => (ch.id === chapterId ? { ...ch, name: trimmedName } : ch))
      );
      toast.success('Chapter renamed');
      setEditingId(null);
      setEditingName('');
      onChapterChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename chapter');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    try {
      setActionLoading(`delete-${chapterId}`);
      await ChapterService.delete(courseId, chapterId);
      setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
      toast.success('Chapter deleted');
      setConfirmDelete(null);
      onChapterChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete chapter');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddChapter = async () => {
    const trimmedName = newChapterName.trim();
    if (!trimmedName) {
      toast.error('Chapter name cannot be empty');
      return;
    }

    try {
      setActionLoading('add');
      const newChapter = await ChapterService.create(courseId, { name: trimmedName });
      setChapters((prev) => [...prev, newChapter]);
      toast.success('Chapter added');
      setNewChapterName('');
      onChapterChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add chapter');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!actionLoading) {
      setEditingId(null);
      setEditingName('');
      setNewChapterName('');
      setConfirmDelete(null);
      onOpenChange(newOpen);
    }
  };

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden ${isDark ? 'bg-slate-950 border-white/10 shadow-2xl shadow-indigo-500/10' : 'bg-white border-slate-200'}`}>
          <DialogHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Layers size={20} />
              </div>
              <DialogTitle className={`text-xl font-bold tracking-tight ${headingClass}`}>Curriculum Architect</DialogTitle>
            </div>
            <DialogDescription className={`text-sm ${subTextClass}`}>
              Structure your course by defining thematic chapters and modules.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[60px] mb-2 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                ))}
              </div>
            ) : chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No chapters yet — add your first chapter
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => {
                  const isEditing = editingId === chapter.id;
                  const questionCount = chapterCounts[chapter.id] ?? 0;
                  const isActioning = actionLoading?.startsWith(`${chapter.id}`);

                  return (
                    <div
                      key={chapter.id}
                      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all hover:scale-[1.01] ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                void handleSaveEdit(chapter.id);
                              } else if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditingName('');
                              }
                            }}
                            className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                              isDark ? 'bg-black/20 border-white/10 text-white focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/10'
                            }`}
                            disabled={isActioning}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleStartEdit(chapter)}
                        >
                          <p className={`font-bold text-sm tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {chapter.name}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1 ${isDark ? 'text-indigo-400/60' : 'text-indigo-500/60'}`}>
                            <Paperclip size={10} />
                            {questionCount} Artifact{questionCount !== 1 ? 's' : ''} Linked
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => void handleSaveEdit(chapter.id)}
                              disabled={isActioning}
                              className={`p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors`}
                            >
                              {isActioning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditingName(''); }}
                              disabled={isActioning}
                              className={`p-2 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors`}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(chapter)}
                              className={`p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors`}
                            >
                              <Plus size={16} className="rotate-45" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ open: true, chapterId: chapter.id })}
                              className={`p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`mt-4 border-t p-8 ${borderColor} ${bgSoft}`}>
            <div className="flex items-center gap-3">
              <input
                placeholder="Initialize new chapter..."
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleAddChapter();
                  }
                }}
                className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10'
                }`}
                disabled={actionLoading === 'add'}
              />
              <button
                onClick={() => void handleAddChapter()}
                disabled={!newChapterName.trim() || actionLoading === 'add'}
                className={`h-11 flex items-center gap-2 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                  isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                }`}
              >
                {actionLoading === 'add' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Append
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {confirmDelete && (
        <ConfirmDialog
          open={confirmDelete.open}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setConfirmDelete(null);
            }
          }}
          title="Delete Chapter"
          message="Questions in this chapter will become unassigned. This action cannot be undone."
          danger
          loading={actionLoading?.startsWith('delete') ?? false}
          onConfirm={() => void handleDeleteChapter(confirmDelete.chapterId)}
        />
      )}
    </>
  );
};
