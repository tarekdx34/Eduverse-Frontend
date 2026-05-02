import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import ChapterService, { CourseChapter } from '../../../../services/api/chapterService';
import QuestionBankService, {
  BloomLevel,
  QuestionBankDifficulty,
  QuestionBankType,
} from '../../../../services/api/questionBankService';
import { useTheme } from '../../contexts/ThemeContext';

interface QuestionBankModalProps {
  open: boolean;
  courseOptions: { value: string; label: string }[];
  onClose: () => void;
}

type SubmitMode = 'close' | 'addAnother';

const bloomOptions: BloomLevel[] = [
  'remembering',
  'understanding',
  'applying',
  'analyzing',
  'evaluating',
  'creating',
];

const questionTypeOptions: QuestionBankType[] = ['written', 'mcq', 'true_false', 'fill_blanks', 'essay'];
const defaultQuestionType: QuestionBankType = 'mcq';
const defaultDifficulty: QuestionBankDifficulty = 'medium';
const defaultBloomLevel: BloomLevel = 'applying';

const questionTypeLabels: Record<QuestionBankType, string> = {
  written: 'Written',
  mcq: 'Multiple Choice (MCQ)',
  true_false: 'True / False',
  fill_blanks: 'Fill in the Blanks',
  essay: 'Essay',
};

