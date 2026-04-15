import { ApiClient } from './client';

export interface AttendanceRecord {
  courseId: number;
  courseName: string;
  courseCode: string;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  excused?: number;
  percentage: number;
  lastClassDate?: string;
}

export interface AttendanceDailyRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  sessionType?: string;
}

export interface StudentAttendance {
  summary: AttendanceRecord[];
  details?: Record<number, AttendanceDailyRecord[]>;
}

export interface StudentFaceReference {
  id: number;
  userId: number;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  isPrimary: boolean;
  createdAt: string;
  signedUrl?: string | null;
}

export interface AiProcessingResult {
  processingId: number;
  status: string;
  detectedFacesCount?: number;
  matchedStudentsCount?: number;
  unmatchedFacesCount?: number;
  errorMessage?: string;
  processingTimeMs?: number;
}

export class AttendanceService {
  static async getMyAttendance(): Promise<StudentAttendance | AttendanceRecord[]> {
    const response = await ApiClient.get<
      StudentAttendance | AttendanceRecord[] | { data: AttendanceRecord[] }
    >('~/attendance/my');
    if (Array.isArray(response)) return response;
    if ('data' in (response as object) && Array.isArray((response as { data: unknown }).data)) {
      return (response as { data: AttendanceRecord[] }).data;
    }
    return response as StudentAttendance;
  }

  static async getByStudent(studentId: number): Promise<StudentAttendance> {
    return ApiClient.get(`~/attendance/by-student/${studentId}`);
  }

  static async getSessions(params: {
    sectionId?: number;
    courseId?: number;
    status?: string;
  }): Promise<any> {
    return ApiClient.get('~/attendance/sessions', { params });
  }

  static async createSession(data: {
    sectionId: number;
    sessionDate: string;
    sessionType: 'lecture' | 'lab' | 'tutorial';
    totalMinutes?: number;
  }): Promise<any> {
    return ApiClient.post('~/attendance/sessions', data);
  }

  static async updateSession(id: number, data: any): Promise<any> {
    return ApiClient.put(`~/attendance/sessions/${id}`, data);
  }

  static async deleteSession(id: number): Promise<void> {
    return ApiClient.delete(`~/attendance/sessions/${id}`);
  }

  static async getSessionDetails(id: number): Promise<any> {
    return ApiClient.get(`~/attendance/sessions/${id}`);
  }

  static async markBatchAttendance(data: {
    sessionId: number;
    records: Array<{ studentId: number; status: string; notes?: string }>;
  }): Promise<any> {
    return ApiClient.post('~/attendance/records/batch', data);
  }

  static async getSectionSummary(sectionId: number): Promise<any> {
    return ApiClient.get(`~/attendance/summary/${sectionId}`);
  }

  /** Student: upload a face reference for AI attendance (multipart field `image`). */
  static async uploadMyFaceReference(file: File): Promise<StudentFaceReference> {
    const fd = new FormData();
    fd.append('image', file);
    return ApiClient.post('~/attendance/face-references/me', fd);
  }

  static async listMyFaceReferences(): Promise<StudentFaceReference[]> {
    return ApiClient.get('~/attendance/face-references/me');
  }

  static async deleteMyFaceReference(referenceId: number): Promise<{ success: boolean }> {
    return ApiClient.delete(`~/attendance/face-references/me/${referenceId}`);
  }

  /** Instructor/TA: class photo for AI; returns `processingId` to poll. */
  static async uploadAiAttendancePhoto(sessionId: number, photo: File): Promise<AiProcessingResult> {
    const fd = new FormData();
    fd.append('photo', photo);
    fd.append('sessionId', String(sessionId));
    return ApiClient.post('~/attendance/ai-photo', fd);
  }

  static async getAiProcessingResult(processingId: number): Promise<AiProcessingResult> {
    return ApiClient.get(`~/attendance/ai-photo/${processingId}`);
  }
}
