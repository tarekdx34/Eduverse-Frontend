import { useCallback, useMemo, useState } from 'react';
import QuestionBankService from '../services/api/questionBankService';
import type {
  BloomLevel,
  QuestionBankDifficulty,
  QuestionBankFillBlank,
  QuestionBankFormPayload,
  QuestionBankOption,
  QuestionBankQuestion,
  QuestionBankType,
} from '../types/questionBank';

const DEFAULT_OPTION_COUNT = 4;

const createDefaultOptions = (): QuestionBankOption[] =>
  Array.from({ length: DEFAULT_OPTION_COUNT }, (_, index) => ({
    optionText: '',
    isCorrect: index === 0,
  }));

export const createEmptyQuestionForm = (
  courseId?: number,
  chapterId?: number,
): Partial<QuestionBankFormPayload> => ({
  courseId,
  chapterId,
  questionType: 'mcq',
  difficulty: 'medium',
  bloomLevel: 'understanding',
  questionText: '',
  expectedAnswerText: '',
  hints: '',
  options: createDefaultOptions(),
  fillBlanks: [],
  attachments: [],
});

export function useQuestionForm(initial: Partial<QuestionBankFormPayload> = {}) {
  const [values, setValues] = useState<Partial<QuestionBankFormPayload>>({
    ...createEmptyQuestionForm(initial.courseId, initial.chapterId),
    ...initial,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedQuestion, setSavedQuestion] = useState<QuestionBankQuestion | null>(null);

  const setField = useCallback(<K extends keyof QuestionBankFormPayload>(
    field: K,
    value: QuestionBankFormPayload[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const setQuestionType = useCallback((questionType: QuestionBankType) => {
    setValues((current) => ({
      ...current,
      questionType,
      options: questionType === 'mcq' ? current.options?.length ? current.options : createDefaultOptions() : current.options,
      fillBlanks: questionType === 'fill_blanks' ? current.fillBlanks ?? [] : current.fillBlanks,
    }));
  }, []);

  const setDifficulty = useCallback((difficulty: QuestionBankDifficulty) => {
    setField('difficulty', difficulty);
  }, [setField]);

  const setBloomLevel = useCallback((bloomLevel: BloomLevel) => {
    setField('bloomLevel', bloomLevel);
  }, [setField]);

  const updateOption = useCallback((index: number, patch: Partial<QuestionBankOption>) => {
    setValues((current) => ({
      ...current,
      options: (current.options ?? createDefaultOptions()).map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    }));
  }, []);

  const addOption = useCallback(() => {
    setValues((current) => ({
      ...current,
      options: [...(current.options ?? []), { optionText: '', isCorrect: false }],
    }));
  }, []);

  const removeOption = useCallback((index: number) => {
    setValues((current) => ({
      ...current,
      options: (current.options ?? []).filter((_, optionIndex) => optionIndex !== index),
    }));
  }, []);

  const markSingleCorrectOption = useCallback((index: number) => {
    setValues((current) => ({
      ...current,
      options: (current.options ?? createDefaultOptions()).map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      })),
    }));
  }, []);

  const updateBlank = useCallback((index: number, patch: Partial<QuestionBankFillBlank>) => {
    setValues((current) => ({
      ...current,
      fillBlanks: (current.fillBlanks ?? []).map((blank, blankIndex) =>
        blankIndex === index ? { ...blank, ...patch } : blank,
      ),
    }));
  }, []);

  const addBlank = useCallback(() => {
    setValues((current) => ({
      ...current,
      fillBlanks: [
        ...(current.fillBlanks ?? []),
        { blankKey: `blank_${(current.fillBlanks?.length ?? 0) + 1}`, acceptableAnswer: '' },
      ],
    }));
  }, []);

  const removeBlank = useCallback((index: number) => {
    setValues((current) => ({
      ...current,
      fillBlanks: (current.fillBlanks ?? []).filter((_, blankIndex) => blankIndex !== index),
    }));
  }, []);

  const validate = useCallback(() => {
    const errors: string[] = [];
    if (!values.courseId) errors.push('Course is required');
    if (!values.chapterId) errors.push('Chapter is required');
    if (!values.questionType) errors.push('Question type is required');
    if (!values.difficulty) errors.push('Difficulty is required');
    if (!values.bloomLevel) errors.push('Bloom level is required');
    if (!values.questionText?.trim() && !values.questionFileId) {
      errors.push('Question text or question image is required');
    }
    if (values.questionType === 'mcq') {
      const options = values.options ?? [];
      if (options.length < 2) errors.push('MCQ questions need at least two options');
      if (options.some((option) => !option.optionText.trim())) errors.push('All options need text');
      if (!options.some((option) => option.isCorrect)) errors.push('Select at least one correct option');
    }
    if (values.questionType === 'fill_blanks') {
      const blanks = values.fillBlanks ?? [];
      if (blanks.length === 0) errors.push('Add at least one blank answer');
      if (blanks.some((blank) => !blank.blankKey.trim() || !blank.acceptableAnswer.trim())) {
        errors.push('Each blank needs a key and acceptable answer');
      }
    }
    if (
      ['written', 'essay', 'true_false'].includes(values.questionType ?? '') &&
      !values.expectedAnswerText?.trim()
    ) {
      errors.push('Expected answer is required');
    }
    return errors;
  }, [values]);

  const payload = useMemo(() => values as QuestionBankFormPayload, [values]);

  const save = useCallback(async (questionId?: number) => {
    const errors = validate();
    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      throw new Error(errors[0]);
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const result = questionId
        ? await QuestionBankService.update(questionId, payload)
        : await QuestionBankService.create(payload);
      setSavedQuestion(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save question';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [payload, validate]);

  return {
    values,
    payload,
    isSaving,
    errorMessage,
    savedQuestion,
    setValues,
    setField,
    setQuestionType,
    setDifficulty,
    setBloomLevel,
    updateOption,
    addOption,
    removeOption,
    markSingleCorrectOption,
    updateBlank,
    addBlank,
    removeBlank,
    validate,
    save,
  };
}

export default useQuestionForm;
