"use client";

import { useQuery } from "@tanstack/react-query";

import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { canListMinistries } from "@/lib/permissions";
import { useAuth, useTenant } from "@/providers/auth-provider";

export function useMinistries(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();
  const { permissions } = useAuth();
  const canList = canListMinistries(permissions);
  const extraEnabled = options?.enabled ?? true;

  return useQuery({
    ...ministriesKeys.list(churchId ?? "unknown"),
    enabled: Boolean(churchId) && canList && extraEnabled,
    retry: false,
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

export function useRosterProfile(
  ministryId: string | null,
  enabled = true,
) {
  const { churchId } = useTenant();

  return useQuery({
    ...ministriesKeys.rosterProfile(
      churchId ?? "unknown",
      ministryId ?? "unknown",
    ),
    enabled: Boolean(churchId && ministryId && enabled),
    retry: false,
  });
}

/** @deprecated Use useRosterProfile */
export const useWorshipProfile = useRosterProfile;
