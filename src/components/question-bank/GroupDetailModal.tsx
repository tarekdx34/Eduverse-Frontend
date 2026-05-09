import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus, Search, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionGroupService from '../../services/api/questionGroupService';
import QuestionBankService, { CreateQuestionBankPayload } from '../../services/api/questionBankService';
import { AccessibleModal } from '../shared/AccessibleModal';
import { LoadingSkeleton, ConfirmDialog, SearchInput } from '../shared/index';
import { GroupFormModal } from './GroupFormModal';

interface GroupDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  courseId?: number;
  onGroupUpdated: () => void;
}

interface GroupDetail {
  id: number;
  title: string;
  description?: string;
  groupType: string;
  chapterId?: number;
  chapter?: { id: number; name: string };
  sharedImageFileId?: number;
  questions?: any[];
}

interface ApprovedQuestion {
  id: number;
  questionText: string;
  questionType: string;
  difficulty: string;
}

const QUESTION_TYPES = ['mcq', 'written', 'true_false', 'fill_blanks', 'essay'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_BLOOMS = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];

export function GroupDetailModal({ open, onOpenChange, groupId, courseId, onGroupUpdated }: GroupDetailModalProps) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [approvedQuestions, setApprovedQuestions] = useState<ApprovedQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLinkingQuestions, setIsLinkingQuestions] = useState(false);

  const [newQuestionType, setNewQuestionType] = useState<string>('mcq');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionDifficulty, setNewQuestionDifficulty] = useState<string>('medium');
  const [newQuestionBloom, setNewQuestionBloom] = useState<string>('understanding');
  const [mcqOptions, setMcqOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);
  const [expectedAnswerText, setExpectedAnswerText] = useState('');
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  const [editingGroup, setEditingGroup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [sharedImagePreview, setSharedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (open && groupId) {
      loadGroupDetail();
    }
  }, [open, groupId]);

  useEffect(() => {
    if (open && newQuestionType === 'mcq' && mcqOptions.length === 0) {
      setMcqOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [open, newQuestionType]);

  const loadGroupDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await QuestionGroupService.getById(groupId) as any;
      const groupData = data?.data ?? data;
      setGroup(groupData as GroupDetail);

      if (groupData?.sharedImageFileId) {
        loadImagePreview(groupData.sharedImageFileId);
      }

      // Load approved questions
      loadApprovedQuestions();
    } catch (err) {
      console.error('Failed to load group detail:', err);
      setError('Failed to load group details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadImagePreview = async (fileId: number) => {
    try {
      let blob: Blob;
      // Try to use downloadGroupImage if available, fall back to downloadImageBlob
      try {
        blob = await QuestionGroupService.downloadGroupImage?.(fileId) || await QuestionBankService.downloadImageBlob(fileId);
      } catch {
        blob = await QuestionBankService.downloadImageBlob(fileId);
      }
      const url = URL.createObjectURL(blob);
      setSharedImagePreview(url);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const loadApprovedQuestions = async () => {
    if (!courseId) return;
    try {
      setIsLoadingQuestions(true);
      const response = await QuestionBankService.list({
        courseId,
        ...(searchQuery && { search: searchQuery }),
      });
      const data = Array.isArray(response) ? response : response?.data || [];
      setApprovedQuestions(data.slice(0, 50) as ApprovedQuestion[]);
    } catch (err) {
      console.error('Failed to load approved questions:', err);
      toast.error('Failed to load questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSearchQuestions = async (query: string) => {
    setSearchQuery(query);
    if (!courseId) return;
    try {
      setIsLoadingQuestions(true);
      const response = await QuestionBankService.list({
        courseId,
        ...(query && { search: query }),
      });
      const data = Array.isArray(response) ? response : response?.data || [];
      setApprovedQuestions(data.slice(0, 50) as ApprovedQuestion[]);
    } catch (err) {
      console.error('Failed to search questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleLinkQuestions = async () => {
    if (selectedQuestionIds.size === 0) {
      toast.error('Select at least one question');
      return;
    }

    try {
      setIsLinkingQuestions(true);
      await QuestionGroupService.linkQuestions(groupId, Array.from(selectedQuestionIds));
      toast.success('Questions linked successfully');
      setSelectedQuestionIds(new Set());
      setSearchQuery('');
      loadGroupDetail();
    } catch (err) {
      console.error('Failed to link questions:', err);
      toast.error('Failed to link questions');
    } finally {
      setIsLinkingQuestions(false);
    }
  };

  const handleRemoveQuestion = async (questionId: number) => {
    try {
      await QuestionGroupService.unlinkQuestion(groupId, questionId);
      toast.success('Question removed from group');
      loadGroupDetail();
    } catch (err) {
      console.error('Failed to remove question:', err);
      toast.error('Failed to remove question');
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!group?.questions || !over || active.id === over.id) return;
    const oldIdx = group.questions.findIndex(q => q.id === active.id);
    const newIdx = group.questions.findIndex(q => q.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(group.questions, oldIdx, newIdx);
    setGroup(g => g ? { ...g, questions: reordered } : g);
    QuestionGroupService.reorderQuestions(groupId, reordered.map(q => q.id)).catch(() => {
      toast.error('Failed to reorder questions');
      loadGroupDetail();
    });
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (newQuestionType === 'mcq') {
      const validOptions = mcqOptions.filter((o) => o.text.trim());
      if (validOptions.length < 2) {
        toast.error('MCQ must have at least 2 options');
        return;
      }
      if (!validOptions.some((o) => o.isCorrect)) {
        toast.error('At least one option must be marked as correct');
        return;
      }
    }

    try {
      setIsCreatingQuestion(true);
      const payload: CreateQuestionBankPayload = {
        courseId: courseId || 0,
        chapterId: group?.chapterId || 0,
        questionType: newQuestionType as any,
        difficulty: newQuestionDifficulty as any,
        bloomLevel: newQuestionBloom as any,
        questionText: newQuestionText,
        ...(newQuestionType === 'mcq' && {
          options: mcqOptions
            .filter((o) => o.text.trim())
            .map((o) => ({ optionText: o.text, isCorrect: o.isCorrect })),
        }),
        ...(newQuestionType === 'true_false' && { expectedAnswerText: String(trueFalseAnswer) }),
        ...(['written', 'fill_blanks', 'essay'].includes(newQuestionType) && { expectedAnswerText }),
      };

      await QuestionGroupService.addQuestions(groupId, [payload]);
      toast.success('Question created and added to group');
      setNewQuestionText('');
      setNewQuestionDifficulty('medium');
      setNewQuestionBloom('understanding');
      setMcqOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setTrueFalseAnswer(true);
      setExpectedAnswerText('');
      loadGroupDetail();
    } catch (err) {
      console.error('Failed to create question:', err);
      toast.error('Failed to create question');
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  function SortableQuestionRow({ q, idx, onRemove }: { q: any; idx: number; onRemove: (id: number) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };
    return (
      <tr ref={setNodeRef} style={style} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
        <td className={`py-3 px-3 cursor-grab active:cursor-grabbing ${isDark ? 'text-slate-500' : 'text-gray-400'}`} {...attributes} {...listeners}>
          <GripVertical size={16} />
        </td>
        <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{idx + 1}</td>
        <td className={`py-3 px-3 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
          {(q.questionText || '').substring(0, 80)}
          {(q.questionText || '').length > 80 ? '...' : ''}
        </td>
        <td className="py-3 px-3">
          <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-full ${
            isDark ? 'bg-white/5 text-slate-400 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {q.questionType}
          </span>
        </td>
        <td className="py-3 px-3">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1) || 'N/A'}
          </span>
        </td>
        <td className="py-3 px-3">
          <button
            onClick={() => onRemove(q.id)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
            title="Remove from group"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  }

  if (isLoading) {
    return (
      <AccessibleModal isOpen={open} onClose={() => onOpenChange(false)} title="Group Details">
        <LoadingSkeleton rows={6} />
      </AccessibleModal>
    );
  }

  if (error || !group) {
    return (
      <AccessibleModal isOpen={open} onClose={() => onOpenChange(false)} title="Group Details">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">{error || 'Group not found'}</p>
              <button
                onClick={loadGroupDetail}
                className="text-sm text-red-700 dark:text-red-300 hover:underline mt-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AccessibleModal>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <AccessibleModal isOpen={open} onClose={() => onOpenChange(false)} title={group.title}>
      <div className="space-y-8 max-w-4xl">
        {/* Group Info Section */}
        <section className={`border-b ${borderColor} pb-8`}>
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <h2 className={`text-2xl font-bold tracking-tight ${headingClass}`}>{group.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}>
                  {group.groupType.replace('_', ' ')}
                </span>
                {group.chapter && (
                  <span className={`text-sm flex items-center gap-1.5 ${subTextClass}`}>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    Chapter: <strong className={headingClass}>{group.chapter.name}</strong>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditingGroup(true)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Edit Details
            </button>
          </div>

          {group.description && (
            <div className={`rounded-2xl p-5 border ${borderColor} ${bgSoft}`}>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${subTextClass}`}>
                {group.description}
              </p>
            </div>
          )}

          {sharedImagePreview && (
            <div className="mt-6">
              <div className={`inline-block p-1 rounded-2xl border ${borderColor} ${bgSoft}`}>
                <img
                  src={sharedImagePreview}
                  alt="Group shared image"
                  className="max-w-md h-auto rounded-xl"
                />
              </div>
            </div>
          )}
        </section>

        {group.questions && group.questions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${headingClass}`}>Questions</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 border border-slate-500/20 uppercase tracking-widest`}>
                {group.questions.length} Total
              </span>
            </div>
            <div className={`overflow-hidden rounded-2xl border ${borderColor}`}>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${bgSoft} border-b ${borderColor}`}>
                      {group.questions.length > 1 && <th className="w-10"></th>}
                      <th className={`text-left py-3 px-3 text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>#</th>
                      <th className={`text-left py-3 px-3 text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Question Content</th>
                      <th className={`text-left py-3 px-3 text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Type</th>
                      <th className={`text-left py-3 px-3 text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Difficulty</th>
                      <th className={`text-left py-3 px-3 text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Actions</th>
                    </tr>
                  </thead>
                  <SortableContext items={group.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {group.questions.map((q, idx) => (
                        <SortableQuestionRow key={q.id} q={q} idx={idx} onRemove={(id) => setConfirmDelete(id)} />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          </section>
        )}

        {/* Add Questions Tabs */}
        <section className="space-y-4">
          <h3 className={`text-lg font-bold ${headingClass}`}>Expand Group</h3>
          <Tabs.Root defaultValue="link" className="w-full">
            <Tabs.List className={`flex gap-1 p-1 rounded-xl mb-6 ${bgSoft} border ${borderColor}`}>
              <Tabs.Trigger
                value="link"
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:shadow-sm ${
                  isDark 
                    ? 'text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900' 
                    : 'text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900'
                }`}
              >
                Link Existing
              </Tabs.Trigger>
              <Tabs.Trigger
                value="create"
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all data-[state=active]:shadow-sm ${
                  isDark 
                    ? 'text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900' 
                    : 'text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900'
                }`}
              >
                Quick Create
              </Tabs.Trigger>
            </Tabs.List>

            {/* Link Existing Tab */}
            <Tabs.Content value="link" className="space-y-4 pt-4">
              <SearchInput
                placeholder="Search approved questions..."
                value={searchQuery}
                onChange={(e) => handleSearchQuestions(e.target.value)}
              />

              {isLoadingQuestions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : approvedQuestions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {approvedQuestions.map((q) => (
                    <label key={q.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.has(q.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedQuestionIds);
                          if (e.target.checked) {
                            newSet.add(q.id);
                          } else {
                            newSet.delete(q.id);
                          }
                          setSelectedQuestionIds(newSet);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {(q.questionText || '').substring(0, 100)}
                          {(q.questionText || '').length > 100 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Type: {q.questionType} | Difficulty: {q.difficulty}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No approved questions found</p>
              )}

              <button
                onClick={handleLinkQuestions}
                disabled={selectedQuestionIds.size === 0 || isLinkingQuestions}
                className={`w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 ${
                  isDark ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isLinkingQuestions ? 'Linking...' : `Link Selected Questions (${selectedQuestionIds.size})`}
              </button>
            </Tabs.Content>

            {/* Create New Tab */}
            <Tabs.Content value="create" className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Question Type
                </label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Difficulty
                </label>
                <select
                  value={newQuestionDifficulty}
                  onChange={(e) => setNewQuestionDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {VALID_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Bloom Level
                </label>
                <select
                  value={newQuestionBloom}
                  onChange={(e) => setNewQuestionBloom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {VALID_BLOOMS.map((b) => (
                    <option key={b} value={b}>
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Question Text
                </label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Enter question text..."
                  rows={4}
                />
              </div>

              {newQuestionType === 'true_false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Correct Answer
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="trueFalse"
                        value="true"
                        checked={trueFalseAnswer === true}
                        onChange={() => setTrueFalseAnswer(true)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">True</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="trueFalse"
                        value="false"
                        checked={trueFalseAnswer === false}
                        onChange={() => setTrueFalseAnswer(false)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">False</span>
                    </label>
                  </div>
                </div>
              )}

              {newQuestionType === 'mcq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {mcqOptions.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...mcqOptions];
                            newOptions[idx].text = e.target.value;
                            setMcqOptions(newOptions);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <label className="flex items-center gap-2 px-3">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => {
                              const newOptions = [...mcqOptions];
                              newOptions[idx].isCorrect = e.target.checked;
                              setMcqOptions(newOptions);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Correct</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMcqOptions([...mcqOptions, { text: '', isCorrect: false }])
                    }
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {['written', 'fill_blanks', 'essay'].includes(newQuestionType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Expected Answer
                  </label>
                  <textarea
                    value={expectedAnswerText}
                    onChange={(e) => setExpectedAnswerText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter the expected answer or answer key..."
                    rows={3}
                  />
                </div>
              )}

              <button
                onClick={handleCreateQuestion}
                disabled={isCreatingQuestion || !newQuestionText.trim()}
                className={`w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 ${
                  isDark ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isCreatingQuestion ? 'Creating...' : 'Create and Add Question'}
              </button>
            </Tabs.Content>
          </Tabs.Root>
        </section>
      </div>

      {/* Modals */}
      {editingGroup && (
        <GroupFormModal
          open={editingGroup}
          onOpenChange={setEditingGroup}
          courseId={courseId}
          group={group}
          onSuccess={() => {
            setEditingGroup(false);
            loadGroupDetail();
            onGroupUpdated();
          }}
        />
      )}

      {confirmDelete !== null && (
        <ConfirmDialog
          open={confirmDelete !== null}
          onOpenChange={(open) => !open && setConfirmDelete(null)}
          title="Remove Question"
          message="Remove this question from the group? It will remain in the question bank."
          onConfirm={() => {
            handleRemoveQuestion(confirmDelete);
            setConfirmDelete(null);
          }}
          danger={false}
        />
      )}
    </AccessibleModal>
  );
}
