import type { ChurchEvent } from "@/types/events";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/** Chave local `YYYY-MM-DD` para agrupar eventos no calendário. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateKeyFromIso(iso: string): string {
  return toDateKey(new Date(iso));
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayTitle(dateKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDateKey(dateKey));
}

/** Grade de 42 dias (6 semanas) começando no domingo. */
export function buildMonthGrid(year: number, monthIndex: number): Date[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startOffset);
  const cells: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    cells.push(day);
  }

  return cells;
}

export function getMonthQueryRange(
  year: number,
  monthIndex: number,
): { from: string; to: string } {
  const grid = buildMonthGrid(year, monthIndex);

  return {
    from: toDateKey(grid[0]),
    to: toDateKey(grid[grid.length - 1]),
  };
}

export function groupEventsByDateKey(
  events: ChurchEvent[],
): Map<string, ChurchEvent[]> {
  const groups = new Map<string, ChurchEvent[]>();

  for (const event of events) {
    const key = dateKeyFromIso(event.startsAt);
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  for (const bucket of groups.values()) {
    bucket.sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }

  return groups;
}

export function startsAtForDateKey(dateKey: string, hour = 19, minute = 0): string {
  const date = parseDateKey(dateKey);
  date.setHours(hour, minute, 0, 0);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isSameMonth(date: Date, year: number, monthIndex: number): boolean {
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

export function isToday(date: Date): boolean {
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
