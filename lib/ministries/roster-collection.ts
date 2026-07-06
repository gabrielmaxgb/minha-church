import {
  computePeriodBounds,
  defaultPeriodStart,
} from "@/lib/ministries/availability-period";
import type { WorshipAvailabilityPeriod } from "@/lib/ministries/worship";
import type { MinistryEvent } from "@/types/ministries";

export type RosterCollectionScope =
  | "all"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "custom";

export interface RosterEventGroup {
  key: string;
  name: string;
  isRecurring: boolean;
  recurrenceSeriesId: string | null;
  occurrences: MinistryEvent[];
  openCount: number;
}

function isFutureEvent(startsAt: string): boolean {
  return new Date(startsAt).getTime() >= Date.now();
}

function isInPeriod(
  startsAt: string,
  periodType: WorshipAvailabilityPeriod,
  anchor: Date,
): boolean {
  const { start, end } = computePeriodBounds(periodType, anchor);
  const date = new Date(startsAt);

  return date >= start && date <= end;
}

export function buildRosterEventGroups(
  events: MinistryEvent[],
): RosterEventGroup[] {
  const rosterEvents = events
    .filter((event) => event.usesRoster && isFutureEvent(event.startsAt))
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );

  const map = new Map<string, RosterEventGroup>();

  for (const event of rosterEvents) {
    const key = event.recurrenceSeriesId ?? `single:${event.id}`;
    const group = map.get(key);

    if (group) {
      group.occurrences.push(event);
      if (event.rosterOpen) {
        group.openCount += 1;
      }
    } else {
      map.set(key, {
        key,
        name: event.name,
        isRecurring: Boolean(event.recurrenceSeriesId),
        recurrenceSeriesId: event.recurrenceSeriesId,
        occurrences: [event],
        openCount: event.rosterOpen ? 1 : 0,
      });
    }
  }

  return [...map.values()];
}

export function scopeLabel(
  scope: RosterCollectionScope,
  anchor: Date,
): string {
  const monthFmt = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  switch (scope) {
    case "all":
      return "Todas as datas futuras";
    case "monthly":
      return `Só ${monthFmt.format(anchor)}`;
    case "quarterly": {
      const { start, end } = computePeriodBounds("quarterly", anchor);
      const fmt = new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
      return `Só trimestre (${fmt.format(start)} – ${fmt.format(end)})`;
    }
    case "semiannual": {
      const { start, end } = computePeriodBounds("semiannual", anchor);
      const fmt = new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
      return `Só semestre (${fmt.format(start)} – ${fmt.format(end)})`;
    }
    case "custom":
      return "Escolher datas";
    default:
      return scope;
  }
}

export function countForScope(
  occurrences: MinistryEvent[],
  scope: RosterCollectionScope,
  anchor: Date,
): number {
  return resolveCollectionEventIds(occurrences, scope, new Set()).length;
}

export function resolveCollectionEventIds(
  occurrences: MinistryEvent[],
  scope: RosterCollectionScope,
  customIds: Set<string>,
  anchor = new Date(),
): string[] {
  const future = occurrences.filter((event) => isFutureEvent(event.startsAt));

  switch (scope) {
    case "all":
      return future.map((event) => event.id);
    case "monthly":
      return future
        .filter((event) => isInPeriod(event.startsAt, "monthly", anchor))
        .map((event) => event.id);
    case "quarterly":
      return future
        .filter((event) => isInPeriod(event.startsAt, "quarterly", anchor))
        .map((event) => event.id);
    case "semiannual":
      return future
        .filter((event) => isInPeriod(event.startsAt, "semiannual", anchor))
        .map((event) => event.id);
    case "custom":
      return future
        .filter((event) => customIds.has(event.id))
        .map((event) => event.id);
    default:
      return [];
  }
}

export function defaultScopeAnchor(occurrences: MinistryEvent[]): Date {
  const next = occurrences.find((event) => isFutureEvent(event.startsAt));

  if (next) {
    return new Date(next.startsAt);
  }

  return defaultPeriodStart("monthly");
}
