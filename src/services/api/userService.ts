import { ApiClient } from './client';
import type { User, Role, Permission, PaginatedResponse } from '../../types/api';

export const userService = {
  // Users
  listUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    ApiClient.get<PaginatedResponse<User>>('/admin/users', params),

  getUser: (id: number) =>
    ApiClient.get<User>(`/admin/users/${id}`),

  updateUser: (id: number, data: Partial<User>) =>
    ApiClient.put<User>(`/admin/users/${id}`, data),

  deleteUser: (id: number) =>
    ApiClient.delete(`/admin/users/${id}`),

  updateUserStatus: (id: number, status: string) =>
    ApiClient.put(`/admin/users/${id}/status`, { status }),

  searchUsers: (query: string) =>
    ApiClient.get<User[]>('/admin/users/search', { q: query }),

  // Role assignment
  assignRole: (userId: number, roleId: number) =>
    ApiClient.post(`/admin/users/${userId}/roles`, { roleId }),

  removeRole: (userId: number, roleId: number) =>
    ApiClient.delete(`/admin/users/${userId}/roles/${roleId}`),

  getUserPermissions: (userId: number) =>
    ApiClient.get<Permission[]>(`/admin/users/${userId}/permissions`),

  // Role CRUD
  listRoles: () =>
    ApiClient.get<Role[]>('/admin/roles'),

  getRole: (id: number) =>
    ApiClient.get<Role>(`/admin/roles/${id}`),

  createRole: (data: Partial<Role>) =>
    ApiClient.post<Role>('/admin/roles', data),

  updateRole: (id: number, data: Partial<Role>) =>
    ApiClient.put<Role>(`/admin/roles/${id}`, data),

  deleteRole: (id: number) =>
    ApiClient.delete(`/admin/roles/${id}`),

  addPermissionToRole: (roleId: number, permissionId: number) =>
    ApiClient.post(`/admin/roles/${roleId}/permissions`, { permissionId }),

  removePermissionFromRole: (roleId: number, permissionId: number) =>
    ApiClient.delete(`/admin/roles/${roleId}/permissions/${permissionId}`),

  // Permission CRUD
  listPermissions: () =>
    ApiClient.get<Permission[]>('/admin/permissions'),

  getPermissionsByModule: (module: string) =>
    ApiClient.get<Permission[]>(`/admin/permissions/module/${module}`),

  createPermission: (data: Partial<Permission>) =>
    ApiClient.post<Permission>('/admin/permissions', data),

  updatePermission: (id: number, data: Partial<Permission>) =>
    ApiClient.put<Permission>(`/admin/permissions/${id}`, data),

  deletePermission: (id: number) =>
    ApiClient.delete(`/admin/permissions/${id}`),
};
