import { ApiClient } from './client';

export interface Lab {
  labId: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  instructorName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  status: string;
  totalPoints?: number;
}

export interface LabInstruction {
  instructionId: number;
  content: string;
  orderNumber: number;
}

export interface LabWithInstructions extends Lab {
  instructions: LabInstruction[];
  objectives?: string[];
  resources?: { name: string; type: string; size: string; url?: string }[];
}

export interface LabSubmission {
  submissionId: number;
  labId: number;
  studentId: number;
  submittedAt: string;
  grade?: number;
  maxGrade: number;
  feedback?: string;
  status: string;
  fileUrl?: string;
}

export class LabService {
  static async getAll(params?: { courseId?: number }): Promise<Lab[]> {
    const query = params?.courseId ? `?courseId=${params.courseId}` : '';
    const response = await ApiClient.get<Lab[] | { data: Lab[] }>(`/labs${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getById(id: number): Promise<LabWithInstructions> {
    return ApiClient.get(`/labs/${id}`);
  }

  static async getInstructions(labId: number): Promise<LabInstruction[]> {
    const response = await ApiClient.get<LabInstruction[] | { data: LabInstruction[] }>(
      `/labs/${labId}/instructions`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async submit(labId: number, data: FormData | { content: string }): Promise<LabSubmission> {
    return ApiClient.post(`/labs/${labId}/submit`, data);
  }

  static async getMySubmission(labId: number): Promise<LabSubmission> {
    return ApiClient.get(`/labs/${labId}/submissions/my`);
  }
}
