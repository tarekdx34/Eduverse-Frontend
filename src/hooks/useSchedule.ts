import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ScheduleService,
  type ClassScheduleItem,
  type DailyScheduleResponse,
  type ExamScheduleItem,
  type PersonalEventScheduleItem,
  type CampusEventScheduleItem,
} from '../services/api/scheduleService';

export type StudentScheduleViewMode = 'daily' | 'weekly' | 'monthly';
export type StudentScheduleItemKind = 'class' | 'exam' | 'event' | 'campus_event';

export interface StudentScheduleItem {
  id: string;
  kind: StudentScheduleItemKind;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  location?: string;
  color: string;
  courseCode?: string;
  courseId?: number;
  classItem?: ClassScheduleItem;
  examItem?: ExamScheduleItem;
  eventItem?: PersonalEventScheduleItem;
  campusEventItem?: CampusEventScheduleItem;
}

export interface ScheduleConflict {
  date: string;
  first: StudentScheduleItem;
  second: StudentScheduleItem;
}

const pad = (value: number) => String(value).padStart(2, '0');
const scheduleDebug = (..._args: unknown[]) => {
  // Silent in all modes as per user request to clean up console
  /*
  if (import.meta.env.DEV) {
    console.log('[schedule-debug]', ..._args);
  }
  */
};

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return '';
};

const valueFromObject = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (key in source) return source[key];
  }
  return undefined;
};

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const startOfWeek = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
};

