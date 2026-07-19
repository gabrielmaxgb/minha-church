"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ScheduleEventRosterList } from "@/components/dashboard/my-schedule/schedule-event-roster-list";
import { EventAvailabilityPanel } from "@/components/dashboard/my-schedule/event-availability-panel";
import type { EventAvailabilityPayload } from "@/components/dashboard/my-schedule/event-availability-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import {
  buildMonthBarSegments,
  buildMonthGrid,
  formatDayTitle,
  formatMonthTitle,
  getWeekdayLabels,
  groupEventsByDateKey,
  isSameMonth,
  isToday,
  shouldRenderAsMonthBar,
  toDateKey,
} from "@/lib/events/calendar";
import {
  getScheduleEventDisplayKind,
  scheduleEventBorderStyle,
  scheduleEventCalendarLabel,
  scheduleEventStyle,
} from "@/lib/my-schedule/event-display";
import { formatRosterRole } from "@/lib/ministries/roster";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";
import type { MyScheduleEvent } from "@/types/ministries";

const EMPTY_SCHEDULE_EVENTS: MyScheduleEvent[] = [];
const MAX_TIMED_CHIPS = 2;

interface MyScheduleCalendarProps {
  events: MyScheduleEvent[];
  busyEventId: string | null;
  respondBusy: boolean;
  interactionsDisabled?: boolean;
  needsRosterFunctions?: boolean;
  ministryName?: string;
  onRespond: (
    ministryId: string,
    eventId: string,
    payload: EventAvailabilityPayload,
  ) => void;
}

