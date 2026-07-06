"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ministriesKeys,
  fetchMinistries,
  fetchMinistry,
  fetchMinistryEvents,
  fetchMinistryMembers,
  fetchRosterProfile,
} from "@/lib/api/queries/ministries.keys";
import { canListMinistries } from "@/lib/permissions";
import { useAuth, useTenant } from "@/providers/auth-provider";
import type {
  Ministry,
  MinistryEvent,
  MinistryMember,
  RosterProfile,
} from "@/types/ministries";

function requireChurchId(churchId: string | null): asserts churchId is string {
  if (!churchId) {
    throw new Error("Igreja não selecionada.");
  }
}

export function useMinistries(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();
  const { permissions } = useAuth();
  const canList = canListMinistries(permissions);
  const extraEnabled = options?.enabled ?? true;
  const tenantId = churchId ?? "unknown";

  return useQuery<Ministry[]>({
    queryKey: ministriesKeys.list(tenantId).queryKey,
    queryFn: () => {
      requireChurchId(churchId);
      return fetchMinistries(churchId);
    },
    enabled: Boolean(churchId) && canList && extraEnabled,
    retry: false,
  });
}

export function useMinistry(ministryId: string) {
  const { churchId } = useTenant();
  const tenantId = churchId ?? "unknown";

  return useQuery<Ministry>({
    queryKey: ministriesKeys.detail(tenantId, ministryId).queryKey,
    queryFn: () => {
      requireChurchId(churchId);
      return fetchMinistry(churchId, ministryId);
    },
    enabled: Boolean(churchId && ministryId),
  });
}

export function useMinistryEvents(
  ministryId: string | null,
  params?: { from?: string; to?: string },
) {
  const { churchId } = useTenant();
  const tenantId = churchId ?? "unknown";
  const resolvedMinistryId = ministryId ?? "unknown";

  return useQuery<MinistryEvent[]>({
    queryKey: ministriesKeys.events(tenantId, resolvedMinistryId, params).queryKey,
    queryFn: () => {
      requireChurchId(churchId);
      if (!ministryId) {
        throw new Error("Ministério não informado.");
      }

      return fetchMinistryEvents(churchId, ministryId, params);
    },
    enabled: Boolean(churchId && ministryId),
  });
}

export function useMinistryMembers(ministryId: string | null) {
  const { churchId } = useTenant();
  const tenantId = churchId ?? "unknown";
  const resolvedMinistryId = ministryId ?? "unknown";

  return useQuery<MinistryMember[]>({
    queryKey: ministriesKeys.members(tenantId, resolvedMinistryId).queryKey,
    queryFn: () => {
      requireChurchId(churchId);
      if (!ministryId) {
        throw new Error("Ministério não informado.");
      }

      return fetchMinistryMembers(churchId, ministryId);
    },
    enabled: Boolean(churchId && ministryId),
  });
}

export function useRosterProfile(
  ministryId: string | null,
  enabled = true,
) {
  const { churchId } = useTenant();
  const tenantId = churchId ?? "unknown";
  const resolvedMinistryId = ministryId ?? "unknown";

  return useQuery<RosterProfile>({
    queryKey: ministriesKeys.rosterProfile(tenantId, resolvedMinistryId).queryKey,
    queryFn: () => {
      requireChurchId(churchId);
      if (!ministryId) {
        throw new Error("Ministério não informado.");
      }

      return fetchRosterProfile(churchId, ministryId);
    },
    enabled: Boolean(churchId && ministryId && enabled),
    retry: false,
  });
}

/** @deprecated Use useRosterProfile */
export const useWorshipProfile = useRosterProfile;
