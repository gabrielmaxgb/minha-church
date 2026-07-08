"use client";

import { useQuery } from "@tanstack/react-query";

import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { useAuth, useTenant } from "@/providers/auth-provider";

export function useChurchMemberships() {
  const { churchId } = useTenant();

  return useQuery({
    ...membershipsKeys.list(churchId ?? "unknown"),
    enabled: Boolean(churchId),
  });
}

export function useAssignableRoles() {
  const { churchId } = useTenant();

  return useQuery({
    ...membershipsKeys.assignableRoles(churchId ?? "unknown"),
    enabled: Boolean(churchId),
  });
}

export function usePendingAccessUsers(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();
  const { permissions } = useAuth();
  const canManage = canManageChurchMemberships(permissions);

  return useQuery({
    ...membershipsKeys.pendingAccess(churchId ?? "unknown"),
    enabled: Boolean(churchId) && canManage && (options?.enabled ?? true),
  });
}

export function usePasswordResetRequests(options?: { poll?: boolean }) {
  const { churchId } = useTenant();
  const { permissions } = useAuth();
  const canManage = canManageChurchMemberships(permissions);

  return useQuery({
    ...membershipsKeys.passwordResetRequests(churchId ?? "unknown"),
    enabled: Boolean(churchId) && canManage,
    refetchInterval: options?.poll ? 30_000 : false,
    refetchOnWindowFocus: true,
  });
}
