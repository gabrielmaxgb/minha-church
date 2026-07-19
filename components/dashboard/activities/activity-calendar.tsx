"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Repeat,
} from "lucide-react";

import { EventRegistrationOpenBadge } from "@/components/dashboard/activities/event-registration-open-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activityDetailPath } from "@/constants/routes";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import {
  buildMonthBarSegments,
  buildMonthGrid,
  formatDayTitle,
  formatEventScheduleLabel,
  formatMonthTitle,
  getWeekdayLabels,
  groupEventsByDateKey,
  isSameMonth,
  isToday,
  shouldRenderAsMonthBar,
  toDateKey,
} from "@/lib/events/calendar";
import { isEventRegistrationOpen } from "@/lib/events/registration";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

const MAX_TIMED_CHIPS = 2;

interface DayAgendaGroup {
  key: string;
  label: string;
  kind: "church" | "ministry";
  events: ChurchEvent[];
}

function groupDayAgendaEvents(events: ChurchEvent[]): DayAgendaGroup[] {
  const churchEvents = events.filter((event) => event.isChurchWide);
  const ministryBuckets = new Map<
    string,
    { label: string; events: ChurchEvent[] }
  >();

  for (const event of events) {
    if (event.isChurchWide) {
      continue;
    }

    const key = event.ministryId ?? "ministry";
    const current = ministryBuckets.get(key);

    if (current) {
      current.events.push(event);
      continue;
    }

    ministryBuckets.set(key, {
      label: event.ministryName ?? "Ministério",
      events: [event],
    });
  }

  const groups: DayAgendaGroup[] = [];

  if (churchEvents.length > 0) {
    groups.push({
      key: "church",
      label: "Igreja",
      kind: "church",
      events: churchEvents,
    });
  }

  for (const [key, bucket] of [...ministryBuckets.entries()].sort((left, right) =>
    left[1].label.localeCompare(right[1].label, "pt-BR"),
  )) {
    groups.push({
      key,
      label: bucket.label,
      kind: "ministry",
      events: bucket.events,
    });
  }

  return groups;
}

function DayAgendaEventItem({ event }: { event: ChurchEvent }) {
  const registrationOpen = isEventRegistrationOpen(event);

  return (
    <Link
      href={activityDetailPath(event.id)}
      className={cn(
        "block rounded-xl border px-3 py-2.5 transition-colors hover:bg-muted/40",
        registrationOpen
          ? "border-success/25 bg-success-subtle/50"
          : event.isChurchWide
            ? "border-foreground/15 bg-muted/30"
            : "border-border/70",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="truncate text-sm font-medium text-foreground">
          {event.name}
        </p>
        {event.recurrence && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Repeat className="size-3" />
            Recorrente
          </span>
        )}
        <EventRegistrationOpenBadge event={event} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatEventScheduleLabel(event)}
      </p>
    </Link>
  );
}

interface ActivityCalendarProps {
  year: number;
  monthIndex: number;
  events: ChurchEvent[];
  focusDateKey?: string;
  isLoading: boolean;
  isError: boolean;
  canCreate: boolean;
  createBlockProps?: {
    disabled?: boolean;
    title?: string;
  };
  onMonthChange: (year: number, monthIndex: number) => void;
  onCreateOnDay: (dateKey: string) => void;
}

