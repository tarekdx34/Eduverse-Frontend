import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  History,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomDropdown } from './CustomDropdown';
import { QuestionBankModal } from './quizzes/QuestionBankModal';
import { ExamGenerationModal, type ExamDraftPreviewRecord } from './quizzes/ExamGenerationModal';
import { useTheme } from '../contexts/ThemeContext';
import ChapterService, { CourseChapter } from '../../../services/api/chapterService';
import ExamGenerationService from '../../../services/api/examGenerationService';
import QuestionBankService from '../../../services/api/questionBankService';
import { exportExamToWord } from '../../../utils/examWordExport';

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

type ExamsWorkspaceTab = 'questions' | 'drafts' | 'saved';

export interface ExamsPageProps {
  courses?: CourseInput[];
}

const LIMIT_OPTIONS = [10, 20, 50];
const DRAFT_PREVIEWS_STORAGE_KEY = 'eduverse-instructor-exam-draft-previews';

const formatEnumLabel = (value?: string) => {
  if (!value) return 'N/A';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
  const [showExportWordModal, setShowExportWordModal] = useState(false);
  const [wordLogoUrl, setWordLogoUrl] = useState('/logo.png');
  const [wordExaminerName, setWordExaminerName] = useState('Prof. Dr. [Examiner Full Name]');
  const [wordDurationMinutes, setWordDurationMinutes] = useState('60');
  const [wordHintText, setWordHintText] = useState('ε₀ = 8.85 x 10⁻¹² F/m  ,  μ₀ = 4π x 10⁻⁷ H/m');
  const [wordEnUniversity, setWordEnUniversity] = useState('Alexandria University');
  const [wordEnFaculty, setWordEnFaculty] = useState('Faculty of Engineering');
  const [wordEnDepartment, setWordEnDepartment] = useState('Electrical Engineering Department');
  const [wordEnMonthYear, setWordEnMonthYear] = useState('');
  const [wordArUniversity, setWordArUniversity] = useState('جامعة الإسكندرية');
  const [wordArFaculty, setWordArFaculty] = useState('كلية الهندسة');
  const [wordArDepartment, setWordArDepartment] = useState('قسم الهندسة الكهربية');
  const [wordArMonthYear, setWordArMonthYear] = useState('يناير ٢٠٢٥');
  const [wordEnCourseTitle, setWordEnCourseTitle] = useState('');
  const [wordEnYearTrack, setWordEnYearTrack] = useState('Third Year - Communications');
  const [wordArCourseTitle, setWordArCourseTitle] = useState('موجات كهرومغناطيسية');
  const [wordArYearTrack, setWordArYearTrack] = useState('السنة الثالثة - اتصالات');
  const [draftAddQuestionId, setDraftAddQuestionId] = useState('');
  const [draftAddWeight, setDraftAddWeight] = useState('1');
  const [draftAddOrder, setDraftAddOrder] = useState('1');
  const [draftItemEdits, setDraftItemEdits] = useState<
    Record<string, { replacementQuestionId: string; weight: string; itemOrder: string }>
  >({});
  const [savedExamQuestionCountOverrides, setSavedExamQuestionCountOverrides] = useState<Record<number, number>>({});
  const [draftQuestionCountOverrides, setDraftQuestionCountOverrides] = useState<Record<number, number>>({});

  useEffect(() => {
    const cached = localStorage.getItem(DRAFT_PREVIEWS_STORAGE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as ExamDraftPreviewRecord[];
      if (Array.isArray(parsed)) {
        setGeneratedDrafts(parsed);
      }
    } catch {
      localStorage.removeItem(DRAFT_PREVIEWS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_PREVIEWS_STORAGE_KEY, JSON.stringify(generatedDrafts));
  }, [generatedDrafts]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

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
    let mounted = true;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: {
          courseId?: number;
          chapterId?: number;
          page: number;
          limit: number;
        } = {
          page,
          limit,
        };

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

        const response = await QuestionBankService.list(params);
        const normalized = normalizeQuestionsResponse(response);

        if (!mounted) return;
        setQuestions(normalized.data);
        setTotal(normalized.total);
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
  }, [selectedCourse, selectedChapter, page, limit, refreshKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];

    setQuestionImageUrls((previous) => {
      Object.values(previous).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    setQuestionImageErrors({});

    const loadQuestionImages = async () => {
      const nextUrls: Record<string, string> = {};
      const nextErrors: Record<string, boolean> = {};

      await Promise.all(
        questions.map(async (question, index) => {
          const questionId = String(question.id ?? `question-${page}-${index}`);
          const rawFileId = question.questionFileId;
          const fileId =
            typeof rawFileId === 'number'
              ? rawFileId
              : typeof rawFileId === 'string' && rawFileId.trim()
                ? Number(rawFileId)
                : NaN;

          if (!Number.isFinite(fileId) || fileId <= 0) {
            return;
          }

          try {
            const blob = await QuestionBankService.downloadImageBlob(fileId);
            const objectUrl = URL.createObjectURL(blob);
            objectUrls.push(objectUrl);
            nextUrls[questionId] = objectUrl;
          } catch {
            nextErrors[questionId] = true;
          }
        }),
      );

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setQuestionImageUrls(nextUrls);
      setQuestionImageErrors(nextErrors);
    };

    void loadQuestionImages();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [questions, page]);

  const refreshQuestions = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

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
              courseOptions
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
              totalWeight: toFiniteNumber(exam.totalWeight) ?? totalWeightFromItems,
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
  }, [selectedCourse, refreshKey, courseOptions]);

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

  const cardClass = isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-300 shadow-sm';
  const innerCardClass = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300';
  const headingClass = isDark ? 'text-white' : 'text-gray-950';
  const subTextClass = isDark ? 'text-slate-300' : 'text-gray-800';
  const secondaryButtonClass = isDark
    ? 'border-white/10 text-slate-200 hover:bg-white/10'
    : 'border-gray-400 bg-white text-gray-800 hover:bg-gray-100';
  const metaBadgeBaseClass = 'px-2 py-1 text-xs rounded-full font-medium';
  const questionTypeBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`;
  const difficultyBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-800'}`;
  const bloomBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`;
  const statusBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-slate-500/20 text-slate-200' : 'bg-slate-200 text-slate-800'}`;
  const countBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`;
  const weightBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-100 text-blue-800'}`;
  const draftBadgeClass = `${metaBadgeBaseClass} ${isDark ? 'bg-slate-500/20 text-slate-200' : 'bg-slate-200 text-slate-800'}`;

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

  const exportDetailToWord = async () => {
    if (examIdFromRoute === null) return;
    const isDraftDetail = detailEntity === 'draft';
    const fallbackSummary = savedExams.find((exam) => exam.examId === examIdFromRoute);
    const title = isDraftDetail
      ? draftDetail?.title || `Draft #${examIdFromRoute}`
      : examDetail?.title || fallbackSummary?.title || `Exam #${examIdFromRoute}`;
    const courseId = isDraftDetail ? draftDetail?.courseId : examDetail?.courseId;
    const generatedAt = isDraftDetail
      ? draftDetail?.generatedAt || new Date().toISOString()
      : examDetail?.createdAt || fallbackSummary?.createdAt || new Date().toISOString();
    const items = isDraftDetail ? draftDetail?.items ?? [] : examDetail?.items ?? [];

    if (!items.length) {
      toast.error('No questions available to export');
      return;
    }

    try {
      setExportingDocx(true);
      let logoBytes: Uint8Array | undefined;
      if (wordLogoUrl.trim()) {
        try {
          const response = await fetch(wordLogoUrl.trim());
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            logoBytes = new Uint8Array(arrayBuffer);
          }
        } catch {
          // Keep exporting even if logo is missing.
        }
      }

      const parsedDuration = Number(wordDurationMinutes);
      await exportExamToWord({
        title,
        courseName: courseNameById.get(String(courseId ?? '')) || `Course #${courseId ?? 'N/A'}`,
        generatedAt,
        items,
        isDraft: isDraftDetail,
        durationMinutes: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 60,
        examinerName: wordExaminerName.trim() || 'Prof. Dr. [Examiner Full Name]',
        hintText: wordHintText.trim(),
        logoBytes,
        institution: {
          enUniversity: wordEnUniversity.trim(),
          enFaculty: wordEnFaculty.trim(),
          enDepartment: wordEnDepartment.trim(),
          enMonthYear: wordEnMonthYear.trim(),
          arUniversity: wordArUniversity.trim(),
          arFaculty: wordArFaculty.trim(),
          arDepartment: wordArDepartment.trim(),
          arMonthYear: wordArMonthYear.trim(),
        },
        courseInfo: {
          enCourseTitle: wordEnCourseTitle.trim() || (courseNameById.get(String(courseId ?? '')) || title),
          enYearTrack: wordEnYearTrack.trim(),
          arCourseTitle: wordArCourseTitle.trim(),
          arYearTrack: wordArYearTrack.trim(),
        },
      });
      toast.success('Word file downloaded');
      setShowExportWordModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export Word file');
    } finally {
      setExportingDocx(false);
    }
  };

  const openExportWordModal = () => {
    if (examIdFromRoute === null) return;
    const isDraftDetail = detailEntity === 'draft';
    const fallbackSummary = savedExams.find((exam) => exam.examId === examIdFromRoute);
    const title = isDraftDetail
      ? draftDetail?.title || `Draft #${examIdFromRoute}`
      : examDetail?.title || fallbackSummary?.title || `Exam #${examIdFromRoute}`;
    const courseId = isDraftDetail ? draftDetail?.courseId : examDetail?.courseId;
    const courseLabel = courseNameById.get(String(courseId ?? '')) || title;
    const generatedAt = isDraftDetail
      ? draftDetail?.generatedAt || new Date().toISOString()
      : examDetail?.createdAt || fallbackSummary?.createdAt || new Date().toISOString();
    const monthYear = new Date(generatedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    setWordEnMonthYear(monthYear);
    setWordEnCourseTitle(courseLabel);
    setShowExportWordModal(true);
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
                onClick={openExportWordModal}
                disabled={exportingDocx}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${secondaryButtonClass} disabled:opacity-60`}
              >
                Export Word (.docx)
              </button>
              <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {detailQuestionCount.toString()} questions
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Total weight {detailWeight}
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-slate-200">
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
                          {index + 1}. {item.questionText || `Question #${item.questionId ?? item.id}`}
                        </h4>
                        <p className={`mt-1 text-sm ${subTextClass}`}>
                          Question #{item.questionId ?? 'N/A'} • Chapter {item.chapterId ?? 'N/A'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Weight {item.weight}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {formatEnumLabel(item.questionType)}
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {formatEnumLabel(item.difficulty)}
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {formatEnumLabel(item.bloomLevel)}
                      </span>
                    </div>

                    {item.expectedAnswerText && (
                      <div className={`mt-2 text-sm ${subTextClass}`}>
                        <span className="font-semibold">Answer:</span> {item.expectedAnswerText}
                      </div>
                    )}
                    {item.hints && (
                      <div className={`mt-1 text-sm ${subTextClass}`}>
                        <span className="font-semibold">Hint:</span> {item.hints}
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
                              className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
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
            <div className={`mt-4 pt-4 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
              <h4 className={`text-sm font-semibold ${headingClass}`}>Add Question To Draft</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="number"
                  min={1}
                  value={draftAddQuestionId}
                  onChange={(event) => setDraftAddQuestionId(event.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Question ID"
                />
                <input
                  type="number"
                  min={0}
                  value={draftAddWeight}
                  onChange={(event) => setDraftAddWeight(event.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Weight"
                />
                <input
                  type="number"
                  min={0}
                  value={draftAddOrder}
                  onChange={(event) => setDraftAddOrder(event.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  placeholder="Item order"
                />
                <button
                  type="button"
                  onClick={() => void addQuestionToDraft()}
                  disabled={draftActionLoadingKey === 'add-item'}
                  className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Plus size={14} />
                  {draftActionLoadingKey === 'add-item' ? 'Adding...' : 'Add To Draft'}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveDraftAsExamFromDetail()}
                  disabled={draftActionLoadingKey === 'save-draft'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <Save size={14} />
                  {draftActionLoadingKey === 'save-draft' ? 'Saving...' : 'Save Draft To Saved Exams'}
                </button>
              </div>
            </div>
          )}
        </section>

        {showExportWordModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl border p-5 ${cardClass}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${headingClass}`}>Word Export Preview</h3>
                <button
                  type="button"
                  onClick={() => setShowExportWordModal(false)}
                  className={`p-2 rounded-lg border ${secondaryButtonClass}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`rounded-lg border p-4 space-y-3 ${innerCardClass}`}>
                  <h4 className={`text-sm font-semibold ${headingClass}`}>Export Settings</h4>
                  <input
                    value={wordLogoUrl}
                    onChange={(event) => setWordLogoUrl(event.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    placeholder="Logo URL, example: /logo.png"
                  />
                  <input
                    value={wordExaminerName}
                    onChange={(event) => setWordExaminerName(event.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    placeholder="Examiner Name"
                  />
                  <input
                    value={wordDurationMinutes}
                    onChange={(event) => setWordDurationMinutes(event.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    placeholder="Duration Minutes"
                  />
                  <input
                    value={wordHintText}
                    onChange={(event) => setWordHintText(event.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    placeholder="Hint constants line"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={wordEnUniversity} onChange={(event) => setWordEnUniversity(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN University" />
                    <input value={wordArUniversity} onChange={(event) => setWordArUniversity(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR University" />
                    <input value={wordEnFaculty} onChange={(event) => setWordEnFaculty(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN Faculty" />
                    <input value={wordArFaculty} onChange={(event) => setWordArFaculty(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR Faculty" />
                    <input value={wordEnDepartment} onChange={(event) => setWordEnDepartment(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN Department" />
                    <input value={wordArDepartment} onChange={(event) => setWordArDepartment(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR Department" />
                    <input value={wordEnMonthYear} onChange={(event) => setWordEnMonthYear(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN Month, Year" />
                    <input value={wordArMonthYear} onChange={(event) => setWordArMonthYear(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR Month, Year" />
                    <input value={wordEnCourseTitle} onChange={(event) => setWordEnCourseTitle(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN Course Title" />
                    <input value={wordArCourseTitle} onChange={(event) => setWordArCourseTitle(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR Course Title" />
                    <input value={wordEnYearTrack} onChange={(event) => setWordEnYearTrack(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="EN Year Track" />
                    <input value={wordArYearTrack} onChange={(event) => setWordArYearTrack(event.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="AR Year Track" />
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${innerCardClass}`}>
                  <h4 className={`text-sm font-semibold ${headingClass}`}>Preview</h4>
                  <div className={`mt-3 rounded border p-3 ${isDark ? 'border-white/10 bg-black/10' : 'border-gray-300 bg-white'}`}>
                    <p className={`text-sm font-semibold ${headingClass}`}>{wordEnUniversity}</p>
                    <p className={`text-xs ${subTextClass}`}>{wordEnFaculty}</p>
                    <p className={`text-xs ${subTextClass}`}>{wordEnDepartment}</p>
                    <p className={`text-xs ${subTextClass}`}>{wordEnMonthYear}</p>
                    <div className={`my-2 border-t ${isDark ? 'border-white/20' : 'border-gray-300'}`} />
                    <p className={`text-sm font-semibold ${headingClass}`}>{wordEnCourseTitle}</p>
                    <p className={`text-xs ${subTextClass}`}>{wordEnYearTrack}</p>
                    <p className={`text-xs ${subTextClass}`}>Time allowed: {wordDurationMinutes || '60'} minutes</p>
                    <p className={`mt-2 text-sm ${headingClass}`}><strong>Answer All Questions</strong></p>
                    <p className={`mt-2 text-xs ${subTextClass}`}>Examiner: {wordExaminerName}</p>
                    <p className={`text-xs ${subTextClass}`}>Questions in file: {detailItems.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportWordModal(false)}
                  className={`px-4 py-2 rounded-lg border text-sm ${secondaryButtonClass}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void exportDetailToWord()}
                  disabled={exportingDocx}
                  className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {exportingDocx ? 'Preparing Word...' : 'Download Word (.docx)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={`rounded-xl border p-6 ${cardClass}`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 text-sm font-medium ${subTextClass}`}>
              <FileText size={16} />
              Exams Workspace
            </div>
            <h2 className={`mt-2 text-2xl font-bold ${headingClass}`}>Exams</h2>
            <p className={`mt-1 text-sm ${subTextClass}`}>
              Manage your question bank and generate balanced exams by course and chapter.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowQuestionBankModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2"
              style={{ backgroundColor: primaryHex, '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            >
              <Plus size={18} />
              Add Question to Bank
            </button>
            <button
              type="button"
              onClick={() => setShowExamGenerationModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${secondaryButtonClass}`}
              style={{ '--tw-ring-color': `${primaryHex}80` } as React.CSSProperties}
            >
              <Sparkles size={18} />
              Generate Exam
            </button>
          </div>
        </div>

        <div className={`mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`rounded-lg border p-4 ${innerCardClass}`}>
            <div className={`text-xs uppercase tracking-wide ${subTextClass}`}>Total Questions</div>
            <div className={`mt-1 text-2xl font-bold ${headingClass}`}>{total}</div>
          </div>
          <div className={`rounded-lg border p-4 ${innerCardClass}`}>
            <div className={`text-xs uppercase tracking-wide ${subTextClass}`}>Visible on Page</div>
            <div className={`mt-1 text-2xl font-bold ${headingClass}`}>{questions.length}</div>
          </div>
          <div className={`rounded-lg border p-4 ${innerCardClass}`}>
            <div className={`text-xs uppercase tracking-wide ${subTextClass}`}>Selected Course</div>
            <div className={`mt-1 text-sm font-semibold ${headingClass}`}>
              {selectedCourse === 'all' ? 'All Courses' : courseNameById.get(selectedCourse) || 'Unknown Course'}
            </div>
          </div>
          <div className={`rounded-lg border p-4 ${innerCardClass}`}>
            <div className={`text-xs uppercase tracking-wide ${subTextClass}`}>Selected Chapter</div>
            <div className={`mt-1 text-sm font-semibold ${headingClass}`}>
              {selectedChapter === 'all'
                ? 'All Chapters'
                : chapterNameById.get(selectedChapter) || `Chapter #${selectedChapter}`}
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-xl border p-3 ${cardClass}`}>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'questions', label: 'Questions' },
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
      <section className={`rounded-xl border p-4 sm:p-5 ${cardClass}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className={subTextClass} />
            <h3 className={`text-lg font-semibold ${headingClass}`}>Generated Draft Previews</h3>
          </div>
          <span className={`text-sm ${subTextClass}`}>{generatedDrafts.length} draft(s) in this session</span>
        </div>

        {generatedDrafts.length === 0 ? (
          <div className={`rounded-lg border p-6 text-center ${innerCardClass}`}>
            <p className={`text-sm ${subTextClass}`}>
              No generated drafts yet. Use <strong>Generate Exam</strong> to create a preview draft.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedDrafts.map((draft) => (
              <article
                key={draft.draftId}
                className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className={`text-base font-semibold ${headingClass}`}>{draft.title || `Draft #${draft.draftId}`}</h4>
                    <p className={`text-sm ${subTextClass}`}>
                      {courseNameById.get(String(draft.courseId)) || `Course #${draft.courseId}`} • Generated{' '}
                      {formatDateTime(draft.generatedAt)}
                    </p>
                  </div>
                  {draft.savedExamId ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-300 text-green-800 bg-green-50 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300">
                      Saved as Exam #{draft.savedExamId}
                      <ArrowUpRight size={14} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      Not saved yet
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={countBadgeClass}>
                    {draftQuestionCountOverrides[draft.draftId] ?? draft.totalQuestions} questions
                  </span>
                  <span className={weightBadgeClass}>
                    Total weight {draft.totalWeight}
                  </span>
                  <span className={draftBadgeClass}>
                    Draft #{draft.draftId}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/instructordashboard/exams/${draft.draftId}?entity=draft`)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${secondaryButtonClass}`}
                  >
                    Open Draft Page
                    <ArrowUpRight size={12} />
                  </button>
                </div>

                {draft.items.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                    <p className={`text-xs mb-2 ${subTextClass}`}>Preview items</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {draft.items.slice(0, 10).map((item) => (
                        <div
                          key={`${draft.draftId}-${item.id}`}
                          className={`rounded px-2 py-1 text-sm ${isDark ? 'bg-white/5' : 'bg-white border border-gray-300'}`}
                        >
                          <span className={headingClass}>Q#{item.questionId}</span>{' '}
                          <span className={subTextClass}>
                            • Chapter {item.chapterId} • {formatEnumLabel(item.questionType)} •{' '}
                            {formatEnumLabel(item.difficulty)} • Weight {item.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      {activeWorkspaceTab === 'saved' && (
      <section id="saved-exams-section" className={`rounded-xl border p-4 sm:p-5 ${cardClass}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className={`text-lg font-semibold ${headingClass}`}>Saved Exams</h3>
          <span className={`text-sm ${subTextClass}`}>{savedExams.length} saved exam(s)</span>
        </div>

        {savedExams.length === 0 ? (
          <div className={`rounded-lg border p-6 text-center ${innerCardClass}`}>
            <p className={`text-sm ${subTextClass}`}>
              No saved exams yet. Generate a preview and click <strong>Save Exam</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedExams.map((exam) => {
              return (
                <article
                  key={`saved-${exam.examId}`}
                  className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className={`text-base font-semibold ${headingClass}`}>
                        {exam.title || `Exam #${exam.examId}`}
                      </h4>
                      <p className={`text-sm ${subTextClass}`}>
                        Exam #{exam.examId} •{' '}
                        {courseNameById.get(String(exam.courseId ?? '')) || `Course #${exam.courseId ?? 'N/A'}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={countBadgeClass}>
                        {savedExamQuestionCountOverrides[exam.examId] ?? exam.questionCount} questions
                      </span>
                      <span className={weightBadgeClass}>
                        Weight {exam.totalWeight}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/instructordashboard/exams/${exam.examId}?entity=saved`)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${secondaryButtonClass}`}
                      >
                        Open Exam Page
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      )}

      {activeWorkspaceTab === 'questions' && (
      <>
      <section className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <CustomDropdown
            label="Rows per page"
            value={String(limit)}
            options={LIMIT_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
            onChange={handleLimitChange}
            stackLabel
            fullWidth
          />
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
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin" style={{ color: primaryHex }} />
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
          <div className={`rounded-lg border p-8 text-center ${innerCardClass}`}>
            <ClipboardList size={42} className={`mx-auto mb-3 ${subTextClass}`} />
            <h4 className={`text-lg font-semibold ${headingClass}`}>No questions found</h4>
            <p className={`text-sm mt-1 ${subTextClass}`}>Try another filter or add a new question to the bank.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <article
                key={String(question.id ?? `question-${page}-${index}`)}
                className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'} transition-colors`}
              >
                {(() => {
                  const questionKey = String(question.id ?? `question-${page}-${index}`);
                  const imageUrl = questionImageUrls[questionKey];
                  const imageFailed = questionImageErrors[questionKey];

                  return (
                    <>
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
                    <span className={statusBadgeClass}>
                      {formatEnumLabel(question.status)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <p className={`text-sm sm:text-base font-medium ${headingClass}`}>
                    {question.questionText?.trim() || 'Untitled question'}
                  </p>
                  <button
                    type="button"
                    onClick={() => openQuestionEditor(question)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-semibold ${secondaryButtonClass}`}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
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
                  <p>
                    <span className="font-semibold">Answer:</span> {resolveQuestionAnswer(question)}
                  </p>
                  <p>
                    <span className="font-semibold">Hint:</span> {question.hints?.trim() || 'No hint provided'}
                  </p>
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
                </div>

                {Array.isArray(question.options) && question.options.length > 0 && (
                  <div className={`mt-3 pt-3 border-t space-y-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    {question.options.slice(0, 4).map((option, optionIndex) => (
                      <div
                        key={`${String(question.id ?? index)}-option-${optionIndex}`}
                        className={`text-xs sm:text-sm flex items-center justify-between rounded px-2 py-1 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
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
                    </>
                  );
                })()}
              </article>
            ))}
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
    </div>
  );
}

export default ExamsPage;
