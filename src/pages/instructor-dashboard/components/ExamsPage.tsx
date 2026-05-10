import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathText } from '../../../components/exam-paper/MathText';
import { downloadClientExamPdf } from '../../../lib/exam-paper/clientExamPdfExport';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileCheck,
  FileText,
  History,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { CustomDropdown } from './CustomDropdown';
import { QuestionBankModal } from './quizzes/QuestionBankModal';
import { ExamGenerationModal, type ExamDraftPreviewRecord } from './quizzes/ExamGenerationModal';
import { DraftEditorModal } from '../../../components/exam-draft/DraftEditorModal';
import { ExamFullViewModal } from '../../../components/exam-draft/ExamFullViewModal';
import { useTheme } from '../contexts/ThemeContext';
import ChapterService, { CourseChapter } from '../../../services/api/chapterService';
import ExamGenerationService from '../../../services/api/examGenerationService';
import QuestionBankService from '../../../services/api/questionBankService';
import PaperTemplateService, { PaperTemplateDto } from '../../../services/api/paperTemplateService';
import { QuestionGroupsTab } from '../../../components/question-bank/QuestionGroupsTab';
import { exportExamToWord } from '../../../utils/examWordExport';
import { useExamGeneratorList } from '../../../hooks/useExamGeneratorList';
import {
  StatusBadge,
  ConfirmDialog,
  BulkActionToolbar,
  LoadingSkeleton,
  EmptyState,
} from '../../../components/shared';
import {
  RejectQuestionDialog,
  BatchStatusDialog,
  ChapterManagerDrawer,
  BulkImportDialog,
  QuestionAttachmentsPanel,
} from '../../../components/question-bank';

type CourseInput = {
  id?: string;
  courseId?: string;
  name?: string;
  courseName?: string;
};

type CourseOption = {
  value: string;
  label: string;
};

type QuestionOption = {
  optionText?: string;
  isCorrect?: boolean;
};

type Question = {
  id?: string | number;
  courseId?: string | number;
  chapterId?: string | number;
  questionType?: string;
  difficulty?: string;
  bloomLevel?: string;
  questionText?: string;
  questionFileId?: string | number | null;
  questionImageUrl?: string | null;
  expectedAnswerText?: string;
  hints?: string;
  status?: string;
  options?: QuestionOption[];
};

interface ListQuestionsResult {
  data: Question[];
  total: number;
}

type RawExamDraft = {
  id?: unknown;
  draftId?: unknown;
  title?: unknown;
  courseId?: unknown;
  totalQuestions?: unknown;
  totalWeight?: unknown;
  items?: unknown;
  createdAt?: unknown;
  generatedAt?: unknown;
  examId?: unknown;
  savedExamId?: unknown;
  status?: unknown;
};

type RawExam = {
  id?: unknown;
  examId?: unknown;
  draftId?: unknown;
  title?: unknown;
  courseId?: unknown;
  totalQuestions?: unknown;
  totalWeight?: unknown;
  createdAt?: unknown;
  generatedAt?: unknown;
  updatedAt?: unknown;
  status?: unknown;
  items?: unknown;
  questions?: unknown;
  examItems?: unknown;
};

type SavedExamSummary = {
  examId: number;
  draftId?: number;
  title: string;
  courseId?: number;
  status: string;
  questionCount: number;
  totalWeight: number;
  createdAt: string;
};

type ExamDetailQuestion = {
  id: string;
  questionId?: number;
  chapterId?: number;
  questionType?: string;
  difficulty?: string;
  bloomLevel?: string;
  questionText: string;
  expectedAnswerText?: string;
  hints?: string;
  weight: number;
  itemOrder?: number;
  options: QuestionOption[];
};

type ExamDetail = SavedExamSummary & {
  items: ExamDetailQuestion[];
};

type DraftDetail = {
  draftId: number;
  title: string;
  courseId?: number;
  totalQuestions: number;
  totalWeight: number;
  generatedAt: string;
  savedExamId?: number;
  items: ExamDetailQuestion[];
};

type ExamsWorkspaceTab = 'questions' | 'groups' | 'drafts' | 'saved';

export interface ExamsPageProps {
  courses?: CourseInput[];
}

const LIMIT_OPTIONS = [10, 20, 50];
const DRAFT_PREVIEWS_STORAGE_KEY = 'eduverse-instructor-exam-draft-previews';

const formatEnumLabel = (value?: string) => {
  if (!value) return 'N/A';
  if (value.toLowerCase() === 'mcq') return 'MCQ';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const normalizeQuestionsResponse = (response: unknown): ListQuestionsResult => {
  if (!response || typeof response !== 'object') {
    return { data: [], total: 0 };
  }

  const record = response as Record<string, unknown>;
  const rawData = record.data;
  const safeData = Array.isArray(rawData) ? (rawData as Question[]) : [];
  const rawTotal = record.total;
  const safeTotal = typeof rawTotal === 'number' && Number.isFinite(rawTotal) ? rawTotal : safeData.length;

  return { data: safeData, total: safeTotal };
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const resolveQuestionCount = (record: Record<string, unknown>, fallback: number): number =>
  toFiniteNumber(
    record.itemCount ??
      record.totalQuestions ??
      record.questionCount ??
      record.questionsCount ??
      record.totalQuestionCount ??
      record.total_questions ??
      record.questions_count,
  ) ?? fallback;

const normalizeListData = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const record = toRecord(response);
  if (!record) return [];

  const data = record.data;
  if (Array.isArray(data)) return data as T[];

  const items = record.items;
  if (Array.isArray(items)) return items as T[];

  return [];
};

const normalizeObjectData = (response: unknown): Record<string, unknown> | null => {
  const record = toRecord(response);
  if (!record) return null;
  const nestedData = toRecord(record.data);
  if (nestedData) return nestedData;
  return record;
};

const normalizeQuestionOptions = (value: unknown): QuestionOption[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((option) => {
      const optionRecord = toRecord(option);
      if (!optionRecord) return null;

      return {
        optionText: toNonEmptyString(optionRecord.optionText ?? optionRecord.text ?? optionRecord.label),
        isCorrect:
          typeof optionRecord.isCorrect === 'boolean'
            ? optionRecord.isCorrect
            : typeof optionRecord.correct === 'boolean'
              ? optionRecord.correct
              : undefined,
      };
    })
    .filter((option): option is QuestionOption => option !== null);
};

const resolveDateString = (...values: unknown[]): string => {
  for (const value of values) {
    const parsed = toNonEmptyString(value);
    if (parsed) return parsed;
  }
  return new Date().toISOString();
};

const normalizeExamItems = (value: unknown): ExamDetailQuestion[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const itemRecord = toRecord(item);
      if (!itemRecord) return null;
      const questionRecord = toRecord(itemRecord.question);

      const questionId = toFiniteNumber(itemRecord.questionId ?? questionRecord?.id);
      const chapterId = toFiniteNumber(itemRecord.chapterId ?? questionRecord?.chapterId);
      const itemOrder = toFiniteNumber(itemRecord.itemOrder ?? itemRecord.order);
      const questionText =
        toNonEmptyString(itemRecord.questionText) ??
        toNonEmptyString(questionRecord?.questionText) ??
        toNonEmptyString(questionRecord?.text) ??
        `Question #${questionId ?? index + 1}`;
      const weight = toFiniteNumber(itemRecord.weight ?? itemRecord.mark ?? itemRecord.score) ?? 0;
      const itemId = toFiniteNumber(itemRecord.id ?? itemRecord.itemId) ?? questionId ?? index + 1;

      return {
        id: String(itemId),
        questionId,
        chapterId,
        questionType: toNonEmptyString(itemRecord.questionType ?? questionRecord?.questionType ?? questionRecord?.type),
        difficulty: toNonEmptyString(itemRecord.difficulty ?? questionRecord?.difficulty),
        bloomLevel: toNonEmptyString(itemRecord.bloomLevel ?? itemRecord.bloom ?? questionRecord?.bloomLevel),
        questionText,
        expectedAnswerText: toNonEmptyString(itemRecord.expectedAnswerText ?? questionRecord?.expectedAnswerText),
        hints: toNonEmptyString(itemRecord.hints ?? questionRecord?.hints),
        weight,
        itemOrder,
        options: normalizeQuestionOptions(itemRecord.options ?? questionRecord?.options),
      };
    })
    .filter((item): item is ExamDetailQuestion => item !== null);
};

const normalizeDraftPreviewItems = (value: unknown, draftId: number): ExamDraftPreviewRecord['items'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const itemRecord = toRecord(item);
      if (!itemRecord) return null;
      const questionRecord = toRecord(itemRecord.question);

      const itemId = toFiniteNumber(itemRecord.id ?? itemRecord.itemId) ?? index + 1;
      const questionId = toFiniteNumber(itemRecord.questionId ?? questionRecord?.id) ?? index + 1;
      const chapterId = toFiniteNumber(itemRecord.chapterId ?? questionRecord?.chapterId) ?? 0;
      const itemOrder = toFiniteNumber(itemRecord.itemOrder ?? itemRecord.order) ?? index + 1;
      const weight = toFiniteNumber(itemRecord.weight ?? itemRecord.mark ?? itemRecord.score) ?? 0;

      return {
        id: itemId,
        draftId,
        questionId,
        chapterId,
        questionType: toNonEmptyString(itemRecord.questionType ?? questionRecord?.questionType) as
          | ExamDraftPreviewRecord['items'][number]['questionType']
          | undefined,
        difficulty: toNonEmptyString(itemRecord.difficulty ?? questionRecord?.difficulty) as
          | ExamDraftPreviewRecord['items'][number]['difficulty']
          | undefined,
        bloomLevel: toNonEmptyString(itemRecord.bloomLevel ?? itemRecord.bloom ?? questionRecord?.bloomLevel) as
          | ExamDraftPreviewRecord['items'][number]['bloomLevel']
          | undefined,
        weight,
        itemOrder,
      };
    })
    .filter((item): item is ExamDraftPreviewRecord['items'][number] => item !== null);
};

const mergeDrafts = (
  backendDrafts: ExamDraftPreviewRecord[],
  localDrafts: ExamDraftPreviewRecord[],
): ExamDraftPreviewRecord[] => {
  const byId = new Map<number, ExamDraftPreviewRecord>();
  backendDrafts.forEach((draft) => byId.set(draft.draftId, draft));
  localDrafts.forEach((draft) => {
    if (!byId.has(draft.draftId)) {
      byId.set(draft.draftId, draft);
    }
  });
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  );
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const normalizeDraftDetail = (
  draftId: number,
  payload: Record<string, unknown>,
  fallbackDraft?: ExamDraftPreviewRecord,
): DraftDetail => {
  const items = normalizeExamItems(payload.items ?? payload.questions ?? payload.examItems);
  const totalWeightFromItems = items.reduce((sum, item) => sum + item.weight, 0);

  return {
    draftId,
    title: toNonEmptyString(payload.title) ?? fallbackDraft?.title ?? `Draft #${draftId}`,
    courseId: toFiniteNumber(payload.courseId) ?? fallbackDraft?.courseId,
    totalQuestions: toFiniteNumber(payload.totalQuestions) ?? items.length,
    totalWeight: toFiniteNumber(payload.totalWeight) ?? totalWeightFromItems,
    generatedAt: resolveDateString(payload.generatedAt, payload.createdAt, fallbackDraft?.generatedAt),
    savedExamId: toFiniteNumber(payload.savedExamId ?? payload.examId) ?? fallbackDraft?.savedExamId,
    items,
  };
};

