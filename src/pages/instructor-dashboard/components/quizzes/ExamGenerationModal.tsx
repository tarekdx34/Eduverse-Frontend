import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import ChapterService, { CourseChapter } from '../../../../services/api/chapterService';
import ExamGenerationService, { GenerateExamPreviewResponse } from '../../../../services/api/examGenerationService';
import { BloomLevel, QuestionBankDifficulty, QuestionBankType } from '../../../../services/api/questionBankService';
import { useTheme } from '../../contexts/ThemeContext';

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
  count: number;
  weightPerQuestion: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
}

interface DraftItemEditState {
  replacementQuestionId: string;
  weight: string;
  itemOrder: string;
}

const questionTypeOptions: QuestionBankType[] = ['written', 'mcq', 'true_false', 'fill_blanks', 'essay'];
const difficultyOptions: QuestionBankDifficulty[] = ['easy', 'medium', 'hard'];
const bloomOptions: BloomLevel[] = [
  'remembering',
  'understanding',
  'applying',
  'analyzing',
  'evaluating',
  'creating',
];

const toQuestionType = (value: string): QuestionBankType | undefined =>
  questionTypeOptions.includes(value as QuestionBankType) ? (value as QuestionBankType) : undefined;
const toDifficulty = (value: string): QuestionBankDifficulty | undefined =>
  difficultyOptions.includes(value as QuestionBankDifficulty) ? (value as QuestionBankDifficulty) : undefined;
const toBloom = (value: string): BloomLevel | undefined =>
  bloomOptions.includes(value as BloomLevel) ? (value as BloomLevel) : undefined;

