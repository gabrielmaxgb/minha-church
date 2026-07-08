"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  eventsKeys,
  type ListChurchEventsParams,
} from "@/lib/api/queries/events.keys";
import { useTenant } from "@/providers/auth-provider";

export function useChurchEvents(
  params: ListChurchEventsParams = {},
  options?: { enabled?: boolean },
) {
  const { churchId } = useTenant();

  return useQuery({
    ...eventsKeys.list(churchId ?? "unknown", params),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
  });
}

export function useChurchEvent(eventId: string) {
  const { churchId } = useTenant();

  return useQuery({
    ...eventsKeys.detail(churchId ?? "unknown", eventId),
    enabled: Boolean(churchId && eventId),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useEventSeriesOccurrences(
  seriesId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const { churchId } = useTenant();

  return useQuery({
    ...eventsKeys.seriesOccurrences(churchId ?? "unknown", seriesId ?? ""),
    enabled:
      Boolean(churchId && seriesId) && (options?.enabled ?? true),
    staleTime: 5 * 60_000,
  });
}
