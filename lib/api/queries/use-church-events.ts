"use client";

import { useQuery } from "@tanstack/react-query";

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
  });
}
