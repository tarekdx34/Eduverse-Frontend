export type QuestionBankType = 'written' | 'mcq' | 'true_false' | 'fill_blanks' | 'essay';

export type QuestionBankDifficulty = 'easy' | 'medium' | 'hard';

export type BloomLevel =
  | 'remembering'
  | 'understanding'
  | 'applying'
  | 'analyzing'
  | 'evaluating'
  | 'creating';

export type QuestionBankStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type QuestionAttachmentType = 'image' | 'document' | 'audio' | 'video';

export type QuestionGroupType =
  | 'passage'
  | 'case_study'
  | 'image_set'
  | 'multipart'
  | 'other';

export type QuestionStatusAction =
  | 'submit-for-review'
  | 'approve'
  | 'reject'
  | 'archive'
  | 'restore';

export interface CourseChapter {
  id: number;
  courseId: number;
  name: string;
  chapterOrder: number;
  isActive: number | boolean;
}

export interface QuestionBankOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionBankFillBlank {
  id?: number;
  blankKey: string;
  acceptableAnswer: string;
  isCaseSensitive?: boolean;
}

export interface QuestionAttachmentPayload {
  fileId: number;
  attachmentType: QuestionAttachmentType;
  caption?: string | null;
  altText?: string | null;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface QuestionBankAttachment extends Partial<QuestionAttachmentPayload> {
  id: number;
  questionId?: number;
  url?: string;
  type?: QuestionAttachmentType | string;
}

export interface QuestionBankFormPayload {
  courseId: number;
  chapterId: number;
  questionType: QuestionBankType;
  difficulty: QuestionBankDifficulty;
  bloomLevel: BloomLevel;
  questionText?: string;
  questionFileId?: number;
  questionFileCaption?: string | null;
  questionFileAltText?: string | null;
  expectedAnswerText?: string;
  hints?: string;
  options?: QuestionBankOption[];
  fillBlanks?: QuestionBankFillBlank[];
  attachments?: QuestionAttachmentPayload[];
}

export interface QuestionBankQuestion extends Omit<QuestionBankFormPayload, 'attachments'> {
  id: number;
  status?: QuestionBankStatus;
  attachments?: QuestionBankAttachment[];
  createdAt?: string;
  updatedAt?: string;
  rejectionComment?: string;
  questionGroupId?: number;
  groupId?: number;
}

export interface QuestionBankPage {
  data: QuestionBankQuestion[];
  total: number;
  page?: number;
  limit?: number;
}

export interface QuestionBankStats {
  total?: number;
  approved?: number;
  draft?: number;
  underReview?: number;
  under_review?: number;
  rejected?: number;
  archived?: number;
  withAttachments?: number;
  grouped?: number;
  [key: string]: number | undefined;
}

export interface QuestionBankUploadResponse {
  fileId: number;
  attachment?: QuestionBankAttachment;
  data?: {
    fileId?: number | string;
    attachment?: QuestionBankAttachment;
  };
}

export interface QuestionBulkCreateRequest {
  courseId: number;
  defaultChapterId?: number;
  questions: QuestionBankFormPayload[];
}

export interface QuestionBulkRow extends Partial<QuestionBankFormPayload> {
  rowNumber?: number;
  errors?: string[];
}

export interface QuestionBulkCreateResult {
  created?: QuestionBankQuestion[];
  failed?: QuestionBulkRow[];
  successCount?: number;
  failureCount?: number;
  data?: QuestionBankQuestion[];
  total?: number;
}

export interface QuestionBankListParams {
  courseId?: number;
  chapterId?: number;
  questionType?: QuestionBankType;
  difficulty?: QuestionBankDifficulty;
  bloomLevel?: BloomLevel;
  status?: QuestionBankStatus;
  page?: number;
  limit?: number;
  search?: string;
  hasAttachments?: boolean;
  groupId?: number;
  questionGroupId?: number;
  groupIds?: number[];
}

export interface QuestionBankBatchStatusRequest extends Partial<QuestionBankListParams> {
  questionIds?: number[];
  action: QuestionStatusAction;
  comment?: string;
  allMatchingFilters?: boolean;
  excludeQuestionIds?: number[];
  expectedQuestionCount?: number;
}

export interface QuestionBankGroup {
  id: number;
  courseId: number;
  title: string;
  sharedPrompt?: string;
  description?: string;
  groupType: QuestionGroupType;
  sharedFileId?: number;
  sharedImageFileId?: number;
  sharedFileCaption?: string | null;
  sharedFileAltText?: string | null;
  chapterId?: number;
  questions?: QuestionBankQuestion[];
}

export interface QuestionGroupPayload {
  courseId: number;
  title: string;
  sharedPrompt?: string | null;
  sharedFileId?: number | null;
  sharedFileCaption?: string | null;
  sharedFileAltText?: string | null;
  groupType: QuestionGroupType;
}

export interface QuestionGroupListParams {
  courseId?: number;
  chapterId?: number;
  page?: number;
  limit?: number;
  search?: string;
  groupType?: QuestionGroupType;
}
