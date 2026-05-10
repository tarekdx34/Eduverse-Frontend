import { useCallback, useState } from 'react';
import ExamGenerationService from '../services/api/examGenerationService';
import QuestionBankService from '../services/api/questionBankService';
import type {
  ExamDraft,
  ExamDraftItemAddPayload,
  ExamDraftItemUpdatePayload,
  ExamDraftSectionPayload,
  ExamDraftValidation,
  ExamReplacementCheck,
} from '../types/examGenerator';
import type { QuestionBankListParams, QuestionBankQuestion } from '../types/questionBank';

export function useExamDraftEditor(draftId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExamDraft | null>(null);
  const [validation, setValidation] = useState<ExamDraftValidation | null>(null);
  const [candidateQuestions, setCandidateQuestions] = useState<QuestionBankQuestion[]>([]);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateTotal, setCandidateTotal] = useState(0);
  const [candidateFilters, setCandidateFilters] = useState<QuestionBankListParams>({});
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<number>>(new Set());

  const requireDraftId = useCallback(() => {
    if (!draftId) throw new Error('Draft id is required');
    return draftId;
  }, [draftId]);

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>, success?: string) => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      const result = await operation();
      if (success) setActionMessage(success);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Draft operation failed';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const loadDraft = useCallback(async () => {
    const id = requireDraftId();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.getDraft(id);
      setDraft(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load draft';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [requireDraftId]);

  const validateDraft = useCallback(async () => {
    const result = await ExamGenerationService.validateDraft(requireDraftId());
    setValidation(result);
    return result;
  }, [requireDraftId]);

  const createSection = useCallback((payload: ExamDraftSectionPayload) =>
    runMutation(async () => {
      const result = await ExamGenerationService.createSection(requireDraftId(), payload);
      await loadDraft();
      return result;
    }, 'Section created'), [loadDraft, requireDraftId, runMutation]);

  const upsertSection = useCallback((sectionId: number | undefined, payload: ExamDraftSectionPayload) =>
    runMutation(async () => {
      const result = sectionId
        ? await ExamGenerationService.updateSection(requireDraftId(), sectionId, payload)
        : await ExamGenerationService.createSection(requireDraftId(), payload);
      await loadDraft();
      return result;
    }, sectionId ? 'Section updated' : 'Section created'), [loadDraft, requireDraftId, runMutation]);

  const deleteSection = useCallback((sectionId: number) =>
    runMutation(async () => {
      await ExamGenerationService.deleteSection(requireDraftId(), sectionId);
      await loadDraft();
    }, 'Section deleted'), [loadDraft, requireDraftId, runMutation]);

  const reorderSections = useCallback((orderedSectionIds: number[]) =>
    runMutation(async () => {
      await ExamGenerationService.reorderSections(requireDraftId(), orderedSectionIds);
      await loadDraft();
    }, 'Sections reordered'), [loadDraft, requireDraftId, runMutation]);

  const addItem = useCallback((payload: ExamDraftItemAddPayload) =>
    runMutation(async () => {
      const result = await ExamGenerationService.addDraftItem(requireDraftId(), payload);
      await loadDraft();
      return result;
    }, 'Question added'), [loadDraft, requireDraftId, runMutation]);

  const updateItem = useCallback((itemId: number, payload: ExamDraftItemUpdatePayload) =>
    runMutation(async () => {
      await ExamGenerationService.updateDraftItem(requireDraftId(), itemId, payload);
      await loadDraft();
    }, 'Question updated'), [loadDraft, requireDraftId, runMutation]);

  const replacementRequiresOverride = useCallback(async (itemId: number, replacementQuestionId: number) => {
    const result: ExamReplacementCheck = await ExamGenerationService.checkReplacement(
      requireDraftId(),
      itemId,
      replacementQuestionId,
    );
    return result;
  }, [requireDraftId]);

  const removeItem = useCallback((itemId: number) =>
    runMutation(async () => {
      await ExamGenerationService.deleteDraftItem(requireDraftId(), itemId);
      await loadDraft();
    }, 'Question removed'), [loadDraft, requireDraftId, runMutation]);

  const reorderItems = useCallback((orderedItemIds: number[]) =>
    runMutation(async () => {
      await ExamGenerationService.reorderDraftItems(requireDraftId(), orderedItemIds);
      await loadDraft();
    }, 'Questions reordered'), [loadDraft, requireDraftId, runMutation]);

  const loadCandidateQuestions = useCallback(async (filters: QuestionBankListParams = {}) => {
    const nextFilters = {
      ...filters,
      courseId: filters.courseId ?? draft?.courseId,
      status: 'approved' as const,
      page: filters.page ?? 1,
      limit: filters.limit ?? 50,
    };
    setCandidateFilters(nextFilters);
    const result = await QuestionBankService.list(nextFilters);
    setCandidateQuestions(result.data ?? []);
    setCandidateTotal(result.total ?? result.data?.length ?? 0);
    setCandidatePage(nextFilters.page ?? 1);
    return result;
  }, [draft?.courseId]);

  const loadMoreCandidateQuestions = useCallback(async () => {
    const nextPage = candidatePage + 1;
    const result = await QuestionBankService.list({ ...candidateFilters, page: nextPage });
    setCandidateQuestions((current) => [...current, ...(result.data ?? [])]);
    setCandidateTotal(result.total ?? candidateTotal);
    setCandidatePage(nextPage);
    return result;
  }, [candidateFilters, candidatePage, candidateTotal]);

  const saveDraft = useCallback(() =>
    runMutation(async () => ExamGenerationService.saveDraft(requireDraftId()), 'Draft saved as exam'),
  [requireDraftId, runMutation]);

  const regenerateDraft = useCallback((payload: { seed?: string; keepManualEdits?: boolean } = {}) =>
    runMutation(async () => {
      const result = await ExamGenerationService.regenerateDraft(requireDraftId(), payload);
      setDraft(result);
      return result;
    }, 'Draft regenerated'), [requireDraftId, runMutation]);

  const duplicateDraft = useCallback((payload: { title?: string; seed?: string; regenerate?: boolean } = {}) =>
    runMutation(async () => ExamGenerationService.duplicateDraft(requireDraftId(), payload), 'Draft duplicated'),
  [requireDraftId, runMutation]);

  const reshuffleSection = useCallback((sectionId: number, payload: { seed?: string; keepManualEdits?: boolean } = {}) =>
    runMutation(async () => {
      const result = await ExamGenerationService.reshuffleSection(requireDraftId(), sectionId, payload);
      setDraft(result);
      return result;
    }, 'Section reshuffled'), [requireDraftId, runMutation]);

  const normalizeSectionMarks = useCallback((sectionId: number, totalMarks?: number) =>
    runMutation(async () => {
      await ExamGenerationService.normalizeSectionMarks(requireDraftId(), sectionId, totalMarks);
      await loadDraft();
    }, 'Section marks normalized'), [loadDraft, requireDraftId, runMutation]);

  const moveItemsToSection = useCallback((itemIds: number[], draftSectionId?: number | null) =>
    runMutation(async () => {
      await Promise.all(itemIds.map((itemId) =>
        ExamGenerationService.updateDraftItem(requireDraftId(), itemId, { draftSectionId }),
      ));
      await loadDraft();
    }, 'Questions moved'), [loadDraft, requireDraftId, runMutation]);

  return {
    isLoading,
    isMutating,
    errorMessage,
    actionMessage,
    draft,
    validation,
    candidateQuestions,
    candidatePage,
    candidateTotal,
    candidateFilters,
    selectedCandidateIds,
    setSelectedCandidateIds,
    loadDraft,
    createSection,
    upsertSection,
    deleteSection,
    reorderSections,
    addItem,
    updateItem,
    replacementRequiresOverride,
    removeItem,
    reorderItems,
    loadCandidateQuestions,
    loadMoreCandidateQuestions,
    saveDraft,
    validateDraft,
    regenerateDraft,
    duplicateDraft,
    reloadAfterSourceEdit: loadDraft,
    reshuffleSection,
    normalizeSectionMarks,
    moveItemsToSection,
  };
}

export default useExamDraftEditor;
