import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  ChurchMembership,
  ChurchMembershipRole,
  PendingAccessUser,
  UpdateMembershipPayload,
} from "@/types/church-memberships";

async function fetchChurchMemberships(
  churchId: string,
): Promise<ChurchMembership[]> {
  return apiClient<ChurchMembership[]>(
    buildTenantPath(churchId, "/memberships"),
    { churchId },
  );
}

async function updateChurchMembership(
  churchId: string,
  userId: string,
  payload: UpdateMembershipPayload,
): Promise<ChurchMembership> {
  return apiClient<ChurchMembership>(
    buildTenantPath(churchId, `/memberships/${userId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function fetchAssignableRoles(
  churchId: string,
): Promise<ChurchMembershipRole[]> {
  return apiClient<ChurchMembershipRole[]>(
    buildTenantPath(churchId, "/memberships/assignable-roles"),
    { churchId },
  );
}

async function fetchPendingAccessUsers(
  churchId: string,
): Promise<PendingAccessUser[]> {
  return apiClient<PendingAccessUser[]>(
    buildTenantPath(churchId, "/memberships/pending-access"),
    { churchId },
  );
}

export const membershipsKeys = createQueryKeys("memberships", {
  list: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchChurchMemberships(churchId),
  }),
  assignableRoles: (churchId: string) => ({
    queryKey: [churchId, "assignable-roles"],
    queryFn: () => fetchAssignableRoles(churchId),
  }),
  pendingAccess: (churchId: string) => ({
    queryKey: [churchId, "pending-access"],
    queryFn: () => fetchPendingAccessUsers(churchId),
  }),
});

export {
  fetchAssignableRoles,
  fetchChurchMemberships,
  fetchPendingAccessUsers,
  updateChurchMembership,
};
