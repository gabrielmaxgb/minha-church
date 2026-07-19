import {
  isAllDayRange,
} from "@/lib/activities/datetime";

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

export function groupEventsByDateKey<
  T extends { startsAt: string; endsAt?: string | null },
>(events: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const event of events) {
    const startKey = dateKeyFromIso(event.startsAt);
    const endKey = event.endsAt ? dateKeyFromIso(event.endsAt) : startKey;

    const cursor = parseDateKey(startKey);
    const end = parseDateKey(endKey);

    if (end.getTime() < cursor.getTime()) {
      const bucket = groups.get(startKey) ?? [];
      bucket.push(event);
      groups.set(startKey, bucket);
      continue;
    }

    // Todos os dias civis tocados pelo intervalo [start, end].
    while (cursor.getTime() <= end.getTime()) {
      const key = toDateKey(cursor);
      const bucket = groups.get(key) ?? [];
      bucket.push(event);
      groups.set(key, bucket);
      cursor.setDate(cursor.getDate() + 1);
    }
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

export function eventTouchesMultipleDays(event: {
  startsAt: string;
  endsAt?: string | null;
}): boolean {
  if (!event.endsAt) {
    return false;
  }

  return dateKeyFromIso(event.startsAt) !== dateKeyFromIso(event.endsAt);
}

/** Barras no mês: multi-dia ou dia inteiro (Google-like). */
export function shouldRenderAsMonthBar(event: {
  startsAt: string;
  endsAt?: string | null;
}): boolean {
  return (
    eventTouchesMultipleDays(event) ||
    isAllDayRange(event.startsAt, event.endsAt)
  );
}

export type MonthBarSegment<T> = {
  event: T;
  weekIndex: number;
  startCol: number;
  span: number;
  lane: number;
};

/**
 * Segmentos de barra por semana (0–5), com empacotamento em lanes.
 * Só inclui eventos multi-dia / dia inteiro.
 */
export function buildMonthBarSegments<
  T extends { id: string; startsAt: string; endsAt?: string | null },
>(grid: Date[], events: T[]): MonthBarSegment<T>[] {
  const barEvents = events.filter(shouldRenderAsMonthBar);
  const segments: MonthBarSegment<T>[] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const weekDays = grid.slice(weekIndex * 7, weekIndex * 7 + 7);
    const weekStartKey = toDateKey(weekDays[0]);
    const weekEndKey = toDateKey(weekDays[6]);
    const weekStartMs = parseDateKey(weekStartKey).getTime();
    const weekEndMs = parseDateKey(weekEndKey).getTime();

    type RawSeg = {
      event: T;
      startCol: number;
      span: number;
      startMs: number;
    };

    const raw: RawSeg[] = [];

    for (const event of barEvents) {
      const eventStartKey = dateKeyFromIso(event.startsAt);
      const eventEndKey = event.endsAt
        ? dateKeyFromIso(event.endsAt)
        : eventStartKey;
      const eventStartMs = parseDateKey(eventStartKey).getTime();
      const eventEndMs = parseDateKey(eventEndKey).getTime();

      if (eventEndMs < weekStartMs || eventStartMs > weekEndMs) {
        continue;
      }

      const segStartMs = Math.max(eventStartMs, weekStartMs);
      const segEndMs = Math.min(eventEndMs, weekEndMs);
      const startCol = Math.round(
        (segStartMs - weekStartMs) / (24 * 60 * 60 * 1000),
      );
      const endCol = Math.round(
        (segEndMs - weekStartMs) / (24 * 60 * 60 * 1000),
      );
      const span = Math.max(1, endCol - startCol + 1);

      raw.push({
        event,
        startCol: Math.min(Math.max(startCol, 0), 6),
        span: Math.min(span, 7 - Math.min(Math.max(startCol, 0), 6)),
        startMs: eventStartMs,
      });
    }

    raw.sort((a, b) => {
      if (a.startCol !== b.startCol) {
        return a.startCol - b.startCol;
      }

      return b.span - a.span || a.startMs - b.startMs;
    });

    const laneEnds: number[] = [];

    for (const seg of raw) {
      const segEndCol = seg.startCol + seg.span - 1;
      let lane = laneEnds.findIndex((endCol) => seg.startCol > endCol);

      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(segEndCol);
      } else {
        laneEnds[lane] = segEndCol;
      }

      segments.push({
        event: seg.event,
        weekIndex,
        startCol: seg.startCol,
        span: seg.span,
        lane,
      });
    }
  }

  return segments;
}

export function formatEventScheduleLabel(event: {
  startsAt: string;
  endsAt?: string | null;
}): string {
  if (isAllDayRange(event.startsAt, event.endsAt)) {
    const startKey = dateKeyFromIso(event.startsAt);
    const endKey = event.endsAt ? dateKeyFromIso(event.endsAt) : startKey;

    if (startKey === endKey) {
      return "Dia inteiro";
    }

    const startLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(event.startsAt));
    const endLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(event.endsAt!));

    return `Dia inteiro · ${startLabel} – ${endLabel}`;
  }

  const startTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.startsAt));

  if (!event.endsAt) {
    return startTime;
  }

  if (eventTouchesMultipleDays(event)) {
    const startLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(event.startsAt));
    const endLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(event.endsAt));

    return `${startLabel} – ${endLabel}`;
  }

  const endTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.endsAt));

  return `${startTime} – ${endTime}`;
}

