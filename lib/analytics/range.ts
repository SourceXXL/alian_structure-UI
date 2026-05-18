import { AnalyticsRange } from './types';

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export function getRangeDays(range: AnalyticsRange): number {
  return RANGE_DAYS[range];
}

export function getRangeStartDate(range: AnalyticsRange, now = new Date()): Date {
  const days = getRangeDays(range);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function formatDateKey(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return parsed.toISOString().slice(0, 10);
}
