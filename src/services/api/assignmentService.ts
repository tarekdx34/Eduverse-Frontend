import { ApiClient } from './client';

export interface Assignment {
  assignmentId: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  type?: string;
  dueDate: string;
  status: string;
  totalPoints: number;
  createdAt?: string;
}

export interface AssignmentDetails extends Assignment {
  instructions?: string;
  attachments?: { fileId: number; fileName: string; fileUrl: string }[];
  rubric?: unknown;
}

export interface AssignmentSubmission {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: string;
  fileUrl?: string;
}

export class AssignmentService {
  static async getAll(params?: { courseId?: number; status?: string }): Promise<Assignment[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', String(params.courseId));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    const response = await ApiClient.get<Assignment[] | { data: Assignment[] }>(
      `/assignments${qs ? `?${qs}` : ''}`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getById(id: number): Promise<AssignmentDetails> {
    return ApiClient.get(`/assignments/${id}`);
  }

  static async submit(id: number, data: FormData | { content: string }): Promise<AssignmentSubmission> {
    return ApiClient.post(`/assignments/${id}/submit`, data);
  }

  static async getMySubmission(assignmentId: number): Promise<AssignmentSubmission> {
    return ApiClient.get(`/assignments/${assignmentId}/submissions/my`);
  }
}
