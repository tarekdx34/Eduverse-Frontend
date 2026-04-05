import { ApiClient } from './client';

// Backend response shapes
export interface Lab {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  labNumber: number | null;
  dueDate: string | null;
  availableFrom: string | null;
  maxScore: string; // string number like "100.00"
  weight: string; // string number
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  course?: { id: string; name: string; code: string };
}

export interface LabInstruction {
  id: string;
  labId: string;
  fileId: number | null;
  instructionText: string;
  orderIndex: number;
  createdAt: string;
}

export interface LabWithInstructions extends Lab {
  instructions: LabInstruction[];
}

export interface LabSubmission {
  id: string;
  labId: string;
  userId: number;
  submissionText: string | null;
  fileId: number | null;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedAt: string;
  user?: { userId: number; firstName: string; lastName: string; email: string };
  score?: string; // string number if graded
  feedback?: string;
}

// NOTE: Lab endpoints have /api prefix in backend
// baseURL is /api so we use /labs (not /api/labs)
export class LabService {
  // Get labs list
  static async getAll(params?: { courseId?: string }): Promise<Lab[]> {
    const response = await ApiClient.get<Lab[]>('/labs', { params });
    return response;
  }

  // Get lab detail with instructions
  static async getById(id: string): Promise<LabWithInstructions> {
    return ApiClient.get<LabWithInstructions>('/labs/' + id);
  }

  // Create lab (instructor)
  static async create(data: Partial<Lab>): Promise<Lab> {
    return ApiClient.post<Lab>('/labs', data);
  }

  // Update lab (instructor)
  static async update(id: string, data: Partial<Lab>): Promise<Lab> {
    return ApiClient.put<Lab>('/labs/' + id, data);
  }

  // Delete lab (instructor)
  static async delete(id: string): Promise<void> {
    return ApiClient.delete('/labs/' + id);
  }

  // Add instruction (instructor)
  static async addInstruction(
    labId: string,
    data: { instructionText: string; orderIndex: number; fileId?: number }
  ): Promise<LabInstruction> {
    return ApiClient.post<LabInstruction>('/labs/' + labId + '/instructions', data);
  }

  // Delete instruction (instructor)
  static async deleteInstruction(labId: string, instructionId: string): Promise<void> {
    return ApiClient.delete('/labs/' + labId + '/instructions/' + instructionId);
  }

  // Get my submission (student)
  static async getMySubmission(labId: string): Promise<LabSubmission | null> {
    try {
      const data = await ApiClient.get<LabSubmission | LabSubmission[]>(
        '/labs/' + labId + '/submissions/my'
      );
      // Handle both [] (empty array) and null/undefined as "not submitted"
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return null;
      }
      // Return first item if array, or the object directly
      return Array.isArray(data) ? data[0] : data;
    } catch (error: any) {
      if (error.message?.includes('404') || error.response?.status === 404) {
        return null; // Not submitted yet
      }
      throw error;
    }
  }

  // Submit lab (student)
  static async submit(labId: string, submissionText: string, file?: File): Promise<LabSubmission> {
    const formData = new FormData();
    formData.append('submissionText', submissionText);
    if (file) {
      formData.append('file', file);
    }
    return ApiClient.post<LabSubmission>('/labs/' + labId + '/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Get all submissions for a lab (instructor/TA)
  static async getSubmissions(labId: string): Promise<LabSubmission[]> {
    return ApiClient.get<LabSubmission[]>('/labs/' + labId + '/submissions');
  }

  // Grade a submission (instructor/TA)
  static async gradeSubmission(
    labId: string,
    submissionId: string,
    score: number,
    feedback: string
  ): Promise<LabSubmission> {
    return ApiClient.put<LabSubmission>(
      '/labs/' + labId + '/submissions/' + submissionId + '/grade',
      { score, feedback }
    );
  }

  // Get instructions for a lab
  static async getInstructions(labId: string): Promise<LabInstruction[]> {
    return ApiClient.get<LabInstruction[]>('/labs/' + labId + '/instructions');
  }

  // Get attendance for a lab (instructor/TA)
  static async getAttendance(labId: string): Promise<any[]> {
    return ApiClient.get<any[]>('/labs/' + labId + '/attendance');
  }

  // Publish a lab (change status to published)
  static async publish(labId: string): Promise<Lab> {
    return ApiClient.put<Lab>('/labs/' + labId, { status: 'published' });
  }
}

export default LabService;
