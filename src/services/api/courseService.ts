import { ApiClient } from './client';

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
}

export const courseService = {
  getAll: CourseService.getAll,
  getById: CourseService.getById,
  getMaterials: CourseService.getMaterials,
  getStructure: CourseService.getStructure,
  getCourseSections: CourseService.getCourseSections,
  getSectionSchedules: CourseService.getSectionSchedules,
};
