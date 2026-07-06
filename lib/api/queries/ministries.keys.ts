import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreateMinistryEventPayload,
  Ministry,
  MinistryEvent,
  MinistryMember,
  MinistryRole,
  RosterAvailabilityWindow,
  RosterProfile,
} from "@/types/ministries";

export interface CreateMinistryPayload {
  name: string;
  description?: string;
  hasRoster?: boolean;
}

export interface UpdateMinistryPayload {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  hasRoster?: boolean;
}

export interface CreateMinistryRolePayload {
  name: string;
  sortOrder?: number;
  canManageEvents?: boolean;
  canManageRoster?: boolean;
}

export interface UpdateMinistryRolePayload {
  name?: string;
  sortOrder?: number;
  canManageEvents?: boolean;
  canManageRoster?: boolean;
}

async function fetchMinistries(churchId: string): Promise<Ministry[]> {
  return apiClient<Ministry[]>(buildTenantPath(churchId, "/ministries"), {
    churchId,
  });
}

async function fetchMinistry(
  churchId: string,
  ministryId: string,
): Promise<Ministry> {
  return apiClient<Ministry>(
    buildTenantPath(churchId, `/ministries/${ministryId}`),
    { churchId },
  );
}

async function fetchMinistryMembers(
  churchId: string,
  ministryId: string,
): Promise<MinistryMember[]> {
  return apiClient<MinistryMember[]>(
    buildTenantPath(churchId, `/ministries/${ministryId}/members`),
    { churchId },
  );
}

async function fetchMinistryEvents(
  churchId: string,
  ministryId: string,
  query?: { from?: string; to?: string },
): Promise<MinistryEvent[]> {
  const params = new URLSearchParams();
  if (query?.from) {
    params.set("from", query.from);
  }
  if (query?.to) {
    params.set("to", query.to);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return apiClient<MinistryEvent[]>(
    buildTenantPath(churchId, `/ministries/${ministryId}/events${suffix}`),
    { churchId },
  );
}

async function createMinistryEvent(
  churchId: string,
  ministryId: string,
  payload: CreateMinistryEventPayload,
): Promise<MinistryEvent> {
  return apiClient<MinistryEvent>(
    buildTenantPath(churchId, `/ministries/${ministryId}/events`),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function createMinistry(
  churchId: string,
  payload: CreateMinistryPayload,
): Promise<Ministry> {
  return apiClient<Ministry>(buildTenantPath(churchId, "/ministries"), {
    churchId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateMinistry(
  churchId: string,
  ministryId: string,
  payload: UpdateMinistryPayload,
): Promise<Ministry> {
  return apiClient<Ministry>(
    buildTenantPath(churchId, `/ministries/${ministryId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteMinistry(
  churchId: string,
  ministryId: string,
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(churchId, `/ministries/${ministryId}`),
    { churchId, method: "DELETE" },
  );
}

async function createMinistryRole(
  churchId: string,
  ministryId: string,
  payload: CreateMinistryRolePayload,
): Promise<MinistryRole> {
  return apiClient<MinistryRole>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roles`),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function updateMinistryRole(
  churchId: string,
  ministryId: string,
  roleId: string,
  payload: UpdateMinistryRolePayload,
): Promise<MinistryRole> {
  return apiClient<MinistryRole>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roles/${roleId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteMinistryRole(
  churchId: string,
  ministryId: string,
  roleId: string,
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roles/${roleId}`),
    { churchId, method: "DELETE" },
  );
}

async function fetchRosterProfile(
  churchId: string,
  ministryId: string,
): Promise<RosterProfile> {
  return apiClient<RosterProfile>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roster/me`),
    { churchId },
  );
}

async function updateRosterProfile(
  churchId: string,
  ministryId: string,
  instruments: string[],
): Promise<RosterProfile> {
  return apiClient<RosterProfile>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roster/me`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify({ instruments }),
    },
  );
}

async function updateEventAvailability(
  churchId: string,
  ministryId: string,
  eventId: string,
  status: "available" | "unavailable" | "clear",
): Promise<RosterProfile> {
  return apiClient<RosterProfile>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/roster/events/${eventId}/availability`,
    ),
    {
      churchId,
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
}

async function openAvailabilityWindow(
  churchId: string,
  ministryId: string,
  payload: { periodType: string; startDate?: string },
): Promise<RosterAvailabilityWindow> {
  return apiClient<RosterAvailabilityWindow>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/roster/availability-window`,
    ),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function closeAvailabilityWindow(
  churchId: string,
  ministryId: string,
): Promise<RosterAvailabilityWindow> {
  return apiClient<RosterAvailabilityWindow>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/roster/availability-window`,
    ),
    {
      churchId,
      method: "DELETE",
    },
  );
}

async function setRosterCollection(
  churchId: string,
  ministryId: string,
  payload: {
    rosterOpen: boolean;
    eventIds?: string[];
    recurrenceSeriesId?: string;
  },
): Promise<{ updated: number }> {
  return apiClient<{ updated: number }>(
    buildTenantPath(churchId, `/ministries/${ministryId}/roster/collection`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export const ministriesKeys = createQueryKeys("ministries", {
  list: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchMinistries(churchId),
  }),
  detail: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId],
    queryFn: () => fetchMinistry(churchId, ministryId),
  }),
  events: (
    churchId: string,
    ministryId: string,
    params?: { from?: string; to?: string },
  ) => ({
    queryKey: [churchId, ministryId, "events", params ?? null],
    queryFn: () => fetchMinistryEvents(churchId, ministryId, params),
  }),
  members: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId, "members"],
    queryFn: () => fetchMinistryMembers(churchId, ministryId),
  }),
  rosterProfile: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId, "roster-profile"],
    queryFn: () => fetchRosterProfile(churchId, ministryId),
  }),
});

export {
  createMinistry,
  createMinistryEvent,
  createMinistryRole,
  deleteMinistry,
  deleteMinistryRole,
  fetchMinistries,
  fetchMinistry,
  fetchMinistryEvents,
  fetchMinistryMembers,
  fetchRosterProfile,
  closeAvailabilityWindow,
  openAvailabilityWindow,
  setRosterCollection,
  updateEventAvailability,
  updateMinistry,
  updateMinistryRole,
  updateRosterProfile,
};

export type { CreateMinistryEventPayload };
