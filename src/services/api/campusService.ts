import { ApiClient } from './client';
import type { Campus, Department, Program } from '../../types/api';

export const campusService = {
  // Campuses
  listCampuses: () =>
    ApiClient.get<Campus[]>('/admin/campus'),

  getCampus: (id: number) =>
    ApiClient.get<Campus>(`/admin/campus/${id}`),

  createCampus: (data: Partial<Campus>) =>
    ApiClient.post<Campus>('/admin/campus', data),

  updateCampus: (id: number, data: Partial<Campus>) =>
    ApiClient.put<Campus>(`/admin/campus/${id}`, data),

  deleteCampus: (id: number) =>
    ApiClient.delete(`/admin/campus/${id}`),

  // Departments
  getDepartments: (campusId: number) =>
    ApiClient.get<Department[]>(`/admin/campus/campuses/${campusId}/departments`),

  getDepartment: (id: number) =>
    ApiClient.get<Department>(`/admin/campus/departments/${id}`),

  createDepartment: (data: Partial<Department>) =>
    ApiClient.post<Department>('/admin/campus/departments', data),

  updateDepartment: (id: number, data: Partial<Department>) =>
    ApiClient.put<Department>(`/admin/campus/departments/${id}`, data),

  deleteDepartment: (id: number) =>
    ApiClient.delete(`/admin/campus/departments/${id}`),

  // Programs
  getPrograms: (deptId: number) =>
    ApiClient.get<Program[]>(`/admin/campus/departments/${deptId}/programs`),

  getProgram: (id: number) =>
    ApiClient.get<Program>(`/admin/campus/programs/${id}`),

  createProgram: (data: Partial<Program>) =>
    ApiClient.post<Program>('/admin/campus/programs', data),

  updateProgram: (id: number, data: Partial<Program>) =>
    ApiClient.put<Program>(`/admin/campus/programs/${id}`, data),

  deleteProgram: (id: number) =>
    ApiClient.delete(`/admin/campus/programs/${id}`),
};
