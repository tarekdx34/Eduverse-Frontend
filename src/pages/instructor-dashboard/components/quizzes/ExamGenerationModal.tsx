import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Plus, X } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import { toast } from 'sonner';
import ChapterService, { CourseChapter } from '../../../../services/api/chapterService';
import ExamGenerationService, { GenerateExamPreviewResponse } from '../../../../services/api/examGenerationService';
import QuestionBankService, { BloomLevel, QuestionBankDifficulty, QuestionBankType } from '../../../../services/api/questionBankService';
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
  chapterId: string;
  count: string;
  weightPerQuestion: string;
  questionType: string;
  difficulty: string;
  bloomLevel: string;
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
  chapterId: '',
  count: '',
  weightPerQuestion: '',
  questionType: '',
  difficulty: '',
  bloomLevel: '',
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
  const [rules, setRules] = useState<RuleState[]>([defaultRule()]);
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
  }, [courseId]);

  const totalWeight = useMemo(
    () => rules.reduce((sum, r) => sum + (Number(r.count) || 0) * (Number(r.weightPerQuestion) || 0), 0),
    [rules],
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

  const chapterOptions = (hasCourse: boolean) =>
    hasCourse
      ? chapters.map((c) => ({ value: String(c.id), label: c.name }))
      : [];

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
    if (!courseId || !title.trim()) { setGenerateError('Course and title are required'); return; }
    const invalid = rules.find((r) => !r.chapterId || !Number(r.count) || Number(r.count) < 1 || Number(r.weightPerQuestion) < 0);
    if (invalid) { setGenerateError('Each rule must include a chapter, count ≥ 1, and a non-negative weight'); return; }
    try {
      setLoading(true);
      const response = await ExamGenerationService.generatePreview({
        courseId: Number(courseId),
        title,
        rules: rules.map((r) => ({
          chapterId: Number(r.chapterId),
          count: Number(r.count),
          weightPerQuestion: Number(r.weightPerQuestion) || 0,
          questionType: r.questionType as QuestionBankType || undefined,
          difficulty: r.difficulty as QuestionBankDifficulty || undefined,
          bloomLevel: r.bloomLevel as BloomLevel || undefined,
        })),
      });
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

        {/* Rules */}
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className={`rounded-xl border p-3 ${sectionCls}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end">
                {/* Chapter */}
                <div className="lg:col-span-1">
                  <label className={labelCls}>Chapter</label>
                  <CustomDropdown
                    value={rule.chapterId}
                    options={chapterOptions(!!courseId)}
                    onChange={(v) => updateRule(index, { chapterId: v })}
                    placeholder={!courseId ? 'Select course first' : chapters.length === 0 ? 'No chapters' : 'Chapter'}
                    disabled={!courseId}
                    fullWidth
                  />
                </div>
                {/* Count */}
                <div className="lg:col-span-1">
                  <label className={labelCls}>Count</label>
                  <input
                    type="number"
                    min={1}
                    value={rule.count}
                    onChange={(e) => updateRule(index, { count: e.target.value })}
                    className={fieldCls}
                    placeholder="# questions"
                  />
                </div>
                {/* Weight */}
                <div className="lg:col-span-1">
                  <label className={labelCls}>Weight / Q</label>
                  <input
                    type="number"
                    min={0}
                    value={rule.weightPerQuestion}
                    onChange={(e) => updateRule(index, { weightPerQuestion: e.target.value })}
                    className={fieldCls}
                    placeholder="Marks each"
                  />
                </div>
                {/* Type */}
                <div className="lg:col-span-1">
                  <label className={labelCls}>Type</label>
                  <CustomDropdown
                    value={rule.questionType}
                    options={questionTypeOptions}
                    onChange={(v) => updateRule(index, { questionType: v })}
                    fullWidth
                  />
                </div>
                {/* Difficulty */}
                <div className="lg:col-span-1">
                  <label className={labelCls}>Difficulty</label>
                  <CustomDropdown
                    value={rule.difficulty}
                    options={difficultyOptions}
                    onChange={(v) => updateRule(index, { difficulty: v })}
                    fullWidth
                  />
                </div>
                {/* Bloom + remove */}
                <div className="lg:col-span-1 flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <label className={labelCls}>Bloom</label>
                    <CustomDropdown
                      value={rule.bloomLevel}
                      options={bloomOptions}
                      onChange={(v) => updateRule(index, { bloomLevel: v })}
                      fullWidth
                    />
                  </div>
                  {rules.length > 1 && (
                    <button
                      onClick={() => removeRule(index)}
                      className={`flex-shrink-0 p-2 rounded-lg border text-sm transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/10' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRule}
          className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${isDark ? 'border-white/10 text-slate-200 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
        >
          <Plus size={14} />
          Add Rule
        </button>

        <div className={`mt-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          Estimated total weight: {totalWeight}
        </div>

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
