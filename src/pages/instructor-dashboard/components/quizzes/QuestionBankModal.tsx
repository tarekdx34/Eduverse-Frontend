import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageUp, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import ChapterService, { CourseChapter } from '../../../../services/api/chapterService';
import QuestionBankService, {
  BloomLevel,
  QuestionBankDifficulty,
  QuestionBankType,
} from '../../../../services/api/questionBankService';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomDropdown } from '../CustomDropdown';

interface QuestionBankModalProps {
  open: boolean;
  courseOptions: { value: string; label: string }[];
  onClose: () => void;
}

type SubmitMode = 'close' | 'addAnother';

const bloomOptions: { value: BloomLevel; label: string }[] = [
  { value: 'remembering',   label: 'Remembering' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'applying',      label: 'Applying' },
  { value: 'analyzing',     label: 'Analyzing' },
  { value: 'evaluating',    label: 'Evaluating' },
  { value: 'creating',      label: 'Creating' },
];

const questionTypeOptions: { value: QuestionBankType; label: string }[] = [
  { value: 'mcq',         label: 'Multiple Choice (MCQ)' },
  { value: 'true_false',  label: 'True / False' },
  { value: 'written',     label: 'Written' },
  { value: 'fill_blanks', label: 'Fill in the Blanks' },
  { value: 'essay',       label: 'Essay' },
];

