import { useCallback, useMemo, useState } from 'react';
import QuestionBankService from '../services/api/questionBankService';
import type {
  QuestionBankBatchStatusRequest,
  QuestionBankListParams,
  QuestionBankQuestion,
  QuestionBankStats,
} from '../types/questionBank';

export function useQuestionBank(initialFilters: QuestionBankListParams = {}) {
  const [filters, setFilters] = useState<QuestionBankListParams>(initialFilters);
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>([]);
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page ?? 1);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCount = selectedQuestionIds.size;
  const hasSelection = selectedCount > 0;

  const loadQuestions = useCallback(async (nextFilters: QuestionBankListParams = filters) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const request = { ...nextFilters, page: nextFilters.page ?? page };
      const result = await QuestionBankService.list(request);
      setFilters(request);
      setQuestions(result.data ?? []);
      setTotal(result.total ?? result.data?.length ?? 0);
      setPage(request.page ?? 1);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load questions';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  const loadStats = useCallback(async (nextFilters: QuestionBankListParams = filters) => {
    const result = await QuestionBankService.getStats(nextFilters);
    setStats(result);
    return result;
  }, [filters]);

  const updateFilters = useCallback((patch: QuestionBankListParams) => {
    const nextFilters = { ...filters, ...patch, page: patch.page ?? 1 };
    setFilters(nextFilters);
    setPage(nextFilters.page ?? 1);
    return loadQuestions(nextFilters);
  }, [filters, loadQuestions]);

  const toggleSelected = useCallback((questionId: number) => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedQuestionIds(new Set(questions.map((question) => question.id)));
  }, [questions]);

  const clearSelection = useCallback(() => {
    setSelectedQuestionIds(new Set());
  }, []);

  const runBatchAction = useCallback(async (
    request: Omit<QuestionBankBatchStatusRequest, 'questionIds'> & {
      questionIds?: number[];
    },
  ) => {
    const questionIds = request.questionIds ?? Array.from(selectedQuestionIds);
    if (questionIds.length === 0 && !request.allMatchingFilters) {
      throw new Error('Select at least one question');
    }

    setIsMutating(true);
    setErrorMessage(null);
    try {
      const result = await QuestionBankService.batchStatusAction({
        ...filters,
        ...request,
        questionIds,
        expectedQuestionCount: request.expectedQuestionCount ?? questionIds.length,
      });
      clearSelection();
      await Promise.all([loadQuestions(filters), loadStats(filters)]);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Batch action failed';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [clearSelection, filters, loadQuestions, loadStats, selectedQuestionIds]);

  const deleteQuestion = useCallback(async (questionId: number) => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      await QuestionBankService.deleteQuestion(questionId);
      setSelectedQuestionIds((current) => {
        const next = new Set(current);
        next.delete(questionId);
        return next;
      });
      await Promise.all([loadQuestions(filters), loadStats(filters)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete question';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [filters, loadQuestions, loadStats]);

  const visibleSelectedIds = useMemo(
    () => questions.filter((question) => selectedQuestionIds.has(question.id)).map((question) => question.id),
    [questions, selectedQuestionIds],
  );

  return {
    filters,
    questions,
    stats,
    total,
    page,
    selectedQuestionIds,
    selectedCount,
    hasSelection,
    visibleSelectedIds,
    isLoading,
    isMutating,
    errorMessage,
    setFilters,
    setSelectedQuestionIds,
    loadQuestions,
    loadStats,
    updateFilters,
    toggleSelected,
    selectAllVisible,
    clearSelection,
    runBatchAction,
    deleteQuestion,
  };
}

export default useQuestionBank;
