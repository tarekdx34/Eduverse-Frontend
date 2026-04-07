import { ApiClient } from './client';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CourseBasic {
  courseId: number;
  courseCode: string;
  courseName: string;
}

export interface ClassScheduleItem {
  type: 'class';
  id: number;
  sectionId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  building: string | null;
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM' | string;
  section: {
    id: number;
    sectionNumber: string;
    course: CourseBasic;
  };
}

export interface PersonalEventScheduleItem {
  type: 'event';
  eventId: number;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string;
  location: string | null;
  color: string;
  course: CourseBasic | null;
}

export interface ExamScheduleItem {
  type: 'exam';
  examId: number;
  courseId: number;
  examType: 'midterm' | 'final' | 'quiz' | 'makeup' | string;
  title: string | null;
  examDate: string;
  startTime: string;
  durationMinutes: number;
  location: string | null;
  course: CourseBasic;
}

export interface CampusEventScheduleItem {
  type: 'campus_event';
  eventId: number;
  title: string;
  description: string | null;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  location: string | null;
  color: string;
  isMandatory: boolean;
  registrationRequired: boolean;
}

export interface DailyScheduleResponse {
  date: string;
  dayOfWeek: string;
  schedules: ClassScheduleItem[];
  events: PersonalEventScheduleItem[];
  exams: ExamScheduleItem[];
  campusEvents: CampusEventScheduleItem[];
}

export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  days: DailyScheduleResponse[];
}

export interface LegacyScheduleItem {
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

export interface CampusEventRegistration {
  registrationId: number;
  eventId: number;
  userId: number;
  status: 'registered' | 'attended' | 'cancelled' | 'no_show' | string;
  notes: string | null;
  registeredAt: string;
  updatedAt: string;
}

export interface CampusEvent {
  eventId: number;
  title: string;
  description: string | null;
  eventType: 'university_wide' | 'department' | 'campus' | 'program' | string;
  scopeId: number | null;
  startDatetime: string;
  endDatetime: string;
  location: string | null;
  building: string | null;
  room: string | null;
  organizerId: number;
  organizer: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  isMandatory: boolean;
  registrationRequired: boolean;
  maxAttendees: number | null;
  color: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  userRegistration?: CampusEventRegistration | null;
  registrationCount: number;
  spotsRemaining: number | null;
}

export interface CampusEventQuery {
  eventType?: 'university_wide' | 'department' | 'campus' | 'program';
  scopeId?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  fromDate?: string;
  toDate?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ScheduleTemplateSlot {
  slotId: number;
  templateId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM' | string;
  durationMinutes: number;
  building: string | null;
  room: string | null;
}

export interface ScheduleTemplate {
  templateId: number;
  name: string;
  description: string | null;
  departmentId: number | null;
  department: {
    departmentId: number;
    departmentName: string;
  } | null;
  scheduleType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID' | string;
  createdBy: number;
  creator: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slots: ScheduleTemplateSlot[];
}

export interface ScheduleTemplateQuery {
  scheduleType?: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'HYBRID';
  departmentId?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OfficeHoursConflict {
  type: 'class' | 'exam' | 'campus_event' | 'appointment' | string;
  title: string;
  startTime: string;
  endTime: string;
  severity: 'hard' | 'soft' | string;
}

export interface OfficeHoursSlot {
  slotId: number;
  instructorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  mode: 'in_person' | 'online' | 'hybrid' | string;
  maxAppointments: number;
  currentAppointments: number;
}

export interface OfficeHoursAppointment {
  appointmentId: number;
  slotId: number;
  studentId: number;
  appointmentDate: string;
  topic: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;
  student?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  slot?: OfficeHoursSlot;
}

export interface OfficeHoursSuggestion {
  slot: OfficeHoursSlot;
  score: number;
  conflicts: OfficeHoursConflict[];
  recommendation: 'best' | 'good' | 'has_conflicts' | string;
}

export interface OfficeHoursSuggestionsResponse {
  suggestions: OfficeHoursSuggestion[];
}

export interface OfficeHoursSuggestionQuery {
  instructorId?: number;
  fromDate?: string;
  toDate?: string;
}

const toQueryString = (params?: Record<string, string | number | boolean | undefined>) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const raw = query.toString();
  return raw ? `?${raw}` : '';
};

const normalizeLegacyItem = (
  entry: ClassScheduleItem,
  fallbackDate: string,
  fallbackDay: string
): LegacyScheduleItem => ({
  scheduleId: entry.id,
  courseId: entry.section.course.courseId,
  sectionId: entry.sectionId,
  courseName: entry.section.course.courseName,
  courseCode: entry.section.course.courseCode,
  instructorName: 'TBD',
  room: [entry.building, entry.room].filter(Boolean).join(' ').trim() || 'TBD',
  day: entry.dayOfWeek || fallbackDay,
  startTime: entry.startTime,
  endTime: entry.endTime,
  type: entry.scheduleType?.toLowerCase?.() || 'class',
});

export class ScheduleService {
  static async getDailyUnified(date?: string): Promise<DailyScheduleResponse> {
    return ApiClient.get<DailyScheduleResponse>(`/schedule/my/daily${toQueryString({ date })}`);
  }

