"use client";

import { useMemo } from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { TypeaheadSelect } from "@/components/ui/typeahead-select";
import {
  adjustEndsAtAfterStartChange,
  buildTimeOptions,
  defaultEndsAt,
  formatScheduleSpanLabel,
  fromAllDayRange,
  isAllDayRange,
  isValidScheduleRange,
  joinDatetimeLocal,
  nearestTimeOption,
  splitDatetimeLocal,
  toAllDayRange,
} from "@/lib/activities/datetime";
import { cn } from "@/lib/utils";

const TIME_OPTIONS = buildTimeOptions(15);

const chipDateClass =
  "w-auto shrink-0 [&_button]:h-9 [&_button]:w-auto [&_button]:min-w-0 [&_button]:border-transparent [&_button]:bg-muted/55 [&_button]:px-3 [&_button]:pr-9 [&_button]:font-medium [&_button]:shadow-none [&_button]:hover:bg-muted [&_button]:focus-visible:bg-muted";

const chipTimeClass =
  "w-[5.75rem] shrink-0 [&_input]:h-9 [&_input]:border-transparent [&_input]:bg-muted/55 [&_input]:px-3 [&_input]:pr-8 [&_input]:text-center [&_input]:font-medium [&_input]:tabular-nums [&_input]:shadow-none [&_input]:hover:bg-muted [&_input]:focus-visible:bg-muted sm:[&_input]:h-9";

const chipDateElevatedClass =
  "[&_button]:h-11 [&_button]:rounded-xl [&_button]:text-base";

const chipTimeElevatedClass =
  "w-28 [&_input]:h-11 [&_input]:rounded-xl [&_input]:text-base";

interface ActivityScheduleFieldsProps {
  startsAt: string;
  endsAt: string;
  onStartsAtChange: (value: string) => void;
  onEndsAtChange: (value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  className?: string;
  elevated?: boolean;
}

export function ActivityScheduleFields({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
  disabled = false,
  idPrefix = "activity",
  className,
  elevated = false,
}: ActivityScheduleFieldsProps) {
  const endSource = endsAt || defaultEndsAt(startsAt);
  const allDay = isAllDayRange(startsAt, endSource);
  const start = splitDatetimeLocal(startsAt);
  const end = splitDatetimeLocal(endSource);
  const startTime = nearestTimeOption(start.time);
  const endTime = nearestTimeOption(end.time);
  const rangeInvalid =
    Boolean(endsAt) && !isValidScheduleRange(startsAt, endsAt, allDay);
  const spanLabel = formatScheduleSpanLabel(startsAt, endSource, allDay);
  const multiDay = start.date !== end.date;

  const timeOptions = useMemo(() => TIME_OPTIONS, []);

  const dateClassName = cn(
    chipDateClass,
    elevated && chipDateElevatedClass,
  );
  const timeClassName = cn(
    chipTimeClass,
    elevated && chipTimeElevatedClass,
  );

  function applyRange(nextStartsAt: string, nextEndsAt: string) {
    onStartsAtChange(nextStartsAt);
    onEndsAtChange(nextEndsAt);
  }

  function handleStartDateChange(nextDate: string) {
    if (allDay) {
      const range = toAllDayRange(nextDate, end.date);
      applyRange(range.startsAt, range.endsAt);
      return;
    }

    const nextStartsAt = joinDatetimeLocal(nextDate, startTime);
    const nextEndsAt = adjustEndsAtAfterStartChange(
      nextStartsAt,
      startsAt,
      endsAt || defaultEndsAt(startsAt),
    );
    applyRange(nextStartsAt, nextEndsAt);
  }

  function handleStartTimeChange(nextTime: string) {
    const nextStartsAt = joinDatetimeLocal(
      start.date,
      nearestTimeOption(nextTime),
    );
    const nextEndsAt = adjustEndsAtAfterStartChange(
      nextStartsAt,
      startsAt,
      endsAt || defaultEndsAt(startsAt),
    );
    applyRange(nextStartsAt, nextEndsAt);
  }

  function handleEndDateChange(nextDate: string) {
    if (allDay) {
      const range = toAllDayRange(start.date, nextDate);
      applyRange(range.startsAt, range.endsAt);
      return;
    }

    onEndsAtChange(joinDatetimeLocal(nextDate, endTime));
  }

  function handleEndTimeChange(nextTime: string) {
    onEndsAtChange(joinDatetimeLocal(end.date, nearestTimeOption(nextTime)));
  }

  function handleAllDayChange(nextAllDay: boolean) {
    if (nextAllDay) {
      const range = toAllDayRange(start.date, end.date);
      applyRange(range.startsAt, range.endsAt);
      return;
    }

    const range = fromAllDayRange(start.date, end.date);
    applyRange(range.startsAt, range.endsAt);
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-muted/15",
        className,
      )}
    >
      <div className="px-3.5 py-3.5">
        <ScheduleMoment
          label="Início"
          rail="start"
        >
          <DatePicker
            id={`${idPrefix}-start-date`}
            value={start.date}
            onChange={(nextDate) => {
              if (!nextDate) {
                return;
              }

              handleStartDateChange(nextDate);
            }}
            disabled={disabled}
            required
            className={dateClassName}
          />
          {!allDay ? (
            <TypeaheadSelect
              id={`${idPrefix}-start-time`}
              value={startTime}
              options={timeOptions}
              placeholder="19:00"
              emptyMessage="Nenhum horário encontrado."
              disabled={disabled}
              required
              className={timeClassName}
              onChange={handleStartTimeChange}
            />
          ) : null}
        </ScheduleMoment>