const resolveQuestionAnswer = (question: Question): string => {
  const expected = toNonEmptyString(question.expectedAnswerText);
  if (expected) return expected;

  const options = Array.isArray(question.options) ? question.options : [];
  const correctOptions = options
    .filter((option) => option.isCorrect)
    .map((option) => toNonEmptyString(option.optionText))
    .filter((value): value is string => !!value);

  if (correctOptions.length > 0) {
    return correctOptions.join(' / ');
  }

  return 'No answer provided';
};

export function ExamsPage({ courses = [] }: ExamsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ tab?: string; id?: string }>();
  const { isDark, primaryHex } = useTheme();

  const courseOptions = useMemo(() => {
    const seen = new Set<string>();
    return courses
      .map((course) => {
        const value = String(course.courseId ?? course.id ?? '');
        const label = course.courseName || course.name || '';
        if (!value || !label) return null;
        return { value, label };
      })
      .filter((item): item is CourseOption => {
        if (!item || seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });
  }, [courses]);

  const courseNameById = useMemo(
    () => new Map<string, string>(courseOptions.map((course) => [course.value, course.label])),
    [courseOptions],
  );
  const examList = useExamGeneratorList();

  // Keep a ref so loadBackendExamsAndDrafts can read the latest courseOptions
  // without adding it to the effect dependency array (prevents spurious re-runs).
  const courseOptionsRef = useRef(courseOptions);
  useEffect(() => { courseOptionsRef.current = courseOptions; }, [courseOptions]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionImageUrls, setQuestionImageUrls] = useState<Record<string, string>>({});
  const [questionImageErrors, setQuestionImageErrors] = useState<Record<string, boolean>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [showExamGenerationModal, setShowExamGenerationModal] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<ExamsWorkspaceTab>('questions');
  const [generatedDrafts, setGeneratedDrafts] = useState<ExamDraftPreviewRecord[]>([]);
  const [backendSavedExams, setBackendSavedExams] = useState<SavedExamSummary[]>([]);
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [loadingExamDetail, setLoadingExamDetail] = useState(false);
  const [examDetailError, setExamDetailError] = useState<string | null>(null);
  const [draftDetail, setDraftDetail] = useState<DraftDetail | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [editingQuestionAnswer, setEditingQuestionAnswer] = useState('');
  const [editingQuestionHint, setEditingQuestionHint] = useState('');
  const [savingQuestionEdit, setSavingQuestionEdit] = useState(false);
  const [draftActionLoadingKey, setDraftActionLoadingKey] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  // New state for DraftEditorModal and ExamFullViewModal
  const [draftEditorOpen, setDraftEditorOpen] = useState(false);
  const [activeDraftEditorId, setActiveDraftEditorId] = useState<number | null>(null);
  const [activeDraftEditorTitle, setActiveDraftEditorTitle] = useState('');
  const [examViewOpen, setExamViewOpen] = useState(false);
  const [activeExamViewId, setActiveExamViewId] = useState<number | null>(null);

  // Paper template state for Saved Exams
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [templateExamId, setTemplateExamId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [draftAddQuestionId, setDraftAddQuestionId] = useState('');
  const [draftAddWeight, setDraftAddWeight] = useState('1');
  const [draftAddOrder, setDraftAddOrder] = useState('1');
  const [draftItemEdits, setDraftItemEdits] = useState<
    Record<string, { replacementQuestionId: string; weight: string; itemOrder: string }>
  >({});
  const [savedExamQuestionCountOverrides, setSavedExamQuestionCountOverrides] = useState<Record<number, number>>({});
  const [draftQuestionCountOverrides, setDraftQuestionCountOverrides] = useState<Record<number, number>>({});

  // Question bank upgrades state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [filterQuestionType, setFilterQuestionType] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterBloomLevel, setFilterBloomLevel] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{ approved: number; underReview: number; draft: number } | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingQuestionId, setRejectingQuestionId] = useState<number | null>(null);
  const [rejectingQuestionText, setRejectingQuestionText] = useState('');
  const [batchStatusDialogOpen, setBatchStatusDialogOpen] = useState(false);
  const [chapterManagerOpen, setChapterManagerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingQuestionIds, setDeletingQuestionIds] = useState<number[]>([]);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [attachmentsPanelOpen, setAttachmentsPanelOpen] = useState(false);
  const [attachmentsPanelQuestionId, setAttachmentsPanelQuestionId] = useState<number | null>(null);
  const [attachmentsPanelQuestionText, setAttachmentsPanelQuestionText] = useState('');
  const [readiness, setReadiness] = useState<{ ready: boolean; reasons?: string[] } | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [examStats, setExamStats] = useState<Record<string, number> | null>(null);
  const [examStatsLoading, setExamStatsLoading] = useState(false);
  const [examStatsOpen, setExamStatsOpen] = useState(false);

  // Debounce search input → searchQuery (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load live stats (approved / under_review / draft counts) — only needed on questions tab
  useEffect(() => {
    if (activeWorkspaceTab !== 'questions') return;
    let mounted = true;
    QuestionBankService.getStats()
      .then((response) => {
        if (!mounted) return;
        const record = toRecord(response) ?? {};
        const data = toRecord(record.data) ?? record;
        const approved = toFiniteNumber(data.approved ?? data.approvedCount) ?? 0;
        const underReview = toFiniteNumber(data.under_review ?? data.underReview ?? data.underReviewCount) ?? 0;
        const draft = toFiniteNumber(data.draft ?? data.draftCount) ?? 0;
        setStats({ approved, underReview, draft });
        if (mounted) setStatsError(false);
      })
      .catch(() => {
        if (mounted) setStatsError(true);
      });
    return () => { mounted = false; };
  }, [activeWorkspaceTab, refreshKey]);

  // Check generation readiness for drafts tab
  useEffect(() => {
    if (activeWorkspaceTab !== 'drafts' || selectedCourse === 'all') {
      setReadiness(null);
      return;
    }
    let mounted = true;
    setReadinessLoading(true);
    ExamGenerationService.checkGenerationReadiness(Number(selectedCourse))
      .then((response) => {
        if (!mounted) return;
        const record = toRecord(response) ?? {};
        const data = toRecord(record.data) ?? record;
        setReadiness({ ready: data.ready ?? true, reasons: data.reasons || [] });
      })
      .catch(() => {
        if (mounted) setReadiness(null);
      })
      .finally(() => {
        if (mounted) setReadinessLoading(false);
      });
    return () => { mounted = false; };
  }, [activeWorkspaceTab, selectedCourse]);

  // Fetch exam statistics for saved exams tab
  useEffect(() => {
    if (activeWorkspaceTab !== 'saved') {
      setExamStats(null);
      return;
    }
    let mounted = true;
    setExamStatsLoading(true);
    ExamGenerationService.getExamStats()
      .then((response) => {
        if (!mounted) return;
        const record = toRecord(response) ?? {};
        const data = toRecord(record.data) ?? record;
        setExamStats(data);
      })
      .catch(() => {
        if (mounted) setExamStats(null);
      })
      .finally(() => {
        if (mounted) setExamStatsLoading(false);
      });
    return () => { mounted = false; };
  }, [activeWorkspaceTab]);

  useEffect(() => {
    const cached = localStorage.getItem(DRAFT_PREVIEWS_STORAGE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as ExamDraftPreviewRecord[];
      if (Array.isArray(parsed)) {
        const deduped = Array.from(
          new Map(parsed.map((d) => [d.draftId, d])).values(),
        );
        setGeneratedDrafts(deduped);
      }
    } catch {
      localStorage.removeItem(DRAFT_PREVIEWS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (activeWorkspaceTab !== 'drafts' && activeWorkspaceTab !== 'saved') return;
    const courseId = selectedCourse !== 'all' ? Number(selectedCourse) : undefined;
    void examList.loadDrafts({ courseId, page: 1, limit });
    void examList.loadExams({ courseId, page: 1, limit });
    void examList.loadStats(courseId);
  }, [activeWorkspaceTab, selectedCourse, limit]);

  useEffect(() => {
    if (!examList.drafts.length) return;
    setGeneratedDrafts((previous) => {
      const mapped = examList.drafts
        .filter((draft) => (draft.draftId ?? draft.id) !== undefined)
        .map((draft) => ({
          ...draft,
          draftId: Number(draft.draftId ?? draft.id),
          title: draft.title ?? `Draft #${draft.draftId ?? draft.id}`,
          courseId: Number(draft.courseId ?? 0),
          generatedAt: new Date().toISOString(),
          totalQuestions: Number(draft.totalQuestions ?? draft.items?.length ?? 0),
          totalWeight: Number(draft.totalWeight ?? draft.totalMarks ?? 0),
          items: draft.items ?? [],
        })) as ExamDraftPreviewRecord[];

      if (mapped.length === 0) return previous;
      const byId = new Map<number, ExamDraftPreviewRecord>();
      [...previous, ...mapped].forEach((item) => byId.set(item.draftId, item));
      return Array.from(byId.values());
    });
  }, [examList.drafts]);

  useEffect(() => {
    if (!examList.exams.length) return;
    setBackendSavedExams(
      examList.exams
        .filter((exam) => (exam.examId ?? exam.id) !== undefined)
        .map((exam) => ({
          examId: Number(exam.examId ?? exam.id),
          title: exam.title ?? `Exam #${exam.examId ?? exam.id}`,
          courseId: exam.courseId,
          status: exam.status ?? 'draft',
          questionCount: Number(exam.totalMarks ?? 0),
          totalWeight: Number(exam.totalMarks ?? 0),
          createdAt: new Date().toISOString(),
        })),
    );
  }, [examList.exams]);

  useEffect(() => {
    localStorage.setItem(DRAFT_PREVIEWS_STORAGE_KEY, JSON.stringify(generatedDrafts));
  }, [generatedDrafts]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const selectedQuestionIdsArray = useMemo(() => Array.from(selectedQuestionIds), [selectedQuestionIds]);

  const chapterOptions = useMemo(
    () => chapters.map((chapter) => ({ value: String(chapter.id), label: chapter.name })),
    [chapters],
  );

  const chapterNameById = useMemo(
    () => new Map<string, string>(chapters.map((chapter) => [String(chapter.id), chapter.name])),
    [chapters],
  );

  useEffect(() => {
    if (selectedCourse === 'all') {
      setChapters([]);
      setSelectedChapter('all');
      return;
    }

    let mounted = true;
    const loadChapters = async () => {
      try {
        setChaptersLoading(true);
        const items = await ChapterService.listByCourse(selectedCourse);
        if (!mounted) return;

        const safeItems = Array.isArray(items) ? items : [];
        setChapters(safeItems);
        setSelectedChapter((currentChapter) =>
          currentChapter === 'all' || safeItems.some((chapter) => String(chapter.id) === currentChapter)
            ? currentChapter
            : 'all',
        );
      } catch (err) {
        if (!mounted) return;
        setChapters([]);
        setSelectedChapter('all');
        toast.error(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        if (mounted) {
          setChaptersLoading(false);
        }
      }
    };

    void loadChapters();
    return () => {
      mounted = false;
    };
  }, [selectedCourse]);

  useEffect(() => {
    if (activeWorkspaceTab !== 'questions') return;

    let mounted = true;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: {
          courseId?: number;
          chapterId?: number;
          questionType?: string;
          difficulty?: string;
          bloomLevel?: string;
          status?: string;
          search?: string;
          page: number;
          limit: number;
        } = {
          page,
          limit,
        };

        if (searchQuery) params.search = searchQuery;

        if (selectedCourse !== 'all') {
          const parsedCourseId = Number(selectedCourse);
          if (Number.isFinite(parsedCourseId)) {
            params.courseId = parsedCourseId;
          }
        }

        if (selectedChapter !== 'all') {
          const parsedChapterId = Number(selectedChapter);
          if (Number.isFinite(parsedChapterId)) {
            params.chapterId = parsedChapterId;
          }
        }

        // Backend only accepts a single enum value per param.
        // Fan out one request per combination when multiple are selected, then merge.
        const typeValues = filterQuestionType.length > 0 ? filterQuestionType : [undefined];
        const diffValues = filterDifficulty.length > 0 ? filterDifficulty : [undefined];
        const statusValues = filterStatus.length > 0 ? filterStatus : [undefined];
        const bloomValues = filterBloomLevel.length > 0 ? filterBloomLevel : [undefined];

        const isMulti =
          filterQuestionType.length > 1 ||
          filterDifficulty.length > 1 ||
          filterStatus.length > 1 ||
          filterBloomLevel.length > 1;

        let normalized: ListQuestionsResult;

        if (!isMulti) {
          // Single-value path — one request, server-side pagination works normally
          if (filterQuestionType.length === 1) params.questionType = filterQuestionType[0];
          if (filterDifficulty.length === 1) (params as Record<string, unknown>).difficulty = filterDifficulty[0];
          if (filterStatus.length === 1) params.status = filterStatus[0];
          if (filterBloomLevel.length === 1) params.bloomLevel = filterBloomLevel[0];
          normalized = normalizeQuestionsResponse(await QuestionBankService.list(params as Parameters<typeof QuestionBankService.list>[0]));
        } else {
          // Multi-value path — fan out requests for every combination, fetch all pages
          const combos: Array<{ questionType?: string; difficulty?: string; status?: string; bloomLevel?: string }> = [];
          for (const qt of typeValues) {
            for (const diff of diffValues) {
              for (const st of statusValues) {
                for (const bl of bloomValues) {
                  combos.push({ questionType: qt, difficulty: diff, status: st, bloomLevel: bl });
                }
              }
            }
          }

          const allData: Question[] = [];

          const fetchAllPages = async (combo: { questionType?: string; difficulty?: string; status?: string; bloomLevel?: string }) => {
            const PAGE_LIMIT = 100;
            const comboParams = { ...params, page: 1, limit: PAGE_LIMIT };
            if (combo.questionType) comboParams.questionType = combo.questionType;
            if (combo.difficulty) (comboParams as Record<string, unknown>).difficulty = combo.difficulty;
            if (combo.status) comboParams.status = combo.status;
            if (combo.bloomLevel) comboParams.bloomLevel = combo.bloomLevel;

            type ListParams = Parameters<typeof QuestionBankService.list>[0];
            const first = normalizeQuestionsResponse(await QuestionBankService.list(comboParams as ListParams));
            allData.push(...first.data);

            const totalPages = Math.ceil(first.total / PAGE_LIMIT);
            if (totalPages > 1) {
              const rest = await Promise.all(
                Array.from({ length: totalPages - 1 }, (_, i) =>
                  QuestionBankService.list({ ...comboParams, page: i + 2 } as ListParams).then(normalizeQuestionsResponse),
                ),
              );
              rest.forEach((r) => allData.push(...r.data));
            }
          };

          await Promise.all(combos.map(fetchAllPages));

          // Deduplicate by id, then apply pagination manually
          const seen = new Set<string>();
          const deduped = allData.filter((q) => {
            const key = String(q.id ?? Math.random());
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const start = (page - 1) * limit;
          normalized = {
            data: deduped.slice(start, start + limit),
            total: deduped.length,
          };
        }

        if (!mounted) return;
        setQuestions(normalized.data);
        setTotal(normalized.total);
        const newTotalPages = Math.max(1, Math.ceil(normalized.total / limit));
        if (page > newTotalPages) {
          setPage(newTotalPages);
        }
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load question bank';
        setQuestions([]);
        setTotal(0);
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadQuestions();
    return () => {
      mounted = false;
    };
  }, [activeWorkspaceTab, selectedCourse, selectedChapter, page, limit, refreshKey, searchQuery, filterQuestionType.join(','), filterDifficulty.join(','), filterStatus.join(','), filterBloomLevel.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const nextUrls: Record<string, string> = {};
    const nextErrors: Record<string, boolean> = {};

    questions.forEach((question, index) => {
      const questionKey = String(question.id ?? `question-${page}-${index}`);
      if (question.questionImageUrl) {
        nextUrls[questionKey] = question.questionImageUrl;
      } else if (question.questionFileId != null && question.questionFileId !== '') {
        nextErrors[questionKey] = true;
      }
    });

    setQuestionImageUrls(nextUrls);
    setQuestionImageErrors(nextErrors);
  }, [questions, page]);

  const refreshQuestions = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  const refreshChapters = useCallback(() => {
    if (selectedCourse !== 'all') {
      setChapters([]);
      setSelectedChapter('all');
    }
  }, [selectedCourse]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedChapter('all');
    setPage(1);
  };

  const handleChapterChange = (value: string) => {
    if (selectedCourse === 'all') return;
    setSelectedChapter(value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    const parsedLimit = Number(value);
    if (!Number.isFinite(parsedLimit) || parsedLimit < 1) return;
    setLimit(parsedLimit);
    setPage(1);
  };

  const handleCloseQuestionBank = () => {
    setShowQuestionBankModal(false);
    refreshQuestions();
  };

  const handleCloseExamGeneration = () => {
    setShowExamGenerationModal(false);
    refreshQuestions();
  };

  const handlePreviewGenerated = useCallback((preview: ExamDraftPreviewRecord) => {
    setGeneratedDrafts((previous) => {
      const withoutCurrent = previous.filter((item) => item.draftId !== preview.draftId);
      return [preview, ...withoutCurrent].slice(0, 12);
    });
  }, []);

  const handleDraftSaved = useCallback((payload: { draftId: number; examId: number }) => {
    setGeneratedDrafts((previous) =>
      previous.map((item) => (item.draftId === payload.draftId ? { ...item, savedExamId: payload.examId } : item)),
    );
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBackendExamsAndDrafts = async () => {
      const selectedCourseId = selectedCourse === 'all' ? undefined : toFiniteNumber(selectedCourse);
      const baseParams: { page: number; limit: number } = {
        page: 1,
        limit: 100,
      };

      const requestList = async (
        loader: (params?: { courseId?: number; page?: number; limit?: number }) => Promise<unknown>,
      ): Promise<unknown[]> => {
        if (selectedCourseId !== undefined) {
          return [await loader({ ...baseParams, courseId: selectedCourseId })];
        }

        try {
          return [await loader(baseParams)];
        } catch (error) {
          const allCourseIds = Array.from(
            new Set(
              courseOptionsRef.current
                .map((course) => toFiniteNumber(course.value))
                .filter((courseId): courseId is number => courseId !== undefined),
            ),
          );

          if (allCourseIds.length === 0) {
            throw error;
          }

          const settled = await Promise.allSettled(
            allCourseIds.map((courseId) => loader({ ...baseParams, courseId })),
          );
          const successful = settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));

          if (successful.length === 0) {
            throw error;
          }

          return successful;
        }
      };

      try {
        const [draftResponses, examResponses] = await Promise.all([
          requestList((params) => ExamGenerationService.listDrafts(params)),
          requestList((params) => ExamGenerationService.listExams(params)),
        ]);

        const rawDrafts = draftResponses.flatMap((response) => normalizeListData<RawExamDraft>(response));
        const rawExams = examResponses.flatMap((response) => normalizeListData<RawExam>(response));

        const examsByDraftId = new Map<number, number>();
        const draftCourseById = new Map<number, number>();
        rawExams.forEach((exam) => {
          const examId = toFiniteNumber(exam.id ?? exam.examId);
          const draftId = toFiniteNumber(exam.draftId);
          if (examId !== undefined && draftId !== undefined) {
            examsByDraftId.set(draftId, examId);
          }
        });

        const mappedDrafts = rawDrafts
          .map((draft) => {
            const draftId = toFiniteNumber(draft.draftId ?? draft.id);
            if (draftId === undefined) return null;
            const draftRecord = toRecord(draft) ?? {};

            const items = normalizeDraftPreviewItems(draft.items, draftId);
            const totalWeightFromItems = items.reduce((sum, item) => sum + item.weight, 0);
            const mappedCourseId =
              toFiniteNumber(draft.courseId) ??
              selectedCourseId ??
              (selectedCourse === 'all' ? undefined : toFiniteNumber(selectedCourse));

            if (mappedCourseId !== undefined) {
              draftCourseById.set(draftId, mappedCourseId);
            }

            return {
              draftId,
              title: toNonEmptyString(draft.title) || `Draft #${draftId}`,
              courseId: mappedCourseId ?? 0,
              totalQuestions: resolveQuestionCount(draftRecord, items.length),
              totalWeight: toFiniteNumber(draft.totalWeight) ?? totalWeightFromItems,
              items,
              generatedAt: resolveDateString(draft.generatedAt, draft.createdAt),
              savedExamId:
                toFiniteNumber(draft.savedExamId ?? draft.examId) ||
                examsByDraftId.get(draftId) ||
                undefined,
            } as ExamDraftPreviewRecord;
          })
          .filter((draft): draft is ExamDraftPreviewRecord => draft !== null);

        const dedupedDrafts = Array.from(
          mappedDrafts.reduce<Map<number, ExamDraftPreviewRecord>>((acc, draft) => {
            const current = acc.get(draft.draftId);
            if (!current || new Date(draft.generatedAt).getTime() > new Date(current.generatedAt).getTime()) {
              acc.set(draft.draftId, draft);
            }
            return acc;
          }, new Map()),
        ).map(([, draft]) => draft);

        const mappedSavedExams = rawExams
          .map((exam) => {
            const examId = toFiniteNumber(exam.id ?? exam.examId);
            if (examId === undefined) return null;
            const examRecord = toRecord(exam) ?? {};

            const draftId = toFiniteNumber(exam.draftId);
            const items = normalizeExamItems(exam.items ?? exam.questions ?? exam.examItems);
            const totalWeightFromItems = items.reduce((sum, item) => sum + item.weight, 0);
            const fallbackCourseId = draftId !== undefined ? draftCourseById.get(draftId) : undefined;

            return {
              examId,
              draftId,
              title: toNonEmptyString(exam.title) || `Exam #${examId}`,
              courseId: toFiniteNumber(exam.courseId) ?? fallbackCourseId ?? selectedCourseId,
              status: toNonEmptyString(exam.status) || 'saved',
              questionCount: resolveQuestionCount(examRecord, items.length),
              totalWeight: toFiniteNumber(exam.totalMarks ?? exam.totalWeight) ?? totalWeightFromItems,
              createdAt: resolveDateString(exam.createdAt, exam.generatedAt, exam.updatedAt),
            } as SavedExamSummary;
          })
          .filter((exam): exam is SavedExamSummary => exam !== null);

        const dedupedSavedExams = Array.from(
          mappedSavedExams.reduce<Map<number, SavedExamSummary>>((acc, exam) => {
            const current = acc.get(exam.examId);
            if (!current || new Date(exam.createdAt).getTime() > new Date(current.createdAt).getTime()) {
              acc.set(exam.examId, exam);
            }
            return acc;
          }, new Map()),
        )
          .map(([, exam]) => exam)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (!mounted) return;
        setGeneratedDrafts((previous) => mergeDrafts(dedupedDrafts, previous));
        setBackendSavedExams(dedupedSavedExams);
      } catch (err) {
        if (!mounted) return;
        toast.error(err instanceof Error ? err.message : 'Failed to load exams and drafts from backend');
      }
    };

    void loadBackendExamsAndDrafts();
    return () => {
      mounted = false;
    };
  }, [selectedCourse, refreshKey]);

  const savedExamsFromDrafts = useMemo(
    () =>
      generatedDrafts
        .filter((draft): draft is ExamDraftPreviewRecord & { savedExamId: number } => !!draft.savedExamId)
        .map((draft) => ({
          examId: draft.savedExamId,
          draftId: draft.draftId,
          title: draft.title || `Exam #${draft.savedExamId}`,
          courseId: draft.courseId,
          status: 'saved',
          questionCount: draft.totalQuestions,
          totalWeight: draft.totalWeight,
          createdAt: draft.generatedAt,
        })),
    [generatedDrafts],
  );

  const savedExams = useMemo(() => {
    const byExamId = new Map<number, SavedExamSummary>();
    backendSavedExams.forEach((exam) => byExamId.set(exam.examId, exam));
    savedExamsFromDrafts.forEach((exam) => {
      if (!byExamId.has(exam.examId)) {
        byExamId.set(exam.examId, exam);
      }
    });
    return Array.from(byExamId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [backendSavedExams, savedExamsFromDrafts]);

  useEffect(() => {
    const missingCountExams = savedExams.filter(
      (exam) =>
        exam.questionCount === 0 &&
        exam.examId > 0 &&
        savedExamQuestionCountOverrides[exam.examId] === undefined,
    );
    if (missingCountExams.length === 0) return;

    let mounted = true;
    const hydrateCounts = async () => {
      const settled = await Promise.allSettled(
        missingCountExams.slice(0, 20).map(async (exam) => {
          const response = await ExamGenerationService.getExam(exam.examId);
          const record = normalizeObjectData(response);
          if (!record) return null;
          const items = normalizeExamItems(record.items ?? record.questions ?? record.examItems);
          return {
            examId: exam.examId,
            questionCount: resolveQuestionCount(record, items.length),
          };
        }),
      );

      if (!mounted) return;
      const nextOverrides = settled
        .filter((result): result is PromiseFulfilledResult<{ examId: number; questionCount: number } | null> => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter((value): value is { examId: number; questionCount: number } => value !== null)
        .reduce<Record<number, number>>((acc, item) => {
          acc[item.examId] = item.questionCount;
          return acc;
        }, {});

      if (Object.keys(nextOverrides).length > 0) {
        setSavedExamQuestionCountOverrides((previous) => ({ ...previous, ...nextOverrides }));
      }
    };

    void hydrateCounts();
    return () => {
      mounted = false;
    };
  }, [savedExams, savedExamQuestionCountOverrides]);

  useEffect(() => {
    const missingCountDrafts = generatedDrafts.filter(
      (draft) =>
        draft.totalQuestions === 0 &&
        draft.draftId > 0 &&
        draftQuestionCountOverrides[draft.draftId] === undefined,
    );
    if (missingCountDrafts.length === 0) return;

    let mounted = true;
    const hydrateCounts = async () => {
      const settled = await Promise.allSettled(
        missingCountDrafts.slice(0, 20).map(async (draft) => {
          const response = await ExamGenerationService.getDraft(draft.draftId);
          const record = normalizeObjectData(response);
          if (!record) return null;
          const normalized = normalizeDraftDetail(draft.draftId, record, draft);
          return {
            draftId: draft.draftId,
            questionCount: normalized.totalQuestions,
          };
        }),
      );

      if (!mounted) return;
      const nextOverrides = settled
        .filter((result): result is PromiseFulfilledResult<{ draftId: number; questionCount: number } | null> => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter((value): value is { draftId: number; questionCount: number } => value !== null)
        .reduce<Record<number, number>>((acc, item) => {
          acc[item.draftId] = item.questionCount;
          return acc;
        }, {});

      if (Object.keys(nextOverrides).length > 0) {
        setDraftQuestionCountOverrides((previous) => ({ ...previous, ...nextOverrides }));
      }
    };

    void hydrateCounts();
    return () => {
      mounted = false;
    };
  }, [generatedDrafts, draftQuestionCountOverrides]);

  const detailEntity = useMemo<'saved' | 'draft'>(() => {
    const paramsObj = new URLSearchParams(location.search);
    return paramsObj.get('entity') === 'draft' ? 'draft' : 'saved';
  }, [location.search]);

  const examIdFromRoute = useMemo(() => {
    if (params.tab !== 'exams' || !params.id) return null;
    const parsed = Number(params.id);
    if (!Number.isFinite(parsed) || parsed < 1) return null;
    return parsed;
  }, [params.id, params.tab]);

  useEffect(() => {
    if (examIdFromRoute === null) {
      setExamDetail(null);
      setDraftDetail(null);
      setExamDetailError(null);
      return;
    }

    let mounted = true;

    const buildItemEditMap = (items: ExamDetailQuestion[]) =>
      items.reduce<Record<string, { replacementQuestionId: string; weight: string; itemOrder: string }>>(
        (acc, item) => {
          acc[item.id] = {
            replacementQuestionId: '',
            weight: String(item.weight),
            itemOrder: String(item.itemOrder ?? 0),
          };
          return acc;
        },
        {},
      );

    const loadDetail = async () => {
      try {
        setLoadingExamDetail(true);
        setExamDetailError(null);

        if (detailEntity === 'draft') {
          const response = await ExamGenerationService.getDraft(examIdFromRoute);
          const record = normalizeObjectData(response);
          if (!record || !mounted) return;
          const fallbackDraft = generatedDrafts.find((draft) => draft.draftId === examIdFromRoute);
          const normalized = normalizeDraftDetail(examIdFromRoute, record, fallbackDraft);
          setDraftDetail(normalized);
          setExamDetail(null);
          setDraftItemEdits(buildItemEditMap(normalized.items));
          setDraftAddOrder(String(Math.max(1, normalized.items.length + 1)));
          return;
        }

        const response = await ExamGenerationService.getExam(examIdFromRoute);
        const record = normalizeObjectData(response);
        if (!record || !mounted) return;

        const fallbackSummary = savedExams.find((exam) => exam.examId === examIdFromRoute);
        const items = normalizeExamItems(record.items ?? record.questions ?? record.examItems);
        const totalWeightFromItems = items.reduce((sum, item) => sum + item.weight, 0);

        setExamDetail({
          examId: examIdFromRoute,
          draftId: toFiniteNumber(record.draftId) ?? fallbackSummary?.draftId,
          title: toNonEmptyString(record.title) ?? fallbackSummary?.title ?? `Exam #${examIdFromRoute}`,
          courseId: toFiniteNumber(record.courseId) ?? fallbackSummary?.courseId,
          status: toNonEmptyString(record.status) ?? fallbackSummary?.status ?? 'saved',
          questionCount: resolveQuestionCount(record, fallbackSummary?.questionCount ?? items.length),
          totalWeight: toFiniteNumber(record.totalWeight) ?? fallbackSummary?.totalWeight ?? totalWeightFromItems,
          createdAt: resolveDateString(record.createdAt, record.generatedAt, record.updatedAt, fallbackSummary?.createdAt),
          items,
        });
        setDraftDetail(null);
      } catch (err) {
        if (!mounted) return;
        setExamDetailError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        if (mounted) {
          setLoadingExamDetail(false);
        }
      }
    };

    void loadDetail();
    return () => {
      mounted = false;
    };
  }, [examIdFromRoute, savedExams, detailEntity, generatedDrafts]);

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * limit, total);

  const {
    cardClass,
    innerCardClass,
    headingClass,
    subTextClass,
    secondaryButtonClass,
    questionTypeBadgeClass,
    difficultyBadgeClass,
    bloomBadgeClass,
    countBadgeClass,
    weightBadgeClass,
    draftBadgeClass,
    questionCardClass,
  } = useMemo(() => {
    const base = 'px-2 py-1 text-xs rounded-full font-medium';
    return {
      cardClass: isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-300 shadow-sm',
      innerCardClass: isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300',
      headingClass: isDark ? 'text-white' : 'text-gray-950',
      subTextClass: isDark ? 'text-slate-300' : 'text-gray-800',
      secondaryButtonClass: isDark
        ? 'border-white/10 text-slate-200 hover:bg-white/10'
        : 'border-gray-400 bg-white text-gray-800 hover:bg-gray-100',
      questionTypeBadgeClass: `${base} ${isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`,
      difficultyBadgeClass: `${base} ${isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-800'}`,
      bloomBadgeClass: `${base} ${isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`,
      countBadgeClass: `${base} ${isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`,
      weightBadgeClass: `${base} ${isDark ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-100 text-blue-800'}`,
      draftBadgeClass: `${base} ${isDark ? 'bg-slate-500/20 text-slate-200' : 'bg-slate-200 text-slate-800'}`,
      questionCardClass: `rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'} transition-colors`,
    };
  }, [isDark]);

  const openQuestionEditor = (question: Question) => {
    setEditingQuestion(question);
    setEditingQuestionText(question.questionText?.trim() || '');
    setEditingQuestionAnswer(question.expectedAnswerText?.trim() || resolveQuestionAnswer(question));
    setEditingQuestionHint(question.hints?.trim() || '');
  };

  const closeQuestionEditor = () => {
    setEditingQuestion(null);
    setEditingQuestionText('');
    setEditingQuestionAnswer('');
    setEditingQuestionHint('');
  };

  const saveQuestionEdits = async () => {
    if (!editingQuestion?.id) return;

    const questionId = Number(editingQuestion.id);
    if (!Number.isFinite(questionId) || questionId < 1) {
      toast.error('Invalid question ID');
      return;
    }

    try {
      setSavingQuestionEdit(true);
      await QuestionBankService.update(questionId, {
        questionText: editingQuestionText.trim() || undefined,
        expectedAnswerText: editingQuestionAnswer.trim() || undefined,
        hints: editingQuestionHint.trim() || undefined,
      });
      toast.success('Question updated');
      closeQuestionEditor();
      refreshQuestions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update question');
    } finally {
      setSavingQuestionEdit(false);
    }
  };

  // Question bank upgrade handlers
  const handleToggleQuestionSelect = (questionId: number) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    if (selectedQuestionIds.size === questions.length && questions.length > 0) {
      setSelectedQuestionIds(new Set());
    } else {
      const allIds = new Set(questions.map((q) => Number(q.id)));
      setSelectedQuestionIds(allIds);
    }
  };

  const handleClearFilters = () => {
    setFilterQuestionType([]);
    setFilterDifficulty([]);
    setFilterStatus([]);
    setFilterBloomLevel([]);
    setSearchInput('');
    setPage(1);
  };

  const handleToggleQuestionType = (type: string) => {
    setFilterQuestionType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const handleToggleDifficulty = (difficulty: string) => {
    setFilterDifficulty((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty]
    );
    setPage(1);
  };

  const handleToggleStatus = (status: string) => {
    setFilterStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  const handleToggleBloomLevel = (bloom: string) => {
    setFilterBloomLevel((prev) =>
      prev.includes(bloom) ? prev.filter((b) => b !== bloom) : [...prev, bloom]
    );
    setPage(1);
  };

  const handleOpenRejectDialog = (questionId: number, questionText: string) => {
    setRejectingQuestionId(questionId);
    setRejectingQuestionText(questionText);
    setRejectDialogOpen(true);
  };

  const handleDeleteSelectedQuestions = async () => {
    const ids = Array.from(selectedQuestionIds);
    if (ids.length === 0) return;

    try {
      setActionLoading('delete-questions');
      for (const id of ids) {
        await QuestionBankService.deleteQuestion(id);
      }
      toast.success(`${ids.length} question${ids.length !== 1 ? 's' : ''} deleted`);
      setSelectedQuestionIds(new Set());
      setDeleteConfirmOpen(false);
      refreshQuestions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete questions');
    } finally {
      setActionLoading(null);
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateDraftItemEdit = (
    itemId: string,
    patch: Partial<{ replacementQuestionId: string; weight: string; itemOrder: string }>,
  ) => {
    setDraftItemEdits((previous) => ({
      ...previous,
      [itemId]: {
        replacementQuestionId: previous[itemId]?.replacementQuestionId ?? '',
        weight: previous[itemId]?.weight ?? '',
        itemOrder: previous[itemId]?.itemOrder ?? '',
        ...patch,
      },
    }));
  };

  const applyDraftItemEdit = async (item: ExamDetailQuestion) => {
    if (!draftDetail) return;
    const edit = draftItemEdits[item.id];
    if (!edit) return;

    const payload: Record<string, number> = {};
    const parsedWeight = Number(edit.weight);
    const parsedOrder = Number(edit.itemOrder);
    const parsedReplacementId = Number(edit.replacementQuestionId);

    if (Number.isFinite(parsedWeight) && parsedWeight >= 0 && parsedWeight !== item.weight) {
      payload.weight = parsedWeight;
    }
    if (Number.isFinite(parsedOrder) && parsedOrder >= 0 && parsedOrder !== (item.itemOrder ?? 0)) {
      payload.itemOrder = parsedOrder;
    }
    if (
      edit.replacementQuestionId.trim() &&
      Number.isFinite(parsedReplacementId) &&
      parsedReplacementId > 0 &&
      parsedReplacementId !== item.questionId
    ) {
      payload.replacementQuestionId = parsedReplacementId;
    }

    if (Object.keys(payload).length === 0) {
      toast.message('No changes to apply');
      return;
    }

    try {
      setDraftActionLoadingKey(`patch-${item.id}`);
      await ExamGenerationService.updateDraftItem(draftDetail.draftId, Number(item.id), payload);

      setDraftDetail((previous) => {
        if (!previous) return previous;
        const nextItems = previous.items.map((existing) =>
          existing.id === item.id
            ? {
                ...existing,
                weight: payload.weight ?? existing.weight,
                itemOrder: payload.itemOrder ?? existing.itemOrder,
                questionId: payload.replacementQuestionId ?? existing.questionId,
                questionText:
                  payload.replacementQuestionId !== undefined
                    ? `Question #${payload.replacementQuestionId}`
                    : existing.questionText,
                options: payload.replacementQuestionId !== undefined ? [] : existing.options,
              }
            : existing,
        );
        return {
          ...previous,
          items: nextItems,
          totalWeight: nextItems.reduce((sum, nextItem) => sum + nextItem.weight, 0),
        };
      });

      updateDraftItemEdit(item.id, {
        replacementQuestionId: '',
        weight: String(payload.weight ?? item.weight),
        itemOrder: String(payload.itemOrder ?? item.itemOrder ?? 0),
      });
      toast.success('Draft item updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update draft item');
    } finally {
      setDraftActionLoadingKey(null);
    }
  };

  const addQuestionToDraft = async () => {
    if (!draftDetail) return;

    const questionId = Number(draftAddQuestionId);
    const weight = Number(draftAddWeight);
    const itemOrder = Number(draftAddOrder);

    if (!Number.isFinite(questionId) || questionId < 1) {
      toast.error('Enter a valid question ID');
      return;
    }
    if (!Number.isFinite(weight) || weight < 0) {
      toast.error('Weight must be zero or more');
      return;
    }

    try {
      setDraftActionLoadingKey('add-item');
      const response = await ExamGenerationService.addDraftItem(draftDetail.draftId, {
        questionId,
        weight,
        itemOrder: Number.isFinite(itemOrder) ? itemOrder : undefined,
      });

      const responseRecord = normalizeObjectData(response);
      const appendedItem =
        normalizeExamItems([responseRecord]).at(0) ??
        ({
          id: String(Date.now()),
          questionId,
          chapterId: undefined,
          questionType: undefined,
          difficulty: undefined,
          bloomLevel: undefined,
          questionText: `Question #${questionId}`,
          expectedAnswerText: undefined,
          hints: undefined,
          weight,
          itemOrder: Number.isFinite(itemOrder) ? itemOrder : draftDetail.items.length + 1,
          options: [],
        } as ExamDetailQuestion);

      setDraftDetail((previous) => {
        if (!previous) return previous;
        const nextItems = [...previous.items, appendedItem];
        return {
          ...previous,
          items: nextItems,
          totalQuestions: nextItems.length,
          totalWeight: nextItems.reduce((sum, nextItem) => sum + nextItem.weight, 0),
        };
      });
      setDraftItemEdits((previous) => ({
        ...previous,
        [appendedItem.id]: {
          replacementQuestionId: '',
          weight: String(appendedItem.weight),
          itemOrder: String(appendedItem.itemOrder ?? 0),
        },
      }));
      setDraftAddQuestionId('');
      setDraftAddWeight('1');
      setDraftAddOrder((previous) => String(Number(previous || '1') + 1));
      toast.success('Question added to draft');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add question to draft');
    } finally {
      setDraftActionLoadingKey(null);
    }
  };

  const deleteDraftItem = async (item: ExamDetailQuestion) => {
    if (!draftDetail) return;
    try {
      setDraftActionLoadingKey(`delete-${item.id}`);
      await ExamGenerationService.deleteDraftItem(draftDetail.draftId, Number(item.id));
      setDraftDetail((previous) => {
        if (!previous) return previous;
        const nextItems = previous.items.filter((existing) => existing.id !== item.id);
        return {
          ...previous,
          items: nextItems,
          totalQuestions: nextItems.length,
          totalWeight: nextItems.reduce((sum, nextItem) => sum + nextItem.weight, 0),
        };
      });
      toast.success('Draft item removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove draft item');
    } finally {
      setDraftActionLoadingKey(null);
    }
  };

  const saveDraftAsExamFromDetail = async () => {
    if (!draftDetail) return;
    try {
      setDraftActionLoadingKey('save-draft');
      const saved = await ExamGenerationService.saveDraft(draftDetail.draftId);
      setGeneratedDrafts((previous) =>
        previous.map((draft) =>
          draft.draftId === draftDetail.draftId ? { ...draft, savedExamId: saved.id } : draft,
        ),
      );
      setRefreshKey((previous) => previous + 1);
      toast.success(`Draft saved as Exam #${saved.id}`);
      navigate(`/instructordashboard/exams/${saved.id}?entity=saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setDraftActionLoadingKey(null);
    }
  };

  const downloadFromBase64 = (result: { fileName?: string; mimeType?: string; content?: string }, fallbackName: string, fallbackMime: string) => {
    const fileName = result?.fileName ?? fallbackName;
    const mimeType = result?.mimeType ?? fallbackMime;
    const byteChars = atob(result?.content ?? '');
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
    return fileName;
  };

  const exportDetailToWord = async () => {
    if (examIdFromRoute === null) return;
    try {
      setExportingDocx(true);
      const result = await ExamGenerationService.exportExamWord(examIdFromRoute) as { fileName?: string; mimeType?: string; content?: string };
      const fileName = downloadFromBase64(result, `exam-${examIdFromRoute}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      toast.success(`Downloaded ${fileName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export Word file');
    } finally {
      setExportingDocx(false);
    }
  };

  const exportDetailToPdf = async () => {
    if (examIdFromRoute === null) return;
    try {
      setExportingPdf(true);
      await downloadClientExamPdf(examIdFromRoute);
      toast.success('Downloaded exam PDF');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  if (examIdFromRoute !== null) {
    const fallbackSummary = savedExams.find((exam) => exam.examId === examIdFromRoute);
    const isDraftDetail = detailEntity === 'draft';
    const detailTitle = isDraftDetail
      ? draftDetail?.title || `Draft #${examIdFromRoute}`
      : examDetail?.title || fallbackSummary?.title || `Exam #${examIdFromRoute}`;
    const detailCourseId = isDraftDetail ? draftDetail?.courseId : examDetail?.courseId;
    const detailQuestionCount = isDraftDetail
      ? draftDetail?.totalQuestions ?? draftDetail?.items.length ?? 0
      : examDetail?.questionCount ?? fallbackSummary?.questionCount ?? 0;
    const detailWeight = isDraftDetail
      ? draftDetail?.totalWeight ?? 0
      : examDetail?.totalWeight ?? fallbackSummary?.totalWeight ?? 0;
    const detailItems = isDraftDetail ? draftDetail?.items ?? [] : examDetail?.items ?? [];
    const detailStatus = isDraftDetail ? 'draft' : examDetail?.status ?? fallbackSummary?.status ?? 'saved';

    return (
      <div className="space-y-6">
        <section className={`rounded-xl border p-5 sm:p-6 ${cardClass}`}>
          <button
            type="button"
            onClick={() => navigate('/instructordashboard/exams')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm mb-4 ${secondaryButtonClass}`}
            style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
          >
            <ArrowLeft size={15} />
            Back to Exams Tab
          </button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className={`text-2xl font-bold ${headingClass}`}>{detailTitle}</h2>
              <p className={`mt-1 text-sm ${subTextClass}`}>
                {isDraftDetail ? `Draft #${examIdFromRoute}` : `Exam #${examIdFromRoute}`}
                {detailCourseId !== undefined &&
                  ` • ${courseNameById.get(String(detailCourseId)) || `Course #${detailCourseId}`}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => void exportDetailToWord()}
                disabled={exportingDocx}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${secondaryButtonClass} disabled:opacity-60`}
              >
                {exportingDocx ? 'Exporting...' : 'Export Word (.docx)'}
              </button>
              <button
                type="button"
                onClick={() => void exportDetailToPdf()}
                disabled={exportingPdf}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${secondaryButtonClass} disabled:opacity-60`}
              >
                {exportingPdf ? 'Exporting...' : 'Export PDF'}
              </button>
              <span className={countBadgeClass}>
                {detailQuestionCount.toString()} questions
              </span>
              <span className={weightBadgeClass}>
                Total weight {detailWeight}
              </span>
              <span className={draftBadgeClass}>
                {formatEnumLabel(detailStatus)}
              </span>
            </div>
          </div>
        </section>

        <section className={`rounded-xl border p-5 ${cardClass}`}>
          {loadingExamDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={22} className="animate-spin" style={{ color: primaryHex }} />
            </div>
          ) : examDetailError ? (
            <div
              className={`rounded-lg border p-4 flex items-start gap-2 ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Failed to load exam details</div>
                <div className="text-sm">{examDetailError}</div>
              </div>
            </div>
          ) : detailItems.length === 0 ? (
            <div className={`rounded-lg border p-6 text-center ${innerCardClass}`}>
              <p className={`text-sm ${subTextClass}`}>
                {isDraftDetail ? 'This draft has no items yet.' : 'This exam has no items yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {detailItems
                .slice()
                .sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0))
                .map((item, index) => (
                  <article
                    key={item.id}
                    className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-base font-semibold ${headingClass}`}>
                          {index + 1}. <MathText text={item.questionText || `Question #${item.questionId ?? item.id}`} />
                        </h4>
                        <p className={`mt-1 text-sm ${subTextClass}`}>
                          Question #{item.questionId ?? 'N/A'} • Chapter {item.chapterId ?? 'N/A'}
                        </p>
                      </div>
                      <span className={weightBadgeClass}>
                        Weight {item.weight}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={questionTypeBadgeClass}>{formatEnumLabel(item.questionType)}</span>
                      <span className={difficultyBadgeClass}>{formatEnumLabel(item.difficulty)}</span>
                      <span className={bloomBadgeClass}>{formatEnumLabel(item.bloomLevel)}</span>
                    </div>

                    {item.expectedAnswerText && (
                      <div className={`mt-2 text-sm ${subTextClass}`}>
                        <span className="font-semibold">Answer:</span> <MathText text={item.expectedAnswerText} />
                      </div>
                    )}
                    {item.hints && (
                      <div className={`mt-1 text-sm ${subTextClass}`}>
                        <span className="font-semibold">Hint:</span> <MathText text={item.hints} />
                      </div>
                    )}

                    {item.options.length > 0 && (
                      <div className={`mt-3 pt-3 border-t space-y-1.5 ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                        {item.options.map((option, optionIndex) => (
                          <div
                            key={`${item.id}-option-${optionIndex}`}
                            className={`rounded px-2 py-1 text-sm flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-white border border-gray-300'}`}
                          >
                            <span className={headingClass}>{option.optionText || `Option ${optionIndex + 1}`}</span>
                            {option.isCorrect && (
                              <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isDraftDetail && (
                      <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input
                            type="number"
                            min={0}
                            value={draftItemEdits[item.id]?.weight ?? String(item.weight)}
                            onChange={(event) =>
                              updateDraftItemEdit(item.id, {
                                weight: event.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                            placeholder="Weight"
                          />
                          <input
                            type="number"
                            min={0}
                            value={draftItemEdits[item.id]?.itemOrder ?? String(item.itemOrder ?? 0)}
                            onChange={(event) =>
                              updateDraftItemEdit(item.id, {
                                itemOrder: event.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                            placeholder="Order"
                          />
                          <input
                            type="number"
                            min={1}
                            value={draftItemEdits[item.id]?.replacementQuestionId ?? ''}
                            onChange={(event) =>
                              updateDraftItemEdit(item.id, {
                                replacementQuestionId: event.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                            placeholder="Replacement question ID"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void applyDraftItemEdit(item)}
                              disabled={draftActionLoadingKey === `patch-${item.id}`}
                              className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60"
                              style={{ backgroundColor: primaryHex }}
                            >
                              <Save size={14} />
                              {draftActionLoadingKey === `patch-${item.id}` ? 'Saving...' : 'Apply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteDraftItem(item)}
                              disabled={draftActionLoadingKey === `delete-${item.id}`}
                              className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm border ${secondaryButtonClass} disabled:opacity-60`}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
            </div>
          )}

          {isDraftDetail && draftDetail && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={draftAddQuestionId}
                  onChange={(event) => setDraftAddQuestionId(event.target.value)}
                  className={`w-28 px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Question ID"
                />
                <input
                  type="number"
                  min={0}
                  value={draftAddWeight}
                  onChange={(event) => setDraftAddWeight(event.target.value)}
                  className={`w-20 px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Weight"
                />
                <input
                  type="number"
                  min={0}
                  value={draftAddOrder}
                  onChange={(event) => setDraftAddOrder(event.target.value)}
                  className={`w-20 px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Order"
                />
                <button
                  type="button"
                  onClick={() => void addQuestionToDraft()}
                  disabled={draftActionLoadingKey === 'add-item'}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60"
                  style={{ backgroundColor: primaryHex }}
                >
                  <Plus size={14} />
                  {draftActionLoadingKey === 'add-item' ? 'Adding...' : 'Add Question'}
                </button>
                <button
                  type="button"
                  onClick={() => void saveDraftAsExamFromDetail()}
                  disabled={draftActionLoadingKey === 'save-draft'}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60 ml-auto"
                  style={{ backgroundColor: primaryHex }}
                >
                  <Save size={14} />
                  {draftActionLoadingKey === 'save-draft' ? 'Saving...' : 'Save as Exam'}
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className={`rounded-xl border p-4 sm:px-6 sm:py-4 ${cardClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <FileText size={20} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${headingClass}`}>Exams</h2>
              <p className={`text-xs ${subTextClass}`}>Manage question bank and generate exams</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuestionBankModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2"
              style={{ backgroundColor: primaryHex, '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            >
              <Plus size={16} />
              Add Question
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => setShowExamGenerationModal(true)}
                disabled={stats !== null && stats.approved === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${secondaryButtonClass}`}
                style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
              >
                <Sparkles size={16} />
                Generate Exam
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-4 pt-4 border-t grid grid-cols-2 lg:grid-cols-4 gap-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`rounded-lg border px-4 py-2.5 ${innerCardClass}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${subTextClass}`}>Total View</div>
            <div className={`text-xl font-bold ${headingClass}`}>{total}</div>
          </div>
          <div className={`rounded-lg border px-4 py-2.5 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Approved</div>
            <div className={`text-xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              {stats ? stats.approved : '—'}
            </div>
          </div>
          <div className={`rounded-lg border px-4 py-2.5 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Reviewing</div>
            <div className={`text-xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              {stats ? stats.underReview : '—'}
            </div>
          </div>
          <div className={`rounded-lg border px-4 py-2.5 ${innerCardClass}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${subTextClass}`}>Drafts</div>
            <div className={`text-xl font-bold ${headingClass}`}>
              {stats ? stats.draft : '—'}
            </div>
          </div>
        </div>
        {statsError && (
          <div className={`mt-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'}`}>
            <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Failed to load statistics
            </span>
            <button
              onClick={() => {
                setStatsError(false);
                setRefreshKey(k => k + 1);
              }}
              className={`ml-auto text-xs font-medium px-2.5 py-1 rounded transition-colors ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-900'}`}
            >
              Retry
            </button>
          </div>
        )}
      </section>

      <section className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <CustomDropdown
              label="Course"
              value={selectedCourse}
              options={[
                { value: 'all', label: 'All Courses' },
                ...courseOptions,
              ]}
              onChange={handleCourseChange}
              stackLabel
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <CustomDropdown
              label="Chapter"
              value={selectedChapter}
              options={[
                {
                  value: 'all',
                  label: selectedCourse === 'all' ? 'Select a course first' : chaptersLoading ? 'Loading chapters...' : 'All Chapters',
                },
                ...chapterOptions,
              ]}
              onChange={handleChapterChange}
              stackLabel
              fullWidth
            />
          </div>
          <div className="w-[120px]">
            <CustomDropdown
              label="Rows per page"
              value={String(limit)}
              options={LIMIT_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
              onChange={handleLimitChange}
              stackLabel
              fullWidth
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChapterManagerOpen(true)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${secondaryButtonClass}`}
              title="Manage chapters for this course"
            >
              Manage Chapters
            </button>
            <button
              type="button"
              onClick={() => setBulkImportOpen(true)}
              disabled={selectedCourse === 'all'}
              className={`whitespace-nowrap px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${secondaryButtonClass}`}
              title={selectedCourse === 'all' ? 'Select a course first' : 'Import questions from CSV'}
            >
              Import Questions
            </button>
          </div>
        </div>
      </section>

      <section className={`rounded-xl border p-2 ${cardClass}`}>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'questions', label: 'Questions' },
            { key: 'groups', label: 'Groups' },
            { key: 'drafts', label: 'Drafts' },
            { key: 'saved', label: 'Saved Exams' },
          ].map((tab) => {
            const isActive = activeWorkspaceTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveWorkspaceTab(tab.key as ExamsWorkspaceTab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  isActive
                    ? 'text-white border-transparent'
                    : isDark
                      ? 'text-slate-200 border-white/10 hover:bg-white/10'
                      : 'text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: primaryHex } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeWorkspaceTab === 'drafts' && (
      <section className={`rounded-3xl border p-8 space-y-6 ${cardClass} shadow-sm`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl`} style={{ backgroundColor: isDark ? `${primaryHex}1A` : `${primaryHex}0D`, color: primaryHex }}>
              <History size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${headingClass}`}>Generated Drafts</h3>
              <p className={`text-xs ${subTextClass}`}>Review and finalize your recent exam permutations.</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {generatedDrafts.length} Artifacts
          </span>
        </div>

        {readinessLoading && (
          <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3`} style={{ borderColor: isDark ? `${primaryHex}33` : `${primaryHex}1A`, backgroundColor: isDark ? `${primaryHex}1A` : `${primaryHex}0D` }}>
            <Loader2 size={16} className={`animate-spin`} style={{ color: primaryHex }} />
            <span className={`text-xs font-bold uppercase tracking-widest`} style={{ color: primaryHex }}>Synchronizing Engine...</span>
          </div>
        )}

        {!readinessLoading && readiness?.ready === true && (
          <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${isDark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'}`}>
            <CheckCircle2 size={16} className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Engine Ready for Generation</span>
          </div>
        )}

        {!readinessLoading && readiness?.ready === false && (
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-100 bg-amber-50/50'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Generation Requirements Pending</p>
                {readiness?.reasons && readiness.reasons.length > 0 && (
                  <ul className={`mt-2 text-xs space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {readiness.reasons.map((reason, i) => <li key={i} className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500/50' : 'bg-amber-400'}`} />
                      {reason}
                    </li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {generatedDrafts.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border-2 border-dashed transition-colors ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
              <Sparkles size={32} />
            </div>
            <h3 className={`text-lg font-bold tracking-tight mb-1 ${headingClass}`}>No drafts active</h3>
            <p className={`max-w-xs mx-auto text-sm ${subTextClass}`}>
              Initiate the generation engine to populate your workspace with exam candidates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Array.from(new Map(generatedDrafts.map((d) => [d.draftId, d])).values()).map((draft) => (
              <article
                key={draft.draftId}
                className={`group relative rounded-3xl border p-6 transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`text-base font-bold tracking-tight ${headingClass}`}>{draft.title || `Draft #${draft.draftId}`}</h4>
                      <StatusBadge status={(draft as any).status || 'draft'} />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-medium ${subTextClass}`}>
                        {courseNameById.get(String(draft.courseId)) || `Course #${draft.courseId}`}
                      </p>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDateTime(draft.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {draft.savedExamId ? (
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        Artifact #{draft.savedExamId}
                        <ArrowUpRight size={12} />
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                        Awaiting Commit
                      </span>
                    )}
                    
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={`rounded-2xl p-2 ${isDark ? 'bg-slate-900 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-2xl'}`}>
                        <DropdownMenuItem
                          className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                          onClick={() => {
                            setActiveDraftEditorId(draft.draftId);
                            setActiveDraftEditorTitle(draft.title || `Draft #${draft.draftId}`);
                            setDraftEditorOpen(true);
                          }}
                        >
                          Launch Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                          onClick={async () => {
                            try {
                              await ExamGenerationService.duplicateDraft(draft.draftId);
                              toast.success('Draft duplicated');
                              setRefreshKey((k) => k + 1);
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Failed to duplicate draft');
                            }
                          }}
                        >
                          Clone Artifact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    {draftQuestionCountOverrides[draft.draftId] ?? draft.totalQuestions} Questions
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    {draft.items.filter(item => !(item as any).sectionId).length} Modular Sections
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest`} style={{ backgroundColor: isDark ? `${primaryHex}1A` : `${primaryHex}0D`, borderColor: isDark ? `${primaryHex}33` : `${primaryHex}33`, color: primaryHex }}>
                    Weight {draft.totalWeight}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/instructordashboard/exams/${draft.draftId}?entity=draft`)}
                    className={`ml-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm'}`}
                  >
                    Deep Dive
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      {activeWorkspaceTab === 'saved' && (
      <section id="saved-exams-section" className={`rounded-3xl border p-8 space-y-6 ${cardClass} shadow-sm`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl`} style={{ backgroundColor: isDark ? `${primaryHex}1A` : `${primaryHex}0D`, color: primaryHex }}>
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${headingClass}`}>Saved Exams</h3>
              <p className={`text-xs ${subTextClass}`}>Manage your certified evaluation records.</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {savedExams.length} Documents
          </span>
        </div>

        {/* Exam Statistics */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/50'}`}>
          <button
            onClick={() => setExamStatsOpen(o => !o)}
            className={`w-full flex items-center justify-between px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Insights & Analytics
            {examStatsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {examStatsOpen && (
            <div className={`px-6 pb-6 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              {examStatsLoading ? (
                <LoadingSkeleton rows={1} cols={4} />
              ) : examStats && Object.keys(examStats).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  {Object.entries(examStats).map(([key, value]) => (
                    <div key={key} className={`rounded-2xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className={`mt-1 text-2xl font-bold tracking-tight ${headingClass}`}>
                        {typeof value === 'number' ? value : 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs font-medium py-2 ${subTextClass}`}>Metric engine data unavailable</p>
              )}
            </div>
          )}
        </div>

        {savedExams.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border-2 border-dashed transition-colors ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
              <FileCheck size={32} />
            </div>
            <h3 className={`text-lg font-bold tracking-tight mb-1 ${headingClass}`}>Library empty</h3>
            <p className={`max-w-xs mx-auto text-sm ${subTextClass}`}>
              Transition your high-performing drafts into saved exams to build your evaluation library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {savedExams.map((exam) => {
              return (
                <article
                  key={`saved-${exam.examId}`}
                  className={`group relative rounded-3xl border p-6 transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`text-base font-bold tracking-tight ${headingClass}`}>
                          {exam.title || `Exam #${exam.examId}`}
                        </h4>
                        <StatusBadge status={exam.status || 'saved'} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-medium ${subTextClass}`}>
                          Exam #{exam.examId}
                        </p>
                        <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>
                          {courseNameById.get(String(exam.courseId ?? '')) || `Course #${exam.courseId ?? 'N/A'}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex gap-2">
                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {savedExamQuestionCountOverrides[exam.examId] ?? exam.questionCount} Items
                        </span>
                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest`} style={{ backgroundColor: isDark ? `${primaryHex}1A` : `${primaryHex}0D`, borderColor: isDark ? `${primaryHex}33` : `${primaryHex}33`, color: primaryHex }}>
                          Weight {exam.totalWeight}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setActiveExamViewId(exam.examId);
                          setExamViewOpen(true);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm'}`}
                      >
                        Preview
                        <Eye size={14} />
                      </button>
                      
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={`rounded-2xl p-2 ${isDark ? 'bg-slate-900 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-2xl'}`}>
                          <DropdownMenuItem
                            className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                            onClick={async () => {
                              try {
                                await ExamGenerationService.publishExam(exam.examId);
                                toast.success('Exam published');
                                setRefreshKey((k) => k + 1);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to publish exam');
                              }
                            }}
                          >
                            Go Live
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                            onClick={async () => {
                              try {
                                await ExamGenerationService.unpublishExam(exam.examId);
                                toast.success('Exam unpublished');
                                setRefreshKey((k) => k + 1);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to unpublish exam');
                              }
                            }}
                          >
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-500/10 dark:focus:text-rose-400"
                            onClick={async () => {
                              try {
                                await ExamGenerationService.archiveExam(exam.examId);
                                toast.success('Exam archived');
                                setRefreshKey((k) => k + 1);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to archive exam');
                              }
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`} />
                          <DropdownMenuItem
                            className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                            onClick={async () => {
                              try {
                                const result = await ExamGenerationService.exportExamWord(exam.examId) as { fileName?: string; mimeType?: string; content?: string };
                                const fileName = downloadFromBase64(result, `exam-${exam.examId}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                                toast.success(`Downloaded ${fileName}`);
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to export exam');
                              }
                            }}
                          >
                            Export Word
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                            onClick={async () => {
                              try {
                                await downloadClientExamPdf(exam.examId);
                                toast.success('Downloaded exam PDF');
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to export PDF');
                              }
                            }}
                          >
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`rounded-xl cursor-pointer py-2.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-200 focus:bg-white/10 focus:text-white' : 'text-slate-700 focus:bg-slate-100 focus:text-slate-900'}`}
                            onClick={() => {
                              setTemplateExamId(exam.examId);
                              setShowApplyTemplate(true);
                            }}
                          >
                            Apply Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      )}

      {activeWorkspaceTab === 'groups' && (
      <section className={`rounded-xl border p-4 sm:p-5 ${cardClass}`}>
        <QuestionGroupsTab courses={courseOptions} selectedCourse={selectedCourse} />
      </section>
      )}

      {activeWorkspaceTab === 'questions' && (
      <>
      <section className={`rounded-xl border p-4 ${cardClass}`}>
        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search questions..."
            className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            style={{ '--tw-ring-color': `${primaryHex}60` } as React.CSSProperties}
          />
        </div>

        {/* Filter Bar */}
        <div className={`rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Active Filters
              </span>
              {(() => {
                const activeFilterCount = filterQuestionType.length + filterDifficulty.length +
                  filterStatus.length + filterBloomLevel.length +
                  (selectedChapter !== 'all' ? 1 : 0);
                return activeFilterCount > 0 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium">
                    {activeFilterCount}
                  </span>
                ) : null;
              })()}
            </div>
            {(filterQuestionType.length > 0 || filterDifficulty.length > 0 || filterStatus.length > 0 || filterBloomLevel.length > 0 || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className={`text-xs font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 p-4">
            {/* Type group */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['mcq', 'true_false', 'written', 'fill_blanks', 'essay'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleToggleQuestionType(type)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      filterQuestionType.includes(type)
                        ? isDark
                          ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                          : 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : isDark
                          ? 'border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {formatEnumLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty group */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Difficulty
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'easy',   onDark: 'border-emerald-500 bg-emerald-500 text-white', onLight: 'border-emerald-600 bg-emerald-600 text-white' },
                  { value: 'medium', onDark: 'border-amber-500 bg-amber-500 text-white', onLight: 'border-amber-500 bg-amber-500 text-white' },
                  { value: 'hard',   onDark: 'border-red-500 bg-red-500 text-white', onLight: 'border-red-600 bg-red-600 text-white' },
                ].map(({ value, onDark, onLight }) => (
                  <button
                    key={value}
                    onClick={() => handleToggleDifficulty(value)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      filterDifficulty.includes(value)
                        ? `${isDark ? onDark : onLight} shadow-sm`
                        : isDark
                          ? 'border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {formatEnumLabel(value)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status group */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['draft', 'under_review', 'approved', 'rejected', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleToggleStatus(status)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      filterStatus.includes(status)
                        ? isDark
                          ? 'border-violet-500 bg-violet-500 text-white shadow-sm'
                          : 'border-violet-600 bg-violet-600 text-white shadow-sm'
                        : isDark
                          ? 'border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {formatEnumLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bloom level group */}
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Bloom
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'].map((bloom) => (
                  <button
                    key={bloom}
                    onClick={() => handleToggleBloomLevel(bloom)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      filterBloomLevel.includes(bloom)
                        ? isDark
                          ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                          : 'border-teal-600 bg-teal-600 text-white shadow-sm'
                        : isDark
                          ? 'border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {formatEnumLabel(bloom)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-xl border p-4 sm:p-5 ${cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${headingClass}`}>Question Bank</h3>
          <div className={`text-sm ${subTextClass}`}>
            Showing {rangeStart}-{rangeEnd} of {total}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: limit > 5 ? 5 : limit }).map((_, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-4 w-4 rounded shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className={`h-5 w-14 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                      <div className={`h-5 w-12 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                      <div className={`h-5 w-16 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                    </div>
                    <div className={`h-4 w-full rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                    <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                    <div className={`h-3 w-1/2 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`rounded-lg border p-4 flex items-start gap-2 ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Failed to load questions</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className={`p-12 text-center rounded-xl border-2 border-dashed ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/30'}`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <ClipboardList size={32} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${headingClass}`}>No questions found</h3>
            <p className={`max-w-xs mx-auto text-sm leading-relaxed ${subTextClass}`}>
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            {(filterQuestionType.length > 0 || filterDifficulty.length > 0 || filterStatus.length > 0 || filterBloomLevel.length > 0 || searchInput) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryHex }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {selectedQuestionIds.size > 0 && (
              <BulkActionToolbar
                selectedCount={selectedQuestionIds.size}
                actions={[
                  {
                    label: 'Change Status',
                    onClick: () => setBatchStatusDialogOpen(true),
                  },
                  {
                    label: 'Delete Selected',
                    danger: true,
                    onClick: () => {
                      setDeletingQuestionIds(selectedQuestionIdsArray);
                      setDeleteConfirmOpen(true);
                    },
                  },
                ]}
              />
            )}

            <div className="space-y-3">
            {questions.map((question, index) => {
              const questionId = Number(question.id ?? 0);
              const questionKey = String(question.id ?? `question-${page}-${index}`);
              const imageUrl = questionImageUrls[questionKey];
              const imageFailed = questionImageErrors[questionKey];
              return (
              <article
                key={questionKey}
                className={questionCardClass}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={questionId > 0 && selectedQuestionIds.has(questionId)}
                      onCheckedChange={() => questionId > 0 && handleToggleQuestionSelect(questionId)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {question.questionType && (
                          <span className={questionTypeBadgeClass}>
                            {formatEnumLabel(question.questionType)}
                          </span>
                        )}
                        {question.difficulty && (
                          <span className={difficultyBadgeClass}>
                            {formatEnumLabel(question.difficulty)}
                          </span>
                        )}
                        {question.bloomLevel && (
                          <span className={bloomBadgeClass}>
                            {formatEnumLabel(question.bloomLevel)}
                          </span>
                        )}
                        {question.status && (
                          <StatusBadge status={question.status} />
                        )}
                      </div>
                      <div className={`text-sm sm:text-base font-medium ${headingClass}`}>
                        <MathText text={question.questionText?.trim() || 'Untitled question'} />
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`p-2 rounded-md border transition-colors ${secondaryButtonClass}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openQuestionEditor(question)}>
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {question.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              setActionLoading(`submit-${question.id}`);
                              await QuestionBankService.submitForReview(questionId);
                              toast.success('Question submitted for review');
                              refreshQuestions();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Failed to submit');
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          Submit for Review
                        </DropdownMenuItem>
                      )}
                      {question.status === 'under_review' && (
                        <>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                setActionLoading(`approve-${question.id}`);
                                await QuestionBankService.approveQuestion(questionId);
                                toast.success('Question approved');
                                refreshQuestions();
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Failed to approve');
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenRejectDialog(questionId, question.questionText || '')}
                          >
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {(question.status === 'approved' || question.status === 'rejected') && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              setActionLoading(`archive-${question.id}`);
                              await QuestionBankService.archiveQuestion(questionId);
                              toast.success('Question archived');
                              refreshQuestions();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Failed to archive');
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}
                      {question.status === 'archived' && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              setActionLoading(`restore-${question.id}`);
                              await QuestionBankService.restoreQuestion(questionId);
                              toast.success('Question restored');
                              refreshQuestions();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Failed to restore');
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setAttachmentsPanelQuestionId(questionId);
                          setAttachmentsPanelQuestionText(question.questionText ?? '');
                          setAttachmentsPanelOpen(true);
                        }}
                      >
                        <FileText size={14} className="mr-2" />
                        Attachments
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {imageUrl && (
                  <div className={`mt-3 overflow-hidden rounded-lg border ${isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white'}`}>
                    <img
                      src={imageUrl}
                      alt={question.questionText?.trim() || `Question ${question.id ?? index + 1}`}
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                )}

                {!imageUrl && imageFailed && (
                  <div className={`mt-3 rounded-lg border px-3 py-2 text-xs sm:text-sm ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    Question image could not be loaded.
                  </div>
                )}

                <div className={`mt-2 text-xs sm:text-sm space-y-1 ${subTextClass}`}>
                  <div>
                    <span className="font-semibold">Answer:</span>{' '}
                    <MathText text={resolveQuestionAnswer(question)} />
                  </div>
                  <div>
                    <span className="font-semibold">Hint:</span> {question.hints?.trim() || 'No hint provided'}
                  </div>
                </div>

                <div className={`mt-3 text-xs sm:text-sm flex flex-wrap gap-x-4 gap-y-1 ${subTextClass}`}>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={14} />
                    {courseNameById.get(String(question.courseId ?? '')) || `Course #${String(question.courseId ?? 'N/A')}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText size={14} />
                    {chapterNameById.get(String(question.chapterId ?? '')) || `Chapter #${String(question.chapterId ?? 'N/A')}`}
                  </span>
                  {question.createdAt && (
                    <span className="text-[11px]">
                      Created: {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {Array.isArray(question.options) && question.options.length > 0 && (
                  <div className={`mt-3 pt-3 border-t space-y-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    {question.options.slice(0, 4).map((option, optionIndex) => (
                      <div
                        key={`${String(question.id ?? index)}-option-${optionIndex}`}
                        className={`text-xs sm:text-sm flex items-center justify-between rounded px-2 py-1 ${isDark ? 'bg-white/5' : 'bg-gray-100/50 border border-gray-200'}`}
                      >
                        <span className={`${headingClass} truncate pr-2`}>
                          {option.optionText?.trim() || `Option ${optionIndex + 1}`}
                        </span>
                        {option.isCorrect && (
                          <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
            })}
          </div>
          </div>
        )}

        <div className={`mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`text-sm ${subTextClass}`}>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={page <= 1 || loading}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${secondaryButtonClass}`}
              style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              disabled={page >= totalPages || loading}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${secondaryButtonClass}`}
              style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
      </>
      )}

      {/* New Question Bank Dialogs */}
      <RejectQuestionDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        questionId={rejectingQuestionId ?? 0}
        questionText={rejectingQuestionText}
        onSuccess={refreshQuestions}
      />

      <BatchStatusDialog
        open={batchStatusDialogOpen}
        onOpenChange={setBatchStatusDialogOpen}
        selectedIds={selectedQuestionIdsArray}
        onSuccess={() => {
          refreshQuestions();
          setSelectedQuestionIds(new Set());
        }}
      />

      <ChapterManagerDrawer
        open={chapterManagerOpen}
        onOpenChange={setChapterManagerOpen}
        courseId={selectedCourse !== 'all' ? Number(selectedCourse) : 0}
        onChapterChange={refreshChapters}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        courseId={selectedCourse !== 'all' ? Number(selectedCourse) : 0}
        chapterId={selectedChapter !== 'all' ? Number(selectedChapter) : undefined}
        onSuccess={(count) => {
          toast.success(`${count} question${count !== 1 ? 's' : ''} imported`);
          refreshQuestions();
        }}
      />

      <QuestionAttachmentsPanel
        open={attachmentsPanelOpen}
        onOpenChange={setAttachmentsPanelOpen}
        questionId={attachmentsPanelQuestionId ?? 0}
        questionText={attachmentsPanelQuestionText}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Questions"
        message={`Are you sure you want to delete ${deletingQuestionIds.length} question${deletingQuestionIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        danger
        loading={actionLoading === 'delete-questions'}
        onConfirm={handleDeleteSelectedQuestions}
      />

      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl rounded-xl border p-5 ${cardClass}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${headingClass}`}>Edit Question #{editingQuestion.id}</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className={`text-sm font-medium ${subTextClass}`}>Question</label>
                <textarea
                  rows={3}
                  value={editingQuestionText}
                  onChange={(event) => setEditingQuestionText(event.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${subTextClass}`}>Answer</label>
                <textarea
                  rows={2}
                  value={editingQuestionAnswer}
                  onChange={(event) => setEditingQuestionAnswer(event.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${subTextClass}`}>Hint</label>
                <textarea
                  rows={2}
                  value={editingQuestionHint}
                  onChange={(event) => setEditingQuestionHint(event.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeQuestionEditor}
                className={`px-4 py-2 rounded-lg border text-sm ${secondaryButtonClass}`}
                disabled={savingQuestionEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveQuestionEdits()}
                disabled={savingQuestionEdit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={14} />
                {savingQuestionEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionBankModal && (
        <QuestionBankModal
          open={showQuestionBankModal}
          courseOptions={courseOptions}
          onClose={handleCloseQuestionBank}
        />
      )}

      {showExamGenerationModal && (
        <ExamGenerationModal
          open={showExamGenerationModal}
          courseOptions={courseOptions}
          onClose={handleCloseExamGeneration}
          onPreviewGenerated={handlePreviewGenerated}
          onExamSaved={handleDraftSaved}
        />
      )}

      {draftEditorOpen && activeDraftEditorId && (
        <DraftEditorModal
          open={draftEditorOpen}
          onOpenChange={setDraftEditorOpen}
          draftId={activeDraftEditorId}
          draftTitle={activeDraftEditorTitle}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {examViewOpen && activeExamViewId && (
        <ExamFullViewModal
          open={examViewOpen}
          onOpenChange={setExamViewOpen}
          examId={activeExamViewId}
        />
      )}

      {/* Apply Template Dialog */}
      {showApplyTemplate && templateExamId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border p-6 ${cardClass}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold mb-4 ${headingClass}`}>Apply Template</h3>
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${subTextClass}`}>Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className={`mt-1 w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  disabled={loadingTemplates}
                >
                  <option value="">-- Select a template --</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowApplyTemplate(false);
                  setSelectedTemplate('');
                  setTemplateExamId(null);
                }}
                className={`px-4 py-2 rounded-lg border text-sm ${secondaryButtonClass}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedTemplate || !templateExamId) {
                    toast.error('Select a template');
                    return;
                  }
                  try {
                    await PaperTemplateService.applyToExam(templateExamId, parseInt(selectedTemplate, 10));
                    toast.success('Template applied');
                    setShowApplyTemplate(false);
                    setSelectedTemplate('');
                    setTemplateExamId(null);
                    setRefreshKey((k) => k + 1);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Failed to apply template');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamsPage;
