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
  semesterGpa: number;
  cumulativeGpa: number;
}

export interface TranscriptData {
  studentId: number;
  studentName: string;
  cumulativeGpa: number;
  totalCredits: number;
  semesters?: Array<{
    semesterId: number;
    semesterName: string;
    gpa: number;
    courses: Array<{
      courseId: number;
      courseName: string;
      credits: number;
      letterGrade: string;
      score: number;
      maxScore: number;
    }>;
  }>;
}

export class GradesService {
  static async getMyGrades(): Promise<GradeRecord[]> {
    const response = await ApiClient.get<GradeRecord[] | { data: GradeRecord[] }>('/grades/my');
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async getGpa(studentId: number): Promise<GpaSummary> {
    return ApiClient.get(`/grades/gpa/${studentId}`);
  }

  static async getTranscript(studentId: number): Promise<TranscriptData> {
    return ApiClient.get(`/grades/transcript/${studentId}`);
  }

  static async getCourseGrades(courseId: number): Promise<any> {
    return ApiClient.get('/grades', { params: { courseId } });
  }

  static async getSectionGrades(sectionId: number, courseId?: number): Promise<any> {
    const resolvedCourseId = courseId ?? sectionId;
    return GradesService.getCourseGrades(resolvedCourseId);
  }

  static async updateStudentGrade(
    gradeId: number,
    data: { percentage: number; notes?: string }
  ): Promise<GradeRecord> {
    return ApiClient.patch(`/grades/${gradeId}`, data);
  }
}
