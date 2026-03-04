import { ApiClient } from './client';
import type { Semester } from '../../types/api';

export const semesterService = {
  listSemesters: () =>
    ApiClient.get<Semester[]>('/admin/campus'),

  getCurrentSemester: () =>
    ApiClient.get<Semester>('/admin/campus/current'),

  createSemester: (data: Partial<Semester>) =>
    ApiClient.post<Semester>('/admin/campus', data),

  updateSemester: (id: number, data: Partial<Semester>) =>
    ApiClient.put<Semester>(`/admin/campus/${id}`, data),

  deleteSemester: (id: number) =>
    ApiClient.delete(`/admin/campus/${id}`),
};
