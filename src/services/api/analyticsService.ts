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

export interface AttendanceTrendPoint {
  date: string;
  averageAttendance: string;
  totalStudents: string;
  activeStudents: string;
}

export interface GradeDistributionPoint {
  grade: string;
  count: string;
}

export interface GradeDistributionData {
  distribution: GradeDistributionPoint[];
  stats?: {
    averageGrade?: string;
    totalStudents?: string;
  };
}

export interface AtRiskStudent {
  userId: number;
  courseId: number;
  userName: string | null;
  completionPercentage: number | null;
  averageScore: number | null;
  timeSpentMinutes: number | null;
  lastActivityAt: string | null;
}

export interface AtRiskStudentsData {
  atRiskCourses: Array<{
    courseId: string;
    averageGrade: string;
    averageAttendance: string;
  }>;
  atRiskStudents: AtRiskStudent[];
}

export class AnalyticsService {
  static async getDashboard(): Promise<AnalyticsDashboardData> {
    const response = await ApiClient.get<{ data: AnalyticsDashboardData }>('/analytics/dashboard');
    return response.data;
  }

  static async getAttendanceTrends(courseId: number): Promise<AttendanceTrendPoint[]> {
    const response = await ApiClient.get<{ data: AttendanceTrendPoint[] }>('/analytics/attendance-trends', {
      params: { courseId },
    });
    return response.data;
  }

  static async getGradeDistribution(courseId: number): Promise<GradeDistributionData> {
    const response = await ApiClient.get<{ data: GradeDistributionData }>('/analytics/grade-distribution', {
      params: { courseId },
    });
    return response.data;
  }

  static async getAtRiskStudents(courseId?: number): Promise<AtRiskStudentsData> {
    const response = await ApiClient.get<{ data: AtRiskStudentsData }>('/analytics/at-risk-students', {
      params: { courseId },
    });
    return response.data;
  }
}
