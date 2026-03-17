import { ApiClient } from './client';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  maxScore: string;
  weight: string;
  dueDate: string;
  availableFrom: string;
  lateSubmissionAllowed: number;
  latePenaltyPercent: string;
  submissionType: string;
  maxFileSizeMb: number;
  allowedFileTypes: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    name: string;
    code: string;
    description?: string;
    credits?: number;
    level?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  submissionText?: string | null;
  submissionLink?: string | null;
  fileId?: number | null;
  submittedAt: string;
  submissionStatus: string;
  isLate?: number;
  attemptNumber?: number;
}

export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface GradeSubmissionResponse {
  submissionId: number;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface UploadedAssignmentFile {
  assignmentId: number;
  driveFile: {
    driveFileId: string;
    driveId: string;
    fileName: string;
    webViewLink?: string;
    webContentLink?: string;
  };
}

export class AssignmentService {
  static async getAll(params?: { courseId?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Assignment>> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', params.courseId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const response = await ApiClient.get<PaginatedResponse<Assignment> | Assignment[]>(
      `/assignments${qs ? `?${qs}` : ''}`
    );
    if (Array.isArray(response)) {
      return { data: response, meta: { total: response.length, page: 1, limit: response.length, totalPages: 1 } };
    }
    return response;
  }

  static async getById(id: string): Promise<Assignment> {
    return ApiClient.get(`/assignments/${id}`);
  }

  static async submit(id: string, data: FormData | { content: string }): Promise<AssignmentSubmission> {
    return ApiClient.post(`/assignments/${id}/submit`, data);
  }

  static async getMySubmission(assignmentId: string): Promise<AssignmentSubmission> {
    return ApiClient.get(`/assignments/${assignmentId}/submissions/my`);
  }

  static async create(data: Partial<Assignment>): Promise<Assignment> {
    return ApiClient.post('/assignments', data);
  }

  static async update(id: string, data: Partial<Assignment>): Promise<Assignment> {
    return ApiClient.patch(`/assignments/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    return ApiClient.delete(`/assignments/${id}`);
  }

  static async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return ApiClient.get(`/assignments/${assignmentId}/submissions`);
  }

  static async gradeSubmission(
    assignmentId: string,
    submissionId: number,
    data: { score: number; feedback?: string }
  ): Promise<GradeSubmissionResponse> {
    return ApiClient.patch(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data);
  }

  static async updateStatus(id: string, status: AssignmentStatus): Promise<Assignment> {
    return ApiClient.patch(`/assignments/${id}/status`, { status });
  }

  static async uploadInstructions(
    assignmentId: string,
    file: File,
    title?: string,
    orderIndex?: number
  ): Promise<UploadedAssignmentFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (orderIndex !== undefined) formData.append('orderIndex', String(orderIndex));
    return ApiClient.post(`/assignments/${assignmentId}/instructions/upload`, formData);
  }

  static async uploadSubmission(
    assignmentId: string,
    file: File,
    payload?: { submissionText?: string; submissionLink?: string }
  ): Promise<UploadedAssignmentFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (payload?.submissionText) formData.append('submissionText', payload.submissionText);
    if (payload?.submissionLink) formData.append('submissionLink', payload.submissionLink);
    return ApiClient.post(`/assignments/${assignmentId}/submissions/upload`, formData);
  }
}
