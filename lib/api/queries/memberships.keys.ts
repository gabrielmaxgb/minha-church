import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  ChurchMembership,
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

export const membershipsKeys = createQueryKeys("memberships", {
  list: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchChurchMemberships(churchId),
  }),
});

export { fetchChurchMemberships, updateChurchMembership };
