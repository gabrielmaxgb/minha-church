"use client";

import { useQuery } from "@tanstack/react-query";

import { queries } from "@/lib/api/queries";
import { useTenant } from "@/providers/auth-provider";

export function useDashboardSummary() {
  const { churchId } = useTenant();

  return useQuery({
    ...queries.dashboard.summary(churchId ?? "unknown"),
    enabled: Boolean(churchId),
  });
}
