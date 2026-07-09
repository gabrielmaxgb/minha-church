export interface SeriesOccurrenceRef {
  id: string;
  startsAt: string;
}

export function getSeriesOccurrenceNeighbors(
  occurrences: SeriesOccurrenceRef[],
  currentEventId: string,
): {
  previous: SeriesOccurrenceRef | null;
  next: SeriesOccurrenceRef | null;
} {
  const sorted = [...occurrences].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  const index = sorted.findIndex((occurrence) => occurrence.id === currentEventId);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}
