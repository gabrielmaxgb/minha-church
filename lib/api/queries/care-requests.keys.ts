import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CareRequest,
  CareRequestRecipient,
  CreateCareRequestPayload,
} from "@/types/care-requests";

async function fetchCareRecipients(
  churchId: string,
): Promise<CareRequestRecipient[]> {
  return apiClient<CareRequestRecipient[]>(
    buildTenantPath(churchId, "/care-requests/recipients"),
    { churchId },
  );
}

async function fetchMyCareRequests(churchId: string): Promise<CareRequest[]> {
  return apiClient<CareRequest[]>(
    buildTenantPath(churchId, "/care-requests/mine"),
    { churchId },
  );
}

async function fetchCareInbox(churchId: string): Promise<CareRequest[]> {
  return apiClient<CareRequest[]>(
    buildTenantPath(churchId, "/care-requests/inbox"),
    { churchId },
  );
}

async function fetchCareInboxPendingCount(
  churchId: string,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>(
    buildTenantPath(churchId, "/care-requests/inbox/pending-count"),
    { churchId },
  );
}

async function fetchCareViewedMineCount(
  churchId: string,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>(
    buildTenantPath(churchId, "/care-requests/mine/viewed-count"),
    { churchId },
  );
}

async function ackCareViewedMine(
  churchId: string,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>(
    buildTenantPath(churchId, "/care-requests/mine/ack-viewed"),
    {
      churchId,
      method: "POST",
    },
  );
}

async function createCareRequest(
  churchId: string,
  payload: CreateCareRequestPayload,
): Promise<CareRequest> {
  return apiClient<CareRequest>(buildTenantPath(churchId, "/care-requests"), {
    churchId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function markCareRequestViewed(
  churchId: string,
  requestId: string,
): Promise<CareRequest> {
  return apiClient<CareRequest>(
    buildTenantPath(churchId, `/care-requests/${requestId}/view`),
    {
      churchId,
      method: "POST",
    },
  );
}

export const careRequestsKeys = createQueryKeys("careRequests", {
  recipients: (churchId: string) => ({
    queryKey: [churchId, "recipients"],
    queryFn: () => fetchCareRecipients(churchId),
  }),
  mine: (churchId: string) => ({
    queryKey: [churchId, "mine"],
    queryFn: () => fetchMyCareRequests(churchId),
  }),
  inbox: (churchId: string) => ({
    queryKey: [churchId, "inbox"],
    queryFn: () => fetchCareInbox(churchId),
  }),
  pendingCount: (churchId: string) => ({
    queryKey: [churchId, "pending-count"],
    queryFn: () => fetchCareInboxPendingCount(churchId),
  }),
  viewedCount: (churchId: string) => ({
    queryKey: [churchId, "viewed-count"],
    queryFn: () => fetchCareViewedMineCount(churchId),
  }),
});

export {
  ackCareViewedMine,
  createCareRequest,
  fetchCareInbox,
  fetchCareInboxPendingCount,
  fetchCareRecipients,
  fetchCareViewedMineCount,
  fetchMyCareRequests,
  markCareRequestViewed,
};
