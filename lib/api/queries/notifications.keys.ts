import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type { InboxNotificationResponse } from "@/types/notifications";

async function fetchNotificationInbox(
  churchId: string,
): Promise<InboxNotificationResponse> {
  return apiClient<InboxNotificationResponse>(
    buildTenantPath(churchId, "/notifications"),
    { churchId },
  );
}

async function markNotificationRead(
  churchId: string,
  id: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    buildTenantPath(churchId, `/notifications/${id}/read`),
    {
      churchId,
      method: "POST",
    },
  );
}

export const notificationsKeys = createQueryKeys("notifications", {
  inbox: (churchId: string) => ({
    queryKey: [churchId, "inbox"],
    queryFn: () => fetchNotificationInbox(churchId),
  }),
});

export { fetchNotificationInbox, markNotificationRead };
