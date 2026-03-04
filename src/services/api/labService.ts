import { ApiClient } from './client';
import type { Lab, LabInstruction, LabSubmission } from '../../types/api';

export const labService = {
  listLabs: (params?: { courseId?: number }) =>
    ApiClient.get<Lab[]>('/labs', params),

  getLab: (id: number) =>
    ApiClient.get<Lab>(`/labs/${id}`),

  createLab: (data: Partial<Lab>) =>
    ApiClient.post<Lab>('/labs', data),

  updateLab: (id: number, data: Partial<Lab>) =>
    ApiClient.put<Lab>(`/labs/${id}`, data),

  deleteLab: (id: number) =>
    ApiClient.delete(`/labs/${id}`),

  // Instructions
  getInstructions: (labId: number) =>
    ApiClient.get<LabInstruction[]>(`/labs/${labId}/instructions`),

  addInstruction: (labId: number, data: Partial<LabInstruction>) =>
    ApiClient.post(`/labs/${labId}/instructions`, data),

  // Submissions
  submitLab: (labId: number, data: FormData) =>
    ApiClient.post<LabSubmission>(`/labs/${labId}/submit`, data),

  getMySubmission: (labId: number) =>
    ApiClient.get<LabSubmission>(`/labs/${labId}/submissions/my`),

  listSubmissions: (labId: number) =>
    ApiClient.get<LabSubmission[]>(`/labs/${labId}/submissions`),

  gradeSubmission: (labId: number, submissionId: number, data: { grade: number; feedback?: string }) =>
    ApiClient.patch(`/labs/${labId}/submissions/${submissionId}/grade`, data),

  // Lab Attendance
  markLabAttendance: (labId: number, records: { studentId: number; status: string }[]) =>
    ApiClient.post(`/labs/${labId}/attendance`, { records }),

  getLabAttendance: (labId: number) =>
    ApiClient.get(`/labs/${labId}/attendance`),
};
