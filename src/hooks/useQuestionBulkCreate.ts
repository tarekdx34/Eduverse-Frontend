import { useCallback, useMemo, useState } from 'react';
import QuestionBankService from '../services/api/questionBankService';
import type {
  QuestionBankFormPayload,
  QuestionBulkCreateResult,
  QuestionBulkRow,
} from '../types/questionBank';
import { createEmptyQuestionForm } from './useQuestionForm';

const validateRow = (row: QuestionBulkRow, index: number) => {
  const errors: string[] = [];
  const rowLabel = `Row ${row.rowNumber ?? index + 1}`;
  if (!row.chapterId) errors.push(`${rowLabel}: chapter is required`);
  if (!row.questionType) errors.push(`${rowLabel}: question type is required`);
  if (!row.difficulty) errors.push(`${rowLabel}: difficulty is required`);
  if (!row.bloomLevel) errors.push(`${rowLabel}: bloom level is required`);
  if (!row.questionText?.trim() && !row.questionFileId) {
    errors.push(`${rowLabel}: question text or image is required`);
  }
  if (row.questionType === 'mcq' && !(row.options ?? []).some((option) => option.isCorrect)) {
    errors.push(`${rowLabel}: select a correct MCQ option`);
  }
  if (row.questionType === 'fill_blanks' && (row.fillBlanks ?? []).length === 0) {
    errors.push(`${rowLabel}: add at least one blank answer`);
  }
  return errors;
};

export function useQuestionBulkCreate(courseId?: number, defaultChapterId?: number) {
  const [rows, setRows] = useState<QuestionBulkRow[]>([
    {
      ...createEmptyQuestionForm(courseId, defaultChapterId),
      rowNumber: 1,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuestionBulkCreateResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addRow = useCallback((row: QuestionBulkRow = {}) => {
    setRows((current) => [
      ...current,
      {
        ...createEmptyQuestionForm(courseId, defaultChapterId),
        ...row,
        rowNumber: current.length + 1,
      },
    ]);
  }, [courseId, defaultChapterId]);

  const updateRow = useCallback((index: number, patch: QuestionBulkRow) => {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows((current) =>
      current
        .filter((_, rowIndex) => rowIndex !== index)
        .map((row, rowIndex) => ({ ...row, rowNumber: rowIndex + 1 })),
    );
  }, []);

  const validationErrors = useMemo(
    () => rows.flatMap((row, index) => validateRow(row, index)),
    [rows],
  );

  const validRows = useMemo(
    () => rows.filter((row, index) => validateRow(row, index).length === 0),
    [rows],
  );

  const submit = useCallback(async () => {
    if (!courseId) {
      setErrorMessage('Course is required');
      throw new Error('Course is required');
    }
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors[0]);
      throw new Error(validationErrors[0]);
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await QuestionBankService.createBatch({
        courseId,
        defaultChapterId,
        questions: rows.map((row) => ({
          ...row,
          courseId,
          chapterId: row.chapterId ?? defaultChapterId,
        })) as QuestionBankFormPayload[],
      });
      setResult(response);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create questions';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [courseId, defaultChapterId, rows, validationErrors]);

  return {
    rows,
    validRows,
    validationErrors,
    isSubmitting,
    result,
    errorMessage,
    setRows,
    addRow,
    updateRow,
    removeRow,
    submit,
  };
}

export default useQuestionBulkCreate;
