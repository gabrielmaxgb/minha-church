"use client";

import { useMemo } from "react";
import { Repeat } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { FormMessage } from "@/components/ui/form-field";
import {
  applyRecurrencePreset,
  buildRecurrencePresetOptions,
  eventSpansMultipleCalendarDays,
  intervalUnitLabel,
  presetFromFormState,
  WEEKDAY_OPTIONS,
  type EventRecurrenceFormState,
  type RecurrencePresetId,
} from "@/lib/events/recurrence";
import { cn } from "@/lib/utils";

interface EventRecurrenceFieldsProps {
  value: EventRecurrenceFormState;
  onChange: (value: EventRecurrenceFormState) => void;
  startsAt: string;
  /** Para hint quando o evento cobre mais de um dia. */
  endsAt?: string;
  disabled?: boolean;
  idPrefix?: string;
  endDateError?: string;
}

export function EventRecurrenceFields({
  value,
  onChange,
  startsAt,
  endsAt,
  disabled = false,
  idPrefix = "event",
  endDateError,
}: EventRecurrenceFieldsProps) {
  const presetOptions = useMemo(
    () => buildRecurrencePresetOptions(startsAt),
    [startsAt],
  );
  const selectedPreset = presetFromFormState(value, startsAt);
  const showAdvanced = selectedPreset === "custom";
  const multiDay = eventSpansMultipleCalendarDays(startsAt, endsAt);
  const startDate = new Date(startsAt);
  const monthlyDay = Number.isNaN(startDate.getTime())
    ? "—"
    : startDate.getDate();

  function update(patch: Partial<EventRecurrenceFormState>) {
    onChange({ ...value, ...patch });
  }

  function handlePresetChange(next: RecurrencePresetId) {
    onChange(applyRecurrencePreset(next, startsAt, value));
  }

  function toggleWeekday(day: number) {
    const next = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((item) => item !== day)
      : [...value.daysOfWeek, day].sort((a, b) => a - b);

    update({ daysOfWeek: next.length > 0 ? next : [day] });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-muted/15 p-4">
      <div className="flex items-center gap-2">
        <Repeat className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Repetição</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-repeat-preset`}>Frequência</Label>
        <SelectField
          id={`${idPrefix}-repeat-preset`}
          value={selectedPreset}
          onChange={(event) =>
            handlePresetChange(event.target.value as RecurrencePresetId)
          }
          disabled={disabled}
        >
          {presetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        {multiDay ? (
          <p className="text-xs text-muted-foreground">
            Cada ocorrência usa o mesmo intervalo de início e fim.
          </p>
        ) : null}
      </div>

      {showAdvanced ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-repeat-mode`}>Tipo</Label>
            <SelectField
              id={`${idPrefix}-repeat-mode`}
              value={value.repeatMode === "none" ? "weekly" : value.repeatMode}
              onChange={(event) =>
                update({
                  repeatMode: event.target
                    .value as EventRecurrenceFormState["repeatMode"],
                })
              }
              disabled={disabled}
            >
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
              <option value="yearly">Anualmente</option>
            </SelectField>
          </div>

          <div className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-repeat-interval`}>A cada</Label>
              <Input
                id={`${idPrefix}-repeat-interval`}
                type="number"
                min={1}
                max={99}
                value={value.interval}
                onChange={(event) =>
                  update({
                    interval: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                disabled={disabled}
              />
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              {intervalUnitLabel(
                value.repeatMode === "none" ? "weekly" : value.repeatMode,
                value.interval,
              )}
            </p>
          </div>

          {value.repeatMode === "weekly" ? (
            <div className="space-y-2">
              <Label>Repetir nos dias</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((day, index) => {
                  const active = value.daysOfWeek.includes(day.value);

                  return (
                    <button
                      key={`${day.value}-${index}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleWeekday(day.value)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/60",
                      )}
                      title={day.fullLabel}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {value.repeatMode === "monthly" ? (
            <p className="text-sm text-muted-foreground">
              Repete no dia{" "}
              <span className="font-medium text-foreground">{monthlyDay}</span>{" "}
              de cada mês (meses sem esse dia são ignorados).
            </p>
          ) : null}

          {value.repeatMode === "yearly" ? (
            <p className="text-sm text-muted-foreground">
              Repete na mesma data todos os anos, a partir do primeiro evento.
            </p>
          ) : null}

          <div className="space-y-3">
            <Label>Termina em</Label>
            <div className="space-y-2">
              <EndOption
                checked={value.endType === "never"}
                onChange={() => update({ endType: "never" })}
                disabled={disabled}
                label="Nunca"
              />
              <EndOption
                checked={value.endType === "on_date"}
                onChange={() => update({ endType: "on_date" })}
                disabled={disabled}
                label="Em"
              >
                <DatePicker
                  id={`${idPrefix}-recurrence-end-date`}
                  value={value.endDate}
                  onChange={(endDate) =>
                    update({ endDate, endType: "on_date" })
                  }
                  disabled={disabled || value.endType !== "on_date"}
                  className={cn(
                    "min-w-[12rem] max-w-[16rem]",
                    endDateError && "border-destructive/50",
                  )}
                />
              </EndOption>
              {endDateError ? <FormMessage>{endDateError}</FormMessage> : null}
              <EndOption
                checked={value.endType === "after_count"}
                onChange={() => update({ endType: "after_count" })}
                disabled={disabled}
                label="Após"
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={2}
                    max={200}
                    value={value.maxOccurrences}
                    onChange={(event) =>
                      update({
                        maxOccurrences: Math.max(
                          2,
                          Number(event.target.value) || 2,
                        ),
                        endType: "after_count",
                      })
                    }
                    disabled={disabled || value.endType !== "after_count"}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    ocorrências
                  </span>
                </div>
              </EndOption>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function EndOption({
  checked,
  onChange,
  disabled,
  label,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="size-4 accent-primary"
      />
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