const difficultyOptions: { value: QuestionBankDifficulty; label: string }[] = [
  { value: 'easy',   label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
];

const defaultQuestionType: QuestionBankType = 'mcq';
const defaultDifficulty: QuestionBankDifficulty = 'medium';
const defaultBloomLevel: BloomLevel = 'applying';

export function QuestionBankModal({ open, onClose, courseOptions }: QuestionBankModalProps) {
  const { isDark, primaryHex } = useTheme() as { isDark: boolean; primaryHex: string };
  const [courseId, setCourseId] = useState('');
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [chapterId, setChapterId] = useState('');
  const [questionType, setQuestionType] = useState<QuestionBankType>(defaultQuestionType);
  const [difficulty, setDifficulty] = useState<QuestionBankDifficulty>(defaultDifficulty);
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>(defaultBloomLevel);
  const [questionText, setQuestionText] = useState('');
  const [hints, setHints] = useState('');
  const [expectedAnswerText, setExpectedAnswerText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [imageInputResetKey, setImageInputResetKey] = useState(0);
  const [imageDragOver, setImageDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [creatingChapterLoading, setCreatingChapterLoading] = useState(false);

  const loadChapters = useCallback(async (selectedCourseId: string, preferredChapterId?: string) => {
    const items = await ChapterService.listByCourse(selectedCourseId);
    const safeItems = Array.isArray(items) ? items : [];
    setChapters(safeItems);
    setChapterId((previous) => {
      if (preferredChapterId && safeItems.some((c) => String(c.id) === preferredChapterId)) return preferredChapterId;
      if (previous && safeItems.some((c) => String(c.id) === previous)) return previous;
      return safeItems.length > 0 ? String(safeItems[0].id) : '';
    });
  }, []);

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      setChapterId('');
      setCreatingChapter(false);
      setNewChapterName('');
      return;
    }
    loadChapters(courseId).catch((err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to load chapters'),
    );
  }, [courseId, loadChapters]);

  useEffect(() => {
    if (questionType !== 'true_false') return;
    setOptions(['True', 'False']);
    if (correctOption > 1) setCorrectOption(0);
  }, [questionType, correctOption]);

  const isAnswerTextRequired = useMemo(
    () => questionType === 'written' || questionType === 'essay',
    [questionType],
  );

  const optionRows = questionType === 'true_false' ? 2 : 4;
  const normalizedOptions = useMemo(() => {
    const base = questionType === 'true_false'
      ? ['True', 'False']
      : options.length >= optionRows
        ? options
        : [...options, ...Array.from({ length: optionRows - options.length }, () => '')];
    return base.slice(0, optionRows);
  }, [questionType, optionRows, options]);

  const resetQuestionFields = useCallback(() => {
    setQuestionType(defaultQuestionType);
    setDifficulty(defaultDifficulty);
    setBloomLevel(defaultBloomLevel);
    setQuestionText('');
    setHints('');
    setExpectedAnswerText('');
    setOptions(['', '', '', '']);
    setCorrectOption(0);
    setQuestionImage(null);
    setImageInputResetKey((p) => p + 1);
  }, []);

  if (!open) return null;

  const isSubmitting = submitMode !== null;

  // ─── Theme tokens ────────────────────────────────────────────────────────────
  const cardCls    = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputCls   = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2';
  const fieldCls   = `w-full px-3 py-2 border rounded-lg text-sm ${inputCls}`;
  const labelCls   = `block text-xs font-semibold uppercase tracking-wide mb-1 ${subCls}`;
  const sectionCls = isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50';
  const secondaryCls = isDark
    ? 'border-white/10 text-slate-200 hover:bg-white/10'
    : 'border-gray-300 text-gray-700 hover:bg-gray-100';

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = async (mode: SubmitMode) => {
    if (!courseId || !chapterId) {
      toast.error('Course and chapter are required');
      return;
    }
    if (!questionText.trim() && !questionImage) {
      toast.error('Add question text or upload an image');
      return;
    }

    const optionPayload =
      questionType === 'mcq' || questionType === 'true_false'
        ? normalizedOptions.reduce<{ optionText: string; isCorrect: boolean }[]>((acc, opt, idx) => {
            const t = opt.trim();
            if (!t) return acc;
            acc.push({ optionText: t, isCorrect: idx === correctOption });
            return acc;
          }, [])
        : undefined;

    if (questionType === 'mcq') {
      if (!optionPayload || optionPayload.length < 2) {
        toast.error('Add at least two non-empty options for MCQ');
        return;
      }
      if (!optionPayload.some((o) => o.isCorrect)) {
        toast.error('Select the correct MCQ option');
        return;
      }
    }
    if (questionType === 'true_false' && !optionPayload?.some((o) => o.isCorrect)) {
      toast.error('Select the correct true/false answer');
      return;
    }

    try {
      setSubmitMode(mode);
      const uploaded = questionImage ? await QuestionBankService.uploadImage(questionImage) : null;
      await QuestionBankService.create({
        courseId: Number(courseId),
        chapterId: Number(chapterId),
        questionType,
        difficulty,
        bloomLevel,
        questionText: questionText.trim() || undefined,
        questionFileId: uploaded?.fileId,
        hints: hints.trim() || undefined,
        expectedAnswerText: expectedAnswerText.trim() || undefined,
        options: optionPayload,
      });
      if (mode === 'addAnother') {
        resetQuestionFields();
        toast.success('Question saved. Add another.');
        return;
      }
      toast.success('Question added to bank');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add question');
    } finally {
      setSubmitMode(null);
    }
  };

  const handleCreateChapter = async () => {
    if (!courseId) { toast.error('Select a course first'); return; }
    const name = newChapterName.trim();
    if (!name) { toast.error('Chapter name is required'); return; }
    try {
      setCreatingChapterLoading(true);
      const nextOrder = chapters.length > 0
        ? Math.max(...chapters.map((c) => Number(c.chapterOrder) || 0)) + 1
        : 1;
      const created = await ChapterService.create(courseId, { name, chapterOrder: nextOrder });
      await loadChapters(courseId, String(created.id));
      setCreatingChapter(false);
      setNewChapterName('');
      toast.success('Chapter created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create chapter');
    } finally {
      setCreatingChapterLoading(false);
    }
  };

  const chapterOptions = chapters.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl border ${cardCls}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <div>
            <h3 className={`text-base font-bold ${headingCls}`}>Add Question to Bank</h3>
            <p className={`text-xs mt-0.5 ${subCls}`}>Fill in the details below and save.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Row 1: Course + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className={labelCls}>Question Type *</label>
              <CustomDropdown
                value={questionType}
                options={questionTypeOptions}
                onChange={(v) => setQuestionType(v as QuestionBankType)}
                fullWidth
              />
            </div>
          </div>

          {/* Row 2: Difficulty + Bloom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Difficulty *</label>
              <CustomDropdown
                value={difficulty}
                options={difficultyOptions}
                onChange={(v) => setDifficulty(v as QuestionBankDifficulty)}
                fullWidth
              />
            </div>
            <div>
              <label className={labelCls}>Bloom Level *</label>
              <CustomDropdown
                value={bloomLevel}
                options={bloomOptions}
                onChange={(v) => setBloomLevel(v as BloomLevel)}
                fullWidth
              />
            </div>
          </div>

          {/* Chapter row */}
          <div className="space-y-2">
            <label className={labelCls}>Chapter *</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <CustomDropdown
                  value={chapterId}
                  options={chapterOptions}
                  onChange={setChapterId}
                  placeholder={!courseId ? 'Select a course first' : chapterOptions.length === 0 ? 'No chapters yet' : 'Select chapter'}
                  disabled={!courseId}
                  fullWidth
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!courseId) { toast.error('Select a course first'); return; }
                  setCreatingChapter((p) => !p);
                }}
                disabled={creatingChapterLoading || isSubmitting}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${secondaryCls}`}
              >
                <Plus size={14} />
                New Chapter
              </button>
            </div>
            {creatingChapter && (
              <div className="flex items-center gap-2">
                <input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateChapter(); }}
                  className={`flex-1 ${fieldCls}`}
                  placeholder="Chapter name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => void handleCreateChapter()}
                  disabled={creatingChapterLoading || isSubmitting}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: primaryHex }}
                >
                  {creatingChapterLoading ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreatingChapter(false); setNewChapterName(''); }}
                  disabled={creatingChapterLoading || isSubmitting}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-60 ${secondaryCls}`}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div>
            <label className={labelCls}>Question Text</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className={fieldCls}
              placeholder="Write the prompt shown to students"
              disabled={isSubmitting}
            />
            <p className={`text-xs mt-1 ${subCls}`}>Leave empty if you're using an image-only question.</p>
          </div>

          {/* MCQ / True-False Options */}
          {(questionType === 'mcq' || questionType === 'true_false') && (
            <div className={`rounded-xl border p-4 space-y-3 ${sectionCls}`}>
              <div>
                <p className={`text-sm font-semibold ${headingCls}`}>
                  {questionType === 'mcq' ? 'Answer Options' : 'True / False Answer'}
                </p>
                <p className={`text-xs mt-0.5 ${subCls}`}>
                  {questionType === 'mcq'
                    ? 'Fill at least two options and mark the correct one.'
                    : 'Select the correct statement.'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {normalizedOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...normalizedOptions];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      className={`flex-1 ${fieldCls}`}
                      placeholder={`Option ${idx + 1}`}
                      readOnly={questionType === 'true_false'}
                      disabled={isSubmitting}
                    />
                    <label className={`inline-flex items-center gap-1 text-xs cursor-pointer select-none ${subCls}`}>
                      <input
                        type="radio"
                        checked={correctOption === idx}
                        onChange={() => setCorrectOption(idx)}
                        className="h-3.5 w-3.5"
                        disabled={isSubmitting}
                        style={{ accentColor: primaryHex }}
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Answer (written / essay) */}
          {isAnswerTextRequired && (
            <div>
              <label className={labelCls}>
                {questionType === 'essay' ? 'Essay Rubric' : 'Expected Answer'}
              </label>
              <textarea
                value={expectedAnswerText}
                onChange={(e) => setExpectedAnswerText(e.target.value)}
                rows={2}
                className={fieldCls}
                placeholder="Model answer or grading rubric"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Hints */}
          <div>
            <label className={labelCls}>Hints <span className={subCls + ' normal-case font-normal'}>(optional)</span></label>
            <textarea
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              rows={2}
              className={fieldCls}
              placeholder="Optional guidance for students"
              disabled={isSubmitting}
            />
          </div>

          {/* Image upload — drop zone */}
          <div>
            <label className={labelCls}>Question Image <span className={`normal-case font-normal ${subCls}`}>(optional)</span></label>
            <input
              key={imageInputResetKey}
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setQuestionImage(e.target.files?.[0] ?? null)}
              className="sr-only"
              disabled={isSubmitting}
            />
            {questionImage ? (
              <div className={`rounded-xl border-2 px-4 py-3 flex items-center justify-between gap-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <ImageUp size={18} style={{ color: primaryHex }} className="flex-shrink-0" />
                  <span className={`text-sm truncate ${headingCls}`}>{questionImage.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setQuestionImage(null); setImageInputResetKey((p) => p + 1); }}
                  disabled={isSubmitting}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${secondaryCls}`}
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSubmitting}
                onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                onDragLeave={() => setImageDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setImageDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) setQuestionImage(file);
                }}
                className={`w-full rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 transition-colors ${
                  imageDragOver
                    ? isDark ? 'border-white/30 bg-white/10' : 'border-gray-400 bg-gray-100'
                    : isDark ? 'border-white/10 hover:border-white/20 hover:bg-white/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ImageUp size={24} style={{ color: imageDragOver ? primaryHex : undefined }} className={imageDragOver ? '' : subCls} />
                <span className={`text-sm font-medium ${imageDragOver ? headingCls : subCls}`}>
                  {imageDragOver ? 'Drop image here' : 'Click or drag an image here'}
                </span>
                <span className={`text-xs ${subCls}`}>PNG, JPG, GIF, WEBP</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${secondaryCls}`}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit('addAnother')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60"
            style={{
              borderColor: `${primaryHex}50`,
              color: primaryHex,
              backgroundColor: `${primaryHex}10`,
            }}
          >
            {submitMode === 'addAnother' ? <Loader2 size={15} className="animate-spin" /> : 'Save & Add Another'}
          </button>
          <button
            onClick={() => void handleSubmit('close')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: primaryHex }}
          >
            {submitMode === 'close' ? <Loader2 size={15} className="animate-spin" /> : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionBankModal;
