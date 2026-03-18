/**
 * Date formatting utilities
 */

/**
 * Convert any date string format to ISO format (yyyy-MM-dd) for HTML date inputs
 * @param dateString - Date string in any format (locale or ISO)
 * @returns ISO formatted date string (yyyy-MM-dd) or empty string if invalid
 */
export function toInputDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // returns "yyyy-MM-dd"
  } catch {
    return '';
  }
}

/**
 * Format a date object to ISO format (yyyy-MM-dd)
 * @param date - Date object
 * @returns ISO formatted date string (yyyy-MM-dd)
 */
export function dateToInputFormat(date: Date | null | undefined): string {
  if (!date) return '';
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}
