"use client";

import { useQuery } from "@tanstack/react-query";

import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { useTenant } from "@/providers/auth-provider";

export function useChurchMemberships() {
  const { churchId } = useTenant();

  return useQuery({
    ...membershipsKeys.list(churchId ?? "unknown"),
    enabled: Boolean(churchId),
  });
}