export function QuestionBankModal({ open, onClose, courseOptions }: QuestionBankModalProps) {
  const { isDark } = useTheme() as { isDark: boolean };
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
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [creatingChapterLoading, setCreatingChapterLoading] = useState(false);

  const loadChapters = useCallback(async (selectedCourseId: string, preferredChapterId?: string) => {
    const items = await ChapterService.listByCourse(selectedCourseId);
    const safeItems = Array.isArray(items) ? items : [];
    setChapters(safeItems);
    setChapterId((previous) => {
      if (preferredChapterId && safeItems.some((chapter) => String(chapter.id) === preferredChapterId)) {
        return preferredChapterId;
      }
      if (previous && safeItems.some((chapter) => String(chapter.id) === previous)) {
        return previous;
      }
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
    if (correctOption > 1) {
      setCorrectOption(0);
    }
  }, [questionType, correctOption]);

  const isAnswerTextRequired = useMemo(
    () => questionType === 'written' || questionType === 'essay',
    [questionType],
  );

  const optionRows = questionType === 'true_false' ? 2 : 4;
  const normalizedOptions = useMemo(() => {
    const baseOptions =
      questionType === 'true_false'
        ? ['True', 'False']
        : options.length >= optionRows
          ? options
          : [...options, ...Array.from({ length: optionRows - options.length }, () => '')];
    return baseOptions.slice(0, optionRows);
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
    setImageInputResetKey((previous) => previous + 1);
  }, []);

  if (!open) return null;

  const cardCls = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-2'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2';
  const fieldClass = `w-full px-4 py-2 border rounded-lg focus:outline-none ${inputCls}`;
  const labelClass = `text-sm font-medium ${subCls}`;
  const helperClass = `text-xs ${subCls}`;
  const sectionCls = isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50';
  const isSubmitting = submitMode !== null;

  const handleSubmit = async (mode: SubmitMode) => {
    if (!courseId || !chapterId) {
      toast.error('Course and chapter are required');
      return;
    }
    if (!questionText.trim() && !questionImage) {
      toast.error('Add question text or upload an image');
      return;
    }

    const trimmedQuestionText = questionText.trim();
    const optionPayload =
      questionType === 'mcq' || questionType === 'true_false'
        ? normalizedOptions.reduce<{ optionText: string; isCorrect: boolean }[]>((acc, optionText, index) => {
            const normalizedOptionText = optionText.trim();
            if (!normalizedOptionText) return acc;
            acc.push({ optionText: normalizedOptionText, isCorrect: index === correctOption });
            return acc;
          }, [])
        : undefined;

    if (questionType === 'mcq') {
      if (!optionPayload || optionPayload.length < 2) {
        toast.error('Add at least two non-empty options for MCQ questions');
        return;
      }
      if (!optionPayload.some((option) => option.isCorrect)) {
        toast.error('Select the correct MCQ option');
        return;
      }
    }

    if (questionType === 'true_false' && !optionPayload?.some((option) => option.isCorrect)) {
      toast.error('Select the correct true/false answer');
      return;
    }

    try {
      setSubmitMode(mode);
      const uploadedImage = questionImage ? await QuestionBankService.uploadImage(questionImage) : null;

      await QuestionBankService.create({
        courseId: Number(courseId),
        chapterId: Number(chapterId),
        questionType,
        difficulty,
        bloomLevel,
        questionText: trimmedQuestionText || undefined,
        questionFileId: uploadedImage?.fileId,
        hints: hints.trim() || undefined,
        expectedAnswerText: expectedAnswerText.trim() || undefined,
        options: optionPayload,
      });

      if (mode === 'addAnother') {
        resetQuestionFields();
        toast.success('Question saved. You can add another now.');
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
    if (!courseId) {
      toast.error('Select a course first');
      return;
    }

    const trimmedName = newChapterName.trim();
    if (!trimmedName) {
      toast.error('Chapter name is required');
      return;
    }

    try {
      setCreatingChapterLoading(true);
      const nextOrder =
        chapters.length > 0 ? Math.max(...chapters.map((chapter) => Number(chapter.chapterOrder) || 0)) + 1 : 1;
      const created = await ChapterService.create(courseId, { name: trimmedName, chapterOrder: nextOrder });
      const createdChapterId = String(created.id);
      await loadChapters(courseId, createdChapterId);
      setCreatingChapter(false);
      setNewChapterName('');
      toast.success('Chapter created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create chapter');
    } finally {
      setCreatingChapterLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border ${cardCls}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${headingCls}`}>Add Question to Bank</h3>
            <p className={`text-sm mt-1 ${subCls}`}>
              Select a course/chapter, add your question details, then choose to save and close or keep adding.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={subCls} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="question-bank-course" className={labelClass}>
              Course *
            </label>
            <select
              id="question-bank-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Select course</option>
              {courseOptions.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
            <p className={helperClass}>Choose the course that this question belongs to.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="question-bank-type" className={labelClass}>
              Question Type *
            </label>
            <select
              id="question-bank-type"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionBankType)}
              className={fieldClass}
            >
              {questionTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {questionTypeLabels[type]}
                </option>
              ))}
            </select>
            <p className={helperClass}>Pick the format students will answer in.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="question-bank-difficulty" className={labelClass}>
              Difficulty *
            </label>
            <select
              id="question-bank-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuestionBankDifficulty)}
              className={fieldClass}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
            <p className={helperClass}>Use difficulty to balance quizzes and exams.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="question-bank-bloom" className={labelClass}>
              Bloom Level *
            </label>
            <select
              id="question-bank-bloom"
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value as BloomLevel)}
              className={fieldClass}
            >
              {bloomOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <p className={helperClass}>Classify the cognitive skill level required.</p>
          </div>

          <div className={`md:col-span-2 rounded-lg border p-4 ${sectionCls}`}>
            <div className="space-y-1">
              <label htmlFor="question-bank-chapter" className={labelClass}>
                Chapter *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  id="question-bank-chapter"
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className={fieldClass}
                  disabled={!courseId || creatingChapterLoading || isSubmitting}
                >
                  <option value="">{courseId ? 'Select chapter' : 'Select course first'}</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!courseId) {
                      toast.error('Select a course first');
                      return;
                    }
                    setCreatingChapter((previous) => !previous);
                  }}
                  disabled={creatingChapterLoading || isSubmitting}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/10 text-slate-200 hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus size={16} />
                  New Chapter
                </button>
              </div>
              <p className={helperClass}>Need a new chapter? Create it here without leaving this form.</p>
            </div>

            {creatingChapter && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className={fieldClass}
                  placeholder="New chapter name"
                />
                <button
                  type="button"
                  onClick={handleCreateChapter}
                  disabled={creatingChapterLoading || isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {creatingChapterLoading ? <Loader2 size={15} className="animate-spin" /> : 'Save Chapter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingChapter(false);
                    setNewChapterName('');
                  }}
                  disabled={creatingChapterLoading || isSubmitting}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/10 text-slate-200 hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor="question-bank-text" className={labelClass}>
              Question Text
            </label>
            <textarea
              id="question-bank-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className={fieldClass}
              placeholder="Write the prompt shown to students"
            />
            <p className={helperClass}>You can leave this empty if you upload a question image below.</p>
          </div>

          <div className={`md:col-span-2 rounded-lg border p-4 space-y-2 ${sectionCls}`}>
            <div>
              <h4 className={`text-sm font-semibold ${headingCls}`}>Question Image (Optional)</h4>
              <p className={helperClass}>
                Upload one image for image-based prompts. Supported endpoint field: <span className="font-medium">image</span>.
              </p>
            </div>
            <input
              key={imageInputResetKey}
              id="question-bank-image"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setQuestionImage(selectedFile);
              }}
              className={`${fieldClass} file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
              disabled={isSubmitting}
            />
            {questionImage && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  Selected file: <span className="font-medium">{questionImage.name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionImage(null);
                    setImageInputResetKey((previous) => previous + 1);
                  }}
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md border text-sm transition-colors ${
                    isDark
                      ? 'border-white/10 text-slate-200 hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          {(questionType === 'mcq' || questionType === 'true_false') && (
            <div className={`md:col-span-2 space-y-2 rounded-lg border p-4 ${sectionCls}`}>
              <h4 className={`text-sm font-semibold ${headingCls}`}>
                {questionType === 'mcq' ? 'Multiple Choice Options' : 'True / False Answer'}
              </h4>
              <p className={helperClass}>
                {questionType === 'mcq'
                  ? 'Add at least two options and mark one correct answer.'
                  : 'Choose which statement is correct.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {normalizedOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={option}
                      onChange={(e) => {
                        const next = [...normalizedOptions];
                        next[index] = e.target.value;
                        setOptions(next);
                      }}
                      className={fieldClass}
                      placeholder={`Option ${index + 1}`}
                      readOnly={questionType === 'true_false'}
                      disabled={isSubmitting}
                    />
                    <label className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300">
                      <input
                        type="radio"
                        checked={correctOption === index}
                        onChange={() => setCorrectOption(index)}
                        title="Correct option"
                        className="h-4 w-4"
                        disabled={isSubmitting}
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionType === 'fill_blanks' && (
            <div className={`space-y-2 md:col-span-2 rounded-lg border p-4 ${sectionCls}`}>
              <h4 className={`text-sm font-semibold ${headingCls}`}>Fill in the Blanks Section</h4>
              <p className={helperClass}>
                Use question text to include blanks and optional hints below. Detailed blank answer fields are not available in this modal yet.
              </p>
            </div>
          )}

          {isAnswerTextRequired && (
            <div className={`space-y-1 md:col-span-2 rounded-lg border p-4 ${sectionCls}`}>
              <h4 className={`text-sm font-semibold ${headingCls}`}>
                {questionType === 'essay' ? 'Essay Rubric' : 'Written Answer Guide'}
              </h4>
              <label htmlFor="question-bank-expected-answer" className={labelClass}>
                Expected Answer / Rubric
              </label>
              <textarea
                id="question-bank-expected-answer"
                value={expectedAnswerText}
                onChange={(e) => setExpectedAnswerText(e.target.value)}
                rows={2}
                className={fieldClass}
                placeholder="Add model answer or grading rubric"
              />
              <p className={helperClass}>This is shown to instructors while grading.</p>
            </div>
          )}

          <div className="space-y-1 md:col-span-2">
            <label htmlFor="question-bank-hints" className={labelClass}>
              Hints (Optional)
            </label>
            <textarea
              id="question-bank-hints"
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              rows={2}
              className={fieldClass}
              placeholder="Optional hints for students"
            />
            <p className={helperClass}>Add short guidance that can help learners solve the question.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? 'border-white/10 text-slate-200 hover:bg-white/10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('addAnother')}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 dark:border-blue-500/40 dark:text-blue-300 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
          >
            {submitMode === 'addAnother' ? <Loader2 size={16} className="animate-spin" /> : 'Save & Add Another'}
          </button>
          <button
            onClick={() => handleSubmit('close')}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitMode === 'close' ? <Loader2 size={16} className="animate-spin" /> : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionBankModal;

