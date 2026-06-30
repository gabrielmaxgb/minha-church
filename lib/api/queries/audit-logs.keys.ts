import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type { AuditLogPage } from "@/types/audit-logs";

export interface FetchAuditLogsParams {
  cursor?: string;
  limit?: number;
  action?: string;
}

async function fetchAuditLogs(
  churchId: string,
  params: FetchAuditLogsParams = {},
): Promise<AuditLogPage> {
  const search = new URLSearchParams();

  if (params.cursor) {
    search.set("cursor", params.cursor);
  }

  if (params.limit) {
    search.set("limit", String(params.limit));
  }

  if (params.action) {
    search.set("action", params.action);
  }

  const query = search.toString();

  return apiClient<AuditLogPage>(
    `${buildTenantPath(churchId, "/audit-logs")}${query ? `?${query}` : ""}`,
    { churchId },
  );
}

export const auditLogsKeys = createQueryKeys("auditLogs", {
  list: (churchId: string, params: FetchAuditLogsParams = {}) => ({
    queryKey: [churchId, params],
    queryFn: () => fetchAuditLogs(churchId, params),
  }),
});

export { fetchAuditLogs };
