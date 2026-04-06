// Assignment and Submission TypeScript interfaces
// Based on ASSIGNMENTS_FRONTEND_GUIDE.md API spec

export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type SubmissionType = 'text' | 'file' | 'link' | 'any';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface DriveFile {
  id: number;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string;
  weight: string;
  status: AssignmentStatus;
  submissionType: SubmissionType;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  latePenalty?: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: Course;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: number;
  submissionText: string | null;
  submissionLink: string | null;
  fileId: number | null;
  file?: DriveFile;
  submissionStatus: SubmissionStatus;
  submittedAt: string;
  isLate: number; // 0 or 1
  attemptNumber?: number;
  score?: string;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
  user?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Submission payloads
export interface TextSubmissionPayload {
  submissionText: string;
}

export interface LinkSubmissionPayload {
  submissionLink: string;
}

export interface FileIdSubmissionPayload {
  fileId: number;
}

export type SubmissionPayload =
  | TextSubmissionPayload
  | LinkSubmissionPayload
  | FileIdSubmissionPayload;

// Component props
export interface AssignmentCardProps {
  assignment: Assignment;
  submission?: AssignmentSubmission | null;
  onClick: () => void;
}

export interface AssignmentViewProps {
  assignmentId: string;
  onBack: () => void;
}

export interface SubmissionFormProps {
  assignment: Assignment;
  onSubmitSuccess: () => void;
  disabled?: boolean;
}

export interface FileUploadProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export interface MySubmissionProps {
  submission: AssignmentSubmission;
  assignment: Assignment;
  onResubmit?: () => void;
}

// Filter and sort options
export type FilterStatus = 'all' | 'pending' | 'submitted' | 'graded';
export type SortOption = 'dueDate' | 'title' | 'course' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  status: FilterStatus;
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
}

// Assignment with submission status combined
export interface AssignmentWithSubmission extends Assignment {
  submission?: AssignmentSubmission | null;
}

// Statistics
export interface AssignmentStats {
  total: number;
  pending: number;
  submitted: number;
  graded: number;
  averageScore: number | null;
  totalPoints: number;
  earnedPoints: number;
}

// Due date helpers
export interface DueDateInfo {
  daysUntil: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // within 3 days
  label: string;
  urgency: 'overdue' | 'today' | 'soon' | 'normal';
}
