import { ApiClient } from './client';

// Backend response shapes
export interface DriveFileLink {
  driveId: string;
  fileName: string;
  webViewLink: string;
  iframeUrl: string;
  downloadUrl: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  instructions: string | null; // Markdown text instructions
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string; // decimal as string
  weight: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  submissionType: 'text' | 'file' | 'link' | 'any';
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[]; // e.g., ['pdf', 'docx']
  latePenalty?: number; // percentage per day
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
  instructionFiles?: DriveFileLink[];
}

// Type alias for backward compatibility
export type AssignmentStatus = Assignment['status'];

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: number;
  submissionText: string | null;
  submissionLink: string | null;
  fileId: number | null;
  file?: { id: number; name: string; url: string }; // Google Drive file info
  driveFile?: DriveFileLink | null;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedAt: string;
  isLate: number; // 0 or 1
  attemptNumber?: number;
  score?: string; // decimal as string
  feedback?: string;
  gradedBy?: number;
  gradedAt?: string;
  user?: { userId: number; firstName: string; lastName: string; email: string };
}

// NOTE: Assignment endpoints have /api prefix in backend
// baseURL is /api so we use /assignments (not /api/assignments)
export class AssignmentService {
  // Get all assignments (student or instructor)
  static async getAll(params?: { courseId?: string }): Promise<Assignment[]> {
    return ApiClient.get<Assignment[]>('/assignments', { params });
  }

  // Get assignment by ID
  static async getById(id: string): Promise<Assignment> {
    return ApiClient.get<Assignment>('/assignments/' + id);
  }

  // Create assignment (instructor)
  static async create(data: Partial<Assignment>): Promise<Assignment> {
    return ApiClient.post<Assignment>('/assignments', data);
  }

  // Update assignment (instructor)
  static async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    return ApiClient.patch<Assignment>('/assignments/' + id, data);
  }

  // Delete assignment (instructor)
  static async delete(id: string): Promise<void> {
    return ApiClient.delete('/assignments/' + id);
  }

  // Get my submission for an assignment (student)
  static async getMySubmission(assignmentId: string): Promise<AssignmentSubmission | null> {
    try {
      return await ApiClient.get<AssignmentSubmission>(
        '/assignments/' + assignmentId + '/submissions/my'
      );
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found') || error.response?.status === 404) {
        return null; // Not submitted yet
      }
      throw error;
    }
  }

  // Submit text (student)
  static async submitText(
    assignmentId: string,
    submissionText: string
  ): Promise<AssignmentSubmission> {
    return ApiClient.post<AssignmentSubmission>('/assignments/' + assignmentId + '/submit', {
      submissionText,
    });
  }

  // Submit file (student) with optional text
  static async submitFile(
    assignmentId: string,
    file: File,
    submissionText?: string
  ): Promise<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('file', file);
    if (submissionText) {
      formData.append('submissionText', submissionText);
    }
    // Don't set Content-Type - let browser add boundary automatically
    return ApiClient.post<AssignmentSubmission>(
      '/assignments/' + assignmentId + '/submit',
      formData
    );
  }

  // Get all submissions for an assignment (instructor/TA)
  static async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return ApiClient.get<AssignmentSubmission[]>('/assignments/' + assignmentId + '/submissions');
  }

  // Grade a submission (instructor/TA)
  static async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback: string
  ): Promise<AssignmentSubmission> {
    return ApiClient.patch<AssignmentSubmission>(
      '/assignments/' + assignmentId + '/submissions/' + submissionId + '/grade',
      { score, feedback }
    );
  }

  // Change assignment status (instructor/TA)
  static async changeStatus(
    assignmentId: string,
    status: AssignmentStatus
  ): Promise<Assignment> {
    return ApiClient.patch<Assignment>('/assignments/' + assignmentId + '/status', { status });
  }

  // Upload instruction file to Google Drive (instructor/TA)
  static async uploadInstructions(assignmentId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type - let browser add boundary automatically
    return ApiClient.post<void>(
      '/assignments/' + assignmentId + '/instructions/upload',
      formData
    );
  }

  // Upload submission file to Google Drive (student)
  static async uploadSubmissionFile(
    assignmentId: string,
    file: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type - let browser add boundary automatically
    return ApiClient.post<any>(
      '/assignments/' + assignmentId + '/submissions/upload',
      formData
    );
  }

  // Submit with link (student)
  static async submitLink(
    assignmentId: string,
    submissionLink: string
  ): Promise<AssignmentSubmission> {
    return ApiClient.post<AssignmentSubmission>('/assignments/' + assignmentId + '/submit', {
      submissionLink,
    });
  }

  // Submit with file ID (after uploading) (student)
  static async submitWithFileId(
    assignmentId: string,
    fileId: number
  ): Promise<AssignmentSubmission> {
    return ApiClient.post<AssignmentSubmission>('/assignments/' + assignmentId + '/submit', {
      fileId,
    });
  }
}

export default AssignmentService;

