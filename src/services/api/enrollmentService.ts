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
  // Student information (if included by backend)
  studentName?: string;
  studentEmail?: string;
  fullName?: string;
  email?: string;
  userName?: string;
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

export interface SectionInstructorSummary {
  userId: number;
  fullName: string;
  email: string;
}

export interface SectionInstructorSummaryResponse {
  instructorId: number | null;
  instructor: SectionInstructorSummary | null;
}

export interface SectionTaSummary {
  userId: number;
  fullName: string;
  email: string;
}

export interface SectionStaffMember {
  id: number;
  fullName: string;
  email: string;
  role: 'INSTRUCTOR' | 'TA';
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

  getSectionInstructor: (sectionId: string | number): Promise<SectionInstructorSummaryResponse> =>
    ApiClient.get<SectionInstructorSummaryResponse>(
      `/enrollments/section/${String(sectionId)}/instructor`
    ),

  getSectionTAs: async (sectionId: string | number): Promise<SectionTaSummary[]> => {
    const response = await ApiClient.get<SectionTaSummary[] | PaginatedResponse<SectionTaSummary>>(
      `/enrollments/section/${String(sectionId)}/tas`
    );
    return extractArray(response);
  },

  getSectionStaffMembers: async (sectionId: string | number): Promise<SectionStaffMember[]> => {
    const [instructorResponse, tas] = await Promise.all([
      enrollmentService.getSectionInstructor(sectionId),
      enrollmentService.getSectionTAs(sectionId),
    ]);

    const members: SectionStaffMember[] = [];

    if (instructorResponse?.instructor?.userId) {
      members.push({
        id: instructorResponse.instructor.userId,
        fullName: instructorResponse.instructor.fullName,
        email: instructorResponse.instructor.email,
        role: 'INSTRUCTOR',
      });
    }

    members.push(
      ...(tas || []).map((ta) => ({
        id: ta.userId,
        fullName: ta.fullName,
        email: ta.email,
        role: 'TA' as const,
      }))
    );

    return members;
  },

  assignInstructor: (sectionId: number, instructorId: number): Promise<unknown> =>
    ApiClient.post('/enrollments/assign-instructor', { sectionId, instructorId }),

  assignTA: (sectionId: number, userId: number): Promise<unknown> =>
    ApiClient.post('/enrollments/assign-ta', { sectionId, userId }),

  getTeachingCourses: (): Promise<unknown[]> => ApiClient.get('/enrollments/teaching'),
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
  static getSectionStaffMembers = enrollmentService.getSectionStaffMembers;
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
