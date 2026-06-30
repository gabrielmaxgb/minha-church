import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreateMinistryEventPayload,
  Ministry,
  MinistryEvent,
  MinistryMember,
  MinistryRole,
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
}

export interface UpdateMinistryRolePayload {
  name?: string;
  sortOrder?: number;
  canManageEvents?: boolean;
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
): Promise<MinistryEvent[]> {
  return apiClient<MinistryEvent[]>(
    buildTenantPath(churchId, `/ministries/${ministryId}/events`),
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

export const ministriesKeys = createQueryKeys("ministries", {
  list: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchMinistries(churchId),
  }),
  detail: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId],
    queryFn: () => fetchMinistry(churchId, ministryId),
  }),
  events: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId, "events"],
    queryFn: () => fetchMinistryEvents(churchId, ministryId),
  }),
  members: (churchId: string, ministryId: string) => ({
    queryKey: [churchId, ministryId, "members"],
    queryFn: () => fetchMinistryMembers(churchId, ministryId),
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
  updateMinistry,
  updateMinistryRole,
};

export type { CreateMinistryEventPayload };
