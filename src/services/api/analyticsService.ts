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

export class AnalyticsService {
  static async getDashboard(): Promise<AnalyticsDashboardData> {
    const response = await ApiClient.get<{ data: AnalyticsDashboardData }>('/analytics/dashboard');
    return response.data;
  }
}
