import { ApiClient } from './client';

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
  materialId: number;
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  embedUrl?: string;
  orderNumber?: number;
  isVisible: boolean;
  createdAt: string;
}

export interface CourseStructure {
  structureId: number;
  title: string;
  type: string;
  orderNumber: number;
  materials?: CourseMaterial[];
}

export class CourseService {
  static async getAll(params?: { search?: string; departmentId?: number; page?: number; limit?: number }): Promise<Course[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const response = await ApiClient.get<Course[] | { data: Course[] }>(`/courses${qs ? `?${qs}` : ''}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getById(id: number): Promise<Course> {
    return ApiClient.get(`/courses/${id}`);
  }

  static async getMaterials(courseId: number): Promise<CourseMaterial[]> {
    const response = await ApiClient.get<CourseMaterial[] | { data: CourseMaterial[] }>(
      `/courses/${courseId}/materials`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getStructure(courseId: number): Promise<CourseStructure[]> {
    const response = await ApiClient.get<CourseStructure[] | { data: CourseStructure[] }>(
      `/courses/${courseId}/structure`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }
}
