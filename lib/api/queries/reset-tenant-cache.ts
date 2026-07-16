import type { QueryClient } from "@tanstack/react-query";

import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
import { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
import { eventsKeys } from "@/lib/api/queries/events.keys";
import { membersKeys } from "@/lib/api/queries/members.keys";
import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { paymentsKeys } from "@/lib/api/queries/payments.keys";

const tenantQueryRoots = [
  dashboardKeys._def,
  eventsKeys._def,
  membersKeys._def,
  membershipsKeys._def,
  ministriesKeys._def,
  churchRolesKeys._def,
  auditLogsKeys._def,
  paymentsKeys._def,
] as const;

export function resetTenantQueryCache(queryClient: QueryClient) {
  for (const queryKey of tenantQueryRoots) {
    queryClient.removeQueries({ queryKey });
  }
}

export async function waitForActiveTenantQueries(queryClient: QueryClient) {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  await queryClient.refetchQueries({ type: "active" });
}
