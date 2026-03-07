import { ApiClient } from './client';

export interface EnrolledCourse {
  enrollmentId: number;
  courseId: number;
  sectionId: number;
  courseName: string;
  courseCode: string;
  sectionNumber?: string;
  instructorName?: string;
  instructorImage?: string;
  schedule?: string;
  room?: string;
  credits: number;
  status: string;
  enrolledAt: string;
  grade?: string;
  // These may come from backend or be enriched client-side
  progress?: number;
  totalStudents?: number;
}

export interface AvailableCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  departmentId?: number;
  departmentName?: string;
  level?: string;
  prerequisites?: string[];
  sections: AvailableSection[];
}

export interface AvailableSection {
  sectionId: number;
  sectionNumber: string;
  instructorName: string;
  schedule: string;
  room: string;
  capacity: number;
  enrolledCount: number;
  status: 'open' | 'waitlist' | 'closed';
}

export interface EnrollRequest {
  sectionId: number;
}

export class EnrollmentService {
  static async getMyCourses(): Promise<EnrolledCourse[]> {
    const response = await ApiClient.get<EnrolledCourse[] | { data: EnrolledCourse[] }>('/enrollments/my-courses');
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getAvailableCourses(params?: { search?: string; departmentId?: number }): Promise<AvailableCourse[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    const qs = query.toString();
    const response = await ApiClient.get<AvailableCourse[] | { data: AvailableCourse[] }>(
      `/enrollments/available${qs ? `?${qs}` : ''}`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async register(data: EnrollRequest): Promise<unknown> {
    return ApiClient.post('/enrollments/register', data);
  }

  static async drop(enrollmentId: number): Promise<unknown> {
    return ApiClient.delete(`/enrollments/${enrollmentId}`);
  }

  static async getEnrollmentDetails(enrollmentId: number): Promise<EnrolledCourse> {
    return ApiClient.get(`/enrollments/${enrollmentId}`);
  }
}
