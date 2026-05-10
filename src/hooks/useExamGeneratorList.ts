import { useCallback, useState } from 'react';
import ExamGenerationService from '../services/api/examGenerationService';
import type {
  ExamDraft,
  ExamDraftListParams,
  ExamListParams,
  ExamResponse,
  ExamStats,
} from '../types/examGenerator';

export function useExamGeneratorList(initialExamFilters: ExamListParams = {}) {
  const [examFilters, setExamFilters] = useState<ExamListParams>(initialExamFilters);
  const [draftFilters, setDraftFilters] = useState<ExamDraftListParams>({
    courseId: initialExamFilters.courseId,
  });
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [drafts, setDrafts] = useState<ExamDraft[]>([]);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [examTotal, setExamTotal] = useState(0);
  const [draftTotal, setDraftTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExams = useCallback(async (nextFilters: ExamListParams = examFilters) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.listExams(nextFilters);
      setExamFilters(nextFilters);
      setExams(result.data ?? []);
      setExamTotal(result.total ?? result.data?.length ?? 0);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load exams';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [examFilters]);

  const loadDrafts = useCallback(async (nextFilters: ExamDraftListParams = draftFilters) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.listDrafts(nextFilters);
      setDraftFilters(nextFilters);
      setDrafts(result.data ?? []);
      setDraftTotal(result.total ?? result.data?.length ?? 0);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load exam drafts';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [draftFilters]);

  const loadStats = useCallback(async (courseId?: number) => {
    const result = await ExamGenerationService.getExamStats({ courseId });
    setStats(result);
    return result;
  }, []);

  const refresh = useCallback(async () => {
    return Promise.all([
      loadExams(examFilters),
      loadDrafts(draftFilters),
      loadStats(examFilters.courseId ?? draftFilters.courseId),
    ]);
  }, [draftFilters, examFilters, loadDrafts, loadExams, loadStats]);

  const runLifecycle = useCallback(async (examId: number, action: string, reason?: string) => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.lifecycle(examId, action, reason);
      await refresh();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Exam lifecycle action failed';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  const saveDraft = useCallback(async (draftId: number) => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.saveDraft(draftId);
      await refresh();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  return {
    examFilters,
    draftFilters,
    exams,
    drafts,
    stats,
    examTotal,
    draftTotal,
    isLoading,
    isMutating,
    errorMessage,
    setExamFilters,
    setDraftFilters,
    loadExams,
    loadDrafts,
    loadStats,
    refresh,
    runLifecycle,
    publishExam: (examId: number, reason?: string) => runLifecycle(examId, 'publish', reason),
    archiveExam: (examId: number, reason?: string) => runLifecycle(examId, 'archive', reason),
    saveDraft,
  };
}

export default useExamGeneratorList;
