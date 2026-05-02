import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDropdown } from './CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import {
  ScheduleService,
  type CampusEvent,
  type CampusEventQuery,
  type ClassScheduleItem,
  type DailyScheduleResponse,
  type ExamScheduleItem,
  type OfficeHoursSlot,
  type OfficeHoursSuggestion,
  type PersonalEventScheduleItem,
} from '../../../services/api/scheduleService';
import { Skeleton } from '../../../components/ui/skeleton';

type ViewMode = 'month' | 'week' | 'day';
type ItemKind = 'class' | 'exam' | 'event' | 'campus_event' | 'office_hours';
type CampusSource = 'all' | 'my';
type ScheduleCourseOption = {
  id?: string | number;
  courseId?: string | number;
  name?: string;
  courseName?: string;
  courseCode?: string;
};

type UnifiedScheduleItem = {
  id: string;
  kind: ItemKind;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  location?: string;
  color: string;
  isMandatory?: boolean;
  registrationRequired?: boolean;
  campusEvent?: CampusEvent;
  classItem?: ClassScheduleItem;
  examItem?: ExamScheduleItem;
  personalEvent?: PersonalEventScheduleItem;
  officeHoursSlot?: OfficeHoursSlot;
};

type HoverPreviewState = {
  item: UnifiedScheduleItem;
  x: number;
  y: number;
};

