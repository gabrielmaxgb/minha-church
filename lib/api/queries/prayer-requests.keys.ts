import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreatePrayerRequestPayload,
  PrayerRequest,
  PrayerRequestBoardStatus,
} from "@/types/prayer-requests";

async function fetchPrayerRequests(
  churchId: string,
  status: PrayerRequestBoardStatus = "active",
): Promise<PrayerRequest[]> {
  const query = status === "archived" ? "?status=archived" : "?status=active";
  return apiClient<PrayerRequest[]>(
    `${buildTenantPath(churchId, "/prayer-requests")}${query}`,
    { churchId },
  );
}

async function createPrayerRequest(
  churchId: string,
  payload: CreatePrayerRequestPayload,
): Promise<PrayerRequest> {
  return apiClient<PrayerRequest>(
    buildTenantPath(churchId, "/prayer-requests"),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function deletePrayerRequest(
  churchId: string,
  requestId: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    buildTenantPath(churchId, `/prayer-requests/${requestId}`),
    {
      churchId,
      method: "DELETE",
    },
  );
}

async function archivePrayerRequest(
  churchId: string,
  requestId: string,
): Promise<PrayerRequest> {
  return apiClient<PrayerRequest>(
    buildTenantPath(churchId, `/prayer-requests/${requestId}/archive`),
    {
      churchId,
      method: "POST",
    },
  );
}

async function togglePrayerRequestPray(
  churchId: string,
  requestId: string,
): Promise<PrayerRequest> {
  return apiClient<PrayerRequest>(
    buildTenantPath(churchId, `/prayer-requests/${requestId}/pray`),
    {
      churchId,
      method: "POST",
    },
  );
}

export const prayerRequestsKeys = createQueryKeys("prayerRequests", {
  list: (churchId: string, status: PrayerRequestBoardStatus = "active") => ({
    queryKey: [churchId, "list", status],
    queryFn: () => fetchPrayerRequests(churchId, status),
  }),
});

export {
  archivePrayerRequest,
  createPrayerRequest,
  deletePrayerRequest,
  fetchPrayerRequests,
  togglePrayerRequestPray,
};
