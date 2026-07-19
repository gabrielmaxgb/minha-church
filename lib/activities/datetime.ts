export function defaultStartsAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(19, 0, 0, 0);
  return toDatetimeLocalValue(date);
}

export function toDatetimeLocalValue(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value.includes("T")) {
    return { date: value.slice(0, 10), time: "19:00" };
  }

  const [date, time = "19:00"] = value.split("T");

  return {
    date,
    time: time.slice(0, 5),
  };
}

export function joinDatetimeLocal(date: string, time: string): string {
  return `${date}T${time}`;
}

export function formatDisplayDate(dateKey: string): string {
  if (!dateKey) {
    return "Selecionar data";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function durationMinutesFromRange(
  startsAt: string,
  endsAt: string | null | undefined,
): number | null {
  if (!endsAt) {
    return null;
  }

  const minutes = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000,
  );

  if (minutes <= 0) {
    return null;
  }

  return minutes;
}

export function endsAtFromDuration(
  startsAt: string,
  durationMinutes: number | null,
): string | null {
  if (durationMinutes === null || durationMinutes <= 0) {
    return null;
  }

  const start = new Date(startsAt);
  start.setMinutes(start.getMinutes() + durationMinutes);

  return toDatetimeLocalValue(start);
}

/** Default end = start + 1 hour (Google-like). */
export function defaultEndsAt(startsAt: string): string {
  return endsAtFromDuration(startsAt, 60) ?? startsAt;
}

export function isEndsAfterStarts(startsAt: string, endsAt: string): boolean {
  if (!startsAt || !endsAt) {
    return true;
  }

  return new Date(endsAt).getTime() > new Date(startsAt).getTime();
}

/**
 * Ao mudar o início, preserva a duração anterior; se o fim ficaria ≤ início,
 * empurra para +1h.
 */
export function adjustEndsAtAfterStartChange(
  nextStartsAt: string,
  previousStartsAt: string,
  previousEndsAt: string,
): string {
  const previousDuration = durationMinutesFromRange(
    previousStartsAt,
    previousEndsAt || null,
  );
  const duration = previousDuration ?? 60;
  const nextEnds = endsAtFromDuration(nextStartsAt, duration);

  if (!nextEnds) {
    return defaultEndsAt(nextStartsAt);
  }

  if (!isEndsAfterStarts(nextStartsAt, nextEnds)) {
    return defaultEndsAt(nextStartsAt);
  }

  return nextEnds;
}

export type TimeSelectOption = {
  value: string;
  label: string;
  searchText: string;
};

/** Digits only — "19:30" / "19 30" / "1930" → "1930". */
export function normalizeTimeQuery(query: string): string {
  return query.replace(/\D/g, "");
}

export function timeOptionSearchText(value: string): string {
  const digits = normalizeTimeQuery(value);
  const [hour = "", minute = ""] = value.split(":");

  return [value, digits, hour, minute, `${hour} ${minute}`]
    .filter(Boolean)
    .join(" ");
}

export function buildTimeOptions(stepMinutes = 15): TimeSelectOption[] {
  const options: TimeSelectOption[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    options.push({
      value,
      label: value,
      searchText: timeOptionSearchText(value),
    });
  }

  return options;
}

export function nearestTimeOption(time: string, stepMinutes = 15): string {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return "19:00";
  }

  const total = hour * 60 + minute;
  const rounded = Math.round(total / stepMinutes) * stepMinutes;
  const clamped = Math.min(Math.max(rounded, 0), 24 * 60 - stepMinutes);
  const nextHour = Math.floor(clamped / 60);
  const nextMinute = clamped % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

/** Convenção sem coluna no banco: início 00:00 + fim 23:59 (hora local). */
export const ALL_DAY_START_TIME = "00:00";
export const ALL_DAY_END_TIME = "23:59";

export function isAllDayRange(
  startsAt: string,
  endsAt: string | null | undefined,
): boolean {
  if (!endsAt) {
    return false;
  }

  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() === 59
  );
}

export function toAllDayRange(startDate: string, endDate: string): {
  startsAt: string;
  endsAt: string;
} {
  const safeEnd = endDate >= startDate ? endDate : startDate;

  return {
    startsAt: joinDatetimeLocal(startDate, ALL_DAY_START_TIME),
    endsAt: joinDatetimeLocal(safeEnd, ALL_DAY_END_TIME),
  };
}

/** Sai do modo dia inteiro: 19:00–20:00 no 1º dia, ou fim ao meio-dia se multi-dia. */
export function fromAllDayRange(startDate: string, endDate: string): {
  startsAt: string;
  endsAt: string;
} {
  const startsAt = joinDatetimeLocal(startDate, "19:00");

  if (endDate > startDate) {
    return {
      startsAt,
      endsAt: joinDatetimeLocal(endDate, "12:00"),
    };
  }

  return {
    startsAt,
    endsAt: defaultEndsAt(startsAt),
  };
}

function localDateKeyFromValue(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return splitDatetimeLocal(value).date;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isValidScheduleRange(
  startsAt: string,
  endsAt: string,
  allDay: boolean,
): boolean {
  if (allDay) {
    return localDateKeyFromValue(endsAt) >= localDateKeyFromValue(startsAt);
  }

  return isEndsAfterStarts(startsAt, endsAt);
}

/** Rótulo curto da duração entre início e fim (ex.: "1 hora", "3 dias"). */
export function formatScheduleSpanLabel(
  startsAt: string,
  endsAt: string,
  allDay: boolean,
): string | null {
  if (!startsAt || !endsAt || !isValidScheduleRange(startsAt, endsAt, allDay)) {
    return null;
  }

  if (allDay) {
    const startKey = localDateKeyFromValue(startsAt);
    const endKey = localDateKeyFromValue(endsAt);
    const start = new Date(`${startKey}T12:00:00`);
    const end = new Date(`${endKey}T12:00:00`);
    const days =
      Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

    if (days <= 1) {
      return "1 dia";
    }

    return `${days} dias`;
  }

  const minutes = durationMinutesFromRange(startsAt, endsAt);

  if (minutes == null) {
    return null;
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) {
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }

  return `${hours}h ${rest}min`;
}


