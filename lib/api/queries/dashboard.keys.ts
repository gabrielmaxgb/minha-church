import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";

import type { ChurchEvent } from "@/types/events";

export interface DashboardSummary {
  memberCount: number;
  activeMembers: number;
  upcomingEvents: number;
  monthlyBalance: number;
  featuredEvents: ChurchEvent[];
}

async function fetchDashboardSummary(
  churchId: string,
): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>(
    buildTenantPath(churchId, "/dashboard/summary"),
    { churchId },
  );
}

export const dashboardKeys = createQueryKeys("dashboard", {
  summary: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchDashboardSummary(churchId),
  }),
});
