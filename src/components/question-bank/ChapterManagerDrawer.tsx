import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Chapters</DialogTitle>
            <DialogDescription>
              Add, edit, or delete chapters for this course.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
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
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3"
                    >
                      {isEditing ? (
                        <Input
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
                          placeholder="Chapter name"
                          className="flex-1 h-9"
                          disabled={isActioning}
                        />
                      ) : (
                        <div
                          className="flex-1 cursor-pointer py-1"
                          onClick={() => handleStartEdit(chapter)}
                        >
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {chapter.name}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {questionCount} question{questionCount !== 1 ? 's' : ''}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleSaveEdit(chapter.id)}
                            disabled={isActioning}
                          >
                            {isActioning && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName('');
                            }}
                            disabled={isActioning}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete({ open: true, chapterId: chapter.id })}
                          disabled={isActioning}
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="New chapter name"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleAddChapter();
                  }
                }}
                disabled={actionLoading === 'add'}
              />
              <Button
                onClick={() => void handleAddChapter()}
                disabled={!newChapterName.trim() || actionLoading === 'add'}
                size="sm"
              >
                {actionLoading === 'add' && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
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
