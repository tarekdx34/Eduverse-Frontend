import React, { useEffect, useState, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTheme } from '../../pages/instructor-dashboard/contexts/ThemeContext';
import {
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
} from '../shared/index';
import ExamGenerationService from '../../services/api/examGenerationService';
import { toast } from 'sonner';
import { Archive, Loader2, Send } from 'lucide-react';
import type { ExamExportOptions, ExamPaperTemplate } from '../../types/examGenerator';

interface ExamQuestion {
  id: string;
  questionId?: number;
  questionText: string;
  weight: number;
  questionType?: string;
  difficulty?: string;
  expectedAnswerText?: string;
  hints?: string;
  imagePreviewUrl?: string;
  options?: Array<{ optionText?: string; isCorrect?: boolean }>;
}

interface ExamSection {
  id?: number;
  title: string;
  instructions?: string;
  totalMarks?: number;
  items?: ExamQuestion[];
}

interface ExamFullData {
  examId: number;
  courseId?: number;
  title: string;
  status?: string;
  totalWeight: number;
  questionCount: number;
  sections?: ExamSection[];
  items?: ExamQuestion[];
}

interface ExamFullViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
}

export const ExamFullViewModal: React.FC<ExamFullViewModalProps> = ({
  open,
  onOpenChange,
  examId,
}) => {
  const { isDark, primaryHex } = useTheme();
  const [exam, setExam] = useState<ExamFullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [templates, setTemplates] = useState<ExamPaperTemplate[]>([]);
  const [lifecycleLoading, setLifecycleLoading] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExamExportOptions>({
    format: 'docx',
    variant: 'student',
    includeAnswerKey: false,
    studentNameLine: true,
    showCourseCode: true,
    pageBreakPerSection: false,
    showInstructorName: false,
    showTotalMarks: true,
    showQuestionMarks: true,
    answerKeyStyle: 'inline',
  });

  const loadExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await ExamGenerationService.getExamFull(examId);
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const payload = (r.data && typeof r.data === 'object' ? r.data : r) as Record<string, unknown>;

      const toStr = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
      const toNum = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

      const normalizeItem = (item: unknown, idx: number): ExamQuestion => {
        const i = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const snap = (i.snapshot && typeof i.snapshot === 'object' ? i.snapshot : {}) as Record<string, unknown>;
        const q = (i.question && typeof i.question === 'object' ? i.question : snap) as Record<string, unknown>;
        const rawOptions = snap.options ?? i.options ?? q.options;
        return {
          id: String(i.id ?? i.itemId ?? idx + 1),
          questionId: typeof i.questionId === 'number' ? i.questionId : undefined,
          questionText: toStr(snap.questionText) ?? toStr(q.questionText) ?? toStr(q.text) ?? toStr(i.questionText) ?? `Question #${idx + 1}`,
          weight: toNum(i.weight ?? i.marks ?? snap.weight),
          questionType: toStr(snap.questionType ?? q.questionType ?? i.questionType),
          difficulty: toStr(snap.difficulty ?? q.difficulty ?? i.difficulty),
          expectedAnswerText: toStr(snap.expectedAnswerText ?? q.expectedAnswerText ?? i.expectedAnswerText),
          hints: toStr(snap.hints ?? q.hints ?? i.hints),
          imagePreviewUrl: toStr(snap.questionImagePreviewUrl ?? snap.sourceGroupImagePreviewUrl),
          options: Array.isArray(rawOptions)
            ? (rawOptions as unknown[]).map((o) => {
                const opt = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>;
                return { optionText: toStr(opt.optionText ?? opt.text), isCorrect: opt.isCorrect === true };
              })
            : [],
        };
      };

      const normalizeSection = (sec: unknown, idx: number): ExamSection => {
        const s = (sec && typeof sec === 'object' ? sec : {}) as Record<string, unknown>;
        const rawItems = Array.isArray(s.items) ? s.items : [];
        return {
          id: typeof s.id === 'number' ? s.id : idx,
          title: toStr(s.title) ?? `Section ${idx + 1}`,
          instructions: toStr(s.instructions),
          totalMarks: typeof s.totalMarks === 'number' ? s.totalMarks : undefined,
          items: rawItems.map(normalizeItem),
        };
      };

      const rawSections = Array.isArray(payload.sections) ? payload.sections : [];
      const rawItems = Array.isArray(payload.items) ? payload.items
        : Array.isArray(payload.questions) ? payload.questions
        : Array.isArray(payload.examItems) ? payload.examItems
        : [];

      const sections = rawSections.length > 0 ? rawSections.map(normalizeSection) : undefined;
      const items = rawItems.map(normalizeItem);

      setExam({
        examId: toNum(payload.id ?? payload.examId) || examId,
        courseId: typeof payload.courseId === 'number' ? payload.courseId : undefined,
        title: toStr(payload.title) ?? `Exam #${examId}`,
        status: toStr(payload.status),
        totalWeight: toNum(payload.totalMarks ?? payload.totalWeight),
        questionCount: toNum(payload.itemCount ?? payload.totalQuestions ?? payload.questionCount) || items.length,
        sections,
        items: sections ? undefined : items,
      });
      const loadedCourseId = typeof payload.courseId === 'number' ? payload.courseId : undefined;
      ExamGenerationService.getPaperTemplates({ courseId: loadedCourseId })
        .then((items) => setTemplates(Array.isArray(items) ? items : []))
        .catch(() => setTemplates([]));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load exam';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (open) {
      void loadExam();
    }
  }, [open, loadExam]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const result = await ExamGenerationService.exportExam(examId, exportOptions);
      const response = (result?.data ?? result) as { fileName?: string; mimeType?: string; content?: string };
      const fileName = response?.fileName ?? `exam-${examId}.${exportOptions.format}`;
      const mimeType = response?.mimeType ?? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const base64 = response?.content ?? '';
      if (!base64) throw new Error('Export completed without file content');
      const byteChars = atob(base64);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${fileName}`);
      setShowExportOptions(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export exam');
    } finally {
      setExporting(false);
    }
  };

  const handleLifecycle = async (action: 'publish' | 'archive') => {
    const reason = window.prompt(
      action === 'publish' ? 'Publish reason (optional)' : 'Archive reason (optional)',
    ) ?? undefined;
    try {
      setLifecycleLoading(action);
      await ExamGenerationService.lifecycle(examId, action, reason?.trim() || undefined);
      toast.success(action === 'publish' ? 'Exam published' : 'Exam archived');
      await loadExam();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} exam`);
    } finally {
      setLifecycleLoading(null);
    }
  };

  const updateExportOption = (patch: Partial<ExamExportOptions>) =>
    setExportOptions((current) => ({ ...current, ...patch }));

  const hasSections = exam && exam.sections && exam.sections.length > 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle>{exam?.title || `Exam #${examId}`}</DialogTitle>
            {exam?.status && <StatusBadge status={exam.status} />}
          </div>
          <DialogDescription className="sr-only">Full view of exam sections and questions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exam Stats */}
          {exam && (
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }}
              >
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Questions
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {exam.questionCount}
                </div>
              </div>
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }}
              >
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Marks
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {exam.totalWeight}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingSkeleton rows={5} cols={1} />
          ) : error ? (
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                borderColor: isDark ? '#991b1b' : '#fecaca',
              }}
            >
              <p className={isDark ? 'text-red-200' : 'text-red-800'}>
                {error}
              </p>
              <button
                onClick={() => void loadExam()}
                className="mt-3 px-3 py-1 rounded text-sm text-white"
                style={{ backgroundColor: primaryHex }}
              >
                Retry
              </button>
            </div>
          ) : exam ? (
            hasSections ? (
              <Accordion type="single" collapsible className="w-full">
                {exam.sections!.map((section, sectionIdx) => (
                  <AccordionItem
                    key={section.id || sectionIdx}
                    value={`section-${sectionIdx}`}
                  >
                    <AccordionTrigger className={isDark ? 'text-gray-100 hover:text-gray-200' : ''}>
                      <div className="text-left">
                        <div className="font-semibold">{section.title}</div>
                        {section.items && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {section.items.length} questions • {section.items.reduce((sum, item) => sum + item.weight, 0)} marks
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {section.instructions && (
                          <div
                            className="rounded p-3"
                            style={{
                              backgroundColor: isDark ? '#374151' : '#f3f4f6',
                            }}
                          >
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Instructions
                            </div>
                            <p className={isDark ? 'text-gray-200 text-sm' : 'text-gray-800 text-sm'}>
                              {section.instructions}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          {section.items?.map((item, itemIdx) => (
                            <QuestionCard
                              key={item.id}
                              question={item}
                              index={itemIdx + 1}
                              isDark={isDark}
                              primaryHex={primaryHex}
                            />
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : exam.items && exam.items.length > 0 ? (
              <div className="space-y-3">
                {exam.items.map((item, idx) => (
                  <QuestionCard
                    key={item.id}
                    question={item}
                    index={idx + 1}
                    isDark={isDark}
                    primaryHex={primaryHex}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No questions in this exam" />
            )
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => void handleLifecycle('publish')}
            disabled={!!lifecycleLoading || loading}
            className={isDark ? 'border-gray-600 text-gray-200' : ''}
          >
            {lifecycleLoading === 'publish' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
            Publish
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleLifecycle('archive')}
            disabled={!!lifecycleLoading || loading}
            className={isDark ? 'border-gray-600 text-gray-200' : ''}
          >
            {lifecycleLoading === 'archive' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Archive size={16} className="mr-2" />}
            Archive
          </Button>
          <Button
            onClick={() => setShowExportOptions(true)}
            disabled={exporting || loading}
            style={{ backgroundColor: primaryHex }}
            className="text-white"
          >
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isDark ? 'border-gray-600 text-gray-200' : ''}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      <Dialog open={showExportOptions} onOpenChange={setShowExportOptions}>
        <DialogContent
          className="max-w-2xl"
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}
        >
          <DialogHeader>
            <DialogTitle>Export Exam</DialogTitle>
            <DialogDescription>Choose the paper variant, answer key behavior, and template options.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Format</label>
              <Select value={exportOptions.format} onValueChange={(value) => updateExportOption({ format: value as ExamExportOptions['format'] })}>
                <SelectTrigger className={isDark ? 'mt-1 bg-gray-700 border-gray-600 text-white' : 'mt-1'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Variant</label>
              <Select value={exportOptions.variant} onValueChange={(value) => updateExportOption({ variant: value as ExamExportOptions['variant'], includeAnswerKey: value !== 'student' })}>
                <SelectTrigger className={isDark ? 'mt-1 bg-gray-700 border-gray-600 text-white' : 'mt-1'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Paper</SelectItem>
                  <SelectItem value="answer_key">Answer Key</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Answer Key Style</label>
              <Select value={exportOptions.answerKeyStyle ?? 'inline'} onValueChange={(value) => updateExportOption({ answerKeyStyle: value as ExamExportOptions['answerKeyStyle'] })}>
                <SelectTrigger className={isDark ? 'mt-1 bg-gray-700 border-gray-600 text-white' : 'mt-1'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="separate">Separate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Paper Template</label>
              <Select
                value={exportOptions.paperTemplateId ? String(exportOptions.paperTemplateId) : 'none'}
                onValueChange={(value) => {
                  const template = templates.find((item) => String(item.id) === value);
                  updateExportOption({
                    paperTemplateId: value === 'none' ? undefined : Number(value),
                    paperTemplateSnapshot: template?.snapshot ?? template?.template,
                  });
                }}
              >
                <SelectTrigger className={isDark ? 'mt-1 bg-gray-700 border-gray-600 text-white' : 'mt-1'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={String(template.id)} value={String(template.id)}>
                      {String(template.name ?? `Template #${template.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {[
              ['studentNameLine', 'Student name line'],
              ['showCourseCode', 'Show course code'],
              ['pageBreakPerSection', 'Page break per section'],
              ['showInstructorName', 'Show instructor name'],
              ['showTotalMarks', 'Show total marks'],
              ['showQuestionMarks', 'Show question marks'],
            ].map(([key, label]) => (
              <label key={key} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                <input
                  type="checkbox"
                  checked={Boolean(exportOptions[key as keyof ExamExportOptions])}
                  onChange={(event) => updateExportOption({ [key]: event.target.checked } as Partial<ExamExportOptions>)}
                />
                {label}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportOptions(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              style={{ backgroundColor: primaryHex }}
              className="text-white"
            >
              {exporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

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

interface QuestionCardProps {
  question: ExamQuestion;
  index: number;
  isDark: boolean;
  primaryHex: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isDark,
  primaryHex,
}) => {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
      }}
    >
      <div className="flex gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ backgroundColor: primaryHex }}
        >
          {index}
        </div>
        <div className="flex-1">
          <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <MathText text={question.questionText} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {question.questionType && (
              <span
                className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${primaryHex}20`,
                  color: primaryHex,
                }}
              >
                {question.questionType}
              </span>
            )}
            {question.difficulty && (
              <span
                className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#d1d5db' : '#6b7280',
                }}
              >
                {question.difficulty}
              </span>
            )}
            <span
              className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#6b7280',
              }}
            >
              {question.weight} mark{question.weight !== 1 ? 's' : ''}
            </span>
          </div>
          {question.imagePreviewUrl && (
            <div className="mt-2">
              <img
                src={question.imagePreviewUrl}
                alt="Question diagram"
                className="max-h-48 rounded border object-contain"
                style={{ borderColor: isDark ? '#4b5563' : '#e5e7eb' }}
              />
            </div>
          )}
          {question.expectedAnswerText && (
            <div className="mt-2">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Answer
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <MathText text={question.expectedAnswerText} />
              </div>
            </div>
          )}
          {question.hints && (
            <div className="mt-1">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Hint
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MathText text={question.hints} />
              </div>
            </div>
          )}
          {question.options && question.options.length > 0 && (
            <div className="mt-2">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Options
              </div>
              <ul className="space-y-1">
                {question.options.map((opt, idx) => (
                  <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className={opt.isCorrect ? 'font-semibold text-green-600' : ''}>
                      {opt.optionText ? <MathText text={opt.optionText} /> : null}
                      {opt.isCorrect && ' ✓'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