export function ActivityCalendar({
  year,
  monthIndex,
  events,
  focusDateKey,
  isLoading,
  isError,
  canCreate,
  createBlockProps,
  onMonthChange,
  onCreateOnDay,
}: ActivityCalendarProps) {
  const shouldReduceMotion = useReducedMotion();
  const todayKey = toDateKey(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(
    focusDateKey ?? todayKey,
  );

  useEffect(() => {
    if (focusDateKey) {
      setSelectedDateKey(focusDateKey);
    }
  }, [focusDateKey]);

  const grid = useMemo(
    () => buildMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const eventsByDay = useMemo(() => groupEventsByDateKey(events), [events]);

  const barSegments = useMemo(
    () => buildMonthBarSegments(grid, events),
    [grid, events],
  );

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let index = 0; index < 6; index += 1) {
      rows.push(grid.slice(index * 7, index * 7 + 7));
    }
    return rows;
  }, [grid]);

  const selectedEvents = eventsByDay.get(selectedDateKey) ?? [];
  const selectedAgendaGroups = useMemo(
    () => groupDayAgendaEvents(selectedEvents),
    [selectedEvents],
  );
  const selectedInMonth = grid.some(
    (day) => toDateKey(day) === selectedDateKey,
  );

  function goToPreviousMonth() {
    if (monthIndex === 0) {
      onMonthChange(year - 1, 11);
      return;
    }

    onMonthChange(year, monthIndex - 1);
  }

  function goToNextMonth() {
    if (monthIndex === 11) {
      onMonthChange(year + 1, 0);
      return;
    }

    onMonthChange(year, monthIndex + 1);
  }

  function goToToday() {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
    setSelectedDateKey(toDateKey(now));
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
          <h2 className="ml-1 text-lg font-semibold tracking-tight">
            {formatMonthTitle(year, monthIndex)}
          </h2>
        </div>

        <Button type="button" size="sm" variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground" />
          Igreja
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground" />
          Ministério
        </span>
        <span className="hidden text-muted-foreground/80 sm:inline">
          Clique no dia para ver a agenda e datas disponíveis.
        </span>
        <span className="sm:hidden text-muted-foreground/80">
          Toque no dia para ver a agenda.
        </span>
      </div>

      {isError && (
        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          Não foi possível carregar o calendário.
        </div>
      )}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 overflow-hidden rounded-xl border border-border/70 bg-card lg:order-1">
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

          {isLoading ? (
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-11 border-b border-r border-border/40 p-1 sm:min-h-[5.5rem] sm:p-2"
                >
                  <Skeleton className="mb-2 h-4 w-6" />
                  <Skeleton className="hidden h-4 w-full sm:block" />
                </div>
              ))}
            </div>
          ) : (
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
                        const hasAny = dayEvents.length > 0;
                        const visibleTimed = timedEvents.slice(
                          0,
                          MAX_TIMED_CHIPS,
                        );
                        const timedOverflow =
                          timedEvents.length - visibleTimed.length;

                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => setSelectedDateKey(dateKey)}
                            className={cn(
                              "min-h-11 border-r border-border/40 p-1 text-left transition-colors last:border-r-0 sm:min-h-[4.75rem] sm:p-1.5 md:min-h-[5.5rem] md:p-2",
                              !inMonth &&
                                "bg-muted/20 text-muted-foreground/70",
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
                              {hasAny ? (
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full sm:hidden",
                                    dayEvents.some((event) => event.isChurchWide)
                                      ? "bg-foreground"
                                      : "bg-muted-foreground",
                                  )}
                                />
                              ) : null}
                            </div>

                            <div className="hidden space-y-0.5 sm:block">
                              {visibleTimed.map((event) => (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                                    event.isChurchWide
                                      ? "bg-foreground/90 text-background"
                                      : "bg-muted text-muted-foreground",
                                  )}
                                  title={event.name}
                                >
                                  {formatEventTime(event.startsAt)}{" "}
                                  {event.name}
                                </div>
                              ))}
                              {timedOverflow > 0 ? (
                                <p className="px-1 text-[10px] font-medium text-muted-foreground">
                                  +{timedOverflow}
                                </p>
                              ) : null}
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
                        {weekBars.map((segment) => (
                          <Link
                            key={`${segment.event.id}-w${weekIndex}-l${segment.lane}`}
                            href={activityDetailPath(segment.event.id)}
                            title={segment.event.name}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            className={cn(
                              "z-[1] mx-0.5 truncate rounded px-1.5 text-[10px] font-semibold leading-[1.15rem] transition-opacity hover:opacity-90",
                              segment.event.isChurchWide
                                ? "bg-foreground text-background"
                                : "bg-muted-foreground/85 text-background",
                            )}
                            style={{
                              gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                              gridRow: segment.lane + 1,
                            }}
                          >
                            {segment.event.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="order-1 rounded-xl border border-border/70 bg-card p-4 lg:order-2">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Agenda do dia
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h3
                  key={selectedDateKey}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: 6 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-1 text-xl font-semibold tracking-tight capitalize text-foreground"
                >
                  {selectedInMonth || selectedDateKey
                    ? formatDayTitle(selectedDateKey)
                    : "Selecione um dia"}
                </motion.h3>
              </AnimatePresence>
            </div>
            {canCreate && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onCreateOnDay(selectedDateKey)}
                {...createBlockProps}
              >
                <Plus className="size-4" />
                Nova
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedDateKey}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {selectedEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Dia disponível
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nenhum evento neste dia com os filtros atuais.
                    </p>
                    {canCreate && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4"
                        onClick={() => onCreateOnDay(selectedDateKey)}
                        {...createBlockProps}
                      >
                        <Plus className="size-4" />
                        Agendar neste dia
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedAgendaGroups.map((group) => (
                      <section key={group.key}>
                        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              group.kind === "church"
                                ? "bg-foreground"
                                : "bg-muted-foreground",
                            )}
                          />
                          {group.label}
                        </h4>
                        <ul className="space-y-2">
                          {group.events.map((event) => (
                            <li key={event.id}>
                              <DayAgendaEventItem event={event} />
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </aside>
      </div>
    </div>
  );
}
