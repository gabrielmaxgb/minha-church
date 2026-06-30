"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchAuditLogs } from "@/lib/api/queries/audit-logs.keys";
import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import { useTenant } from "@/providers/auth-provider";

export function useAuditLogs() {
  const { churchId } = useTenant();

  return useInfiniteQuery({
    queryKey: [...auditLogsKeys.list(churchId ?? "", {}).queryKey, "infinite"],
    queryFn: ({ pageParam }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return fetchAuditLogs(churchId, { cursor: pageParam });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(churchId),
  });
}
