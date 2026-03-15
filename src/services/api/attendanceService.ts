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

export class AttendanceService {
  static async getMyAttendance(): Promise<StudentAttendance | AttendanceRecord[]> {
    const response = await ApiClient.get<StudentAttendance | AttendanceRecord[] | { data: AttendanceRecord[] }>('~/attendance/my');
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
}