export const endOfWeek = (date: Date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const normalizeTime = (value: string) => {
  if (!value) return '00:00';
  if (value.includes('T')) {
    const dt = new Date(value);
    return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
  const [h = '00', m = '00'] = value.split(':');
  return `${pad(Number(h))}:${pad(Number(m))}`;
};

export const formatTime24To12 = (time: string) => {
  const [hStr, mStr] = normalizeTime(time).split(':');
  let hours = Number(hStr);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${hours}:${mStr} ${suffix}`;
};

const toMinutes = (time: string) => {
  const [h, m] = normalizeTime(time).split(':').map(Number);
  return h * 60 + m;
};

const monthWeekStartDates = (referenceDate: Date) => {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const firstWeekStart = startOfWeek(monthStart);
  const finalWeekEnd = endOfWeek(monthEnd);
  const starts: string[] = [];
  for (let cursor = new Date(firstWeekStart); cursor <= finalWeekEnd; cursor = addDays(cursor, 7)) {
    starts.push(toISODate(cursor));
  }
  return starts;
};

const getMonthDays = async (referenceDate: Date) => {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weekStarts = monthWeekStartDates(referenceDate);
  const weeks = await Promise.all(weekStarts.map((startDate) => ScheduleService.getWeeklyUnified(startDate)));
  const dayMap = new Map<string, DailyScheduleResponse>();
  weeks.forEach((week) => {
    (week.days || []).forEach((day) => {
      dayMap.set(day.date, day);
    });
  });
  return Array.from(dayMap.values()).filter(
    (day) => day.date >= toISODate(monthStart) && day.date <= toISODate(monthEnd)
  );
};

export function useStudentDailySchedule(date?: string, enabled = true) {
  return useQuery({
    queryKey: ['student-schedule-daily', date],
    queryFn: () => ScheduleService.getDailyUnified(date),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentWeeklySchedule(startDate?: string, enabled = true) {
  return useQuery({
    queryKey: ['student-schedule-weekly', startDate],
    queryFn: () => ScheduleService.getWeeklyUnified(startDate),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentMonthSchedule(referenceDate: Date, enabled = true) {
  return useQuery({
    queryKey: ['student-schedule-month', referenceDate.getFullYear(), referenceDate.getMonth()],
    queryFn: () => getMonthDays(referenceDate),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentScheduleData(viewMode: StudentScheduleViewMode, currentDate: Date) {
  const dayDate = toISODate(currentDate);
  const weekStart = toISODate(startOfWeek(currentDate));

  const dailyQuery = useStudentDailySchedule(dayDate, viewMode === 'daily');
  const weeklyQuery = useStudentWeeklySchedule(weekStart, viewMode === 'weekly');
  const monthQuery = useStudentMonthSchedule(currentDate, viewMode === 'monthly');

  const days = useMemo(() => {
    if (viewMode === 'daily') return dailyQuery.data ? [dailyQuery.data] : [];
    if (viewMode === 'monthly') return monthQuery.data || [];
    return weeklyQuery.data?.days || [];
  }, [viewMode, dailyQuery.data, monthQuery.data, weeklyQuery.data]);

  const isLoading =
    dailyQuery.isLoading || weeklyQuery.isLoading || (viewMode === 'monthly' && monthQuery.isLoading);

  const error = dailyQuery.error || weeklyQuery.error || monthQuery.error;


  return {
    days,
    dayDate,
    weekStart,
    isLoading,
    error,
    dailyQuery,
    weeklyQuery,
    monthQuery,
  };
}

export const buildUnifiedScheduleItems = (
  days: DailyScheduleResponse[],
  locationFallback = 'TBD'
): StudentScheduleItem[] => {
  const items: StudentScheduleItem[] = [];

  days.forEach((day) => {
    (day.schedules || []).forEach((entry) => {
      const normalizedEntry = entry as unknown as Record<string, unknown>;
      const section = (normalizedEntry.section || {}) as Record<string, unknown>;
      const sectionCourse = (section.course || {}) as Record<string, unknown>;
      const course = (entry.section?.course || {}) as {
        courseId?: number;
        courseCode?: string;
        courseName?: string;
        code?: string;
        name?: string;
        title?: string;
        course_title?: string;
        course_code?: string;
        course_name?: string;
      };
      const courseCode = pickString(
        course.courseCode,
        course.code,
        course.course_code,
        pickString(valueFromObject(sectionCourse, ['courseCode', 'code', 'course_code'])),
        pickString(valueFromObject(normalizedEntry, ['courseCode', 'code', 'course_code']))
      );
      const courseName = pickString(
        course.courseName,
        course.name,
        course.title,
        course.course_name,
        course.course_title,
        pickString(valueFromObject(sectionCourse, ['courseName', 'name', 'title', 'course_name', 'course_title'])),
        pickString(valueFromObject(normalizedEntry, ['courseName', 'name', 'title', 'course_name', 'course_title']))
      );
      const resolvedCourseCode = courseCode || (courseName ? courseName : `Course #${String(entry.id)}`);
      const resolvedCourseName = courseName;
      const location = [entry.building, entry.room].filter(Boolean).join(' ').trim() || locationFallback;
      const scheduleTypeRaw = pickString(
        entry.scheduleType,
        pickString(valueFromObject(normalizedEntry, ['scheduleType', 'schedule_type', 'type']))
      );
      const normalizedScheduleType = scheduleTypeRaw.toUpperCase() || 'LECTURE';

      const entryId = Number(entry.id);
      const safeEntryId = Number.isFinite(entryId) ? entryId : items.length + 1;
      const courseIdRaw = Number(
        (course.courseId ?? valueFromObject(sectionCourse, ['courseId', 'course_id']) ?? 0) as number
      );
      const courseId = Number.isFinite(courseIdRaw) && courseIdRaw > 0 ? courseIdRaw : undefined;
      const title = resolvedCourseName ? `${resolvedCourseCode} - ${resolvedCourseName}` : resolvedCourseCode;


      items.push({
        id: `class-${safeEntryId}-${day.date}`,
        kind: 'class',
        date: day.date,
        startTime: normalizeTime(entry.startTime),
        endTime: normalizeTime(entry.endTime),
        title,
        subtitle: normalizedScheduleType,
        location,
        color: '#3b82f6',
        courseCode: resolvedCourseCode,
        courseId,
        classItem: entry,
      });
    });

    (day.events || []).forEach((entry) => {
      const courseCode = entry.course?.courseCode;
      items.push({
        id: `event-${entry.eventId}-${day.date}`,
        kind: 'event',
        date: day.date,
        startTime: normalizeTime(entry.startTime),
        endTime: normalizeTime(entry.endTime),
        title: entry.title,
        subtitle: entry.eventType,
        location: entry.location || locationFallback,
        color: entry.color || '#8b5cf6',
        courseCode,
        courseId: entry.course?.courseId,
        eventItem: entry,
      });
    });

    (day.exams || []).forEach((entry) => {
      const examDate = entry.examDate || day.date;
      const startTime = normalizeTime(entry.startTime);
      const startMinutes = toMinutes(startTime);
      const endMinutes = startMinutes + Math.max(entry.durationMinutes || 0, 30);
      const endTime = `${pad(Math.floor(endMinutes / 60) % 24)}:${pad(endMinutes % 60)}`;
      const courseCode = entry.course?.courseCode || 'EXAM';
      const title = `${courseCode} ${entry.examType?.toUpperCase?.() || 'EXAM'}`;

      items.push({
        id: `exam-${entry.examId}`,
        kind: 'exam',
        date: examDate,
        startTime,
        endTime,
        title,
        subtitle: entry.title || 'Exam',
        location: entry.location || locationFallback,
        color: '#ef4444',
        courseCode,
        courseId: entry.course?.courseId,
        examItem: entry,
      });
    });

    (day.campusEvents || []).forEach((entry) => {
      const date = toISODate(new Date(entry.startDatetime));
      items.push({
        id: `campus-${entry.eventId}`,
        kind: 'campus_event',
        date,
        startTime: normalizeTime(entry.startDatetime),
        endTime: normalizeTime(entry.endDatetime),
        title: entry.title,
        subtitle: entry.eventType,
        location: entry.location || locationFallback,
        color: entry.color || '#10b981',
        campusEventItem: entry,
      });
    });
  });

  const sorted = items.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return sorted;
};

export const detectScheduleConflicts = (items: StudentScheduleItem[]): ScheduleConflict[] => {
  const byDate = new Map<string, StudentScheduleItem[]>();
  items.forEach((item) => {
    const bucket = byDate.get(item.date) || [];
    bucket.push(item);
    byDate.set(item.date, bucket);
  });

  const conflicts: ScheduleConflict[] = [];
  byDate.forEach((dayItems, date) => {
    const sorted = [...dayItems].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    for (let i = 0; i < sorted.length; i += 1) {
      for (let j = i + 1; j < sorted.length; j += 1) {
        const first = sorted[i];
        const second = sorted[j];
        const firstEnd = toMinutes(first.endTime);
        const secondStart = toMinutes(second.startTime);
        if (secondStart >= firstEnd) break;
        conflicts.push({ date, first, second });
      }
    }
  });

  return conflicts;
};

export const getUpcomingScheduleItems = (
  items: StudentScheduleItem[],
  limit = 6,
  reference = new Date()
) => {
  const nowDate = toISODate(reference);
  const nowMinutes = reference.getHours() * 60 + reference.getMinutes();

  const upcoming = items
    .filter((item) => {
      if (item.date > nowDate) return true;
      if (item.date < nowDate) return false;
      return toMinutes(item.endTime) >= nowMinutes;
    })
    .slice(0, limit);

  return upcoming;
};
