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
  index: number;
  total: number;
} {
  const sorted = [...occurrences].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  const index = sorted.findIndex((occurrence) => occurrence.id === currentEventId);

  if (index === -1) {
    return { previous: null, next: null, index: -1, total: sorted.length };
  }

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
    index,
    total: sorted.length,
  };
}
