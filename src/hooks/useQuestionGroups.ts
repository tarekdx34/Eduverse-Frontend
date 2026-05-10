import { useCallback, useMemo, useState } from 'react';
import QuestionGroupService from '../services/api/questionGroupService';
import type {
  QuestionBankFormPayload,
  QuestionBankGroup,
  QuestionGroupListParams,
  QuestionGroupPayload,
} from '../types/questionBank';

const normalizeGroupList = (
  response: { data: QuestionBankGroup[]; total?: number } | QuestionBankGroup[],
) => ({
  data: Array.isArray(response) ? response : response.data ?? [],
  total: Array.isArray(response) ? response.length : response.total ?? response.data?.length ?? 0,
});

export function useQuestionGroups(initialFilters: QuestionGroupListParams = {}) {
  const [filters, setFilters] = useState<QuestionGroupListParams>(initialFilters);
  const [groups, setGroups] = useState<QuestionBankGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<QuestionBankGroup | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadGroups = useCallback(async (nextFilters: QuestionGroupListParams = filters) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = normalizeGroupList(await QuestionGroupService.list(nextFilters));
      setGroups(result.data);
      setTotal(result.total);
      setFilters(nextFilters);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load groups';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadGroup = useCallback(async (groupId: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await QuestionGroupService.getById(groupId);
      setActiveGroup(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load group';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>) => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      const result = await operation();
      await loadGroups(filters);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Group operation failed';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [filters, loadGroups]);

  const saveGroup = useCallback((payload: QuestionGroupPayload, groupId?: number) =>
    runMutation(async () => {
      const result = groupId
        ? await QuestionGroupService.update(groupId, payload)
        : await QuestionGroupService.create(payload);
      setActiveGroup(result);
      return result;
    }), [runMutation]);

  const deleteGroup = useCallback((groupId: number) =>
    runMutation(async () => {
      await QuestionGroupService.delete(groupId);
      if (activeGroup?.id === groupId) setActiveGroup(null);
    }), [activeGroup?.id, runMutation]);

  const addQuestions = useCallback((groupId: number, questions: QuestionBankFormPayload[]) =>
    runMutation(() => QuestionGroupService.addQuestions(groupId, questions)),
  [runMutation]);

  const linkQuestions = useCallback((groupId: number, questionIds: number[]) =>
    runMutation(() => QuestionGroupService.linkQuestions(groupId, questionIds)),
  [runMutation]);

  const unlinkQuestion = useCallback((groupId: number, questionId: number) =>
    runMutation(() => QuestionGroupService.unlinkQuestion(groupId, questionId)),
  [runMutation]);

  const reorderQuestions = useCallback((groupId: number, orderedQuestionIds: number[]) =>
    runMutation(() => QuestionGroupService.reorderQuestions(groupId, orderedQuestionIds)),
  [runMutation]);

  const groupOptions = useMemo(
    () => groups.map((group) => ({ value: group.id, label: group.title, type: group.groupType })),
    [groups],
  );

  return {
    filters,
    groups,
    groupOptions,
    activeGroup,
    total,
    isLoading,
    isMutating,
    errorMessage,
    setFilters,
    setActiveGroup,
    loadGroups,
    loadGroup,
    saveGroup,
    deleteGroup,
    addQuestions,
    linkQuestions,
    unlinkQuestion,
    reorderQuestions,
  };
}

export default useQuestionGroups;
