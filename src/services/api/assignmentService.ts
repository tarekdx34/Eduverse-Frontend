import { ApiClient } from './client';
import type { Assignment, Submission } from '../../types/api';

export const assignmentService = {
  // List & Get
  listAssignments: (params?: { courseId?: number; status?: string }) =>
    ApiClient.get<Assignment[]>('/assignments', params),

  getAssignment: (id: number) =>
    ApiClient.get<Assignment>(`/assignments/${id}`),

  // Instructor CRUD
  createAssignment: (data: Partial<Assignment>) =>
    ApiClient.post<Assignment>('/assignments', data),

  updateAssignment: (id: number, data: Partial<Assignment>) =>
    ApiClient.patch<Assignment>(`/assignments/${id}`, data),

  deleteAssignment: (id: number) =>
    ApiClient.delete(`/assignments/${id}`),

  changeStatus: (id: number, status: string) =>
    ApiClient.patch(`/assignments/${id}/status`, { status }),

  // Student submissions
  submitAssignment: (assignmentId: number, data: FormData) =>
    ApiClient.post<Submission>(`/assignments/${assignmentId}/submit`, data),

  getMySubmission: (assignmentId: number) =>
    ApiClient.get<Submission>(`/assignments/${assignmentId}/submissions/my`),

  // Instructor/TA grading
  listSubmissions: (assignmentId: number) =>
    ApiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions`),

  gradeSubmission: (assignmentId: number, submissionId: number, data: { grade: number; feedback?: string }) =>
    ApiClient.patch(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
};
