import { ApiClient } from './client';

export interface GradeRecord {
  gradeId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  percentage?: number;
  letterGrade?: string;
  gradePoints?: number;
  status: string;
  semesterName?: string;
  semesterId?: number;
}

export interface GpaSummary {
  cumulativeGpa: number;
  totalCredits: number;
  totalCreditsEarned: number;
  semesters: SemesterGpa[];
}

export interface SemesterGpa {
  semesterId: number;
  semesterName: string;
  gpa: number;
  credits: number;
  courses?: GradeRecord[];
}

export interface TranscriptData {
  studentId: number;
  studentName: string;
  semesters: SemesterGpa[];
  cumulativeGpa: number;
  totalCredits: number;
}

export class GradesService {
  static async getMyGrades(): Promise<GradeRecord[]> {
    const response = await ApiClient.get<GradeRecord[] | { data: GradeRecord[] }>('/grades/my');
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getGpa(studentId: number): Promise<GpaSummary> {
    return ApiClient.get(`/grades/gpa/${studentId}`);
  }

  static async getTranscript(studentId: number): Promise<TranscriptData> {
    return ApiClient.get(`/grades/transcript/${studentId}`);
  }
}
