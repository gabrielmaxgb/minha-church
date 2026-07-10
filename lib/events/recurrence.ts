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
    return `${base} até ${new Intl.DateTimeFormat("pt-BR").format(new Date(`${recurrence.endDate}T12:00:00`))}`;
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
