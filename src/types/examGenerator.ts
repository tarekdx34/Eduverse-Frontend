import type {
  BloomLevel,
  QuestionBankDifficulty,
  QuestionBankQuestion,
  QuestionBankType,
} from './questionBank';

export type ExamDraftStatus = 'open' | 'finalized' | 'expired' | 'cancelled' | 'failed';
export type ExamStatus = 'draft' | 'published' | 'archived';
export type ExamMarkDistributionMode = 'manual' | 'weight_normalized' | 'equal';
export type ExamRoundingPolicy = 'none' | 'nearest_0_25' | 'nearest_0_5' | 'nearest_1';
export type ExamSectionAnswerPolicy = 'answer_all' | 'answer_any';
export type ExamGroupSelectionMode = 'independent' | 'exclude_grouped' | 'keep_group_together';
export type ExamGenerationScope = 'course' | 'chapter' | 'chapters' | 'group';
export type ExamExportFormat = 'docx' | 'pdf';
export type ExamExportVariant = 'student' | 'answer_key' | 'combined';
export type ExamAnswerKeyStyle = 'inline' | 'separate';

export interface ExamGenerationRule {
  scope?: ExamGenerationScope;
  chapterId?: number;
  chapterIds?: number[];
  groupIds?: number[];
  count: number;
  weightPerQuestion: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
}

export interface ExamGenerationSection {
  title: string;
  instructions?: string;
  totalMarks: number;
  answerPolicy: ExamSectionAnswerPolicy;
  requiredAnswerCount?: number;
  rules: ExamGenerationRule[];
}

export interface ExamGenerationPayload {
  courseId: number;
  title: string;
  totalMarks?: number;
  markDistributionMode?: ExamMarkDistributionMode;
  roundingPolicy?: ExamRoundingPolicy;
  groupSelectionMode?: ExamGroupSelectionMode;
  seed?: string;
  durationMinutes?: number;
  instructions?: string;
  headerText?: string;
  footerText?: string;
  rules?: ExamGenerationRule[];
  sections?: ExamGenerationSection[];
}

export interface ExamShortage {
  sectionTitle?: string;
  scope?: ExamGenerationScope;
  chapterId?: number;
  groupIds?: number[];
  requiredCount?: number;
  availableCount?: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
  message?: string;
}

export interface ExamGenerationReadiness {
  ready?: boolean;
  totalApprovedQuestions?: number;
  warnings?: string[];
  shortages?: ExamShortage[];
  [key: string]: unknown;
}

export interface ExamAvailability extends ExamGenerationReadiness {
  available?: boolean;
}

export interface ExamDraftItem {
  id: number;
  draftId?: number;
  questionId: number;
  chapterId?: number;
  draftSectionId?: number | null;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
  weight?: number;
  weightUnits?: number;
  marks?: number;
  itemOrder: number;
  overrideReason?: string;
  question?: QuestionBankQuestion;
}

export interface ExamDraftSection {
  id: number;
  draftId?: number;
  title: string;
  instructions?: string;
  totalMarks?: number;
  answerPolicy?: ExamSectionAnswerPolicy;
  requiredAnswerCount?: number;
  sectionOrder?: number;
  items?: ExamDraftItem[];
}

export interface ExamDraft {
  id?: number;
  draftId?: number;
  courseId?: number;
  title?: string;
  status?: ExamDraftStatus;
  seed?: string;
  totalQuestions?: number;
  totalWeight?: number;
  totalMarks?: number;
  items: ExamDraftItem[];
  sections?: ExamDraftSection[];
}

export interface ExamDraftValidation {
  valid?: boolean;
  errors?: string[];
  warnings?: string[];
  shortages?: ExamShortage[];
}

export interface ExamReplacementCheck {
  allowed?: boolean;
  requiresOverride?: boolean;
  reasons?: string[];
  warnings?: string[];
}

export interface ExamResponse {
  id: number;
  examId?: number;
  courseId?: number;
  title?: string;
  status?: ExamStatus;
  durationMinutes?: number;
  totalMarks?: number;
}

export interface ExamFullDetail extends ExamResponse {
  instructions?: string;
  headerText?: string;
  footerText?: string;
  sections?: ExamDraftSection[];
  items?: ExamDraftItem[];
  paperTemplate?: ExamPaperTemplate;
}

export interface ExamStats {
  total?: number;
  draft?: number;
  published?: number;
  archived?: number;
  [key: string]: number | undefined;
}

export interface ExamPage<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ExamPaperTemplate {
  id?: number;
  courseId?: number;
  name?: string;
  template?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ExamExportOptions {
  format: ExamExportFormat;
  variant: ExamExportVariant;
  includeAnswerKey?: boolean;
  studentNameLine?: boolean;
  showCourseCode?: boolean;
  pageBreakPerSection?: boolean;
  showInstructorName?: boolean;
  showTotalMarks?: boolean;
  showQuestionMarks?: boolean;
  answerKeyStyle?: ExamAnswerKeyStyle;
  paperTemplateId?: number;
  paperTemplateSnapshot?: Record<string, unknown>;
}

export interface ExamExportResponse {
  fileName?: string;
  mimeType?: string;
  content?: string;
  data?: {
    fileName?: string;
    mimeType?: string;
    content?: string;
  };
}

export interface ExamDraftListParams {
  courseId?: number;
  status?: ExamDraftStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ExamListParams {
  courseId?: number;
  status?: ExamStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ExamDraftSectionPayload {
  title: string;
  instructions?: string;
  totalMarks?: number;
  answerPolicy?: ExamSectionAnswerPolicy;
  requiredAnswerCount?: number;
}

export interface ExamDraftItemAddPayload {
  questionId: number;
  draftSectionId?: number | null;
  weight?: number;
  weightUnits?: number;
  marks?: number;
  itemOrder?: number;
  overrideReason?: string;
}

export interface ExamDraftItemUpdatePayload {
  replacementQuestionId?: number;
  draftSectionId?: number | null;
  weight?: number;
  weightUnits?: number;
  marks?: number;
  itemOrder?: number;
  overrideReason?: string;
}
