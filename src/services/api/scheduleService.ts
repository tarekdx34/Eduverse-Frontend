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

export interface WeeklyDaySchedule {
  date: string;
  dayOfWeek: string;
  schedules: ScheduleItem[];
  events: unknown[];
  exams: unknown[];
}

export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  days: WeeklyDaySchedule[];
}

export interface AcademicEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  eventType: 'lecture' | 'lab' | 'exam' | 'assignment' | 'quiz' | 'meeting' | 'custom';
  startTime: string;
  endTime: string;
  location?: string;
  color?: string;
  courseId?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export class ScheduleService {
  static async getDaily(date?: string): Promise<ScheduleItem[]> {
    const query = date ? `?date=${date}` : '';
    const response = await ApiClient.get<ScheduleItem[] | { data: ScheduleItem[] }>(`/schedule/my/daily${query}`);
    return Array.isArray(response) ? response : response.data ?? [];
  }

  static async getWeekly(date?: string): Promise<WeeklyScheduleResponse> {
    const query = date ? `?date=${date}` : '';
    return ApiClient.get<WeeklyScheduleResponse>(`/schedule/my/weekly${query}`);
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

  // --- Calendar Events (CRUD) ---

  static async getEvents(params?: { fromDate?: string; toDate?: string; courseId?: number }): Promise<CalendarEvent[]> {
    const queryParts = [];
    if (params?.fromDate) queryParts.push(`fromDate=${encodeURIComponent(params.fromDate)}`);
    if (params?.toDate) queryParts.push(`toDate=${encodeURIComponent(params.toDate)}`);
    if (params?.courseId) queryParts.push(`courseId=${params.courseId}`);
    
    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await ApiClient.get<any>(`/calendar/events${query}`);
    return Array.isArray(response) ? response : response.data ?? response.items ?? [];
  }

  static async createEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return ApiClient.post<CalendarEvent>('/calendar/events', data);
  }

  static async updateEvent(id: number, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return ApiClient.put<CalendarEvent>(`/calendar/events/${id}`, data);
  }

  static async deleteEvent(id: number): Promise<void> {
    return ApiClient.delete(`/calendar/events/${id}`);
  }
}
