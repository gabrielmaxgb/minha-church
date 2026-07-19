export type EventRecurrenceFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type EventRepeatMode = "none" | EventRecurrenceFrequency;

export type EventRecurrenceEndType = "never" | "on_date" | "after_count";

export interface EventRecurrence {
  seriesId: string;
  frequency: EventRecurrenceFrequency;
  interval: number;
  daysOfWeek: number[];
  endDate: string | null;
  maxOccurrences: number | null;
}

export interface EventRecurrenceInput {
  frequency: EventRecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
  maxOccurrences?: number;
}

export interface EventRecurrenceFormState {
  repeatMode: EventRepeatMode;
  interval: number;
  daysOfWeek: number[];
  endType: EventRecurrenceEndType;
  endDate: string;
  maxOccurrences: number;
}

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "D", fullLabel: "Domingo" },
  { value: 1, label: "S", fullLabel: "Segunda" },
  { value: 2, label: "T", fullLabel: "Terça" },
  { value: 3, label: "Q", fullLabel: "Quarta" },
  { value: 4, label: "Q", fullLabel: "Quinta" },
  { value: 5, label: "S", fullLabel: "Sexta" },
  { value: 6, label: "S", fullLabel: "Sábado" },
] as const;

export const REPEAT_MODE_OPTIONS: Array<{
  value: EventRepeatMode;
  label: string;
}> = [
  { value: "none", label: "Não se repete" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
  { value: "yearly", label: "Anualmente" },
];

export function defaultRecurrenceFormState(startsAt: string): EventRecurrenceFormState {
  const startDate = new Date(startsAt);

  return {
    repeatMode: "none",
    interval: 1,
    daysOfWeek: [startDate.getDay()],
    endType: "never",
    endDate: "",
    maxOccurrences: 10,
  };
}

export function recurrenceFormStateFromEvent(
  recurrence: EventRecurrence | null | undefined,
  startsAt: string,
): EventRecurrenceFormState {
  const base = defaultRecurrenceFormState(startsAt);

  if (!recurrence) {
    return base;
  }

  return {
    repeatMode: recurrence.frequency,
    interval: recurrence.interval,
    daysOfWeek:
      recurrence.daysOfWeek.length > 0
        ? [...recurrence.daysOfWeek]
        : base.daysOfWeek,
    endType: recurrence.endDate
      ? "on_date"
      : recurrence.maxOccurrences
        ? "after_count"
        : "never",
    endDate: recurrence.endDate ?? "",
    maxOccurrences: recurrence.maxOccurrences ?? 10,
  };
}

export function recurrenceFormStatesEqual(
  a: EventRecurrenceFormState,
  b: EventRecurrenceFormState,
): boolean {
  return (
    a.repeatMode === b.repeatMode &&
    a.interval === b.interval &&
    a.endType === b.endType &&
    a.endDate === b.endDate &&
    a.maxOccurrences === b.maxOccurrences &&
    a.daysOfWeek.join(",") === b.daysOfWeek.join(",")
  );
}

export function syncRecurrenceDaysWithStart(
  state: EventRecurrenceFormState,
  startsAt: string,
): EventRecurrenceFormState {
  if (state.repeatMode !== "weekly") {
    return state;
  }

  const day = new Date(startsAt).getDay();

  if (state.daysOfWeek.includes(day)) {
    return state;
  }

  return {
    ...state,
    daysOfWeek: [...state.daysOfWeek, day].sort((a, b) => a - b),
  };
}

export function buildRecurrencePayload(
  state: EventRecurrenceFormState,
): EventRecurrenceInput | undefined {
  if (state.repeatMode === "none") {
    return undefined;
  }

  const payload: EventRecurrenceInput = {
    frequency: state.repeatMode,
    interval: state.interval,
  };

  if (state.repeatMode === "weekly") {
    payload.daysOfWeek =
      state.daysOfWeek.length > 0 ? state.daysOfWeek : [new Date().getDay()];
  }

  if (state.endType === "on_date" && state.endDate) {
    payload.endDate = state.endDate;
  }

  if (state.endType === "after_count") {
    payload.maxOccurrences = state.maxOccurrences;
  }

  return payload;
}

export function formatRecurrenceSummary(
  recurrence: EventRecurrence,
  startsAt: string,
): string {
  const interval = recurrence.interval;

  let base = "";

  switch (recurrence.frequency) {
    case "daily":
      base =
        interval === 1
          ? "Todos os dias"
          : `A cada ${interval} dias`;
      break;
    case "weekly": {
      const dayNames = recurrence.daysOfWeek
        .map(
          (day) =>
            WEEKDAY_OPTIONS.find((option) => option.value === day)?.fullLabel,
        )
        .filter(Boolean)
        .join(", ");
      base =
        interval === 1
          ? `Toda semana (${dayNames})`
          : `A cada ${interval} semanas (${dayNames})`;
      break;
    }
    case "monthly": {
      const day = new Date(startsAt).getDate();
      base =
        interval === 1
          ? `Todo mês no dia ${day}`
          : `A cada ${interval} meses no dia ${day}`;
      break;
    }
    case "yearly":
      base =
        interval === 1
          ? "Todo ano na mesma data"
          : `A cada ${interval} anos na mesma data`;
      break;
  }

  if (recurrence.endDate) {
    return `${base} até ${new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${recurrence.endDate}T12:00:00`))}`;
  }

  if (recurrence.maxOccurrences) {
    return `${base} · ${recurrence.maxOccurrences} ocorrências`;
  }

  return `${base} · sem data final`;
}

export function intervalUnitLabel(mode: EventRepeatMode, count: number): string {
  switch (mode) {
    case "daily":
      return count === 1 ? "dia" : "dias";
    case "weekly":
      return count === 1 ? "semana" : "semanas";
    case "monthly":
      return count === 1 ? "mês" : "meses";
    case "yearly":
      return count === 1 ? "ano" : "anos";
    default:
      return "";
  }
}

export type RecurrencePresetId =
  | "none"
  | "daily"
  | "weekly_start"
  | "monthly_date"
  | "yearly"
  | "weekdays"
  | "custom";

export const WEEKDAY_PRESET = [1, 2, 3, 4, 5] as const;

function safeStartDate(startsAt: string): Date {
  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function weekdayFullLabel(day: number): string {
  return (
    WEEKDAY_OPTIONS.find((option) => option.value === day)?.fullLabel ??
    "dia"
  );
}

export function formatYearlyPresetLabel(startsAt: string): string {
  const date = safeStartDate(startsAt);
  const label = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(date);

  return `Anual em ${label}`;
}

export function buildRecurrencePresetOptions(
  startsAt: string,
): Array<{ value: RecurrencePresetId; label: string }> {
  const date = safeStartDate(startsAt);
  const weekday = weekdayFullLabel(date.getDay()).toLowerCase();
  const monthDay = date.getDate();

  return [
    { value: "none", label: "Não se repete" },
    { value: "daily", label: "Todos os dias" },
    { value: "weekly_start", label: `Semanal: cada ${weekday}` },
    { value: "monthly_date", label: `Mensal no dia ${monthDay}` },
    { value: "yearly", label: formatYearlyPresetLabel(startsAt) },
    {
      value: "weekdays",
      label: "Todos os dias da semana (segunda a sexta)",
    },
    { value: "custom", label: "Personalizar…" },
  ];
}

function sameDays(a: number[], b: readonly number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);

  return left.every((day, index) => day === right[index]);
}

/** Detecta se o estado atual cabe num preset simples (sem fim custom / interval > 1). */
export function presetFromFormState(
  state: EventRecurrenceFormState,
  startsAt: string,
): RecurrencePresetId {
  if (state.repeatMode === "none") {
    return "none";
  }

  const hasCustomEnd =
    state.endType === "on_date" || state.endType === "after_count";
  const hasCustomInterval = state.interval !== 1;

  if (hasCustomEnd || hasCustomInterval) {
    return "custom";
  }

  const startDay = safeStartDate(startsAt).getDay();

  if (state.repeatMode === "daily") {
    return "daily";
  }

  if (state.repeatMode === "weekly") {
    if (sameDays(state.daysOfWeek, WEEKDAY_PRESET)) {
      return "weekdays";
    }

    if (
      state.daysOfWeek.length === 1 &&
      state.daysOfWeek[0] === startDay
    ) {
      return "weekly_start";
    }

    return "custom";
  }

  if (state.repeatMode === "monthly") {
    return "monthly_date";
  }

  if (state.repeatMode === "yearly") {
    return "yearly";
  }

  return "custom";
}

export function applyRecurrencePreset(
  preset: RecurrencePresetId,
  startsAt: string,
  current: EventRecurrenceFormState,
): EventRecurrenceFormState {
  const startDay = safeStartDate(startsAt).getDay();

  switch (preset) {
    case "none":
      return {
        ...current,
        repeatMode: "none",
        interval: 1,
        daysOfWeek: [startDay],
        endType: "never",
        endDate: "",
      };
    case "daily":
      return {
        ...current,
        repeatMode: "daily",
        interval: 1,
        daysOfWeek: [startDay],
        endType: "never",
        endDate: "",
      };
    case "weekly_start":
      return {
        ...current,
        repeatMode: "weekly",
        interval: 1,
        daysOfWeek: [startDay],
        endType: "never",
        endDate: "",
      };
    case "monthly_date":
      return {
        ...current,
        repeatMode: "monthly",
        interval: 1,
        daysOfWeek: [startDay],
        endType: "never",
        endDate: "",
      };
    case "yearly":
      return {
        ...current,
        repeatMode: "yearly",
        interval: 1,
        daysOfWeek: [startDay],
        endType: "never",
        endDate: "",
      };
    case "weekdays":
      return {
        ...current,
        repeatMode: "weekly",
        interval: 1,
        daysOfWeek: [...WEEKDAY_PRESET],
        endType: "never",
        endDate: "",
      };
    case "custom":
      if (current.repeatMode === "none") {
        return {
          ...current,
          repeatMode: "weekly",
          interval: 1,
          daysOfWeek: [startDay],
          endType: "never",
          endDate: "",
        };
      }

      return current;
  }
}

export function eventSpansMultipleCalendarDays(
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
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth() ||
    start.getDate() !== end.getDate()
  );
}

