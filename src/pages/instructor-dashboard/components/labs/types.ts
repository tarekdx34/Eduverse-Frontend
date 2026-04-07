// Lab status type
export type LabStatus = 'draft' | 'published' | 'closed' | 'archived';

// Lab attendance status
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Lab submission status
export type SubmissionStatus = 'submitted' | 'graded' | 'returned' | 'resubmit';

// Lab data model
export interface Lab {
  id: string;
  labId?: number; // for backend compatibility
  courseId: string;
  title: string;
  description: string | null;
  labNumber: number | null;
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string;
  weight: string;
  status: LabStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
  instructions?: LabInstruction[];
}

// Lab instruction
export interface LabInstruction {
  id: string;
  instructionId?: number;
  labId: string;
  instructionText: string | null;
  fileId: number | null;
  file?: DriveFile;
  orderIndex: number;
  createdAt: string;
}

// Drive file reference (legacy)
export interface DriveFile {
  fileId: number;
  fileName: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
}

// New Drive file link format (from backend Drive integration)
export interface DriveFileLink {
  driveId: string;
  driveFileId?: number;
  fileName: string;
  webViewLink: string;
  iframeUrl: string;
  downloadUrl: string;
}

// Lab submission
export interface LabSubmission {
  id: string;
  submissionId?: number;
  labId: string;
  userId: number;
  user?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  submissionText: string | null;
  fileId: number | null;
  file?: DriveFile;
  driveFile?: DriveFileLink | null; // New: resolved Drive file metadata
  submissionStatus: SubmissionStatus;
  status?: string; // legacy
  score: string | null;
  feedback: string | null;
  gradedBy?: number;
  gradedAt?: string;
  isLate?: boolean;
  submittedAt: string;
  // Additional properties for SubmissionList compatibility
  studentName?: string;
  studentEmail?: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
}

// Lab attendance record
export interface LabAttendance {
  attendanceId: number;
  labId: string;
  userId: number;
  user?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: AttendanceStatus;
  notes?: string;
  markedBy: number;
  markedAt: string;
}

// Form data types
export interface LabFormData {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  availableFrom: string;
  maxScore: string;
  weight: string;
  status: LabStatus;
}

export interface InstructionFormData {
  instructionText: string;
  orderIndex: number;
  fileId?: number;
}

export interface GradeFormData {
  score: number;
  feedback: string;
}

export interface AttendanceFormData {
  userId: number;
  status: AttendanceStatus;
  notes?: string;
}

// UI state types
export interface LabUIData extends Lab {
  submissionCount?: number;
  gradedCount?: number;
  averageScore?: number;
}

// Default form values
export const DEFAULT_LAB_FORM: LabFormData = {
  courseId: '',
  title: '',
  description: '',
  dueDate: '',
  availableFrom: '',
  maxScore: '100',
  weight: '10',
  status: 'draft',
};

export const DEFAULT_INSTRUCTION_FORM: InstructionFormData = {
  instructionText: '',
  orderIndex: 0,
};

export const DEFAULT_GRADE_FORM: GradeFormData = {
  score: 0,
  feedback: '',
};
