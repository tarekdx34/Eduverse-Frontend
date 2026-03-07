import { ApiClient } from './client';

export interface ScheduleItem {
  scheduleId?: number;
  courseId: number;
  sectionId: number;
  courseName: string;
  courseCode: string;
  instructorName: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  type?: string;
}

export interface AcademicEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
}

export class ScheduleService {
  static async getDaily(date?: string): Promise<ScheduleItem[]> {
    const query = date ? `?date=${date}` : '';
    const response = await ApiClient.get<ScheduleItem[] | { data: ScheduleItem[] }>(`/schedule/my/daily${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getWeekly(date?: string): Promise<ScheduleItem[]> {
    const query = date ? `?date=${date}` : '';
    const response = await ApiClient.get<ScheduleItem[] | { data: ScheduleItem[] }>(`/schedule/my/weekly${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getRange(startDate: string, endDate: string): Promise<ScheduleItem[]> {
    const response = await ApiClient.get<ScheduleItem[] | { data: ScheduleItem[] }>(
      `/schedule/range?startDate=${startDate}&endDate=${endDate}`
    );
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getAcademicCalendar(): Promise<AcademicEvent[]> {
    const response = await ApiClient.get<AcademicEvent[] | { data: AcademicEvent[] }>('/schedule/academic');
    return Array.isArray(response) ? response : response.data ?? [];
  }
}
