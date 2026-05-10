import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Plus, RefreshCw, Shuffle, X } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import { toast } from 'sonner';
import ChapterService, { CourseChapter } from '../../../../services/api/chapterService';
import ExamGenerationService, { GenerateExamPreviewResponse } from '../../../../services/api/examGenerationService';
import QuestionBankService, { BloomLevel, QuestionBankDifficulty, QuestionBankType } from '../../../../services/api/questionBankService';
import QuestionGroupService from '../../../../services/api/questionGroupService';
import type {
  ExamGenerationRule,
  ExamGenerationScope,
  ExamGenerationSection,
  ExamGroupSelectionMode,
  ExamMarkDistributionMode,
  ExamRoundingPolicy,
} from '../../../../types/examGenerator';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomDropdown } from '../CustomDropdown';

export interface ExamDraftPreviewRecord extends GenerateExamPreviewResponse {
  title: string;
  courseId: number;
  generatedAt: string;
  savedExamId?: number;
}

interface ExamGenerationModalProps {
  open: boolean;
  courseOptions: { value: string; label: string }[];
  onClose: () => void;
  onPreviewGenerated?: (preview: ExamDraftPreviewRecord) => void;
  onExamSaved?: (payload: { draftId: number; examId: number }) => void;
}

interface RuleState {
  scope: ExamGenerationScope;
  chapterId: string;
  chapterIds: string[];
  groupIds: string[];
  count: string;
  weightPerQuestion: string;
  questionType: string;
  difficulty: string;
  bloomLevel: string;
}

interface GroupOption {
  id: number;
  title: string;
  groupType?: string;
}

interface SectionState {
  title: string;
  instructions: string;
  totalMarks: string;
  answerPolicy: 'answer_all' | 'answer_any';
  requiredAnswerCount: string;
  rules: RuleState[];
}

interface DraftItemEditState {
  weight: string;
}

interface QuestionDetail {
  text: string;
  answer?: string;
  hints?: string;
  imageBlobUrl?: string;
}

// Renders text with inline ($...$) and display ($$...$$) LaTeX math.
const MathText = React.memo(({ text }: { text: string | undefined }) => {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  const inlineRe = /\$((?:[^$]|\\.)+?)\$/g;
  let last = 0;
  const segments: { start: number; end: number; math: string; display: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = displayRe.exec(text)) !== null)
    segments.push({ start: m.index, end: m.index + m[0].length, math: m[1], display: true });
  const covered = (pos: number) => segments.some((s) => pos >= s.start && pos < s.end);
  let im: RegExpExecArray | null;
  while ((im = inlineRe.exec(text)) !== null)
    if (!covered(im.index))
      segments.push({ start: im.index, end: im.index + im[0].length, math: im[1], display: false });
  segments.sort((a, b) => a.start - b.start);
  for (const seg of segments) {
    if (seg.start > last) parts.push(text.slice(last, seg.start));
    parts.push(
      seg.display
        ? <BlockMath key={seg.start} math={seg.math} />
        : <InlineMath key={seg.start} math={seg.math} />,
    );
    last = seg.end;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
});

const questionTypeOptions = [
  { value: '', label: 'Any type' },
  { value: 'written', label: 'Written' },
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blanks', label: 'Fill in the Blanks' },
  { value: 'essay', label: 'Essay' },
];

