import axios from 'axios';
import { ApiClient } from './client';
import { TOKEN_KEYS } from './config';

type PaginatedResponse<T> = {
  data?: T[];
  total?: number;
};

const extractArray = <T>(payload: T[] | PaginatedResponse<T> | null | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  departmentId?: number;
  departmentName?: string;
  level?: string;
  status?: string;
  prerequisites?: { courseId: number; courseCode: string; courseName: string }[];
}

export interface CourseMaterial {
  materialId: string;
  courseId: string;
  course?: {
    id: string;
    name: string;
    code: string;
    credits: number;
    level: string;
  } | null;
  fileId?: string | null;
  file?: unknown | null;
  driveFileId?: string | null;
  materialType: 'document' | 'video' | 'lecture' | 'slide' | 'reading' | 'link' | 'other';
  title: string;
  description?: string;
  externalUrl?: string | null;
  driveViewUrl?: string | null;
  driveDownloadUrl?: string | null;
  fileName?: string | null;
  youtubeVideoId?: string | null;
  orderIndex?: number;
  weekNumber?: number | null;
  viewCount?: number;
  downloadCount?: number;
  uploadedBy?: number;
  uploader?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  isPublished: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseStructure {
  organizationId: string;
  courseId: string;
  materialId: string | null;
  material: CourseMaterial | null;
  organizationType: 'lecture' | 'lab' | 'section' | 'tutorial';
  title: string;
  weekNumber: number;
  orderIndex: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseMaterialsResponse {
  data: CourseMaterial[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CourseStructureResponse {
  data: CourseStructure[];
  byWeek: Record<string, CourseStructure[]>;
}

export interface SectionSchedule {
  id: string;
  sectionId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string | null;
  scheduleType: string;
  createdAt?: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  semesterId: string;
  sectionNumber: string;
  maxCapacity: number;
  currentEnrollment: number;
  location: string;
  status: string;
  course: {
    id: string;
    name: string;
    code: string;
    credits: number;
    level: string;
  };
  semester: {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  schedules: SectionSchedule[];
}

export class CourseService {
  static async getAll(params?: {
    search?: string;
    departmentId?: number;
    page?: number;
    limit?: number;
  }): Promise<Course[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const response = await ApiClient.get<Course[] | { data: Course[] }>(
      `/courses${qs ? `?${qs}` : ''}`
    );
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async getById(id: number): Promise<Course> {
    return ApiClient.get(`/courses/${id}`);
  }

  static async getMaterials(courseId: number): Promise<CourseMaterial[]> {
    const response = await ApiClient.get<CourseMaterialsResponse | CourseMaterial[]>(
      `/courses/${courseId}/materials`
    );
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async getStructure(courseId: number): Promise<CourseStructure[]> {
    const response = await ApiClient.get<CourseStructureResponse | CourseStructure[]>(
      `/courses/${courseId}/structure`
    );
    return Array.isArray(response) ? response : (response.data ?? []);
  }

  static async getCourseSections(courseId: string): Promise<CourseSection[]> {
    const response = await ApiClient.get<CourseSection[] | PaginatedResponse<CourseSection>>(
      `/sections/course/${courseId}`
    );
    return extractArray(response);
  }

  static async getSectionSchedules(sectionId: string): Promise<SectionSchedule[]> {
    const response = await ApiClient.get<SectionSchedule[] | PaginatedResponse<SectionSchedule>>(
      `/schedules/section/${sectionId}`
    );
    return extractArray(response);
  }

  static async createMaterial(courseId: number, data: any): Promise<CourseMaterial> {
    const response = await ApiClient.post<{ data: CourseMaterial }>(
      `/courses/${courseId}/materials`,
      data
    );
    return response.data;
  }

  static async uploadDocument(courseId: number, formData: FormData): Promise<CourseMaterial> {
    const response = await ApiClient.post<{ data: CourseMaterial }>(
      `/courses/${courseId}/materials/document`,
      formData
    );
    return response.data;
  }

  static async create(data: any): Promise<Course> {
    const response = await ApiClient.post<{ data: Course }>('/courses', data);
    return response.data;
  }

  static async update(id: number, data: any): Promise<Course> {
    const response = await ApiClient.patch<{ data: Course }>(`/courses/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await ApiClient.delete(`/courses/${id}`);
  }
}

type MaterialQueryParams = {
  materialType?: string;
  weekNumber?: number;
  page?: number;
  limit?: number;
  search?: string;
};

const normalizeApiBase = (base: string): string => {
  const trimmed = (base || 'http://localhost:8081').replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const extractGoogleDriveId = (url: string): string | null => {
  const fromPath = url.match(/\/d\/([^/]+)/i)?.[1];
  if (fromPath) return fromPath;
  const fromQuery = url.match(/[?&]id=([^&]+)/i)?.[1];
  return fromQuery || null;
};

const extractYouTubeVideoId = (url: string): string | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/i)?.[1];
  if (watchMatch) return watchMatch;

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/i)?.[1];
  if (shortMatch) return shortMatch;

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i)?.[1];
  if (embedMatch) return embedMatch;

  return null;
};

const toPreviewUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const videoId = extractYouTubeVideoId(trimmed);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
  }
  if (!trimmed.includes('drive.google.com')) return trimmed;
  if (trimmed.includes('/preview')) return trimmed;

  const driveId = extractGoogleDriveId(trimmed);
  if (!driveId) return trimmed;
  return `https://drive.google.com/file/d/${driveId}/preview`;
};

export const getCourseMaterialPreviewUrl = (material: CourseMaterial): string | null => {
  const candidates = [material.externalUrl, material.driveViewUrl, material.driveDownloadUrl].filter(
    Boolean
  ) as string[];
  const firstCandidate = candidates.find((value) => value.trim().length > 0);
  if (firstCandidate) return toPreviewUrl(firstCandidate);

  if (material.driveFileId) {
    return `https://drive.google.com/file/d/${material.driveFileId}/preview`;
  }

  return null;
};

export const materialService = {
  getMaterials: (courseId: string, params?: MaterialQueryParams) =>
    ApiClient.get<CourseMaterialsResponse>(`/courses/${courseId}/materials`, { params }),

  getMaterial: (courseId: string, materialId: string) =>
    ApiClient.get<CourseMaterial>(`/courses/${courseId}/materials/${materialId}`),

  createMaterial: (
    courseId: string,
    data: {
      title: string;
      materialType: string;
      description?: string;
      weekNumber?: number;
      isPublished?: boolean;
      externalUrl?: string;
    }
  ) => ApiClient.post<CourseMaterial>(`/courses/${courseId}/materials`, data),

  uploadDocument: (courseId: string, formData: FormData) =>
    ApiClient.post<CourseMaterial>(`/courses/${courseId}/materials/document`, formData),

  updateMaterial: (courseId: string, materialId: string, data: unknown) =>
    ApiClient.put<CourseMaterial>(`/courses/${courseId}/materials/${materialId}`, data),

  deleteMaterial: (courseId: string, materialId: string) =>
    ApiClient.delete<{ message: string }>(`/courses/${courseId}/materials/${materialId}`),

  toggleVisibility: (courseId: string, materialId: string, isPublished: boolean) =>
    ApiClient.patch<CourseMaterial>(`/courses/${courseId}/materials/${materialId}/visibility`, {
      isPublished,
    }),

  trackView: (courseId: string, materialId: string) =>
    ApiClient.post<{ message: string; materialId: string; viewCount: number }>(
      `/courses/${courseId}/materials/${materialId}/view`
    ),

  getEmbed: (courseId: string, materialId: string) =>
    ApiClient.get<{ videoId: string; embedUrl: string; iframeHtml: string }>(
      `/courses/${courseId}/materials/${materialId}/embed`
    ),

  getDownloadUrl: (courseId: string, materialId: string) => {
    const base = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');
    return `${base}/courses/${courseId}/materials/${materialId}/download`;
  },

  uploadVideo: async (
    courseId: string,
    file: File,
    metadata: {
      title: string;
      description?: string;
      weekNumber?: number;
      orderIndex?: number;
      isPublished?: boolean;
      tags?: string;
    },
    onProgress?: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('video', file); // field name MUST be "video"
    formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.weekNumber !== undefined)
      formData.append('weekNumber', String(metadata.weekNumber));
    if (metadata.orderIndex !== undefined)
      formData.append('orderIndex', String(metadata.orderIndex));
    if (metadata.isPublished !== undefined)
      formData.append('isPublished', String(metadata.isPublished));
    if (metadata.tags) formData.append('tags', metadata.tags);

    const base = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const response = await axios.post(`${base}/courses/${courseId}/materials/video`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },

  uploadFile: async (
    courseId: string,
    file: File,
    metadata: {
      title: string;
      materialType: 'document' | 'lecture' | 'slide' | 'reading';
      description?: string;
      weekNumber?: number;
      isPublished?: boolean;
    },
    onProgress?: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', metadata.title);
    formData.append('materialType', metadata.materialType);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.weekNumber !== undefined)
      formData.append('weekNumber', String(metadata.weekNumber));
    if (metadata.isPublished !== undefined)
      formData.append('isPublished', String(metadata.isPublished));

    const base = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const response = await axios.post(`${base}/courses/${courseId}/materials/document`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },

  getYouTubeAuthUrl: () => ApiClient.get<{ authUrl: string }>('/youtube/auth'),

  getGoogleDriveAuthUrl: () =>
    ApiClient.get<{ authUrl: string; scopes: string[]; instructions: string }>(
      '/google-drive/auth'
    ),
};

export const structureService = {
  getStructure: (courseId: string) =>
    ApiClient.get<CourseStructureResponse>(`/courses/${courseId}/structure`),

  createStructureItem: (
    courseId: string,
    data: {
      title: string;
      organizationType: string;
      weekNumber: number;
      orderIndex?: number;
      description?: string;
    }
  ) => ApiClient.post<CourseStructure>(`/courses/${courseId}/structure`, data),

  updateStructureItem: (courseId: string, organizationId: string, data: unknown) =>
    ApiClient.put<CourseStructure>(`/courses/${courseId}/structure/${organizationId}`, data),

  deleteStructureItem: (courseId: string, organizationId: string) =>
    ApiClient.delete<{ message: string }>(`/courses/${courseId}/structure/${organizationId}`),

  reorderStructure: (courseId: string, orderIds: number[]) =>
    ApiClient.patch<{ message: string }>(`/courses/${courseId}/structure/reorder`, { orderIds }),
};

export const courseService = {
  getAll: CourseService.getAll,
  getById: CourseService.getById,
  getMaterials: CourseService.getMaterials,
  createMaterial: CourseService.createMaterial,
  uploadDocument: CourseService.uploadDocument,
  getStructure: CourseService.getStructure,
  getCourseSections: CourseService.getCourseSections,
  getSectionSchedules: CourseService.getSectionSchedules,
  materialService,
  structureService,
};
