import { ApiClient } from './client';
import type { AttendanceSession, AttendanceRecord, AttendanceSummary } from '../../types/api';

export const attendanceService = {
  // Sessions
  createSession: (data: { sectionId: number; date: string; type: string }) =>
    ApiClient.post<AttendanceSession>('/attendance/sessions', data),

  listSessions: (params?: { sectionId?: number }) =>
    ApiClient.get<AttendanceSession[]>('/attendance/sessions', params),

  getSession: (id: number) =>
    ApiClient.get<AttendanceSession>(`/attendance/sessions/${id}`),

  updateSession: (id: number, data: Partial<AttendanceSession>) =>
    ApiClient.put(`/attendance/sessions/${id}`, data),

  deleteSession: (id: number) =>
    ApiClient.delete(`/attendance/sessions/${id}`),

  closeSession: (id: number) =>
    ApiClient.patch(`/attendance/sessions/${id}/close`, {}),

  getSessionRecords: (sessionId: number) =>
    ApiClient.get<AttendanceRecord[]>(`/attendance/sessions/${sessionId}/records`),

  // Records
  markAttendance: (data: { sessionId: number; studentId: number; status: string }) =>
    ApiClient.post<AttendanceRecord>('/attendance/records', data),

  batchMarkAttendance: (data: { sessionId: number; records: { studentId: number; status: string }[] }) =>
    ApiClient.post('/attendance/records/batch', data),

  updateRecord: (id: number, data: { status: string; notes?: string }) =>
    ApiClient.put(`/attendance/records/${id}`, data),

  // Student view
  getMyAttendance: (params?: { courseId?: number }) =>
    ApiClient.get('/attendance/my', params),

  getStudentAttendance: (studentId: number) =>
    ApiClient.get(`/attendance/by-student/${studentId}`),

  // Reports
  getCourseAttendance: (courseId: number) =>
    ApiClient.get(`/attendance/by-course/${courseId}`),

  getSectionSummary: (sectionId: number) =>
    ApiClient.get<AttendanceSummary>(`/attendance/summary/${sectionId}`),

  getWeeklyTrends: (sectionId: number) =>
    ApiClient.get(`/attendance/trends/${sectionId}`),

  getSectionReport: (sectionId: number) =>
    ApiClient.get(`/attendance/report/${sectionId}`),

  // Import/Export
  importFromExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post('/attendance/import-excel', formData);
  },

  exportToExcel: (sessionId: number) =>
    ApiClient.get(`/attendance/export-excel/${sessionId}`),

  exportSectionToExcel: (sectionId: number) =>
    ApiClient.get(`/attendance/export-excel/section/${sectionId}`),

  // AI Photo
  uploadAIPhoto: (sessionId: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('sessionId', String(sessionId));
    return ApiClient.post('/attendance/ai-photo', formData);
  },

  getAIProcessingResult: (processingId: string) =>
    ApiClient.get(`/attendance/ai-photo/${processingId}`),
};
