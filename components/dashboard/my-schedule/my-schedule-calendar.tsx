"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ScheduleEventRosterList } from "@/components/dashboard/my-schedule/schedule-event-roster-list";
import { AvailabilityRespondActions } from "@/components/dashboard/my-schedule/availability-respond-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import {
  buildMonthGrid,
  dateKeyFromIso,
  formatDayTitle,
  formatMonthTitle,
  getWeekdayLabels,
  isSameMonth,
  isToday,
  toDateKey,
} from "@/lib/events/calendar";
import {
  getScheduleEventDisplayKind,
  scheduleEventBorderStyle,
  scheduleEventCalendarLabel,
  scheduleEventStyle,
  type ScheduleAvailabilityAction,
} from "@/lib/my-schedule/event-display";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";
import type { MyScheduleEvent } from "@/types/ministries";

function groupEventsByDateKey(
  events: MyScheduleEvent[],
): Map<string, MyScheduleEvent[]> {
  const groups = new Map<string, MyScheduleEvent[]>();

  for (const event of events) {
    const key = dateKeyFromIso(event.startsAt);
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  return groups;
}

interface MyScheduleCalendarProps {
  events: MyScheduleEvent[];
  busyEventId: string | null;
  respondBusy: boolean;
  needsRosterFunctions?: boolean;
  onRespond: (
    ministryId: string,
    eventId: string,
    status: ScheduleAvailabilityAction,
  ) => void;
}

export function MyScheduleCalendar({
  events,
  busyEventId,
  respondBusy,
  needsRosterFunctions = false,
  onRespond,
}: MyScheduleCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(now));

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
      ),
    [events],
  );

  const eventsByDay = useMemo(
    () => groupEventsByDateKey(sortedEvents),
    [sortedEvents],
  );

  const grid = useMemo(
    () => buildMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const selectedEvents = eventsByDay.get(selectedDateKey) ?? [];
  const selectedInMonth = grid.some((day) => toDateKey(day) === selectedDateKey);

  function goToPreviousMonth() {
    if (monthIndex === 0) {
      setYear((value) => value - 1);
      setMonthIndex(11);
      return;
    }

    setMonthIndex((value) => value - 1);
  }

  function goToNextMonth() {
    if (monthIndex === 11) {
      setYear((value) => value + 1);
      setMonthIndex(0);
      return;
    }

    setMonthIndex((value) => value + 1);
  }

  function goToToday() {
    const today = new Date();
    setYear(today.getFullYear());
    setMonthIndex(today.getMonth());
    setSelectedDateKey(toDateKey(today));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToPreviousMonth}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToNextMonth}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
          <h2 className="ml-1 font-display text-lg font-semibold tracking-tight">
            {formatMonthTitle(year, monthIndex)}
          </h2>
        </div>

        <Button type="button" size="sm" variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          Escalado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full", pendingNotificationStyles.schedule.dot)} />
          Aguardando resposta
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-sky-500" />
          Disponível
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/50" />
          Indisponível
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
          <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
            {getWeekdayLabels().map((label) => (
              <div
                key={label}
                className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {grid.map((day) => {
              const dateKey = toDateKey(day);
              const dayEvents = eventsByDay.get(dateKey) ?? [];
              const inMonth = isSameMonth(day, year, monthIndex);
              const selected = selectedDateKey === dateKey;
              const today = isToday(day);
              const visibleEvents = dayEvents.slice(0, 2);
              const overflow = dayEvents.length - visibleEvents.length;
              const dotKinds = new Set(
                dayEvents.map((event) => getScheduleEventDisplayKind(event)),
              );

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={cn(
                    "min-h-[5.5rem] border-b border-r border-border/40 p-1.5 text-left transition-colors sm:min-h-[6.5rem] sm:p-2",
                    !inMonth && "bg-muted/20 text-muted-foreground/70",
                    selected && "bg-primary/8 ring-1 ring-inset ring-primary/25",
                    !selected && inMonth && "hover:bg-muted/40",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                        today && "bg-foreground text-background",
                        !today && selected && "text-foreground",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="hidden items-center gap-0.5 sm:inline-flex">
                        {dotKinds.has("assigned") && (
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                        )}
                        {dotKinds.has("pending") && (
                          <span className={cn("size-1.5 rounded-full", pendingNotificationStyles.schedule.dot)} />
                        )}
                        {dotKinds.has("available") && (
                          <span className="size-1.5 rounded-full bg-sky-500" />
                        )}
                        {dotKinds.has("unavailable") && (
                          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="hidden space-y-0.5 sm:block">
                    {visibleEvents.map((event) => {
                      const kind = getScheduleEventDisplayKind(event);

                      return (
                        <div
                          key={event.eventId}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                            scheduleEventStyle(kind),
                          )}
                          title={event.name}
                        >
                          {scheduleEventCalendarLabel(event)}
                        </div>
                      );
                    })}
                    {overflow > 0 && (
                      <p className="px-1 text-[10px] font-medium text-muted-foreground">
                        +{overflow}
                      </p>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {dotKinds.has("assigned") && (
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    )}
                    {dotKinds.has("pending") && (
                      <span className={cn("size-1.5 rounded-full", pendingNotificationStyles.schedule.dot)} />
                    )}
                    {dotKinds.has("available") && (
                      <span className="size-1.5 rounded-full bg-sky-500" />
                    )}
                    {dotKinds.has("unavailable") && (
                      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seu dia
            </p>
            <h3 className="mt-1 font-display text-base font-semibold tracking-tight capitalize">
              {selectedInMonth || selectedDateKey
                ? formatDayTitle(selectedDateKey)
                : "Selecione um dia"}
            </h3>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Nada por aqui
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nenhuma escala ou pedido de disponibilidade neste dia.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((event) => {
                const busy = busyEventId === event.eventId || respondBusy;
                const kind = getScheduleEventDisplayKind(event);
                const canRespond =
                  event.rosterOpen && kind !== "assigned";

                return (
                  <li
                    key={event.eventId}
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      scheduleEventBorderStyle(kind),
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {event.name}
                      </p>
                      {kind === "assigned" && event.myRoleLabel && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        >
                          {event.myRoleLabel}
                        </Badge>
                      )}
                      {kind === "pending" && (
                        <Badge className={pendingNotificationStyles.badge}>
                          Responder
                        </Badge>
                      )}
                      {kind === "available" && (
                        <Badge className="bg-sky-500 text-sky-950 hover:bg-sky-500">
                          Disponível
                        </Badge>
                      )}
                      {kind === "unavailable" && (
                        <Badge variant="secondary">Indisponível</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatEventTime(event.startsAt)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>

                    <ScheduleEventRosterList
                      roster={event.roster}
                      className="mt-3"
                    />

                    {kind === "assigned" && (
                      <Link
                        href={activityDetailPath(event.eventId)}
                        className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Ver evento
                      </Link>
                    )}

                    {canRespond && (
                      <AvailabilityRespondActions
                        className="mt-3"
                        ministryId={event.ministryId}
                        needsRosterFunctions={needsRosterFunctions}
                        busy={busy}
                        availabilityStatus={event.myAvailabilityStatus}
                        showClear={Boolean(event.myAvailabilityStatus)}
                        onRespond={(status) =>
                          onRespond(event.ministryId, event.eventId, status)
                        }
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
