// features/automations/utils/dateTime.ts
// Utilities for handling date/time formatting for automation API
// Based on backend validator requirements

export function toOnDate(d: Date): string {
  // yyyy-mm-dd format (exactly as specified)
  return d.toISOString().slice(0, 10);
}

export function toOnTime(d: Date): string {
  // hh:mm 24h format (exactly as specified)
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateComponents(year: number, month: number, day: number): string {
  // Format separate date components to YYYY-MM-DD
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatTimeComponents(hours: number, minutes: number): string {
  // Format separate time components to HH:MM (24-hour)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Validation regex patterns
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^\d{2}:\d{2}$/;

export function validateOnDateTrigger(data: { onDate?: string; onTime?: string; triggerType?: string }) {
  if (data.triggerType !== 'on_date') {
    return; // Only validate for on_date triggers
  }

  const errors: string[] = [];

  if (!data.onDate || !DATE_PATTERN.test(data.onDate)) {
    errors.push('onDate must be in YYYY-MM-DD format');
  }

  if (!data.onTime || !TIME_PATTERN.test(data.onTime)) {
    errors.push('onTime must be in HH:MM format (24-hour)');
  }

  if (errors.length > 0) {
    throw new Error(`Date/time validation failed: ${errors.join(', ')}`);
  }
}

// Helper to ensure date/time fields are properly formatted for API
export function sanitizeDateTimeFields(input: any) {
  const sanitized = { ...input };

  // If triggerType is on_date, ensure onDate and onTime are properly formatted
  if (sanitized.triggerType === 'on_date') {
    // If onDate is a Date object, convert it
    if (sanitized.onDate instanceof Date) {
      sanitized.onDate = toOnDate(sanitized.onDate);
    }
    
    // If onTime is a Date object, extract time
    if (sanitized.onTime instanceof Date) {
      sanitized.onTime = toOnTime(sanitized.onTime);
    }

    // If we have a combined datetime and need to split it
    if (sanitized.datetime instanceof Date) {
      sanitized.onDate = toOnDate(sanitized.datetime);
      sanitized.onTime = toOnTime(sanitized.datetime);
      delete sanitized.datetime;
    }

    // Validate the final format
    validateOnDateTrigger(sanitized);
  }

  return sanitized;
}