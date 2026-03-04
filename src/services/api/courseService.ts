import { ApiClient } from './client';
import type { Course, CourseSection, CourseSchedule, CoursePrerequisite } from '../../types/api';

export const courseService = {
  // Courses
  listCourses: (params?: { page?: number; limit?: number }) =>
    ApiClient.get<Course[]>('/courses', params),

  getCourse: (id: number) =>
    ApiClient.get<Course>(`/courses/${id}`),

  getCoursesByDepartment: (deptId: number) =>
    ApiClient.get<Course[]>(`/courses/department/${deptId}`),

  createCourse: (data: Partial<Course>) =>
    ApiClient.post<Course>('/courses', data),

  updateCourse: (id: number, data: Partial<Course>) =>
    ApiClient.patch<Course>(`/courses/${id}`, data),

  deleteCourse: (id: number) =>
    ApiClient.delete(`/courses/${id}`),

  // Prerequisites
  getPrerequisites: (courseId: number) =>
    ApiClient.get<CoursePrerequisite[]>(`/courses/${courseId}/prerequisites`),

  addPrerequisite: (courseId: number, prereqCourseId: number) =>
    ApiClient.post(`/courses/${courseId}/prerequisites`, { prerequisiteCourseId: prereqCourseId }),

  removePrerequisite: (courseId: number, prereqId: number) =>
    ApiClient.delete(`/courses/${courseId}/prerequisites/${prereqId}`),

  // Sections
  getSectionsByCourse: (courseId: number) =>
    ApiClient.get<CourseSection[]>(`/courses/course/${courseId}`),

  getSection: (id: number) =>
    ApiClient.get<CourseSection>(`/courses/${id}`),

  createSection: (data: Partial<CourseSection>) =>
    ApiClient.post<CourseSection>('/courses', data),

  updateSection: (id: number, data: Partial<CourseSection>) =>
    ApiClient.patch<CourseSection>(`/courses/${id}`, data),

  updateSectionEnrollment: (id: number, data: { currentEnrollment: number }) =>
    ApiClient.patch(`/courses/${id}/enrollment`, data),

  // Schedules
  getSchedulesBySection: (sectionId: number) =>
    ApiClient.get<CourseSchedule[]>(`/courses/section/${sectionId}`),

  createSchedule: (sectionId: number, data: Partial<CourseSchedule>) =>
    ApiClient.post<CourseSchedule>(`/courses/section/${sectionId}`, data),

  deleteSchedule: (id: number) =>
    ApiClient.delete(`/courses/${id}`),
};
