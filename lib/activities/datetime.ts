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
    day: "numeric",
    month: "long",
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

export const DURATION_PRESETS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Sem duração definida" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora e 30 minutos" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
  { value: 240, label: "4 horas" },
];

export function buildTimeOptions(
  stepMinutes = 15,
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    options.push({
      value,
      label: value,
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
