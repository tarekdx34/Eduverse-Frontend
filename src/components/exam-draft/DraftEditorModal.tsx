import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useTheme } from '../../pages/instructor-dashboard/contexts/ThemeContext';
import {
  StatusBadge,
  ConfirmDialog,
  LoadingSkeleton,
  EmptyState,
  SearchInput,
} from '../shared/index';
import ExamGenerationService from '../../services/api/examGenerationService';
import QuestionBankService from '../../services/api/questionBankService';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  MoreVertical,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

const LoadTrigger: React.FC<{ onMount: () => void }> = ({ onMount }) => {
  useEffect(() => { onMount(); }, [onMount]);
  return null;
};

interface DraftSection {
  id: number;
  draftId: number;
  title: string;
  instructions?: string;
  totalMarks?: number;
  answerPolicy?: string;
  itemOrder?: number;
}

interface DraftItem {
  id: number;
  draftId: number;
  questionId: number;
  chapterId?: number;
  questionType?: string;
  difficulty?: string;
  weight: number;
  itemOrder?: number;
  questionText?: string;
  sectionId?: number;
}

interface DraftDetail {
  draftId: number;
  title: string;
  courseId?: number;
  totalQuestions: number;
  totalWeight: number;
  generatedAt: string;
  status?: string;
  items: DraftItem[];
  sections?: DraftSection[];
}

interface Question {
  id: number;
  questionText: string;
  questionType?: string;
  difficulty?: string;
  status: string;
}

interface DraftEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftId: number;
  draftTitle: string;
  onSaved: () => void;
}

