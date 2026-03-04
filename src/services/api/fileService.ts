import { ApiClient } from './client';
import type { FileItem, FileVersion, Folder } from '../../types/api';

export const fileService = {
  // Upload
  uploadFile: (file: File, folderId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', String(folderId));
    return ApiClient.post<FileItem>('/files/upload', formData);
  },

  // Search & Browse
  searchFiles: (query: string) =>
    ApiClient.get<FileItem[]>('/files/search', { q: query }),

  getRecentFiles: () =>
    ApiClient.get<FileItem[]>('/files/recent'),

  getSharedFiles: () =>
    ApiClient.get<FileItem[]>('/files/shared'),

  // File operations
  getFile: (fileId: number) =>
    ApiClient.get<FileItem>(`/files/${fileId}`),

  downloadFile: (fileId: number) =>
    ApiClient.get(`/files/${fileId}/download`),

  updateFile: (fileId: number, data: Partial<FileItem>) =>
    ApiClient.put(`/files/${fileId}`, data),

  deleteFile: (fileId: number) =>
    ApiClient.delete(`/files/${fileId}`),

  // Versions
  createVersion: (fileId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post<FileVersion>(`/files/${fileId}/versions`, formData);
  },

  getVersions: (fileId: number) =>
    ApiClient.get<FileVersion[]>(`/files/${fileId}/versions`),

  downloadVersion: (fileId: number, versionId: number) =>
    ApiClient.get(`/files/${fileId}/versions/${versionId}/download`),

  // Permissions
  getPermissions: (fileId: number) =>
    ApiClient.get(`/files/${fileId}/permissions`),

  grantPermission: (fileId: number, data: { userId: number; permission: string }) =>
    ApiClient.post(`/files/${fileId}/permissions`, data),

  revokePermission: (fileId: number, permissionId: number) =>
    ApiClient.delete(`/files/${fileId}/permissions/${permissionId}`),

  // Folders
  createFolder: (data: { name: string; parentId?: number }) =>
    ApiClient.post<Folder>('/files', data),

  getFolder: (folderId: number) =>
    ApiClient.get<Folder>(`/files/${folderId}`),

  getFolderChildren: (folderId: number) =>
    ApiClient.get(`/files/${folderId}/children`),

  getFolderTree: (folderId: number) =>
    ApiClient.get(`/files/${folderId}/tree`),

  updateFolder: (folderId: number, data: { name: string }) =>
    ApiClient.put(`/files/${folderId}`, data),

  deleteFolder: (folderId: number) =>
    ApiClient.delete(`/files/${folderId}`),
};
