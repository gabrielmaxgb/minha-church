"use client";

import Link from "next/link";
import { Calendar, MapPin, Plus, Repeat, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES, activityDetailPath } from "@/constants/routes";
import {
  formatEventDateChip,
  formatEventTime,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

interface DashboardEventsPanelProps {
  events: ChurchEvent[];
  isLoading: boolean;
  canCreateActivity: boolean;
  onCreateActivity: () => void;
}

export function DashboardEventsPanel({
  events,
  isLoading,
  canCreateActivity,
  onCreateActivity,
}: DashboardEventsPanelProps) {
  const upcoming = events.slice(0, 6);

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Agenda da igreja
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Próximas atividades — da igreja e dos ministérios.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={AUTH_ROUTES.activities}>Ver todas</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[4.5rem] rounded-2xl" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-5 py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted/80">
            <Calendar className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium text-foreground">Agenda vazia</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Cultos, encontros e eventos aparecem aqui para você se planejar com
            antecedência.
          </p>
          {canCreateActivity && (
            <Button
              size="sm"
              className="mt-4 gap-2"
              onClick={onCreateActivity}
            >
              <Plus className="size-4" />
              Criar atividade
            </Button>
          )}
        </div>
      ) : (
        <ol className="space-y-2">
          {upcoming.map((event, index) => (
            <EventTimelineItem
              key={event.recurrenceSeriesId ?? event.id}
              event={event}
              isNext={index === 0}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function EventTimelineItem({
  event,
  isNext,
}: {
  event: ChurchEvent;
  isNext: boolean;
}) {
  const chip = formatEventDateChip(event.startsAt);
  const relativeDay = formatRelativeEventDay(event.startsAt);

  return (
    <li>
      <Link
        href={activityDetailPath(event.id)}
        className={cn(
          "group flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-200 hover:shadow-soft",
          isNext
            ? "border-foreground/15 bg-gradient-to-r from-muted/50 to-card"
            : "border-border/60 bg-surface-elevated/50 hover:border-border hover:bg-card",
        )}
      >
        <div
          className={cn(
            "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border text-center leading-none",
            isNext
              ? "border-foreground/20 bg-foreground text-background"
              : "border-border/60 bg-card text-foreground",
          )}
        >
          <span className="text-sm font-bold">{chip.day}</span>
          <span
            className={cn(
              "mt-0.5 text-[9px] font-semibold uppercase tracking-wide",
              isNext ? "text-background/80" : "text-muted-foreground",
            )}
          >
            {chip.month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-foreground">{event.name}</p>
            {relativeDay && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  relativeDay === "Hoje"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {relativeDay}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3 shrink-0" />
              {event.recurrence && (
                <span className="font-medium text-foreground">Próxima:</span>
              )}
              {formatEventTime(event.startsAt)}
            </span>
            {event.recurrence && (
              <span className="inline-flex items-center gap-1">
                <Repeat className="size-3 shrink-0" />
                {formatRecurrenceSummary(event.recurrence, event.startsAt)}
              </span>
            )}
            {event.location && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
            {event.isChurchWide ? (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="size-3 shrink-0" />
                Igreja
              </span>
            ) : event.ministryName ? (
              <span className="truncate">{event.ministryName}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
