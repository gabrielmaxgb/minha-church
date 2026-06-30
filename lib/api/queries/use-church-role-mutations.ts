"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import {
  churchRolesKeys,
  createChurchRole,
  deleteChurchRole,
  updateChurchRole,
} from "@/lib/api/queries/church-roles.keys";
import type {
  CreateChurchRolePayload,
  UpdateChurchRolePayload,
} from "@/types/church-roles";
import { useTenant } from "@/providers/auth-provider";

export function useCreateChurchRole() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChurchRolePayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createChurchRole(churchId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: churchRolesKeys._def });
      await queryClient.invalidateQueries({ queryKey: auditLogsKeys._def });
    },
  });
}

export function useUpdateChurchRole() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateChurchRolePayload;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateChurchRole(churchId, roleId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: churchRolesKeys._def });
      await queryClient.invalidateQueries({ queryKey: auditLogsKeys._def });
    },
  });
}

export function useDeleteChurchRole() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteChurchRole(churchId, roleId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: churchRolesKeys._def });
      await queryClient.invalidateQueries({ queryKey: auditLogsKeys._def });
    },
  });
}
