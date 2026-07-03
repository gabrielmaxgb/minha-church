"use client";

import { Repeat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  intervalUnitLabel,
  REPEAT_MODE_OPTIONS,
  WEEKDAY_OPTIONS,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import { cn } from "@/lib/utils";

interface EventRecurrenceFieldsProps {
  value: EventRecurrenceFormState;
  onChange: (value: EventRecurrenceFormState) => void;
  startsAt: string;
  disabled?: boolean;
}

export function EventRecurrenceFields({
  value,
  onChange,
  startsAt,
  disabled = false,
}: EventRecurrenceFieldsProps) {
  const isRecurring = value.repeatMode !== "none";
  const startDate = new Date(startsAt);
  const monthlyDay = Number.isNaN(startDate.getTime())
    ? "—"
    : startDate.getDate();

  function update(patch: Partial<EventRecurrenceFormState>) {
    onChange({ ...value, ...patch });
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
        <Label htmlFor="event-repeat-mode">Frequência</Label>
        <SelectField
          id="event-repeat-mode"
          value={value.repeatMode}
          onChange={(event) =>
            update({
              repeatMode: event.target.value as EventRecurrenceFormState["repeatMode"],
            })
          }
          disabled={disabled}
        >
          {REPEAT_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>

      {isRecurring && (
        <>
          <div className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="event-repeat-interval">A cada</Label>
              <Input
                id="event-repeat-interval"
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
              {intervalUnitLabel(value.repeatMode, value.interval)}
            </p>
          </div>

          {value.repeatMode === "weekly" && (
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
          )}

          {value.repeatMode === "monthly" && (
            <p className="text-sm text-muted-foreground">
              Repete no dia <span className="font-medium text-foreground">{monthlyDay}</span>{" "}
              de cada mês (meses sem esse dia são ignorados).
            </p>
          )}

          {value.repeatMode === "yearly" && (
            <p className="text-sm text-muted-foreground">
              Repete na mesma data todos os anos, a partir do primeiro evento.
            </p>
          )}

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
                <Input
                  type="date"
                  value={value.endDate}
                  onChange={(event) =>
                    update({ endDate: event.target.value, endType: "on_date" })
                  }
                  disabled={disabled || value.endType !== "on_date"}
                  className="max-w-[11rem]"
                />
              </EndOption>
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
                  <span className="text-sm text-muted-foreground">ocorrências</span>
                </div>
              </EndOption>
            </div>
          </div>
        </>
      )}
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
