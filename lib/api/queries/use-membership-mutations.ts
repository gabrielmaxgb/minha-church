"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import {
  membershipsKeys,
  transferChurchOwnership,
  updateChurchMembership,
} from "@/lib/api/queries/memberships.keys";
import { queries } from "@/lib/api/queries";
import type { UpdateMembershipPayload } from "@/types/church-memberships";
import { useTenant, useAuth } from "@/providers/auth-provider";

export function useUpdateChurchMembership() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateMembershipPayload;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateChurchMembership(churchId, userId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: membershipsKeys._def });
      await queryClient.invalidateQueries({ queryKey: auditLogsKeys._def });
      await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
    },
  });
}

export function useTransferChurchOwnership() {
  const { churchId } = useTenant();
  const { reloadSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return transferChurchOwnership(churchId, userId);
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: membershipsKeys._def });
      await reloadSession();
      queryClient.removeQueries({ queryKey: membershipsKeys._def });
      await queryClient.invalidateQueries({ queryKey: auditLogsKeys._def });
      await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
    },
  });
}
