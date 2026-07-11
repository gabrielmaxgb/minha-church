import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type { MySchedules } from "@/types/ministries";

async function fetchMySchedules(churchId: string): Promise<MySchedules> {
  return apiClient<MySchedules>(
    buildTenantPath(churchId, "/roster/my-schedules"),
    { churchId },
  );
}

export const rosterKeys = createQueryKeys("roster", {
  mySchedules: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchMySchedules(churchId),
  }),
});

export { fetchMySchedules };

/** @deprecated Use rosterKeys */
export const worshipKeys = rosterKeys;

/** @deprecated Use fetchMySchedules */
export const fetchMyWorshipSchedule = fetchMySchedules;