export const DraftEditorModal: React.FC<DraftEditorModalProps> = ({
  open,
  onOpenChange,
  draftId,
  draftTitle,
  onSaved,
}) => {
  const { isDark, primaryHex } = useTheme();
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(draftTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [validating, setValidating] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showCreateSection, setShowCreateSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    instructions: '',
    totalMarks: '',
    answerPolicy: 'ANSWER_ALL',
  });

  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedQuestions, setApprovedQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set(),
  );

  const [editingMarks, setEditingMarks] = useState<{
    itemId: number;
    marks: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`Copy of ${draftTitle}`);

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const loadDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExamGenerationService.getDraft(draftId);
      setDraft(data as DraftDetail);
      setEditingTitle(
        (data as DraftDetail).title || `Draft #${draftId}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load draft';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    if (open) {
      setValidationIssues([]);
      setShowValidationPanel(false);
      void loadDraft();
    }
  }, [open, loadDraft]);

  const handleValidate = async () => {
    try {
      setValidating(true);
      setValidationIssues([]);
      const result = await ExamGenerationService.validateDraft(draftId);
      const r = result as Record<string, unknown>;
      const errors = Array.isArray(r.errors) ? r.errors as string[] : [];
      const warnings = Array.isArray(r.warnings) ? r.warnings as string[] : [];
      const canSave = r.canSave === true;
      if (canSave && errors.length === 0) {
        toast.success(warnings.length > 0 ? `Ready to save (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : 'Draft is valid and ready to save');
        if (warnings.length > 0) {
          setValidationIssues(warnings.map((w) => `⚠ ${w}`));
          setShowValidationPanel(true);
        } else {
          setShowValidationPanel(false);
        }
      } else {
        setValidationIssues([...errors, ...warnings.map((w) => `⚠ ${w}`)]);
        setShowValidationPanel(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      setValidationIssues([message]);
      setShowValidationPanel(true);
    } finally {
      setValidating(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      await ExamGenerationService.regenerateDraft(draftId);
      toast.success('Draft regenerated');
      await loadDraft();
      setShowRegenerateConfirm(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to regenerate draft',
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      const result = await ExamGenerationService.duplicateDraft(draftId);
      toast.success('Draft duplicated');
      onSaved();
      setShowDuplicateDialog(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to duplicate draft',
      );
    } finally {
      setDuplicating(false);
    }
  };

  const handleSaveAsExam = async () => {
    try {
      setValidating(true);
      const result = await ExamGenerationService.validateDraft(draftId);
      const r = result as Record<string, unknown>;
      const errors = Array.isArray(r.errors) ? r.errors as string[] : [];
      const warnings = Array.isArray(r.warnings) ? r.warnings as string[] : [];
      if (r.canSave !== true || errors.length > 0) {
        setValidationIssues([...errors, ...warnings.map((w) => `⚠ ${w}`)]);
        setShowValidationPanel(true);
        return;
      }

      setSaving(true);
      await ExamGenerationService.saveDraft(draftId);
      toast.success('Exam saved');
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save exam',
      );
    } finally {
      setSaving(false);
      setValidating(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await ExamGenerationService.exportExamWord(draftId);
      toast.success('Exam exported to Word');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to export exam',
      );
    } finally {
      setExporting(false);
    }
  };

  const handleCreateSection = async () => {
    if (!sectionForm.title.trim()) {
      toast.error('Section title is required');
      return;
    }

    try {
      const dto: { title: string; instructions?: string; totalMarks?: number; answerPolicy?: string } = {
        title: sectionForm.title,
      };
      if (sectionForm.instructions.trim()) {
        dto.instructions = sectionForm.instructions;
      }
      if (sectionForm.totalMarks) {
        dto.totalMarks = parseInt(sectionForm.totalMarks, 10);
      }
      if (sectionForm.answerPolicy) {
        dto.answerPolicy = sectionForm.answerPolicy;
      }

      await ExamGenerationService.createSection(draftId, dto);
      toast.success('Section created');
      setSectionForm({
        title: '',
        instructions: '',
        totalMarks: '',
        answerPolicy: 'ANSWER_ALL',
      });
      setShowCreateSection(false);
      await loadDraft();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create section',
      );
    }
  };

  const handleDeleteSection = async () => {
    if (sectionToDelete === null) return;

    try {
      await ExamGenerationService.deleteSection(draftId, sectionToDelete);
      toast.success('Section deleted');
      setSectionToDelete(null);
      setShowDeleteSection(false);
      await loadDraft();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete section',
      );
    }
  };

  const handleLoadApprovedQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const result = await QuestionBankService.list({
        status: 'approved',
        page: 1,
        limit: 100,
      });
      const resultRecord = result as Record<string, unknown>;
      const data = Array.isArray(resultRecord.data)
        ? resultRecord.data
        : Array.isArray(resultRecord)
          ? resultRecord
          : [];
      setApprovedQuestions(
        data.map((q: unknown) => {
          const qRecord = q as Record<string, unknown>;
          return {
            id: qRecord.id as number,
            questionText: (qRecord.questionText || qRecord.text || '') as string,
            questionType: qRecord.questionType as string | undefined,
            difficulty: qRecord.difficulty as string | undefined,
            status: qRecord.status as string,
          };
        }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load questions',
      );
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.size === 0) {
      toast.error('Select at least one question');
      return;
    }

    const sectionId = selectedSectionId;

    try {
      for (const questionId of selectedQuestions) {
        await ExamGenerationService.addDraftItem(draftId, {
          questionId,
          weight: 1,
          ...(sectionId !== null && { sectionId }),
        });
      }
      toast.success('Questions added');
      setSelectedQuestions(new Set());
      setShowAddQuestion(false);
      setSelectedSectionId(null);
      await loadDraft();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to add questions',
      );
    }
  };

  const handleUpdateMarks = async () => {
    if (editingMarks === null || !editingMarks.marks.trim()) {
      return;
    }

    const marks = parseInt(editingMarks.marks, 10);
    if (!Number.isFinite(marks) || marks < 0) {
      toast.error('Invalid marks value');
      return;
    }

    try {
      await ExamGenerationService.updateDraftItem(draftId, editingMarks.itemId, {
        weight: marks,
      });
      toast.success('Marks updated');
      setEditingMarks(null);
      await loadDraft();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update marks',
      );
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete === null) return;

    try {
      await ExamGenerationService.deleteDraftItem(draftId, itemToDelete);
      toast.success('Question removed');
      setItemToDelete(null);
      setShowDeleteConfirm(false);
      await loadDraft();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete question',
      );
    }
  };

  const hasSections = draft && draft.sections && draft.sections.length > 0;

  const filteredQuestions = approvedQuestions.filter((q) =>
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 flex-wrap">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  className={`text-lg font-bold border-b-2 px-1 focus:outline-none ${
                    isDark
                      ? 'bg-gray-700 text-white border-blue-500'
                      : 'bg-white text-gray-900 border-blue-500'
                  }`}
                  autoFocus
                />
              ) : (
                <DialogTitle
                  onClick={() => setIsEditingTitle(true)}
                  className="cursor-pointer hover:opacity-80"
                >
                  {editingTitle}
                </DialogTitle>
              )}

              {draft && (
                <StatusBadge status={draft.status || 'draft'} />
              )}
            </div>
            <DialogDescription className="sr-only">Edit draft exam questions, sections, and marks</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleValidate}
                disabled={validating || loading}
                className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: validating ? '#e5e7eb' : 'transparent',
                  borderColor: primaryHex,
                  color: primaryHex,
                }}
              >
                {validating ? (
                  <>
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate'
                )}
              </button>

              <button
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={regenerating || loading}
                className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: regenerating ? '#e5e7eb' : 'transparent',
                  borderColor: primaryHex,
                  color: primaryHex,
                }}
              >
                {regenerating ? (
                  <>
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate'
                )}
              </button>

              <button
                onClick={() => setShowDuplicateDialog(true)}
                disabled={duplicating || loading}
                className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: duplicating ? '#e5e7eb' : 'transparent',
                  borderColor: primaryHex,
                  color: primaryHex,
                }}
              >
                Duplicate
              </button>

              <button
                onClick={() => toast.info('Save the draft as an exam first, then export from the Saved Exams tab.')}
                disabled={loading}
                title="Only saved exams can be exported"
                className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors opacity-50 cursor-not-allowed"
                style={{ borderColor: primaryHex, color: primaryHex }}
              >
                Export
              </button>

              <button
                onClick={handleSaveAsExam}
                disabled={saving || loading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primaryHex }}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save as Exam'
                )}
              </button>
            </div>

            {/* Validation Panel */}
            {showValidationPanel && validationIssues.length > 0 && (
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                  borderColor: isDark ? '#991b1b' : '#fecaca',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className={isDark ? 'text-red-400' : 'text-red-600'}
                  />
                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-2 ${
                        isDark ? 'text-red-100' : 'text-red-900'
                      }`}
                    >
                      Validation Issues
                    </h4>
                    <ul className="space-y-1">
                      {validationIssues.map((issue, idx) => (
                        <li
                          key={idx}
                          className={`text-sm ${
                            isDark ? 'text-red-200' : 'text-red-800'
                          }`}
                        >
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowValidationPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <LoadingSkeleton rows={5} cols={1} />
            ) : error ? (
              <div
                className="rounded-lg border p-4 text-center"
                style={{
                  backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                  borderColor: isDark ? '#991b1b' : '#fecaca',
                }}
              >
                <p className={isDark ? 'text-red-200' : 'text-red-800'}>
                  {error}
                </p>
                <button
                  onClick={() => void loadDraft()}
                  className="mt-3 px-3 py-1 rounded text-sm text-white"
                  style={{ backgroundColor: primaryHex }}
                >
                  Retry
                </button>
              </div>
            ) : draft ? (
              <Tabs defaultValue={hasSections ? '0' : 'all'} className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2 h-auto p-1">
                  {hasSections ? (
                    draft.sections!.map((section, idx) => (
                      <div key={section.id} className="flex items-center gap-1">
                        <TabsTrigger value={String(idx)}>
                          {section.title}
                        </TabsTrigger>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSectionToDelete(section.id);
                                setShowDeleteSection(true);
                              }}
                              className="text-red-600"
                            >
                              Delete Section
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  ) : (
                    <TabsTrigger value="all">Questions</TabsTrigger>
                  )}

                  <button
                    onClick={() => setShowCreateSection(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Plus size={14} />
                    Add Section
                  </button>
                </TabsList>

                {hasSections ? (
                  draft.sections!.map((section, idx) => (
                    <TabsContent key={section.id} value={String(idx)}>
                      <QuestionsTable
                        items={draft.items.filter(
                          (item) => item.sectionId === section.id,
                        )}
                        onEditMarks={(itemId, marks) =>
                          setEditingMarks({ itemId, marks: String(marks) })
                        }
                        onDeleteItem={(itemId) => {
                          setItemToDelete(itemId);
                          setShowDeleteConfirm(true);
                        }}
                        onAddQuestion={() => {
                          setSelectedSectionId(section.id);
                          setShowAddQuestion(true);
                        }}
                        isDark={isDark}
                        primaryHex={primaryHex}
                        editingMarks={editingMarks}
                        onUpdateMarks={handleUpdateMarks}
                      />
                    </TabsContent>
                  ))
                ) : (
                  <TabsContent value="all">
                    <QuestionsTable
                      items={draft.items}
                      onEditMarks={(itemId, marks) =>
                        setEditingMarks({ itemId, marks: String(marks) })
                      }
                      onDeleteItem={(itemId) => {
                        setItemToDelete(itemId);
                        setShowDeleteConfirm(true);
                      }}
                      onAddQuestion={() => {
                        setSelectedSectionId(null);
                        setShowAddQuestion(true);
                      }}
                      isDark={isDark}
                      primaryHex={primaryHex}
                      editingMarks={editingMarks}
                      onUpdateMarks={handleUpdateMarks}
                    />
                  </TabsContent>
                )}
              </Tabs>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={isDark ? 'border-gray-600 text-gray-200' : ''}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Section Modal */}
      <Dialog open={showCreateSection} onOpenChange={setShowCreateSection}>
        <DialogContent
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}
        >
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription className="sr-only">Add a new section to organise questions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                Title *
              </label>
              <Input
                value={sectionForm.title}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
                placeholder="Section title"
                className={
                  isDark
                    ? 'mt-1 bg-gray-700 border-gray-600 text-white'
                    : 'mt-1'
                }
              />
            </div>

            <div>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                Instructions
              </label>
              <Textarea
                value={sectionForm.instructions}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    instructions: e.target.value,
                  })
                }
                placeholder="Section instructions (optional)"
                className={
                  isDark
                    ? 'mt-1 bg-gray-700 border-gray-600 text-white'
                    : 'mt-1'
                }
              />
            </div>

            <div>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                Total Marks
              </label>
              <Input
                type="number"
                value={sectionForm.totalMarks}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, totalMarks: e.target.value })
                }
                placeholder="Optional"
                className={
                  isDark
                    ? 'mt-1 bg-gray-700 border-gray-600 text-white'
                    : 'mt-1'
                }
              />
            </div>

            <div>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                Answer Policy
              </label>
              <Select
                value={sectionForm.answerPolicy}
                onValueChange={(value) =>
                  setSectionForm({ ...sectionForm, answerPolicy: value })
                }
              >
                <SelectTrigger
                  className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANSWER_ALL">Answer All</SelectItem>
                  <SelectItem value="ANSWER_ANY">Answer Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateSection(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSection}
              style={{ backgroundColor: primaryHex }}
              className="text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Confirm */}
      <AlertDialog open={showDeleteSection} onOpenChange={setShowDeleteSection}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the section and all its questions from the draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Question Modal */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}
        >
          <DialogHeader>
            <DialogTitle>Add Questions</DialogTitle>
            <DialogDescription className="sr-only">Select approved questions to add to this section</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SearchInput
              placeholder="Search questions by text..."
              onSearch={setSearchQuery}
            />

            {questionsLoading ? (
              <LoadingSkeleton rows={3} cols={1} />
            ) : approvedQuestions.length === 0 ? (
              <EmptyState title="No approved questions found" />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredQuestions.map((q) => (
                  <label
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-opacity-50 ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(q.id)}
                      onChange={(e) => {
                        const next = new Set(selectedQuestions);
                        if (e.target.checked) {
                          next.add(q.id);
                        } else {
                          next.delete(q.id);
                        }
                        setSelectedQuestions(next);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        Q#{q.id}
                      </p>
                      <p
                        className={`text-sm truncate ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        title={q.questionText}
                      >
                        {q.questionText}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {q.questionType && (
                          <span
                            className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${primaryHex}20`,
                              color: primaryHex,
                            }}
                          >
                            {q.questionType}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddQuestion(false);
                setSelectedQuestions(new Set());
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestions}
              disabled={selectedQuestions.size === 0}
              style={{ backgroundColor: primaryHex }}
              className="text-white"
            >
              Add Selected ({selectedQuestions.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the question from the draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}
        >
          <DialogHeader>
            <DialogTitle>Duplicate Draft</DialogTitle>
            <DialogDescription className="sr-only">Create a copy of this draft with a new name</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                New Draft Name
              </label>
              <Input
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className={
                  isDark
                    ? 'mt-1 bg-gray-700 border-gray-600 text-white'
                    : 'mt-1'
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDuplicateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={duplicating}
              style={{ backgroundColor: primaryHex }}
              className="text-white"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirm */}
      <AlertDialog
        open={showRegenerateConfirm}
        onOpenChange={setShowRegenerateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all questions with a new selection using the
              same rules. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Load Questions on Mount */}
      {showAddQuestion && approvedQuestions.length === 0 && !questionsLoading && (
        <LoadTrigger onMount={handleLoadApprovedQuestions} />
      )}
    </>
  );
};

interface QuestionsTableProps {
  items: DraftItem[];
  onEditMarks: (itemId: number, marks: number) => void;
  onDeleteItem: (itemId: number) => void;
  onAddQuestion: () => void;
  isDark: boolean;
  primaryHex: string;
  editingMarks: { itemId: number; marks: string } | null;
  onUpdateMarks: () => void;
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({
  items,
  onEditMarks,
  onDeleteItem,
  onAddQuestion,
  isDark,
  primaryHex,
  editingMarks,
  onUpdateMarks,
}) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onAddQuestion}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
        style={{ backgroundColor: primaryHex }}
      >
        <Plus size={16} />
        Add Question
      </button>

      {items.length === 0 ? (
        <EmptyState
          title="No questions in this section"
          description="Click 'Add Question' to add questions to this section."
        />
      ) : (
        <div className="overflow-x-auto">
          <table
            className={`w-full text-sm border-collapse ${
              isDark ? 'bg-gray-700' : 'bg-white border border-gray-300'
            }`}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderBottom: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                }}
              >
                <th
                  className={`px-4 py-2 text-left font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  #
                </th>
                <th
                  className={`px-4 py-2 text-left font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Question Preview
                </th>
                <th
                  className={`px-4 py-2 text-left font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`px-4 py-2 text-left font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Difficulty
                </th>
                <th
                  className={`px-4 py-2 text-left font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Marks
                </th>
                <th
                  className={`px-4 py-2 text-center font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  }}
                >
                  <td
                    className={`px-4 py-3 font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className={`px-4 py-3 max-w-xs truncate ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    title={item.questionText || ''}
                  >
                    {item.questionText
                      ? item.questionText.substring(0, 80) +
                        (item.questionText.length > 80 ? '...' : '')
                      : `Q#${item.questionId}`}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {item.questionType || 'N/A'}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {item.difficulty || 'N/A'}
                  </td>
                  <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {editingMarks?.itemId === item.id ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editingMarks.marks}
                          onChange={(e) =>
                            editingMarks &&
                            // Can't directly set, need to trigger parent update
                            onEditMarks(item.id, parseInt(e.target.value, 10))
                          }
                          className={`w-16 px-2 py-1 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300'
                          }`}
                        />
                        <button
                          onClick={onUpdateMarks}
                          className="text-xs px-2 py-1 rounded text-white"
                          style={{ backgroundColor: primaryHex }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium">{item.weight}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => onEditMarks(item.id, item.weight)}
                        >
                          Edit Marks
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteItem(item.id)}
                          className="text-red-600"
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
