"use client";

import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import {
  buildTimeOptions,
  DURATION_PRESETS,
  durationMinutesFromRange,
  endsAtFromDuration,
  joinDatetimeLocal,
  nearestTimeOption,
  splitDatetimeLocal,
} from "@/lib/activities/datetime";
import { cn } from "@/lib/utils";

const TIME_OPTIONS = buildTimeOptions(15);

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
  const { date, time } = splitDatetimeLocal(startsAt);
  const durationMinutes = durationMinutesFromRange(startsAt, endsAt || null);
  const selectedTime = nearestTimeOption(time);

  const durationOptions = useMemo(() => {
    const presets = [...DURATION_PRESETS];

    if (
      durationMinutes !== null &&
      !presets.some((option) => option.value === durationMinutes)
    ) {
      presets.push({
        value: durationMinutes,
        label: `${durationMinutes} minutos`,
      });
    }

    return presets;
  }, [durationMinutes]);

  function handleStartsAtChange(nextStartsAt: string) {
    onStartsAtChange(nextStartsAt);

    if (durationMinutes !== null) {
      const nextEndsAt = endsAtFromDuration(nextStartsAt, durationMinutes);
      onEndsAtChange(nextEndsAt ?? "");
    }
  }

  function updateDuration(rawValue: string) {
    if (!rawValue) {
      onEndsAtChange("");
      return;
    }

    const minutes = Number(rawValue);
    const nextEndsAt = endsAtFromDuration(startsAt, minutes);
    onEndsAtChange(nextEndsAt ?? "");
  }

  const selectClassName = elevated
    ? "[&_button]:h-12 [&_button]:rounded-xl [&_button]:text-base"
    : undefined;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-date`}>Data</Label>
        <DatePicker
          id={`${idPrefix}-date`}
          value={date}
          onChange={(nextDate) => {
            if (!nextDate) {
              return;
            }

            handleStartsAtChange(joinDatetimeLocal(nextDate, selectedTime));
          }}
          disabled={disabled}
          required
          className={elevated ? "[&_button]:h-12 [&_button]:text-base" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-time`}>Horário</Label>
        <SelectField
          id={`${idPrefix}-time`}
          value={selectedTime}
          disabled={disabled}
          required
          className={selectClassName}
          onChange={(event) => {
            handleStartsAtChange(joinDatetimeLocal(date, event.target.value));
          }}
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="space-y-2 sm:col-span-1">
        <Label htmlFor={`${idPrefix}-duration`}>Duração</Label>
        <SelectField
          id={`${idPrefix}-duration`}
          value={durationMinutes === null ? "" : String(durationMinutes)}
          disabled={disabled}
          className={selectClassName}
          onChange={(event) => updateDuration(event.target.value)}
        >
          {durationOptions.map((option) => (
            <option
              key={option.label}
              value={option.value === null ? "" : String(option.value)}
            >
              {option.label}
            </option>
          ))}
        </SelectField>
        <p className="text-xs text-muted-foreground">
          Opcional. Define o término a partir do horário de início.
        </p>
      </div>
    </div>
  );
}
