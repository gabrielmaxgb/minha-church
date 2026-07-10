import type { ChurchEvent } from "@/types/events";

export interface WeekDayBucket {
  key: string;
  label: string;
  shortLabel: string;
  date: Date;
  isToday: boolean;
  count: number;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Próximos 7 dias (hoje → +6) com contagem de eventos — visual honesto da semana. */
export function buildWeekDensity(
  events: ChurchEvent[],
  from = new Date(),
): WeekDayBucket[] {
  const start = startOfDay(from);
  const buckets: WeekDayBucket[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);

    buckets.push({
      key: dayKey(date),
      label: new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date),
      shortLabel: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      date,
      isToday: offset === 0,
      count: 0,
    });
  }

  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  for (const event of events) {
    const eventDate = new Date(event.startsAt);
    if (eventDate < start || eventDate >= end) continue;

    const key = dayKey(startOfDay(eventDate));
    const index = indexByKey.get(key);
    if (index === undefined) continue;
    buckets[index].count += 1;
  }

  return buckets;
}

export function formatEventCountdown(iso: string, now = new Date()): string | null {
  const diffMs = new Date(iso).getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.round(diffMs / (1000 * 60));
  if (totalMinutes < 60) {
    return `em ${Math.max(totalMinutes, 1)} min`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `em ${totalHours}h`;
  }

  const days = Math.floor(totalHours / 24);
  if (days === 1) {
    return "amanhã";
  }

  return `em ${days} dias`;
}
