import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  ChurchMembership,
  ChurchMembershipRole,
  PasswordResetRequest,
  PendingAccessUser,
  ResetMemberPasswordResult,
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

async function fetchPasswordResetRequests(
  churchId: string,
): Promise<PasswordResetRequest[]> {
  return apiClient<PasswordResetRequest[]>(
    buildTenantPath(churchId, "/memberships/password-reset-requests"),
    { churchId },
  );
}

async function transferChurchOwnership(
  churchId: string,
  userId: string,
  password: string,
): Promise<ChurchMembership> {
  return apiClient<ChurchMembership>(
    buildTenantPath(churchId, `/memberships/${userId}/transfer-ownership`),
    {
      churchId,
      method: "POST",
      body: JSON.stringify({ password }),
    },
  );
}

async function resetMemberPassword(
  churchId: string,
  userId: string,
): Promise<ResetMemberPasswordResult> {
  return apiClient<ResetMemberPasswordResult>(
    buildTenantPath(churchId, `/memberships/${userId}/reset-password`),
    {
      churchId,
      method: "POST",
    },
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
  passwordResetRequests: (churchId: string) => ({
    queryKey: [churchId, "password-reset-requests"],
    queryFn: () => fetchPasswordResetRequests(churchId),
  }),
});

export {
  fetchAssignableRoles,
  fetchChurchMemberships,
  fetchPasswordResetRequests,
  fetchPendingAccessUsers,
  resetMemberPassword,
  transferChurchOwnership,
  updateChurchMembership,
};
