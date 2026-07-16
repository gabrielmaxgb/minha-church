"use client";

import { formatEventTime } from "@/lib/dashboard/date-utils";
import type { ChurchEvent } from "@/types/events";

function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

function isFutureEvent(startsAt: string): boolean {
  return new Date(startsAt).getTime() >= Date.now();
}

/** IDs de ocorrências futuras com escala — para abrir/fechar coleta em lote */
export function futureRosterOccurrenceIds(
  event: Pick<ChurchEvent, "id" | "startsAt" | "usesRoster">,
  seriesOccurrences: Array<Pick<ChurchEvent, "id" | "startsAt" | "usesRoster">>,
): string[] {
  const inSeries = seriesOccurrences.length > 0 ? seriesOccurrences : [event];

  return inSeries
    .filter((occurrence) => isFutureEvent(occurrence.startsAt))
    .map((occurrence) => occurrence.id);
}

export function formatOccurrenceScheduleLine(event: ChurchEvent): string {
  return `${formatEventDay(event.startsAt)} · ${formatEventTime(event.startsAt)}`;
}
