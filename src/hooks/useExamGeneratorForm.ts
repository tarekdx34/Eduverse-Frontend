import { useCallback, useMemo, useState } from 'react';
import ExamGenerationService from '../services/api/examGenerationService';
import type {
  ExamAvailability,
  ExamGenerationPayload,
  ExamGenerationRule,
  ExamGenerationSection,
  ExamGroupSelectionMode,
  ExamMarkDistributionMode,
  ExamRoundingPolicy,
} from '../types/examGenerator';

const defaultRule = (): ExamGenerationRule => ({
  scope: 'chapter',
  count: 1,
  weightPerQuestion: 1,
});

const defaultSection = (): ExamGenerationSection => ({
  title: 'Section A',
  totalMarks: 10,
  answerPolicy: 'answer_all',
  rules: [defaultRule()],
});

export function useExamGeneratorForm(initialCourseId?: number) {
  const [courseId, setCourseId] = useState<number | undefined>(initialCourseId);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'flat' | 'sectioned'>('flat');
  const [totalMarks, setTotalMarks] = useState<number | undefined>(undefined);
  const [markDistributionMode, setMarkDistributionMode] =
    useState<ExamMarkDistributionMode>('manual');
  const [roundingPolicy, setRoundingPolicy] = useState<ExamRoundingPolicy>('none');
  const [groupSelectionMode, setGroupSelectionMode] =
    useState<ExamGroupSelectionMode>('independent');
  const [seed, setSeed] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined);
  const [instructions, setInstructions] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [rules, setRules] = useState<ExamGenerationRule[]>([defaultRule()]);
  const [sections, setSections] = useState<ExamGenerationSection[]>([defaultSection()]);
  const [availability, setAvailability] = useState<ExamAvailability | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDraftId, setCreatedDraftId] = useState<number | null>(null);

  const validateRule = useCallback((rule: ExamGenerationRule, label: string) => {
    const errors: string[] = [];
    const scope = rule.scope ?? (rule.chapterId ? 'chapter' : 'course');
    if (scope === 'chapter' && !rule.chapterId) errors.push(`${label}: chapter is required`);
    if (scope === 'chapters' && (!rule.chapterIds || rule.chapterIds.length === 0)) {
      errors.push(`${label}: select at least one chapter`);
    }
    if (scope === 'group' && (!rule.groupIds || rule.groupIds.length === 0)) {
      errors.push(`${label}: select at least one group`);
    }
    if (!Number.isFinite(rule.count) || rule.count <= 0) errors.push(`${label}: count must be positive`);
    if (!Number.isFinite(rule.weightPerQuestion) || rule.weightPerQuestion <= 0) {
      errors.push(`${label}: weight must be positive`);
    }
    return errors;
  }, []);

  const validate = useCallback(() => {
    const errors: string[] = [];
    if (!courseId) errors.push('Course is required');
    if (!title.trim()) errors.push('Title is required');
    if (mode === 'flat') {
      if (rules.length === 0) errors.push('Add at least one generation rule');
      rules.forEach((rule, index) => errors.push(...validateRule(rule, `Rule ${index + 1}`)));
    } else {
      if (sections.length === 0) errors.push('Add at least one section');
      sections.forEach((section, sectionIndex) => {
        if (!section.title.trim()) errors.push(`Section ${sectionIndex + 1}: title is required`);
        if (!Number.isFinite(section.totalMarks) || section.totalMarks <= 0) {
          errors.push(`Section ${sectionIndex + 1}: total marks must be positive`);
        }
        if (section.answerPolicy === 'answer_any' && (!section.requiredAnswerCount || section.requiredAnswerCount <= 0)) {
          errors.push(`Section ${sectionIndex + 1}: required answer count is required`);
        }
        if (section.rules.length === 0) errors.push(`Section ${sectionIndex + 1}: add at least one rule`);
        section.rules.forEach((rule, ruleIndex) =>
          errors.push(...validateRule(rule, `Section ${sectionIndex + 1}, rule ${ruleIndex + 1}`)),
        );
      });
    }
    return errors;
  }, [courseId, mode, rules, sections, title, validateRule]);

  const buildPayload = useCallback((): ExamGenerationPayload => ({
    courseId: Number(courseId),
    title: title.trim(),
    totalMarks,
    markDistributionMode,
    roundingPolicy,
    groupSelectionMode,
    seed: seed.trim() || undefined,
    durationMinutes,
    instructions: instructions.trim() || undefined,
    headerText: headerText.trim() || undefined,
    footerText: footerText.trim() || undefined,
    rules: mode === 'flat' ? rules : undefined,
    sections: mode === 'sectioned' ? sections : undefined,
  }), [
    courseId,
    durationMinutes,
    footerText,
    groupSelectionMode,
    headerText,
    instructions,
    markDistributionMode,
    mode,
    roundingPolicy,
    rules,
    sections,
    seed,
    title,
    totalMarks,
  ]);

  const randomizeSeed = useCallback(() => {
    setSeed(Math.random().toString(36).slice(2, 10));
  }, []);

  const checkAvailability = useCallback(async () => {
    const errors = validate();
    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      return null;
    }

    setIsCheckingAvailability(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.checkGenerationAvailability(buildPayload());
      setAvailability(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check availability';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [buildPayload, validate]);

  const submit = useCallback(async () => {
    const errors = validate();
    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      throw new Error(errors[0]);
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const draft = await ExamGenerationService.generatePreview(buildPayload());
      setCreatedDraftId(draft.draftId ?? draft.id ?? null);
      return draft;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate draft';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [buildPayload, validate]);

  const shortages = useMemo(() => availability?.shortages ?? [], [availability]);

  return {
    courseId,
    title,
    mode,
    totalMarks,
    markDistributionMode,
    roundingPolicy,
    groupSelectionMode,
    seed,
    durationMinutes,
    instructions,
    headerText,
    footerText,
    rules,
    sections,
    availability,
    shortages,
    isCheckingAvailability,
    isSubmitting,
    errorMessage,
    createdDraftId,
    setCourseId,
    setTitle,
    setMode,
    setTotalMarks,
    setMarkDistributionMode,
    setRoundingPolicy,
    setGroupSelectionMode,
    setSeed,
    setDurationMinutes,
    setInstructions,
    setHeaderText,
    setFooterText,
    setRules,
    setSections,
    randomizeSeed,
    clearSeed: () => setSeed(''),
    validate,
    buildPayload,
    checkAvailability,
    submit,
  };
}

export default useExamGeneratorForm;
