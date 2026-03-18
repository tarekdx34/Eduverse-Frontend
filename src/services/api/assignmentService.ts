import { ApiClient } from './client';

// Backend response shapes
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string; // decimal as string
  weight: string;
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: number;
  submissionText: string | null;
  fileId: number | null;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedAt: string;
  isLate: number; // 0 or 1
  score?: string; // decimal as string
  feedback?: string;
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
    return ApiClient.put<Assignment>('/assignments/' + id, data);
  }

  // Delete assignment (instructor)
  static async delete(id: string): Promise<void> {
    return ApiClient.delete('/assignments/' + id);
  }

  // Get my submission for an assignment (student)
  static async getMySubmission(assignmentId: string): Promise<AssignmentSubmission | null> {
    try {
      return await ApiClient.get<AssignmentSubmission>('/assignments/' + assignmentId + '/submissions/my');
    } catch (error: any) {
      if (error.message?.includes('404') || error.response?.status === 404) {
        return null; // Not submitted yet
      }
      throw error;
    }
  }

  // Submit text (student)
  static async submitText(assignmentId: string, submissionText: string): Promise<AssignmentSubmission> {
    return ApiClient.post<AssignmentSubmission>('/assignments/' + assignmentId + '/submit', { submissionText });
  }

  // Submit file (student) with optional text
  static async submitFile(assignmentId: string, file: File, submissionText?: string): Promise<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('file', file);
    if (submissionText) {
      formData.append('submissionText', submissionText);
    }
    return ApiClient.post<AssignmentSubmission>('/assignments/' + assignmentId + '/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Get all submissions for an assignment (instructor/TA)
  static async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return ApiClient.get<AssignmentSubmission[]>('/assignments/' + assignmentId + '/submissions');
  }

  // Grade a submission (instructor/TA)
  static async gradeSubmission(assignmentId: string, submissionId: string, score: number, feedback: string): Promise<AssignmentSubmission> {
    return ApiClient.put<AssignmentSubmission>('/assignments/' + assignmentId + '/submissions/' + submissionId + '/grade', { score, feedback });
  }
}

export default AssignmentService;
