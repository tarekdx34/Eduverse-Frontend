import type { StudentScheduleItem } from '../hooks/useSchedule';

const pad = (value: number) => String(value).padStart(2, '0');

const formatICSDate = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

const createEventDate = (isoDate: string, time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return new Date(`${isoDate}T${pad(Number(hours))}:${pad(Number(minutes))}:00`);
};

const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export function exportScheduleToICS(
  items: StudentScheduleItem[],
  fileName = 'student-schedule.ics',
  calendarName = 'EduVerse Student Schedule'
) {
  const dtStamp = formatICSDate(new Date());

  const events = items
    .map((item) => {
      const start = createEventDate(item.date, item.startTime);
      const end = createEventDate(item.date, item.endTime);
      const uid = `${item.id}@eduverse.local`;
      const summary = escapeText(item.title);
      const location = escapeText(item.location || 'TBD');
      const descriptionParts = [
        item.subtitle ? `Type: ${item.subtitle}` : null,
        item.courseCode ? `Course: ${item.courseCode}` : null,
      ].filter(Boolean);

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${escapeText(descriptionParts.join('\\n'))}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EduVerse//Student Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
