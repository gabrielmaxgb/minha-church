import type { WorshipAvailabilityPeriod } from "@/lib/ministries/worship";

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addUtcMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function startOfUtcWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfUtcDay(addUtcDays(date, diff));
}

function endOfUtcMonth(date: Date): Date {
  return endOfUtcDay(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
  );
}

function startOfUtcQuarter(date: Date): Date {
  const quarterMonth = Math.floor(date.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(date.getUTCFullYear(), quarterMonth, 1));
}

function endOfUtcQuarter(date: Date): Date {
  const start = startOfUtcQuarter(date);
  return endOfUtcDay(addUtcDays(addUtcMonths(start, 3), -1));
}

function startOfUtcHalfYear(date: Date): Date {
  const month = date.getUTCMonth() < 6 ? 0 : 6;
  return new Date(Date.UTC(date.getUTCFullYear(), month, 1));
}

function endOfUtcHalfYear(date: Date): Date {
  const start = startOfUtcHalfYear(date);
  return endOfUtcDay(addUtcDays(addUtcMonths(start, 6), -1));
}

function endOfUtcYear(date: Date): Date {
  return endOfUtcDay(new Date(Date.UTC(date.getUTCFullYear(), 11, 31)));
}

export function defaultPeriodStart(
  periodType: WorshipAvailabilityPeriod,
  reference = new Date(),
): Date {
  switch (periodType) {
    case "weekly":
      return startOfUtcWeek(reference);
    case "monthly":
      return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
    case "quarterly":
      return startOfUtcQuarter(reference);
    case "semiannual":
      return startOfUtcHalfYear(reference);
    case "annual":
      return new Date(Date.UTC(reference.getUTCFullYear(), 0, 1));
    default:
      return startOfUtcDay(reference);
  }
}

export function computePeriodBounds(
  periodType: WorshipAvailabilityPeriod,
  startDate: Date,
): { start: Date; end: Date } {
  const start = startOfUtcDay(startDate);

  switch (periodType) {
    case "weekly":
      return { start, end: endOfUtcDay(addUtcDays(start, 6)) };
    case "monthly":
      return { start, end: endOfUtcMonth(start) };
    case "quarterly":
      return { start, end: endOfUtcQuarter(start) };
    case "semiannual":
      return { start, end: endOfUtcHalfYear(start) };
    case "annual":
      return { start, end: endOfUtcYear(start) };
    default:
      return { start, end: endOfUtcMonth(start) };
  }
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