export function MyScheduleCalendar({
  events,
  busyEventId,
  respondBusy,
  interactionsDisabled = false,
  needsRosterFunctions = false,
  ministryName,
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

  const barSegments = useMemo(
    () => buildMonthBarSegments(grid, sortedEvents),
    [grid, sortedEvents],
  );

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let index = 0; index < 6; index += 1) {
      rows.push(grid.slice(index * 7, index * 7 + 7));
    }
    return rows;
  }, [grid]);

  const selectedEvents = useMemo(
    () => eventsByDay.get(selectedDateKey) ?? EMPTY_SCHEDULE_EVENTS,
    [eventsByDay, selectedDateKey],
  );
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
          <h2 className="ml-1 text-base font-semibold tracking-tight">
            {formatMonthTitle(year, monthIndex)}
          </h2>
        </div>

        <Button type="button" size="sm" variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-success" />
          Escalado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full", pendingNotificationStyles.schedule.dot)} />
          Aguardando resposta
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground" />
          Disponível
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/50" />
          Indisponível
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 overflow-hidden rounded-lg border border-border/70 bg-card lg:order-1">
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

          <div>
            {weeks.map((weekDays, weekIndex) => {
              const weekBars = barSegments.filter(
                (segment) => segment.weekIndex === weekIndex,
              );
              const laneCount =
                weekBars.reduce(
                  (max, segment) => Math.max(max, segment.lane + 1),
                  0,
                ) || 0;

              return (
                <div
                  key={`week-${weekIndex}`}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <div className="grid grid-cols-7">
                    {weekDays.map((day) => {
                      const dateKey = toDateKey(day);
                      const dayEvents = eventsByDay.get(dateKey) ?? [];
                      const timedEvents = dayEvents.filter(
                        (event) => !shouldRenderAsMonthBar(event),
                      );
                      const inMonth = isSameMonth(day, year, monthIndex);
                      const selected = selectedDateKey === dateKey;
                      const today = isToday(day);
                      const visibleEvents = timedEvents.slice(0, MAX_TIMED_CHIPS);
                      const overflow = timedEvents.length - visibleEvents.length;
                      const dotKinds = new Set(
                        dayEvents.map((event) =>
                          getScheduleEventDisplayKind(event),
                        ),
                      );

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => setSelectedDateKey(dateKey)}
                          className={cn(
                            "min-h-11 border-r border-border/40 p-1 text-left transition-colors last:border-r-0 sm:min-h-[4.75rem] sm:p-1.5 md:min-h-[5.5rem] md:p-2",
                            !inMonth && "bg-muted/20 text-muted-foreground/70",
                            selected &&
                              "bg-primary/8 ring-1 ring-inset ring-primary/25",
                            !selected && inMonth && "hover:bg-muted/40",
                          )}
                        >
                          <div className="mb-0.5 flex items-center justify-between gap-1 sm:mb-1">
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
                                  <span className="size-1.5 rounded-full bg-success" />
                                )}
                                {dotKinds.has("pending") && (
                                  <span
                                    className={cn(
                                      "size-1.5 rounded-full",
                                      pendingNotificationStyles.schedule.dot,
                                    )}
                                  />
                                )}
                                {dotKinds.has("available") && (
                                  <span className="size-1.5 rounded-full bg-foreground" />
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

                          <div className="mt-0.5 flex flex-wrap justify-center gap-0.5 sm:mt-1 sm:justify-start sm:hidden">
                            {dotKinds.has("assigned") && (
                              <span className="size-1.5 rounded-full bg-success" />
                            )}
                            {dotKinds.has("pending") && (
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  pendingNotificationStyles.schedule.dot,
                                )}
                              />
                            )}
                            {dotKinds.has("available") && (
                              <span className="size-1.5 rounded-full bg-foreground" />
                            )}
                            {dotKinds.has("unavailable") && (
                              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {laneCount > 0 ? (
                    <div
                      className="relative hidden gap-y-0.5 px-0.5 pb-1 sm:grid sm:grid-cols-7"
                      style={{
                        gridTemplateRows: `repeat(${laneCount}, 1.15rem)`,
                      }}
                    >
                      {weekBars.map((segment) => {
                        const kind = getScheduleEventDisplayKind(segment.event);
                        const segmentDay = weekDays[segment.startCol];

                        return (
                          <button
                            key={`${segment.event.eventId}-w${weekIndex}-l${segment.lane}`}
                            type="button"
                            title={segment.event.name}
                            onClick={() =>
                              setSelectedDateKey(toDateKey(segmentDay))
                            }
                            className={cn(
                              "z-[1] mx-0.5 truncate rounded px-1.5 text-left text-[10px] font-semibold leading-[1.15rem] transition-opacity hover:opacity-90",
                              scheduleEventStyle(kind),
                            )}
                            style={{
                              gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                              gridRow: segment.lane + 1,
                            }}
                          >
                            {scheduleEventCalendarLabel(segment.event)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="order-1 rounded-lg border border-border/70 bg-card p-4 lg:order-2">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seu dia
            </p>
            <h3 className="mt-1 text-sm font-semibold tracking-tight capitalize">
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
            <ul className="space-y-3">
              {selectedEvents.map((event) => {
                const isSaving = busyEventId === event.eventId;
                const respondLocked =
                  respondBusy && busyEventId !== event.eventId;
                const kind = getScheduleEventDisplayKind(event);
                const canRespond =
                  event.rosterOpen && kind !== "assigned";
                return (
                  <li
                    key={event.eventId}
                    className={cn(
                      "rounded-xl border px-3 py-3",
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
                          className="bg-success-subtle text-success-foreground"
                        >
                          {formatRosterRole(event.myRoleLabel)}
                        </Badge>
                      )}
                      {kind === "pending" && (
                        <Badge className={pendingNotificationStyles.badge}>
                          Responder
                        </Badge>
                      )}
                      {kind === "available" && (
                        <Badge className="bg-muted text-foreground hover:bg-muted">
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

                    {canRespond && event.ministryId ? (
                      <EventAvailabilityPanel
                        className="mt-3"
                        availabilityStatus={event.myAvailabilityStatus}
                        availabilityMessage={event.availabilityMessage}
                        needsRosterFunctions={needsRosterFunctions}
                        ministryName={
                          ministryName ?? event.ministryName ?? "este ministério"
                        }
                        busy={isSaving}
                        disabled={respondLocked}
                        interactionsDisabled={interactionsDisabled}
                        layout="compact"
                        onRespond={(payload) =>
                          onRespond(event.ministryId!, event.eventId, payload)
                        }
                      />
                    ) : null}

                    <ScheduleEventRosterList
                      roster={event.roster}
                      className="mt-3"
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 h-8"
                      asChild
                    >
                      <Link href={activityDetailPath(event.eventId)}>
                        Ver evento
                      </Link>
                    </Button>
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
