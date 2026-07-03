import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  ChurchEvent,
  ChurchEventDetail,
  CreateChurchEventPayload,
  UpdateChurchEventPayload,
} from "@/types/events";

export interface ListChurchEventsParams {
  ministryId?: string;
  churchWideOnly?: boolean;
  from?: string;
  to?: string;
}

async function fetchChurchEvents(
  churchId: string,
  params: ListChurchEventsParams = {},
): Promise<ChurchEvent[]> {
  const searchParams = new URLSearchParams();

  if (params.ministryId) {
    searchParams.set("ministryId", params.ministryId);
  }

  if (params.churchWideOnly) {
    searchParams.set("churchWideOnly", "true");
  }

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();
  const path = buildTenantPath(churchId, `/events${query ? `?${query}` : ""}`);

  return apiClient<ChurchEvent[]>(path, { churchId });
}

async function fetchChurchEvent(
  churchId: string,
  eventId: string,
): Promise<ChurchEventDetail> {
  return apiClient<ChurchEventDetail>(
    buildTenantPath(churchId, `/events/${eventId}`),
    { churchId },
  );
}

async function createChurchEvent(
  churchId: string,
  payload: CreateChurchEventPayload,
): Promise<ChurchEvent> {
  return apiClient<ChurchEvent>(buildTenantPath(churchId, "/events"), {
    churchId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateChurchEvent(
  churchId: string,
  eventId: string,
  payload: UpdateChurchEventPayload,
): Promise<ChurchEvent> {
  return apiClient<ChurchEvent>(
    buildTenantPath(churchId, `/events/${eventId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteChurchEvent(
  churchId: string,
  eventId: string,
): Promise<void> {
  await apiClient<void>(buildTenantPath(churchId, `/events/${eventId}`), {
    churchId,
    method: "DELETE",
  });
}

export const eventsKeys = createQueryKeys("events", {
  list: (churchId: string, params: ListChurchEventsParams = {}) => ({
    queryKey: [churchId, params],
    queryFn: () => fetchChurchEvents(churchId, params),
  }),
  detail: (churchId: string, eventId: string) => ({
    queryKey: [churchId, eventId],
    queryFn: () => fetchChurchEvent(churchId, eventId),
  }),
});

export {
  createChurchEvent,
  deleteChurchEvent,
  fetchChurchEvent,
  fetchChurchEvents,
  updateChurchEvent,
};

export type { CreateChurchEventPayload, UpdateChurchEventPayload };
