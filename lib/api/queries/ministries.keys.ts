import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreateMinistryEventPayload,
  Ministry,
  MinistryEvent,
  MinistryMember,
  MinistryRole,
  MinistryServiceFunction,
  RosterProfile,
} from "@/types/ministries";

export interface CreateMinistryPayload {
  name: string;
  description?: string;
}

export interface UpdateMinistryPayload {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateMinistryRolePayload {
  name: string;
  sortOrder?: number;
  canManageEvents?: boolean;
  canManageRoster?: boolean;
  canManageTeam?: boolean;
  canManageRoles?: boolean;
  singleHolder?: boolean;
}

export interface UpdateMinistryRolePayload {
  name?: string;
  sortOrder?: number;
  canManageEvents?: boolean;
  canManageRoster?: boolean;
  canManageTeam?: boolean;
  canManageRoles?: boolean;
  singleHolder?: boolean;
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

async function updateEventRoleProfile(
  churchId: string,
  ministryId: string,
  profileKey: string,
  roleLabels: string[],
): Promise<RosterProfile> {
  return apiClient<RosterProfile>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/roster/event-profiles/${encodeURIComponent(profileKey)}`,
    ),
    {
      churchId,
      method: "PUT",
      body: JSON.stringify({ roleLabels }),
    },
  );
}

async function updateEventAvailability(
  churchId: string,
  ministryId: string,
  eventId: string,
  payload: {
    status: "available" | "unavailable" | "clear";
    roleLabels?: string[];
  },
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/roster/events/${eventId}/availability`,
    ),
    {
      churchId,
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

async function replaceMinistryServiceFunctions(
  churchId: string,
  ministryId: string,
  labels: string[],
): Promise<MinistryServiceFunction[]> {
  return apiClient<MinistryServiceFunction[]>(
    buildTenantPath(churchId, `/ministries/${ministryId}/service-functions`),
    {
      churchId,
      method: "PUT",
      body: JSON.stringify({ labels }),
    },
  );
}

async function updateMemberMinistryInstruments(
  churchId: string,
  ministryId: string,
  memberId: string,
  instruments: string[],
): Promise<MinistryMember> {
  return apiClient<MinistryMember>(
    buildTenantPath(
      churchId,
      `/ministries/${ministryId}/members/${memberId}/instruments`,
    ),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify({ instruments }),
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
    queryKey: [churchId, ministryId, "events", params],
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
  setRosterCollection,
  updateEventAvailability,
  updateEventRoleProfile,
  updateMinistry,
  updateMinistryRole,
  updateRosterProfile,
  replaceMinistryServiceFunctions,
  updateMemberMinistryInstruments,
};

export type { CreateMinistryEventPayload };
