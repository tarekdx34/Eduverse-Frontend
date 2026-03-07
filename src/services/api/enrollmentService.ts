import { ApiClient } from './client';

export interface EnrolledCourse {
  id: string;
  userId: number;
  sectionId: string;
  status: string;
  grade: string | null;
  finalScore: number | null;
  enrollmentDate: string;
  droppedAt: string | null;
  completedAt: string | null;
  canDrop: boolean;
  dropDeadline: string | null;
  course: {
    id: string;
    name: string;
    code: string;
    description: string;
    credits: number;
    level: string;
  };
  section: {
    id: string;
    sectionNumber: string;
    maxCapacity: number;
    currentEnrollment: number;
    location: string;
  };
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  prerequisites: unknown[];
}

export interface AvailableCourseSection {
  id: string;
  sectionNumber: string;
  maxCapacity: number;
  currentEnrollment: number;
  availableSeats: number;
  location: string;
  semesterId: string;
  semesterName: string;
}

export interface AvailableCoursePrerequisite {
  id: string;
  courseId: string;
  prerequisiteCourseId: string;
  courseCode: string;
  courseName: string;
  isMandatory: boolean;
}

export interface AvailableCourse {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  level: string;
  departmentId: string;
  departmentName: string;
  sections: AvailableCourseSection[];
  prerequisites: AvailableCoursePrerequisite[];
  canEnroll: boolean;
  enrollmentStatus: string;
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