const formatEnumLabel = (value?: string) => {
  if (!value) return 'Any';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export function ExamGenerationModal({
  open,
  onClose,
  courseOptions,
  onPreviewGenerated,
  onExamSaved,
}: ExamGenerationModalProps) {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [rules, setRules] = useState<RuleState[]>([{ chapterId: '', count: 1, weightPerQuestion: 1 }]);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);
  const [preview, setPreview] = useState<GenerateExamPreviewResponse | null>(null);
  const [previewGeneratedAt, setPreviewGeneratedAt] = useState('');
  const [itemEdits, setItemEdits] = useState<Record<number, DraftItemEditState>>({});
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      setRules((previous) => previous.map((rule) => ({ ...rule, chapterId: '' })));
      return;
    }

    ChapterService.listByCourse(courseId)
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setChapters(safeItems);
        setRules((previous) =>
          previous.map((rule) => {
            if (rule.chapterId && safeItems.some((chapter) => String(chapter.id) === rule.chapterId)) {
              return rule;
            }
            return { ...rule, chapterId: '' };
          }),
        );
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load chapters'));
  }, [courseId]);

  const totalWeight = useMemo(
    () => rules.reduce((sum, rule) => sum + rule.count * rule.weightPerQuestion, 0),
    [rules],
  );

  if (!open) return null;

  const cardCls = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const fieldClass = `w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`;
  const labelClass = `text-sm font-medium ${subCls}`;
  const helperClass = `text-sm ${subCls}`;
  const secondaryButtonClass =
    'px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed';
  const stepBadgeClass =
    'px-2 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200';
  const sectionCls = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';

  const updateRule = (index: number, patch: Partial<RuleState>) => {
    setRules((prev) => prev.map((rule, idx) => (idx === index ? { ...rule, ...patch } : rule)));
  };

  const buildItemEdits = (items: GenerateExamPreviewResponse['items']) =>
    items.reduce<Record<number, DraftItemEditState>>((acc, item) => {
      acc[item.id] = {
        replacementQuestionId: '',
        weight: String(item.weight),
        itemOrder: String(item.itemOrder),
      };
      return acc;
    }, {});

  const addRule = () => setRules((prev) => [...prev, { chapterId: '', count: 1, weightPerQuestion: 1 }]);
  const removeRule = (index: number) => setRules((prev) => prev.filter((_, idx) => idx !== index));

  const generatePreview = async () => {
    if (!courseId || !title.trim()) {
      toast.error('Course and title are required');
      return;
    }

    const invalid = rules.find((rule) => !rule.chapterId || rule.count < 1 || rule.weightPerQuestion < 0);
    if (invalid) {
      toast.error('Each rule must include chapter, count >= 1, and non-negative weight');
      return;
    }

    try {
      setLoading(true);
      const response = await ExamGenerationService.generatePreview({
        courseId: Number(courseId),
        title,
        rules: rules.map((rule) => ({
          chapterId: Number(rule.chapterId),
          count: rule.count,
          weightPerQuestion: rule.weightPerQuestion,
          questionType: rule.questionType,
          difficulty: rule.difficulty,
          bloomLevel: rule.bloomLevel,
        })),
      });
      const generatedAt = new Date().toISOString();
      setDraftId(response.draftId);
      setPreview(response);
      setItemEdits(buildItemEdits(response.items));
      setPreviewGeneratedAt(generatedAt);
      setGeneratedExamId(null);
      onPreviewGenerated?.({
        ...response,
        title: title.trim(),
        courseId: Number(courseId),
        generatedAt,
      });
      toast.success(`Preview generated. Review draft #${response.draftId} below.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Preview generation failed');
    } finally {
      setLoading(false);
    }
  };

  const saveExam = async () => {
    if (!draftId) {
      toast.error('Generate preview first');
      return;
    }
    try {
      setLoading(true);
      const exam = await ExamGenerationService.saveDraft(draftId);
      setGeneratedExamId(exam.id);
      onExamSaved?.({ draftId, examId: exam.id });
      toast.success('Exam saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const updateItemEditState = (itemId: number, patch: Partial<DraftItemEditState>) => {
    setItemEdits((previous) => ({
      ...previous,
      [itemId]: {
        replacementQuestionId: previous[itemId]?.replacementQuestionId ?? '',
        weight: previous[itemId]?.weight ?? '',
        itemOrder: previous[itemId]?.itemOrder ?? '',
        ...patch,
      },
    }));
  };

  const applyDraftItemChanges = async (itemId: number) => {
    if (!draftId || !preview) {
      toast.error('Generate preview first');
      return;
    }

    const draftItem = preview.items.find((item) => item.id === itemId);
    if (!draftItem) return;

    const edit = itemEdits[itemId];
    if (!edit) return;

    const payload: Record<string, number> = {};
    const parsedWeight = Number(edit.weight);
    const parsedItemOrder = Number(edit.itemOrder);
    const parsedReplacementQuestionId = Number(edit.replacementQuestionId);

    if (Number.isFinite(parsedWeight) && parsedWeight >= 0 && parsedWeight !== draftItem.weight) {
      payload.weight = parsedWeight;
    }

    if (
      Number.isFinite(parsedItemOrder) &&
      parsedItemOrder >= 0 &&
      parsedItemOrder !== draftItem.itemOrder
    ) {
      payload.itemOrder = parsedItemOrder;
    }

    if (
      edit.replacementQuestionId.trim() &&
      Number.isFinite(parsedReplacementQuestionId) &&
      parsedReplacementQuestionId > 0 &&
      parsedReplacementQuestionId !== draftItem.questionId
    ) {
      payload.replacementQuestionId = parsedReplacementQuestionId;
    }

    if (Object.keys(payload).length === 0) {
      toast.message('No changes to save for this item');
      return;
    }

    try {
      setUpdatingItemId(itemId);
      await ExamGenerationService.updateDraftItem(draftId, itemId, payload);

      const nextPreview: GenerateExamPreviewResponse = {
        ...preview,
        items: preview.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                weight: payload.weight ?? item.weight,
                itemOrder: payload.itemOrder ?? item.itemOrder,
                questionId: payload.replacementQuestionId ?? item.questionId,
              }
            : item,
        ),
      };
      nextPreview.totalWeight = nextPreview.items.reduce((sum, item) => sum + item.weight, 0);

      setPreview(nextPreview);
      setItemEdits((previous) => ({
        ...previous,
        [itemId]: {
          replacementQuestionId: '',
          weight: String(payload.weight ?? draftItem.weight),
          itemOrder: String(payload.itemOrder ?? draftItem.itemOrder),
        },
      }));

      onPreviewGenerated?.({
        ...nextPreview,
        title: title.trim(),
        courseId: Number(courseId),
        generatedAt: previewGeneratedAt || new Date().toISOString(),
      });
      toast.success(`Draft item #${itemId} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update draft item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`w-full max-w-5xl rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-auto ${cardCls}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${headingCls}`}>Generate Exam</h3>
            <p className={helperClass}>
              Follow this flow: Configure rules, generate preview, edit draft items, then save your final exam.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className={stepBadgeClass}>1. Configure</span>
          <span className={stepBadgeClass}>2. Generate Preview</span>
          <span className={stepBadgeClass}>3. Edit Draft Items</span>
          <span className={stepBadgeClass}>4. Save Exam</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className={labelClass}>Exam Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="Example: Midterm Exam - Web Development"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Course *</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={fieldClass}>
              <option value="">Select course</option>
              {courseOptions.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 md:grid-cols-6 gap-2 border rounded-lg p-3 ${sectionCls}`}
            >
              <select
                value={rule.chapterId}
                onChange={(e) => updateRule(index, { chapterId: e.target.value })}
                className={fieldClass}
              >
                <option value="">{chapters.length > 0 ? 'Chapter' : 'Select course first'}</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={rule.count}
                onChange={(e) => updateRule(index, { count: Number(e.target.value || 1) })}
                className={fieldClass}
                placeholder="Count"
              />
              <input
                type="number"
                min={0}
                value={rule.weightPerQuestion}
                onChange={(e) => updateRule(index, { weightPerQuestion: Number(e.target.value || 0) })}
                className={fieldClass}
                placeholder="Weight/question"
              />
              <select
                value={rule.questionType || ''}
                onChange={(e) => updateRule(index, { questionType: toQuestionType(e.target.value) })}
                className={fieldClass}
              >
                <option value="">Any type</option>
                {questionTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={rule.difficulty || ''}
                onChange={(e) => updateRule(index, { difficulty: toDifficulty(e.target.value) })}
                className={fieldClass}
              >
                <option value="">Any difficulty</option>
                {difficultyOptions.map((difficultyValue) => (
                  <option key={difficultyValue} value={difficultyValue}>
                    {difficultyValue}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={rule.bloomLevel || ''}
                  onChange={(e) => updateRule(index, { bloomLevel: toBloom(e.target.value) })}
                  className={fieldClass}
                >
                  <option value="">Any bloom</option>
                  {bloomOptions.map((bloomValue) => (
                    <option key={bloomValue} value={bloomValue}>
                      {bloomValue}
                    </option>
                  ))}
                </select>
                {rules.length > 1 && (
                  <button
                    onClick={() => removeRule(index)}
                    className="px-2 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRule}
          className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <Plus size={14} />
          Add Rule
        </button>

        <div className="mt-4 text-sm font-medium text-gray-700 dark:text-slate-300">Total weight: {totalWeight}</div>

        {preview && (
          <section className={`mt-4 rounded-lg border p-4 ${sectionCls}`}>
            <h4 className={`text-sm font-semibold ${headingCls}`}>
              Preview Draft #{preview.draftId}
            </h4>
            <p className={`mt-1 text-sm ${subCls}`}>
              Review and edit each draft item. Changes save through the draft-item patch endpoint before final publish.
            </p>
            <div className={`mt-3 flex flex-wrap gap-3 text-xs sm:text-sm ${subCls}`}>
              <span className="px-2 py-1 rounded bg-white border border-gray-200 dark:bg-white/10 dark:border-white/10">
                Questions: {preview.totalQuestions}
              </span>
              <span className="px-2 py-1 rounded bg-white border border-gray-200 dark:bg-white/10 dark:border-white/10">
                Total Weight: {preview.totalWeight}
              </span>
            </div>
            {preview.items.length > 0 && (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {preview.items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded border px-3 py-2 text-sm ${isDark ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'}`}
                  >
                    <div className={`font-medium ${headingCls}`}>
                      Q#{item.questionId} • Chapter {item.chapterId} • Weight {item.weight}
                    </div>
                    <div className={`text-xs ${subCls}`}>
                      {formatEnumLabel(item.questionType)} • {formatEnumLabel(item.difficulty)} •{' '}
                      {formatEnumLabel(item.bloomLevel)}
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className={labelClass}>Weight</label>
                        <input
                          type="number"
                          min={0}
                          value={itemEdits[item.id]?.weight ?? String(item.weight)}
                          onChange={(event) => updateItemEditState(item.id, { weight: event.target.value })}
                          className={fieldClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>Item Order</label>
                        <input
                          type="number"
                          min={0}
                          value={itemEdits[item.id]?.itemOrder ?? String(item.itemOrder)}
                          onChange={(event) => updateItemEditState(item.id, { itemOrder: event.target.value })}
                          className={fieldClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>Replacement Question ID</label>
                        <input
                          type="number"
                          min={1}
                          value={itemEdits[item.id]?.replacementQuestionId ?? ''}
                          onChange={(event) =>
                            updateItemEditState(item.id, { replacementQuestionId: event.target.value })
                          }
                          className={fieldClass}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => void applyDraftItemChanges(item.id)}
                          disabled={loading || updatingItemId === item.id}
                          className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {updatingItemId === item.id ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            'Apply Item Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {generatedExamId && (
          <div className="mt-3 rounded-lg border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              Saved successfully as <strong>Exam #{generatedExamId}</strong>. You can find it in the{' '}
              <strong>Saved Exams</strong> section on the Exams tab.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className={secondaryButtonClass}>
            Close
          </button>
          <button onClick={generatePreview} disabled={loading} className={secondaryButtonClass}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generate Preview'}
          </button>
          <button
            onClick={saveExam}
            disabled={loading || !draftId}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamGenerationModal;

