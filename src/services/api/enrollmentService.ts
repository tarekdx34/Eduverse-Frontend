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

export interface EnrolledCourse {
  id: string;
  userId: number;
  sectionId: string;
  status: string;
  grade: string | null;
  finalScore: number | null;
  enrollmentDate: string;
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

export interface AvailableCourse {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  level: string;
  departmentId: string;
  departmentName: string;
  canEnroll: boolean;
  enrollmentStatus: 'enrolled' | 'not_enrolled' | 'waitlisted';
  prerequisites: unknown[];
  sections: AvailableCourseSection[];
}

export interface SectionInstructor {
  instructorId: number | null;
  instructor?: {
    userId: number;
    fullName: string;
    email: string;
  } | null;
}

export interface SectionTa {
  userId: number;
  fullName: string;
  email: string;
}

export interface TeachingCourse {
  sectionId: number;
  courseId: number;
  course: {
    id: number;
    name: string;
    code: string;
    description: string;
    credits: number;
    level: string;
  };
  section: {
    id: number;
    sectionNumber: string;
    maxCapacity: number;
    currentEnrollment: number;
    location: string;
  };
  semester: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
}

export const enrollmentService = {
  getMyCourses: async (): Promise<EnrolledCourse[]> => {
    const response = await ApiClient.get<EnrolledCourse[] | PaginatedResponse<EnrolledCourse>>(
      '/enrollments/my-courses'
    );
    return extractArray(response);
  },

  getAvailableCourses: async (): Promise<AvailableCourse[]> => {
    const response = await ApiClient.get<AvailableCourse[] | PaginatedResponse<AvailableCourse>>(
      '/enrollments/available'
    );
    return extractArray(response);
  },

  enrollInSection: (sectionId: number): Promise<EnrolledCourse> =>
    ApiClient.post<EnrolledCourse>('/enrollments/register', { sectionId }),

  dropCourse: (enrollmentId: string): Promise<{ message?: string }> =>
    ApiClient.delete<{ message?: string }>(`/enrollments/${enrollmentId}`),

  getSectionStudents: async (sectionId: string | number): Promise<EnrolledCourse[]> => {
    const response = await ApiClient.get<EnrolledCourse[] | PaginatedResponse<EnrolledCourse>>(
      `/enrollments/section/${String(sectionId)}/students`
    );
    return extractArray(response);
  },

  getSectionWaitlist: async (sectionId: string | number): Promise<EnrolledCourse[]> => {
    const response = await ApiClient.get<EnrolledCourse[] | PaginatedResponse<EnrolledCourse>>(
      `/enrollments/section/${String(sectionId)}/waitlist`
    );
    return extractArray(response);
  },

  getSectionInstructor: (sectionId: string | number): Promise<SectionInstructor | null> =>
    ApiClient.get<SectionInstructor | null>(`/enrollments/section/${String(sectionId)}/instructor`),

  getSectionTAs: async (sectionId: string | number): Promise<SectionTa[]> => {
    const response = await ApiClient.get<SectionTa[] | PaginatedResponse<SectionTa>>(
      `/enrollments/section/${String(sectionId)}/tas`
    );
    return extractArray(response);
  },

  assignInstructor: (sectionId: number, instructorId: number): Promise<unknown> =>
    ApiClient.post('/enrollments/assign-instructor', { sectionId, instructorId }),

  assignTA: (sectionId: number, userId: number): Promise<unknown> =>
    ApiClient.post('/enrollments/assign-ta', { sectionId, userId }),

  getTeachingCourses: (): Promise<TeachingCourse[]> => ApiClient.get('/enrollments/teaching'),
};

export class EnrollmentService {
  static getMyCourses = enrollmentService.getMyCourses;
  static getAvailableCourses = enrollmentService.getAvailableCourses;
  static enrollInSection = enrollmentService.enrollInSection;
  static dropCourse = enrollmentService.dropCourse;
  static getSectionStudents = enrollmentService.getSectionStudents;
  static getSectionWaitlist = enrollmentService.getSectionWaitlist;
  static getSectionInstructor = enrollmentService.getSectionInstructor;
  static getSectionTAs = enrollmentService.getSectionTAs;
  static assignInstructor = enrollmentService.assignInstructor;
  static assignTA = enrollmentService.assignTA;
  static getTeachingCourses = enrollmentService.getTeachingCourses;

  static register(data: { sectionId: number }): Promise<EnrolledCourse> {
    return enrollmentService.enrollInSection(data.sectionId);
  }

  static drop(enrollmentId: number | string): Promise<{ message?: string }> {
    return enrollmentService.dropCourse(String(enrollmentId));
  }

  static getEnrollmentDetails(enrollmentId: number | string): Promise<EnrolledCourse> {
    return ApiClient.get(`/enrollments/${enrollmentId}`);
  }
}