  static async getWeeklyUnified(startDate?: string): Promise<WeeklyScheduleResponse> {
    return ApiClient.get<WeeklyScheduleResponse>(
      `/schedule/my/weekly${toQueryString({ startDate })}`
    );
  }

  // Legacy compatibility for existing dashboard consumers (returns class schedules only).
  static async getDaily(date?: string): Promise<LegacyScheduleItem[]> {
    const daily = await this.getDailyUnified(date);
    return (daily.schedules || []).map((schedule) =>
      normalizeLegacyItem(schedule, daily.date, daily.dayOfWeek)
    );
  }

  // Legacy compatibility for existing student/dashboard consumers.
  static async getWeekly(date?: string): Promise<{
    weekStart: string;
    weekEnd: string;
    days: Array<{ date: string; dayOfWeek: string; schedules: LegacyScheduleItem[]; events: []; exams: [] }>;
  }> {
    const weekly = await this.getWeeklyUnified(date);
    return {
      weekStart: weekly.weekStart,
      weekEnd: weekly.weekEnd,
      days: (weekly.days || []).map((day) => ({
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        schedules: (day.schedules || []).map((schedule) =>
          normalizeLegacyItem(schedule, day.date, day.dayOfWeek)
        ),
        events: [],
        exams: [],
      })),
    };
  }

  static async getCampusEvents(params?: CampusEventQuery): Promise<PaginatedResponse<CampusEvent>> {
    return ApiClient.get<PaginatedResponse<CampusEvent>>(
      `/campus-events${toQueryString(params as Record<string, string | number | boolean | undefined>)}`
    );
  }

  static async getMyCampusEvents(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CampusEvent>> {
    return ApiClient.get<PaginatedResponse<CampusEvent>>(`/campus-events/my${toQueryString(params)}`);
  }

  static async registerForCampusEvent(eventId: number, notes?: string): Promise<CampusEventRegistration> {
    return ApiClient.post<CampusEventRegistration>(`/campus-events/${eventId}/register`, {
      notes,
    });
  }

  static async unregisterFromCampusEvent(eventId: number): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/campus-events/${eventId}/register`);
  }

  static async getScheduleTemplates(
    params?: ScheduleTemplateQuery
  ): Promise<PaginatedResponse<ScheduleTemplate>> {
    return ApiClient.get<PaginatedResponse<ScheduleTemplate>>(
      `/schedule-templates${toQueryString(params as Record<string, string | number | boolean | undefined>)}`
    );
  }

  static async getOfficeHoursSuggestions(
    params?: OfficeHoursSuggestionQuery
  ): Promise<OfficeHoursSuggestionsResponse> {
    return ApiClient.get<OfficeHoursSuggestionsResponse>(
      `/office-hours/slots/suggest${toQueryString(params)}`
    );
  }

  // Office Hours - Instructor's slots
  static async getMyOfficeHoursSlots(): Promise<OfficeHoursSlot[]> {
    return ApiClient.get<OfficeHoursSlot[]>('/office-hours/my-slots');
  }

  static async createOfficeHoursSlot(data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string;
    mode: 'in_person' | 'online' | 'hybrid';
    maxAppointments: number;
  }): Promise<OfficeHoursSlot> {
    return ApiClient.post<OfficeHoursSlot>('/office-hours/slots', data);
  }

  static async updateOfficeHoursSlot(
    slotId: number,
    data: Partial<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      location: string;
      mode: 'in_person' | 'online' | 'hybrid';
      maxAppointments: number;
    }>
  ): Promise<OfficeHoursSlot> {
    return ApiClient.patch<OfficeHoursSlot>(`/office-hours/slots/${slotId}`, data);
  }

  static async deleteOfficeHoursSlot(slotId: number): Promise<void> {
    return ApiClient.delete(`/office-hours/slots/${slotId}`);
  }

  // Office Hours - Appointments (for instructors)
  static async getOfficeHoursAppointments(): Promise<OfficeHoursAppointment[]> {
    return ApiClient.get<OfficeHoursAppointment[]>('/office-hours/appointments');
  }

  static async updateAppointmentStatus(
    appointmentId: number,
    status: 'confirmed' | 'cancelled' | 'completed'
  ): Promise<OfficeHoursAppointment> {
    return ApiClient.patch<OfficeHoursAppointment>(`/office-hours/appointments/${appointmentId}`, { status });
  }
}
