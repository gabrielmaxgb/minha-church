"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { useEventSeriesOccurrences } from "@/lib/api/queries";
import { formatLongDate } from "@/lib/dashboard/date-utils";
import { getSeriesOccurrenceNeighbors } from "@/lib/events/series-navigation";
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

  const previousLabel = neighbors.previous
    ? formatLongDate(new Date(neighbors.previous.startsAt))
    : undefined;
  const nextLabel = neighbors.next
    ? formatLongDate(new Date(neighbors.next.startsAt))
    : undefined;

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading || !neighbors.previous}
        asChild={Boolean(neighbors.previous)}
        title={previousLabel}
        aria-label={
          previousLabel
            ? `Ocorrência anterior: ${previousLabel}`
            : "Sem ocorrência anterior"
        }
      >
        {neighbors.previous ? (
          <Link href={activityDetailPath(neighbors.previous.id)}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={isLoading || !neighbors.next}
        asChild={Boolean(neighbors.next)}
        title={nextLabel}
        aria-label={
          nextLabel ? `Próxima ocorrência: ${nextLabel}` : "Sem próxima ocorrência"
        }
      >
        {neighbors.next ? (
          <Link href={activityDetailPath(neighbors.next.id)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </div>
  );
}
