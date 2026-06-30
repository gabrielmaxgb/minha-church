"use client";

import { useQuery } from "@tanstack/react-query";

import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { useTenant } from "@/providers/auth-provider";

export function useMinistries() {
  const { churchId } = useTenant();

  return useQuery({
    ...ministriesKeys.list(churchId ?? "unknown"),
    enabled: Boolean(churchId),
  });
}

export function useMinistry(ministryId: string) {
  const { churchId } = useTenant();

  return useQuery({
    ...ministriesKeys.detail(churchId ?? "unknown", ministryId),
    enabled: Boolean(churchId && ministryId),
  });
}

export function useMinistryEvents(ministryId: string | null) {
  const { churchId } = useTenant();

  return useQuery({
    ...ministriesKeys.events(churchId ?? "unknown", ministryId ?? "unknown"),
    enabled: Boolean(churchId && ministryId),
  });
}

export function useMinistryMembers(ministryId: string | null) {
  const { churchId } = useTenant();

  return useQuery({
    ...ministriesKeys.members(churchId ?? "unknown", ministryId ?? "unknown"),
    enabled: Boolean(churchId && ministryId),
  });
}
