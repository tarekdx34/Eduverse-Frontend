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

  static async create(courseId: string | number, payload: { name: string; chapterOrder: number }) {
    return ApiClient.post<CourseChapter>(`/courses/${courseId}/chapters`, payload);
  }
}

export default ChapterService;