const typeStyles: Record<ItemKind, { text: string; bg: string; border: string }> = {
  class: { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-400' },
  exam: { text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-400' },
  event: { text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-400' },
  campus_event: { text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-400' },
  office_hours: { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-400' },
};

const pad = (n: number) => String(n).padStart(2, '0');

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
};

const endOfWeek = (d: Date) => {
  const date = startOfWeek(d);
  date.setDate(date.getDate() + 6);
  return date;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const normalizeTime = (value: string) => {
  if (!value) return '00:00';
  if (value.includes('T')) {
    const dt = new Date(value);
    return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
  const [h = '00', m = '00'] = value.split(':');
  return `${pad(Number(h))}:${pad(Number(m))}`;
};

const formatTime24To12 = (time: string) => {
  const [hStr, mStr] = normalizeTime(time).split(':');
  let h = Number(hStr);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
};

const formatDateHeader = (isoDate: string, locale: 'en' | 'ar') => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getRangeByView = (currentDate: Date, viewMode: ViewMode) => {
  if (viewMode === 'day') {
    const day = toISODate(currentDate);
    return { startDate: day, endDate: day };
  }
  if (viewMode === 'week') {
    return {
      startDate: toISODate(startOfWeek(currentDate)),
      endDate: toISODate(endOfWeek(currentDate)),
    };
  }
  return {
    startDate: toISODate(startOfMonth(currentDate)),
    endDate: toISODate(endOfMonth(currentDate)),
  };
};

const weekdayNameToIndex: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const normalizeOfficeHoursSlotsResponse = (payload: unknown): OfficeHoursSlot[] => {
  const normalizeSlot = (value: unknown): OfficeHoursSlot | null => {
    if (!value || typeof value !== 'object') return null;
    const slot = value as Record<string, unknown>;
    const slotIdRaw = slot.slotId ?? slot.id;
    const instructorIdRaw = slot.instructorId;
    const dayOfWeek = typeof slot.dayOfWeek === 'string' ? slot.dayOfWeek : '';
    const startTime = typeof slot.startTime === 'string' ? slot.startTime : '';
    const endTime = typeof slot.endTime === 'string' ? slot.endTime : '';
    const location = typeof slot.location === 'string' ? slot.location : '';
    const mode = typeof slot.mode === 'string' ? slot.mode : 'in_person';

    if (!dayOfWeek || !startTime || !endTime) return null;

    const slotId = Number(slotIdRaw);
    const instructorId = Number(instructorIdRaw);
    const maxAppointments = Number(slot.maxAppointments ?? 0);
    const currentAppointments = Number(slot.currentAppointments ?? 0);

    return {
      slotId: Number.isFinite(slotId) ? slotId : 0,
      instructorId: Number.isFinite(instructorId) ? instructorId : 0,
      dayOfWeek,
      startTime,
      endTime,
      location,
      mode,
      maxAppointments: Number.isFinite(maxAppointments) ? maxAppointments : 0,
      currentAppointments: Number.isFinite(currentAppointments) ? currentAppointments : 0,
    };
  };

  const fromArray = (value: unknown): OfficeHoursSlot[] => {
    if (!Array.isArray(value)) return [];
    return value.map(normalizeSlot).filter((slot): slot is OfficeHoursSlot => slot !== null);
  };

  if (Array.isArray(payload)) return fromArray(payload);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const dataSlots = fromArray(obj.data);
  if (dataSlots.length) return dataSlots;
  const slots = fromArray(obj.slots);
  if (slots.length) return slots;
  return fromArray(obj.results);
};

const getWeekdayIndex = (dayOfWeek: string): number | null => {
  const normalized = dayOfWeek.trim().toLowerCase();
  if (normalized in weekdayNameToIndex) return weekdayNameToIndex[normalized];

  if (/^\d+$/.test(normalized)) {
    const numeric = Number(normalized);
    if (numeric >= 0 && numeric <= 6) return numeric;
    if (numeric >= 1 && numeric <= 7) return numeric % 7;
  }

  return null;
};

const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(toISODate(cursor));
  }

  return dates;
};

const getOfficeHoursModeLabel = (mode: string, t: (key: string) => string) => {
  const normalized = mode.trim().toLowerCase();
  if (normalized === 'in_person') return t('officeHoursInPerson');
  if (normalized === 'online') return t('officeHoursOnline');
  if (normalized === 'hybrid') return t('officeHoursHybrid');
  return mode.replace(/_/g, ' ');
};

type PositionedCalendarItem = {
  item: UnifiedScheduleItem;
  index: number;
  top: number;
  height: number;
  column: number;
  columnCount: number;
};

const getMinutesFromTime = (value: string): number => {
  const normalized = normalizeTime(value);
  const [hour, minute] = normalized.split(':').map(Number);
  return hour * 60 + minute;
};

const buildPositionedCalendarItems = (
  items: UnifiedScheduleItem[],
  dayStartHour: number,
  minHeight: number
): PositionedCalendarItem[] => {
  if (!items.length) return [];

  type Segment = {
    item: UnifiedScheduleItem;
    index: number;
    start: number;
    end: number;
    top: number;
    height: number;
  };

  const dayStartMinutes = dayStartHour * 60;
  const segments: Segment[] = items.map((item, index) => {
    const start = getMinutesFromTime(item.startTime);
    const rawEnd = getMinutesFromTime(item.endTime);
    const end = Math.max(rawEnd, start + 15);
    const top = ((start - dayStartMinutes) / 60) * 60;
    const height = Math.max(((end - start) / 60) * 60, minHeight);
    return {
      item,
      index,
      start,
      end,
      top: Math.max(0, top),
      height,
    };
  });

  const visited = new Array(segments.length).fill(false);
  const overlap = (a: Segment, b: Segment) => a.start < b.end && b.start < a.end;
  const positioned: PositionedCalendarItem[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    if (visited[i]) continue;

    const stack = [i];
    const componentIndexes: number[] = [];
    visited[i] = true;

    while (stack.length) {
      const current = stack.pop()!;
      componentIndexes.push(current);
      for (let j = 0; j < segments.length; j += 1) {
        if (visited[j]) continue;
        if (overlap(segments[current], segments[j])) {
          visited[j] = true;
          stack.push(j);
        }
      }
    }

    const component = componentIndexes
      .map((segmentIndex) => segments[segmentIndex])
      .sort((a, b) => a.start - b.start || a.end - b.end || a.index - b.index);

    const laneEndTimes: number[] = [];
    const laneByItemIndex = new Map<number, number>();

    component.forEach((segment) => {
      let lane = laneEndTimes.findIndex((laneEnd) => laneEnd <= segment.start);
      if (lane === -1) {
        lane = laneEndTimes.length;
        laneEndTimes.push(segment.end);
      } else {
        laneEndTimes[lane] = segment.end;
      }
      laneByItemIndex.set(segment.index, lane);
    });

    const columnCount = Math.max(1, laneEndTimes.length);
    component.forEach((segment) => {
      positioned.push({
        item: segment.item,
        index: segment.index,
        top: segment.top,
        height: segment.height,
        column: laneByItemIndex.get(segment.index) ?? 0,
        columnCount,
      });
    });
  }

  return positioned;
};

const buildLocalOfficeHoursSuggestions = (slots: OfficeHoursSlot[]): OfficeHoursSuggestion[] => {
  const ranked = slots
    .map<OfficeHoursSuggestion>((slot) => {
      const maxAppointments = Math.max(0, slot.maxAppointments);
      const currentAppointments = Math.max(0, slot.currentAppointments);
      const remaining = Math.max(maxAppointments - currentAppointments, 0);
      const utilization = maxAppointments > 0 ? currentAppointments / maxAppointments : 0;
      const availabilityScore = maxAppointments > 0 ? (remaining / maxAppointments) * 100 : 50;
      const [startHour] = normalizeTime(slot.startTime).split(':').map(Number);
      const daytimeBonus = startHour >= 10 && startHour <= 14 ? 8 : 0;
      const score = Math.round(availabilityScore + daytimeBonus);

      const conflicts =
        maxAppointments > 0 && currentAppointments >= maxAppointments
          ? [
              {
                type: 'appointment',
                title: 'Slot is full',
                startTime: slot.startTime,
                endTime: slot.endTime,
                severity: 'hard',
              },
            ]
          : [];

      return {
        slot,
        score,
        conflicts,
        recommendation: utilization >= 1 ? 'has_conflicts' : 'good',
      };
    })
    .sort((a, b) => b.score - a.score);

  const bestCandidateIndex = ranked.findIndex((entry) => entry.recommendation !== 'has_conflicts');
  if (bestCandidateIndex >= 0) {
    ranked[bestCandidateIndex] = { ...ranked[bestCandidateIndex], recommendation: 'best' };
  }

  return ranked;
};

const isEventRegistered = (event: CampusEvent) => event.userRegistration?.status === 'registered';

async function getMonthDays(currentDate: Date): Promise<DailyScheduleResponse[]> {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const firstWeekStart = startOfWeek(monthStart);
  const finalWeekEnd = endOfWeek(monthEnd);

  const weekStarts: string[] = [];
  for (let cursor = new Date(firstWeekStart); cursor <= finalWeekEnd; cursor = addDays(cursor, 7)) {
    weekStarts.push(toISODate(cursor));
  }

  const weeks = await Promise.all(weekStarts.map((startDate) => ScheduleService.getWeeklyUnified(startDate)));
  const map = new Map<string, DailyScheduleResponse>();
  weeks.forEach((week) => {
    (week.days || []).forEach((day) => {
      map.set(day.date, day);
    });
  });

  return Array.from(map.values()).filter(
    (day) => day.date >= toISODate(monthStart) && day.date <= toISODate(monthEnd)
  );
}

// Calendar view shared props
interface CalendarViewProps {
  currentDate: Date;
  filteredItems: UnifiedScheduleItem[];
  isDark: boolean;
  headerText: string;
  subtitleText: string;
  primaryHex: string;
  typeStyles: Record<ItemKind, { text: string; bg: string; border: string }>;
  language: 'en' | 'ar';
  noEventsText: string;
  onSelectItem: (item: UnifiedScheduleItem) => void;
}

// Get color based on item kind
const getEventColor = (kind: ItemKind): string => {
  switch (kind) {
    case 'class': return '#3b82f6';
    case 'exam': return '#ef4444';
    case 'event': return '#8b5cf6';
    case 'campus_event': return '#10b981';
    case 'office_hours': return '#f59e0b';
    default: return '#6b7280';
  }
};

function EventHoverPreview({
  preview,
  isDark,
}: {
  preview: HoverPreviewState | null;
  isDark: boolean;
}) {
  if (!preview) return null;

  const popupWidth = 260;
  const left = Math.max(12, Math.min(preview.x + 14, window.innerWidth - popupWidth - 12));
  const top = Math.max(12, preview.y + 14);

  return (
    <div
      className={`fixed z-[60] pointer-events-none rounded-lg border shadow-lg p-3 ${
        isDark ? 'bg-gray-900 border-white/15 text-slate-100' : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{ left, top, width: popupWidth }}
    >
      <div className="text-sm font-semibold truncate">{preview.item.title}</div>
      <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
        {formatTime24To12(preview.item.startTime)} - {formatTime24To12(preview.item.endTime)}
      </div>
      {preview.item.location && (
        <div className={`text-xs mt-1 truncate ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {preview.item.location}
        </div>
      )}
      {preview.item.subtitle && (
        <div className={`text-xs mt-1 capitalize ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {preview.item.subtitle}
        </div>
      )}
    </div>
  );
}

// Month Calendar View Component
function MonthCalendarView({
  currentDate,
  filteredItems,
  isDark,
  headerText,
  subtitleText,
  primaryHex,
  onSelectItem,
  onDateClick,
}: CalendarViewProps & { onDateClick: (date: Date) => void }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let cursor = new Date(calendarStart);

  while (cursor <= calendarEnd) {
    currentWeek.push(new Date(cursor));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor = addDays(cursor, 1);
  }

  const today = toISODate(new Date());
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getItemsForDate = (date: Date) => {
    const iso = toISODate(date);
    return filteredItems.filter((item) => item.date === iso);
  };

  return (
    <div className="h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${subtitleText}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-px rounded-lg overflow-hidden border ${isDark ? 'bg-white/10 border-white/10' : 'bg-gray-200 border-gray-200'}`}>
        {weeks.map((week, weekIdx) =>
          week.map((date, dayIdx) => {
            const iso = toISODate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = iso === today;
            const dayItems = getItemsForDate(date);

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`min-h-[100px] p-1 cursor-pointer transition-colors ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                onClick={() => onDateClick(date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'text-white'
                        : isCurrentMonth
                        ? headerText
                        : subtitleText
                    }`}
                    style={isToday ? { backgroundColor: primaryHex } : undefined}
                  >
                    {date.getDate()}
                  </span>
                  {dayItems.length > 3 && (
                    <span className={`text-[10px] ${subtitleText}`}>+{dayItems.length - 3}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayItems.slice(0, 3).map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: `${getEventColor(item.kind)}20`,
                        color: getEventColor(item.kind),
                        borderLeft: `2px solid ${getEventColor(item.kind)}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      title={`${item.title} - ${formatTime24To12(item.startTime)}`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Week Calendar View Component
function WeekCalendarView({
  currentDate,
  filteredItems,
  isDark,
  headerText,
  subtitleText,
  primaryHex,
  onSelectItem,
}: CalendarViewProps) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = toISODate(new Date());
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState | null>(null);

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  const getItemsForDate = (date: Date) => {
    const iso = toISODate(date);
    return filteredItems.filter((item) => item.date === iso);
  };

  return (
    <div className="h-full overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-8 gap-px sticky top-0 z-10">
        <div className={`w-16 ${isDark ? 'bg-gray-800' : 'bg-white'}`} />
        {days.map((date) => {
          const iso = toISODate(date);
          const isToday = iso === today;
          return (
            <div
              key={iso}
              className={`text-center py-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`text-xs font-medium ${subtitleText}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                  isToday ? 'text-white' : headerText
                }`}
                style={isToday ? { backgroundColor: primaryHex } : undefined}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 gap-px">
        {/* Time labels column */}
        <div className={`w-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {hours.map((hour) => (
            <div
              key={hour}
              className={`h-[60px] text-right pr-2 text-xs ${subtitleText}`}
              style={{ lineHeight: '60px' }}
            >
              {formatTime24To12(`${pad(hour)}:00`)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((date) => {
          const iso = toISODate(date);
          const dayItems = getItemsForDate(date);
          const positionedItems = buildPositionedCalendarItems(dayItems, 7, 24);

          return (
            <div
              key={iso}
              className={`relative border-l ${isDark ? 'border-white/10' : 'border-gray-200'}`}
            >
              {/* Hour lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={`h-[60px] border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}
                />
              ))}

              {/* Events */}
              {positionedItems.map(({ item, index, top, height, column, columnCount }) => {
                const color = getEventColor(item.kind);
                const horizontalGap = 2;
                const widthPercent = 100 / columnCount;
                const leftPercent = column * widthPercent;

                return (
                  <button
                    key={`${item.id}-${index}`}
                    className="absolute rounded px-1 py-0.5 text-left overflow-hidden transition-opacity hover:opacity-90"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `calc(${leftPercent}% + ${horizontalGap / 2}px)`,
                      width: `calc(${widthPercent}% - ${horizontalGap}px)`,
                      backgroundColor: `${color}20`,
                      borderLeft: `3px solid ${color}`,
                    }}
                    onClick={() => onSelectItem(item)}
                    onMouseEnter={(event) =>
                      setHoverPreview({
                        item,
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }
                    onMouseMove={(event) =>
                      setHoverPreview((current) =>
                        current
                          ? {
                              ...current,
                              x: event.clientX,
                              y: event.clientY,
                            }
                          : null
                      )
                    }
                    onMouseLeave={() => setHoverPreview(null)}
                  >
                    <div className="text-[10px] font-semibold truncate" style={{ color }}>
                      {item.title}
                    </div>
                    {height > 30 && (
                      <div className={`text-[9px] ${subtitleText} truncate`}>
                        {formatTime24To12(item.startTime)}
                      </div>
                    )}
                    {height > 45 && item.location && (
                      <div className={`text-[9px] ${subtitleText} truncate`}>
                        {item.location}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <EventHoverPreview preview={hoverPreview} isDark={isDark} />
    </div>
  );
}

// Day Calendar View Component
function DayCalendarView({
  currentDate,
  filteredItems,
  isDark,
  subtitleText,
  noEventsText,
  onSelectItem,
}: CalendarViewProps) {
  const iso = toISODate(currentDate);
  const dayItems = filteredItems.filter((item) => item.date === iso);
  const positionedItems = buildPositionedCalendarItems(dayItems, 6, 30);
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState | null>(null);
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-[80px_1fr] gap-px">
        {/* Time labels column */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {hours.map((hour) => (
            <div
              key={hour}
              className={`h-[60px] text-right pr-3 text-xs font-medium ${subtitleText}`}
              style={{ lineHeight: '60px' }}
            >
              {formatTime24To12(`${pad(hour)}:00`)}
            </div>
          ))}
        </div>

        {/* Events column */}
        <div className={`relative border-l ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {/* Hour lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className={`h-[60px] border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}
            />
          ))}

          {/* Events */}
          {positionedItems.map(({ item, index, top, height, column, columnCount }) => {
            const color = getEventColor(item.kind);
            const horizontalGap = 6;
            const widthPercent = 100 / columnCount;
            const leftPercent = column * widthPercent;

            return (
              <button
                key={`${item.id}-${index}`}
                className="absolute rounded-lg px-3 py-2 text-left overflow-hidden transition-all hover:shadow-md"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `calc(${leftPercent}% + ${horizontalGap / 2}px)`,
                  width: `calc(${widthPercent}% - ${horizontalGap}px)`,
                  backgroundColor: `${color}15`,
                  borderLeft: `4px solid ${color}`,
                }}
                onClick={() => onSelectItem(item)}
                onMouseEnter={(event) =>
                  setHoverPreview({
                    item,
                    x: event.clientX,
                    y: event.clientY,
                  })
                }
                onMouseMove={(event) =>
                  setHoverPreview((current) =>
                    current
                      ? {
                          ...current,
                          x: event.clientX,
                          y: event.clientY,
                        }
                      : null
                  )
                }
                onMouseLeave={() => setHoverPreview(null)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate" style={{ color }}>
                      {item.title}
                    </div>
                    {height > 40 && (
                      <div className={`text-xs ${subtitleText} mt-0.5`}>
                        {formatTime24To12(item.startTime)} - {formatTime24To12(item.endTime)}
                      </div>
                    )}
                    {height > 60 && item.location && (
                      <div className={`text-xs ${subtitleText} mt-0.5 flex items-center gap-1`}>
                        <MapPin size={10} />
                        {item.location}
                      </div>
                    )}
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
                    style={{
                      backgroundColor: `${color}20`,
                      color,
                    }}
                  >
                    {item.kind.replace('_', ' ')}
                  </span>
                </div>
              </button>
            );
          })}

          {dayItems.length === 0 && (
            <div className={`absolute inset-0 flex items-center justify-center ${subtitleText}`}>
              {noEventsText}
            </div>
          )}
        </div>
      </div>
      <EventHoverPreview preview={hoverPreview} isDark={isDark} />
    </div>
  );
}

export function SchedulePage({
  isMockMode = false,
  courses = [],
}: {
  isMockMode?: boolean;
  courses?: ScheduleCourseOption[];
}) {
  const { t, language } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as { isDark: boolean; primaryHex: string };
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ItemKind>('all');
  const [campusSource, setCampusSource] = useState<CampusSource>('all');
  const [selectedItem, setSelectedItem] = useState<UnifiedScheduleItem | null>(null);
  const [latestSuggestions, setLatestSuggestions] = useState<OfficeHoursSuggestion[]>([]);

  const { startDate, endDate } = useMemo(
    () => getRangeByView(currentDate, viewMode),
    [currentDate, viewMode]
  );

  const dayDate = toISODate(currentDate);
  const weekStart = toISODate(startOfWeek(currentDate));

  const dailyQuery = useQuery({
    queryKey: ['schedule-daily-unified', dayDate],
    queryFn: () => ScheduleService.getDailyUnified(dayDate),
    enabled: !isMockMode,
  });

  const weeklyQuery = useQuery({
    queryKey: ['schedule-weekly-unified', weekStart],
    queryFn: () => ScheduleService.getWeeklyUnified(weekStart),
    enabled: !isMockMode,
  });

  const monthQuery = useQuery({
    queryKey: ['schedule-month-unified', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: () => getMonthDays(currentDate),
    enabled: !isMockMode && viewMode === 'month',
  });

  const campusEventsQuery = useQuery({
    queryKey: ['schedule-campus-events', campusSource, startDate, endDate],
    queryFn: () => {
      if (campusSource === 'my') {
        return ScheduleService.getMyCampusEvents({ page: 1, limit: 200 });
      }
      const params: CampusEventQuery = {
        page: 1,
        limit: 200,
        status: 'published',
        fromDate: startDate,
        toDate: endDate,
      };
      return ScheduleService.getCampusEvents(params);
    },
    enabled: !isMockMode,
  });

  const officeHoursQuery = useQuery({
    queryKey: ['schedule-office-hours-slots', user?.userId],
    queryFn: async () => {
      const payload = (await ScheduleService.getMyOfficeHoursSlots(user?.userId)) as unknown;
      return normalizeOfficeHoursSlotsResponse(payload);
    },
    enabled: !isMockMode && Boolean(user?.userId),
    retry: false,
  });
  const mockUnifiedItems = useMemo<UnifiedScheduleItem[]>(() => {
    const today = new Date();
    const codeAndName = (idx: number) => {
      const source = courses[idx] || courses[0] || {};
      const code = source.courseCode || `CS30${idx + 1}`;
      const name = source.courseName || source.name || `Course ${idx + 1}`;
      return { code, name, id: String(source.courseId ?? source.id ?? idx + 1) };
    };
    const c1 = codeAndName(0);
    const c2 = codeAndName(1);
    return [
      {
        id: 'mock-class-1',
        kind: 'class',
        date: toISODate(addDays(today, 1)),
        startTime: '10:00',
        endTime: '11:30',
        title: `${c1.code} - ${c1.name}`,
        subtitle: 'lecture',
        location: 'B-204',
        color: '#3b82f6',
      },
      {
        id: 'mock-lab-1',
        kind: 'class',
        date: toISODate(addDays(today, 2)),
        startTime: '12:00',
        endTime: '13:30',
        title: `${c2.code} - ${c2.name}`,
        subtitle: 'lab',
        location: 'Lab 3',
        color: '#3b82f6',
      },
      {
        id: 'mock-exam-1',
        kind: 'exam',
        date: toISODate(addDays(today, 5)),
        startTime: '09:00',
        endTime: '11:00',
        title: `${c1.code} Midterm`,
        subtitle: 'Midterm',
        location: 'Hall A',
        color: '#ef4444',
      },
      {
        id: 'mock-office-hours-1',
        kind: 'office_hours',
        date: toISODate(addDays(today, 3)),
        startTime: '14:00',
        endTime: '15:00',
        title: t('officeHours'),
        subtitle: t('officeHoursInPerson'),
        location: 'Office 2-11',
        color: '#f59e0b',
      },
    ];
  }, [courses, t]);


  const registerMutation = useMutation({
    mutationFn: (eventId: number) => ScheduleService.registerForCampusEvent(eventId),
    onSuccess: () => {
      toast.success(t('campusEventRegisterSuccess'));
      queryClient.invalidateQueries({ queryKey: ['schedule-campus-events'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-daily-unified'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-weekly-unified'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t('campusEventRegisterError'));
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: (eventId: number) => ScheduleService.unregisterFromCampusEvent(eventId),
    onSuccess: () => {
      toast.success(t('campusEventUnregisterSuccess'));
      queryClient.invalidateQueries({ queryKey: ['schedule-campus-events'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-daily-unified'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-weekly-unified'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t('campusEventUnregisterError'));
    },
  });

  const suggestionMutation = useMutation({
    mutationFn: async () => {
      try {
        const remote = await ScheduleService.getOfficeHoursSuggestions({
          instructorId: user?.userId,
          fromDate: startDate,
          toDate: endDate,
        });
        const suggestions = Array.isArray(remote?.suggestions) ? remote.suggestions : [];
        if (suggestions.length > 0) {
          return { suggestions, source: 'api' as const };
        }
      } catch {
        // Fallback to local ranking if API endpoint fails or returns empty.
      }

      return {
        suggestions: buildLocalOfficeHoursSuggestions(officeHoursQuery.data || []),
        source: 'local' as const,
      };
    },
    onSuccess: (data) => {
      const suggestions = data.suggestions || [];
      setLatestSuggestions(suggestions);
      if (!suggestions.length) {
        toast.info(t('noSuggestionsFound'));
        return;
      }
      const top = suggestions[0];
      if (top) {
        const sourceNote = data.source === 'api' ? 'API' : 'local fallback';
        toast.success(`${t('suggestionsFound')}: ${suggestions.length} (${sourceNote})`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('suggestionsLoadError'));
    },
  });

  const allScheduleDays = useMemo(() => {
    if (viewMode === 'day') return dailyQuery.data ? [dailyQuery.data] : [];
    if (viewMode === 'month') return monthQuery.data || [];
    return weeklyQuery.data?.days || [];
  }, [viewMode, dailyQuery.data, monthQuery.data, weeklyQuery.data]);

  const officeHoursItems = useMemo<UnifiedScheduleItem[]>(() => {
    const slots = officeHoursQuery.data || [];
    if (!slots.length) return [];

    const dates = getDatesInRange(startDate, endDate);
    const items: UnifiedScheduleItem[] = [];

    dates.forEach((isoDate) => {
      const weekday = new Date(`${isoDate}T00:00:00`).getDay();
      slots.forEach((slot) => {
        const slotWeekday = getWeekdayIndex(slot.dayOfWeek);
        if (slotWeekday === null || slotWeekday !== weekday) return;

        items.push({
          id: `office-hours-${slot.slotId}-${isoDate}`,
          kind: 'office_hours',
          date: isoDate,
          startTime: normalizeTime(slot.startTime),
          endTime: normalizeTime(slot.endTime),
          title: t('officeHours'),
          subtitle: getOfficeHoursModeLabel(slot.mode, t),
          location: slot.location || t('locationTbd'),
          color: '#f59e0b',
          officeHoursSlot: slot,
        });
      });
    });

    return items;
  }, [officeHoursQuery.data, startDate, endDate, t]);

  const unifiedItems = useMemo<UnifiedScheduleItem[]>(() => {
    if (isMockMode) return mockUnifiedItems;
    const items: UnifiedScheduleItem[] = [];

    allScheduleDays.forEach((day) => {
      (day.schedules || []).forEach((entry) => {
        const location = [entry.building, entry.room].filter(Boolean).join(' ').trim();
        // API returns 'code' and 'name', not 'courseCode' and 'courseName'
        const course = entry.section?.course as { code?: string; name?: string; courseCode?: string; courseName?: string } | undefined;
        const courseCode = course?.code || course?.courseCode || t('unknownCourse');
        const courseName = course?.name || course?.courseName || '';
        const title = courseName ? `${courseCode} - ${courseName}` : courseCode;
        const normalizedStart = normalizeTime(entry.startTime);
        const normalizedEnd = normalizeTime(entry.endTime);
        const classIdentity = [
          'class',
          day.date,
          entry.id ?? 'na',
          entry.section?.sectionId ?? 'na',
          normalizedStart,
          normalizedEnd,
          entry.scheduleType ?? 'na',
        ].join('-');
        items.push({
          id: classIdentity,
          kind: 'class',
          date: day.date,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          title,
          subtitle: entry.scheduleType,
          location: location || t('locationTbd'),
          color: '#3b82f6',
          classItem: entry,
        });
      });

      (day.exams || []).forEach((entry) => {
        const start = normalizeTime(entry.startTime);
        const [h, m] = start.split(':').map(Number);
        const endDate = new Date(`${day.date}T${pad(h)}:${pad(m)}:00`);
        endDate.setMinutes(endDate.getMinutes() + entry.durationMinutes);
        const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
        items.push({
          id: `exam-${entry.examId}`,
          kind: 'exam',
          date: entry.examDate || day.date,
          startTime: start,
          endTime: end,
          title: `${entry.course.courseCode} ${entry.examType.toUpperCase()}`,
          subtitle: entry.title || t('exam'),
          location: entry.location || t('locationTbd'),
          color: '#ef4444',
          examItem: entry,
        });
      });

      (day.events || []).forEach((entry) => {
        items.push({
          id: `event-${entry.eventId}`,
          kind: 'event',
          date: day.date,
          startTime: normalizeTime(entry.startTime),
          endTime: normalizeTime(entry.endTime),
          title: entry.title,
          subtitle: entry.eventType,
          location: entry.location || undefined,
          color: entry.color || '#8b5cf6',
          personalEvent: entry,
        });
      });
    });

    (campusEventsQuery.data?.data || []).forEach((event) => {
      const date = toISODate(new Date(event.startDatetime));
      items.push({
        id: `campus-${event.eventId}`,
        kind: 'campus_event',
        date,
        startTime: normalizeTime(event.startDatetime),
        endTime: normalizeTime(event.endDatetime),
        title: event.title,
        subtitle: event.eventType,
        location: event.location || [event.building, event.room].filter(Boolean).join(' ').trim(),
        color: event.color || '#10b981',
        isMandatory: event.isMandatory,
        registrationRequired: event.registrationRequired,
        campusEvent: event,
      });
    });

    items.push(...officeHoursItems);

    return items.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      const timeCmp = a.startTime.localeCompare(b.startTime);
      if (timeCmp !== 0) return timeCmp;
      return a.id.localeCompare(b.id);
    });
  }, [allScheduleDays, campusEventsQuery.data, officeHoursItems, t, isMockMode, mockUnifiedItems]);

  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    unifiedItems.forEach((item) => {
      const classCode = (item.classItem?.section?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.classItem?.section?.course?.courseCode;
      const examCode = (item.examItem?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.examItem?.course?.courseCode;
      const eventCode = (item.personalEvent?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.personalEvent?.course?.courseCode;
      if (classCode) set.add(classCode);
      else if (examCode) set.add(examCode);
      else if (eventCode) set.add(eventCode);
    });
    return [{ value: 'all', label: t('allCourses') }, ...Array.from(set).map((c) => ({ value: c, label: c }))];
  }, [unifiedItems, t]);

  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (typeFilter !== 'all' && item.kind !== typeFilter) return false;
      if (courseFilter === 'all') return true;
      const classCode = (item.classItem?.section?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.classItem?.section?.course?.courseCode;
      const examCode = (item.examItem?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.examItem?.course?.courseCode;
      const eventCode = (item.personalEvent?.course as { code?: string; courseCode?: string } | undefined)?.code 
        || item.personalEvent?.course?.courseCode;
      if (classCode === courseFilter) return true;
      if (examCode === courseFilter) return true;
      if (eventCode === courseFilter) return true;
      return false;
    });
  }, [unifiedItems, typeFilter, courseFilter]);

  const upcomingItems = useMemo(() => {
    const now = new Date();
    const todayISO = toISODate(now);
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return filteredItems
      .filter((item) => item.date > todayISO || (item.date === todayISO && item.startTime >= nowTime))
      .slice(0, 6);
  }, [filteredItems]);

  const stats = useMemo(() => {
    let totalMinutes = 0;
    let lectures = 0;
    let labs = 0;
    filteredItems.forEach((item) => {
      const [sh, sm] = item.startTime.split(':').map(Number);
      const [eh, em] = item.endTime.split(':').map(Number);
      const minutes = Math.max(0, eh * 60 + em - (sh * 60 + sm));
      totalMinutes += minutes;
      const type = item.classItem?.scheduleType?.toUpperCase?.();
      if (type === 'LECTURE') lectures += 1;
      if (type === 'LAB') labs += 1;
    });
    const hardConflicts = latestSuggestions.flatMap((s) => s.conflicts).filter((c) => c.severity === 'hard').length;
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      lectures,
      labs,
      conflicts: hardConflicts,
    };
  }, [filteredItems, latestSuggestions]);

  const isLoading =
    !isMockMode &&
    (dailyQuery.isLoading ||
      weeklyQuery.isLoading ||
      (viewMode === 'month' && monthQuery.isLoading) ||
      campusEventsQuery.isLoading ||
      officeHoursQuery.isLoading);
  const hasError =
    !isMockMode && (dailyQuery.error || weeklyQuery.error || monthQuery.error || campusEventsQuery.error);

  const headerLabel = useMemo(() => {
    if (viewMode === 'day') return formatDateHeader(toISODate(currentDate), language);
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate);
      const we = endOfWeek(currentDate);
      return `${formatDateHeader(toISODate(ws), language)} - ${formatDateHeader(toISODate(we), language)}`;
    }
    const start = startOfMonth(currentDate);
    return start.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate, language, viewMode]);

  const navigatePrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, -1));
    else if (viewMode === 'week') setCurrentDate((d) => addDays(d, -7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addDays(d, 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const cardBg = isDark ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200';
  const headerText = isDark ? 'text-white' : 'text-gray-900';
  const subtitleText = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputCard = isDark ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-200';
  const selectedCourse = selectedItem?.classItem?.section?.course as
    | { code?: string; name?: string; courseCode?: string; courseName?: string }
    | undefined;
  const selectedCourseCode = selectedCourse?.code || selectedCourse?.courseCode;
  const selectedCourseName = selectedCourse?.name || selectedCourse?.courseName;

  const renderScheduleSkeleton = () => (
    <div className="space-y-4">
      <div className={`rounded-lg border p-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`rounded-lg border p-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}
          >
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${headerText}`}>{t('teachingSchedule')}</h2>
          <p className={`${subtitleText} text-sm mt-1`}>{t('scheduleDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-1`}>
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all ${viewMode === mode ? 'text-white shadow-sm' : subtitleText}`}
                style={viewMode === mode ? { backgroundColor: primaryHex } : undefined}
              >
                {t(mode)}
              </button>
            ))}
          </div>
        </div>

        <CustomDropdown
          label={t('courseLabel')}
          value={courseFilter}
          options={courseOptions}
          onChange={setCourseFilter}
          stackLabel
          fullWidth
        />

        <CustomDropdown
          label={t('eventTypeLabel')}
          value={typeFilter}
          options={[
            { value: 'all', label: t('allEvents') },
            { value: 'class', label: t('classSessions') },
            { value: 'exam', label: t('exam') },
            { value: 'event', label: t('personalEvents') },
            { value: 'campus_event', label: t('campusEvents') },
            { value: 'office_hours', label: t('officeHours') },
          ]}
          onChange={(value) => setTypeFilter(value as 'all' | ItemKind)}
          stackLabel
          fullWidth
        />

        <CustomDropdown
          label={t('campusEventsSource')}
          value={campusSource}
          options={[
            { value: 'all', label: t('allCampusEvents') },
            { value: 'my', label: t('myCampusEvents') },
          ]}
          onChange={(value) => setCampusSource(value as CampusSource)}
          stackLabel
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-3 rounded-xl border shadow-sm overflow-hidden ${cardBg}`}>
          <div
            className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={navigatePrev}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={20} className={subtitleText} />
              </button>
              <h3 className={`font-semibold ${headerText}`}>{headerLabel}</h3>
              <button
                onClick={navigateNext}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight size={20} className={subtitleText} />
              </button>
            </div>
            <button onClick={goToday} className="text-sm font-medium" style={{ color: primaryHex }}>
              {t('today')}
            </button>
          </div>

        <div className="p-4 min-h-[500px]">
            {isLoading && (
              <div className="h-full">{renderScheduleSkeleton()}</div>
            )}

            {hasError && !isLoading && (
              <div className={`rounded-lg border p-3 text-sm ${isDark ? 'border-red-400/40 text-red-300' : 'border-red-200 text-red-700'}`}>
                {t('scheduleLoadError')}
              </div>
            )}

            {/* Month Calendar View */}
            {!isLoading && !hasError && viewMode === 'month' && (
              <MonthCalendarView
                currentDate={currentDate}
                filteredItems={filteredItems}
                isDark={isDark}
                headerText={headerText}
                subtitleText={subtitleText}
                primaryHex={primaryHex}
                typeStyles={typeStyles}
                language={language}
                noEventsText={t('officeHoursNoEventsScheduled')}
                onSelectItem={setSelectedItem}
                onDateClick={(date) => {
                  setCurrentDate(date);
                  setViewMode('day');
                }}
              />
            )}

            {/* Week Calendar View */}
            {!isLoading && !hasError && viewMode === 'week' && (
              <WeekCalendarView
                currentDate={currentDate}
                filteredItems={filteredItems}
                isDark={isDark}
                headerText={headerText}
                subtitleText={subtitleText}
                primaryHex={primaryHex}
                typeStyles={typeStyles}
                language={language}
                noEventsText={t('officeHoursNoEventsScheduled')}
                onSelectItem={setSelectedItem}
              />
            )}

            {/* Day Calendar View */}
            {!isLoading && !hasError && viewMode === 'day' && (
              <DayCalendarView
                currentDate={currentDate}
                filteredItems={filteredItems}
                isDark={isDark}
                headerText={headerText}
                subtitleText={subtitleText}
                primaryHex={primaryHex}
                typeStyles={typeStyles}
                language={language}
                noEventsText={t('officeHoursNoEventsScheduled')}
                onSelectItem={setSelectedItem}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-xl p-4 border shadow-sm ${cardBg}`}>
            <h3 className={`font-semibold ${headerText} mb-4`}>{t('upcomingTeachingEvents')}</h3>
            <div className="space-y-3">
              {upcomingItems.map((item, index) => {
                const styles = typeStyles[item.kind];
                return (
                  <button
                    key={`${item.id}-${index}`}
                    className={`w-full text-left p-3 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs mt-1">
                      {formatDateHeader(item.date, language)} • {formatTime24To12(item.startTime)}
                    </div>
                  </button>
                );
              })}
              {!upcomingItems.length && <p className={`text-sm ${subtitleText}`}>{t('noUpcomingEvents')}</p>}
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryHex}20` }}>
                <Sparkles style={{ color: primaryHex }} size={20} />
              </div>
              <h3 className={`font-semibold ${headerText}`}>{t('evySchedulingAssistant')}</h3>
            </div>
            <p className={`text-sm ${subtitleText} mb-4`}>{t('scheduleAssistantDescription')}</p>
            <div className="space-y-2">
              <button
                onClick={() => suggestionMutation.mutate()}
                disabled={suggestionMutation.isPending}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} disabled:opacity-70`}
              >
                {suggestionMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
                {t('detectConflicts')}
              </button>
              <button
                onClick={() => {
                  suggestionMutation.mutate(undefined, {
                    onSuccess: (data) => {
                      const best = data.suggestions.find((s) => s.recommendation === 'best');
                      if (!best) {
                        toast.info(t('noBestSuggestion'));
                        return;
                      }
                      toast.success(
                        `${t('bestSlot')}: ${best.slot.dayOfWeek} ${formatTime24To12(best.slot.startTime)} - ${formatTime24To12(best.slot.endTime)}`
                      );
                    },
                  });
                }}
                disabled={suggestionMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-70"
                style={{ backgroundColor: primaryHex }}
              >
                <CheckCircle2 size={14} />
                {t('optimizeSchedule')}
              </button>
            </div>
            {!!latestSuggestions.length && (
              <div
                className={`mt-3 pt-3 border-t space-y-2 text-xs ${
                  isDark ? 'border-white/10 text-slate-300' : 'border-gray-200 text-gray-700'
                }`}
              >
                {latestSuggestions.slice(0, 3).map((suggestion, index) => {
                  const conflictCount = suggestion.conflicts?.length || 0;
                  const recommendation =
                    suggestion.recommendation === 'best'
                      ? 'Best'
                      : suggestion.recommendation === 'has_conflicts'
                        ? 'Needs review'
                        : 'Good';
                  return (
                    <div
                      key={`${suggestion.slot.slotId}-${index}`}
                      className={`rounded-lg border px-3 py-2 ${
                        isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {suggestion.slot.dayOfWeek} {formatTime24To12(suggestion.slot.startTime)} -{' '}
                          {formatTime24To12(suggestion.slot.endTime)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            suggestion.recommendation === 'best'
                              ? 'bg-emerald-100 text-emerald-700'
                              : suggestion.recommendation === 'has_conflicts'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {recommendation}
                        </span>
                      </div>
                      <div className={isDark ? 'text-slate-400 mt-1' : 'text-gray-500 mt-1'}>
                        Score: {suggestion.score} • Conflicts: {conflictCount}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`rounded-xl p-4 border shadow-sm ${cardBg}`}>
            <h3 className={`font-semibold ${headerText} mb-4`}>{t('thisWeek')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('totalHours')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>{stats.totalHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('lectures')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>{stats.lectures}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('labs')}</span>
                <span className={`text-sm font-semibold ${headerText}`}>{stats.labs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${subtitleText}`}>{t('conflicts')}</span>
                <span className={`text-sm font-semibold ${stats.conflicts > 0 ? 'text-red-600' : headerText}`}>
                  {stats.conflicts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`rounded-xl border shadow-xl p-6 w-full max-w-lg ${inputCard}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${headerText}`}>{selectedItem.title}</h3>
            <div className={`mt-3 space-y-2 text-sm ${subtitleText}`}>
              <div>
                <span className="font-medium">{t('dateLabel')}</span> {formatDateHeader(selectedItem.date, language)}
              </div>
              <div>
                <span className="font-medium">{t('timeLabel')}</span>{' '}
                {formatTime24To12(selectedItem.startTime)} - {formatTime24To12(selectedItem.endTime)}
              </div>
              <div>
                <span className="font-medium">{t('locationLabel')}</span> {selectedItem.location || t('locationTbd')}
              </div>
              {selectedItem.subtitle && (
                <div>
                  <span className="font-medium">{t('typeLabel')}</span> {selectedItem.subtitle}
                </div>
              )}
              {selectedCourseCode && (
                <div>
                  <span className="font-medium">{t('courseLabel')}</span>{' '}
                  {selectedCourseName ? `${selectedCourseCode} - ${selectedCourseName}` : selectedCourseCode}
                </div>
              )}
              {selectedItem.kind === 'office_hours' && selectedItem.officeHoursSlot && (
                <>
                  <div>
                    <span className="font-medium">{t('officeHoursModeLabel')}</span>{' '}
                    {getOfficeHoursModeLabel(selectedItem.officeHoursSlot.mode, t)}
                  </div>
                  <div>
                    <span className="font-medium">{t('officeHoursAppointmentsLabel')}</span>{' '}
                    {selectedItem.officeHoursSlot.currentAppointments}/{selectedItem.officeHoursSlot.maxAppointments}
                  </div>
                </>
              )}
              {selectedItem.campusEvent?.description && <p>{selectedItem.campusEvent.description}</p>}
            </div>

            {selectedItem.kind === 'campus_event' && selectedItem.campusEvent?.registrationRequired && (
              <div className="mt-5">
                {isEventRegistered(selectedItem.campusEvent) ? (
                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                    onClick={() => unregisterMutation.mutate(selectedItem.campusEvent!.eventId)}
                    disabled={unregisterMutation.isPending}
                  >
                    {t('unregister')}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: primaryHex }}
                    onClick={() => registerMutation.mutate(selectedItem.campusEvent!.eventId)}
                    disabled={
                      registerMutation.isPending ||
                      selectedItem.campusEvent.spotsRemaining === 0
                    }
                  >
                    {selectedItem.campusEvent.spotsRemaining === 0 ? t('eventFull') : t('register')}
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                className={`px-4 py-2 rounded-lg border text-sm ${isDark ? 'border-white/10 text-slate-300' : 'border-gray-300 text-gray-700'}`}
                onClick={() => setSelectedItem(null)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;