        <div className="flex gap-3">
          <div className="flex w-5 justify-center" aria-hidden>
            <span className="w-px bg-border/80" />
          </div>
          <div className="flex min-h-7 items-center py-0.5">
            {rangeInvalid ? (
              <p className="text-xs font-medium text-destructive" role="alert">
                Fim precisa ser depois do início
              </p>
            ) : spanLabel ? (
              <p className="text-xs tabular-nums text-muted-foreground">
                {spanLabel}
              </p>
            ) : (
              <span className="h-3" />
            )}
          </div>
        </div>

        <ScheduleMoment
          label="Fim"
          rail="end"
        >
          <DatePicker
            id={`${idPrefix}-end-date`}
            value={end.date}
            onChange={(nextDate) => {
              if (!nextDate) {
                return;
              }

              handleEndDateChange(nextDate);
            }}
            disabled={disabled}
            required
            className={dateClassName}
          />
          {!allDay ? (
            <TypeaheadSelect
              id={`${idPrefix}-end-time`}
              value={endTime}
              options={timeOptions}
              placeholder="20:00"
              emptyMessage="Nenhum horário encontrado."
              disabled={disabled}
              required
              className={timeClassName}
              onChange={handleEndTimeChange}
            />
          ) : null}
        </ScheduleMoment>

        {multiDay && !rangeInvalid ? (
          <p className="mt-2.5 pl-8 text-xs text-muted-foreground">
            Aparece em todos os dias do intervalo.
          </p>
        ) : null}
      </div>

      <label
        htmlFor={`${idPrefix}-all-day`}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 bg-background/40 px-3.5 py-3",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <span className="text-sm font-medium text-foreground">Dia inteiro</span>
        <AllDaySwitch
          id={`${idPrefix}-all-day`}
          checked={allDay}
          disabled={disabled}
          onCheckedChange={handleAllDayChange}
        />
      </label>
    </div>
  );
}

function ScheduleMoment({
  label,
  rail,
  children,
}: {
  label: string;
  rail: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex w-5 shrink-0 flex-col items-center",
          rail === "start" ? "pt-2" : "justify-start",
        )}
        aria-hidden
      >
        {rail === "end" ? <span className="mb-0 h-2 w-px bg-border/80" /> : null}
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            rail === "start"
              ? "bg-foreground"
              : "border-2 border-foreground bg-background",
          )}
        />
        {rail === "start" ? (
          <span className="mt-1 w-px flex-1 bg-border/80" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5 pb-1">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </div>
  );
}

function AllDaySwitch({
  id,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Dia inteiro"
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-foreground" : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
