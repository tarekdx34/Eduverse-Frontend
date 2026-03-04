import { ApiClient } from './client';
import type { Grade, GPA, Transcript, GradeDistribution, Rubric } from '../../types/api';

export const gradeService = {
  // Student
  getMyGrades: () =>
    ApiClient.get<Grade[]>('/grades/my'),

  getTranscript: (studentId: number) =>
    ApiClient.get<Transcript>(`/grades/transcript/${studentId}`),

  getGPA: (studentId: number) =>
    ApiClient.get<GPA>(`/grades/gpa/${studentId}`),

  // Instructor/TA/Admin
  listAllGrades: (params?: { courseId?: number }) =>
    ApiClient.get<Grade[]>('/grades', params),

  getDistribution: (courseId: number) =>
    ApiClient.get<GradeDistribution>(`/grades/distribution/${courseId}`),

  updateGrade: (gradeId: number, data: { numericGrade?: number; letterGrade?: string }) =>
    ApiClient.put<Grade>(`/grades/${gradeId}`, data),

  finalizeGrade: (gradeId: number) =>
    ApiClient.patch(`/grades/${gradeId}/finalize`, {}),

  // Rubrics
  listRubrics: () =>
    ApiClient.get<Rubric[]>('/grades'),

  createRubric: (data: Partial<Rubric>) =>
    ApiClient.post<Rubric>('/grades', data),

  updateRubric: (id: number, data: Partial<Rubric>) =>
    ApiClient.put<Rubric>(`/grades/${id}`, data),

  deleteRubric: (id: number) =>
    ApiClient.delete(`/grades/${id}`),
};
