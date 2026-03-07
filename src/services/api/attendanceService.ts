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
    const response = await ApiClient.get<StudentAttendance | AttendanceRecord[] | { data: AttendanceRecord[] }>('/attendance/my');
    if (Array.isArray(response)) return response;
    if ('data' in (response as object) && Array.isArray((response as { data: unknown }).data)) {
      return (response as { data: AttendanceRecord[] }).data;
    }
    return response as StudentAttendance;
  }

  static async getByStudent(studentId: number): Promise<StudentAttendance> {
    return ApiClient.get(`/attendance/by-student/${studentId}`);
  }
}
