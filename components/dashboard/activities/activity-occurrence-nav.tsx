"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { useEventSeriesOccurrences } from "@/lib/api/queries";
import { formatLongDate } from "@/lib/dashboard/date-utils";
import { getSeriesOccurrenceNeighbors } from "@/lib/events/series-navigation";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityOccurrenceNavProps {
  event: ChurchEventDetail;
}

export function ActivityOccurrenceNav({ event }: ActivityOccurrenceNavProps) {
  const seriesId = event.recurrenceSeriesId;
  const { data: seriesOccurrences = [], isLoading } = useEventSeriesOccurrences(
    seriesId,
    { enabled: Boolean(seriesId) },
  );

  const neighbors = useMemo(
    () => getSeriesOccurrenceNeighbors(seriesOccurrences, event.id),
    [seriesOccurrences, event.id],
  );

  if (!seriesId || !event.recurrence) {
    return null;
  }

  const total = neighbors.total;
  const position = neighbors.index >= 0 ? neighbors.index + 1 : null;
  const previousLabel = neighbors.previous
    ? formatLongDate(new Date(neighbors.previous.startsAt))
    : undefined;
  const nextLabel = neighbors.next
    ? formatLongDate(new Date(neighbors.next.startsAt))
    : undefined;

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-soft",
      )}
      role="navigation"
      aria-label="Outras datas desta série"
    >
      <Button
        size="sm"
        variant="ghost"
        className="h-9 rounded-none border-r border-border/70 px-2.5"
        disabled={isLoading || !neighbors.previous}
        asChild={Boolean(neighbors.previous)}
        title={previousLabel}
        aria-label={
          previousLabel
            ? `Data anterior: ${previousLabel}`
            : "Sem data anterior"
        }
      >
        {neighbors.previous ? (
          <Link href={activityDetailPath(neighbors.previous.id)}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="size-4" />
          </span>
        )}
      </Button>

      <div className="min-w-20 px-3 text-center">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Esta data
        </p>
        <p className="text-xs font-medium tabular-nums text-foreground">
          {position && total > 0 ? `${position} de ${total}` : "—"}
        </p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="h-9 rounded-none border-l border-border/70 px-2.5"
        disabled={isLoading || !neighbors.next}
        asChild={Boolean(neighbors.next)}
        title={nextLabel}
        aria-label={
          nextLabel ? `Próxima data: ${nextLabel}` : "Sem próxima data"
        }
      >
        {neighbors.next ? (
          <Link href={activityDetailPath(neighbors.next.id)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="size-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
