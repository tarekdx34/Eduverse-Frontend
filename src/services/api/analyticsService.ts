import { ApiClient } from './client';

export interface AnalyticsDashboardData {
  totalCourses: string;
  totalStudents: string;
  averageGrade: string;
  averageAttendance: string;
  averageCompletionRate: string;
  averageEngagement: string;
  courseBreakdown?: CourseAnalytics[];
}

export interface CourseAnalytics {
  id: number;
  courseId: number;
  instructorId: number;
  totalStudents: number;
  activeStudents: number;
  averageGrade: number;
  averageAttendance: number;
  completionRate: number;
  engagementScore: number;
  calculationDate: string;
}

export interface AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AnalyticsService {
  static async getDashboard(): Promise<AnalyticsDashboardData> {
    const response = await ApiClient.get<{ data: AnalyticsDashboardData }>('/analytics/dashboard');
    return response.data;
  }

  static async getPerformanceMetrics(courseId: number, query?: AnalyticsQueryDto): Promise<PaginatedResponse<any>> {
    const response = await ApiClient.get<{ data: any, meta: any }>(`/analytics/performance`, { courseId, ...query });
    return { data: response.data, meta: response.meta };
  }

  static async getEngagement(courseId: number, query?: AnalyticsQueryDto): Promise<PaginatedResponse<any> & { summary: any }> {
    const response = await ApiClient.get<any>(`/analytics/engagement`, { courseId, ...query });
    return response;
  }

  static async getAttendanceTrends(courseId: number, query?: AnalyticsQueryDto): Promise<PaginatedResponse<any>> {
    const response = await ApiClient.get<any>(`/analytics/attendance-trends`, { courseId, ...query });
    return response;
  }

  static async getAtRiskStudents(courseId?: number): Promise<{ atRiskCourses: any[], atRiskStudents: any[] }> {
    const response = await ApiClient.get<{ data: { atRiskCourses: any[], atRiskStudents: any[] } }>(`/analytics/at-risk-students`, courseId ? { courseId } : undefined);
    return response.data;
  }

  static async getCourseComparison(courseIds: number[]): Promise<{ data: CourseAnalytics[] }> {
    const response = await ApiClient.get<{ data: CourseAnalytics[] }>(`/analytics/course-comparison`, { courseIds: courseIds.join(',') });
    return response;
  }
}
