"use client";

import Link from "next/link";
import { Calendar, MapPin, Plus, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { AUTH_ROUTES, activityDetailPath } from "@/constants/routes";
import {
  formatEventDateChip,
  formatEventTime,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
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
  const { writesBlocked, blockProps } = useTrialWriteGuard();

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div>
          <h2 className="text-sm font-medium text-foreground">Agenda</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Próximas atividades da igreja e dos ministérios
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={AUTH_ROUTES.activities}>Ver todas</Link>
        </Button>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-md" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Agenda vazia</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Cultos e encontros aparecerão aqui para o planejamento da semana.
            </p>
            {canCreateActivity && (
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <Button size="sm" onClick={onCreateActivity} {...blockProps}>
                  <Plus className="size-4" />
                  Criar atividade
                </Button>
                {writesBlocked && (
                  <LockedFeatureHint action="criar atividades" />
                )}
              </div>
            )}
          </div>
        ) : (
          <ol className="space-y-0.5">
            {upcoming.map((event, index) => (
              <EventTimelineItem
                key={event.recurrenceSeriesId ?? event.id}
                event={event}
                isNext={index === 0}
              />
            ))}
          </ol>
        )}
      </div>
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
          "flex items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors duration-150 hover:bg-muted/60",
          isNext && "bg-muted/40",
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 flex-col items-center justify-center rounded-md border text-center leading-none",
            isNext
              ? "border-foreground/15 bg-foreground text-background"
              : "border-border bg-card text-foreground",
          )}
        >
          <span className="text-xs font-semibold">{chip.day}</span>
          <span
            className={cn(
              "mt-0.5 text-[9px] font-medium uppercase tracking-wide",
              isNext ? "text-background/80" : "text-muted-foreground",
            )}
          >
            {chip.month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {event.name}
            </p>
            {relativeDay && (
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  relativeDay === "Hoje"
                    ? "bg-attention-subtle text-attention-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {relativeDay}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3 shrink-0" />
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
              <span>Igreja</span>
            ) : event.ministryName ? (
              <span className="truncate">{event.ministryName}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