const difficultyOptions = [
  { value: '', label: 'Any difficulty' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const bloomOptions = [
  { value: '', label: 'Any bloom level' },
  { value: 'remembering', label: 'Remembering' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'applying', label: 'Applying' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'creating', label: 'Creating' },
];

const formatEnumLabel = (value?: string) => {
  if (!value) return 'Any';
  if (value.toLowerCase() === 'mcq') return 'MCQ';
  return value.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
};

const defaultRule = (): RuleState => ({
  scope: 'chapter',
  chapterId: '',
  chapterIds: [],
  groupIds: [],
  count: '',
  weightPerQuestion: '',
  questionType: '',
  difficulty: '',
  bloomLevel: '',
});

const defaultSection = (index = 0): SectionState => ({
  title: `Section ${String.fromCharCode(65 + index)}`,
  instructions: '',
  totalMarks: '',
  answerPolicy: 'answer_all',
  requiredAnswerCount: '',
  rules: [defaultRule()],
});

export function ExamGenerationModal({
  open,
  onClose,
  courseOptions,
  onPreviewGenerated,
  onExamSaved,
}: ExamGenerationModalProps) {
  const { isDark, primaryHex } = useTheme() as { isDark: boolean; primaryHex: string };
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [mode, setMode] = useState<'flat' | 'sectioned'>('flat');
  const [totalMarks, setTotalMarks] = useState('');
  const [markDistributionMode, setMarkDistributionMode] = useState<ExamMarkDistributionMode>('manual');
  const [roundingPolicy, setRoundingPolicy] = useState<ExamRoundingPolicy>('none');
  const [groupSelectionMode, setGroupSelectionMode] = useState<ExamGroupSelectionMode>('independent');
  const [seed, setSeed] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [rules, setRules] = useState<RuleState[]>([defaultRule()]);
  const [sections, setSections] = useState<SectionState[]>([defaultSection()]);
  const [availability, setAvailability] = useState<Record<string, unknown> | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);
  const [preview, setPreview] = useState<GenerateExamPreviewResponse | null>(null);
  const [previewGeneratedAt, setPreviewGeneratedAt] = useState('');
  const [itemEdits, setItemEdits] = useState<Record<number, DraftItemEditState>>({});
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [questionDetails, setQuestionDetails] = useState<Record<number, QuestionDetail>>({});
  const [localOrder, setLocalOrder] = useState<number[]>([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!open) {
      setGenerateError(null);
      setSaveError(null);
      setQuestionDetails((prev) => {
        Object.values(prev).forEach((d) => { if (d.imageBlobUrl) URL.revokeObjectURL(d.imageBlobUrl); });
        return {};
      });
    }
  }, [open]);

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      setRules((prev) => prev.map((r) => ({ ...r, chapterId: '' })));
      return;
    }
    ChapterService.listByCourse(courseId)
      .then((items) => {
        const safe = Array.isArray(items) ? items : [];
        setChapters(safe);
        setRules((prev) =>
          prev.map((r) => ({
            ...r,
            chapterId: safe.some((c) => String(c.id) === r.chapterId) ? r.chapterId : '',
          })),
        );
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load chapters'));

    QuestionGroupService.list({ courseId: Number(courseId), limit: 200 })
      .then((response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        setGroups(data.map((group: any) => ({
          id: Number(group.id),
          title: String(group.title ?? `Group #${group.id}`),
          groupType: group.groupType,
        })).filter((group) => Number.isFinite(group.id)));
      })
      .catch(() => setGroups([]));
  }, [courseId]);

  const totalWeight = useMemo(
    () => (mode === 'flat' ? rules : sections.flatMap((section) => section.rules))
      .reduce((sum, r) => sum + (Number(r.count) || 0) * (Number(r.weightPerQuestion) || 0), 0),
    [mode, rules, sections],
  );

  if (!open) return null;

  // ─── Theme ───────────────────────────────────────────────────────────────────
  const cardCls    = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls   = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2';
  const fieldCls   = `w-full px-3 py-2 rounded-lg border text-sm ${inputCls}`;
  const labelCls   = `block text-xs font-semibold uppercase tracking-wide mb-1 ${subCls}`;
  const sectionCls = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
  const secondaryCls = isDark
    ? 'px-4 py-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed'
    : 'px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed';
  const stepBadgeCls = isDark
    ? 'px-2 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-slate-200'
    : 'px-2 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700';

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const updateRule = (index: number, patch: Partial<RuleState>) =>
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const addRule = () => setRules((prev) => [...prev, defaultRule()]);
  const removeRule = (index: number) => setRules((prev) => prev.filter((_, i) => i !== index));

  const updateSection = (index: number, patch: Partial<SectionState>) =>
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, ...patch } : section)));

  const addSection = () => setSections((prev) => [...prev, defaultSection(prev.length)]);
  const removeSection = (index: number) => setSections((prev) => prev.filter((_, i) => i !== index));

  const updateSectionRule = (sectionIndex: number, ruleIndex: number, patch: Partial<RuleState>) =>
    setSections((prev) => prev.map((section, i) => {
      if (i !== sectionIndex) return section;
      return {
        ...section,
        rules: section.rules.map((rule, rIndex) => (rIndex === ruleIndex ? { ...rule, ...patch } : rule)),
      };
    }));

  const addSectionRule = (sectionIndex: number) =>
    setSections((prev) => prev.map((section, i) =>
      i === sectionIndex ? { ...section, rules: [...section.rules, defaultRule()] } : section,
    ));

  const removeSectionRule = (sectionIndex: number, ruleIndex: number) =>
    setSections((prev) => prev.map((section, i) =>
      i === sectionIndex
        ? { ...section, rules: section.rules.filter((_, rIndex) => rIndex !== ruleIndex) }
        : section,
    ));

  const chapterOptions = (hasCourse: boolean) =>
    hasCourse
      ? chapters.map((c) => ({ value: String(c.id), label: c.name }))
      : [];

  const toggleArrayValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const resetScopeFields = (scope: ExamGenerationScope): Partial<RuleState> => ({
    scope,
    chapterId: '',
    chapterIds: [],
    groupIds: [],
  });

  const toOptionalNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const buildRulePayload = (rule: RuleState): ExamGenerationRule => ({
    scope: rule.scope,
    chapterId: rule.scope === 'chapter' && rule.chapterId ? Number(rule.chapterId) : undefined,
    chapterIds: rule.scope === 'chapters' ? rule.chapterIds.map(Number) : undefined,
    groupIds: rule.scope === 'group' ? rule.groupIds.map(Number) : undefined,
    count: Number(rule.count),
    weightPerQuestion: Number(rule.weightPerQuestion),
    questionType: rule.questionType ? rule.questionType as QuestionBankType : undefined,
    difficulty: rule.difficulty ? rule.difficulty as QuestionBankDifficulty : undefined,
    bloomLevel: rule.bloomLevel ? rule.bloomLevel as BloomLevel : undefined,
  });

  const buildSectionsPayload = (): ExamGenerationSection[] => sections.map((section) => ({
    title: section.title.trim(),
    instructions: section.instructions.trim() || undefined,
    totalMarks: Number(section.totalMarks),
    answerPolicy: section.answerPolicy,
    requiredAnswerCount: section.answerPolicy === 'answer_any' ? Number(section.requiredAnswerCount) : undefined,
    rules: section.rules.map(buildRulePayload),
  }));

  const buildGenerationPayload = () => ({
    courseId: Number(courseId),
    title: title.trim(),
    totalMarks: toOptionalNumber(totalMarks),
    markDistributionMode,
    roundingPolicy,
    groupSelectionMode,
    seed: seed.trim() || undefined,
    durationMinutes: toOptionalNumber(durationMinutes),
    instructions: instructions.trim() || undefined,
    headerText: headerText.trim() || undefined,
    footerText: footerText.trim() || undefined,
    rules: mode === 'flat' ? rules.map(buildRulePayload) : undefined,
    sections: mode === 'sectioned' ? buildSectionsPayload() : undefined,
  });

  const validateRule = (rule: RuleState, label: string) => {
    if (rule.scope === 'chapter' && !rule.chapterId) return `${label} needs a chapter`;
    if (rule.scope === 'chapters' && rule.chapterIds.length === 0) return `${label} needs at least one chapter`;
    if (rule.scope === 'group' && rule.groupIds.length === 0) return `${label} needs at least one group`;
    if (!Number(rule.count) || Number(rule.count) < 1) return `${label} count must be at least 1`;
    if (!Number(rule.weightPerQuestion) || Number(rule.weightPerQuestion) <= 0) return `${label} weight must be greater than 0`;
    return null;
  };

  const validateGenerationForm = () => {
    if (!courseId || !title.trim()) return 'Course and title are required';
    if (mode === 'flat') {
      for (let index = 0; index < rules.length; index += 1) {
        const issue = validateRule(rules[index], `Rule ${index + 1}`);
        if (issue) return issue;
      }
    } else {
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
        const section = sections[sectionIndex];
        if (!section.title.trim()) return `Section ${sectionIndex + 1} needs a title`;
        if (!Number(section.totalMarks) || Number(section.totalMarks) <= 0) return `${section.title} needs total marks`;
        if (section.answerPolicy === 'answer_any' && (!Number(section.requiredAnswerCount) || Number(section.requiredAnswerCount) < 1)) {
          return `${section.title} needs a required answer count`;
        }
        for (let ruleIndex = 0; ruleIndex < section.rules.length; ruleIndex += 1) {
          const issue = validateRule(section.rules[ruleIndex], `${section.title} rule ${ruleIndex + 1}`);
          if (issue) return issue;
        }
      }
    }
    return null;
  };

  const checkAvailability = async () => {
    setGenerateError(null);
    const validationIssue = validateGenerationForm();
    if (validationIssue) {
      setGenerateError(validationIssue);
      return;
    }
    try {
      setCheckingAvailability(true);
      const result = await ExamGenerationService.checkGenerationAvailability(buildGenerationPayload());
      setAvailability(result as Record<string, unknown>);
      const shortages = Array.isArray((result as any)?.shortages) ? (result as any).shortages.length : 0;
      toast.success(shortages > 0 ? `Availability checked with ${shortages} shortage${shortages > 1 ? 's' : ''}` : 'Availability checked');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Availability check failed';
      setGenerateError(message);
      toast.error(message);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const buildItemEdits = (items: GenerateExamPreviewResponse['items']) =>
    items.reduce<Record<number, DraftItemEditState>>((acc, item) => {
      acc[item.id] = { weight: String(item.weight) };
      return acc;
    }, {});

  const fetchQuestionDetails = async (items: GenerateExamPreviewResponse['items']) => {
    const ids = [...new Set(items.map((i) => i.questionId))];
    const results = await Promise.allSettled(ids.map((id) => QuestionBankService.getById(id)));
    const map: Record<number, QuestionDetail> = {};
    await Promise.all(results.map(async (result, idx) => {
      if (result.status === 'fulfilled') {
        const q = result.value as Record<string, unknown>;
        const text = ((q.questionText ?? q.text ?? '') as string) || `Q#${ids[idx]}`;
        const answer = (q.expectedAnswerText ?? '') as string;
        const hints = (q.hints ?? '') as string;
        const fileId = q.questionFileId as number | null | undefined;
        let imageBlobUrl: string | undefined;
        if (fileId) {
          try {
            const blob = await QuestionBankService.downloadImageBlob(fileId);
            imageBlobUrl = URL.createObjectURL(blob);
          } catch { /* skip image silently */ }
        }
        map[ids[idx]] = { text, answer: answer || undefined, hints: hints || undefined, imageBlobUrl };
      } else {
        map[ids[idx]] = { text: `Q#${ids[idx]}` };
      }
    }));
    setQuestionDetails(map);
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const generatePreview = async () => {
    setGenerateError(null);
    const validationIssue = validateGenerationForm();
    if (validationIssue) { setGenerateError(validationIssue); return; }
    try {
      setLoading(true);
      const response = await ExamGenerationService.generatePreview(buildGenerationPayload());
      const generatedAt = new Date().toISOString();
      setDraftId(response.draftId);
      setPreview(response);
      setItemEdits(buildItemEdits(response.items));
      setPreviewGeneratedAt(generatedAt);
      setGeneratedExamId(null);
      setQuestionDetails({});
      setLocalOrder([...response.items].sort((a, b) => a.itemOrder - b.itemOrder).map((i) => i.id));
      setOrderDirty(false);
      void fetchQuestionDetails(response.items);
      onPreviewGenerated?.({ ...response, title: title.trim(), courseId: Number(courseId), generatedAt });
      toast.success(`Preview generated. Review draft #${response.draftId} below.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview generation failed';
      setGenerateError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderScopeTarget = (
    rule: RuleState,
    onPatch: (patch: Partial<RuleState>) => void,
  ) => {
    if (rule.scope === 'course') {
      return (
        <div className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-white text-gray-600'}`}>
          Entire course
        </div>
      );
    }
    if (rule.scope === 'chapter') {
      return (
        <CustomDropdown
          value={rule.chapterId}
          options={chapterOptions(!!courseId)}
          onChange={(v) => onPatch({ chapterId: v })}
          placeholder={!courseId ? 'Select course first' : chapters.length === 0 ? 'No chapters' : 'Chapter'}
          disabled={!courseId}
          fullWidth
        />
      );
    }
    if (rule.scope === 'chapters') {
      return (
        <div className={`max-h-28 overflow-y-auto rounded-lg border p-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
          {chapters.length === 0 ? (
            <p className={`text-xs ${subCls}`}>No chapters available</p>
          ) : chapters.map((chapter) => (
            <label key={chapter.id} className={`flex items-center gap-2 py-1 text-xs ${headingCls}`}>
              <input
                type="checkbox"
                checked={rule.chapterIds.includes(String(chapter.id))}
                onChange={() => onPatch({ chapterIds: toggleArrayValue(rule.chapterIds, String(chapter.id)) })}
              />
              {chapter.name}
            </label>
          ))}
        </div>
      );
    }
    return (
      <div className={`max-h-28 overflow-y-auto rounded-lg border p-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
        {groups.length === 0 ? (
          <p className={`text-xs ${subCls}`}>No question groups available</p>
        ) : groups.map((group) => (
          <label key={group.id} className={`flex items-center gap-2 py-1 text-xs ${headingCls}`}>
            <input
              type="checkbox"
              checked={rule.groupIds.includes(String(group.id))}
              onChange={() => onPatch({ groupIds: toggleArrayValue(rule.groupIds, String(group.id)) })}
            />
            {group.title}
          </label>
        ))}
      </div>
    );
  };

  const renderRuleEditor = (
    rule: RuleState,
    index: number,
    onPatch: (patch: Partial<RuleState>) => void,
    onRemove?: () => void,
  ) => (
    <div className={`rounded-xl border p-3 ${sectionCls}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2 items-end">
        <div className="lg:col-span-1">
          <label className={labelCls}>Scope</label>
          <CustomDropdown
            value={rule.scope}
            options={[
              { value: 'course', label: 'Course' },
              { value: 'chapter', label: 'Chapter' },
              { value: 'chapters', label: 'Chapters' },
              { value: 'group', label: 'Group' },
            ]}
            onChange={(value) => onPatch(resetScopeFields(value as ExamGenerationScope))}
            fullWidth
          />
        </div>
        <div className="lg:col-span-2">
          <label className={labelCls}>{rule.scope === 'group' ? 'Groups' : rule.scope === 'chapters' ? 'Chapters' : 'Target'}</label>
          {renderScopeTarget(rule, onPatch)}
        </div>
        <div className="lg:col-span-1">
          <label className={labelCls}>Count</label>
          <input type="number" min={1} value={rule.count} onChange={(e) => onPatch({ count: e.target.value })} className={fieldCls} placeholder="# questions" />
        </div>
        <div className="lg:col-span-1">
          <label className={labelCls}>Marks / Q</label>
          <input type="number" min={0.25} step={0.25} value={rule.weightPerQuestion} onChange={(e) => onPatch({ weightPerQuestion: e.target.value })} className={fieldCls} placeholder="Marks each" />
        </div>
        <div className="lg:col-span-1">
          <label className={labelCls}>Type</label>
          <CustomDropdown value={rule.questionType} options={questionTypeOptions} onChange={(v) => onPatch({ questionType: v })} fullWidth />
        </div>
        <div className="lg:col-span-1">
          <label className={labelCls}>Difficulty</label>
          <CustomDropdown value={rule.difficulty} options={difficultyOptions} onChange={(v) => onPatch({ difficulty: v })} fullWidth />
        </div>
        <div className="lg:col-span-1 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <label className={labelCls}>Bloom</label>
            <CustomDropdown value={rule.bloomLevel} options={bloomOptions} onChange={(v) => onPatch({ bloomLevel: v })} fullWidth />
          </div>
          {onRemove && (
            <button onClick={onRemove} className={`flex-shrink-0 p-2 rounded-lg border text-sm transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/10' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const saveExam = async () => {
    setSaveError(null);
    if (!draftId) { setSaveError('Generate a preview first before saving'); return; }
    try {
      setLoading(true);
      const exam = await ExamGenerationService.saveDraft(draftId);
      setGeneratedExamId(exam.id);
      onExamSaved?.({ draftId, examId: exam.id });
      toast.success('Exam saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save exam';
      setSaveError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateItemEditState = (itemId: number, patch: Partial<DraftItemEditState>) =>
    setItemEdits((prev) => ({ ...prev, [itemId]: { weight: '', ...prev[itemId], ...patch } }));

  const applyDraftItemChanges = async (itemId: number) => {
    if (!draftId || !preview) { toast.error('Generate preview first'); return; }
    const draftItem = preview.items.find((item) => item.id === itemId);
    if (!draftItem) return;
    const edit = itemEdits[itemId];
    if (!edit) return;
    const parsedWeight = Number(edit.weight);
    if (!Number.isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight === draftItem.weight) {
      toast.message('No changes to save for this item');
      return;
    }
    try {
      setUpdatingItemId(itemId);
      await ExamGenerationService.updateDraftItem(draftId, itemId, { weight: parsedWeight });
      const nextPreview: GenerateExamPreviewResponse = {
        ...preview,
        items: preview.items.map((item) =>
          item.id === itemId ? { ...item, weight: parsedWeight } : item,
        ),
      };
      nextPreview.totalWeight = nextPreview.items.reduce((sum, item) => sum + item.weight, 0);
      setPreview(nextPreview);
      setItemEdits((prev) => ({ ...prev, [itemId]: { weight: String(parsedWeight) } }));
      onPreviewGenerated?.({ ...nextPreview, title: title.trim(), courseId: Number(courseId), generatedAt: previewGeneratedAt || new Date().toISOString() });
      toast.success(`Draft item #${itemId} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update draft item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const moveItem = (itemId: number, direction: 'up' | 'down') => {
    setLocalOrder((prev) => {
      const idx = prev.indexOf(itemId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    if (!draftId || !preview || !orderDirty) return;
    // Assign sequential itemOrder values based on current localOrder positions.
    const baseOrders = [...preview.items].sort((a, b) => a.itemOrder - b.itemOrder).map((i) => i.itemOrder);
    const newOrders = localOrder.map((id, i) => ({ itemId: id, itemOrder: baseOrders[i] ?? i }));
    try {
      setSavingOrder(true);
      await ExamGenerationService.reorderDraftItems(draftId, newOrders);
      setPreview({
        ...preview,
        items: preview.items.map((item) => {
          const updated = newOrders.find((n) => n.itemId === item.id);
          return updated ? { ...item, itemOrder: updated.itemOrder } : item;
        }),
      });
      setOrderDirty(false);
      toast.success('Order saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`w-full max-w-5xl rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-auto ${cardCls}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${headingCls}`}>Generate Exam</h3>
            <p className={`text-sm ${subCls}`}>
              Follow this flow: Configure rules, generate preview, edit draft items, then save your final exam.
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={18} />
          </button>
        </div>

        {/* Step badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['1. Configure', '2. Generate Preview', '3. Edit Draft Items', '4. Save Exam'].map((step) => (
            <span key={step} className={stepBadgeCls}>{step}</span>
          ))}
        </div>

        {/* Title + Course */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Exam Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldCls}
              placeholder="Example: Midterm Exam - Web Development"
            />
          </div>
          <div>
            <label className={labelCls}>Course *</label>
            <CustomDropdown
              value={courseId}
              options={[{ value: '', label: 'Select course' }, ...courseOptions]}
              onChange={setCourseId}
              placeholder="Select course"
              fullWidth
            />
          </div>
        </div>

        {/* Advanced settings */}
        <section className={`mb-4 rounded-xl border p-4 ${sectionCls}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className={`text-sm font-semibold ${headingCls}`}>Generation Settings</h4>
              <p className={`text-xs ${subCls}`}>Match the mobile generator: marks, sections, seed, instructions, and grouping behavior.</p>
            </div>
            <div className={`inline-flex rounded-lg border p-1 ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white'}`}>
              <button
                type="button"
                onClick={() => setMode('flat')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${mode === 'flat' ? 'text-white' : subCls}`}
                style={{ backgroundColor: mode === 'flat' ? primaryHex : 'transparent' }}
              >
                Flat
              </button>
              <button
                type="button"
                onClick={() => setMode('sectioned')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${mode === 'sectioned' ? 'text-white' : subCls}`}
                style={{ backgroundColor: mode === 'sectioned' ? primaryHex : 'transparent' }}
              >
                Sectioned
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Total Marks</label>
              <input type="number" min={0} step={0.25} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className={fieldCls} placeholder="Optional" />
            </div>
            <div>
              <label className={labelCls}>Distribution</label>
              <CustomDropdown
                value={markDistributionMode}
                options={[
                  { value: 'manual', label: 'Manual' },
                  { value: 'weight_normalized', label: 'Weight Normalized' },
                  { value: 'equal', label: 'Equal' },
                ]}
                onChange={(value) => setMarkDistributionMode(value as ExamMarkDistributionMode)}
                fullWidth
              />
            </div>
            <div>
              <label className={labelCls}>Rounding</label>
              <CustomDropdown
                value={roundingPolicy}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'nearest_0_25', label: 'Nearest 0.25' },
                  { value: 'nearest_0_5', label: 'Nearest 0.5' },
                  { value: 'nearest_1', label: 'Nearest 1' },
                ]}
                onChange={(value) => setRoundingPolicy(value as ExamRoundingPolicy)}
                fullWidth
              />
            </div>
            <div>
              <label className={labelCls}>Grouped Questions</label>
              <CustomDropdown
                value={groupSelectionMode}
                options={[
                  { value: 'independent', label: 'Independent' },
                  { value: 'exclude_grouped', label: 'Exclude Grouped' },
                  { value: 'keep_group_together', label: 'Keep Together' },
                ]}
                onChange={(value) => setGroupSelectionMode(value as ExamGroupSelectionMode)}
                fullWidth
              />
            </div>
            <div>
              <label className={labelCls}>Seed</label>
              <div className="flex gap-2">
                <input value={seed} onChange={(e) => setSeed(e.target.value)} className={fieldCls} placeholder="Optional seed" />
                <button
                  type="button"
                  onClick={() => setSeed(Math.random().toString(36).slice(2, 10))}
                  className={secondaryCls}
                  title="Randomize seed"
                >
                  <Shuffle size={14} />
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className={fieldCls} placeholder="Minutes" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Header Text</label>
              <input value={headerText} onChange={(e) => setHeaderText(e.target.value)} className={fieldCls} placeholder="Optional exam header" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className={`${fieldCls} min-h-20 resize-y`} placeholder="Student-facing instructions" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Footer Text</label>
              <textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} className={`${fieldCls} min-h-20 resize-y`} placeholder="Optional footer" />
            </div>
          </div>
        </section>

        {mode === 'flat' ? (
          <>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <React.Fragment key={index}>
                  {renderRuleEditor(rule, index, (patch) => updateRule(index, patch), rules.length > 1 ? () => removeRule(index) : undefined)}
                </React.Fragment>
              ))}
            </div>
            <button onClick={addRule} className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${isDark ? 'border-white/10 text-slate-200 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              <Plus size={14} />
              Add Rule
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <section key={sectionIndex} className={`rounded-xl border p-4 ${sectionCls}`}>
                <div className="mb-3 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Section Title</label>
                    <input value={section.title} onChange={(e) => updateSection(sectionIndex, { title: e.target.value })} className={fieldCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Marks</label>
                    <input type="number" min={0.25} step={0.25} value={section.totalMarks} onChange={(e) => updateSection(sectionIndex, { totalMarks: e.target.value })} className={fieldCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Answer Policy</label>
                    <CustomDropdown
                      value={section.answerPolicy}
                      options={[
                        { value: 'answer_all', label: 'Answer All' },
                        { value: 'answer_any', label: 'Answer Any' },
                      ]}
                      onChange={(value) => updateSection(sectionIndex, { answerPolicy: value as 'answer_all' | 'answer_any' })}
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Required</label>
                    <input
                      type="number"
                      min={1}
                      value={section.requiredAnswerCount}
                      onChange={(e) => updateSection(sectionIndex, { requiredAnswerCount: e.target.value })}
                      disabled={section.answerPolicy !== 'answer_any'}
                      className={fieldCls}
                      placeholder={section.answerPolicy === 'answer_any' ? 'Count' : 'All'}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className={labelCls}>Section Instructions</label>
                    <textarea value={section.instructions} onChange={(e) => updateSection(sectionIndex, { instructions: e.target.value })} className={`${fieldCls} min-h-16 resize-y`} />
                  </div>
                </div>
                <div className="space-y-3">
                  {section.rules.map((rule, ruleIndex) => (
                    <React.Fragment key={ruleIndex}>
                      {renderRuleEditor(
                        rule,
                        ruleIndex,
                        (patch) => updateSectionRule(sectionIndex, ruleIndex, patch),
                        section.rules.length > 1 ? () => removeSectionRule(sectionIndex, ruleIndex) : undefined,
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => addSectionRule(sectionIndex)} className={secondaryCls}>
                    <Plus size={14} />
                    Add Section Rule
                  </button>
                  {sections.length > 1 && (
                    <button type="button" onClick={() => removeSection(sectionIndex)} className={secondaryCls}>
                      <X size={14} />
                      Remove Section
                    </button>
                  )}
                </div>
              </section>
            ))}
            <button type="button" onClick={addSection} className={secondaryCls}>
              <Plus size={14} />
              Add Section
            </button>
          </div>
        )}

        <div className={`mt-3 flex flex-wrap items-center gap-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          <span>Estimated total weight: {totalWeight}</span>
          <button type="button" onClick={() => void checkAvailability()} disabled={checkingAvailability || loading} className={secondaryCls}>
            {checkingAvailability ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Check Availability
          </button>
          {availability && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${Array.isArray((availability as any).shortages) && (availability as any).shortages.length > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
              {Array.isArray((availability as any).shortages) && (availability as any).shortages.length > 0
                ? `${(availability as any).shortages.length} shortage${(availability as any).shortages.length > 1 ? 's' : ''}`
                : 'Ready'}
            </span>
          )}
        </div>

        {availability && Array.isArray((availability as any).shortages) && (availability as any).shortages.length > 0 && (
          <div className={`mt-3 rounded-lg border p-3 ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide">Shortages</p>
            <div className="space-y-1 text-sm">
              {((availability as any).shortages as any[]).slice(0, 6).map((shortage, index) => (
                <p key={index}>
                  {shortage.message || `${shortage.sectionTitle ? `${shortage.sectionTitle}: ` : ''}Required ${shortage.requiredCount ?? '?'} / Available ${shortage.availableCount ?? 0}`}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Generating skeleton */}
        {loading && !draftId && (
          <div className={`mt-4 rounded-lg border p-4 ${sectionCls}`}>
            <p className={`text-sm font-semibold mb-3 ${headingCls}`}>Generating preview...</p>
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-10 rounded-md ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && !loading && (
          <section className={`mt-4 rounded-lg border p-4 ${sectionCls}`}>
            <h4 className={`text-sm font-semibold ${headingCls}`}>Preview Draft #{preview.draftId}</h4>
            <p className={`mt-1 text-sm ${subCls}`}>Review and edit each draft item before saving.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`px-2 py-1 rounded border text-xs sm:text-sm ${subCls} ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
                Questions: {preview.totalQuestions}
              </span>
              <span className={`px-2 py-1 rounded border text-xs sm:text-sm ${subCls} ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
                Total Weight: {preview.totalWeight}
              </span>
              {orderDirty && (
                <button
                  type="button"
                  onClick={() => void saveOrder()}
                  disabled={savingOrder}
                  className="ml-auto px-3 py-1 rounded-lg text-xs font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: primaryHex }}
                >
                  {savingOrder ? 'Saving...' : 'Save Order'}
                </button>
              )}
            </div>
            {preview.items.length > 0 && (
              <div className="mt-3 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {localOrder.map((id, sortedIdx) => {
                  const item = preview.items.find((i) => i.id === id);
                  if (!item) return null;
                  const detail = questionDetails[item.questionId];
                  const isFirst = sortedIdx === 0;
                  const isLast = sortedIdx === localOrder.length - 1;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'}`}
                    >
                      {/* Top row: up/down + number circle + text */}
                      <div className="flex items-start gap-3">
                        {/* Up/down arrows */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => moveItem(item.id, 'up')}
                            className={`p-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => moveItem(item.id, 'down')}
                            className={`p-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Number badge */}
                        <div
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                          style={{ backgroundColor: primaryHex }}
                        >
                          {sortedIdx + 1}
                        </div>

                        {/* Question body */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm leading-snug ${headingCls}`}>
                            {detail
                              ? <MathText text={detail.text} />
                              : <span className={`italic ${subCls}`}>Q#{item.questionId} — loading...</span>}
                          </div>

                          {/* Diagram */}
                          {detail?.imageBlobUrl && (
                            <div className="mt-2">
                              <img
                                src={detail.imageBlobUrl}
                                alt="Question diagram"
                                className={`max-h-40 rounded border object-contain ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                              />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.questionType && (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${primaryHex}20`, color: primaryHex }}>
                                {formatEnumLabel(item.questionType)}
                              </span>
                            )}
                            {item.difficulty && (
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                                {formatEnumLabel(item.difficulty)}
                              </span>
                            )}
                            {item.bloomLevel && (
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                                {formatEnumLabel(item.bloomLevel)}
                              </span>
                            )}
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                              {item.weight} mark{item.weight !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Answer */}
                          {detail?.answer && (
                            <div className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              <span className="font-semibold">Answer:</span>{' '}
                              <MathText text={detail.answer} />
                            </div>
                          )}

                          {/* Hint */}
                          {detail?.hints && (
                            <div className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                              <span className="font-semibold">Hint:</span>{' '}
                              <MathText text={detail.hints} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Weight edit row */}
                      <div className="mt-3 flex items-end gap-2">
                        <div className="w-36">
                          <label className={labelCls}>Weight</label>
                          <input
                            type="number"
                            min={0}
                            value={itemEdits[item.id]?.weight ?? ''}
                            onChange={(e) => updateItemEditState(item.id, { weight: e.target.value })}
                            className={fieldCls}
                            placeholder={String(item.weight)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void applyDraftItemChanges(item.id)}
                          disabled={loading || updatingItemId !== null}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: primaryHex }}
                        >
                          {updatingItemId === item.id ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin" /> Saving...
                            </span>
                          ) : 'Apply'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Success */}
        {generatedExamId && (
          <div className="mt-3 rounded-lg border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              Saved as <strong>Exam #{generatedExamId}</strong>. Find it in the <strong>Saved Exams</strong> tab.
            </p>
          </div>
        )}

        {/* Errors */}
        {generateError && (
          <div className={`mt-3 rounded-lg border p-3 flex items-start gap-2 ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="text-sm">{generateError}</span>
          </div>
        )}
        {saveError && (
          <div className={`mt-3 rounded-lg border p-3 flex items-start gap-2 ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="text-sm">{saveError}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className={secondaryCls}>Close</button>
          <button onClick={() => void generatePreview()} disabled={loading} className={secondaryCls}>
            {loading && !draftId ? <Loader2 size={16} className="animate-spin" /> : 'Generate Preview'}
          </button>
          <button
            onClick={() => void saveExam()}
            disabled={loading || !draftId}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryHex }}
          >
            {loading && !!draftId ? <Loader2 size={16} className="animate-spin inline" /> : 'Save Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamGenerationModal;
