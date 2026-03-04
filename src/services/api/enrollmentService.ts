import { ApiClient } from './client';
import type { Enrollment, Course } from '../../types/api';

export const enrollmentService = {
  // Student
  getMyEnrolledCourses: () =>
    ApiClient.get<Enrollment[]>('/enrollments/my-courses'),

  getAvailableCourses: () =>
    ApiClient.get<Course[]>('/enrollments/available'),

  registerForCourse: (sectionId: number) =>
    ApiClient.post<Enrollment>('/enrollments/register', { sectionId }),

  getEnrollment: (id: number) =>
    ApiClient.get<Enrollment>(`/enrollments/${id}`),

  dropCourse: (enrollmentId: number) =>
    ApiClient.delete(`/enrollments/${enrollmentId}`),

  // Instructor/Admin
  getCourseEnrollments: (courseId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/course/${courseId}/list`),

  getSectionStudents: (sectionId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/section/${sectionId}/students`),

  getSectionWaitlist: (sectionId: number) =>
    ApiClient.get<Enrollment[]>(`/enrollments/section/${sectionId}/waitlist`),

  updateEnrollmentStatus: (enrollmentId: number, status: string) =>
    ApiClient.post(`/enrollments/${enrollmentId}/status`, { status }),
};
