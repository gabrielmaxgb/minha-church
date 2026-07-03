export type ListableEvent = {
  id: string;
  startsAt: string;
  recurrenceSeriesId: string | null;
};

/** Agrupa ocorrências da mesma série e mantém só a próxima data futura na lista. */
export function collapseRecurringEventsForList<T extends ListableEvent>(
  events: Iterable<T>,
  referenceTime = Date.now(),
): T[] {
  const upcoming = [...events].filter(
    (event) => new Date(event.startsAt).getTime() >= referenceTime,
  );

  const standalone: T[] = [];
  const seriesGroups = new Map<string, T[]>();

  for (const event of upcoming) {
    if (event.recurrenceSeriesId) {
      const group = seriesGroups.get(event.recurrenceSeriesId) ?? [];
      group.push(event);
      seriesGroups.set(event.recurrenceSeriesId, group);
    } else {
      standalone.push(event);
    }
  }

  const collapsed: T[] = [...standalone];

  for (const group of seriesGroups.values()) {
    const nextOccurrence = group.sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )[0];

    collapsed.push(nextOccurrence);
  }

  return collapsed.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}
