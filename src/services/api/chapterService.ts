import { ApiClient } from './client';

export interface CourseChapter {
  id: number;
  courseId: number;
  name: string;
  chapterOrder: number;
  isActive: number;
}

export class ChapterService {
  static async listByCourse(courseId: string | number): Promise<CourseChapter[]> {
    return ApiClient.get<CourseChapter[]>(`/courses/${courseId}/chapters`);
  }

  static async create(courseId: string | number, payload: { name: string }) {
    return ApiClient.post<CourseChapter>(`/courses/${courseId}/chapters`, payload);
  }

  static async update(courseId: string | number, chapterId: string | number, payload: { name: string }) {
    return ApiClient.patch<CourseChapter>(`/courses/${courseId}/chapters/${chapterId}`, payload);
  }

  static async delete(courseId: string | number, chapterId: string | number) {
    return ApiClient.delete(`/courses/${courseId}/chapters/${chapterId}`);
  }
}

export default ChapterService;

